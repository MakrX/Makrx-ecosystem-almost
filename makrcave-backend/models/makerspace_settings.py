from sqlalchemy import Column, String, Boolean, Integer, Float, ForeignKey, JSON, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from .base import Base

class ThemeMode(enum.Enum):
    DARK = "dark"
    LIGHT = "light"
    CUSTOM = "custom"

class PrintTechnology(enum.Enum):
    FDM = "fdm"
    SLA = "sla"
    SLS = "sls"
    POLYJET = "polyjet"
    CARBON_FIBER = "carbon_fiber"

class MakerspaceSettings(Base):
    __tablename__ = "makerspace_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), unique=True, nullable=False)
    
    # General Information
    makerspace_name = Column(String(255), nullable=True)
    logo_url = Column(String(500), nullable=True)
    description = Column(String(2000), nullable=True)
    address = Column(String(500), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    timezone = Column(String(50), default="Asia/Kolkata")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    operating_hours = Column(JSON, nullable=True)  # Store as JSON: {"monday": {"open": "09:00", "close": "18:00"}, ...}
    
    # Access Settings
    membership_required = Column(Boolean, default=True)
    public_registration = Column(Boolean, default=False)
    skill_gated_access = Column(Boolean, default=True)
    enable_reservations = Column(Boolean, default=True)
    auto_approve_members = Column(Boolean, default=False)
    
    # Inventory Settings
    filament_deduction_enabled = Column(Boolean, default=True)
    minimum_stock_alerts = Column(Boolean, default=True)
    stock_threshold_notification = Column(Boolean, default=True)
    allow_personal_consumables = Column(Boolean, default=False)
    store_inventory_sync = Column(Boolean, default=False)
    default_stock_threshold = Column(Integer, default=10)
    
    # Billing Settings
    credit_system_enabled = Column(Boolean, default=False)
    show_job_cost_estimates = Column(Boolean, default=True)
    default_tax_percent = Column(Float, default=18.0)
    default_currency = Column(String(3), default="INR")
    razorpay_key_override = Column(String(255), nullable=True)
    stripe_key_override = Column(String(255), nullable=True)
    enable_membership_billing = Column(Boolean, default=True)
    
    # Service Provider Mode
    service_mode_enabled = Column(Boolean, default=False)
    accept_jobs_from_store = Column(Boolean, default=False)
    allowed_print_technologies = Column(JSON, nullable=True)  # List of PrintTechnology values
    delivery_radius_km = Column(Integer, default=10)
    default_service_fee_percent = Column(Float, default=5.0)
    auto_job_assignment = Column(Boolean, default=False)
    
    # Appearance Settings
    theme_mode = Column(SQLEnum(ThemeMode), default=ThemeMode.LIGHT)
    custom_theme_colors = Column(JSON, nullable=True)  # Custom color palette
    landing_page_cta = Column(String(255), nullable=True)
    welcome_message = Column(String(1000), nullable=True)
    enable_chat_widget = Column(Boolean, default=False)
    enable_help_widget = Column(Boolean, default=True)
    custom_css = Column(String(5000), nullable=True)
    
    # Notification Settings
    email_notifications_enabled = Column(Boolean, default=True)
    sms_notifications_enabled = Column(Boolean, default=False)
    push_notifications_enabled = Column(Boolean, default=True)
    maintenance_reminder_days = Column(Integer, default=7)
    
    # Security Settings
    require_safety_training = Column(Boolean, default=True)
    equipment_access_logging = Column(Boolean, default=True)
    visitor_registration_required = Column(Boolean, default=True)
    
    # Integration Settings
    enable_iot_monitoring = Column(Boolean, default=False)
    enable_rfid_access = Column(Boolean, default=False)
    enable_camera_monitoring = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Relationships
    makerspace = relationship("Makerspace", back_populates="settings")
    updated_by_user = relationship("User", foreign_keys=[updated_by])
    
    def __repr__(self):
        return f"<MakerspaceSettings(makerspace_id={self.makerspace_id}, name={self.makerspace_name})>"

    def to_dict(self):
        """Convert settings to dictionary for API responses"""
        return {
            "id": str(self.id),
            "makerspace_id": str(self.makerspace_id),
            "makerspace_name": self.makerspace_name,
            "logo_url": self.logo_url,
            "description": self.description,
            "address": self.address,
            "contact_email": self.contact_email,
            "contact_phone": self.contact_phone,
            "timezone": self.timezone,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "operating_hours": self.operating_hours,
            "membership_required": self.membership_required,
            "public_registration": self.public_registration,
            "skill_gated_access": self.skill_gated_access,
            "enable_reservations": self.enable_reservations,
            "auto_approve_members": self.auto_approve_members,
            "filament_deduction_enabled": self.filament_deduction_enabled,
            "minimum_stock_alerts": self.minimum_stock_alerts,
            "stock_threshold_notification": self.stock_threshold_notification,
            "allow_personal_consumables": self.allow_personal_consumables,
            "store_inventory_sync": self.store_inventory_sync,
            "default_stock_threshold": self.default_stock_threshold,
            "credit_system_enabled": self.credit_system_enabled,
            "show_job_cost_estimates": self.show_job_cost_estimates,
            "default_tax_percent": self.default_tax_percent,
            "default_currency": self.default_currency,
            "enable_membership_billing": self.enable_membership_billing,
            "service_mode_enabled": self.service_mode_enabled,
            "accept_jobs_from_store": self.accept_jobs_from_store,
            "allowed_print_technologies": self.allowed_print_technologies,
            "delivery_radius_km": self.delivery_radius_km,
            "default_service_fee_percent": self.default_service_fee_percent,
            "auto_job_assignment": self.auto_job_assignment,
            "theme_mode": self.theme_mode.value if self.theme_mode else "light",
            "custom_theme_colors": self.custom_theme_colors,
            "landing_page_cta": self.landing_page_cta,
            "welcome_message": self.welcome_message,
            "enable_chat_widget": self.enable_chat_widget,
            "enable_help_widget": self.enable_help_widget,
            "email_notifications_enabled": self.email_notifications_enabled,
            "sms_notifications_enabled": self.sms_notifications_enabled,
            "push_notifications_enabled": self.push_notifications_enabled,
            "maintenance_reminder_days": self.maintenance_reminder_days,
            "require_safety_training": self.require_safety_training,
            "equipment_access_logging": self.equipment_access_logging,
            "visitor_registration_required": self.visitor_registration_required,
            "enable_iot_monitoring": self.enable_iot_monitoring,
            "enable_rfid_access": self.enable_rfid_access,
            "enable_camera_monitoring": self.enable_camera_monitoring,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "updated_by": str(self.updated_by) if self.updated_by else None
        }

    @classmethod
    def get_default_settings(cls, makerspace_id: str, makerspace_name: str = None):
        """Get default settings for a new makerspace"""
        return {
            "makerspace_id": makerspace_id,
            "makerspace_name": makerspace_name,
            "timezone": "Asia/Kolkata",
            "operating_hours": {
                "monday": {"open": "09:00", "close": "18:00", "closed": False},
                "tuesday": {"open": "09:00", "close": "18:00", "closed": False},
                "wednesday": {"open": "09:00", "close": "18:00", "closed": False},
                "thursday": {"open": "09:00", "close": "18:00", "closed": False},
                "friday": {"open": "09:00", "close": "18:00", "closed": False},
                "saturday": {"open": "10:00", "close": "17:00", "closed": False},
                "sunday": {"open": "10:00", "close": "17:00", "closed": True}
            },
            "membership_required": True,
            "public_registration": False,
            "skill_gated_access": True,
            "enable_reservations": True,
            "auto_approve_members": False,
            "filament_deduction_enabled": True,
            "minimum_stock_alerts": True,
            "stock_threshold_notification": True,
            "allow_personal_consumables": False,
            "store_inventory_sync": False,
            "default_stock_threshold": 10,
            "credit_system_enabled": False,
            "show_job_cost_estimates": True,
            "default_tax_percent": 18.0,
            "default_currency": "INR",
            "enable_membership_billing": True,
            "service_mode_enabled": False,
            "accept_jobs_from_store": False,
            "allowed_print_technologies": ["fdm"],
            "delivery_radius_km": 10,
            "default_service_fee_percent": 5.0,
            "auto_job_assignment": False,
            "theme_mode": "light",
            "welcome_message": "Welcome to our makerspace! We're excited to have you join our community of makers.",
            "enable_chat_widget": False,
            "enable_help_widget": True,
            "email_notifications_enabled": True,
            "sms_notifications_enabled": False,
            "push_notifications_enabled": True,
            "maintenance_reminder_days": 7,
            "require_safety_training": True,
            "equipment_access_logging": True,
            "visitor_registration_required": True,
            "enable_iot_monitoring": False,
            "enable_rfid_access": False,
            "enable_camera_monitoring": False
        }
