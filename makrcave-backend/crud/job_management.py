from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from ..models.job_management import (
    ServiceJob, ServiceJobFile, JobStatusUpdate, JobMaterialUsage,
    JobTimeLog, JobQualityCheck, ServiceProvider, ProviderEquipment,
    JobTemplate, JobStatus, JobPriority, JobType, FilamentType
)
from ..schemas.job_management import (
    ServiceJobCreate, ServiceJobUpdate, ServiceJobFileUpload,
    JobStatusUpdateCreate, JobMaterialUsageCreate, JobTimeLogCreate,
    JobQualityCheckCreate, ServiceProviderCreate, ServiceProviderUpdate,
    ProviderEquipmentCreate, JobTemplateCreate, JobSearchFilters
)

# Service Job CRUD
def get_service_job(db: Session, job_id: str) -> Optional[ServiceJob]:
    """Get a service job by ID"""
    return db.query(ServiceJob).filter(ServiceJob.job_id == job_id).first()

def get_service_jobs(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    filters: Optional[JobSearchFilters] = None,
    user_id: Optional[str] = None,
    user_role: Optional[str] = None
) -> List[ServiceJob]:
    """Get service jobs with filtering and pagination"""
    query = db.query(ServiceJob)
    
    # Apply user-based filtering
    if user_role not in ["super_admin", "makerspace_admin"]:
        query = query.filter(
            or_(
                ServiceJob.customer_id == user_id,
                ServiceJob.assigned_provider_id == user_id
            )
        )
    
    # Apply filters if provided
    if filters:
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
    
    return query.order_by(desc(ServiceJob.created_at)).offset(skip).limit(limit).all()

def create_service_job(db: Session, job: ServiceJobCreate, job_id: str, customer_id: str) -> ServiceJob:
    """Create a new service job"""
    db_job = ServiceJob(
        job_id=job_id,
        external_order_id=job.external_order_id,
        source=job.source,
        title=job.title,
        description=job.description,
        job_type=job.job_type,
        priority=job.priority,
        customer_id=customer_id,
        customer_name=job.customer_name,
        customer_email=job.customer_email,
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
    return db_job

def update_service_job(db: Session, job_id: str, job_update: ServiceJobUpdate) -> Optional[ServiceJob]:
    """Update a service job"""
    db_job = get_service_job(db, job_id)
    if not db_job:
        return None
    
    update_data = job_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_job, field, value)
    
    db_job.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_job)
    return db_job

def delete_service_job(db: Session, job_id: str) -> bool:
    """Delete a service job"""
    db_job = get_service_job(db, job_id)
    if not db_job:
        return False
    
    db.delete(db_job)
    db.commit()
    return True

def get_jobs_count(
    db: Session,
    filters: Optional[JobSearchFilters] = None,
    user_id: Optional[str] = None,
    user_role: Optional[str] = None
) -> int:
    """Get total count of jobs matching filters"""
    query = db.query(ServiceJob)
    
    # Apply user-based filtering
    if user_role not in ["super_admin", "makerspace_admin"]:
        query = query.filter(
            or_(
                ServiceJob.customer_id == user_id,
                ServiceJob.assigned_provider_id == user_id
            )
        )
    
    # Apply filters if provided (same logic as get_service_jobs)
    if filters:
        if filters.status:
            query = query.filter(ServiceJob.status.in_(filters.status))
        
        if filters.priority:
            query = query.filter(ServiceJob.priority.in_(filters.priority))
            
        if filters.job_type:
            query = query.filter(ServiceJob.job_type.in_(filters.job_type))
            
        if filters.search_query:
            search_term = f"%{filters.search_query}%"
            query = query.filter(
                or_(
                    ServiceJob.title.ilike(search_term),
                    ServiceJob.description.ilike(search_term),
                    ServiceJob.customer_name.ilike(search_term)
                )
            )
    
    return query.count()

# Job File CRUD
def get_job_files(db: Session, job_id: str) -> List[ServiceJobFile]:
    """Get all files for a job"""
    return db.query(ServiceJobFile).filter(
        ServiceJobFile.job_id == job_id
    ).order_by(desc(ServiceJobFile.uploaded_at)).all()

