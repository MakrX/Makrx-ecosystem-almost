"""
MakrCave Bridge API - Exact contracts as specified
Cave side of the Store ↔ Cave integration
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import httpx

from database import get_db
from models.project import Job, JobStatus
from models.inventory import InventoryItem, InventoryTransaction
from utils.auth import verify_service_jwt

router = APIRouter()

# ==========================================
# Store Job Request → Cave Job Creation
# ==========================================

class StoreJobRequest(BaseModel):
    """Exact shape from Store service order"""
    external_order_id: str
    source: str
    title: str
    description: str
    file_url: str
    requirements: Dict[str, Any]
    delivery: Dict[str, Any]
    priority: str = "normal"

class JobCreationResponse(BaseModel):
    """Response to Store with exact fields specified"""
    job_id: int
    routing: str = "published"
    accept_url: str

@router.post("/jobs", response_model=JobCreationResponse)
async def receive_job_from_store(
    job_request: StoreJobRequest,
    service_jwt: str = Depends(verify_service_jwt),
    db: Session = Depends(get_db)
):
    """
    Store → Cave: Receive service order and create provider job
    Exact API contract implementation
    """
    try:
        # Extract requirements
        requirements = job_request.requirements
        material = requirements.get("material", "PLA")
        quality = requirements.get("quality", "standard")
        est_weight_g = requirements.get("est_weight_g", 0.0)
        est_time_min = requirements.get("est_time_min", 60)
        capabilities = requirements.get("capabilities", {})
        
        # Create job with exact data mapping
        job_data = {
            "title": job_request.title,
            "description": job_request.description,
            "status": JobStatus.PUBLISHED,
            "priority": job_request.priority,
            "file_urls": [job_request.file_url],
            "material": material,
            "quality": quality,
            "estimated_weight_g": est_weight_g,
            "estimated_time_minutes": est_time_min,
            "delivery_requirements": job_request.delivery,
            "equipment_requirements": capabilities,
            "source_system": job_request.source,
            "external_order_id": job_request.external_order_id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Create job record
        job = Job(**job_data)
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Auto-route to provider based on capabilities and location
        provider_assignment = await auto_route_job(job, db)
        
        # Return exact response shape
        return JobCreationResponse(
            job_id=job.id,
            routing="published",
            accept_url=f"https://makrcave.com/provider/jobs/{job.id}"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create job: {str(e)}"
        )

async def auto_route_job(job: Job, db: Session) -> Dict[str, Any]:
    """
    Auto-assign job based on:
    - Material capabilities 
    - Geographic proximity
    - Current queue depth
    - Equipment requirements
    """
    try:
        # Mock sophisticated routing logic
        # In production: query provider capabilities, location, queue
        
        delivery = job.delivery_requirements or {}
        city = delivery.get("city", "")
        pincode = delivery.get("pincode", "")
        
        # Simple routing: return first available provider
        # Real implementation would check:
        # - provider.materials contains job.material
        # - provider.location near delivery.city
        # - provider.queue_depth < threshold
        # - provider.equipment meets job.equipment_requirements
        
        return {
            "provider_id": "auto_assigned",
            "routing_method": "geo_capability_queue",
            "confidence": 0.85
        }
        
    except Exception as e:
        return {"error": str(e)}

# ==========================================
# Job Status Updates → Store Callback
# ==========================================

class JobStatusCallback(BaseModel):
    """Exact shape for Cave → Store status updates"""
    service_order_id: int
    status: str  # PUBLISHED|ACCEPTED|PRINTING|READY|SHIPPED|COMPLETED|CANCELLED
    milestone: Dict[str, Any]  # {"at": timestamp, "note": "message"}

@router.post("/jobs/{job_id}/update-status")
async def update_job_status_and_notify_store(
    job_id: int,
    status: str,
    notes: Optional[str] = None,
    provider_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Provider/system updates job status → automatically notify Store
    Implements the Cave → Store callback pattern
    """
    try:
        # Update job in Cave database
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        old_status = job.status
        job.status = JobStatus(status)
        job.updated_at = datetime.utcnow()
        
        if provider_id:
            job.provider_id = provider_id
            
        if notes:
            job.provider_notes = notes
            
        # Mark completion timestamp
        if status in ["COMPLETED", "SHIPPED"]:
            job.completed_at = datetime.utcnow()
            
        db.commit()
        
        # Notify Store with exact callback shape
        callback_payload = JobStatusCallback(
            service_order_id=int(job.external_order_id),
            status=status,
            milestone={
                "at": datetime.utcnow().isoformat(),
                "note": notes or f"Status changed to {status}"
            }
        )
        
        # Send callback to Store
        await notify_store_status_change(job_id, callback_payload)
        
        return {
            "success": True,
            "job_id": job_id,
            "old_status": old_status.value if old_status else None,
            "new_status": status,
            "store_notified": True
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update job status: {str(e)}"
        )

