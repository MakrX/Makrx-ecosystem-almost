from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

from ..models.equipment_reservations import (
    ReservationStatus, PaymentStatus, CostRuleType, SkillGateType
)

# Enhanced Reservation Schemas
class EnhancedReservationCreate(BaseModel):
    equipment_id: str = Field(..., min_length=1)
    requested_start: datetime
    requested_end: datetime
    purpose: Optional[str] = Field(None, max_length=500)
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    user_notes: Optional[str] = None
    is_emergency: bool = False
    emergency_justification: Optional[str] = None
    is_recurring: bool = False
    recurring_pattern: Optional[Dict[str, Any]] = None
    
    @validator('requested_end')
    def end_after_start(cls, v, values):
        if 'requested_start' in values and v <= values['requested_start']:
            raise ValueError('End time must be after start time')
        return v
    
    @validator('emergency_justification')
    def emergency_requires_justification(cls, v, values):
        if values.get('is_emergency') and not v:
            raise ValueError('Emergency reservations require justification')
        return v

class EnhancedReservationUpdate(BaseModel):
    requested_start: Optional[datetime] = None
    requested_end: Optional[datetime] = None
    purpose: Optional[str] = Field(None, max_length=500)
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    user_notes: Optional[str] = None
    admin_notes: Optional[str] = None
    status: Optional[ReservationStatus] = None
    rejection_reason: Optional[str] = None
    
    @validator('requested_end')
    def end_after_start(cls, v, values):
        if 'requested_start' in values and v and values['requested_start'] and v <= values['requested_start']:
            raise ValueError('End time must be after start time')
        return v

class CostBreakdownItem(BaseModel):
    cost_type: str
    description: str
    rule_applied: Optional[str] = None
    base_amount: float
    quantity: float = 1.0
    rate: Optional[float] = None
    percentage: Optional[float] = None
    calculated_amount: float
    is_refundable: bool = True
    is_taxable: bool = False

class SkillVerificationItem(BaseModel):
    skill_gate_id: str
    skill_verified: bool
    verification_method: Optional[str] = None
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    skill_level_verified: Optional[str] = None
    certification_number: Optional[str] = None
    certification_expiry: Optional[datetime] = None
    verification_notes: Optional[str] = None
    is_override: bool = False
    override_reason: Optional[str] = None

class EnhancedReservationResponse(BaseModel):
    id: str
    equipment_id: str
    user_id: str
    user_name: str
    user_email: Optional[str] = None
    user_membership_tier: Optional[str] = None
    
    # Timing
    requested_start: datetime
    requested_end: datetime
    duration_hours: float
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    actual_duration_hours: Optional[float] = None
    
    # Status
    status: ReservationStatus
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    
    # Purpose and linking
    purpose: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    
    # Skill verification
    required_skills_verified: bool = False
    skill_verification_by: Optional[str] = None
    skill_verification_at: Optional[datetime] = None
    
    # Cost and payment
    base_cost: Optional[float] = None
    total_cost: Optional[float] = None
    estimated_cost: Optional[float] = None
    payment_status: PaymentStatus = PaymentStatus.NOT_REQUIRED
    deposit_amount: Optional[float] = None
    deposit_paid: bool = False
    
    # Access control
    access_granted: bool = False
    access_code: Optional[str] = None
    supervisor_required: bool = False
    supervisor_assigned: Optional[str] = None
    
    # Feedback
    user_notes: Optional[str] = None
    admin_notes: Optional[str] = None
    equipment_condition_before: Optional[str] = None
    equipment_condition_after: Optional[str] = None
    
    # Special handling
    is_emergency: bool = False
    priority_level: int = 0
    is_recurring: bool = False
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    # Related data
    cost_breakdown: List[CostBreakdownItem] = []
    skill_verifications: List[SkillVerificationItem] = []
    
    class Config:
        from_attributes = True

# Cost Rule Schemas
class CostRuleCreate(BaseModel):
    equipment_id: str = Field(..., min_length=1)
    rule_name: str = Field(..., min_length=1, max_length=200)
    rule_type: CostRuleType
    description: Optional[str] = None
    
    # Basic pricing
    base_amount: Optional[float] = Field(None, ge=0)
    rate_per_hour: Optional[float] = Field(None, ge=0)
    minimum_charge: Optional[float] = Field(None, ge=0)
    maximum_charge: Optional[float] = Field(None, ge=0)
    
    # Advanced configuration
    tier_config: Optional[Dict[str, float]] = None
    time_conditions: Optional[Dict[str, Any]] = None
    membership_discounts: Optional[Dict[str, float]] = None
    skill_premiums: Optional[Dict[str, float]] = None
    
    # Activation
    is_active: bool = True
    effective_from: Optional[datetime] = None
    effective_until: Optional[datetime] = None
    priority: int = 0
    
    # Application conditions
    applies_to_users: Optional[List[str]] = None
    applies_to_projects: Optional[List[str]] = None
    minimum_duration: Optional[float] = Field(None, ge=0)
    maximum_duration: Optional[float] = Field(None, ge=0)

