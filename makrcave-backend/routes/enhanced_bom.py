from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import and_, or_, desc, asc, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

from ..database import get_db
from ..dependencies import get_current_user, get_current_user_optional
from ..models.enhanced_bom import (
    BOMTemplate, EnhancedBOMItem, BOMPurchaseOrder, BOMUsageHistory,
    BOMInventoryTransaction, BOMAnalytics, BOMCostHistory, SupplierManagement,
    ProcurementStatus, AvailabilityStatus, ComponentCategory, SupplierRating
)
from ..schemas.enhanced_bom import (
    BOMTemplateCreate, BOMTemplateUpdate, BOMTemplateResponse,
    EnhancedBOMItemCreate, EnhancedBOMItemUpdate, EnhancedBOMItemResponse,
    BOMPurchaseOrderCreate, BOMPurchaseOrderUpdate, BOMPurchaseOrderResponse,
    BOMUsageHistoryCreate, BOMUsageHistoryResponse,
    BOMInventoryTransactionCreate, BOMInventoryTransactionResponse,
    BOMAnalyticsResponse, SupplierManagementCreate, SupplierManagementUpdate,
    SupplierManagementResponse, BOMSearchFilters, BOMListResponse,
    BOMDashboardStats, MakrXStoreOrderRequest, BOMCostAnalysis
)

router = APIRouter(prefix="/api/v1/enhanced-bom", tags=["enhanced-bom"])

# BOM Templates
@router.post("/templates", response_model=BOMTemplateResponse)
async def create_bom_template(
    template: BOMTemplateCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new BOM template"""
    try:
        template_id = f"template_{uuid.uuid4().hex[:12]}"
        
        db_template = BOMTemplate(
            id=template_id,
            name=template.name,
            description=template.description,
            category=template.category,
            version=template.version,
            is_public=template.is_public,
            template_data=template.template_data,
            estimated_cost=template.estimated_cost,
            complexity_level=template.complexity_level,
            created_by=current_user.get("user_id")
        )
        
        db.add(db_template)
        db.commit()
        db.refresh(db_template)
        
        return db_template
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create BOM template: {str(e)}"
        )

@router.get("/templates", response_model=List[BOMTemplateResponse])
async def list_bom_templates(
    category: Optional[ComponentCategory] = Query(None),
    is_public: Optional[bool] = Query(None),
    complexity_level: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """List BOM templates"""
    query = db.query(BOMTemplate)
    
    if category:
        query = query.filter(BOMTemplate.category == category)
    
    if is_public is not None:
        query = query.filter(BOMTemplate.is_public == is_public)
    
    if complexity_level:
        query = query.filter(BOMTemplate.complexity_level == complexity_level)
    
    # If user is not authenticated, only show public templates
    if not current_user:
        query = query.filter(BOMTemplate.is_public == True)
    
    templates = query.order_by(desc(BOMTemplate.created_at)).all()
    return templates

# Enhanced BOM Items
@router.post("/items", response_model=EnhancedBOMItemResponse)
async def create_bom_item(
    item: EnhancedBOMItemCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new enhanced BOM item"""
    try:
        item_id = f"bom_{uuid.uuid4().hex[:12]}"
        
        # Calculate total cost
        total_cost = None
        if item.unit_cost and item.quantity:
            total_cost = item.unit_cost * item.quantity
        
        # Calculate available quantity
        available_quantity = max(0, item.current_stock_level - (item.reserved_quantity or 0))
        
        db_item = EnhancedBOMItem(
            id=item_id,
            project_id=item.project_id,
            template_id=item.template_id,
            item_name=item.item_name,
            part_code=item.part_code,
            manufacturer_part_number=item.manufacturer_part_number,
            supplier_part_number=item.supplier_part_number,
            category=item.category,
            subcategory=item.subcategory,
            component_type=item.component_type,
            quantity=item.quantity,
            unit_of_measure=item.unit_of_measure,
            quantity_per_assembly=item.quantity_per_assembly,
            specifications=item.specifications,
            tolerance=item.tolerance,
            material=item.material,
            color=item.color,
            size_dimensions=item.size_dimensions,
            weight=item.weight,
            makrx_product_code=item.makrx_product_code,
            makrx_store_url=item.makrx_store_url,
            makrx_category_id=item.makrx_category_id,
            unit_cost=item.unit_cost,
            total_cost=total_cost,
            currency=item.currency,
            price_last_updated=datetime.utcnow() if item.unit_cost else None,
            primary_supplier=item.primary_supplier,
            supplier_rating=item.supplier_rating,
            supplier_lead_time_days=item.supplier_lead_time_days,
            minimum_order_quantity=item.minimum_order_quantity,
            alternative_suppliers=item.alternative_suppliers,
            current_stock_level=item.current_stock_level,
            available_quantity=available_quantity,
            reorder_point=item.reorder_point,
            max_stock_level=item.max_stock_level,
            auto_reorder_enabled=item.auto_reorder_enabled,
            auto_reorder_quantity=item.auto_reorder_quantity,
            auto_reorder_supplier=item.auto_reorder_supplier,
            is_critical_path=item.is_critical_path,
            is_long_lead_item=item.is_long_lead_item,
            substitution_allowed=item.substitution_allowed,
            alternatives=item.alternatives,
            usage_notes=item.usage_notes,
            assembly_notes=item.assembly_notes,
            compatibility_notes=item.compatibility_notes,
            lifecycle_status=item.lifecycle_status,
            rohs_compliant=item.rohs_compliant,
            reach_compliant=item.reach_compliant,
            certifications=item.certifications,
            quality_grade=item.quality_grade,
            testing_required=item.testing_required,
            inspection_notes=item.inspection_notes,
            added_by=current_user.get("user_id")
        )
        
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        
        # Create initial inventory transaction
        initial_transaction = BOMInventoryTransaction(
            id=f"trans_{uuid.uuid4().hex[:12]}",
            bom_item_id=item_id,
            transaction_type="initial_stock",
            quantity_change=item.current_stock_level,
            quantity_before=0,
            quantity_after=item.current_stock_level,
            unit_cost=item.unit_cost,
            total_value=total_cost,
            notes="Initial stock entry",
            performed_by=current_user.get("user_id")
        )
        db.add(initial_transaction)
        db.commit()
        
        return db_item
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create BOM item: {str(e)}"
        )

