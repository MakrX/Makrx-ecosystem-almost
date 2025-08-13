from sqlalchemy import Column, String, Float, DateTime, Text, Boolean, ForeignKey, JSON, Integer, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from .base import Base

class FilamentMaterial(enum.Enum):
    PLA = "pla"
    ABS = "abs"
    PETG = "petg"
    TPU = "tpu"
    WOOD_PLA = "wood_pla"
    CARBON_FIBER = "carbon_fiber"
    SILK_PLA = "silk_pla"
    GLOW_PLA = "glow_pla"
    METAL_FILL = "metal_fill"
    CONDUCTIVE = "conductive"
    DISSOLVABLE = "dissolvable"
    NYLON = "nylon"
    PC = "polycarbonate"
    ASA = "asa"
    HIPS = "hips"

class FilamentBrand(enum.Enum):
    MAKRX = "makrx"
    HATCHBOX = "hatchbox"
    PRUSAMENT = "prusament"
    POLYMAKER = "polymaker"
    ESUN = "esun"
    OVERTURE = "overture"
    SUNLU = "sunlu"
    GENERIC = "generic"
    OTHER = "other"

class FilamentRollStatus(enum.Enum):
    NEW = "new"
    IN_USE = "in_use"
    LOW = "low"
    EMPTY = "empty"
    DAMAGED = "damaged"
    RESERVED = "reserved"
    ARCHIVED = "archived"

class DeductionMethod(enum.Enum):
    MANUAL = "manual"
    SLICER_ESTIMATE = "slicer_estimate"
    GCODE_ANALYSIS = "gcode_analysis"
    SCALE_MEASUREMENT = "scale_measurement"
    TIME_BASED = "time_based"

