from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, List, Any
from datetime import datetime
from enum import Enum

class ThemeMode(str, Enum):
    DARK = "dark"
    LIGHT = "light"
    CUSTOM = "custom"

class PrintTechnology(str, Enum):
    FDM = "fdm"
    SLA = "sla"
    SLS = "sls"
    POLYJET = "polyjet"
    CARBON_FIBER = "carbon_fiber"

class OperatingHours(BaseModel):
    open: str = Field(..., description="Opening time in HH:MM format")
    close: str = Field(..., description="Closing time in HH:MM format")
    closed: bool = Field(False, description="Whether the day is closed")

class DailyOperatingHours(BaseModel):
    monday: OperatingHours
    tuesday: OperatingHours
    wednesday: OperatingHours
    thursday: OperatingHours
    friday: OperatingHours
    saturday: OperatingHours
    sunday: OperatingHours

class CustomThemeColors(BaseModel):
    primary: Optional[str] = None
    secondary: Optional[str] = None
    accent: Optional[str] = None
    background: Optional[str] = None
    surface: Optional[str] = None
    text_primary: Optional[str] = None
    text_secondary: Optional[str] = None

# Base schemas
class MakerspaceSettingsBase(BaseModel):
    # General Information
    makerspace_name: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    timezone: str = "Asia/Kolkata"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operating_hours: Optional[DailyOperatingHours] = None
    
    # Access Settings
    membership_required: bool = True
    public_registration: bool = False
    skill_gated_access: bool = True
    enable_reservations: bool = True
    auto_approve_members: bool = False
    
    # Inventory Settings
    filament_deduction_enabled: bool = True
    minimum_stock_alerts: bool = True
    stock_threshold_notification: bool = True
    allow_personal_consumables: bool = False
    store_inventory_sync: bool = False
    default_stock_threshold: int = Field(10, ge=1, le=1000)
    
    # Billing Settings
    credit_system_enabled: bool = False
    show_job_cost_estimates: bool = True
    default_tax_percent: float = Field(18.0, ge=0, le=100)
    default_currency: str = "INR"
    razorpay_key_override: Optional[str] = None
    stripe_key_override: Optional[str] = None
    enable_membership_billing: bool = True
    
    # Service Provider Mode
    service_mode_enabled: bool = False
    accept_jobs_from_store: bool = False
    allowed_print_technologies: Optional[List[PrintTechnology]] = ["fdm"]
    delivery_radius_km: int = Field(10, ge=1, le=1000)
    default_service_fee_percent: float = Field(5.0, ge=0, le=100)
    auto_job_assignment: bool = False
    
    # Appearance Settings
    theme_mode: ThemeMode = ThemeMode.LIGHT
    custom_theme_colors: Optional[CustomThemeColors] = None
    landing_page_cta: Optional[str] = None
    welcome_message: Optional[str] = None
    enable_chat_widget: bool = False
    enable_help_widget: bool = True
    custom_css: Optional[str] = None
    
    # Notification Settings
    email_notifications_enabled: bool = True
    sms_notifications_enabled: bool = False
    push_notifications_enabled: bool = True
    maintenance_reminder_days: int = Field(7, ge=1, le=30)
    
    # Security Settings
    require_safety_training: bool = True
    equipment_access_logging: bool = True
    visitor_registration_required: bool = True
    
    # Integration Settings
    enable_iot_monitoring: bool = False
    enable_rfid_access: bool = False
    enable_camera_monitoring: bool = False

    @validator('contact_email')
    def validate_email(cls, v):
        if v and '@' not in v:
            raise ValueError('Invalid email address')
        return v

    @validator('operating_hours')
    def validate_operating_hours(cls, v):
        if v:
            for day, hours in v.dict().items():
                if not hours['closed']:
                    open_time = hours['open']
                    close_time = hours['close']
                    if open_time >= close_time:
                        raise ValueError(f'Opening time must be before closing time for {day}')
        return v

class MakerspaceSettingsCreate(MakerspaceSettingsBase):
    makerspace_id: str
    makerspace_name: str