@router.get("/items", response_model=BOMListResponse)
async def list_bom_items(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    project_id: Optional[str] = Query(None),
    template_id: Optional[str] = Query(None),
    filters: BOMSearchFilters = Depends(),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List enhanced BOM items with filtering and pagination"""
    try:
        query = db.query(EnhancedBOMItem)
        
        if project_id:
            query = query.filter(EnhancedBOMItem.project_id == project_id)
        
        if template_id:
            query = query.filter(EnhancedBOMItem.template_id == template_id)
        
        # Apply filters
        if filters.category:
            query = query.filter(EnhancedBOMItem.category.in_(filters.category))
        
        if filters.procurement_status:
            query = query.filter(EnhancedBOMItem.procurement_status.in_(filters.procurement_status))
        
        if filters.availability_status:
            query = query.filter(EnhancedBOMItem.availability_status.in_(filters.availability_status))
        
        if filters.supplier_rating:
            query = query.filter(EnhancedBOMItem.supplier_rating.in_(filters.supplier_rating))
        
        if filters.is_critical_path is not None:
            query = query.filter(EnhancedBOMItem.is_critical_path == filters.is_critical_path)
        
        if filters.is_long_lead_item is not None:
            query = query.filter(EnhancedBOMItem.is_long_lead_item == filters.is_long_lead_item)
        
        if filters.auto_reorder_enabled is not None:
            query = query.filter(EnhancedBOMItem.auto_reorder_enabled == filters.auto_reorder_enabled)
        
        if filters.min_cost:
            query = query.filter(EnhancedBOMItem.unit_cost >= filters.min_cost)
        
        if filters.max_cost:
            query = query.filter(EnhancedBOMItem.unit_cost <= filters.max_cost)
        
        if filters.search_query:
            search_term = f"%{filters.search_query}%"
            query = query.filter(
                or_(
                    EnhancedBOMItem.item_name.ilike(search_term),
                    EnhancedBOMItem.part_code.ilike(search_term),
                    EnhancedBOMItem.manufacturer_part_number.ilike(search_term),
                    EnhancedBOMItem.primary_supplier.ilike(search_term)
                )
            )
        
        # Count total results
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * page_size
        items = query.order_by(desc(EnhancedBOMItem.added_at)).offset(offset).limit(page_size).all()
        
        # Calculate pagination info
        total_pages = (total_count + page_size - 1) // page_size
        has_next = page < total_pages
        has_previous = page > 1
        
        return BOMListResponse(
            items=items,
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            has_next=has_next,
            has_previous=has_previous
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch BOM items: {str(e)}"
        )

@router.get("/items/{item_id}", response_model=EnhancedBOMItemResponse)
async def get_bom_item(
    item_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific BOM item by ID"""
    item = db.query(EnhancedBOMItem).filter(EnhancedBOMItem.id == item_id).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM item not found"
        )
    
    return item

