from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class EquipmentStatus(str, Enum):
    AVAILABLE = "available"
    IN_USE = "in_use"
    UNDER_MAINTENANCE = "under_maintenance"
    OFFLINE = "offline"

class EquipmentCategory(str, Enum):
    PRINTER_3D = "printer_3d"
    LASER_CUTTER = "laser_cutter"
    CNC_MACHINE = "cnc_machine"
    TESTING_TOOL = "testing_tool"
    SOLDERING_STATION = "soldering_station"
    WORKSTATION = "workstation"
    HAND_TOOL = "hand_tool"
    MEASURING_TOOL = "measuring_tool"
    GENERAL_TOOL = "general_tool"

class MaintenanceType(str, Enum):
    ROUTINE = "routine"
    REPAIR = "repair"
    CALIBRATION = "calibration"
    CLEANING = "cleaning"
    REPLACEMENT = "replacement"

class ReservationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

# Equipment Rating schemas
class EquipmentRatingBase(BaseModel):
    overall_rating: int = Field(..., ge=1, le=5)
    reliability_rating: Optional[int] = Field(None, ge=1, le=5)
    ease_of_use_rating: Optional[int] = Field(None, ge=1, le=5)
    condition_rating: Optional[int] = Field(None, ge=1, le=5)
    feedback_text: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    suggestions: Optional[str] = None
    issues_encountered: Optional[str] = None
    would_recommend: Optional[bool] = None
    difficulty_level: Optional[str] = Field(None, regex="^(beginner|intermediate|advanced)$")

class EquipmentRatingCreate(EquipmentRatingBase):
    equipment_id: str
    reservation_id: Optional[str] = None

class EquipmentRatingUpdate(BaseModel):
    overall_rating: Optional[int] = Field(None, ge=1, le=5)
    reliability_rating: Optional[int] = Field(None, ge=1, le=5)
    ease_of_use_rating: Optional[int] = Field(None, ge=1, le=5)
    condition_rating: Optional[int] = Field(None, ge=1, le=5)
    feedback_text: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    suggestions: Optional[str] = None
    would_recommend: Optional[bool] = None
    difficulty_level: Optional[str] = Field(None, regex="^(beginner|intermediate|advanced)$")

class EquipmentRatingResponse(EquipmentRatingBase):
    id: str
    user_id: str
    user_name: str
    created_at: datetime
    updated_at: datetime
    is_approved: bool
    is_featured: bool
    admin_response: Optional[str] = None
    
    class Config:
        from_attributes = True

# Equipment Maintenance schemas
class MaintenanceLogBase(BaseModel):
    maintenance_type: MaintenanceType
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    duration_hours: Optional[float] = Field(None, ge=0)
    supervised_by: Optional[str] = None
    parts_used: Optional[List[Dict[str, Any]]] = None
    labor_cost: Optional[float] = Field(None, ge=0)
    parts_cost: Optional[float] = Field(None, ge=0)
    issues_found: Optional[str] = None
    actions_taken: Optional[str] = None
    recommendations: Optional[str] = None
    next_maintenance_due: Optional[datetime] = None
    notes: Optional[str] = None

class MaintenanceLogCreate(MaintenanceLogBase):
    equipment_id: str
    started_at: datetime = Field(default_factory=datetime.utcnow)

class MaintenanceLogUpdate(BaseModel):
    maintenance_type: Optional[MaintenanceType] = None
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    completed_at: Optional[datetime] = None
    duration_hours: Optional[float] = Field(None, ge=0)
    parts_used: Optional[List[Dict[str, Any]]] = None
    labor_cost: Optional[float] = Field(None, ge=0)
    parts_cost: Optional[float] = Field(None, ge=0)
    issues_found: Optional[str] = None
    actions_taken: Optional[str] = None
    recommendations: Optional[str] = None
    next_maintenance_due: Optional[datetime] = None
    is_completed: Optional[bool] = None
    notes: Optional[str] = None

class MaintenanceLogResponse(MaintenanceLogBase):
    id: str
    equipment_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    performed_by_user_id: str
    performed_by_name: str
    total_cost: Optional[float] = None
    is_completed: bool
    certification_valid: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Equipment Reservation schemas
class ReservationBase(BaseModel):
    start_time: datetime
    end_time: datetime
    purpose: Optional[str] = Field(None, max_length=500)
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    user_notes: Optional[str] = None

    @validator('end_time')
    def end_time_after_start_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('End time must be after start time')
        return v

class ReservationCreate(ReservationBase):
    equipment_id: str

class ReservationUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    purpose: Optional[str] = Field(None, max_length=500)
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    status: Optional[ReservationStatus] = None
    user_notes: Optional[str] = None
    admin_notes: Optional[str] = None
    issues_reported: Optional[str] = None

class ReservationResponse(ReservationBase):
    id: str
    equipment_id: str
    user_id: str
    user_name: str
    user_email: Optional[str] = None
    duration_hours: float
    status: ReservationStatus
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    certification_verified: bool
    actual_start_time: Optional[datetime] = None
    actual_end_time: Optional[datetime] = None
    actual_duration_hours: Optional[float] = None
    hourly_rate_charged: Optional[float] = None
    total_cost: Optional[float] = None
    payment_status: str
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Equipment schemas
class EquipmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: EquipmentCategory
    sub_category: Optional[str] = Field(None, max_length=100)
    location: str = Field(..., min_length=1, max_length=255)
    linked_makerspace_id: str
    available_slots: Optional[Dict[str, Any]] = None  # Weekly schedule
    requires_certification: bool = False
    certification_required: Optional[str] = Field(None, max_length=100)
    maintenance_interval_hours: Optional[int] = Field(None, gt=0)
    manufacturer: Optional[str] = Field(None, max_length=100)
    model: Optional[str] = Field(None, max_length=100)
    serial_number: Optional[str] = Field(None, max_length=100)
    purchase_date: Optional[datetime] = None
    warranty_expiry: Optional[datetime] = None
    hourly_rate: Optional[float] = Field(None, ge=0)
    deposit_required: Optional[float] = Field(None, ge=0)
    description: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    manual_url: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None