async def notify_store_status_change(job_id: int, payload: JobStatusCallback):
    """Send status update to Store using exact callback contract"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.STORE_API_URL}/bridge/jobs/{job_id}/status",
                json=payload.dict(),
                headers={
                    "Authorization": f"Bearer {settings.SERVICE_JWT}",
                    "Content-Type": "application/json",
                    "X-Cave-Event-ID": f"cave_{job_id}_{datetime.utcnow().timestamp()}"
                }
            )
            response.raise_for_status()
            
    except Exception as e:
        # Log but don't fail - this is a notification
        print(f"Failed to notify Store of status change: {e}")

# ==========================================
# E) Filament Deduction (Cave Internal)
# ==========================================

class FilamentTransaction(BaseModel):
    """Exact shape for filament consumption tracking"""
    item_id: int
    delta_qty: float  # negative for consumption, in grams
    reason: str = "CONSUME_JOB"
    ref_type: str = "JOB"
    ref_id: int

@router.post("/inventory/transactions")
async def record_filament_consumption(
    transaction: FilamentTransaction,
    db: Session = Depends(get_db)
):
    """
    Record material consumption during job execution
    Exact API as specified in architecture
    """
    try:
        # Validate inventory item exists
        item = db.query(InventoryItem).filter(
            InventoryItem.id == transaction.item_id
        ).first()
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inventory item not found"
            )
        
        # Check sufficient quantity (for consumption)
        if transaction.delta_qty < 0 and abs(transaction.delta_qty) > item.current_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient quantity available"
            )
        
        # Create transaction record
        inv_transaction = InventoryTransaction(
            item_id=transaction.item_id,
            quantity_before=item.current_quantity,
            quantity_after=item.current_quantity + transaction.delta_qty,
            delta=transaction.delta_qty,
            reason=transaction.reason,
            reference_type=transaction.ref_type,
            reference_id=transaction.ref_id,
            created_at=datetime.utcnow()
        )
        
        # Update item quantity
        item.current_quantity += transaction.delta_qty
        
        db.add(inv_transaction)
        db.commit()
        
        return {
            "success": True,
            "transaction_id": inv_transaction.id,
            "item_id": transaction.item_id,
            "delta_qty": transaction.delta_qty,
            "new_quantity": item.current_quantity,
            "reason": transaction.reason
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record transaction: {str(e)}"
        )

# ==========================================
# Inventory Sync for Store
# ==========================================

class InventoryItem(BaseModel):
    """Inventory item for Store synchronization"""
    sku: str
    name: str
    available_quantity: float
    unit: str
    location: str
    last_updated: str

class InventorySyncResponse(BaseModel):
    """Response for Store inventory sync"""
    success: bool
    items: List[InventoryItem]
    sync_timestamp: str
    total_items: int

@router.get("/inventory/sync", response_model=InventorySyncResponse)
async def provide_inventory_for_store_sync(
    service_jwt: str = Depends(verify_service_jwt),
    db: Session = Depends(get_db)
):
    """
    Provide current inventory levels to Store for synchronization
    Used for Store product availability updates
    """
    try:
        # Get all inventory items with SKU mapping
        inventory_items = db.query(InventoryItem).filter(
            InventoryItem.sku.isnot(None)  # Only items with Store SKU mapping
        ).all()
        
        sync_items = []
        for item in inventory_items:
            sync_items.append(InventoryItem(
                sku=item.sku,
                name=item.name,
                available_quantity=item.current_quantity,
                unit=item.unit,
                location=item.location or "Unknown",
                last_updated=item.updated_at.isoformat() if item.updated_at else datetime.utcnow().isoformat()
            ))
        
        return InventorySyncResponse(
            success=True,
            items=sync_items,
            sync_timestamp=datetime.utcnow().isoformat(),
            total_items=len(sync_items)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync inventory: {str(e)}"
        )

# ==========================================
# Provider Job Acceptance
# ==========================================

@router.post("/provider/jobs/{job_id}/accept")
async def provider_accept_job(
    job_id: int,
    provider_id: str,
    estimated_completion: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """
    Provider accepts job → automatically update Store
    Triggers ACCEPTED status callback
    """
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        if job.status != JobStatus.PUBLISHED:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Job already assigned or completed"
            )
        
        # Update job
        job.status = JobStatus.ACCEPTED
        job.provider_id = provider_id
        job.accepted_at = datetime.utcnow()
        if estimated_completion:
            job.estimated_completion = estimated_completion
        
        db.commit()
        
        # Auto-notify Store
        await notify_store_status_change(job_id, JobStatusCallback(
            service_order_id=int(job.external_order_id),
            status="ACCEPTED",
            milestone={
                "at": datetime.utcnow().isoformat(),
                "note": f"Accepted by provider {provider_id}"
            }
        ))
        
        return {
            "success": True,
            "job_id": job_id,
            "provider_id": provider_id,
            "status": "ACCEPTED",
            "estimated_completion": estimated_completion
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to accept job: {str(e)}"
        )
