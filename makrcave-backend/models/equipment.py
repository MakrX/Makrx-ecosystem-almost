from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime
import enum
import uuid

from ..database import Base

class EquipmentStatus(enum.Enum):
    AVAILABLE = "available"
    IN_USE = "in_use"
    UNDER_MAINTENANCE = "under_maintenance"
    OFFLINE = "offline"

class EquipmentCategory(enum.Enum):
    PRINTER_3D = "printer_3d"
    LASER_CUTTER = "laser_cutter"
    CNC_MACHINE = "cnc_machine"
    TESTING_TOOL = "testing_tool"
    SOLDERING_STATION = "soldering_station"
    WORKSTATION = "workstation"
    HAND_TOOL = "hand_tool"
    MEASURING_TOOL = "measuring_tool"
    GENERAL_TOOL = "general_tool"

class MaintenanceType(enum.Enum):
    ROUTINE = "routine"
    REPAIR = "repair"
    CALIBRATION = "calibration"
    CLEANING = "cleaning"
    REPLACEMENT = "replacement"

class ReservationStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class Equipment(Base):
    __tablename__ = "equipment"
    
    # Primary identification
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = Column(String, unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    
    # Categorization
    category = Column(Enum(EquipmentCategory), nullable=False)
    sub_category = Column(String(100), nullable=True)
    
    # Status and location
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.AVAILABLE)
    location = Column(String(255), nullable=False)
    linked_makerspace_id = Column(String, nullable=False, index=True)
    
    # Scheduling and availability
    available_slots = Column(JSON, nullable=True)  # Weekly schedule as JSON
    
    # Access control
    requires_certification = Column(Boolean, default=False)
    certification_required = Column(String(100), nullable=True)  # Skill/Badge ID
    
    # Maintenance tracking
    last_maintenance_date = Column(DateTime, nullable=True)
    next_maintenance_date = Column(DateTime, nullable=True)
    maintenance_interval_hours = Column(Integer, nullable=True)  # Hours between maintenance
    
    # Usage tracking
    total_usage_hours = Column(Float, default=0.0)
    usage_count = Column(Integer, default=0)
    
    # Equipment details
    manufacturer = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    serial_number = Column(String(100), nullable=True)
    purchase_date = Column(DateTime, nullable=True)
    warranty_expiry = Column(DateTime, nullable=True)
    
    # Pricing and billing
    hourly_rate = Column(Float, nullable=True)
    deposit_required = Column(Float, nullable=True)
    
    # Additional information
    description = Column(Text, nullable=True)
    specifications = Column(JSON, nullable=True)  # Technical specs as JSON
    manual_url = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Ratings and feedback
    average_rating = Column(Float, default=0.0)
    total_ratings = Column(Integer, default=0)
    
    # Record keeping
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=False)
    updated_by = Column(String, nullable=True)
    
    # Relationships
    maintenance_logs = relationship("EquipmentMaintenanceLog", back_populates="equipment", cascade="all, delete-orphan")
    reservations = relationship("EquipmentReservation", back_populates="equipment", cascade="all, delete-orphan")
    ratings = relationship("EquipmentRating", back_populates="equipment", cascade="all, delete-orphan")

    # Enhanced reservation system relationships
    enhanced_reservations = relationship("EnhancedEquipmentReservation", back_populates="equipment", cascade="all, delete-orphan")
    cost_rules = relationship("EquipmentCostRule", back_populates="equipment", cascade="all, delete-orphan")
    skill_gates = relationship("EquipmentSkillGate", back_populates="equipment", cascade="all, delete-orphan")

    # Skill requirements (many-to-many relationship)
    required_skills = relationship("Skill", secondary="skill_equipment", back_populates="equipment")

class EquipmentMaintenanceLog(Base):
    __tablename__ = "equipment_maintenance_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = Column(String, ForeignKey("equipment.id"), nullable=False)
    
    # Maintenance details
    maintenance_type = Column(Enum(MaintenanceType), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Timing
    scheduled_date = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    duration_hours = Column(Float, nullable=True)
    
    # Personnel
    performed_by_user_id = Column(String, nullable=False)
    performed_by_name = Column(String(255), nullable=False)
    supervised_by = Column(String(255), nullable=True)
    
    # Parts and costs
    parts_used = Column(JSON, nullable=True)  # List of parts/materials
    labor_cost = Column(Float, nullable=True)
    parts_cost = Column(Float, nullable=True)
    total_cost = Column(Float, nullable=True)
    
    # Results
    issues_found = Column(Text, nullable=True)
    actions_taken = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    next_maintenance_due = Column(DateTime, nullable=True)
    
    # Status
    is_completed = Column(Boolean, default=False)
    certification_valid = Column(Boolean, default=True)
    
    # Record keeping
    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="maintenance_logs")

