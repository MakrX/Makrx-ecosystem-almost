from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Float, Integer, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid
from datetime import datetime

from ..database import Base

class ReservationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"
    REJECTED = "rejected"

class PaymentStatus(str, enum.Enum):
    NOT_REQUIRED = "not_required"
    PENDING = "pending"
    AUTHORIZED = "authorized"
    PAID = "paid"
    REFUNDED = "refunded"
    FAILED = "failed"

class CostRuleType(str, enum.Enum):
    FLAT_RATE = "flat_rate"
    HOURLY_RATE = "hourly_rate"
    TIER_BASED = "tier_based"
    MEMBERSHIP_DISCOUNT = "membership_discount"
    SKILL_PREMIUM = "skill_premium"
    TIME_OF_DAY = "time_of_day"
    DAY_OF_WEEK = "day_of_week"
    DEPOSIT_REQUIRED = "deposit_required"

class SkillGateType(str, enum.Enum):
    REQUIRED_SKILL = "required_skill"
    CERTIFICATION = "certification"
    EXPERIENCE_LEVEL = "experience_level"
    TRAINING_COMPLETED = "training_completed"
    SUPERVISOR_REQUIRED = "supervisor_required"

class EnhancedEquipmentReservation(Base):
    """Enhanced equipment reservation with comprehensive cost and skill management"""
    __tablename__ = "enhanced_equipment_reservations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = Column(String, ForeignKey("equipment.id"), nullable=False)
    
    # User information
    user_id = Column(String, nullable=False, index=True)
    user_name = Column(String(255), nullable=False)
    user_email = Column(String(255), nullable=True)
    user_membership_tier = Column(String(50), nullable=True)  # For tier-based pricing
    
    # Reservation timing
    requested_start = Column(DateTime(timezone=True), nullable=False)
    requested_end = Column(DateTime(timezone=True), nullable=False)
    duration_hours = Column(Float, nullable=False)
    buffer_time_before = Column(Integer, default=15)  # Minutes
    buffer_time_after = Column(Integer, default=15)   # Minutes
    
    # Actual usage tracking
    actual_start = Column(DateTime(timezone=True), nullable=True)
    actual_end = Column(DateTime(timezone=True), nullable=True)
    actual_duration_hours = Column(Float, nullable=True)
    
    # Status management
    status = Column(Enum(ReservationStatus), default=ReservationStatus.PENDING)
    approved_by = Column(String(255), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Purpose and project linking
    purpose = Column(String(500), nullable=True)
    project_id = Column(String, nullable=True)
    project_name = Column(String(255), nullable=True)
    
    # Skill and certification verification
    required_skills_verified = Column(Boolean, default=False)
    skill_verification_by = Column(String(255), nullable=True)
    skill_verification_at = Column(DateTime(timezone=True), nullable=True)
    skill_verification_notes = Column(Text, nullable=True)
    
    # Cost calculation and billing
    base_cost = Column(Float, nullable=True)
    additional_fees = Column(JSON, nullable=True)  # List of additional fee objects
    discounts = Column(JSON, nullable=True)        # List of discount objects
    total_cost = Column(Float, nullable=True)
    estimated_cost = Column(Float, nullable=True)  # Shown during booking
    
    # Payment processing
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.NOT_REQUIRED)
    payment_method = Column(String(50), nullable=True)
    payment_transaction_id = Column(String(100), nullable=True)
    deposit_amount = Column(Float, nullable=True)
    deposit_paid = Column(Boolean, default=False)
    deposit_refunded = Column(Boolean, default=False)
    
    # Equipment access control
    access_granted = Column(Boolean, default=False)
    access_granted_at = Column(DateTime(timezone=True), nullable=True)
    access_revoked_at = Column(DateTime(timezone=True), nullable=True)
    access_code = Column(String(20), nullable=True)  # For keycard/PIN access
    
    # Supervisor requirements
    supervisor_required = Column(Boolean, default=False)
    supervisor_assigned = Column(String(255), nullable=True)
    supervisor_confirmed = Column(Boolean, default=False)
    supervisor_notes = Column(Text, nullable=True)
    
    # Feedback and notes
    user_notes = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    issues_reported = Column(Text, nullable=True)
    equipment_condition_before = Column(String(50), nullable=True)  # excellent, good, fair, poor
    equipment_condition_after = Column(String(50), nullable=True)
    
    # Recurring reservations
    is_recurring = Column(Boolean, default=False)
    recurring_pattern = Column(JSON, nullable=True)  # weekly, monthly, custom pattern
    parent_reservation_id = Column(String, ForeignKey("enhanced_equipment_reservations.id"), nullable=True)
    
    # Emergency and special handling
    is_emergency = Column(Boolean, default=False)
    emergency_justification = Column(Text, nullable=True)
    priority_level = Column(Integer, default=0)  # 0=normal, 1=high, 2=urgent, 3=emergency
    
    # Automatic cancellation
    auto_cancel_at = Column(DateTime(timezone=True), nullable=True)
    auto_cancel_reason = Column(String(200), nullable=True)
    
    # Record keeping
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    cancellation_reason = Column(String(500), nullable=True)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="enhanced_reservations")
    parent_reservation = relationship("EnhancedEquipmentReservation", remote_side=[id], backref="child_reservations")
    cost_breakdown = relationship("ReservationCostBreakdown", back_populates="reservation", cascade="all, delete-orphan")
    skill_verifications = relationship("ReservationSkillVerification", back_populates="reservation", cascade="all, delete-orphan")