def create_job_file(db: Session, job_id: str, file_data: ServiceJobFileUpload, uploaded_by: str) -> ServiceJobFile:
    """Create a new job file"""
    db_file = ServiceJobFile(
        job_id=job_id,
        filename=file_data.filename,
        original_filename=file_data.original_filename,
        file_type=file_data.file_type,
        file_size=file_data.file_size,
        file_url=file_data.file_url,
        file_hash=file_data.file_hash,
        is_primary=file_data.is_primary,
        description=file_data.description,
        version=file_data.version,
        is_gcode=file_data.is_gcode,
        gcode_metadata=file_data.gcode_metadata,
        layer_count=file_data.layer_count,
        estimated_print_time_gcode=file_data.estimated_print_time_gcode,
        estimated_material_usage_gcode=file_data.estimated_material_usage_gcode,
        model_volume=file_data.model_volume,
        model_surface_area=file_data.model_surface_area,
        model_bounding_box=file_data.model_bounding_box,
        model_complexity_score=file_data.model_complexity_score,
        requires_supports=file_data.requires_supports,
        uploaded_by=uploaded_by
    )
    
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file

# Status Update CRUD
def get_job_status_updates(db: Session, job_id: str, customer_visible_only: bool = False) -> List[JobStatusUpdate]:
    """Get status updates for a job"""
    query = db.query(JobStatusUpdate).filter(JobStatusUpdate.job_id == job_id)
    
    if customer_visible_only:
        query = query.filter(JobStatusUpdate.is_customer_visible == True)
    
    return query.order_by(desc(JobStatusUpdate.updated_at)).all()

def create_status_update(
    db: Session,
    job_id: str,
    status_update: JobStatusUpdateCreate,
    updated_by: str,
    previous_status: Optional[JobStatus] = None
) -> JobStatusUpdate:
    """Create a new status update"""
    db_status_update = JobStatusUpdate(
        job_id=job_id,
        previous_status=previous_status,
        new_status=status_update.new_status,
        update_message=status_update.update_message,
        update_type=status_update.update_type,
        completion_percentage=status_update.completion_percentage,
        milestone_reached=status_update.milestone_reached,
        estimated_time_remaining=status_update.estimated_time_remaining,
        updated_by=updated_by,
        is_customer_visible=status_update.is_customer_visible
    )
    
    db.add(db_status_update)
    db.commit()
    db.refresh(db_status_update)
    return db_status_update

# Material Usage CRUD
def get_job_material_usage(db: Session, job_id: str) -> List[JobMaterialUsage]:
    """Get material usage records for a job"""
    return db.query(JobMaterialUsage).filter(
        JobMaterialUsage.job_id == job_id
    ).order_by(desc(JobMaterialUsage.recorded_at)).all()

def create_material_usage(
    db: Session,
    job_id: str,
    material_usage: JobMaterialUsageCreate,
    recorded_by: str
) -> JobMaterialUsage:
    """Create a new material usage record"""
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
        recorded_by=recorded_by
    )
    
    db.add(db_material_usage)
    db.commit()
    db.refresh(db_material_usage)
    return db_material_usage

# Service Provider CRUD
def get_service_provider(db: Session, provider_id: str) -> Optional[ServiceProvider]:
    """Get a service provider by ID"""
    return db.query(ServiceProvider).filter(ServiceProvider.provider_id == provider_id).first()

def get_service_provider_by_user(db: Session, user_id: str) -> Optional[ServiceProvider]:
    """Get a service provider by user ID"""
    return db.query(ServiceProvider).filter(ServiceProvider.user_id == user_id).first()

def create_service_provider(
    db: Session,
    provider: ServiceProviderCreate,
    provider_id: str,
    user_id: str
) -> ServiceProvider:
    """Create a new service provider"""
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

def update_service_provider(
    db: Session,
    provider_id: str,
    provider_update: ServiceProviderUpdate
) -> Optional[ServiceProvider]:
    """Update a service provider"""
    db_provider = get_service_provider(db, provider_id)
    if not db_provider:
        return None
    
    update_data = provider_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_provider, field, value)
    
    db_provider.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_provider)
    return db_provider

# Provider Equipment CRUD
def get_provider_equipment(db: Session, provider_id: str) -> List[ProviderEquipment]:
    """Get all equipment for a provider"""
    return db.query(ProviderEquipment).filter(
        ProviderEquipment.provider_id == provider_id
    ).order_by(desc(ProviderEquipment.created_at)).all()

