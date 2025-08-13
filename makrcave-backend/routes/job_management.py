from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import and_, or_, desc, asc, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import json
import hashlib
import os
from pathlib import Path

from ..database import get_db
from ..dependencies import get_current_user, get_current_user_optional
from ..models.job_management import (
    ServiceJob, ServiceJobFile, JobStatusUpdate, JobMaterialUsage, 
    JobTimeLog, JobQualityCheck, ServiceProvider, ProviderEquipment, JobTemplate,
    JobStatus, JobPriority, JobType, FilamentType
)
from ..schemas.job_management import (
    ServiceJobCreate, ServiceJobUpdate, ServiceJobResponse, ServiceJobFileUpload,
    ServiceJobFileResponse, JobStatusUpdateCreate, JobStatusUpdateResponse,
    JobMaterialUsageCreate, JobMaterialUsageResponse, JobTimeLogCreate,
    JobQualityCheckCreate, ServiceProviderCreate, ServiceProviderUpdate,
    ServiceProviderResponse, ProviderEquipmentCreate, JobTemplateCreate,
    JobDashboardStats, JobAnalytics, JobSearchFilters, JobListResponse,
    GCodeAnalysisResult, ModelAnalysisResult
)

router = APIRouter(prefix="/api/v1/jobs", tags=["job-management"])

# Job Management Routes

