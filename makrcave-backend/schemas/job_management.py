from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class JobStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    IN_PROGRESS = "in_progress"
    PRINTING = "printing"
    POST_PROCESSING = "post_processing"
    QUALITY_CHECK = "quality_check"
    READY = "ready"
    SHIPPED = "shipped"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"

class JobPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class JobType(str, Enum):
    THREE_D_PRINT = "3d_print"
    LASER_CUT = "laser_cut"
    CNC_MILL = "cnc_mill"
    CUSTOM_SERVICE = "custom_service"

class FilamentType(str, Enum):
    PLA = "pla"
    ABS = "abs"
    PETG = "petg"
    TPU = "tpu"
    ASA = "asa"
    PC = "pc"
    NYLON = "nylon"
    PVA = "pva"
    HIPS = "hips"
    WOOD_FILL = "wood_fill"
    METAL_FILL = "metal_fill"
    CARBON_FIBER = "carbon_fiber"
    CUSTOM = "custom"

class QualityLevel(str, Enum):
    DRAFT = "draft"
    NORMAL = "normal"
    HIGH = "high"
    ULTRA = "ultra"

class InfillPattern(str, Enum):
    GRID = "grid"
    TRIANGULAR = "triangular"
    CUBIC = "cubic"
    GYROID = "gyroid"
    HONEYCOMB = "honeycomb"
    LIGHTNING = "lightning"

class SupportType(str, Enum):
    NONE = "none"
    TOUCHING_BUILD_PLATE = "touching_build_plate"
    EVERYWHERE = "everywhere"
    TREE = "tree"
    CUSTOM = "custom"

# Request/Response Schemas
class ServiceJobCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    job_type: JobType = JobType.THREE_D_PRINT
    priority: JobPriority = JobPriority.NORMAL
    external_order_id: Optional[str] = None
    source: str = "makrx_store"
    
    # Customer information
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_notes: Optional[str] = None
    
    # Technical requirements
    quantity: int = Field(default=1, ge=1, le=1000)
    material_type: Optional[FilamentType] = None
    material_color: Optional[str] = None
    material_brand: Optional[str] = None
    layer_height: Optional[float] = Field(None, ge=0.05, le=1.0)
    infill_percentage: Optional[int] = Field(None, ge=0, le=100)
    infill_pattern: Optional[InfillPattern] = None
    quality_level: Optional[QualityLevel] = None
    supports_required: bool = False
    support_type: Optional[SupportType] = None
    
    # Print settings
    nozzle_temperature: Optional[int] = Field(None, ge=150, le=350)
    bed_temperature: Optional[int] = Field(None, ge=0, le=150)
    print_speed: Optional[int] = Field(None, ge=10, le=300)
    special_requirements: Optional[Dict[str, Any]] = None
    
    # Post-processing
    post_processing_required: bool = False
    post_processing_notes: Optional[str] = None
    finishing_requirements: Optional[Dict[str, Any]] = None
    
    # Quality requirements
    quality_requirements: Optional[str] = None
    dimensional_tolerance: Optional[str] = None
    surface_finish_requirements: Optional[str] = None
    functional_requirements: Optional[str] = None
    
    # Delivery
    delivery_method: str = "pickup"
    delivery_address: Optional[Dict[str, Any]] = None
    deadline: Optional[datetime] = None

class ServiceJobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[JobStatus] = None
    priority: Optional[JobPriority] = None
    assigned_provider_id: Optional[str] = None
    assigned_makerspace_id: Optional[str] = None
    
    # Technical updates
    material_type: Optional[FilamentType] = None
    material_color: Optional[str] = None
    material_brand: Optional[str] = None
    layer_height: Optional[float] = Field(None, ge=0.05, le=1.0)
    infill_percentage: Optional[int] = Field(None, ge=0, le=100)
    infill_pattern: Optional[InfillPattern] = None
    quality_level: Optional[QualityLevel] = None
    
    # Timing updates
    estimated_start: Optional[datetime] = None
    estimated_completion: Optional[datetime] = None
    actual_start: Optional[datetime] = None
    actual_completion: Optional[datetime] = None
    
    # Pricing updates
    quoted_price: Optional[float] = Field(None, ge=0)
    actual_cost: Optional[float] = Field(None, ge=0)
    final_price: Optional[float] = Field(None, ge=0)
    
    # Notes and feedback
    internal_notes: Optional[str] = None
    customer_feedback: Optional[str] = None
    quality_rating: Optional[float] = Field(None, ge=1, le=5)

