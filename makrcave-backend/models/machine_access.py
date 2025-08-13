from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, Float, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database import Base

class AccessLevel(str, enum.Enum):
    BASIC = "basic"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"
    MAINTENANCE = "maintenance"

class BadgeType(str, enum.Enum):
    SKILL_CERTIFICATION = "skill_certification"
    SAFETY_TRAINING = "safety_training"
    EQUIPMENT_MASTERY = "equipment_mastery"
    PROJECT_COMPLETION = "project_completion"
    COMMUNITY_CONTRIBUTION = "community_contribution"
    TIME_MILESTONE = "time_milestone"
    QUALITY_ACHIEVEMENT = "quality_achievement"
    INNOVATION_AWARD = "innovation_award"

class BadgeRarity(str, enum.Enum):
    COMMON = "common"
    UNCOMMON = "uncommon"
    RARE = "rare"
    EPIC = "epic"
    LEGENDARY = "legendary"

class AccessAttemptResult(str, enum.Enum):
    GRANTED = "granted"
    DENIED_NO_SKILL = "denied_no_skill"
    DENIED_EXPIRED = "denied_expired"
    DENIED_SUSPENDED = "denied_suspended"
    DENIED_EQUIPMENT_OFFLINE = "denied_equipment_offline"
    DENIED_MAINTENANCE = "denied_maintenance"
    DENIED_RESERVATION_REQUIRED = "denied_reservation_required"
    DENIED_TIME_LIMIT = "denied_time_limit"

class CertificationStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    SUSPENDED = "suspended"
    REVOKED = "revoked"
    PENDING_RENEWAL = "pending_renewal"

class MachineAccessRule(Base):
    __tablename__ = "machine_access_rules"

    id = Column(String(100), primary_key=True, index=True)
    equipment_id = Column(String(100), ForeignKey("equipment.id"), nullable=False)
    
    # Access requirements
    required_skill_id = Column(String(100), ForeignKey("skills.id"), nullable=False)
    minimum_skill_level = Column(Enum(AccessLevel), nullable=False, default=AccessLevel.BASIC)
    
    # Additional requirements
    requires_supervisor = Column(Boolean, default=False)
    supervisor_skill_level = Column(Enum(AccessLevel), nullable=True)
    max_session_hours = Column(Float, nullable=True)  # Maximum continuous usage
    cooldown_hours = Column(Float, nullable=True)  # Hours between sessions
    
    # Safety requirements
    safety_briefing_required = Column(Boolean, default=True)
    safety_quiz_required = Column(Boolean, default=False)
    safety_quiz_passing_score = Column(Integer, default=80)
    
    # Time-based restrictions
    allowed_hours_start = Column(String(5), nullable=True)  # "09:00"
    allowed_hours_end = Column(String(5), nullable=True)    # "17:00"
    allowed_days = Column(JSON, nullable=True)  # ["monday", "tuesday", ...]
    
    # Booking requirements
    advance_booking_required = Column(Boolean, default=False)
    min_advance_hours = Column(Integer, default=24)
    max_advance_days = Column(Integer, default=30)
    
    # Metadata
    rule_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=100)  # Lower number = higher priority
    
    # Audit fields
    created_by = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    equipment = relationship("Equipment", back_populates="access_rules")
    skill = relationship("Skill", back_populates="access_rules")

