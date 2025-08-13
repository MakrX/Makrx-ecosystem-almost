#!/usr/bin/env python3
"""
Provider Network Routes - Manage service providers and job dispatch
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from typing import List, Dict, Any, Optional
import logging
import json
from uuid import UUID, uuid4
from datetime import datetime, timedelta
from pydantic import BaseModel, Field, EmailStr
from enum import Enum

from ..database import get_db
from ..models.project import Project
from ..models.equipment import Equipment
from ..models.member import Member, MakerspaceSettings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/providers", tags=["Service Providers"])

# Enums
class ProviderStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive" 
    BUSY = "busy"
    MAINTENANCE = "maintenance"

class JobStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"

class JobPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class ProviderCapability(str, Enum):
    PLA_PRINTING = "pla_printing"
    ABS_PRINTING = "abs_printing"
    PETG_PRINTING = "petg_printing"
    TPU_PRINTING = "tpu_printing"
    WOOD_PLA_PRINTING = "wood_pla_printing"
    CARBON_FIBER_PRINTING = "carbon_fiber_printing"
    MULTI_COLOR = "multi_color"
    LARGE_FORMAT = "large_format"
    HIGH_PRECISION = "high_precision"
    POST_PROCESSING = "post_processing"

# Database Models (extend existing models)
class ServiceProvider(BaseModel):
    id: str
    makerspace_id: str
    name: str
    contact_email: str
    status: ProviderStatus
    capabilities: List[ProviderCapability]
    max_build_volume: Dict[str, float]  # {x, y, z} in mm
    available_materials: List[str]
    quality_levels: List[str]
    hourly_rate: float
    setup_fee: float
    rating: float
    total_jobs: int
    queue_length: int
    estimated_capacity_hours: int
    location: Dict[str, str]
    created_at: datetime
    updated_at: datetime

class ServiceJob(BaseModel):
    id: str
    service_order_id: str  # From Store
    provider_id: Optional[str] = None
    customer_email: str
    files: List[Dict[str, Any]]
    specifications: Dict[str, Any]
    quantity: int
    priority: JobPriority
    estimated_value: float
    estimated_hours: Optional[float] = None
    deadline: datetime
    status: JobStatus
    assigned_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    tracking_info: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

# Pydantic Request/Response Models
class ProviderRegistration(BaseModel):
    makerspace_id: str
    name: str
    contact_email: EmailStr
    capabilities: List[ProviderCapability]
    max_build_volume: Dict[str, float]
    available_materials: List[str]
    quality_levels: List[str]
    hourly_rate: float = Field(gt=0, description="Hourly rate in USD")
    setup_fee: float = Field(ge=0, description="Setup fee per job")
    location: Dict[str, str]

class ProviderSearchRequest(BaseModel):
    material: Optional[str] = None
    quality: Optional[str] = None
    volume: Optional[float] = None
    quantity: Optional[int] = None
    max_distance: Optional[float] = None
    location: Optional[Dict[str, float]] = None  # {lat, lng}

class JobDispatchRequest(BaseModel):
    job_id: str
    service_order_id: str
    customer_email: EmailStr
    files: List[Dict[str, Any]]
    specifications: Dict[str, Any]
    quantity: int
    priority: JobPriority
    estimated_value: float
    deadline: datetime
    special_instructions: Optional[str] = None

class JobUpdateRequest(BaseModel):
    status: JobStatus
    progress_notes: Optional[str] = None
    estimated_completion: Optional[datetime] = None
    tracking_info: Optional[Dict[str, Any]] = None
    images: Optional[List[str]] = None

class JobResponse(BaseModel):
    id: str
    service_order_id: str
    provider: Optional[Dict[str, Any]] = None
    status: JobStatus
    specifications: Dict[str, Any]
    quantity: int
    priority: JobPriority
    estimated_value: float
    deadline: datetime
    progress: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

# In-memory storage for demo (replace with proper database tables)
providers_db: Dict[str, ServiceProvider] = {}
jobs_db: Dict[str, ServiceJob] = {}

@router.post("/register", response_model=Dict[str, Any])
async def register_provider(
    registration: ProviderRegistration,
    db: AsyncSession = Depends(get_db)
):
    """Register a new service provider"""
    try:
        # Validate makerspace exists
        makerspace_query = await db.execute(
            select(MakerspaceSettings).where(MakerspaceSettings.id == registration.makerspace_id)
        )
        makerspace = makerspace_query.scalar_one_or_none()
        
        if not makerspace:
            raise HTTPException(status_code=404, detail="Makerspace not found")
        
        # Create provider
        provider_id = str(uuid4())
        provider = ServiceProvider(
            id=provider_id,
            makerspace_id=registration.makerspace_id,
            name=registration.name,
            contact_email=registration.contact_email,
            status=ProviderStatus.ACTIVE,
            capabilities=registration.capabilities,
            max_build_volume=registration.max_build_volume,
            available_materials=registration.available_materials,
            quality_levels=registration.quality_levels,
            hourly_rate=registration.hourly_rate,
            setup_fee=registration.setup_fee,
            rating=5.0,  # Start with perfect rating
            total_jobs=0,
            queue_length=0,
            estimated_capacity_hours=40,  # Default weekly capacity
            location=registration.location,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Store in database (mock storage for now)
        providers_db[provider_id] = provider
        
        logger.info(f"Registered new provider: {provider.name} ({provider_id})")
        
        return {
            "success": True,
            "provider_id": provider_id,
            "message": f"Provider '{provider.name}' registered successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Provider registration error: {e}")
        raise HTTPException(status_code=500, detail="Provider registration failed")

@router.get("/search", response_model=List[Dict[str, Any]])
async def search_providers(
    material: Optional[str] = None,
    quality: Optional[str] = None,
    volume: Optional[float] = None,
    quantity: Optional[int] = None,
    max_distance: Optional[float] = None,
    db: AsyncSession = Depends(get_db)
):
    """Search for available providers based on requirements"""
    try:
        # Filter providers based on criteria
        matching_providers = []
        
        for provider in providers_db.values():
            if provider.status != ProviderStatus.ACTIVE:
                continue
                
            # Check material capability
            if material and material not in provider.available_materials:
                continue
                
            # Check quality capability
            if quality and quality not in provider.quality_levels:
                continue
                
            # Check build volume (simplified - checking against max dimension)
            if volume and volume > min(provider.max_build_volume.values()):
                continue
                
            # Check queue capacity
            if quantity and provider.queue_length > 10:  # Arbitrary threshold
                continue
                
            # Calculate estimated delivery time
            queue_delay = provider.queue_length * 2  # 2 days per job in queue
            estimated_delivery = queue_delay + 3  # Base 3 days
            
            matching_providers.append({
                "id": provider.id,
                "name": provider.name,
                "location": provider.location,
                "rating": provider.rating,
                "estimated_delivery": estimated_delivery,
                "capabilities": [cap.value for cap in provider.capabilities],
                "queue_length": provider.queue_length,
                "hourly_rate": provider.hourly_rate,
                "setup_fee": provider.setup_fee,
                "available_materials": provider.available_materials,
                "quality_levels": provider.quality_levels
            })
        
        # Sort by rating and queue length
        matching_providers.sort(key=lambda p: (-p["rating"], p["queue_length"]))
        
        return matching_providers
        
    except Exception as e:
        logger.error(f"Provider search error: {e}")
        raise HTTPException(status_code=500, detail="Provider search failed")

@router.post("/jobs/dispatch", response_model=Dict[str, Any])
async def dispatch_job(
    job_request: JobDispatchRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Dispatch a job to the provider network"""
    try:
        # Find best provider for the job
        material = job_request.specifications.get("material", "pla")
        quality = job_request.specifications.get("quality", "standard")
        
        # Search for providers
        available_providers = []
        for provider in providers_db.values():
            if (provider.status == ProviderStatus.ACTIVE and
                material in provider.available_materials and
                quality in provider.quality_levels):
                available_providers.append(provider)
        
        if not available_providers:
            raise HTTPException(
                status_code=404,
                detail="No available providers found for this job"
            )
        
        # Select best provider (lowest queue + highest rating)
        best_provider = min(available_providers, 
                          key=lambda p: (p.queue_length, -p.rating))
        
        # Create job
        job = ServiceJob(
            id=job_request.job_id,
            service_order_id=job_request.service_order_id,
            provider_id=best_provider.id,
            customer_email=job_request.customer_email,
            files=job_request.files,
            specifications=job_request.specifications,
            quantity=job_request.quantity,
            priority=job_request.priority,
            estimated_value=job_request.estimated_value,
            deadline=job_request.deadline,
            status=JobStatus.PENDING,
            notes=job_request.special_instructions,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Store job
        jobs_db[job.id] = job
        
        # Update provider queue
        best_provider.queue_length += 1
        best_provider.updated_at = datetime.utcnow()
        
        # Schedule provider notification
        background_tasks.add_task(
            notify_provider_new_job,
            best_provider.id,
            job.id
        )
        
        logger.info(f"Dispatched job {job.id} to provider {best_provider.name}")
        
        return {
            "success": True,
            "job_id": job.id,
            "assigned_provider": {
                "id": best_provider.id,
                "name": best_provider.name,
                "contact_email": best_provider.contact_email,
                "estimated_delivery": datetime.utcnow() + timedelta(days=3 + best_provider.queue_length)
            },
            "job_details": {
                "status": job.status.value,
                "priority": job.priority.value,
                "estimated_value": job.estimated_value,
                "deadline": job.deadline.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job dispatch error: {e}")
        raise HTTPException(status_code=500, detail="Job dispatch failed")

@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get job details"""
    try:
        job = jobs_db.get(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        provider_info = None
        if job.provider_id:
            provider = providers_db.get(job.provider_id)
            if provider:
                provider_info = {
                    "id": provider.id,
                    "name": provider.name,
                    "contact_email": provider.contact_email,
                    "location": provider.location,
                    "rating": provider.rating
                }
        
        return JobResponse(
            id=job.id,
            service_order_id=job.service_order_id,
            provider=provider_info,
            status=job.status,
            specifications=job.specifications,
            quantity=job.quantity,
            priority=job.priority,
            estimated_value=job.estimated_value,
            deadline=job.deadline,
            progress={
                "assigned_at": job.assigned_at.isoformat() if job.assigned_at else None,
                "started_at": job.started_at.isoformat() if job.started_at else None,
                "completed_at": job.completed_at.isoformat() if job.completed_at else None,
                "notes": job.notes,
                "tracking_info": job.tracking_info
            },
            created_at=job.created_at,
            updated_at=job.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve job")

@router.get("/jobs/by-service-order/{service_order_id}")
async def get_job_by_service_order(
    service_order_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get job by service order ID"""
    try:
        job = None
        for j in jobs_db.values():
            if j.service_order_id == service_order_id:
                job = j
                break
        
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        provider_info = None
        if job.provider_id:
            provider = providers_db.get(job.provider_id)
            if provider:
                provider_info = {
                    "id": provider.id,
                    "name": provider.name,
                    "location": provider.location,
                    "rating": provider.rating
                }
        
        return {
            "job_id": job.id,
            "status": job.status.value,
            "provider_info": provider_info,
            "tracking_info": job.tracking_info,
            "job_details": {
                "priority": job.priority.value,
                "estimated_value": job.estimated_value,
                "deadline": job.deadline.isoformat(),
                "progress_notes": job.notes
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job retrieval by service order error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve job")

@router.patch("/jobs/{job_id}/status")
async def update_job_status(
    job_id: str,
    update_request: JobUpdateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Update job status (provider endpoint)"""
    try:
        job = jobs_db.get(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Update job status
        old_status = job.status
        job.status = update_request.status
        job.updated_at = datetime.utcnow()
        
        # Update timestamps based on status
        if update_request.status == JobStatus.ACCEPTED and job.assigned_at is None:
            job.assigned_at = datetime.utcnow()
        elif update_request.status == JobStatus.IN_PROGRESS and job.started_at is None:
            job.started_at = datetime.utcnow()
        elif update_request.status == JobStatus.COMPLETED and job.completed_at is None:
            job.completed_at = datetime.utcnow()
            
            # Update provider queue
            if job.provider_id:
                provider = providers_db.get(job.provider_id)
                if provider:
                    provider.queue_length = max(0, provider.queue_length - 1)
                    provider.total_jobs += 1
        
        # Update additional info
        if update_request.progress_notes:
            job.notes = update_request.progress_notes
        if update_request.tracking_info:
            job.tracking_info = update_request.tracking_info
        
        # Notify customer of status change
        background_tasks.add_task(
            notify_customer_job_update,
            job.customer_email,
            job_id,
            old_status.value,
            update_request.status.value
        )
        
        logger.info(f"Updated job {job_id} status: {old_status.value} -> {update_request.status.value}")
        
        return {
            "success": True,
            "message": f"Job status updated to {update_request.status.value}",
            "job": {
                "id": job.id,
                "status": job.status.value,
                "updated_at": job.updated_at.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job status update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update job status")

@router.get("/providers/{provider_id}/jobs")
async def get_provider_jobs(
    provider_id: str,
    status: Optional[JobStatus] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Get jobs for a specific provider"""
    try:
        provider = providers_db.get(provider_id)
        if not provider:
            raise HTTPException(status_code=404, detail="Provider not found")
        
        # Filter jobs for this provider
        provider_jobs = []
        for job in jobs_db.values():
            if job.provider_id == provider_id:
                if status is None or job.status == status:
                    provider_jobs.append({
                        "id": job.id,
                        "service_order_id": job.service_order_id,
                        "customer_email": job.customer_email,
                        "status": job.status.value,
                        "priority": job.priority.value,
                        "quantity": job.quantity,
                        "estimated_value": job.estimated_value,
                        "deadline": job.deadline.isoformat(),
                        "created_at": job.created_at.isoformat(),
                        "specifications": job.specifications
                    })
        
        # Sort by deadline and priority
        provider_jobs.sort(key=lambda j: (j["deadline"], j["priority"]))
        
        return {
            "provider_id": provider_id,
            "total_jobs": len(provider_jobs),
            "jobs": provider_jobs[:limit]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Provider jobs retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve provider jobs")

# Background Tasks

async def notify_provider_new_job(provider_id: str, job_id: str):
    """Notify provider of new job assignment"""
    try:
        provider = providers_db.get(provider_id)
        job = jobs_db.get(job_id)
        
        if provider and job:
            logger.info(f"Notifying provider {provider.name} of new job {job_id}")
            
            # TODO: Send email/webhook notification to provider
            # await email_service.send_new_job_notification(
            #     provider.contact_email, 
            #     job.dict()
            # )
            
    except Exception as e:
        logger.error(f"Provider notification error: {e}")

async def notify_customer_job_update(
    customer_email: str,
    job_id: str,
    old_status: str,
    new_status: str
):
    """Notify customer of job status update"""
    try:
        logger.info(f"Notifying customer {customer_email} of job {job_id} status change: {old_status} -> {new_status}")
        
        # TODO: Send notification to Store service
        # await store_api.notify_service_order_update(job_id, new_status)
        
    except Exception as e:
        logger.error(f"Customer notification error: {e}")

# Initialize some mock providers for development
def initialize_mock_providers():
    """Initialize mock providers for development"""
    mock_providers = [
        ServiceProvider(
            id="provider_1",
            makerspace_id="makerspace_1",
            name="TechMaker Hub",
            contact_email="contact@techmakerhub.com",
            status=ProviderStatus.ACTIVE,
            capabilities=[
                ProviderCapability.PLA_PRINTING,
                ProviderCapability.ABS_PRINTING,
                ProviderCapability.PETG_PRINTING,
                ProviderCapability.HIGH_PRECISION
            ],
            max_build_volume={"x": 220, "y": 220, "z": 250},
            available_materials=["pla", "abs", "petg"],
            quality_levels=["draft", "standard", "high"],
            hourly_rate=25.0,
            setup_fee=5.0,
            rating=4.8,
            total_jobs=156,
            queue_length=2,
            estimated_capacity_hours=40,
            location={"city": "San Francisco", "state": "CA", "country": "USA"},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        ),
        ServiceProvider(
            id="provider_2",
            makerspace_id="makerspace_2",
            name="Rapid Prototypes Inc",
            contact_email="orders@rapidprotos.com",
            status=ProviderStatus.ACTIVE,
            capabilities=[
                ProviderCapability.PLA_PRINTING,
                ProviderCapability.ABS_PRINTING,
                ProviderCapability.TPU_PRINTING,
                ProviderCapability.LARGE_FORMAT,
                ProviderCapability.POST_PROCESSING
            ],
            max_build_volume={"x": 300, "y": 300, "z": 400},
            available_materials=["pla", "abs", "tpu", "wood_pla"],
            quality_levels=["draft", "standard", "high", "ultra"],
            hourly_rate=30.0,
            setup_fee=8.0,
            rating=4.6,
            total_jobs=89,
            queue_length=5,
            estimated_capacity_hours=35,
            location={"city": "Austin", "state": "TX", "country": "USA"},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    ]
    
    for provider in mock_providers:
        providers_db[provider.id] = provider

# Initialize mock data on module load
initialize_mock_providers()