class CostRuleUpdate(BaseModel):
    rule_name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    base_amount: Optional[float] = Field(None, ge=0)
    rate_per_hour: Optional[float] = Field(None, ge=0)
    minimum_charge: Optional[float] = Field(None, ge=0)
    maximum_charge: Optional[float] = Field(None, ge=0)
    tier_config: Optional[Dict[str, float]] = None
    time_conditions: Optional[Dict[str, Any]] = None
    membership_discounts: Optional[Dict[str, float]] = None
    skill_premiums: Optional[Dict[str, float]] = None
    is_active: Optional[bool] = None
    effective_from: Optional[datetime] = None
    effective_until: Optional[datetime] = None
    priority: Optional[int] = None
    applies_to_users: Optional[List[str]] = None
    applies_to_projects: Optional[List[str]] = None
    minimum_duration: Optional[float] = Field(None, ge=0)
    maximum_duration: Optional[float] = Field(None, ge=0)

class CostRuleResponse(BaseModel):
    id: str
    equipment_id: str
    rule_name: str
    rule_type: CostRuleType
    description: Optional[str] = None
    base_amount: Optional[float] = None
    rate_per_hour: Optional[float] = None
    minimum_charge: Optional[float] = None
    maximum_charge: Optional[float] = None
    tier_config: Optional[Dict[str, float]] = None
    time_conditions: Optional[Dict[str, Any]] = None
    membership_discounts: Optional[Dict[str, float]] = None
    skill_premiums: Optional[Dict[str, float]] = None
    is_active: bool
    effective_from: Optional[datetime] = None
    effective_until: Optional[datetime] = None
    priority: int
    applies_to_users: Optional[List[str]] = None
    applies_to_projects: Optional[List[str]] = None
    minimum_duration: Optional[float] = None
    maximum_duration: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    created_by: str
    
    class Config:
        from_attributes = True

# Skill Gate Schemas
class SkillGateCreate(BaseModel):
    equipment_id: str = Field(..., min_length=1)
    gate_name: str = Field(..., min_length=1, max_length=200)
    gate_type: SkillGateType
    description: Optional[str] = None
    
    # Skill requirements
    required_skill_id: Optional[str] = None
    required_skill_level: Optional[str] = Field(None, regex="^(beginner|intermediate|advanced|expert)$")
    required_certification: Optional[str] = None
    required_training_modules: Optional[List[str]] = None
    
    # Experience requirements
    minimum_experience_hours: Optional[float] = Field(None, ge=0)
    minimum_project_count: Optional[int] = Field(None, ge=0)
    
    # Supervisor requirements
    requires_supervisor: bool = False
    supervisor_skill_level: Optional[str] = Field(None, regex="^(beginner|intermediate|advanced|expert)$")
    supervisor_roles: Optional[List[str]] = None
    
    # Time restrictions
    allowed_hours: Optional[Dict[str, Any]] = None
    restricted_hours: Optional[Dict[str, Any]] = None
    
    # Configuration
    grace_period_days: int = 0
    allow_admin_override: bool = True
    emergency_bypass_allowed: bool = False
    auto_verify_from_system: bool = True
    manual_verification_required: bool = False
    enforcement_level: str = Field("block", regex="^(block|warn|log_only)$")
    warning_message: Optional[str] = None
    
    # Activation
    is_active: bool = True
    effective_from: Optional[datetime] = None
    effective_until: Optional[datetime] = None

class SkillGateUpdate(BaseModel):
    gate_name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    required_skill_id: Optional[str] = None
    required_skill_level: Optional[str] = Field(None, regex="^(beginner|intermediate|advanced|expert)$")
    required_certification: Optional[str] = None
    required_training_modules: Optional[List[str]] = None
    minimum_experience_hours: Optional[float] = Field(None, ge=0)
    minimum_project_count: Optional[int] = Field(None, ge=0)
    requires_supervisor: Optional[bool] = None
    supervisor_skill_level: Optional[str] = Field(None, regex="^(beginner|intermediate|advanced|expert)$")
    supervisor_roles: Optional[List[str]] = None
    allowed_hours: Optional[Dict[str, Any]] = None
    restricted_hours: Optional[Dict[str, Any]] = None
    grace_period_days: Optional[int] = None
    allow_admin_override: Optional[bool] = None
    emergency_bypass_allowed: Optional[bool] = None
    auto_verify_from_system: Optional[bool] = None
    manual_verification_required: Optional[bool] = None
    enforcement_level: Optional[str] = Field(None, regex="^(block|warn|log_only)$")
    warning_message: Optional[str] = None
    is_active: Optional[bool] = None
    effective_from: Optional[datetime] = None
    effective_until: Optional[datetime] = None

