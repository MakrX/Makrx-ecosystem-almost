from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta

from models.inventory import (
    InventoryItem, InventoryUsageLog, InventoryAlert, BulkImportJob,
    ItemStatus, SupplierType, AccessLevel, UsageAction
)
from schemas.inventory import (
    InventoryItemCreate, InventoryItemUpdate, InventoryFilter,
    InventoryUsageLogCreate, BulkUpdateRequest, BulkIssueRequest
)

class InventoryCRUD:
    def __init__(self, db: Session):
        self.db = db

    # Basic CRUD operations
    def create_item(self, item: InventoryItemCreate) -> InventoryItem:
        """Create a new inventory item"""
        db_item = InventoryItem(
            id=str(uuid.uuid4()),
            **item.dict()
        )
        self.db.add(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        
        # Create initial usage log
        self._create_usage_log(
            item_id=db_item.id,
            user_id=item.created_by,
            user_name="System",  # You'd get this from user service
            action=UsageAction.ADD,
            quantity_before=0,
            quantity_after=item.quantity,
            reason="Initial inventory entry"
        )
        
        return db_item

    def get_item(self, item_id: str, makerspace_id: Optional[str] = None) -> Optional[InventoryItem]:
        """Get a single inventory item by ID"""
        query = self.db.query(InventoryItem).filter(InventoryItem.id == item_id)
        if makerspace_id:
            query = query.filter(InventoryItem.linked_makerspace_id == makerspace_id)
        return query.first()

    def get_items(self, filters: InventoryFilter) -> tuple[List[InventoryItem], int]:
        """Get inventory items with filtering, pagination, and sorting"""
        query = self.db.query(InventoryItem)
        
        # Apply filters
        if filters.category:
            query = query.filter(InventoryItem.category == filters.category)
        
        if filters.status:
            query = query.filter(InventoryItem.status == filters.status)
        
        if filters.supplier_type:
            query = query.filter(InventoryItem.supplier_type == filters.supplier_type)
        
        if filters.location:
            query = query.filter(InventoryItem.location.ilike(f"%{filters.location}%"))
        
        if filters.makerspace_id:
            query = query.filter(InventoryItem.linked_makerspace_id == filters.makerspace_id)
        
        if filters.owner_user_id:
            query = query.filter(InventoryItem.owner_user_id == filters.owner_user_id)
        
        if filters.low_stock_only:
            query = query.filter(InventoryItem.quantity <= InventoryItem.min_threshold)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    InventoryItem.name.ilike(search_term),
                    InventoryItem.description.ilike(search_term),
                    InventoryItem.product_code.ilike(search_term),
                    InventoryItem.supplier.ilike(search_term)
                )
            )
        
        # Get total count before pagination
        total = query.count()
        
        # Apply sorting
        if filters.sort_order == "desc":
            order_func = desc
        else:
            order_func = asc
            
        if hasattr(InventoryItem, filters.sort_by):
            query = query.order_by(order_func(getattr(InventoryItem, filters.sort_by)))
        else:
            query = query.order_by(desc(InventoryItem.updated_at))
        
        # Apply pagination
        query = query.offset(filters.skip).limit(filters.limit)
        
        items = query.all()
        return items, total

    def update_item(self, item_id: str, updates: InventoryItemUpdate, makerspace_id: Optional[str] = None) -> Optional[InventoryItem]:
        """Update an inventory item"""
        query = self.db.query(InventoryItem).filter(InventoryItem.id == item_id)
        if makerspace_id:
            query = query.filter(InventoryItem.linked_makerspace_id == makerspace_id)
        
        db_item = query.first()
        if not db_item:
            return None
        
        # Store original quantity for logging
        original_quantity = db_item.quantity
        
        # Update fields
        update_data = updates.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field != "updated_by":
                setattr(db_item, field, value)
        
        db_item.updated_at = datetime.utcnow()
        db_item.updated_by = updates.updated_by
        
        self.db.commit()
        self.db.refresh(db_item)
        
        # Log quantity changes
        if "quantity" in update_data and original_quantity != db_item.quantity:
            self._create_usage_log(
                item_id=db_item.id,
                user_id=updates.updated_by,
                user_name="System",  # You'd get this from user service
                action=UsageAction.ADJUST,
                quantity_before=original_quantity,
                quantity_after=db_item.quantity,
                reason="Manual quantity adjustment"
            )
        
        return db_item

    def delete_item(self, item_id: str, deleted_by: str, makerspace_id: Optional[str] = None) -> bool:
        """Delete an inventory item"""
        query = self.db.query(InventoryItem).filter(InventoryItem.id == item_id)
        if makerspace_id:
            query = query.filter(InventoryItem.linked_makerspace_id == makerspace_id)
        
        db_item = query.first()
        if not db_item:
            return False
        
        # Log deletion
        self._create_usage_log(
            item_id=db_item.id,
            user_id=deleted_by,
            user_name="System",
            action=UsageAction.ADJUST,
            quantity_before=db_item.quantity,
            quantity_after=0,
            reason="Item deleted"
        )
        
        self.db.delete(db_item)
        self.db.commit()
        return True

    # Issue/Restock operations
    def issue_item(self, item_id: str, quantity: float, user_id: str, user_name: str, 
                   reason: Optional[str] = None, project_id: Optional[str] = None, 
                   job_id: Optional[str] = None) -> Optional[InventoryItem]:
        """Issue items from inventory"""
        db_item = self.get_item(item_id)
        if not db_item or db_item.quantity < quantity:
            return None
        
        original_quantity = db_item.quantity
        db_item.quantity -= quantity
        db_item.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(db_item)
        
        # Create usage log
        self._create_usage_log(
            item_id=item_id,
            user_id=user_id,
            user_name=user_name,
            action=UsageAction.ISSUE,
            quantity_before=original_quantity,
            quantity_after=db_item.quantity,
            reason=reason,
            project_id=project_id,
            job_id=job_id
        )
        
        # Check for low stock alert
        self._check_low_stock_alert(db_item)
        
        return db_item

    def restock_item(self, item_id: str, quantity: float, user_id: str, user_name: str, 
                     reason: Optional[str] = None) -> Optional[InventoryItem]:
        """Restock items in inventory"""
        db_item = self.get_item(item_id)
        if not db_item:
            return None
        
        original_quantity = db_item.quantity
        db_item.quantity += quantity
        db_item.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(db_item)
        
        # Create usage log
        self._create_usage_log(
            item_id=item_id,
            user_id=user_id,
            user_name=user_name,
            action=UsageAction.RESTOCK,
            quantity_before=original_quantity,
            quantity_after=db_item.quantity,
            reason=reason
        )
        
        return db_item

    # Bulk operations
    def bulk_update(self, request: BulkUpdateRequest) -> List[InventoryItem]:
        """Update multiple items at once"""
        items = self.db.query(InventoryItem).filter(
            InventoryItem.id.in_(request.item_ids)
        ).all()
        
        updated_items = []
        for item in items:
            for field, value in request.updates.items():
                if hasattr(item, field) and field not in ['id', 'created_at', 'created_by']:
                    setattr(item, field, value)
            
            item.updated_at = datetime.utcnow()
            item.updated_by = request.updated_by
            updated_items.append(item)
        
        self.db.commit()
        return updated_items

    def bulk_issue(self, request: BulkIssueRequest) -> List[Dict[str, Any]]:
        """Issue multiple items at once"""
        results = []
        
        for item_data in request.items:
            item_id = item_data["item_id"]
            quantity = item_data["quantity"]
            item_reason = item_data.get("reason", request.reason)
            
            result = self.issue_item(
                item_id=item_id,
                quantity=quantity,
                user_id=request.user_id,
                user_name=request.user_name,
                reason=item_reason,
                project_id=request.linked_project_id,
                job_id=request.linked_job_id
            )
            
            results.append({
                "item_id": item_id,
                "success": result is not None,
                "new_quantity": result.quantity if result else None,
                "error": None if result else "Insufficient stock or item not found"
            })
        
        return results

    # Analytics and reporting
    def get_inventory_stats(self, makerspace_id: Optional[str] = None) -> Dict[str, Any]:
        """Get inventory statistics"""
        query = self.db.query(InventoryItem)
        if makerspace_id:
            query = query.filter(InventoryItem.linked_makerspace_id == makerspace_id)
        
        total_items = query.count()
        low_stock_items = query.filter(InventoryItem.quantity <= InventoryItem.min_threshold).count()
        out_of_stock_items = query.filter(InventoryItem.quantity == 0).count()
        makrx_items = query.filter(InventoryItem.supplier_type == SupplierType.MAKRX).count()
        external_items = query.filter(InventoryItem.supplier_type == SupplierType.EXTERNAL).count()
        
        # Calculate total value
        total_value = self.db.query(func.sum(InventoryItem.quantity * InventoryItem.price)).filter(
            InventoryItem.price.isnot(None)
        )
        if makerspace_id:
            total_value = total_value.filter(InventoryItem.linked_makerspace_id == makerspace_id)
        total_value = total_value.scalar() or 0
        
        # Category breakdown
        category_stats = self.db.query(
            InventoryItem.category, func.count(InventoryItem.id)
        ).group_by(InventoryItem.category)
        if makerspace_id:
            category_stats = category_stats.filter(InventoryItem.linked_makerspace_id == makerspace_id)
        categories = dict(category_stats.all())
        
        # Location breakdown
        location_stats = self.db.query(
            InventoryItem.location, func.count(InventoryItem.id)
        ).group_by(InventoryItem.location)
        if makerspace_id:
            location_stats = location_stats.filter(InventoryItem.linked_makerspace_id == makerspace_id)
        locations = dict(location_stats.all())
        
        return {
            "total_items": total_items,
            "low_stock_items": low_stock_items,
            "out_of_stock_items": out_of_stock_items,
            "makrx_items": makrx_items,
            "external_items": external_items,
            "total_value": float(total_value),
            "categories": categories,
            "locations": locations
        }

    def get_low_stock_alerts(self, makerspace_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get low stock alerts"""
        query = self.db.query(InventoryItem).filter(
            InventoryItem.quantity <= InventoryItem.min_threshold,
            InventoryItem.status == ItemStatus.ACTIVE
        )
        
        if makerspace_id:
            query = query.filter(InventoryItem.linked_makerspace_id == makerspace_id)
        
        low_stock_items = query.all()
        
        alerts = []
        for item in low_stock_items:
            can_reorder = (item.supplier_type == SupplierType.MAKRX and 
                          item.product_code is not None)
            
            suggested_quantity = None
            if can_reorder:
                # Calculate suggested quantity based on usage patterns
                suggested_quantity = max(item.min_threshold * 2, 10)
            
            alerts.append({
                "id": str(uuid.uuid4()),
                "item_id": item.id,
                "item_name": item.name,
                "current_quantity": item.quantity,
                "min_threshold": item.min_threshold,
                "location": item.location,
                "category": item.category,
                "supplier_type": item.supplier_type,
                "product_code": item.product_code,
                "can_reorder": can_reorder,
                "suggested_quantity": suggested_quantity
            })
        
        return alerts

    def get_usage_report(self, item_id: str, days: int = 30) -> Dict[str, Any]:
        """Get usage report for an item"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        logs = self.db.query(InventoryUsageLog).filter(
            InventoryUsageLog.inventory_item_id == item_id,
            InventoryUsageLog.timestamp >= start_date
        ).all()
        
        item = self.get_item(item_id)
        if not item:
            return {}
        
        total_issued = sum(
            log.quantity_before - log.quantity_after 
            for log in logs if log.action == UsageAction.ISSUE
        )
        
        total_restocked = sum(
            log.quantity_after - log.quantity_before 
            for log in logs if log.action == UsageAction.RESTOCK
        )
        
        usage_frequency = len([log for log in logs if log.action == UsageAction.ISSUE])
        
        last_used = None
        issue_logs = [log for log in logs if log.action == UsageAction.ISSUE]
        if issue_logs:
            last_used = max(log.timestamp for log in issue_logs)
        
        # Most common reason
        reasons = [log.reason for log in logs if log.reason and log.action == UsageAction.ISSUE]
        most_common_reason = None
        if reasons:
            most_common_reason = max(set(reasons), key=reasons.count)
        
        return {
            "item_id": item_id,
            "item_name": item.name,
            "total_issued": total_issued,
            "total_restocked": total_restocked,
            "current_quantity": item.quantity,
            "usage_frequency": usage_frequency,
            "last_used": last_used,
            "most_common_reason": most_common_reason
        }

    # CSV Import
    def create_bulk_import_job(self, filename: str, total_rows: int, created_by: str, 
                              makerspace_id: str) -> BulkImportJob:
        """Create a bulk import job"""
        job = BulkImportJob(
            id=str(uuid.uuid4()),
            filename=filename,
            total_rows=total_rows,
            created_by=created_by,
            makerspace_id=makerspace_id
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def update_import_job_progress(self, job_id: str, processed: int, successful: int, 
                                  failed: int, errors: Optional[List[Dict]] = None):
        """Update import job progress"""
        job = self.db.query(BulkImportJob).filter(BulkImportJob.id == job_id).first()
        if job:
            job.processed_rows = processed
            job.successful_rows = successful
            job.failed_rows = failed
            if errors:
                job.error_log = errors
            
            if processed >= job.total_rows:
                job.status = "completed" if failed == 0 else "completed_with_errors"
            
            self.db.commit()

    # Private helper methods
    def _create_usage_log(self, item_id: str, user_id: str, user_name: str, 
                         action: UsageAction, quantity_before: float, quantity_after: float,
                         reason: Optional[str] = None, project_id: Optional[str] = None,
                         job_id: Optional[str] = None):
        """Create a usage log entry"""
        log = InventoryUsageLog(
            id=str(uuid.uuid4()),
            inventory_item_id=item_id,
            user_id=user_id,
            user_name=user_name,
            action=action,
            quantity_before=quantity_before,
            quantity_after=quantity_after,
            reason=reason,
            linked_project_id=project_id,
            linked_job_id=job_id
        )
        self.db.add(log)
        self.db.commit()

    def _check_low_stock_alert(self, item: InventoryItem):
        """Check if item needs a low stock alert"""
        if item.quantity <= item.min_threshold:
            # Check if alert already exists
            existing_alert = self.db.query(InventoryAlert).filter(
                InventoryAlert.inventory_item_id == item.id,
                InventoryAlert.alert_type == "low_stock",
                InventoryAlert.is_resolved == False
            ).first()
            
            if not existing_alert:
                alert = InventoryAlert(
                    id=str(uuid.uuid4()),
                    inventory_item_id=item.id,
                    alert_type="low_stock",
                    threshold_value=item.min_threshold,
                    current_value=item.quantity,
                    message=f"{item.name} is running low (Qty: {item.quantity}, Min: {item.min_threshold})"
                )
                self.db.add(alert)
                self.db.commit()