class ServiceJobFileUpload(BaseModel):
    filename: str = Field(..., min_length=1, max_length=255)
    file_type: str = Field(..., min_length=1, max_length=50)
    file_size: int = Field(..., ge=1)
    file_url: str = Field(..., min_length=1, max_length=500)
    file_hash: Optional[str] = Field(None, max_length=64)
    
    is_primary: bool = False
    description: Optional[str] = None
    version: str = "1.0"
    
    # G-code specific
    is_gcode: bool = False
    gcode_metadata: Optional[Dict[str, Any]] = None
    layer_count: Optional[int] = Field(None, ge=1)
    estimated_print_time_gcode: Optional[int] = Field(None, ge=1)  # minutes
    estimated_material_usage_gcode: Optional[float] = Field(None, ge=0)  # grams
    
    # 3D model analysis
    model_volume: Optional[float] = Field(None, ge=0)  # cubic mm
    model_surface_area: Optional[float] = Field(None, ge=0)  # square mm
    model_bounding_box: Optional[Dict[str, float]] = None  # {x, y, z}
    model_complexity_score: Optional[float] = Field(None, ge=0, le=100)
    requires_supports: Optional[bool] = None

class JobStatusUpdateCreate(BaseModel):
    new_status: JobStatus
    update_message: Optional[str] = None
    update_type: str = "manual"
    completion_percentage: int = Field(default=0, ge=0, le=100)
    milestone_reached: Optional[str] = None
    estimated_time_remaining: Optional[int] = Field(None, ge=0)  # minutes
    is_customer_visible: bool = True

class JobMaterialUsageCreate(BaseModel):
    material_id: Optional[str] = None
    material_type: FilamentType
    material_brand: Optional[str] = None
    material_color: Optional[str] = None
    material_batch: Optional[str] = None
    
    estimated_weight: Optional[float] = Field(None, ge=0)  # grams
    actual_weight: Optional[float] = Field(None, ge=0)  # grams
    estimated_length: Optional[float] = Field(None, ge=0)  # meters
    actual_length: Optional[float] = Field(None, ge=0)  # meters
    estimated_volume: Optional[float] = Field(None, ge=0)  # cubic mm
    actual_volume: Optional[float] = Field(None, ge=0)  # cubic mm
    
    cost_per_gram: Optional[float] = Field(None, ge=0)
    estimated_material_cost: Optional[float] = Field(None, ge=0)
    actual_material_cost: Optional[float] = Field(None, ge=0)
    
    usage_method: str = "manual"
    material_performance_notes: Optional[str] = None
    material_quality_rating: Optional[int] = Field(None, ge=1, le=5)

class JobTimeLogCreate(BaseModel):
    activity_type: str = Field(..., min_length=1, max_length=50)
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=1)
    
    operator_id: Optional[str] = None
    equipment_id: Optional[str] = None
    equipment_name: Optional[str] = None
    
    activity_description: Optional[str] = None
    issues_encountered: Optional[str] = None
    resolution_notes: Optional[str] = None
    
    is_automated: bool = False
    tracking_source: Optional[str] = None

class JobQualityCheckCreate(BaseModel):
    check_type: str = Field(..., min_length=1, max_length=50)
    check_description: str = Field(..., min_length=1)
    check_criteria: Optional[Dict[str, Any]] = None
    
    passed: bool
    score: Optional[float] = Field(None, ge=0, le=100)
    measurements: Optional[Dict[str, Any]] = None
    issues_found: Optional[List[str]] = None
    corrective_actions: Optional[str] = None
    
    inspector_name: str = Field(..., min_length=1, max_length=200)
    inspection_photos: Optional[List[str]] = None
    inspection_notes: Optional[str] = None