@router.post("/", response_model=ServiceJobResponse)
async def create_service_job(
    job: ServiceJobCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new service job"""
    try:
        # Generate unique job ID
        job_id = f"job_{uuid.uuid4().hex[:12]}"
        
        # Create job instance
        db_job = ServiceJob(
            job_id=job_id,
            external_order_id=job.external_order_id,
            source=job.source,
            title=job.title,
            description=job.description,
            job_type=job.job_type,
            priority=job.priority,
            customer_id=current_user.get("user_id"),
            customer_name=job.customer_name or current_user.get("name"),
            customer_email=job.customer_email or current_user.get("email"),
            customer_phone=job.customer_phone,
            customer_notes=job.customer_notes,
            quantity=job.quantity,
            material_type=job.material_type,
            material_color=job.material_color,
            material_brand=job.material_brand,
            layer_height=job.layer_height,
            infill_percentage=job.infill_percentage,
            infill_pattern=job.infill_pattern,
            quality_level=job.quality_level,
            supports_required=job.supports_required,
            support_type=job.support_type,
            nozzle_temperature=job.nozzle_temperature,
            bed_temperature=job.bed_temperature,
            print_speed=job.print_speed,
            special_requirements=job.special_requirements,
            post_processing_required=job.post_processing_required,
            post_processing_notes=job.post_processing_notes,
            finishing_requirements=job.finishing_requirements,
            quality_requirements=job.quality_requirements,
            dimensional_tolerance=job.dimensional_tolerance,
            surface_finish_requirements=job.surface_finish_requirements,
            functional_requirements=job.functional_requirements,
            delivery_method=job.delivery_method,
            delivery_address=job.delivery_address,
            deadline=job.deadline
        )
        
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        
        # Create initial status update
        status_update = JobStatusUpdate(
            job_id=job_id,
            new_status=JobStatus.PENDING,
            update_message="Job created and ready for assignment",
            updated_by=current_user.get("user_id"),
            is_customer_visible=True
        )
        db.add(status_update)
        db.commit()
        
        return db_job
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create service job: {str(e)}"
        )

@router.get("/", response_model=JobListResponse)
async def list_service_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    filters: JobSearchFilters = Depends(),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List service jobs with filtering and pagination"""
    try:
        # Build query with filters
        query = db.query(ServiceJob)
        
        # Apply filters
        if filters.status:
            query = query.filter(ServiceJob.status.in_(filters.status))
        
        if filters.priority:
            query = query.filter(ServiceJob.priority.in_(filters.priority))
            
        if filters.job_type:
            query = query.filter(ServiceJob.job_type.in_(filters.job_type))
            
        if filters.material_type:
            query = query.filter(ServiceJob.material_type.in_(filters.material_type))
            
        if filters.assigned_provider_id:
            query = query.filter(ServiceJob.assigned_provider_id == filters.assigned_provider_id)
            
        if filters.assigned_makerspace_id:
            query = query.filter(ServiceJob.assigned_makerspace_id == filters.assigned_makerspace_id)
            
        if filters.customer_email:
            query = query.filter(ServiceJob.customer_email.ilike(f"%{filters.customer_email}%"))
            
        if filters.created_after:
            query = query.filter(ServiceJob.created_at >= filters.created_after)
            
        if filters.created_before:
            query = query.filter(ServiceJob.created_at <= filters.created_before)
            
        if filters.deadline_after:
            query = query.filter(ServiceJob.deadline >= filters.deadline_after)
            
        if filters.deadline_before:
            query = query.filter(ServiceJob.deadline <= filters.deadline_before)
            
        if filters.min_value:
            query = query.filter(
                or_(
                    ServiceJob.quoted_price >= filters.min_value,
                    ServiceJob.final_price >= filters.min_value
                )
            )
            
        if filters.max_value:
            query = query.filter(
                or_(
                    ServiceJob.quoted_price <= filters.max_value,
                    ServiceJob.final_price <= filters.max_value
                )
            )
            
        if filters.search_query:
            search_term = f"%{filters.search_query}%"
            query = query.filter(
                or_(
                    ServiceJob.title.ilike(search_term),
                    ServiceJob.description.ilike(search_term),
                    ServiceJob.customer_name.ilike(search_term)
                )
            )
        
        # User-based filtering (role-based access control)
        user_role = current_user.get("role", "user")
        user_id = current_user.get("user_id")
        
        if user_role not in ["super_admin", "makerspace_admin"]:
            # Regular users can only see their own jobs or jobs assigned to them
            query = query.filter(
                or_(
                    ServiceJob.customer_id == user_id,
                    ServiceJob.assigned_provider_id == user_id
                )
            )
        
        # Count total results
        total_count = query.count()
        
        # Apply pagination and ordering
        offset = (page - 1) * page_size
        jobs = query.order_by(desc(ServiceJob.created_at)).offset(offset).limit(page_size).all()
        
        # Calculate pagination info
        total_pages = (total_count + page_size - 1) // page_size
        has_next = page < total_pages
        has_previous = page > 1
        
        return JobListResponse(
            jobs=jobs,
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
            detail=f"Failed to fetch jobs: {str(e)}"
        )

@router.get("/{job_id}", response_model=ServiceJobResponse)
async def get_service_job(
    job_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific service job by ID"""
    job = db.query(ServiceJob).filter(ServiceJob.job_id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check access permissions
    user_role = current_user.get("role", "user")
    user_id = current_user.get("user_id")
    
    if user_role not in ["super_admin", "makerspace_admin"]:
        if job.customer_id != user_id and job.assigned_provider_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this job"
            )
    
    return job

@router.put("/{job_id}", response_model=ServiceJobResponse)
async def update_service_job(
    job_id: str,
    job_update: ServiceJobUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a service job"""
    job = db.query(ServiceJob).filter(ServiceJob.job_id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check permissions
    user_role = current_user.get("role", "user")
    user_id = current_user.get("user_id")
    
    can_edit = (
        user_role in ["super_admin", "makerspace_admin"] or
        job.customer_id == user_id or
        job.assigned_provider_id == user_id
    )
    
    if not can_edit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this job"
        )
    
    try:
        # Track status changes
        old_status = job.status
        
        # Update fields
        update_data = job_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(job, field, value)
        
        job.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(job)
        
        # Create status update if status changed
        if job_update.status and job_update.status != old_status:
            status_update = JobStatusUpdate(
                job_id=job_id,
                previous_status=old_status,
                new_status=job_update.status,
                update_message=f"Status changed from {old_status.value} to {job_update.status.value}",
                updated_by=user_id,
                is_customer_visible=True
            )
            db.add(status_update)
            db.commit()
        
        return job
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update job: {str(e)}"
        )

@router.delete("/{job_id}")
async def delete_service_job(
    job_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a service job (admin only)"""
    user_role = current_user.get("role", "user")
    
    if user_role not in ["super_admin", "makerspace_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete jobs"
        )
    
    job = db.query(ServiceJob).filter(ServiceJob.job_id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    try:
        db.delete(job)
        db.commit()
        return {"message": "Job deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete job: {str(e)}"
        )

# File Management Routes

@router.post("/{job_id}/files", response_model=ServiceJobFileResponse)
async def upload_job_file(
    job_id: str,
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    is_primary: bool = Form(False),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a file for a service job"""
    job = db.query(ServiceJob).filter(ServiceJob.job_id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check permissions
    user_role = current_user.get("role", "user")
    user_id = current_user.get("user_id")
    
    can_upload = (
        user_role in ["super_admin", "makerspace_admin"] or
        job.customer_id == user_id or
        job.assigned_provider_id == user_id
    )
    
    if not can_upload:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to upload files for this job"
        )
    
    try:
        # Read file content
        file_content = await file.read()
        file_hash = hashlib.sha256(file_content).hexdigest()
        
        # Determine file type
        file_extension = Path(file.filename).suffix.lower()
        is_gcode = file_extension in ['.gcode', '.g', '.gco']
        
        # Create upload directory if it doesn't exist
        upload_dir = Path("uploads/job_files")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        unique_filename = f"{job_id}_{uuid.uuid4().hex[:8]}_{file.filename}"
        file_path = upload_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Analyze file if it's a 3D model or G-code
        gcode_metadata = None
        model_analysis = None
        
        if is_gcode:
            gcode_metadata = analyze_gcode(file_content.decode('utf-8', errors='ignore'))
        elif file_extension in ['.stl', '.obj', '.3mf']:
            model_analysis = analyze_3d_model(file_path)
        
        # Create file record
        db_file = ServiceJobFile(
            job_id=job_id,
            filename=unique_filename,
            original_filename=file.filename,
            file_type=file_extension[1:] if file_extension else "unknown",
            file_size=len(file_content),
            file_url=str(file_path),
            file_hash=file_hash,
            is_primary=is_primary,
            description=description,
            is_gcode=is_gcode,
            gcode_metadata=gcode_metadata,
            uploaded_by=user_id,
            processing_status="completed"
        )
        
        # Add model analysis data if available
        if model_analysis:
            db_file.model_volume = model_analysis.get('volume_cubic_mm')
            db_file.model_surface_area = model_analysis.get('surface_area_square_mm')
            db_file.model_bounding_box = model_analysis.get('bounding_box')
            db_file.model_complexity_score = model_analysis.get('complexity_score')
            db_file.requires_supports = model_analysis.get('requires_supports')
        
        # Add G-code analysis data if available
        if gcode_metadata:
            db_file.layer_count = gcode_metadata.get('layer_count')
            db_file.estimated_print_time_gcode = gcode_metadata.get('estimated_print_time_minutes')
            db_file.estimated_material_usage_gcode = gcode_metadata.get('estimated_material_weight_grams')
        
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        return db_file
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

@router.get("/{job_id}/files", response_model=List[ServiceJobFileResponse])
async def list_job_files(
    job_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List files for a service job"""
    job = db.query(ServiceJob).filter(ServiceJob.job_id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check permissions
    user_role = current_user.get("role", "user")
    user_id = current_user.get("user_id")
    
    can_view = (
        user_role in ["super_admin", "makerspace_admin"] or
        job.customer_id == user_id or
        job.assigned_provider_id == user_id
    )
    
    if not can_view:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view files for this job"
        )
    
    files = db.query(ServiceJobFile).filter(
        ServiceJobFile.job_id == job_id
    ).order_by(desc(ServiceJobFile.uploaded_at)).all()
    
    return files

# Status Update Routes

@router.post("/{job_id}/status", response_model=JobStatusUpdateResponse)
async def create_status_update(
    job_id: str,
    status_update: JobStatusUpdateCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a status update for a job"""
    job = db.query(ServiceJob).filter(ServiceJob.job_id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check permissions
    user_role = current_user.get("role", "user")
    user_id = current_user.get("user_id")
    
    can_update = (
        user_role in ["super_admin", "makerspace_admin"] or
        job.assigned_provider_id == user_id
    )
    
    if not can_update:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this job status"
        )
    
    try:
        # Get previous status
        previous_status = job.status
        
        # Create status update
        db_status_update = JobStatusUpdate(
            job_id=job_id,
            previous_status=previous_status,
            new_status=status_update.new_status,
            update_message=status_update.update_message,
            update_type=status_update.update_type,
            completion_percentage=status_update.completion_percentage,
            milestone_reached=status_update.milestone_reached,
            estimated_time_remaining=status_update.estimated_time_remaining,
            updated_by=user_id,
            is_customer_visible=status_update.is_customer_visible
        )
        
        # Update job status
        job.status = status_update.new_status
        job.updated_at = datetime.utcnow()
        
        # Update timing fields based on status
        if status_update.new_status == JobStatus.ACCEPTED:
            job.accepted_at = datetime.utcnow()
        elif status_update.new_status == JobStatus.IN_PROGRESS:
            job.actual_start = datetime.utcnow()
        elif status_update.new_status in [JobStatus.COMPLETED, JobStatus.CANCELLED, JobStatus.FAILED]:
            job.actual_completion = datetime.utcnow()
        
        db.add(db_status_update)
        db.commit()
        db.refresh(db_status_update)
        
        return db_status_update
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create status update: {str(e)}"
        )

@router.get("/{job_id}/status", response_model=List[JobStatusUpdateResponse])
async def list_status_updates(
    job_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List status updates for a job"""
    job = db.query(ServiceJob).filter(ServiceJob.job_id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check permissions
    user_role = current_user.get("role", "user")
    user_id = current_user.get("user_id")
    
    can_view = (
        user_role in ["super_admin", "makerspace_admin"] or
        job.customer_id == user_id or
        job.assigned_provider_id == user_id
    )
    
    if not can_view:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view status updates for this job"
        )
    
    # Filter customer-visible updates for regular customers
    query = db.query(JobStatusUpdate).filter(JobStatusUpdate.job_id == job_id)
    
    if user_role not in ["super_admin", "makerspace_admin"] and job.customer_id == user_id:
        query = query.filter(JobStatusUpdate.is_customer_visible == True)
    
    status_updates = query.order_by(desc(JobStatusUpdate.updated_at)).all()
    
    return status_updates

# Material Usage Routes

@router.post("/{job_id}/materials", response_model=JobMaterialUsageResponse)
async def record_material_usage(
    job_id: str,
    material_usage: JobMaterialUsageCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record material usage for a job"""
    job = db.query(ServiceJob).filter(ServiceJob.job_id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check permissions (providers and admins only)
    user_role = current_user.get("role", "user")
    user_id = current_user.get("user_id")
    
    can_record = (
        user_role in ["super_admin", "makerspace_admin"] or
        job.assigned_provider_id == user_id
    )
    
    if not can_record:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to record material usage for this job"
        )
    
    try:
        db_material_usage = JobMaterialUsage(
            job_id=job_id,
            material_id=material_usage.material_id,
            material_type=material_usage.material_type,
            material_brand=material_usage.material_brand,
            material_color=material_usage.material_color,
            material_batch=material_usage.material_batch,
            estimated_weight=material_usage.estimated_weight,
            actual_weight=material_usage.actual_weight,
            estimated_length=material_usage.estimated_length,
            actual_length=material_usage.actual_length,
            estimated_volume=material_usage.estimated_volume,
            actual_volume=material_usage.actual_volume,
            cost_per_gram=material_usage.cost_per_gram,
            estimated_material_cost=material_usage.estimated_material_cost,
            actual_material_cost=material_usage.actual_material_cost,
            usage_method=material_usage.usage_method,
            material_performance_notes=material_usage.material_performance_notes,
            material_quality_rating=material_usage.material_quality_rating,
            recorded_by=user_id
        )
        
        db.add(db_material_usage)
        db.commit()
        db.refresh(db_material_usage)
        
        return db_material_usage
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record material usage: {str(e)}"
        )

# Dashboard and Analytics Routes

@router.get("/dashboard/stats", response_model=JobDashboardStats)
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get job dashboard statistics"""
    user_role = current_user.get("role", "user")
    user_id = current_user.get("user_id")
    
    # Build base query with user filtering
    base_query = db.query(ServiceJob)
    
    if user_role not in ["super_admin", "makerspace_admin"]:
        base_query = base_query.filter(
            or_(
                ServiceJob.customer_id == user_id,
                ServiceJob.assigned_provider_id == user_id
            )
        )
    
    try:
        # Total jobs
        total_jobs = base_query.count()
        
        # Jobs by status
        status_counts = {}
        for status in JobStatus:
            count = base_query.filter(ServiceJob.status == status).count()
            status_counts[status.value] = count
        
        # Jobs by priority
        priority_counts = {}
        for priority in JobPriority:
            count = base_query.filter(ServiceJob.priority == priority).count()
            priority_counts[priority.value] = count
        
        # Jobs by type
        type_counts = {}
        for job_type in JobType:
            count = base_query.filter(ServiceJob.job_type == job_type).count()
            type_counts[job_type.value] = count
        
        # Active jobs (in progress statuses)
        active_statuses = [JobStatus.ACCEPTED, JobStatus.IN_PROGRESS, JobStatus.PRINTING, JobStatus.POST_PROCESSING]
        active_jobs = base_query.filter(ServiceJob.status.in_(active_statuses)).count()
        
        # Pending jobs
        pending_jobs = base_query.filter(ServiceJob.status == JobStatus.PENDING).count()
        
        # Completed today
        today = datetime.utcnow().date()
        completed_today = base_query.filter(
            and_(
                ServiceJob.status == JobStatus.COMPLETED,
                func.date(ServiceJob.actual_completion) == today
            )
        ).count()
        
        # Average completion time (for completed jobs in last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        completed_jobs = base_query.filter(
            and_(
                ServiceJob.status == JobStatus.COMPLETED,
                ServiceJob.actual_completion >= thirty_days_ago,
                ServiceJob.actual_start.isnot(None)
            )
        ).all()
        
        average_completion_time = None
        if completed_jobs:
            total_time = sum([
                (job.actual_completion - job.actual_start).total_seconds() / 86400  # days
                for job in completed_jobs
                if job.actual_completion and job.actual_start
            ])
            average_completion_time = total_time / len(completed_jobs)
        
        # Material usage today (simplified)
        material_usage_today = {}
        for material_type in FilamentType:
            usage = db.query(func.sum(JobMaterialUsage.actual_weight)).filter(
                and_(
                    JobMaterialUsage.material_type == material_type,
                    func.date(JobMaterialUsage.recorded_at) == today
                )
            ).scalar() or 0.0
            material_usage_today[material_type.value] = usage
        
        # Revenue calculations
        revenue_today = db.query(func.sum(ServiceJob.final_price)).filter(
            and_(
                ServiceJob.status == JobStatus.COMPLETED,
                func.date(ServiceJob.actual_completion) == today
            )
        ).scalar() or 0.0
        
        # Revenue this month
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        revenue_this_month = db.query(func.sum(ServiceJob.final_price)).filter(
            and_(
                ServiceJob.status == JobStatus.COMPLETED,
                ServiceJob.actual_completion >= month_start
            )
        ).scalar() or 0.0
        
        return JobDashboardStats(
            total_jobs=total_jobs,
            jobs_by_status=status_counts,
            jobs_by_priority=priority_counts,
            jobs_by_type=type_counts,
            pending_jobs=pending_jobs,
            active_jobs=active_jobs,
            completed_today=completed_today,
            average_completion_time=average_completion_time,
            material_usage_today=material_usage_today,
            revenue_today=revenue_today,
            revenue_this_month=revenue_this_month
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard stats: {str(e)}"
        )

# Service Provider Routes

@router.post("/providers", response_model=ServiceProviderResponse)
async def create_service_provider(
    provider: ServiceProviderCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new service provider profile"""
    user_id = current_user.get("user_id")
    
    # Check if user already has a provider profile
    existing_provider = db.query(ServiceProvider).filter(
        ServiceProvider.user_id == user_id
    ).first()
    
    if existing_provider:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a service provider profile"
        )
    
    try:
        provider_id = f"provider_{uuid.uuid4().hex[:12]}"
        
        db_provider = ServiceProvider(
            provider_id=provider_id,
            user_id=user_id,
            business_name=provider.business_name,
            display_name=provider.display_name,
            description=provider.description,
            contact_email=provider.contact_email,
            contact_phone=provider.contact_phone,
            website_url=provider.website_url,
            services_offered=provider.services_offered,
            equipment_available=provider.equipment_available,
            materials_supported=provider.materials_supported,
            max_build_volume=provider.max_build_volume,
            quality_levels=provider.quality_levels,
            minimum_order_value=provider.minimum_order_value,
            maximum_concurrent_jobs=provider.maximum_concurrent_jobs,
            turnaround_time_days=provider.turnaround_time_days,
            base_hourly_rate=provider.base_hourly_rate,
            material_markup_percentage=provider.material_markup_percentage,
            rush_order_multiplier=provider.rush_order_multiplier,
            service_area=provider.service_area,
            shipping_methods=provider.shipping_methods,
            pickup_available=provider.pickup_available,
            delivery_available=provider.delivery_available,
            operating_hours=provider.operating_hours,
            time_zone=provider.time_zone
        )
        
        db.add(db_provider)
        db.commit()
        db.refresh(db_provider)
        
        return db_provider
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create service provider: {str(e)}"
        )