class UserCertification(Base):
    __tablename__ = "user_certifications"

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    skill_id = Column(String(100), ForeignKey("skills.id"), nullable=False)
    equipment_id = Column(String(100), ForeignKey("equipment.id"), nullable=True)
    
    # Certification details
    certification_level = Column(Enum(AccessLevel), nullable=False)
    status = Column(Enum(CertificationStatus), nullable=False, default=CertificationStatus.ACTIVE)
    
    # Validity
    issued_at = Column(DateTime(timezone=True), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    last_verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Certification process
    certified_by = Column(String(100), nullable=False)  # User ID of certifier
    certification_method = Column(String(50), default="manual")  # manual, quiz, practical_test
    
    # Assessment results
    theory_score = Column(Float, nullable=True)  # Percentage score
    practical_score = Column(Float, nullable=True)  # Percentage score
    safety_score = Column(Float, nullable=True)  # Safety assessment score
    
    # Usage tracking
    total_usage_hours = Column(Float, default=0.0)
    successful_sessions = Column(Integer, default=0)
    failed_sessions = Column(Integer, default=0)
    safety_incidents = Column(Integer, default=0)
    
    # Notes and comments
    certification_notes = Column(Text, nullable=True)
    renewal_notes = Column(Text, nullable=True)
    suspension_reason = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    skill = relationship("Skill", back_populates="certifications")
    equipment = relationship("Equipment", back_populates="certifications")
    access_attempts = relationship("MachineAccessAttempt", back_populates="certification")

class Badge(Base):
    __tablename__ = "badges"

    id = Column(String(100), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    # Badge classification
    badge_type = Column(Enum(BadgeType), nullable=False)
    rarity = Column(Enum(BadgeRarity), nullable=False, default=BadgeRarity.COMMON)
    category = Column(String(100), nullable=False)  # "3d_printing", "safety", "collaboration"
    
    # Visual representation
    icon_url = Column(String(500), nullable=True)
    color_hex = Column(String(7), default="#4F46E5")  # Default indigo
    
    # Achievement criteria
    criteria = Column(JSON, nullable=False)  # Structured criteria for earning badge
    points_value = Column(Integer, default=10)  # Points awarded for earning this badge
    
    # Requirements
    skill_requirements = Column(JSON, nullable=True)  # Required skills to earn
    prerequisite_badges = Column(JSON, nullable=True)  # Required badges to earn
    equipment_usage_required = Column(Integer, default=0)  # Hours of equipment usage
    project_completions_required = Column(Integer, default=0)
    
    # Achievement tracking
    total_awarded = Column(Integer, default=0)
    auto_award = Column(Boolean, default=False)  # Automatically award when criteria met
    
    # Metadata
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=True)  # Visible in public badge gallery
    created_by = Column(String(100), nullable=False)
    makerspace_id = Column(String(100), nullable=True)  # Makerspace-specific badge
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user_badges = relationship("UserBadge", back_populates="badge")

class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    badge_id = Column(String(100), ForeignKey("badges.id"), nullable=False)
    
    # Award details
    awarded_at = Column(DateTime(timezone=True), server_default=func.now())
    awarded_by = Column(String(100), nullable=True)  # User who manually awarded (if applicable)
    
    # Context of earning
    earned_through = Column(String(100), nullable=True)  # "project_completion", "equipment_mastery", etc.
    related_entity_id = Column(String(100), nullable=True)  # Project ID, Equipment ID, etc.
    achievement_notes = Column(Text, nullable=True)
    
    # Progress tracking (for progressive badges)
    progress_value = Column(Float, default=100.0)  # Percentage of badge completion
    progress_data = Column(JSON, nullable=True)  # Additional progress metadata
    
    # Display preferences
    is_featured = Column(Boolean, default=False)  # Show prominently on profile
    is_public = Column(Boolean, default=True)  # Visible to other users
    
    # Relationships
    badge = relationship("Badge", back_populates="user_badges")

class MachineAccessAttempt(Base):
    __tablename__ = "machine_access_attempts"

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    equipment_id = Column(String(100), ForeignKey("equipment.id"), nullable=False)
    certification_id = Column(String(100), ForeignKey("user_certifications.id"), nullable=True)
    
    # Attempt details
    attempted_at = Column(DateTime(timezone=True), server_default=func.now())
    result = Column(Enum(AccessAttemptResult), nullable=False)
    
    # Context
    access_method = Column(String(50), default="rfid_card")  # rfid_card, mobile_app, admin_override
    session_id = Column(String(100), nullable=True)  # For tracking ongoing sessions
    
    # Location and device info
    access_point_id = Column(String(100), nullable=True)  # RFID reader, terminal ID
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    # Additional data
    denial_reason = Column(Text, nullable=True)  # Detailed reason for denial
    override_reason = Column(Text, nullable=True)  # Reason for admin override
    supervisor_id = Column(String(100), nullable=True)  # Supervising user if required
    
    # Session tracking
    session_start = Column(DateTime(timezone=True), nullable=True)
    session_end = Column(DateTime(timezone=True), nullable=True)
    session_duration_minutes = Column(Integer, nullable=True)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="access_attempts")
    certification = relationship("UserCertification", back_populates="access_attempts")