class ServiceProviderCreate(BaseModel):
    business_name: Optional[str] = None
    display_name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    contact_email: str = Field(..., regex=r'^[^@]+@[^@]+\.[^@]+$')
    contact_phone: Optional[str] = None
    website_url: Optional[str] = None
    
    services_offered: Optional[List[str]] = None
    equipment_available: Optional[List[Dict[str, Any]]] = None
    materials_supported: Optional[List[str]] = None
    max_build_volume: Optional[Dict[str, float]] = None  # {x, y, z}
    quality_levels: Optional[List[str]] = None
    
    minimum_order_value: Optional[float] = Field(None, ge=0)
    maximum_concurrent_jobs: int = Field(default=10, ge=1, le=100)
    turnaround_time_days: int = Field(default=7, ge=1, le=365)
    
    base_hourly_rate: Optional[float] = Field(None, ge=0)
    material_markup_percentage: float = Field(default=20.0, ge=0, le=1000)
    rush_order_multiplier: float = Field(default=1.5, ge=1.0, le=10.0)
    
    service_area: Optional[Dict[str, Any]] = None
    shipping_methods: Optional[List[str]] = None
    pickup_available: bool = True
    delivery_available: bool = False
    
    operating_hours: Optional[Dict[str, Any]] = None
    time_zone: str = "UTC"

class ServiceProviderUpdate(BaseModel):
    business_name: Optional[str] = None
    display_name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    contact_email: Optional[str] = Field(None, regex=r'^[^@]+@[^@]+\.[^@]+$')
    contact_phone: Optional[str] = None
    website_url: Optional[str] = None
    
    is_active: Optional[bool] = None
    accepts_new_jobs: Optional[bool] = None
    vacation_mode: Optional[bool] = None
    vacation_until: Optional[datetime] = None
    
    minimum_order_value: Optional[float] = Field(None, ge=0)
    maximum_concurrent_jobs: Optional[int] = Field(None, ge=1, le=100)
    turnaround_time_days: Optional[int] = Field(None, ge=1, le=365)
    
    base_hourly_rate: Optional[float] = Field(None, ge=0)
    material_markup_percentage: Optional[float] = Field(None, ge=0, le=1000)
    rush_order_multiplier: Optional[float] = Field(None, ge=1.0, le=10.0)

class ProviderEquipmentCreate(BaseModel):
    equipment_type: str = Field(..., min_length=1, max_length=100)
    brand: Optional[str] = None
    model: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=200)
    
    build_volume: Optional[Dict[str, float]] = None  # {x, y, z}
    layer_resolution: Optional[Dict[str, float]] = None  # {min, max}
    materials_supported: Optional[List[str]] = None
    max_temperature: Optional[Dict[str, int]] = None  # {nozzle, bed}
    software_used: Optional[List[str]] = None
    
    is_active: bool = True
    is_available: bool = True
    maintenance_due: Optional[datetime] = None
    last_maintenance: Optional[datetime] = None

class JobTemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    job_type: JobType
    
    default_settings: Dict[str, Any] = Field(..., min_items=1)
    pricing_template: Optional[Dict[str, Any]] = None
    estimated_time_template: Optional[Dict[str, Any]] = None
    
    is_active: bool = True
    is_public: bool = False

# Response Schemas
class ServiceJobResponse(BaseModel):
    job_id: str
    external_order_id: Optional[str]
    source: str
    title: str
    description: Optional[str]
    job_type: JobType
    status: JobStatus
    priority: JobPriority
    
    customer_name: Optional[str]
    customer_email: Optional[str]
    assigned_provider_id: Optional[str]
    assigned_makerspace_id: Optional[str]
    
    created_at: datetime
    updated_at: datetime
    deadline: Optional[datetime]
    estimated_completion: Optional[datetime]
    actual_completion: Optional[datetime]
    
    quantity: int
    material_type: Optional[FilamentType]
    material_color: Optional[str]
    quality_level: Optional[QualityLevel]
    
    estimated_cost: Optional[float]
    quoted_price: Optional[float]
    final_price: Optional[float]
    
    completion_percentage: int = 0
    
    class Config:
        orm_mode = True

class ServiceJobFileResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    file_url: str
    is_primary: bool
    description: Optional[str]
    version: str
    
    is_gcode: bool
    gcode_metadata: Optional[Dict[str, Any]]
    layer_count: Optional[int]
    estimated_print_time_gcode: Optional[int]
    estimated_material_usage_gcode: Optional[float]
    
    model_volume: Optional[float]
    model_bounding_box: Optional[Dict[str, float]]
    requires_supports: Optional[bool]
    
    uploaded_by: str
    uploaded_at: datetime
    processing_status: str
    
    class Config:
        orm_mode = True