class FilamentRoll(Base):
    __tablename__ = "filament_rolls"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    
    # Basic Information
    brand = Column(SQLEnum(FilamentBrand), nullable=False)
    material = Column(SQLEnum(FilamentMaterial), nullable=False)
    color_name = Column(String(100), nullable=False)
    color_hex = Column(String(7), nullable=True)  # Hex color code
    diameter = Column(Float, nullable=False, default=1.75)  # 1.75mm or 3.0mm typically
    
    # Weight and Usage Tracking
    original_weight_g = Column(Float, nullable=False)
    current_weight_g = Column(Float, nullable=False)
    spool_weight_g = Column(Float, nullable=True, default=200.0)  # Empty spool weight
    used_weight_g = Column(Float, nullable=False, default=0.0)
    remaining_weight_g = Column(Float, nullable=False)  # Calculated field
    
    # Length Tracking (optional but useful)
    original_length_m = Column(Float, nullable=True)
    current_length_m = Column(Float, nullable=True)
    used_length_m = Column(Float, nullable=False, default=0.0)
    
    # Cost and Store Integration
    cost_per_kg = Column(Float, nullable=True)
    total_cost = Column(Float, nullable=True)
    makrx_product_code = Column(String(100), nullable=True)  # Link to MakrX Store
    makrx_product_url = Column(String(500), nullable=True)
    purchase_date = Column(DateTime(timezone=True), nullable=True)
    supplier = Column(String(255), nullable=True)
    
    # Physical Properties
    density_g_cm3 = Column(Float, nullable=True, default=1.24)  # Material density
    print_temperature_range = Column(JSON, nullable=True)  # {"min": 190, "max": 220}
    bed_temperature_range = Column(JSON, nullable=True)  # {"min": 50, "max": 70}
    print_speed_range = Column(JSON, nullable=True)  # {"min": 30, "max": 80}
    
    # Status and Location
    status = Column(SQLEnum(FilamentRollStatus), default=FilamentRollStatus.NEW)
    location = Column(String(255), nullable=False)
    storage_conditions = Column(JSON, nullable=True)  # {"humidity": 45, "temperature": 22}
    
    # Quality and Condition
    moisture_level = Column(Float, nullable=True)  # Percentage
    last_dried_date = Column(DateTime(timezone=True), nullable=True)
    quality_notes = Column(Text, nullable=True)
    
    # Auto-deduction Settings
    auto_deduction_enabled = Column(Boolean, default=True)
    deduction_method = Column(SQLEnum(DeductionMethod), default=DeductionMethod.SLICER_ESTIMATE)
    safety_buffer_percentage = Column(Float, default=5.0)  # Reserve 5% for safety
    
    # Alerts and Thresholds
    low_weight_threshold_g = Column(Float, nullable=False, default=100.0)
    reorder_threshold_g = Column(Float, nullable=False, default=200.0)
    auto_reorder_enabled = Column(Boolean, default=False)
    reorder_quantity = Column(Integer, default=1)
    
    # Assignment and Access
    assigned_printer_id = Column(String, ForeignKey("equipment.id"), nullable=True)
    assigned_project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    assigned_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reserved_until = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    qr_code = Column(String(255), nullable=True)  # QR code for tracking
    barcode = Column(String(255), nullable=True)  # Barcode if available
    batch_number = Column(String(100), nullable=True)
    lot_number = Column(String(100), nullable=True)
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    
    # Audit Trail
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Relationships
    makerspace = relationship("Makerspace", back_populates="filament_rolls")
    usage_logs = relationship("FilamentUsageLog", back_populates="filament_roll", cascade="all, delete-orphan")
    assigned_printer = relationship("Equipment", foreign_keys=[assigned_printer_id])
    assigned_project = relationship("Project", foreign_keys=[assigned_project_id])
    assigned_user = relationship("User", foreign_keys=[assigned_user_id])
    created_by_user = relationship("User", foreign_keys=[created_by])
    updated_by_user = relationship("User", foreign_keys=[updated_by])
    
    def __repr__(self):
        return f"<FilamentRoll(brand={self.brand}, material={self.material}, color={self.color_name}, remaining={self.remaining_weight_g}g)>"

    def to_dict(self):
        """Convert filament roll to dictionary for API responses"""
        return {
            "id": str(self.id),
            "makerspace_id": str(self.makerspace_id),
            "brand": self.brand.value if self.brand else None,
            "material": self.material.value if self.material else None,
            "color_name": self.color_name,
            "color_hex": self.color_hex,
            "diameter": self.diameter,
            "original_weight_g": self.original_weight_g,
            "current_weight_g": self.current_weight_g,
            "spool_weight_g": self.spool_weight_g,
            "used_weight_g": self.used_weight_g,
            "remaining_weight_g": self.remaining_weight_g,
            "original_length_m": self.original_length_m,
            "current_length_m": self.current_length_m,
            "used_length_m": self.used_length_m,
            "cost_per_kg": self.cost_per_kg,
            "total_cost": self.total_cost,
            "makrx_product_code": self.makrx_product_code,
            "makrx_product_url": self.makrx_product_url,
            "purchase_date": self.purchase_date.isoformat() if self.purchase_date else None,
            "supplier": self.supplier,
            "density_g_cm3": self.density_g_cm3,
            "print_temperature_range": self.print_temperature_range,
            "bed_temperature_range": self.bed_temperature_range,
            "print_speed_range": self.print_speed_range,
            "status": self.status.value if self.status else None,
            "location": self.location,
            "storage_conditions": self.storage_conditions,
            "moisture_level": self.moisture_level,
            "last_dried_date": self.last_dried_date.isoformat() if self.last_dried_date else None,
            "quality_notes": self.quality_notes,
            "auto_deduction_enabled": self.auto_deduction_enabled,
            "deduction_method": self.deduction_method.value if self.deduction_method else None,
            "safety_buffer_percentage": self.safety_buffer_percentage,
            "low_weight_threshold_g": self.low_weight_threshold_g,
            "reorder_threshold_g": self.reorder_threshold_g,
            "auto_reorder_enabled": self.auto_reorder_enabled,
            "reorder_quantity": self.reorder_quantity,
            "assigned_printer_id": self.assigned_printer_id,
            "assigned_project_id": str(self.assigned_project_id) if self.assigned_project_id else None,
            "assigned_user_id": str(self.assigned_user_id) if self.assigned_user_id else None,
            "reserved_until": self.reserved_until.isoformat() if self.reserved_until else None,
            "qr_code": self.qr_code,
            "barcode": self.barcode,
            "batch_number": self.batch_number,
            "lot_number": self.lot_number,
            "expiry_date": self.expiry_date.isoformat() if self.expiry_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "created_by": str(self.created_by) if self.created_by else None,
            "updated_by": str(self.updated_by) if self.updated_by else None
        }

    def calculate_remaining_weight(self):
        """Calculate and update remaining weight"""
        self.remaining_weight_g = max(0, self.current_weight_g - (self.spool_weight_g or 0))
        return self.remaining_weight_g

    def calculate_usage_percentage(self):
        """Calculate usage percentage"""
        if self.original_weight_g <= 0:
            return 0
        net_original = self.original_weight_g - (self.spool_weight_g or 0)
        return min(100, (self.used_weight_g / net_original) * 100) if net_original > 0 else 0

    def is_low_stock(self):
        """Check if filament is below low stock threshold"""
        return self.remaining_weight_g <= self.low_weight_threshold_g

    def needs_reorder(self):
        """Check if filament needs reordering"""
        return self.remaining_weight_g <= self.reorder_threshold_g

    def can_fulfill_print(self, required_weight_g: float):
        """Check if roll has enough material for a print job"""
        available_weight = self.remaining_weight_g - (self.remaining_weight_g * self.safety_buffer_percentage / 100)
        return available_weight >= required_weight_g

    def estimate_remaining_prints(self, average_print_weight_g: float = 50.0):
        """Estimate how many prints can be done with remaining material"""
        if average_print_weight_g <= 0:
            return 0
        available_weight = self.remaining_weight_g - (self.remaining_weight_g * self.safety_buffer_percentage / 100)
        return max(0, int(available_weight / average_print_weight_g))