class SkillGateResponse(BaseModel):
    id: str
    equipment_id: str
    gate_name: str
    gate_type: SkillGateType
    description: Optional[str] = None
    required_skill_id: Optional[str] = None
    required_skill_level: Optional[str] = None
    required_certification: Optional[str] = None
    required_training_modules: Optional[List[str]] = None
    minimum_experience_hours: Optional[float] = None
    minimum_project_count: Optional[int] = None
    requires_supervisor: bool = False
    supervisor_skill_level: Optional[str] = None
    supervisor_roles: Optional[List[str]] = None
    allowed_hours: Optional[Dict[str, Any]] = None
    restricted_hours: Optional[Dict[str, Any]] = None
    grace_period_days: int = 0
    allow_admin_override: bool = True
    emergency_bypass_allowed: bool = False
    auto_verify_from_system: bool = True
    manual_verification_required: bool = False
    enforcement_level: str = "block"
    warning_message: Optional[str] = None
    is_active: bool = True
    effective_from: Optional[datetime] = None
    effective_until: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    created_by: str
    
    class Config:
        from_attributes = True

# Reservation workflow schemas
class ReservationApprovalRequest(BaseModel):
    approved: bool
    admin_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    require_deposit: bool = False
    deposit_amount: Optional[float] = Field(None, ge=0)
    assign_supervisor: Optional[str] = None

class SkillVerificationRequest(BaseModel):
    skill_verifications: List[SkillVerificationItem]
    verification_notes: Optional[str] = None
    overall_approved: bool

class CostEstimateRequest(BaseModel):
    equipment_id: str
    user_id: str
    requested_start: datetime
    requested_end: datetime
    project_id: Optional[str] = None
    membership_tier: Optional[str] = None

class CostEstimateResponse(BaseModel):
    equipment_id: str
    duration_hours: float
    base_cost: float
    additional_fees: List[CostBreakdownItem] = []
    discounts: List[CostBreakdownItem] = []
    total_cost: float
    deposit_required: bool = False
    deposit_amount: Optional[float] = None
    estimated_by: str
    estimated_at: datetime
    valid_until: datetime
    
    # Cost rules applied
    rules_applied: List[str] = []
    warnings: List[str] = []

class AvailabilityCheckRequest(BaseModel):
    equipment_id: str
    start_date: datetime
    end_date: datetime
    duration_hours: Optional[float] = None
    user_id: Optional[str] = None  # For skill-based availability

class AvailabilitySlot(BaseModel):
    start_time: datetime
    end_time: datetime
    duration_hours: float
    is_available: bool
    conflict_reason: Optional[str] = None
    estimated_cost: Optional[float] = None
    requires_approval: bool = False
    requires_skill_verification: bool = False
    skill_gates_blocking: List[str] = []

class AvailabilityResponse(BaseModel):
    equipment_id: str
    check_period_start: datetime
    check_period_end: datetime
    total_slots_checked: int
    available_slots: List[AvailabilitySlot]
    next_available_slot: Optional[AvailabilitySlot] = None
    recommendations: List[str] = []

# Bulk operations
class BulkReservationAction(BaseModel):
    action: str = Field(..., regex="^(approve|reject|cancel|update_status)$")
    reservation_ids: List[str] = Field(..., min_items=1)
    reason: Optional[str] = None
    admin_notes: Optional[str] = None
    new_status: Optional[ReservationStatus] = None

class BulkReservationResult(BaseModel):
    total_processed: int
    successful: List[str]
    failed: List[Dict[str, str]]
    warnings: List[str] = []

# Analytics schemas
class ReservationAnalytics(BaseModel):
    equipment_id: Optional[str] = None
    period_start: datetime
    period_end: datetime
    
    # Reservation metrics
    total_reservations: int
    approved_reservations: int
    completed_reservations: int
    cancelled_reservations: int
    no_show_count: int
    
    # Utilization metrics
    total_reserved_hours: float
    total_actual_hours: float
    utilization_rate: float
    average_reservation_duration: float
    
    # Financial metrics
    total_revenue: float
    average_cost_per_reservation: float
    deposit_collected: float
    refunds_issued: float
    
    # Skill gate metrics
    skill_gate_blocks: int
    skill_verifications_required: int
    supervisor_sessions: int
    
    # User behavior
    advance_booking_average_days: float
    repeat_user_percentage: float
    peak_hours: List[str]
    
    # Equipment-specific metrics
    maintenance_conflicts: int
    equipment_issues_reported: int
    average_equipment_rating: Optional[float] = None

class EquipmentReservationSummary(BaseModel):
    equipment_id: str
    equipment_name: str
    total_reservations: int
    utilization_rate: float
    revenue_generated: float
    average_rating: float
    skill_gates_count: int
    cost_rules_count: int
    next_available: Optional[datetime] = None
    requires_maintenance: bool = False