class EquipmentCreate(EquipmentBase):
    equipment_id: str = Field(..., min_length=1, max_length=100)
    # created_by is handled by the backend route, not sent from frontend

class EquipmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[EquipmentCategory] = None
    sub_category: Optional[str] = Field(None, max_length=100)
    status: Optional[EquipmentStatus] = None
    location: Optional[str] = Field(None, min_length=1, max_length=255)
    available_slots: Optional[Dict[str, Any]] = None
    requires_certification: Optional[bool] = None
    certification_required: Optional[str] = Field(None, max_length=100)
    last_maintenance_date: Optional[datetime] = None
    next_maintenance_date: Optional[datetime] = None
    maintenance_interval_hours: Optional[int] = Field(None, gt=0)
    manufacturer: Optional[str] = Field(None, max_length=100)
    model: Optional[str] = Field(None, max_length=100)
    serial_number: Optional[str] = Field(None, max_length=100)
    purchase_date: Optional[datetime] = None
    warranty_expiry: Optional[datetime] = None
    hourly_rate: Optional[float] = Field(None, ge=0)
    deposit_required: Optional[float] = Field(None, ge=0)
    description: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    manual_url: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None
    updated_by: str

class EquipmentResponse(EquipmentBase):
    id: str
    equipment_id: str
    status: EquipmentStatus
    last_maintenance_date: Optional[datetime] = None
    next_maintenance_date: Optional[datetime] = None
    total_usage_hours: float
    usage_count: int
    average_rating: float
    total_ratings: int
    created_at: datetime
    updated_at: datetime
    created_by: str
    updated_by: Optional[str] = None
    maintenance_logs: List[MaintenanceLogResponse] = []
    reservations: List[ReservationResponse] = []
    ratings: List[EquipmentRatingResponse] = []
    
    class Config:
        from_attributes = True

# Usage session schemas
class UsageSessionBase(BaseModel):
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    materials_used: Optional[List[Dict[str, Any]]] = None
    settings_used: Optional[Dict[str, Any]] = None
    job_successful: Optional[bool] = None
    output_quality: Optional[str] = Field(None, regex="^(excellent|good|fair|poor)$")
    issues_encountered: Optional[str] = None
    notes: Optional[str] = None

class UsageSessionCreate(UsageSessionBase):
    equipment_id: str
    reservation_id: Optional[str] = None
    start_time: datetime = Field(default_factory=datetime.utcnow)

class UsageSessionUpdate(BaseModel):
    end_time: Optional[datetime] = None
    materials_used: Optional[List[Dict[str, Any]]] = None
    settings_used: Optional[Dict[str, Any]] = None
    job_successful: Optional[bool] = None
    output_quality: Optional[str] = Field(None, regex="^(excellent|good|fair|poor)$")
    issues_encountered: Optional[str] = None
    power_consumed_kwh: Optional[float] = Field(None, ge=0)
    material_consumed: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None

class UsageSessionResponse(UsageSessionBase):
    id: str
    equipment_id: str
    reservation_id: Optional[str] = None
    user_id: str
    user_name: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_hours: Optional[float] = None
    power_consumed_kwh: Optional[float] = None
    material_consumed: Optional[List[Dict[str, Any]]] = None
    efficiency_score: Optional[float] = None
    cost_incurred: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Filter and analytics schemas
class EquipmentFilter(BaseModel):
    category: Optional[EquipmentCategory] = None
    status: Optional[EquipmentStatus] = None
    location: Optional[str] = None
    makerspace_id: Optional[str] = None
    requires_certification: Optional[bool] = None
    available_only: bool = False
    search: Optional[str] = None
    
    # Pagination
    skip: int = Field(0, ge=0)
    limit: int = Field(100, ge=1, le=1000)
    
    # Sorting
    sort_by: str = "name"
    sort_order: str = Field("asc", regex="^(asc|desc)$")

class EquipmentStatsResponse(BaseModel):
    total_equipment: int
    available_equipment: int
    in_use_equipment: int
    maintenance_equipment: int
    offline_equipment: int
    total_reservations_today: int
    utilization_rate: float
    average_rating: float
    categories: Dict[str, int]
    locations: Dict[str, int]

class AvailabilitySlot(BaseModel):
    day_of_week: int  # 0-6 (Monday-Sunday)
    start_time: str   # HH:MM format
    end_time: str     # HH:MM format
    is_available: bool

class AvailabilityResponse(BaseModel):
    equipment_id: str
    date: datetime
    slots: List[AvailabilitySlot]
    reservations: List[ReservationResponse]

# Request schemas for specific operations
class ReservationApprovalRequest(BaseModel):
    approved: bool
    admin_notes: Optional[str] = None

class MaintenanceModeRequest(BaseModel):
    enable: bool
    reason: Optional[str] = None
    estimated_completion: Optional[datetime] = None

class BulkOperationRequest(BaseModel):
    equipment_ids: List[str]
    action: str  # "maintenance", "offline", "delete", etc.
    reason: Optional[str] = None

# Response schemas
class SuccessResponse(BaseModel):
    message: str
    data: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
    field: Optional[str] = None