class SafetyIncident(Base):
    __tablename__ = "safety_incidents"

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    equipment_id = Column(String(100), ForeignKey("equipment.id"), nullable=True)
    session_id = Column(String(100), nullable=True)
    
    # Incident details
    incident_type = Column(String(100), nullable=False)  # "injury", "near_miss", "equipment_damage", "policy_violation"
    severity = Column(String(50), nullable=False)  # "low", "medium", "high", "critical"
    
    # Description
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    immediate_actions = Column(Text, nullable=True)
    
    # Location and timing
    location = Column(String(200), nullable=True)
    occurred_at = Column(DateTime(timezone=True), nullable=False)
    reported_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # People involved
    reported_by = Column(String(100), nullable=False)
    witnesses = Column(JSON, nullable=True)  # List of witness user IDs
    supervisor_notified = Column(String(100), nullable=True)
    
    # Investigation
    investigation_status = Column(String(50), default="pending")  # pending, in_progress, completed
    investigated_by = Column(String(100), nullable=True)
    investigation_notes = Column(Text, nullable=True)
    root_cause = Column(Text, nullable=True)
    
    # Follow-up actions
    corrective_actions = Column(Text, nullable=True)
    preventive_measures = Column(Text, nullable=True)
    training_required = Column(Boolean, default=False)
    equipment_inspection_required = Column(Boolean, default=False)
    
    # Resolution
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    # Impact on certifications
    affects_certification = Column(Boolean, default=False)
    certification_action = Column(String(100), nullable=True)  # "suspend", "revoke", "retrain"
    
    # Relationships
    equipment = relationship("Equipment", back_populates="safety_incidents")

class SkillAssessment(Base):
    __tablename__ = "skill_assessments"

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    skill_id = Column(String(100), ForeignKey("skills.id"), nullable=False)
    equipment_id = Column(String(100), ForeignKey("equipment.id"), nullable=True)
    
    # Assessment details
    assessment_type = Column(String(50), nullable=False)  # "initial", "renewal", "retest", "upgrade"
    target_level = Column(Enum(AccessLevel), nullable=False)
    
    # Scheduling
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Assessor information
    assessor_id = Column(String(100), nullable=False)
    assessor_notes = Column(Text, nullable=True)
    
    # Assessment components
    theory_test_score = Column(Float, nullable=True)  # Percentage
    practical_test_score = Column(Float, nullable=True)  # Percentage
    safety_test_score = Column(Float, nullable=True)  # Percentage
    
    # Results
    overall_score = Column(Float, nullable=True)  # Weighted average
    passed = Column(Boolean, nullable=True)
    certification_level_achieved = Column(Enum(AccessLevel), nullable=True)
    
    # Feedback
    strengths = Column(Text, nullable=True)
    areas_for_improvement = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    next_assessment_date = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    skill = relationship("Skill", back_populates="assessments")
    equipment = relationship("Equipment", back_populates="assessments")

class AccessControlPolicy(Base):
    __tablename__ = "access_control_policies"

    id = Column(String(100), primary_key=True, index=True)
    makerspace_id = Column(String(100), nullable=False, index=True)
    
    # Policy details
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    # Policy configuration
    default_access_level = Column(Enum(AccessLevel), default=AccessLevel.BASIC)
    require_induction = Column(Boolean, default=True)
    induction_validity_months = Column(Integer, default=12)
    
    # Session limits
    max_daily_hours = Column(Float, default=8.0)
    max_weekly_hours = Column(Float, default=40.0)
    max_continuous_hours = Column(Float, default=4.0)
    
    # Safety requirements
    safety_training_required = Column(Boolean, default=True)
    safety_refresh_months = Column(Integer, default=12)
    incident_reporting_required = Column(Boolean, default=True)
    
    # Supervision requirements
    supervision_required_for = Column(JSON, nullable=True)  # List of equipment categories
    supervisor_certification_level = Column(Enum(AccessLevel), default=AccessLevel.ADVANCED)
    
    # Renewal and maintenance
    certification_renewal_months = Column(Integer, default=24)
    grace_period_days = Column(Integer, default=30)
    auto_suspend_after_incidents = Column(Integer, default=3)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_by = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# Add relationships to existing models (would be added to skill.py and equipment.py)
"""
# Add to Skill model:
access_rules = relationship("MachineAccessRule", back_populates="skill")
certifications = relationship("UserCertification", back_populates="skill")
assessments = relationship("SkillAssessment", back_populates="skill")

# Add to Equipment model:
access_rules = relationship("MachineAccessRule", back_populates="equipment")
certifications = relationship("UserCertification", back_populates="equipment")
access_attempts = relationship("MachineAccessAttempt", back_populates="equipment")
safety_incidents = relationship("SafetyIncident", back_populates="equipment")
assessments = relationship("SkillAssessment", back_populates="equipment")
"""