def create_provider_equipment(
    db: Session,
    provider_id: str,
    equipment: ProviderEquipmentCreate
) -> ProviderEquipment:
    """Create new provider equipment"""
    db_equipment = ProviderEquipment(
        provider_id=provider_id,
        equipment_type=equipment.equipment_type,
        brand=equipment.brand,
        model=equipment.model,
        name=equipment.name,
        build_volume=equipment.build_volume,
        layer_resolution=equipment.layer_resolution,
        materials_supported=equipment.materials_supported,
        max_temperature=equipment.max_temperature,
        software_used=equipment.software_used,
        is_active=equipment.is_active,
        is_available=equipment.is_available,
        maintenance_due=equipment.maintenance_due,
        last_maintenance=equipment.last_maintenance
    )
    
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

# Dashboard and Analytics Functions
def get_job_dashboard_stats(
    db: Session,
    user_id: Optional[str] = None,
    user_role: Optional[str] = None
) -> Dict[str, Any]:
    """Get job dashboard statistics"""
    base_query = db.query(ServiceJob)
    
    # Apply user filtering for non-admin users
    if user_role not in ["super_admin", "makerspace_admin"]:
        base_query = base_query.filter(
            or_(
                ServiceJob.customer_id == user_id,
                ServiceJob.assigned_provider_id == user_id
            )
        )
    
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
    
    # Average completion time calculation
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
    
    return {
        "total_jobs": total_jobs,
        "jobs_by_status": status_counts,
        "jobs_by_priority": priority_counts,
        "jobs_by_type": type_counts,
        "pending_jobs": pending_jobs,
        "active_jobs": active_jobs,
        "completed_today": completed_today,
        "average_completion_time": average_completion_time,
        "material_usage_today": material_usage_today,
        "revenue_today": revenue_today,
        "revenue_this_month": revenue_this_month
    }

def get_provider_stats(db: Session, provider_id: str) -> Dict[str, Any]:
    """Get statistics for a specific service provider"""
    provider_query = db.query(ServiceJob).filter(ServiceJob.assigned_provider_id == provider_id)
    
    # Active jobs
    active_statuses = [JobStatus.ACCEPTED, JobStatus.IN_PROGRESS, JobStatus.PRINTING, JobStatus.POST_PROCESSING]
    active_jobs = provider_query.filter(ServiceJob.status.in_(active_statuses)).count()
    
    # Pending jobs
    pending_jobs = provider_query.filter(ServiceJob.status == JobStatus.PENDING).count()
    
    # Completed this month
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    completed_this_month = provider_query.filter(
        and_(
            ServiceJob.status == JobStatus.COMPLETED,
            ServiceJob.actual_completion >= month_start
        )
    ).count()
    
    # Revenue this month
    revenue_this_month = db.query(func.sum(ServiceJob.final_price)).filter(
        and_(
            ServiceJob.assigned_provider_id == provider_id,
            ServiceJob.status == JobStatus.COMPLETED,
            ServiceJob.actual_completion >= month_start
        )
    ).scalar() or 0.0
    
    # Average job value
    completed_jobs = provider_query.filter(ServiceJob.status == JobStatus.COMPLETED).all()
    average_job_value = 0.0
    if completed_jobs:
        total_value = sum([job.final_price or 0 for job in completed_jobs])
        average_job_value = total_value / len(completed_jobs)
    
    # Equipment utilization (simplified)
    utilization_rate = min(75.0 + (active_jobs * 5), 100.0)  # Simplified calculation
    
    # Customer satisfaction (from completed jobs with ratings)
    jobs_with_ratings = [job for job in completed_jobs if job.quality_rating]
    customer_satisfaction = 0.8  # Default
    if jobs_with_ratings:
        avg_rating = sum([job.quality_rating for job in jobs_with_ratings]) / len(jobs_with_ratings)
        customer_satisfaction = avg_rating / 5.0  # Convert to 0-1 scale
    
    # On-time delivery rate
    on_time_jobs = [job for job in completed_jobs if job.deadline and job.actual_completion <= job.deadline]
    on_time_delivery = 0.85  # Default
    if completed_jobs:
        on_time_delivery = len(on_time_jobs) / len(completed_jobs)
    
    return {
        "active_jobs": active_jobs,
        "pending_jobs": pending_jobs,
        "completed_this_month": completed_this_month,
        "revenue_this_month": revenue_this_month,
        "average_job_value": average_job_value,
        "utilization_rate": utilization_rate,
        "customer_satisfaction": customer_satisfaction,
        "on_time_delivery": on_time_delivery
    }