class EquipmentCostRule(Base):
    """Cost rules for equipment pricing"""
    __tablename__ = "equipment_cost_rules"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = Column(String, ForeignKey("equipment.id"), nullable=False)
    
    # Rule identification
    rule_name = Column(String(200), nullable=False)
    rule_type = Column(Enum(CostRuleType), nullable=False)
    description = Column(Text, nullable=True)
    
    # Rule configuration
    base_amount = Column(Float, nullable=True)
    rate_per_hour = Column(Float, nullable=True)
    minimum_charge = Column(Float, nullable=True)
    maximum_charge = Column(Float, nullable=True)
    
    # Tier-based pricing
    tier_config = Column(JSON, nullable=True)  # {tier_name: rate} mapping
    
    # Time-based rules
    time_conditions = Column(JSON, nullable=True)  # Day of week, time of day conditions
    
    # Membership discounts
    membership_discounts = Column(JSON, nullable=True)  # {membership_tier: discount_percentage}
    
    # Skill premiums (higher cost for advanced equipment)
    skill_premiums = Column(JSON, nullable=True)  # {skill_level: premium_percentage}
    
    # Rule activation
    is_active = Column(Boolean, default=True)
    effective_from = Column(DateTime(timezone=True), nullable=True)
    effective_until = Column(DateTime(timezone=True), nullable=True)
    
    # Priority (higher number = higher priority when multiple rules apply)
    priority = Column(Integer, default=0)
    
    # Application conditions
    applies_to_users = Column(JSON, nullable=True)  # List of user IDs or groups
    applies_to_projects = Column(JSON, nullable=True)  # List of project types
    minimum_duration = Column(Float, nullable=True)  # Minimum hours for rule to apply
    maximum_duration = Column(Float, nullable=True)  # Maximum hours for rule to apply
    
    # Record keeping
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(String(255), nullable=False)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="cost_rules")

class EquipmentSkillGate(Base):
    """Skill gates for equipment access control"""
    __tablename__ = "equipment_skill_gates"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = Column(String, ForeignKey("equipment.id"), nullable=False)
    
    # Gate identification
    gate_name = Column(String(200), nullable=False)
    gate_type = Column(Enum(SkillGateType), nullable=False)
    description = Column(Text, nullable=True)
    
    # Skill requirements
    required_skill_id = Column(String, nullable=True)  # Reference to skill system
    required_skill_level = Column(String(50), nullable=True)  # beginner, intermediate, advanced, expert
    required_certification = Column(String(200), nullable=True)
    required_training_modules = Column(JSON, nullable=True)  # List of training module IDs
    
    # Experience requirements
    minimum_experience_hours = Column(Float, nullable=True)
    minimum_project_count = Column(Integer, nullable=True)
    
    # Supervisor requirements
    requires_supervisor = Column(Boolean, default=False)
    supervisor_skill_level = Column(String(50), nullable=True)
    supervisor_roles = Column(JSON, nullable=True)  # List of roles that can supervise
    
    # Time restrictions
    allowed_hours = Column(JSON, nullable=True)  # Weekly schedule when skill gate applies
    restricted_hours = Column(JSON, nullable=True)  # Times when extra supervision needed
    
    # Grace period and override
    grace_period_days = Column(Integer, default=0)  # Days after cert expiry before blocking
    allow_admin_override = Column(Boolean, default=True)
    emergency_bypass_allowed = Column(Boolean, default=False)
    
    # Automatic verification
    auto_verify_from_system = Column(Boolean, default=True)  # Auto-check user skills
    manual_verification_required = Column(Boolean, default=False)
    
    # Enforcement level
    enforcement_level = Column(String(20), default="block")  # block, warn, log_only
    warning_message = Column(Text, nullable=True)
    
    # Gate activation
    is_active = Column(Boolean, default=True)
    effective_from = Column(DateTime(timezone=True), nullable=True)
    effective_until = Column(DateTime(timezone=True), nullable=True)
    
    # Record keeping
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(String(255), nullable=False)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="skill_gates")