class JobStatusUpdateResponse(BaseModel):
    id: int
    previous_status: Optional[JobStatus]
    new_status: JobStatus
    update_message: Optional[str]
    completion_percentage: int
    milestone_reached: Optional[str]
    estimated_time_remaining: Optional[int]
    
    updated_by: str
    updated_at: datetime
    is_customer_visible: bool
    customer_notified: bool
    
    class Config:
        orm_mode = True

class JobMaterialUsageResponse(BaseModel):
    id: int
    material_type: FilamentType
    material_brand: Optional[str]
    material_color: Optional[str]
    material_batch: Optional[str]
    
    estimated_weight: Optional[float]
    actual_weight: Optional[float]
    estimated_length: Optional[float]
    actual_length: Optional[float]
    
    cost_per_gram: Optional[float]
    estimated_material_cost: Optional[float]
    actual_material_cost: Optional[float]
    
    usage_method: str
    material_quality_rating: Optional[int]
    recorded_by: str
    recorded_at: datetime
    
    class Config:
        orm_mode = True

class ServiceProviderResponse(BaseModel):
    provider_id: str
    business_name: Optional[str]
    display_name: str
    description: Optional[str]
    contact_email: str
    
    services_offered: Optional[List[str]]
    materials_supported: Optional[List[str]]
    max_build_volume: Optional[Dict[str, float]]
    
    is_active: bool
    accepts_new_jobs: bool
    minimum_order_value: Optional[float]
    turnaround_time_days: int
    
    total_jobs_completed: int
    customer_rating: Optional[float]
    on_time_delivery_rate: Optional[float]
    
    is_verified: bool
    verification_level: str
    
    created_at: datetime
    last_active_at: Optional[datetime]
    
    class Config:
        orm_mode = True

class JobDashboardStats(BaseModel):
    total_jobs: int
    jobs_by_status: Dict[str, int]
    jobs_by_priority: Dict[str, int]
    jobs_by_type: Dict[str, int]
    pending_jobs: int
    active_jobs: int
    completed_today: int
    average_completion_time: Optional[float]  # days
    material_usage_today: Dict[str, float]  # material_type: grams
    revenue_today: float
    revenue_this_month: float

class JobAnalytics(BaseModel):
    total_print_time: int  # minutes
    total_material_used: float  # grams
    total_jobs_completed: int
    average_job_value: float
    top_materials: List[Dict[str, Any]]  # material usage statistics
    equipment_utilization: Dict[str, float]  # equipment_id: utilization_percentage
    customer_satisfaction: float  # average rating
    on_time_delivery_rate: float  # percentage

# Search and filtering
class JobSearchFilters(BaseModel):
    status: Optional[List[JobStatus]] = None
    priority: Optional[List[JobPriority]] = None
    job_type: Optional[List[JobType]] = None
    material_type: Optional[List[FilamentType]] = None
    assigned_provider_id: Optional[str] = None
    assigned_makerspace_id: Optional[str] = None
    customer_email: Optional[str] = None
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None
    deadline_after: Optional[datetime] = None
    deadline_before: Optional[datetime] = None
    min_value: Optional[float] = Field(None, ge=0)
    max_value: Optional[float] = Field(None, ge=0)
    search_query: Optional[str] = None  # Search in title, description, customer name

class JobListResponse(BaseModel):
    jobs: List[ServiceJobResponse]
    total_count: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_previous: bool

# File processing schemas
class GCodeAnalysisResult(BaseModel):
    layer_count: int
    estimated_print_time_minutes: int
    estimated_material_weight_grams: float
    estimated_material_length_meters: float
    nozzle_temperature: Optional[int]
    bed_temperature: Optional[int]
    infill_percentage: Optional[int]
    supports_detected: bool
    complexity_score: float
    
class ModelAnalysisResult(BaseModel):
    volume_cubic_mm: float
    surface_area_square_mm: float
    bounding_box: Dict[str, float]  # {x, y, z}
    complexity_score: float
    requires_supports: bool
    estimated_print_time_minutes: int
    wall_thickness_analysis: Dict[str, Any]
    overhang_analysis: Dict[str, Any]