class FilamentUsageLog(Base):
    __tablename__ = "filament_usage_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filament_roll_id = Column(UUID(as_uuid=True), ForeignKey("filament_rolls.id"), nullable=False)
    
    # Usage Details
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    weight_used_g = Column(Float, nullable=False)
    length_used_m = Column(Float, nullable=True)
    weight_before_g = Column(Float, nullable=False)
    weight_after_g = Column(Float, nullable=False)
    
    # Deduction Information
    deduction_method = Column(SQLEnum(DeductionMethod), nullable=False)
    confidence_level = Column(Float, nullable=True)  # 0-100% confidence in measurement
    
    # Job/Print Information
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    print_name = Column(String(255), nullable=True)
    gcode_filename = Column(String(255), nullable=True)
    estimated_print_time_minutes = Column(Integer, nullable=True)
    actual_print_time_minutes = Column(Integer, nullable=True)
    
    # Machine and User
    printer_id = Column(String, ForeignKey("equipment.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    user_name = Column(String(255), nullable=False)
    
    # Print Settings Used
    print_settings = Column(JSON, nullable=True)  # Store print settings for analysis
    
    # Quality and Notes
    print_quality = Column(String(50), nullable=True)  # "excellent", "good", "fair", "poor"
    print_success = Column(Boolean, nullable=True)
    failure_reason = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    
    # File Analysis Data
    gcode_analysis = Column(JSON, nullable=True)  # Detailed G-code analysis results
    slicer_estimates = Column(JSON, nullable=True)  # Original slicer estimates
    
    # Manual Override
    is_manual_entry = Column(Boolean, default=False)
    manual_reason = Column(String(255), nullable=True)
    
    # Relationships
    filament_roll = relationship("FilamentRoll", back_populates="usage_logs")
    job = relationship("Job", foreign_keys=[job_id])
    project = relationship("Project", foreign_keys=[project_id])
    printer = relationship("Equipment", foreign_keys=[printer_id])
    user = relationship("User", foreign_keys=[user_id])
    
    def __repr__(self):
        return f"<FilamentUsageLog(roll={self.filament_roll_id}, weight={self.weight_used_g}g, method={self.deduction_method})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "filament_roll_id": str(self.filament_roll_id),
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "weight_used_g": self.weight_used_g,
            "length_used_m": self.length_used_m,
            "weight_before_g": self.weight_before_g,
            "weight_after_g": self.weight_after_g,
            "deduction_method": self.deduction_method.value if self.deduction_method else None,
            "confidence_level": self.confidence_level,
            "job_id": str(self.job_id) if self.job_id else None,
            "project_id": str(self.project_id) if self.project_id else None,
            "print_name": self.print_name,
            "gcode_filename": self.gcode_filename,
            "estimated_print_time_minutes": self.estimated_print_time_minutes,
            "actual_print_time_minutes": self.actual_print_time_minutes,
            "printer_id": self.printer_id,
            "user_id": str(self.user_id) if self.user_id else None,
            "user_name": self.user_name,
            "print_settings": self.print_settings,
            "print_quality": self.print_quality,
            "print_success": self.print_success,
            "failure_reason": self.failure_reason,
            "notes": self.notes,
            "gcode_analysis": self.gcode_analysis,
            "slicer_estimates": self.slicer_estimates,
            "is_manual_entry": self.is_manual_entry,
            "manual_reason": self.manual_reason
        }


class FilamentReorderRequest(Base):
    __tablename__ = "filament_reorder_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filament_roll_id = Column(UUID(as_uuid=True), ForeignKey("filament_rolls.id"), nullable=False)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    
    # Request Details
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    requested_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    urgent = Column(Boolean, default=False)
    
    # Auto-reorder Information
    is_auto_generated = Column(Boolean, default=False)
    trigger_weight_g = Column(Float, nullable=True)  # Weight that triggered auto-reorder
    
    # MakrX Store Integration
    makrx_product_code = Column(String(100), nullable=True)
    makrx_order_url = Column(String(500), nullable=True)
    estimated_cost = Column(Float, nullable=True)
    estimated_delivery_date = Column(DateTime(timezone=True), nullable=True)
    
    # Status Tracking
    status = Column(String(50), default="pending")  # "pending", "ordered", "delivered", "cancelled"
    order_reference = Column(String(255), nullable=True)
    tracking_number = Column(String(255), nullable=True)
    
    # Fulfillment
    ordered_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    cancellation_reason = Column(String(255), nullable=True)
    
    # Notes and Priority
    notes = Column(Text, nullable=True)
    priority_level = Column(Integer, default=1)  # 1-5, higher is more urgent
    
    # Relationships
    filament_roll = relationship("FilamentRoll")
    makerspace = relationship("Makerspace")
    requested_by_user = relationship("User", foreign_keys=[requested_by])
    
    def __repr__(self):
        return f"<FilamentReorderRequest(roll={self.filament_roll_id}, qty={self.quantity}, status={self.status})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "filament_roll_id": str(self.filament_roll_id),
            "makerspace_id": str(self.makerspace_id),
            "requested_at": self.requested_at.isoformat() if self.requested_at else None,
            "requested_by": str(self.requested_by) if self.requested_by else None,
            "quantity": self.quantity,
            "urgent": self.urgent,
            "is_auto_generated": self.is_auto_generated,
            "trigger_weight_g": self.trigger_weight_g,
            "makrx_product_code": self.makrx_product_code,
            "makrx_order_url": self.makrx_order_url,
            "estimated_cost": self.estimated_cost,
            "estimated_delivery_date": self.estimated_delivery_date.isoformat() if self.estimated_delivery_date else None,
            "status": self.status,
            "order_reference": self.order_reference,
            "tracking_number": self.tracking_number,
            "ordered_at": self.ordered_at.isoformat() if self.ordered_at else None,
            "delivered_at": self.delivered_at.isoformat() if self.delivered_at else None,
            "cancelled_at": self.cancelled_at.isoformat() if self.cancelled_at else None,
            "cancellation_reason": self.cancellation_reason,
            "notes": self.notes,
            "priority_level": self.priority_level
        }