class EquipmentReservation(Base):
    __tablename__ = "equipment_reservations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = Column(String, ForeignKey("equipment.id"), nullable=False)
    
    # User information
    user_id = Column(String, nullable=False, index=True)
    user_name = Column(String(255), nullable=False)
    user_email = Column(String(255), nullable=True)
    
    # Reservation timing
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration_hours = Column(Float, nullable=False)
    
    # Status and approval
    status = Column(Enum(ReservationStatus), default=ReservationStatus.PENDING)
    approved_by = Column(String(255), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # Purpose and project linking
    purpose = Column(String(500), nullable=True)
    project_id = Column(String, nullable=True)
    project_name = Column(String(255), nullable=True)
    
    # Access and certification
    certification_verified = Column(Boolean, default=False)
    access_granted_at = Column(DateTime, nullable=True)
    
    # Actual usage tracking
    actual_start_time = Column(DateTime, nullable=True)
    actual_end_time = Column(DateTime, nullable=True)
    actual_duration_hours = Column(Float, nullable=True)
    
    # Billing
    hourly_rate_charged = Column(Float, nullable=True)
    total_cost = Column(Float, nullable=True)
    payment_status = Column(String(50), default="pending")
    
    # Feedback
    user_notes = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    issues_reported = Column(Text, nullable=True)
    
    # Record keeping
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    cancelled_at = Column(DateTime, nullable=True)
    cancellation_reason = Column(String(500), nullable=True)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="reservations")

class EquipmentRating(Base):
    __tablename__ = "equipment_ratings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = Column(String, ForeignKey("equipment.id"), nullable=False)
    
    # User and reservation reference
    user_id = Column(String, nullable=False, index=True)
    user_name = Column(String(255), nullable=False)
    reservation_id = Column(String, ForeignKey("equipment_reservations.id"), nullable=True)
    
    # Rating details
    overall_rating = Column(Integer, nullable=False)  # 1-5 stars
    reliability_rating = Column(Integer, nullable=True)  # 1-5 stars
    ease_of_use_rating = Column(Integer, nullable=True)  # 1-5 stars
    condition_rating = Column(Integer, nullable=True)  # 1-5 stars
    
    # Feedback
    feedback_text = Column(Text, nullable=True)
    pros = Column(Text, nullable=True)
    cons = Column(Text, nullable=True)
    suggestions = Column(Text, nullable=True)
    
    # Issues and recommendations
    issues_encountered = Column(Text, nullable=True)
    would_recommend = Column(Boolean, nullable=True)
    difficulty_level = Column(String(50), nullable=True)  # beginner, intermediate, advanced
    
    # Record keeping
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Moderation
    is_approved = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    admin_response = Column(Text, nullable=True)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="ratings")

class EquipmentUsageSession(Base):
    __tablename__ = "equipment_usage_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = Column(String, ForeignKey("equipment.id"), nullable=False)
    reservation_id = Column(String, ForeignKey("equipment_reservations.id"), nullable=True)
    
    # User information
    user_id = Column(String, nullable=False, index=True)
    user_name = Column(String(255), nullable=False)
    
    # Session timing
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    duration_hours = Column(Float, nullable=True)
    
    # Usage details
    project_id = Column(String, nullable=True)
    project_name = Column(String(255), nullable=True)
    materials_used = Column(JSON, nullable=True)
    settings_used = Column(JSON, nullable=True)
    
    # Outcomes
    job_successful = Column(Boolean, nullable=True)
    output_quality = Column(String(50), nullable=True)  # excellent, good, fair, poor
    issues_encountered = Column(Text, nullable=True)
    
    # Consumption tracking
    power_consumed_kwh = Column(Float, nullable=True)
    material_consumed = Column(JSON, nullable=True)
    
    # Record keeping
    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    
    # Auto-generated fields
    efficiency_score = Column(Float, nullable=True)  # Based on planned vs actual time
    cost_incurred = Column(Float, nullable=True)
