from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class AccessLevel(str, Enum):
    BASIC = "basic"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"
    MAINTENANCE = "maintenance"

class BadgeType(str, Enum):
    SKILL_CERTIFICATION = "skill_certification"
    SAFETY_TRAINING = "safety_training"
    EQUIPMENT_MASTERY = "equipment_mastery"
    PROJECT_COMPLETION = "project_completion"
    COMMUNITY_CONTRIBUTION = "community_contribution"
    TIME_MILESTONE = "time_milestone"
    QUALITY_ACHIEVEMENT = "quality_achievement"
    INNOVATION_AWARD = "innovation_award"

class BadgeRarity(str, Enum):
    COMMON = "common"
    UNCOMMON = "uncommon"
    RARE = "rare"
    EPIC = "epic"
    LEGENDARY = "legendary"

class AccessAttemptResult(str, Enum):
    GRANTED = "granted"
    DENIED_NO_SKILL = "denied_no_skill"
    DENIED_EXPIRED = "denied_expired"
    DENIED_SUSPENDED = "denied_suspended"
    DENIED_EQUIPMENT_OFFLINE = "denied_equipment_offline"
    DENIED_MAINTENANCE = "denied_maintenance"
    DENIED_RESERVATION_REQUIRED = "denied_reservation_required"
    DENIED_TIME_LIMIT = "denied_time_limit"

class CertificationStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    SUSPENDED = "suspended"
    REVOKED = "revoked"
    PENDING_RENEWAL = "pending_renewal"

