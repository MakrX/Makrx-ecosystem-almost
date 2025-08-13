"""Bridge API routes for Cave <-> Store communication"""
import httpx
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.config import settings
from database import get_db
from models.project import Job, JobStatus
from schemas.project import JobCreate, JobUpdate
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

class StoreJobRequest(BaseModel):
    """Job request from MakrX Store"""
    external_order_id: str
    source: str
    title: str
    description: str
    file_url: str
    requirements: Dict[str, Any]
    customer_info: Dict[str, Any]
    priority: str = "normal"
    deadline: Optional[datetime] = None
    budget: Optional[float] = None

class JobStatusNotification(BaseModel):
    """Send job status back to Store"""
    job_id: str
    external_order_id: str
    status: str
    provider_id: Optional[str] = None
    estimated_completion: Optional[datetime] = None
    actual_completion: Optional[datetime] = None
    notes: Optional[str] = None
    images: Optional[List[str]] = None

async def notify_store_api(
    endpoint: str,
    method: str = "POST",
    data: Dict[str, Any] = None,
    headers: Dict[str, str] = None
) -> Dict[str, Any]:
    """Send notification to Store backend"""
    url = f"{settings.STORE_API_URL}/api/v1{endpoint}"
    
    # Add service-to-service authentication
    default_headers = {
        "Content-Type": "application/json",
        "X-API-Key": settings.STORE_API_KEY,
        "X-Service": "makrcave"
    }
    
    if headers:
        default_headers.update(headers)
    
    async with httpx.AsyncClient() as client:
        try:
            if method.upper() == "POST":
                response = await client.post(url, json=data, headers=default_headers)
            elif method.upper() == "PATCH":
                response = await client.patch(url, json=data, headers=default_headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to notify Store API {endpoint}: {e}")
            # Don't raise exception - this is a notification, not critical
            return {"error": str(e)}

@router.post("/jobs")
async def receive_job_from_store(
    job_request: StoreJobRequest,
    db: Session = Depends(get_db)
):
    """Receive and process job from MakrX Store"""
    try:
        # Create job in MakrCave system
        job_data = {
            "title": job_request.title,
            "description": job_request.description,
            "status": JobStatus.PENDING_ASSIGNMENT,
            "priority": job_request.priority,
            "file_urls": [job_request.file_url],
            "requirements": job_request.requirements,
            "deadline": job_request.deadline,
            "budget": job_request.budget,
            "source_system": job_request.source,
            "external_order_id": job_request.external_order_id,
            "customer_details": job_request.customer_info,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Create job record
        job = Job(**job_data)
        db.add(job)
        db.commit()
        db.refresh(job)
        
        logger.info(f"Created job {job.id} from Store order {job_request.external_order_id}")
        
        # Auto-assign to appropriate provider based on requirements
        assigned_provider = await auto_assign_provider(job, db)
        
        if assigned_provider:
            job.provider_id = assigned_provider["provider_id"]
            job.status = JobStatus.ASSIGNED
            job.assigned_at = datetime.utcnow()
            db.commit()
            
            logger.info(f"Auto-assigned job {job.id} to provider {assigned_provider['provider_id']}")
            
            # Notify Store of assignment
            await notify_store_status_update(job, "accepted", db)
        
        return {
            "success": True,
            "job_id": str(job.id),
            "status": job.status.value,
            "assigned_provider": assigned_provider["provider_id"] if assigned_provider else None,
            "estimated_completion": job.deadline
        }
        
    except Exception as e:
        logger.error(f"Failed to create job from Store: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create job"
        )

async def auto_assign_provider(job: Job, db: Session) -> Optional[Dict[str, Any]]:
    """Auto-assign job to best available provider"""
    try:
        # TODO: Implement sophisticated provider matching
        # For now, return mock assignment
        
        requirements = job.requirements or {}
        material = requirements.get("material", "PLA")
        quality = requirements.get("quality", "standard")
        
        # Mock provider assignment logic
        mock_providers = [
            {
                "provider_id": "prov_001",
                "name": "TechHub 3D Services",
                "capabilities": ["PLA", "ABS", "PETG"],
                "quality_levels": ["draft", "standard", "high"],
                "current_queue": 2,
                "avg_completion_time": 24
            },
            {
                "provider_id": "prov_002", 
                "name": "Precision Print Co",
                "capabilities": ["PLA", "ABS", "PETG", "TPU"],
                "quality_levels": ["standard", "high", "ultra"],
                "current_queue": 1,
                "avg_completion_time": 48
            }
        ]
        
        # Simple assignment: first provider that can handle the job
        for provider in mock_providers:
            if (material in provider["capabilities"] and 
                quality in provider["quality_levels"]):
                return provider
        
        return None
        
    except Exception as e:
        logger.error(f"Provider assignment failed: {str(e)}")
        return None

@router.patch("/jobs/{job_id}/status")
async def update_job_status(
    job_id: str,
    status_update: JobUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update job status and notify Store"""
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Update job status
        old_status = job.status
        job.status = JobStatus(status_update.status)
        job.updated_at = datetime.utcnow()
        
        # Update completion time if completed
        if job.status in [JobStatus.COMPLETED, JobStatus.SHIPPED]:
            job.completed_at = datetime.utcnow()
        
        # Update provider notes and images
        if hasattr(status_update, 'notes') and status_update.notes:
            job.provider_notes = status_update.notes
        
        if hasattr(status_update, 'images') and status_update.images:
            job.progress_images = status_update.images
        
        db.commit()
        
        logger.info(f"Updated job {job_id} status from {old_status} to {job.status}")
        
        # Notify Store of status change
        await notify_store_status_update(job, job.status.value, db)
        
        return {
            "success": True,
            "job_id": job_id,
            "old_status": old_status.value,
            "new_status": job.status.value,
            "updated_at": job.updated_at
        }
        
    except Exception as e:
        logger.error(f"Failed to update job status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update job status"
        )

async def notify_store_status_update(job: Job, status: str, db: Session):
    """Send status update notification to Store"""
    try:
        notification_data = {
            "job_id": str(job.id),
            "service_order_id": job.external_order_id,
            "status": status,
            "provider_id": job.provider_id,
            "estimated_completion": job.deadline.isoformat() if job.deadline else None,
            "actual_completion": job.completed_at.isoformat() if job.completed_at else None,
            "notes": job.provider_notes,
            "images": job.progress_images or []
        }
        
        response = await notify_store_api(
            f"/bridge/jobs/{job.id}/status",
            "POST",
            notification_data
        )
        
        if "error" not in response:
            logger.info(f"Successfully notified Store of job {job.id} status: {status}")
        else:
            logger.warning(f"Failed to notify Store of status update: {response['error']}")
            
    except Exception as e:
        logger.error(f"Failed to send status notification: {str(e)}")

@router.get("/inventory/sync")
async def get_inventory_sync_data(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Provide inventory data for Store synchronization"""
    try:
        # TODO: Get actual inventory data from database
        # For now, return mock data structure
        
        inventory_items = [
            {
                "sku": "PLA-WHITE-1KG",
                "name": "PLA Filament - White - 1kg",
                "available_quantity": 15.5,
                "unit": "kg",
                "location": "Storage A1",
                "last_updated": datetime.utcnow().isoformat()
            },
            {
                "sku": "ABS-BLACK-1KG", 
                "name": "ABS Filament - Black - 1kg",
                "available_quantity": 8.2,
                "unit": "kg", 
                "location": "Storage A1",
                "last_updated": datetime.utcnow().isoformat()
            },
            {
                "sku": "PETG-CLEAR-1KG",
                "name": "PETG Filament - Clear - 1kg", 
                "available_quantity": 12.1,
                "unit": "kg",
                "location": "Storage A2",
                "last_updated": datetime.utcnow().isoformat()
            }
        ]
        
        return {
            "success": True,
            "items": inventory_items,
            "sync_timestamp": datetime.utcnow().isoformat(),
            "total_items": len(inventory_items)
        }
        
    except Exception as e:
        logger.error(f"Failed to get inventory sync data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get inventory data"
        )

@router.post("/users/profile/sync")
async def sync_user_profile_from_store(
    profile_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Receive user profile updates from Store"""
    try:
        user_id = profile_data.get("user_id")
        profile_info = profile_data.get("profile_data", {})
        
        # TODO: Update user profile in MakrCave database
        # This would sync preferences, addresses, contact info, etc.
        
        logger.info(f"Synced profile for user {user_id} from Store")
        
        return {
            "success": True,
            "user_id": user_id,
            "synced_fields": list(profile_info.keys()),
            "sync_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to sync user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to sync user profile"
        )

@router.get("/health")
async def bridge_health_check():
    """Health check endpoint for bridge connectivity"""
    return {
        "status": "healthy",
        "service": "makrcave-bridge",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }
