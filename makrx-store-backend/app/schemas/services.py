"""
Pydantic schemas for 3D printing and service entities
Request/response models for uploads, quotes, service orders
"""

from pydantic import BaseModel, Field, validator, root_validator
from typing import List, Optional, Dict, Any, Union
from decimal import Decimal
from datetime import datetime
from enum import Enum
import uuid

# Enums
class UploadStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    PROCESSED = "processed"
    FAILED = "failed"
    EXPIRED = "expired"

class QuoteStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    ACCEPTED = "accepted"
    CANCELLED = "cancelled"

class ServiceOrderStatus(str, Enum):
    PENDING = "pending"
    ROUTED = "routed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    PRINTING = "printing"
    POST_PROCESSING = "post_processing"
    QUALITY_CHECK = "quality_check"
    READY = "ready"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PrintQuality(str, Enum):
    DRAFT = "draft"
    STANDARD = "standard"
    HIGH = "high"
    ULTRA = "ultra"

class PrintMaterial(str, Enum):
    PLA = "pla"
    PLA_PLUS = "pla+"
    ABS = "abs"
    PETG = "petg"
    TPU = "tpu"
    RESIN = "resin"
    RESIN_TOUGH = "resin_tough"
    WOOD = "wood"
    METAL = "metal"

class Priority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

# Base schemas
class TimestampMixin(BaseModel):
    created_at: datetime
    updated_at: Optional[datetime] = None

# Upload schemas
class UploadRequest(BaseModel):
    filename: str = Field(..., min_length=1, max_length=255)
    content_type: str
    file_size: int = Field(..., gt=0, le=100*1024*1024)  # Max 100MB
    
    @validator('filename')
    def validate_filename(cls, v):
        allowed_extensions = ['.stl', '.obj', '.3mf', '.step', '.stp']
        if not any(v.lower().endswith(ext) for ext in allowed_extensions):
            raise ValueError(f'File type not supported. Allowed: {", ".join(allowed_extensions)}')
        return v

class UploadResponse(BaseModel):
    upload_id: uuid.UUID
    upload_url: str
    fields: Dict[str, str]
    file_key: str
    expires_in: int

class UploadComplete(BaseModel):
    upload_id: uuid.UUID
    file_key: str

class Upload(TimestampMixin):
    id: uuid.UUID
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    file_key: str
    file_name: str
    file_hash: Optional[str] = None
    file_size: int
    mime_type: str
    dimensions: Dict[str, float] = {}
    volume_mm3: Optional[Decimal] = None
    surface_area_mm2: Optional[Decimal] = None
    mesh_info: Dict[str, Any] = {}
    status: UploadStatus
    error_message: Optional[str] = None
    processed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

# Quote schemas
class QuoteRequest(BaseModel):
    upload_id: uuid.UUID
    material: PrintMaterial
    quality: PrintQuality
    color: str = "natural"
    infill_percentage: int = Field(20, ge=10, le=100)
    layer_height: Decimal = Field(Decimal('0.2'), ge=Decimal('0.05'), le=Decimal('0.8'))
    supports: bool = False
    quantity: int = Field(1, ge=1, le=100)
    rush_order: bool = False
    delivery_address: Optional[Dict[str, Any]] = None
    pickup_location: Optional[str] = None

class QuoteResponse(BaseModel):
    quote_id: uuid.UUID
    price: Decimal
    currency: str
    estimated_weight_g: Decimal
    estimated_time_minutes: int
    breakdown: Dict[str, Any]
    material_usage: Dict[str, Any]
    print_parameters: Dict[str, Any]
    expires_at: datetime

class Quote(TimestampMixin):
    id: uuid.UUID
    upload_id: uuid.UUID
    user_id: Optional[str] = None
    material: str
    quality: str
    color: str
    infill_percentage: int
    layer_height: Decimal
    supports: bool
    settings: Dict[str, Any] = {}
    estimated_weight_g: Optional[Decimal] = None
    estimated_time_minutes: Optional[int] = None
    estimated_material_cost: Optional[Decimal] = None
    estimated_labor_cost: Optional[Decimal] = None
    estimated_machine_cost: Optional[Decimal] = None
    price: Decimal
    currency: str
    expires_at: datetime
    status: QuoteStatus
    pickup_location: Optional[str] = None
    delivery_address: Optional[Dict[str, Any]] = None
    shipping_cost: Decimal = Decimal('0.00')
    accepted_at: Optional[datetime] = None
    upload: Optional[Upload] = None
    
    class Config:
        orm_mode = True

# Service Provider schemas
class ServiceProviderCapabilities(BaseModel):
    materials: List[str] = []
    max_volume_mm3: Optional[float] = None
    technologies: List[str] = []  # FDM, SLA, SLS, etc.
    max_layer_height: Optional[float] = None
    min_layer_height: Optional[float] = None

class ServiceProvider(TimestampMixin):
    id: int
    name: str
    makrcave_id: Optional[str] = None
    capabilities: ServiceProviderCapabilities
    equipment: List[Dict[str, Any]] = []
    location: Dict[str, Any] = {}
    contact_info: Dict[str, Any] = {}
    business_hours: Dict[str, Any] = {}
    pricing_tiers: Dict[str, Any] = {}
    is_active: bool
    is_verified: bool
    rating: Decimal = Decimal('0.00')
    total_jobs: int = 0
    last_active: Optional[datetime] = None
    
    class Config:
        orm_mode = True