class MakerspaceSettingsUpdate(BaseModel):
    # All fields are optional for partial updates
    makerspace_name: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    timezone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operating_hours: Optional[DailyOperatingHours] = None
    
    membership_required: Optional[bool] = None
    public_registration: Optional[bool] = None
    skill_gated_access: Optional[bool] = None
    enable_reservations: Optional[bool] = None
    auto_approve_members: Optional[bool] = None
    
    filament_deduction_enabled: Optional[bool] = None
    minimum_stock_alerts: Optional[bool] = None
    stock_threshold_notification: Optional[bool] = None
    allow_personal_consumables: Optional[bool] = None
    store_inventory_sync: Optional[bool] = None
    default_stock_threshold: Optional[int] = Field(None, ge=1, le=1000)
    
    credit_system_enabled: Optional[bool] = None
    show_job_cost_estimates: Optional[bool] = None
    default_tax_percent: Optional[float] = Field(None, ge=0, le=100)
    default_currency: Optional[str] = None
    razorpay_key_override: Optional[str] = None
    stripe_key_override: Optional[str] = None
    enable_membership_billing: Optional[bool] = None
    
    service_mode_enabled: Optional[bool] = None
    accept_jobs_from_store: Optional[bool] = None
    allowed_print_technologies: Optional[List[PrintTechnology]] = None
    delivery_radius_km: Optional[int] = Field(None, ge=1, le=1000)
    default_service_fee_percent: Optional[float] = Field(None, ge=0, le=100)
    auto_job_assignment: Optional[bool] = None
    
    theme_mode: Optional[ThemeMode] = None
    custom_theme_colors: Optional[CustomThemeColors] = None
    landing_page_cta: Optional[str] = None
    welcome_message: Optional[str] = None
    enable_chat_widget: Optional[bool] = None
    enable_help_widget: Optional[bool] = None
    custom_css: Optional[str] = None
    
    email_notifications_enabled: Optional[bool] = None
    sms_notifications_enabled: Optional[bool] = None
    push_notifications_enabled: Optional[bool] = None
    maintenance_reminder_days: Optional[int] = Field(None, ge=1, le=30)
    
    require_safety_training: Optional[bool] = None
    equipment_access_logging: Optional[bool] = None
    visitor_registration_required: Optional[bool] = None
    
    enable_iot_monitoring: Optional[bool] = None
    enable_rfid_access: Optional[bool] = None
    enable_camera_monitoring: Optional[bool] = None

class MakerspaceSettingsResponse(MakerspaceSettingsBase):
    id: str
    makerspace_id: str
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[str] = None

    class Config:
        from_attributes = True

class MakerspaceSettingsPublic(BaseModel):
    """Public view of settings - only non-sensitive information"""
    makerspace_name: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    timezone: str = "Asia/Kolkata"
    operating_hours: Optional[DailyOperatingHours] = None
    
    membership_required: bool = True
    public_registration: bool = False
    enable_reservations: bool = True
    
    service_mode_enabled: bool = False
    accept_jobs_from_store: bool = False
    allowed_print_technologies: Optional[List[PrintTechnology]] = None
    delivery_radius_km: int = 10
    
    theme_mode: ThemeMode = ThemeMode.LIGHT
    custom_theme_colors: Optional[CustomThemeColors] = None
    landing_page_cta: Optional[str] = None
    welcome_message: Optional[str] = None

class FeatureToggleRequest(BaseModel):
    feature: str = Field(..., description="Feature name to toggle")
    enabled: bool = Field(..., description="Whether to enable or disable the feature")

class SettingsExportResponse(BaseModel):
    settings: Dict[str, Any]
    exported_at: datetime
    makerspace_id: str
    makerspace_name: Optional[str] = None

class SettingsImportRequest(BaseModel):
    settings: Dict[str, Any]
    overwrite_existing: bool = Field(False, description="Whether to overwrite existing settings")

# Specific setting section schemas for partial updates
class GeneralInformationUpdate(BaseModel):
    makerspace_name: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    timezone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operating_hours: Optional[DailyOperatingHours] = None

class AccessControlUpdate(BaseModel):
    membership_required: Optional[bool] = None
    public_registration: Optional[bool] = None
    skill_gated_access: Optional[bool] = None
    enable_reservations: Optional[bool] = None
    auto_approve_members: Optional[bool] = None

class InventorySettingsUpdate(BaseModel):
    filament_deduction_enabled: Optional[bool] = None
    minimum_stock_alerts: Optional[bool] = None
    stock_threshold_notification: Optional[bool] = None
    allow_personal_consumables: Optional[bool] = None
    store_inventory_sync: Optional[bool] = None
    default_stock_threshold: Optional[int] = Field(None, ge=1, le=1000)

class BillingConfigUpdate(BaseModel):
    credit_system_enabled: Optional[bool] = None
    show_job_cost_estimates: Optional[bool] = None
    default_tax_percent: Optional[float] = Field(None, ge=0, le=100)
    default_currency: Optional[str] = None
    razorpay_key_override: Optional[str] = None
    stripe_key_override: Optional[str] = None
    enable_membership_billing: Optional[bool] = None

class ServiceModeUpdate(BaseModel):
    service_mode_enabled: Optional[bool] = None
    accept_jobs_from_store: Optional[bool] = None
    allowed_print_technologies: Optional[List[PrintTechnology]] = None
    delivery_radius_km: Optional[int] = Field(None, ge=1, le=1000)
    default_service_fee_percent: Optional[float] = Field(None, ge=0, le=100)
    auto_job_assignment: Optional[bool] = None

class AppearanceUpdate(BaseModel):
    theme_mode: Optional[ThemeMode] = None
    custom_theme_colors: Optional[CustomThemeColors] = None
    landing_page_cta: Optional[str] = None
    welcome_message: Optional[str] = None
    enable_chat_widget: Optional[bool] = None
    enable_help_widget: Optional[bool] = None
    custom_css: Optional[str] = None
