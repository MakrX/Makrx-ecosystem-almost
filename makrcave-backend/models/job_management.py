from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, Float, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database import Base

class JobStatus(str, enum.Enum):
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

class JobPriority(str, enum.Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class JobType(str, enum.Enum):
    THREE_D_PRINT = "3d_print"
    LASER_CUT = "laser_cut"
    CNC_MILL = "cnc_mill"
    CUSTOM_SERVICE = "custom_service"

class FilamentType(str, enum.Enum):
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

class QualityLevel(str, enum.Enum):
    DRAFT = "draft"
    NORMAL = "normal"
    HIGH = "high"
    ULTRA = "ultra"

class InfillPattern(str, enum.Enum):
    GRID = "grid"
    TRIANGULAR = "triangular"
    CUBIC = "cubic"
    GYROID = "gyroid"
    HONEYCOMB = "honeycomb"
    LIGHTNING = "lightning"

class SupportType(str, enum.Enum):
    NONE = "none"
    TOUCHING_BUILD_PLATE = "touching_build_plate"
    EVERYWHERE = "everywhere"
    TREE = "tree"
    CUSTOM = "custom"

class ServiceJob(Base):
    __tablename__ = "service_jobs"

    # Primary identification
    job_id = Column(String(100), primary_key=True, index=True)
    external_order_id = Column(String(100), nullable=True, index=True)  # MakrX Store order ID
    source = Column(String(50), default="makrx_store")  # makrx_store, direct, walk_in

    # Basic job information
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    job_type = Column(Enum(JobType), nullable=False, default=JobType.THREE_D_PRINT)
    status = Column(Enum(JobStatus), nullable=False, default=JobStatus.PENDING)
    priority = Column(Enum(JobPriority), nullable=False, default=JobPriority.NORMAL)

    # Customer information
    customer_id = Column(String(100), nullable=True, index=True)
    customer_name = Column(String(200), nullable=True)
    customer_email = Column(String(255), nullable=True)
    customer_phone = Column(String(50), nullable=True)
    customer_notes = Column(Text, nullable=True)

    # Service provider assignment
    assigned_provider_id = Column(String(100), nullable=True, index=True)
    assigned_makerspace_id = Column(String(100), nullable=True, index=True)
    assigned_at = Column(DateTime(timezone=True), nullable=True)
    accepted_at = Column(DateTime(timezone=True), nullable=True)

    # Timing and scheduling
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deadline = Column(DateTime(timezone=True), nullable=True)
    estimated_start = Column(DateTime(timezone=True), nullable=True)
    estimated_completion = Column(DateTime(timezone=True), nullable=True)
    actual_start = Column(DateTime(timezone=True), nullable=True)
    actual_completion = Column(DateTime(timezone=True), nullable=True)

    # Pricing and billing
    estimated_cost = Column(Float, nullable=True)
    quoted_price = Column(Float, nullable=True)
    actual_cost = Column(Float, nullable=True)
    final_price = Column(Float, nullable=True)
    currency = Column(String(10), default="USD")

    # Technical requirements for 3D printing
    quantity = Column(Integer, default=1)
    material_type = Column(Enum(FilamentType), nullable=True)
    material_color = Column(String(50), nullable=True)
    material_brand = Column(String(100), nullable=True)
    layer_height = Column(Float, nullable=True)  # in mm
    infill_percentage = Column(Integer, nullable=True)  # 0-100
    infill_pattern = Column(Enum(InfillPattern), nullable=True)
    quality_level = Column(Enum(QualityLevel), nullable=True)
    supports_required = Column(Boolean, default=False)
    support_type = Column(Enum(SupportType), nullable=True)

    # Print settings and requirements
    estimated_print_time = Column(Integer, nullable=True)  # minutes
    estimated_material_weight = Column(Float, nullable=True)  # grams
    estimated_material_length = Column(Float, nullable=True)  # meters
    nozzle_temperature = Column(Integer, nullable=True)  # Celsius
    bed_temperature = Column(Integer, nullable=True)  # Celsius
    print_speed = Column(Integer, nullable=True)  # mm/s
    special_requirements = Column(JSON, nullable=True)  # Additional requirements

    # Post-processing requirements
    post_processing_required = Column(Boolean, default=False)
    post_processing_notes = Column(Text, nullable=True)
    finishing_requirements = Column(JSON, nullable=True)  # sanding, painting, assembly, etc.

    # Quality and inspection
    quality_requirements = Column(Text, nullable=True)
    dimensional_tolerance = Column(String(50), nullable=True)  # e.g., "±0.1mm"
    surface_finish_requirements = Column(String(100), nullable=True)
    functional_requirements = Column(Text, nullable=True)

    # Delivery and shipping
    delivery_method = Column(String(50), default="pickup")  # pickup, ship, deliver
    delivery_address = Column(JSON, nullable=True)
    shipping_cost = Column(Float, nullable=True)
    tracking_number = Column(String(100), nullable=True)

    # Job metadata and notes
    internal_notes = Column(Text, nullable=True)  # Internal provider notes
    customer_feedback = Column(Text, nullable=True)
    completion_photos = Column(JSON, nullable=True)  # URLs to completion photos
    quality_rating = Column(Float, nullable=True)  # 1-5 stars from customer

    # Equipment and resource tracking
    equipment_used = Column(JSON, nullable=True)  # List of equipment IDs used
    total_machine_time = Column(Integer, nullable=True)  # Total machine time in minutes
    operator_time = Column(Integer, nullable=True)  # Operator/labor time in minutes

    # Relationships
    files = relationship("ServiceJobFile", back_populates="job", cascade="all, delete-orphan")
    status_updates = relationship("JobStatusUpdate", back_populates="job", cascade="all, delete-orphan")
    material_usage = relationship("JobMaterialUsage", back_populates="job", cascade="all, delete-orphan")
    time_logs = relationship("JobTimeLog", back_populates="job", cascade="all, delete-orphan")
    quality_checks = relationship("JobQualityCheck", back_populates="job", cascade="all, delete-orphan")

class ServiceJobFile(Base):
    __tablename__ = "service_job_files"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String(100), ForeignKey("service_jobs.job_id"), nullable=False)

    # File details
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # stl, obj, gcode, step, dwg, etc.
    file_size = Column(Integer, nullable=False)  # bytes
    file_url = Column(String(500), nullable=False)
    file_hash = Column(String(64), nullable=True)  # SHA-256 hash for integrity

    # File metadata
    is_primary = Column(Boolean, default=False)  # Main file for the job
    description = Column(Text, nullable=True)
    version = Column(String(20), default="1.0")

    # G-code specific information
    is_gcode = Column(Boolean, default=False)
    gcode_metadata = Column(JSON, nullable=True)  # Slicer settings, estimated time, etc.
    layer_count = Column(Integer, nullable=True)
    estimated_print_time_gcode = Column(Integer, nullable=True)  # From G-code analysis
    estimated_material_usage_gcode = Column(Float, nullable=True)  # From G-code analysis

    # 3D model analysis (for STL/OBJ files)
    model_volume = Column(Float, nullable=True)  # cubic mm
    model_surface_area = Column(Float, nullable=True)  # square mm
    model_bounding_box = Column(JSON, nullable=True)  # {x, y, z} dimensions
    model_complexity_score = Column(Float, nullable=True)  # Complexity analysis
    requires_supports = Column(Boolean, nullable=True)  # Auto-detection result

    # Upload and processing info
    uploaded_by = Column(String(100), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    processing_status = Column(String(50), default="pending")  # pending, processing, completed, failed

    # Relationships
    job = relationship("ServiceJob", back_populates="files")

class JobStatusUpdate(Base):
    __tablename__ = "job_status_updates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String(100), ForeignKey("service_jobs.job_id"), nullable=False)

    # Status change details
    previous_status = Column(Enum(JobStatus), nullable=True)
    new_status = Column(Enum(JobStatus), nullable=False)
    update_message = Column(Text, nullable=True)
    update_type = Column(String(50), default="manual")  # manual, automatic, external

    # Progress tracking
    completion_percentage = Column(Integer, default=0)  # 0-100
    milestone_reached = Column(String(100), nullable=True)
    estimated_time_remaining = Column(Integer, nullable=True)  # minutes

    # Update metadata
    updated_by = Column(String(100), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
    is_customer_visible = Column(Boolean, default=True)  # Whether customer should see this update

    # Notification tracking
    customer_notified = Column(Boolean, default=False)
    notification_sent_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    job = relationship("ServiceJob", back_populates="status_updates")

class JobMaterialUsage(Base):
    __tablename__ = "job_material_usage"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String(100), ForeignKey("service_jobs.job_id"), nullable=False)

    # Material identification
    material_id = Column(String(100), nullable=True)  # Reference to inventory item
    material_type = Column(Enum(FilamentType), nullable=False)
    material_brand = Column(String(100), nullable=True)
    material_color = Column(String(50), nullable=True)
    material_batch = Column(String(100), nullable=True)  # Batch/lot number

    # Usage amounts
    estimated_weight = Column(Float, nullable=True)  # grams
    actual_weight = Column(Float, nullable=True)  # grams
    estimated_length = Column(Float, nullable=True)  # meters
    actual_length = Column(Float, nullable=True)  # meters
    estimated_volume = Column(Float, nullable=True)  # cubic mm
    actual_volume = Column(Float, nullable=True)  # cubic mm

    # Costs
    cost_per_gram = Column(Float, nullable=True)
    estimated_material_cost = Column(Float, nullable=True)
    actual_material_cost = Column(Float, nullable=True)

    # Usage tracking
    usage_method = Column(String(50), default="manual")  # manual, slicer_estimate, gcode_analysis, scale_weight
    recorded_by = Column(String(100), nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Quality and performance
    material_performance_notes = Column(Text, nullable=True)
    material_quality_rating = Column(Integer, nullable=True)  # 1-5

    # Relationships
    job = relationship("ServiceJob", back_populates="material_usage")

class JobTimeLog(Base):
    __tablename__ = "job_time_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String(100), ForeignKey("service_jobs.job_id"), nullable=False)

    # Time tracking
    activity_type = Column(String(50), nullable=False)  # setup, printing, post_processing, quality_check, etc.
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration_minutes = Column(Integer, nullable=True)  # Calculated or manual entry

    # Personnel and equipment
    operator_id = Column(String(100), nullable=True)
    equipment_id = Column(String(100), nullable=True)
    equipment_name = Column(String(200), nullable=True)

    # Activity details
    activity_description = Column(Text, nullable=True)
    issues_encountered = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)

    # Automation and tracking
    is_automated = Column(Boolean, default=False)  # Automatically tracked vs manual entry
    tracking_source = Column(String(50), nullable=True)  # equipment_sensor, manual, timer, etc.

    # Metadata
    logged_by = Column(String(100), nullable=False)
    logged_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    job = relationship("ServiceJob", back_populates="time_logs")

class JobQualityCheck(Base):
    __tablename__ = "job_quality_checks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String(100), ForeignKey("service_jobs.job_id"), nullable=False)

    # Quality check details
    check_type = Column(String(50), nullable=False)  # dimensional, visual, functional, material
    check_description = Column(Text, nullable=False)
    check_criteria = Column(JSON, nullable=True)  # Specific criteria being checked

    # Results
    passed = Column(Boolean, nullable=False)
    score = Column(Float, nullable=True)  # Quality score (0-100)
    measurements = Column(JSON, nullable=True)  # Actual measurements
    issues_found = Column(JSON, nullable=True)  # List of issues/defects
    corrective_actions = Column(Text, nullable=True)

    # Inspector and timing
    inspector_id = Column(String(100), nullable=False)
    inspector_name = Column(String(200), nullable=False)
    inspected_at = Column(DateTime(timezone=True), server_default=func.now())

    # Photos and documentation
    inspection_photos = Column(JSON, nullable=True)  # URLs to photos
    inspection_notes = Column(Text, nullable=True)

    # Relationships
    job = relationship("ServiceJob", back_populates="quality_checks")

class ServiceProvider(Base):
    __tablename__ = "service_providers"

    # Provider identification
    provider_id = Column(String(100), primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)  # Reference to user account
    makerspace_id = Column(String(100), nullable=True, index=True)  # If attached to makerspace

    # Provider profile
    business_name = Column(String(200), nullable=True)
    display_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(50), nullable=True)
    website_url = Column(String(500), nullable=True)

    # Service capabilities
    services_offered = Column(JSON, nullable=True)  # List of service types
    equipment_available = Column(JSON, nullable=True)  # Equipment and capabilities
    materials_supported = Column(JSON, nullable=True)  # Materials they can work with
    max_build_volume = Column(JSON, nullable=True)  # {x, y, z} in mm
    quality_levels = Column(JSON, nullable=True)  # Quality levels they offer

    # Business settings
    is_active = Column(Boolean, default=True)
    accepts_new_jobs = Column(Boolean, default=True)
    minimum_order_value = Column(Float, nullable=True)
    maximum_concurrent_jobs = Column(Integer, default=10)
    turnaround_time_days = Column(Integer, default=7)

    # Pricing and rates
    base_hourly_rate = Column(Float, nullable=True)
    material_markup_percentage = Column(Float, default=20.0)  # Markup on material costs
    rush_order_multiplier = Column(Float, default=1.5)
    pricing_rules = Column(JSON, nullable=True)  # Custom pricing rules

    # Geographic and operational info
    service_area = Column(JSON, nullable=True)  # Geographic service area
    shipping_methods = Column(JSON, nullable=True)  # Available shipping options
    pickup_available = Column(Boolean, default=True)
    delivery_available = Column(Boolean, default=False)

    # Performance metrics
    total_jobs_completed = Column(Integer, default=0)
    average_completion_time = Column(Float, nullable=True)  # Average in days
    customer_rating = Column(Float, nullable=True)  # Average 1-5 stars
    on_time_delivery_rate = Column(Float, nullable=True)  # Percentage
    repeat_customer_rate = Column(Float, nullable=True)  # Percentage

    # Account and verification
    is_verified = Column(Boolean, default=False)
    verification_level = Column(String(50), default="basic")  # basic, premium, enterprise
    certification_info = Column(JSON, nullable=True)  # Certifications and credentials
    insurance_info = Column(JSON, nullable=True)  # Insurance details

    # Operational hours and availability
    operating_hours = Column(JSON, nullable=True)  # Weekly operating schedule
    time_zone = Column(String(50), default="UTC")
    vacation_mode = Column(Boolean, default=False)
    vacation_until = Column(DateTime(timezone=True), nullable=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_active_at = Column(DateTime(timezone=True), nullable=True)

class ProviderEquipment(Base):
    __tablename__ = "provider_equipment"

    id = Column(Integer, primary_key=True, autoincrement=True)
    provider_id = Column(String(100), ForeignKey("service_providers.provider_id"), nullable=False)

    # Equipment details
    equipment_type = Column(String(100), nullable=False)  # 3d_printer, laser_cutter, cnc_mill, etc.
    brand = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    name = Column(String(200), nullable=False)  # Custom name for this equipment

    # Technical specifications
    build_volume = Column(JSON, nullable=True)  # {x, y, z} dimensions
    layer_resolution = Column(JSON, nullable=True)  # Min/max layer heights
    materials_supported = Column(JSON, nullable=True)  # Supported materials
    max_temperature = Column(JSON, nullable=True)  # {nozzle, bed} temperatures
    software_used = Column(JSON, nullable=True)  # Slicer software and versions

    # Status and availability
    is_active = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
    maintenance_due = Column(DateTime(timezone=True), nullable=True)
    last_maintenance = Column(DateTime(timezone=True), nullable=True)

    # Usage tracking
    total_print_hours = Column(Float, default=0.0)
    total_jobs_completed = Column(Integer, default=0)
    average_utilization = Column(Float, nullable=True)  # Percentage

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class JobTemplate(Base):
    __tablename__ = "job_templates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    provider_id = Column(String(100), ForeignKey("service_providers.provider_id"), nullable=False)

    # Template details
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    job_type = Column(Enum(JobType), nullable=False)

    # Template settings
    default_settings = Column(JSON, nullable=False)  # Default print/service settings
    pricing_template = Column(JSON, nullable=True)  # Pricing rules for this template
    estimated_time_template = Column(JSON, nullable=True)  # Time estimation rules

    # Usage and optimization
    usage_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=False)  # Can other providers use this template?

    # Metadata
    created_by = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