# Service Order schemas
class ServiceOrderCreate(BaseModel):
    quote_id: uuid.UUID
    order_id: Optional[int] = None
    priority: Priority = Priority.NORMAL
    customer_notes: Optional[str] = None
    delivery_instructions: Optional[str] = None

class ServiceOrderUpdate(BaseModel):
    status: Optional[ServiceOrderStatus] = None
    provider_id: Optional[int] = None
    priority: Optional[Priority] = None
    estimated_completion: Optional[datetime] = None
    production_notes: Optional[str] = None
    quality_notes: Optional[str] = None
    provider_notes: Optional[str] = None
    tracking_number: Optional[str] = None

class ServiceOrder(TimestampMixin):
    id: uuid.UUID
    order_id: Optional[int] = None
    quote_id: uuid.UUID
    provider_id: Optional[int] = None
    service_order_number: str
    priority: str
    status: ServiceOrderStatus
    milestones: Dict[str, Any] = {}
    estimated_completion: Optional[datetime] = None
    actual_completion: Optional[datetime] = None
    tracking: Dict[str, Any] = {}
    production_notes: Optional[str] = None
    quality_notes: Optional[str] = None
    shipping_method: Optional[str] = None
    tracking_number: Optional[str] = None
    delivery_instructions: Optional[str] = None
    customer_notes: Optional[str] = None
    provider_notes: Optional[str] = None
    routed_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    quote: Optional[Quote] = None
    provider: Optional[ServiceProvider] = None
    
    class Config:
        orm_mode = True

class ServiceOrderList(BaseModel):
    service_orders: List[ServiceOrder]
    total: int
    page: int
    per_page: int
    pages: int

# Service Order Log schemas
class ServiceOrderLogCreate(BaseModel):
    service_order_id: uuid.UUID
    event_type: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    message: Optional[str] = None
    actor_type: str = "system"  # customer, provider, admin, system
    actor_id: Optional[str] = None
    actor_name: Optional[str] = None
    metadata: Dict[str, Any] = {}

class ServiceOrderLog(BaseModel):
    id: int
    service_order_id: uuid.UUID
    event_type: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    message: Optional[str] = None
    actor_type: str
    actor_id: Optional[str] = None
    actor_name: Optional[str] = None
    metadata: Dict[str, Any] = {}
    created_at: datetime
    
    class Config:
        orm_mode = True

# Provider job management schemas
class ProviderJobFilter(BaseModel):
    status: Optional[ServiceOrderStatus] = None
    priority: Optional[Priority] = None
    material: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

class ProviderJobUpdate(BaseModel):
    status: ServiceOrderStatus
    message: Optional[str] = None
    estimated_completion: Optional[datetime] = None
    tracking_data: Optional[Dict[str, Any]] = None

# File analysis schemas
class MeshAnalysis(BaseModel):
    vertices: int
    faces: int
    is_manifold: bool
    has_holes: bool
    volume_mm3: Decimal
    surface_area_mm2: Decimal
    bounding_box: Dict[str, float]  # min_x, max_x, etc.
    center_of_mass: Dict[str, float]  # x, y, z

# Quote comparison schemas
class QuoteComparison(BaseModel):
    quotes: List[Quote]
    recommendations: List[str]
    cheapest_quote_id: Optional[uuid.UUID] = None
    fastest_quote_id: Optional[uuid.UUID] = None
    best_value_quote_id: Optional[uuid.UUID] = None

# Service order tracking schemas
class ServiceOrderTracking(BaseModel):
    service_order_id: uuid.UUID
    current_status: ServiceOrderStatus
    progress_percentage: int = Field(0, ge=0, le=100)
    estimated_completion: Optional[datetime] = None
    milestones: List[Dict[str, Any]] = []
    tracking_events: List[ServiceOrderLog] = []
    current_location: Optional[str] = None
    
# Batch operations schemas
class BatchQuoteRequest(BaseModel):
    upload_ids: List[uuid.UUID] = Field(..., min_items=1, max_items=50)
    material: PrintMaterial
    quality: PrintQuality
    color: str = "natural"
    infill_percentage: int = Field(20, ge=10, le=100)
    layer_height: Decimal = Field(Decimal('0.2'), ge=Decimal('0.05'), le=Decimal('0.8'))
    supports: bool = False
    rush_order: bool = False

class BatchQuoteResponse(BaseModel):
    quotes: List[QuoteResponse]
    total_price: Decimal
    total_weight_g: Decimal
    total_time_minutes: int
    bulk_discount: Optional[Dict[str, Any]] = None

# Material and quality info schemas
class MaterialInfo(BaseModel):
    name: str
    display_name: str
    description: str
    properties: Dict[str, Any]
    colors_available: List[str]
    price_per_cm3: Decimal
    density_g_cm3: Decimal
    recommended_layer_heights: List[float]
    supports_required: bool
    post_processing: List[str]

class QualityInfo(BaseModel):
    name: str
    display_name: str
    description: str
    layer_height_range: Dict[str, float]  # min, max
    time_multiplier: float
    recommended_for: List[str]
    surface_finish: str

# Service capabilities schema
class ServiceCapabilities(BaseModel):
    materials: List[MaterialInfo]
    qualities: List[QualityInfo]
    max_dimensions: Dict[str, float]  # x, y, z in mm
    max_volume_mm3: float
    file_formats: List[str]
    max_file_size_mb: int
    turnaround_times: Dict[str, str]  # quality -> time range

# Update forward references
Upload.update_forward_refs()
Quote.update_forward_refs()
ServiceOrder.update_forward_refs()