class ReservationCostBreakdown(Base):
    """Detailed cost breakdown for reservations"""
    __tablename__ = "reservation_cost_breakdown"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    reservation_id = Column(String, ForeignKey("enhanced_equipment_reservations.id"), nullable=False)
    
    # Cost item details
    cost_type = Column(String(50), nullable=False)  # base_rate, deposit, premium, discount, tax
    description = Column(String(200), nullable=False)
    rule_applied = Column(String(200), nullable=True)  # Which cost rule generated this
    
    # Calculation details
    base_amount = Column(Float, nullable=False)
    quantity = Column(Float, default=1.0)
    rate = Column(Float, nullable=True)
    percentage = Column(Float, nullable=True)  # For percentage-based fees/discounts
    calculated_amount = Column(Float, nullable=False)
    
    # Timing
    applies_from = Column(DateTime(timezone=True), nullable=True)
    applies_until = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    is_refundable = Column(Boolean, default=True)
    is_taxable = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    
    # Relationships
    reservation = relationship("EnhancedEquipmentReservation", back_populates="cost_breakdown")

class ReservationSkillVerification(Base):
    """Track skill verification for reservations"""
    __tablename__ = "reservation_skill_verifications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    reservation_id = Column(String, ForeignKey("enhanced_equipment_reservations.id"), nullable=False)
    skill_gate_id = Column(String, ForeignKey("equipment_skill_gates.id"), nullable=False)
    
    # Verification details
    skill_verified = Column(Boolean, default=False)
    verification_method = Column(String(50), nullable=True)  # auto, manual, override
    verified_by = Column(String(255), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Verification data
    skill_level_verified = Column(String(50), nullable=True)
    certification_number = Column(String(100), nullable=True)
    certification_expiry = Column(DateTime(timezone=True), nullable=True)
    
    # Notes and documentation
    verification_notes = Column(Text, nullable=True)
    documentation_urls = Column(JSON, nullable=True)  # Links to certificates, etc.
    
    # Override handling
    is_override = Column(Boolean, default=False)
    override_reason = Column(Text, nullable=True)
    override_approved_by = Column(String(255), nullable=True)
    
    # Relationships
    reservation = relationship("EnhancedEquipmentReservation", back_populates="skill_verifications")
    skill_gate = relationship("EquipmentSkillGate")

class EquipmentAvailabilitySlot(Base):
    """Pre-defined availability slots for equipment"""
    __tablename__ = "equipment_availability_slots"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = Column(String, ForeignKey("equipment.id"), nullable=False)
    
    # Slot timing
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(String(5), nullable=False)  # HH:MM format
    end_time = Column(String(5), nullable=False)    # HH:MM format
    
    # Slot configuration
    max_concurrent_reservations = Column(Integer, default=1)
    slot_duration_minutes = Column(Integer, default=60)
    buffer_between_slots = Column(Integer, default=15)  # Minutes
    
    # Restrictions
    requires_advance_booking_hours = Column(Integer, default=24)
    max_advance_booking_days = Column(Integer, default=30)
    minimum_slot_duration = Column(Integer, default=30)  # Minutes
    maximum_slot_duration = Column(Integer, default=480)  # Minutes (8 hours)
    
    # Access control
    restricted_to_members = Column(JSON, nullable=True)  # List of membership tiers
    restricted_to_skills = Column(JSON, nullable=True)   # List of required skills
    
    # Pricing override
    override_hourly_rate = Column(Float, nullable=True)
    peak_time_multiplier = Column(Float, default=1.0)
    
    # Special handling
    is_maintenance_slot = Column(Boolean, default=False)
    is_training_slot = Column(Boolean, default=False)
    supervisor_required = Column(Boolean, default=False)
    
    # Slot activation
    is_active = Column(Boolean, default=True)
    effective_from = Column(DateTime(timezone=True), nullable=True)
    effective_until = Column(DateTime(timezone=True), nullable=True)
    
    # Record keeping
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String(255), nullable=False)
    
    # Relationships
    equipment = relationship("Equipment")

class ReservationConflictLog(Base):
    """Log reservation conflicts and resolutions"""
    __tablename__ = "reservation_conflict_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = Column(String, ForeignKey("equipment.id"), nullable=False)
    
    # Conflict details
    conflict_type = Column(String(50), nullable=False)  # double_booking, skill_gate, maintenance, etc.
    primary_reservation_id = Column(String, ForeignKey("enhanced_equipment_reservations.id"), nullable=True)
    conflicting_reservation_id = Column(String, ForeignKey("enhanced_equipment_reservations.id"), nullable=True)
    
    # Conflict description
    conflict_description = Column(Text, nullable=False)
    severity = Column(String(20), default="medium")  # low, medium, high, critical
    
    # Resolution
    resolution_action = Column(String(100), nullable=True)  # cancelled, rescheduled, overridden, etc.
    resolved_by = Column(String(255), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    # Automatic handling
    auto_resolved = Column(Boolean, default=False)
    notification_sent = Column(Boolean, default=False)
    
    # Record keeping
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    equipment = relationship("Equipment")
    primary_reservation = relationship("EnhancedEquipmentReservation", foreign_keys=[primary_reservation_id])
    conflicting_reservation = relationship("EnhancedEquipmentReservation", foreign_keys=[conflicting_reservation_id])