# Utility functions for file analysis

def analyze_gcode(gcode_content: str) -> Dict[str, Any]:
    """Analyze G-code file for metadata"""
    lines = gcode_content.split('\n')
    metadata = {
        'layer_count': 0,
        'estimated_print_time_minutes': 0,
        'estimated_material_weight_grams': 0.0,
        'nozzle_temperature': None,
        'bed_temperature': None,
        'infill_percentage': None,
        'supports_detected': False
    }
    
    try:
        for line in lines:
            line = line.strip()
            
            # Count layer changes
            if line.startswith(';LAYER:') or line.startswith('; layer '):
                metadata['layer_count'] += 1
            
            # Look for time estimates in comments
            if 'time' in line.lower() and any(unit in line.lower() for unit in ['h', 'm', 's', 'hour', 'minute']):
                # Simple time parsing - this could be enhanced
                if 'minute' in line.lower() or 'm' in line.lower():
                    import re
                    time_match = re.search(r'(\d+(?:\.\d+)?)', line)
                    if time_match:
                        metadata['estimated_print_time_minutes'] = float(time_match.group(1))
            
            # Look for material usage
            if 'material' in line.lower() and any(unit in line.lower() for unit in ['g', 'gram', 'kg']):
                import re
                weight_match = re.search(r'(\d+(?:\.\d+)?)', line)
                if weight_match:
                    metadata['estimated_material_weight_grams'] = float(weight_match.group(1))
            
            # Look for temperatures
            if line.startswith('M104') or line.startswith('M109'):  # Nozzle temperature
                import re
                temp_match = re.search(r'S(\d+)', line)
                if temp_match:
                    metadata['nozzle_temperature'] = int(temp_match.group(1))
            
            if line.startswith('M140') or line.startswith('M190'):  # Bed temperature
                import re
                temp_match = re.search(r'S(\d+)', line)
                if temp_match:
                    metadata['bed_temperature'] = int(temp_match.group(1))
            
            # Detect supports
            if 'support' in line.lower():
                metadata['supports_detected'] = True
        
    except Exception:
        pass  # Continue with partial data if parsing fails
    
    return metadata

def analyze_3d_model(file_path: Path) -> Dict[str, Any]:
    """Analyze 3D model file for metadata"""
    # This is a simplified implementation
    # In practice, you'd use libraries like numpy-stl, trimesh, or FreeCAD
    
    analysis = {
        'volume_cubic_mm': 1000.0,  # Placeholder
        'surface_area_square_mm': 500.0,  # Placeholder
        'bounding_box': {'x': 100.0, 'y': 100.0, 'z': 50.0},  # Placeholder
        'complexity_score': 50.0,  # Placeholder (0-100)
        'requires_supports': False  # Placeholder
    }
    
    # For STL files, you could use:
    # import numpy as np
    # from stl import mesh
    # 
    # if file_path.suffix.lower() == '.stl':
    #     your_mesh = mesh.Mesh.from_file(str(file_path))
    #     volume, cog, inertia = your_mesh.get_mass_properties()
    #     analysis['volume_cubic_mm'] = volume
    #     # ... more analysis
    
    return analysis
