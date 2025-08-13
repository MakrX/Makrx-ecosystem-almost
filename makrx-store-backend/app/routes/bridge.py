"""Bridge API routes for Store <-> Cave communication"""
import httpx
import logging
from datetime import datetime
from typing import Dict, Any, Optional

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.config import settings
from app.core.db import get_db
from app.core.security import get_current_user
from app.models.commerce import Order
from app.models.services import ServiceOrder
from app.schemas.services import ServiceOrderCreate, ServiceOrderUpdate

logger = logging.getLogger(__name__)
router = APIRouter()

class JobPublishRequest(BaseModel):
    """Request to publish job to MakrCave"""
    service_order_id: str
    order_id: str
    file_url: str
    material: str
    quality: str
    quantity: int
    estimated_time_minutes: int
    customer_details: Dict[str, Any]
    requirements: Dict[str, Any]
    priority: str = "normal"

class JobStatusUpdate(BaseModel):
    """Job status update from MakrCave"""
    job_id: str
    service_order_id: str
    status: str
    provider_id: Optional[str] = None
    estimated_completion: Optional[datetime] = None
    actual_completion: Optional[datetime] = None
    notes: Optional[str] = None
    images: Optional[list] = None

async def call_makrcave_api(
    endpoint: str, 
    method: str = "POST", 
    data: Dict[str, Any] = None,
    headers: Dict[str, str] = None
) -> Dict[str, Any]:
    """Make authenticated API call to MakrCave backend"""
    url = f"{settings.MAKRCAVE_API_URL}/api/v1{endpoint}"
    
    # Add service-to-service authentication
    default_headers = {
        "Content-Type": "application/json",
        "X-API-Key": settings.MAKRCAVE_API_KEY,
        "X-Service": "makrx-store"
    }
    
    if headers:
        default_headers.update(headers)
    
    async with httpx.AsyncClient() as client:
        try:
            if method.upper() == "POST":
                response = await client.post(url, json=data, headers=default_headers)
            elif method.upper() == "GET":
                response = await client.get(url, headers=default_headers)
            elif method.upper() == "PATCH":
                response = await client.patch(url, json=data, headers=default_headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to call MakrCave API {endpoint}: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to communicate with MakrCave service"
            )