class FilamentCompatibility(Base):
    __tablename__ = "filament_compatibility"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    printer_id = Column(String, ForeignKey("equipment.id"), nullable=False)
    material = Column(SQLEnum(FilamentMaterial), nullable=False)
    
    # Compatibility Information
    is_compatible = Column(Boolean, nullable=False, default=True)
    requires_enclosure = Column(Boolean, default=False)
    requires_heated_bed = Column(Boolean, default=False)
    max_temperature = Column(Integer, nullable=True)
    recommended_settings = Column(JSON, nullable=True)
    
    # Notes and Warnings
    compatibility_notes = Column(Text, nullable=True)
    safety_warnings = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    printer = relationship("Equipment", foreign_keys=[printer_id])
    
    def __repr__(self):
        return f"<FilamentCompatibility(printer={self.printer_id}, material={self.material}, compatible={self.is_compatible})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "printer_id": self.printer_id,
            "material": self.material.value if self.material else None,
            "is_compatible": self.is_compatible,
            "requires_enclosure": self.requires_enclosure,
            "requires_heated_bed": self.requires_heated_bed,
            "max_temperature": self.max_temperature,
            "recommended_settings": self.recommended_settings,
            "compatibility_notes": self.compatibility_notes,
            "safety_warnings": self.safety_warnings,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