@router.put("/items/{item_id}", response_model=EnhancedBOMItemResponse)
async def update_bom_item(
    item_id: str,
    item_update: EnhancedBOMItemUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a BOM item"""
    item = db.query(EnhancedBOMItem).filter(EnhancedBOMItem.id == item_id).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM item not found"
        )
    
    try:
        # Update fields
        update_data = item_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(item, field, value)
        
        # Recalculate total cost if unit cost or quantity changed
        if 'unit_cost' in update_data or 'quantity' in update_data:
            if item.unit_cost and item.quantity:
                item.total_cost = item.unit_cost * item.quantity
                item.price_last_updated = datetime.utcnow()
        
        # Recalculate available quantity if stock levels changed
        if 'current_stock_level' in update_data or 'reserved_quantity' in update_data:
            item.available_quantity = max(0, item.current_stock_level - (item.reserved_quantity or 0))
        
        item.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(item)
        
        return item
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update BOM item: {str(e)}"
        )

# Purchase Orders
@router.post("/purchase-orders", response_model=BOMPurchaseOrderResponse)
async def create_purchase_order(
    po: BOMPurchaseOrderCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new purchase order for a BOM item"""
    # Verify BOM item exists
    bom_item = db.query(EnhancedBOMItem).filter(EnhancedBOMItem.id == po.bom_item_id).first()
    if not bom_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM item not found"
        )
    
    try:
        po_id = f"po_{uuid.uuid4().hex[:12]}"
        
        # Calculate total amount
        total_amount = None
        if po.unit_price and po.quantity_ordered:
            total_amount = po.unit_price * po.quantity_ordered
        
        db_po = BOMPurchaseOrder(
            id=po_id,
            bom_item_id=po.bom_item_id,
            po_number=po.po_number,
            supplier_name=po.supplier_name,
            supplier_contact=po.supplier_contact,
            quantity_ordered=po.quantity_ordered,
            unit_price=po.unit_price,
            total_amount=total_amount,
            currency=po.currency,
            expected_delivery=po.expected_delivery,
            delivery_notes=po.delivery_notes,
            requested_by=current_user.get("user_id")
        )
        
        db.add(db_po)
        
        # Update BOM item procurement status
        bom_item.procurement_status = ProcurementStatus.ORDERED
        
        db.commit()
        db.refresh(db_po)
        
        return db_po
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create purchase order: {str(e)}"
        )