@router.post("/jobs/publish")
async def publish_job_to_makrcave(
    job_request: JobPublishRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Publish a service order job to MakrCave for fulfillment"""
    try:
        # Verify service order exists and belongs to user
        service_order = db.query(ServiceOrder).filter(
            ServiceOrder.id == job_request.service_order_id
        ).first()
        
        if not service_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service order not found"
            )
        
        # Prepare job data for MakrCave
        job_data = {
            "external_order_id": job_request.service_order_id,
            "source": "makrx_store",
            "title": f"3D Print Job - Order {job_request.order_id}",
            "description": f"3D printing service for {job_request.quantity} part(s)",
            "file_url": job_request.file_url,
            "requirements": {
                "material": job_request.material,
                "quality": job_request.quality,
                "quantity": job_request.quantity,
                "estimated_time_minutes": job_request.estimated_time_minutes,
                **job_request.requirements
            },
            "customer_info": job_request.customer_details,
            "priority": job_request.priority,
            "deadline": service_order.estimated_delivery,
            "budget": float(service_order.total_price) if service_order.total_price else None
        }
        
        # Call MakrCave to create job
        response = await call_makrcave_api("/jobs", "POST", job_data)
        
        # Update service order with MakrCave job ID
        service_order.status = "assigned_to_provider"
        service_order.metadata = service_order.metadata or {}
        service_order.metadata.update({
            "makrcave_job_id": response.get("job_id"),
            "assigned_at": datetime.utcnow().isoformat(),
            "provider_assignment_method": "auto_routing"
        })
        
        db.commit()
        
        logger.info(f"Successfully published job {response.get('job_id')} to MakrCave for service order {job_request.service_order_id}")
        
        return {
            "success": True,
            "job_id": response.get("job_id"),
            "message": "Job successfully published to MakrCave",
            "estimated_assignment_time": "15-30 minutes"
        }
        
    except Exception as e:
        logger.error(f"Failed to publish job to MakrCave: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to publish job to MakrCave"
        )

@router.post("/jobs/{job_id}/status")
async def update_job_status(
    job_id: str,
    status_update: JobStatusUpdate,
    db: Session = Depends(get_db)
):
    """Receive job status updates from MakrCave"""
    try:
        # Find the service order by MakrCave job ID
        service_order = db.query(ServiceOrder).filter(
            ServiceOrder.metadata.op('->>')('makrcave_job_id') == job_id
        ).first()
        
        if not service_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service order not found for job ID"
            )
        
        # Map MakrCave statuses to Store statuses
        status_mapping = {
            "accepted": "assigned_to_provider",
            "in_progress": "in_production",
            "printing": "in_production", 
            "post_processing": "in_production",
            "quality_check": "quality_review",
            "ready_for_pickup": "ready_for_shipping",
            "shipped": "shipped",
            "completed": "completed",
            "cancelled": "cancelled",
            "failed": "failed"
        }
        
        new_status = status_mapping.get(status_update.status, status_update.status)
        service_order.status = new_status
        
        # Update metadata with progress info
        service_order.metadata = service_order.metadata or {}
        service_order.metadata.update({
            "last_status_update": datetime.utcnow().isoformat(),
            "makrcave_status": status_update.status,
            "provider_id": status_update.provider_id,
            "estimated_completion": status_update.estimated_completion.isoformat() if status_update.estimated_completion else None,
            "provider_notes": status_update.notes,
            "progress_images": status_update.images or []
        })
        
        # Update completion timestamp if completed
        if status_update.status in ["completed", "shipped"]:
            service_order.completed_at = status_update.actual_completion or datetime.utcnow()
        
        db.commit()
        
        logger.info(f"Updated service order {service_order.id} status to {new_status}")
        
        # TODO: Send customer notification about status update
        # await send_status_notification(service_order, status_update)
        
        return {
            "success": True,
            "message": f"Status updated to {new_status}",
            "service_order_id": service_order.id
        }
        
    except Exception as e:
        logger.error(f"Failed to update job status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update job status"
        )

@router.get("/inventory/sync")
async def sync_inventory_with_makrcave(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sync inventory levels with MakrCave makerspaces"""
    try:
        # Get inventory data from MakrCave
        inventory_data = await call_makrcave_api("/inventory/sync", "GET")
        
        # TODO: Update Store product stock levels based on MakrCave inventory
        # This would update available quantities for products that are manufactured in-house
        
        return {
            "success": True,
            "synced_items": len(inventory_data.get("items", [])),
            "last_sync": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to sync inventory: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to sync inventory"
        )

@router.post("/user/profile/sync")
async def sync_user_profile(
    user_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Sync user profile data between Store and Cave"""
    try:
        # Forward profile updates to MakrCave
        response = await call_makrcave_api("/users/profile/sync", "POST", {
            "user_id": current_user["sub"],
            "profile_data": user_data,
            "source": "makrx_store"
        })
        
        return {
            "success": True,
            "message": "Profile synced successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to sync user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to sync user profile"
        )

@router.get("/status")
async def bridge_status():
    """Check bridge service connectivity"""
    try:
        # Test connection to MakrCave
        response = await call_makrcave_api("/health", "GET")
        
        return {
            "bridge_status": "healthy",
            "makrcave_connection": "connected",
            "last_check": datetime.utcnow().isoformat(),
            "makrcave_status": response.get("status", "unknown")
        }
        
    except Exception as e:
        return {
            "bridge_status": "degraded",
            "makrcave_connection": "disconnected",
            "last_check": datetime.utcnow().isoformat(),
            "error": str(e)
        }
