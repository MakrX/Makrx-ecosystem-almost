"""
Exact API contracts as specified in the architecture
Implementation-ready bridge endpoints with precise data shapes
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import httpx
from datetime import datetime

from app.core.config import settings
from app.core.db import get_db

router = APIRouter()

# ==========================================
# C) Service Order → Provider Job (Store → Cave bridge)
# ==========================================

class ServiceOrderRequest(BaseModel):
    """Exact shape for Store → Cave job publishing"""
    service_order_id: int
    upload_file_key: str
    material: str
    quality: str
    est_weight_g: float
    est_time_min: int
    delivery: dict  # {"mode": "ship", "city": "Chandigarh", "pincode": "160012"}
    capabilities: dict  # {"min_nozzle_mm": 0.4, "bed_min_mm": [220,220,250]}

class JobPublishResponse(BaseModel):
    """Cave response to job publish"""
    job_id: int
    routing: str = "published"
    accept_url: str

@router.post("/jobs/publish", response_model=JobPublishResponse)
async def publish_job_to_cave(
    request: ServiceOrderRequest,
    db: Session = Depends(get_db)
):
    """
    Store → Cave: Publish service order as production job
    Exact API contract as specified
    """
    try:
        # Call MakrCave backend with exact data shape
        cave_payload = {
            "external_order_id": str(request.service_order_id),
            "source": "makrx_store",
            "title": f"3D Print Job - Order {request.service_order_id}",
            "description": f"Material: {request.material}, Quality: {request.quality}",
            "file_url": f"{settings.S3_BASE_URL}/{request.upload_file_key}",
            "requirements": {
                "material": request.material,
                "quality": request.quality,
                "est_weight_g": request.est_weight_g,
                "est_time_min": request.est_time_min,
                "capabilities": request.capabilities
            },
            "delivery": request.delivery,
            "priority": "normal"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.MAKRCAVE_API_URL}/api/v1/bridge/jobs",
                json=cave_payload,
                headers={
                    "Authorization": f"Bearer {settings.SERVICE_JWT}",
                    "Content-Type": "application/json"
                }
            )
            response.raise_for_status()
            cave_response = response.json()
        
        # Return exactly as specified
        return JobPublishResponse(
            job_id=cave_response["job_id"],
            routing="published",
            accept_url=f"https://makrcave.com/provider/jobs/{cave_response['job_id']}"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to publish job to MakrCave"
        )

# ==========================================
# D) Job Status (Cave → Store callback)
# ==========================================

class JobMilestone(BaseModel):
    """Job milestone timestamp and note"""
    at: datetime
    note: str

class JobStatusUpdate(BaseModel):
    """Exact shape for Cave → Store status updates"""
    service_order_id: int
    status: str  # PUBLISHED|ACCEPTED|PRINTING|READY|SHIPPED|COMPLETED|CANCELLED
    milestone: JobMilestone

@router.post("/jobs/{job_id}/status")
async def receive_job_status_update(
    job_id: int,
    update: JobStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Cave → Store: Receive job status updates
    Exact callback contract as specified
    """
    try:
        # Find service order by ID
        from app.models.services import ServiceOrder
        service_order = db.query(ServiceOrder).filter(
            ServiceOrder.id == update.service_order_id
        ).first()
        
        if not service_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service order not found"
            )
        
        # Update status using exact mapping
        status_mapping = {
            "PUBLISHED": "pending_assignment",
            "ACCEPTED": "assigned_to_provider", 
            "PRINTING": "in_production",
            "READY": "ready_for_shipping",
            "SHIPPED": "shipped",
            "COMPLETED": "completed",
            "CANCELLED": "cancelled"
        }
        
        service_order.status = status_mapping.get(update.status, update.status)
        
        # Append milestone to timeline
        if not hasattr(service_order, 'milestones'):
            service_order.milestones = []
        
        service_order.milestones.append({
            "timestamp": update.milestone.at.isoformat(),
            "status": update.status,
            "note": update.milestone.note
        })
        
        db.commit()
        
        return {"success": True, "message": f"Status updated to {update.status}"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update job status"
        )