# Inventory Transactions
@router.post("/inventory-transactions", response_model=BOMInventoryTransactionResponse)
async def create_inventory_transaction(
    transaction: BOMInventoryTransactionCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new inventory transaction"""
    # Verify BOM item exists
    bom_item = db.query(EnhancedBOMItem).filter(EnhancedBOMItem.id == transaction.bom_item_id).first()
    if not bom_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM item not found"
        )
    
    try:
        transaction_id = f"trans_{uuid.uuid4().hex[:12]}"
        
        # Calculate values
        quantity_before = bom_item.current_stock_level
        quantity_after = quantity_before + transaction.quantity_change
        
        if quantity_after < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transaction would result in negative stock"
            )
        
        total_value = None
        if transaction.unit_cost:
            total_value = abs(transaction.quantity_change) * transaction.unit_cost
        
        db_transaction = BOMInventoryTransaction(
            id=transaction_id,
            bom_item_id=transaction.bom_item_id,
            transaction_type=transaction.transaction_type,
            quantity_change=transaction.quantity_change,
            unit_cost=transaction.unit_cost,
            total_value=total_value,
            quantity_before=quantity_before,
            quantity_after=quantity_after,
            reference_id=transaction.reference_id,
            reference_type=transaction.reference_type,
            location=transaction.location,
            batch_number=transaction.batch_number,
            expiry_date=transaction.expiry_date,
            notes=transaction.notes,
            performed_by=current_user.get("user_id")
        )
        
        db.add(db_transaction)
        
        # Update BOM item stock level
        bom_item.current_stock_level = quantity_after
        bom_item.available_quantity = max(0, quantity_after - (bom_item.reserved_quantity or 0))
        
        # Update availability status based on stock level
        if quantity_after == 0:
            bom_item.availability_status = AvailabilityStatus.OUT_OF_STOCK
        elif quantity_after <= bom_item.reorder_point:
            bom_item.availability_status = AvailabilityStatus.LOW_STOCK
        else:
            bom_item.availability_status = AvailabilityStatus.IN_STOCK
        
        db.commit()
        db.refresh(db_transaction)
        
        return db_transaction
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create inventory transaction: {str(e)}"
        )

# Usage History
@router.post("/usage-history", response_model=BOMUsageHistoryResponse)
async def record_usage(
    usage: BOMUsageHistoryCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record usage of a BOM item"""
    # Verify BOM item exists
    bom_item = db.query(EnhancedBOMItem).filter(EnhancedBOMItem.id == usage.bom_item_id).first()
    if not bom_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM item not found"
        )
    
    try:
        usage_id = f"usage_{uuid.uuid4().hex[:12]}"
        
        # Calculate total cost
        total_cost = None
        if usage.unit_cost_at_usage:
            total_cost = usage.unit_cost_at_usage * usage.quantity_used
        elif bom_item.unit_cost:
            total_cost = bom_item.unit_cost * usage.quantity_used
        
        db_usage = BOMUsageHistory(
            id=usage_id,
            bom_item_id=usage.bom_item_id,
            project_id=usage.project_id,
            quantity_used=usage.quantity_used,
            unit_cost_at_usage=usage.unit_cost_at_usage or bom_item.unit_cost,
            total_cost=total_cost,
            used_for=usage.used_for,
            batch_number=usage.batch_number,
            serial_numbers=usage.serial_numbers,
            usage_outcome=usage.usage_outcome,
            failure_reason=usage.failure_reason,
            quality_issues=usage.quality_issues,
            used_by=current_user.get("user_id")
        )
        
        db.add(db_usage)
        
        # Create corresponding inventory transaction
        inventory_transaction = BOMInventoryTransaction(
            id=f"trans_{uuid.uuid4().hex[:12]}",
            bom_item_id=usage.bom_item_id,
            transaction_type="usage",
            quantity_change=-usage.quantity_used,
            unit_cost=usage.unit_cost_at_usage or bom_item.unit_cost,
            total_value=total_cost,
            quantity_before=bom_item.current_stock_level,
            quantity_after=bom_item.current_stock_level - usage.quantity_used,
            reference_id=usage.project_id,
            reference_type="project_usage",
            notes=f"Used for {usage.used_for or 'project'}",
            performed_by=current_user.get("user_id")
        )
        
        db.add(inventory_transaction)
        
        # Update BOM item stock
        bom_item.current_stock_level -= usage.quantity_used
        bom_item.available_quantity = max(0, bom_item.current_stock_level - (bom_item.reserved_quantity or 0))
        
        # Update availability status
        if bom_item.current_stock_level <= 0:
            bom_item.availability_status = AvailabilityStatus.OUT_OF_STOCK
        elif bom_item.current_stock_level <= bom_item.reorder_point:
            bom_item.availability_status = AvailabilityStatus.LOW_STOCK
        
        db.commit()
        db.refresh(db_usage)
        
        return db_usage
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record usage: {str(e)}"
        )