# Machine Access Rule Schemas
class MachineAccessRuleCreate(BaseModel):
    equipment_id: str = Field(..., min_length=1)
    required_skill_id: str = Field(..., min_length=1)
    minimum_skill_level: AccessLevel = AccessLevel.BASIC
    
    # Additional requirements
    requires_supervisor: bool = False
    supervisor_skill_level: Optional[AccessLevel] = None
    max_session_hours: Optional[float] = Field(None, ge=0.5, le=24)
    cooldown_hours: Optional[float] = Field(None, ge=0, le=168)
    
    # Safety requirements
    safety_briefing_required: bool = True
    safety_quiz_required: bool = False
    safety_quiz_passing_score: int = Field(default=80, ge=50, le=100)
    
    # Time-based restrictions
    allowed_hours_start: Optional[str] = Field(None, regex=r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
    allowed_hours_end: Optional[str] = Field(None, regex=r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
    allowed_days: Optional[List[str]] = None
    
    # Booking requirements
    advance_booking_required: bool = False
    min_advance_hours: int = Field(default=24, ge=1, le=8760)
    max_advance_days: int = Field(default=30, ge=1, le=365)
    
    # Metadata
    rule_name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    priority: int = Field(default=100, ge=1, le=1000)

class MachineAccessRuleUpdate(BaseModel):
    minimum_skill_level: Optional[AccessLevel] = None
    requires_supervisor: Optional[bool] = None
    supervisor_skill_level: Optional[AccessLevel] = None
    max_session_hours: Optional[float] = Field(None, ge=0.5, le=24)
    cooldown_hours: Optional[float] = Field(None, ge=0, le=168)
    
    safety_briefing_required: Optional[bool] = None
    safety_quiz_required: Optional[bool] = None
    safety_quiz_passing_score: Optional[int] = Field(None, ge=50, le=100)
    
    allowed_hours_start: Optional[str] = Field(None, regex=r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
    allowed_hours_end: Optional[str] = Field(None, regex=r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
    allowed_days: Optional[List[str]] = None
    
    advance_booking_required: Optional[bool] = None
    min_advance_hours: Optional[int] = Field(None, ge=1, le=8760)
    max_advance_days: Optional[int] = Field(None, ge=1, le=365)
    
    rule_name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    priority: Optional[int] = Field(None, ge=1, le=1000)
    is_active: Optional[bool] = None

class MachineAccessRuleResponse(BaseModel):
    id: str
    equipment_id: str
    required_skill_id: str
    minimum_skill_level: AccessLevel
    
    requires_supervisor: bool
    supervisor_skill_level: Optional[AccessLevel]
    max_session_hours: Optional[float]
    cooldown_hours: Optional[float]
    
    safety_briefing_required: bool
    safety_quiz_required: bool
    safety_quiz_passing_score: int
    
    allowed_hours_start: Optional[str]
    allowed_hours_end: Optional[str]
    allowed_days: Optional[List[str]]
    
    advance_booking_required: bool
    min_advance_hours: int
    max_advance_days: int
    
    rule_name: str
    description: Optional[str]
    is_active: bool
    priority: int
    
    created_by: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# User Certification Schemas
class UserCertificationCreate(BaseModel):
    user_id: str = Field(..., min_length=1)
    skill_id: str = Field(..., min_length=1)
    equipment_id: Optional[str] = None
    
    certification_level: AccessLevel
    expires_at: Optional[datetime] = None
    
    certification_method: str = Field(default="manual", max_length=50)
    theory_score: Optional[float] = Field(None, ge=0, le=100)
    practical_score: Optional[float] = Field(None, ge=0, le=100)
    safety_score: Optional[float] = Field(None, ge=0, le=100)
    
    certification_notes: Optional[str] = None

class UserCertificationUpdate(BaseModel):
    certification_level: Optional[AccessLevel] = None
    status: Optional[CertificationStatus] = None
    expires_at: Optional[datetime] = None
    
    theory_score: Optional[float] = Field(None, ge=0, le=100)
    practical_score: Optional[float] = Field(None, ge=0, le=100)
    safety_score: Optional[float] = Field(None, ge=0, le=100)
    
    renewal_notes: Optional[str] = None
    suspension_reason: Optional[str] = None

class UserCertificationResponse(BaseModel):
    id: str
    user_id: str
    skill_id: str
    equipment_id: Optional[str]
    
    certification_level: AccessLevel
    status: CertificationStatus
    
    issued_at: datetime
    expires_at: Optional[datetime]
    last_verified_at: Optional[datetime]
    
    certified_by: str
    certification_method: str
    
    theory_score: Optional[float]
    practical_score: Optional[float]
    safety_score: Optional[float]
    
    total_usage_hours: float
    successful_sessions: int
    failed_sessions: int
    safety_incidents: int
    
    certification_notes: Optional[str]
    renewal_notes: Optional[str]
    suspension_reason: Optional[str]
    
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Badge Schemas
class BadgeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    
    badge_type: BadgeType
    rarity: BadgeRarity = BadgeRarity.COMMON
    category: str = Field(..., min_length=1, max_length=100)
    
    icon_url: Optional[str] = Field(None, max_length=500)
    color_hex: str = Field(default="#4F46E5", regex=r'^#[0-9A-Fa-f]{6}$')
    
    criteria: Dict[str, Any] = Field(..., min_items=1)
    points_value: int = Field(default=10, ge=1, le=1000)
    
    skill_requirements: Optional[List[str]] = None
    prerequisite_badges: Optional[List[str]] = None
    equipment_usage_required: int = Field(default=0, ge=0)
    project_completions_required: int = Field(default=0, ge=0)
    
    auto_award: bool = False
    is_public: bool = True
    makerspace_id: Optional[str] = None

class BadgeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    
    badge_type: Optional[BadgeType] = None
    rarity: Optional[BadgeRarity] = None
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    
    icon_url: Optional[str] = Field(None, max_length=500)
    color_hex: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')
    
    criteria: Optional[Dict[str, Any]] = None
    points_value: Optional[int] = Field(None, ge=1, le=1000)
    
    skill_requirements: Optional[List[str]] = None
    prerequisite_badges: Optional[List[str]] = None
    equipment_usage_required: Optional[int] = Field(None, ge=0)
    project_completions_required: Optional[int] = Field(None, ge=0)
    
    auto_award: Optional[bool] = None
    is_active: Optional[bool] = None
    is_public: Optional[bool] = None

class BadgeResponse(BaseModel):
    id: str
    name: str
    description: str
    
    badge_type: BadgeType
    rarity: BadgeRarity
    category: str
    
    icon_url: Optional[str]
    color_hex: str
    
    criteria: Dict[str, Any]
    points_value: int
    
    skill_requirements: Optional[List[str]]
    prerequisite_badges: Optional[List[str]]
    equipment_usage_required: int
    project_completions_required: int
    
    total_awarded: int
    auto_award: bool
    is_active: bool
    is_public: bool
    
    created_by: str
    makerspace_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# User Badge Schemas
class UserBadgeAward(BaseModel):
    user_id: str = Field(..., min_length=1)
    badge_id: str = Field(..., min_length=1)
    
    earned_through: Optional[str] = Field(None, max_length=100)
    related_entity_id: Optional[str] = None
    achievement_notes: Optional[str] = None
    
    progress_value: float = Field(default=100.0, ge=0, le=100)
    progress_data: Optional[Dict[str, Any]] = None

class UserBadgeUpdate(BaseModel):
    is_featured: Optional[bool] = None
    is_public: Optional[bool] = None
    progress_value: Optional[float] = Field(None, ge=0, le=100)
    progress_data: Optional[Dict[str, Any]] = None

class UserBadgeResponse(BaseModel):
    id: str
    user_id: str
    badge_id: str
    
    awarded_at: datetime
    awarded_by: Optional[str]
    
    earned_through: Optional[str]
    related_entity_id: Optional[str]
    achievement_notes: Optional[str]
    
    progress_value: float
    progress_data: Optional[Dict[str, Any]]
    
    is_featured: bool
    is_public: bool
    
    # Badge details (from relationship)
    badge: Optional[BadgeResponse] = None
    
    class Config:
        orm_mode = True

# Machine Access Schemas
class MachineAccessRequest(BaseModel):
    equipment_id: str = Field(..., min_length=1)
    access_method: str = Field(default="mobile_app", max_length=50)
    session_duration_hours: Optional[float] = Field(None, ge=0.1, le=24)
    purpose: Optional[str] = Field(None, max_length=500)

class MachineAccessResponse(BaseModel):
    success: bool
    result: AccessAttemptResult
    message: str
    
    # If successful
    session_id: Optional[str] = None
    access_expires_at: Optional[datetime] = None
    max_session_duration: Optional[float] = None
    
    # If denied
    denial_reason: Optional[str] = None
    required_certifications: Optional[List[str]] = None
    next_available_time: Optional[datetime] = None

class MachineAccessAttemptResponse(BaseModel):
    id: str
    user_id: str
    equipment_id: str
    certification_id: Optional[str]
    
    attempted_at: datetime
    result: AccessAttemptResult
    access_method: str
    
    session_id: Optional[str]
    denial_reason: Optional[str]
    override_reason: Optional[str]
    supervisor_id: Optional[str]
    
    session_start: Optional[datetime]
    session_end: Optional[datetime]
    session_duration_minutes: Optional[int]
    
    class Config:
        orm_mode = True

# Safety Incident Schemas
class SafetyIncidentCreate(BaseModel):
    equipment_id: Optional[str] = None
    session_id: Optional[str] = None
    
    incident_type: str = Field(..., max_length=100)
    severity: str = Field(..., max_length=50)
    
    title: str = Field(..., min_length=1, max_length=300)
    description: str = Field(..., min_length=1)
    immediate_actions: Optional[str] = None
    
    location: Optional[str] = Field(None, max_length=200)
    occurred_at: datetime
    
    witnesses: Optional[List[str]] = None
    supervisor_notified: Optional[str] = None

class SafetyIncidentUpdate(BaseModel):
    investigation_status: Optional[str] = Field(None, max_length=50)
    investigated_by: Optional[str] = None
    investigation_notes: Optional[str] = None
    root_cause: Optional[str] = None
    
    corrective_actions: Optional[str] = None
    preventive_measures: Optional[str] = None
    training_required: Optional[bool] = None
    equipment_inspection_required: Optional[bool] = None
    
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    
    affects_certification: Optional[bool] = None
    certification_action: Optional[str] = Field(None, max_length=100)

class SafetyIncidentResponse(BaseModel):
    id: str
    user_id: str
    equipment_id: Optional[str]
    session_id: Optional[str]
    
    incident_type: str
    severity: str
    
    title: str
    description: str
    immediate_actions: Optional[str]
    
    location: Optional[str]
    occurred_at: datetime
    reported_at: datetime
    
    reported_by: str
    witnesses: Optional[List[str]]
    supervisor_notified: Optional[str]
    
    investigation_status: str
    investigated_by: Optional[str]
    investigation_notes: Optional[str]
    root_cause: Optional[str]
    
    corrective_actions: Optional[str]
    preventive_measures: Optional[str]
    training_required: bool
    equipment_inspection_required: bool
    
    resolved_at: Optional[datetime]
    resolution_notes: Optional[str]
    
    affects_certification: bool
    certification_action: Optional[str]
    
    class Config:
        orm_mode = True

# Skill Assessment Schemas
class SkillAssessmentCreate(BaseModel):
    user_id: str = Field(..., min_length=1)
    skill_id: str = Field(..., min_length=1)
    equipment_id: Optional[str] = None
    
    assessment_type: str = Field(..., max_length=50)
    target_level: AccessLevel
    
    scheduled_at: Optional[datetime] = None

class SkillAssessmentUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    theory_test_score: Optional[float] = Field(None, ge=0, le=100)
    practical_test_score: Optional[float] = Field(None, ge=0, le=100)
    safety_test_score: Optional[float] = Field(None, ge=0, le=100)
    
    overall_score: Optional[float] = Field(None, ge=0, le=100)
    passed: Optional[bool] = None
    certification_level_achieved: Optional[AccessLevel] = None
    
    assessor_notes: Optional[str] = None
    strengths: Optional[str] = None
    areas_for_improvement: Optional[str] = None
    recommendations: Optional[str] = None
    next_assessment_date: Optional[datetime] = None

class SkillAssessmentResponse(BaseModel):
    id: str
    user_id: str
    skill_id: str
    equipment_id: Optional[str]
    
    assessment_type: str
    target_level: AccessLevel
    
    scheduled_at: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    assessor_id: str
    assessor_notes: Optional[str]
    
    theory_test_score: Optional[float]
    practical_test_score: Optional[float]
    safety_test_score: Optional[float]
    
    overall_score: Optional[float]
    passed: Optional[bool]
    certification_level_achieved: Optional[AccessLevel]
    
    strengths: Optional[str]
    areas_for_improvement: Optional[str]
    recommendations: Optional[str]
    next_assessment_date: Optional[datetime]
    
    class Config:
        orm_mode = True

# Dashboard and Analytics Schemas
class UserAccessProfile(BaseModel):
    user_id: str
    certifications: List[UserCertificationResponse]
    badges: List[UserBadgeResponse]
    recent_access_attempts: List[MachineAccessAttemptResponse]
    safety_record: Dict[str, Any]
    total_equipment_hours: float
    certification_progress: Dict[str, float]

class EquipmentAccessStats(BaseModel):
    equipment_id: str
    total_access_attempts: int
    successful_accesses: int
    denied_accesses: int
    average_session_duration: float
    total_usage_hours: float
    unique_users: int
    certification_requirements: List[str]
    safety_incidents: int

class MakerspaceAccessDashboard(BaseModel):
    total_certified_users: int
    active_certifications: int
    expired_certifications: int
    pending_renewals: int
    equipment_utilization: Dict[str, float]
    badge_distribution: Dict[str, int]
    safety_incident_rate: float
    certification_success_rate: float

class BadgeProgress(BaseModel):
    badge_id: str
    badge_name: str
    progress_percentage: float
    requirements_met: List[str]
    requirements_pending: List[str]
    estimated_completion_date: Optional[datetime]

class CertificationRenewalAlert(BaseModel):
    certification_id: str
    user_id: str
    skill_name: str
    equipment_name: Optional[str]
    expires_at: datetime
    days_until_expiry: int
    renewal_available: bool
    required_actions: List[str]