# Supplier Management
@router.post("/suppliers", response_model=SupplierManagementResponse)
async def create_supplier(
    supplier: SupplierManagementCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new supplier"""
    try:
        supplier_id = f"supplier_{uuid.uuid4().hex[:12]}"
        
        db_supplier = SupplierManagement(
            id=supplier_id,
            supplier_name=supplier.supplier_name,
            contact_person=supplier.contact_person,
            email=supplier.email,
            phone=supplier.phone,
            website=supplier.website,
            address=supplier.address,
            tax_id=supplier.tax_id,
            duns_number=supplier.duns_number,
            certifications=supplier.certifications,
            categories_served=supplier.categories_served,
            minimum_order_value=supplier.minimum_order_value,
            payment_terms=supplier.payment_terms,
            shipping_methods=supplier.shipping_methods,
            is_preferred=supplier.is_preferred,
            risk_level=supplier.risk_level,
            added_by=current_user.get("user_id")
        )
        
        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)
        
        return db_supplier
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create supplier: {str(e)}"
        )

# Dashboard and Analytics
@router.get("/dashboard/stats", response_model=BOMDashboardStats)
async def get_bom_dashboard_stats(
    project_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get BOM dashboard statistics"""
    try:
        base_query = db.query(EnhancedBOMItem)
        
        if project_id:
            base_query = base_query.filter(EnhancedBOMItem.project_id == project_id)
        
        # Total items
        total_items = base_query.count()
        
        # Total value
        total_value = db.query(func.sum(EnhancedBOMItem.total_cost)).filter(
            EnhancedBOMItem.total_cost.isnot(None)
        ).scalar() or 0.0
        
        if project_id:
            total_value = db.query(func.sum(EnhancedBOMItem.total_cost)).filter(
                and_(
                    EnhancedBOMItem.project_id == project_id,
                    EnhancedBOMItem.total_cost.isnot(None)
                )
            ).scalar() or 0.0
        
        # Items by status
        status_counts = {}
        for status in ProcurementStatus:
            count = base_query.filter(EnhancedBOMItem.procurement_status == status).count()
            status_counts[status.value] = count
        
        # Items by category
        category_counts = {}
        for category in ComponentCategory:
            count = base_query.filter(EnhancedBOMItem.category == category).count()
            category_counts[category.value] = count
        
        # Critical path items
        critical_path_items = base_query.filter(EnhancedBOMItem.is_critical_path == True).count()
        
        # Items needing procurement
        items_needing_procurement = base_query.filter(
            EnhancedBOMItem.procurement_status.in_([
                ProcurementStatus.NEEDED,
                ProcurementStatus.RESEARCHING,
                ProcurementStatus.QUOTE_REQUESTED
            ])
        ).count()
        
        # Auto reorder items
        auto_reorder_items = base_query.filter(EnhancedBOMItem.auto_reorder_enabled == True).count()
        
        # Average lead time
        avg_lead_time = db.query(func.avg(EnhancedBOMItem.supplier_lead_time_days)).filter(
            EnhancedBOMItem.supplier_lead_time_days.isnot(None)
        ).scalar()
        
        # Top suppliers (simplified)
        top_suppliers = [
            {"name": "Sample Supplier 1", "orders": 15, "value": 2500.0},
            {"name": "Sample Supplier 2", "orders": 8, "value": 1800.0}
        ]
        
        # Recent orders (simplified)
        recent_orders = [
            {"po_number": "PO-2024-001", "supplier": "Sample Supplier", "value": 250.0, "date": datetime.utcnow().isoformat()},
            {"po_number": "PO-2024-002", "supplier": "Another Supplier", "value": 180.0, "date": (datetime.utcnow() - timedelta(days=1)).isoformat()}
        ]
        
        return BOMDashboardStats(
            total_items=total_items,
            total_value=total_value,
            items_by_status=status_counts,
            items_by_category=category_counts,
            critical_path_items=critical_path_items,
            items_needing_procurement=items_needing_procurement,
            auto_reorder_items=auto_reorder_items,
            average_lead_time=avg_lead_time,
            top_suppliers=top_suppliers,
            recent_orders=recent_orders
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard stats: {str(e)}"
        )

# MakrX Store Integration
@router.post("/makrx-store/order")
async def create_makrx_store_order(
    order_request: MakrXStoreOrderRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create an order in MakrX Store for BOM items"""
    try:
        # Verify all BOM items exist
        bom_item_ids = [item.bom_item_id for item in order_request.items]
        bom_items = db.query(EnhancedBOMItem).filter(
            EnhancedBOMItem.id.in_(bom_item_ids)
        ).all()
        
        if len(bom_items) != len(bom_item_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more BOM items not found"
            )
        
        # Create order data for MakrX Store
        order_data = {
            "items": [],
            "customer_id": current_user.get("user_id"),
            "delivery_address": order_request.delivery_address,
            "priority": order_request.priority,
            "source": "makrcave_bom",
            "reference_id": order_request.project_id
        }
        
        total_value = 0.0
        
        for item_request in order_request.items:
            bom_item = next(item for item in bom_items if item.id == item_request.bom_item_id)
            
            if not bom_item.makrx_product_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"BOM item {bom_item.item_name} does not have a MakrX Store product code"
                )
            
            item_total = (bom_item.unit_cost or 0) * item_request.quantity
            total_value += item_total
            
            order_data["items"].append({
                "product_code": bom_item.makrx_product_code,
                "quantity": item_request.quantity,
                "unit_price": bom_item.unit_cost,
                "bom_item_id": bom_item.id,
                "notes": item_request.notes
            })
        
        # TODO: Call MakrX Store API to create the order
        # This would be replaced with actual API call
        makrx_order_response = {
            "order_id": f"MAKRX_{uuid.uuid4().hex[:8]}",
            "status": "pending",
            "total_value": total_value,
            "estimated_delivery": (datetime.utcnow() + timedelta(days=7)).isoformat()
        }
        
        # Create purchase orders for each item
        for item_request in order_request.items:
            bom_item = next(item for item in bom_items if item.id == item_request.bom_item_id)
            
            po = BOMPurchaseOrder(
                id=f"po_{uuid.uuid4().hex[:12]}",
                bom_item_id=bom_item.id,
                po_number=makrx_order_response["order_id"],
                supplier_name="MakrX Store",
                quantity_ordered=float(item_request.quantity),
                unit_price=bom_item.unit_cost,
                total_amount=(bom_item.unit_cost or 0) * item_request.quantity,
                currency="USD",
                expected_delivery=datetime.fromisoformat(makrx_order_response["estimated_delivery"].replace('Z', '+00:00')),
                status="confirmed",
                requested_by=current_user.get("user_id")
            )
            
            db.add(po)
            
            # Update BOM item status
            bom_item.procurement_status = ProcurementStatus.ORDERED
        
        db.commit()
        
        return {
            "success": True,
            "makrx_order_id": makrx_order_response["order_id"],
            "total_value": total_value,
            "estimated_delivery": makrx_order_response["estimated_delivery"],
            "message": f"Order created successfully with {len(order_request.items)} items"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create MakrX Store order: {str(e)}"
        )

# Cost Analysis
@router.get("/cost-analysis", response_model=BOMCostAnalysis)
async def get_cost_analysis(
    project_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed cost analysis for BOM items"""
    try:
        base_query = db.query(EnhancedBOMItem)
        
        if project_id:
            base_query = base_query.filter(EnhancedBOMItem.project_id == project_id)
        
        items = base_query.all()
        
        # Calculate total cost
        total_cost = sum(item.total_cost or 0 for item in items)
        
        # Cost by category
        cost_by_category = {}
        for category in ComponentCategory:
            category_items = [item for item in items if item.category == category]
            category_cost = sum(item.total_cost or 0 for item in category_items)
            if category_cost > 0:
                cost_by_category[category.value] = category_cost
        
        # Cost by supplier
        cost_by_supplier = {}
        for item in items:
            if item.primary_supplier and item.total_cost:
                supplier = item.primary_supplier
                cost_by_supplier[supplier] = cost_by_supplier.get(supplier, 0) + item.total_cost
        
        # High cost items (top 10% by cost)
        items_with_cost = [item for item in items if item.total_cost]
        items_with_cost.sort(key=lambda x: x.total_cost, reverse=True)
        high_cost_count = max(1, len(items_with_cost) // 10)
        high_cost_items = [
            {
                "id": item.id,
                "name": item.item_name,
                "cost": item.total_cost,
                "category": item.category.value
            }
            for item in items_with_cost[:high_cost_count]
        ]
        
        # Cost optimization suggestions
        suggestions = []
        
        # Check for items without suppliers
        no_supplier_items = [item for item in items if not item.primary_supplier]
        if no_supplier_items:
            suggestions.append(f"Consider finding suppliers for {len(no_supplier_items)} items without suppliers")
        
        # Check for single-source items
        single_source_items = [item for item in items if item.primary_supplier and not item.alternative_suppliers]
        if single_source_items:
            suggestions.append(f"Consider finding alternative suppliers for {len(single_source_items)} single-source items")
        
        # Check for high-cost items without alternatives
        high_cost_no_alt = [item for item in high_cost_items if not items_with_cost[high_cost_items.index(item)].alternatives]
        if high_cost_no_alt:
            suggestions.append(f"Review alternatives for {len(high_cost_no_alt)} high-cost items")
        
        return BOMCostAnalysis(
            total_cost=total_cost,
            cost_by_category=cost_by_category,
            cost_by_supplier=cost_by_supplier,
            high_cost_items=high_cost_items,
            cost_variance_from_budget=None,  # Would require budget data
            cost_optimization_suggestions=suggestions
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate cost analysis: {str(e)}"
        )
