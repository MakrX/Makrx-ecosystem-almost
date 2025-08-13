from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum
import uuid

# Enums
class NotificationType(str, Enum):
    JOB_CREATED = "job_created"
    JOB_COMPLETED = "job_completed"
    JOB_FAILED = "job_failed"
    JOB_PROGRESS_UPDATE = "job_progress_update"
    JOB_READY_FOR_PICKUP = "job_ready_for_pickup"
    
    INVENTORY_LOW_STOCK = "inventory_low_stock"
    INVENTORY_OUT_OF_STOCK = "inventory_out_of_stock"
    INVENTORY_RESTOCK_NEEDED = "inventory_restock_needed"
    INVENTORY_EXPIRED = "inventory_expired"
    
    EQUIPMENT_MAINTENANCE_DUE = "equipment_maintenance_due"
    EQUIPMENT_MAINTENANCE_OVERDUE = "equipment_maintenance_overdue"
    EQUIPMENT_FAILURE = "equipment_failure"
    EQUIPMENT_AVAILABLE = "equipment_available"
    EQUIPMENT_RESERVATION_REMINDER = "equipment_reservation_reminder"
    EQUIPMENT_RESERVATION_CANCELLED = "equipment_reservation_cancelled"
    
    MEMBERSHIP_EXPIRING = "membership_expiring"
    MEMBERSHIP_EXPIRED = "membership_expired"
    MEMBERSHIP_RENEWED = "membership_renewed"
    MEMBERSHIP_SUSPENDED = "membership_suspended"
    MEMBERSHIP_PAYMENT_FAILED = "membership_payment_failed"
    
    PROJECT_SHARED = "project_shared"
    PROJECT_COLLABORATION_INVITE = "project_collaboration_invite"
    PROJECT_COMMENT = "project_comment"
    
    ANNOUNCEMENT = "announcement"
    SYSTEM_MAINTENANCE = "system_maintenance"
    SECURITY_ALERT = "security_alert"
    TRAINING_REMINDER = "training_reminder"
    EVENT_REMINDER = "event_reminder"

class NotificationChannel(str, Enum):
    IN_APP = "in_app"
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    WEBHOOK = "webhook"
    SLACK = "slack"
    DISCORD = "discord"

class NotificationPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"
    CRITICAL = "critical"

class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"
    CANCELLED = "cancelled"

# Notification Schemas
class NotificationCreate(BaseModel):
    recipient_id: uuid.UUID
    notification_type: NotificationType
    title: str = Field(..., max_length=255)
    message: str
    action_url: Optional[str] = Field(None, max_length=500)
    action_text: Optional[str] = Field(None, max_length=100)
    priority: NotificationPriority = NotificationPriority.NORMAL
    channels: List[NotificationChannel]
    related_resource_type: Optional[str] = None
    related_resource_id: Optional[uuid.UUID] = None
    related_metadata: Optional[Dict[str, Any]] = None
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    group_key: Optional[str] = None

class NotificationUpdate(BaseModel):
    status: Optional[NotificationStatus] = None
    read_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

class NotificationResponse(BaseModel):
    id: uuid.UUID
    makerspace_id: uuid.UUID
    recipient_id: uuid.UUID
    notification_type: NotificationType
    title: str
    message: str
    action_url: Optional[str] = None
    action_text: Optional[str] = None
    priority: NotificationPriority
    channels: List[str]
    related_resource_type: Optional[str] = None
    related_resource_id: Optional[uuid.UUID] = None
    related_metadata: Optional[Dict[str, Any]] = None
    status: NotificationStatus
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    retry_count: int
    group_key: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Bulk notification operations
class BulkNotificationCreate(BaseModel):
    recipient_ids: List[uuid.UUID]
    notification_type: NotificationType
    title: str = Field(..., max_length=255)
    message: str
    action_url: Optional[str] = None
    action_text: Optional[str] = None
    priority: NotificationPriority = NotificationPriority.NORMAL
    channels: List[NotificationChannel]
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    batch_size: int = Field(100, gt=0, le=1000)

class BulkNotificationResponse(BaseModel):
    batch_id: uuid.UUID
    total_notifications: int
    created_count: int
    failed_count: int
    errors: List[Dict[str, str]] = []

# Template Schemas
class NotificationTemplateCreate(BaseModel):
    template_name: str = Field(..., max_length=100)
    notification_type: NotificationType
    channel: NotificationChannel
    language: str = Field("en", max_length=10)
    subject_template: Optional[str] = Field(None, max_length=255)
    title_template: str = Field(..., max_length=255)
    message_template: str
    action_text_template: Optional[str] = Field(None, max_length=100)
    action_url_template: Optional[str] = Field(None, max_length=500)
    priority: NotificationPriority = NotificationPriority.NORMAL
    required_variables: Optional[List[str]] = None
    optional_variables: Optional[List[str]] = None
    html_template: Optional[str] = None
    css_styles: Optional[str] = None
    is_default: bool = False

class NotificationTemplateUpdate(BaseModel):
    template_name: Optional[str] = Field(None, max_length=100)
    subject_template: Optional[str] = Field(None, max_length=255)
    title_template: Optional[str] = Field(None, max_length=255)
    message_template: Optional[str] = None
    action_text_template: Optional[str] = Field(None, max_length=100)
    action_url_template: Optional[str] = Field(None, max_length=500)
    priority: Optional[NotificationPriority] = None
    required_variables: Optional[List[str]] = None
    optional_variables: Optional[List[str]] = None
    html_template: Optional[str] = None
    css_styles: Optional[str] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None

class NotificationTemplateResponse(BaseModel):
    id: uuid.UUID
    makerspace_id: Optional[uuid.UUID] = None
    template_name: str
    notification_type: NotificationType
    channel: NotificationChannel
    language: str
    subject_template: Optional[str] = None
    title_template: str
    message_template: str
    action_text_template: Optional[str] = None
    action_url_template: Optional[str] = None
    is_active: bool
    is_default: bool
    priority: NotificationPriority
    required_variables: Optional[List[str]] = None
    optional_variables: Optional[List[str]] = None
    html_template: Optional[str] = None
    css_styles: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Preference Schemas
class NotificationPreferenceCreate(BaseModel):
    global_enabled: bool = True
    quiet_hours_enabled: bool = True
    quiet_hours_start: str = Field("22:00", regex=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    quiet_hours_end: str = Field("08:00", regex=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    timezone: str = "UTC"
    email_enabled: bool = True
    email_address: Optional[EmailStr] = None
    email_frequency: str = Field("immediate", regex="^(immediate|hourly|daily|weekly)$")
    sms_enabled: bool = False
    sms_number: Optional[str] = Field(None, max_length=20)
    push_enabled: bool = True
    in_app_enabled: bool = True
    in_app_sound: bool = True
    notification_type_preferences: Optional[Dict[str, Dict[str, Any]]] = None
    daily_digest_enabled: bool = False
    daily_digest_time: str = Field("09:00", regex=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    weekly_digest_enabled: bool = False
    weekly_digest_day: str = Field("monday", regex="^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$")

class NotificationPreferenceUpdate(BaseModel):
    global_enabled: Optional[bool] = None
    quiet_hours_enabled: Optional[bool] = None
    quiet_hours_start: Optional[str] = Field(None, regex=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    quiet_hours_end: Optional[str] = Field(None, regex=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    timezone: Optional[str] = None
    email_enabled: Optional[bool] = None
    email_address: Optional[EmailStr] = None
    email_frequency: Optional[str] = Field(None, regex="^(immediate|hourly|daily|weekly)$")
    sms_enabled: Optional[bool] = None
    sms_number: Optional[str] = Field(None, max_length=20)
    push_enabled: Optional[bool] = None
    in_app_enabled: Optional[bool] = None
    in_app_sound: Optional[bool] = None
    notification_type_preferences: Optional[Dict[str, Dict[str, Any]]] = None
    daily_digest_enabled: Optional[bool] = None
    daily_digest_time: Optional[str] = Field(None, regex=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    weekly_digest_enabled: Optional[bool] = None
    weekly_digest_day: Optional[str] = Field(None, regex="^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$")

class NotificationPreferenceResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    makerspace_id: uuid.UUID
    global_enabled: bool
    quiet_hours_enabled: bool
    quiet_hours_start: str
    quiet_hours_end: str
    timezone: str
    email_enabled: bool
    email_address: Optional[str] = None
    email_frequency: str
    sms_enabled: bool
    sms_number: Optional[str] = None
    push_enabled: bool
    push_tokens: Optional[Dict[str, Any]] = None
    in_app_enabled: bool
    in_app_sound: bool
    notification_type_preferences: Optional[Dict[str, Dict[str, Any]]] = None
    daily_digest_enabled: bool
    daily_digest_time: str
    weekly_digest_enabled: bool
    weekly_digest_day: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Rule Schemas
class NotificationRuleCreate(BaseModel):
    rule_name: str = Field(..., max_length=100)
    description: Optional[str] = None
    notification_type: NotificationType
    trigger_event: str = Field(..., max_length=100)
    trigger_conditions: Dict[str, Any]
    priority: NotificationPriority = NotificationPriority.NORMAL
    channels: List[NotificationChannel]
    throttle_duration_minutes: Optional[int] = Field(None, gt=0)
    max_notifications_per_day: Optional[int] = Field(None, gt=0)
    max_notifications_per_hour: Optional[int] = Field(None, gt=0)
    recipient_type: str = Field(..., regex="^(specific_users|role_based|all_members)$")
    recipient_criteria: Optional[Dict[str, Any]] = None
    template_id: Optional[uuid.UUID] = None
    custom_content: Optional[Dict[str, Any]] = None
    schedule_type: str = Field("immediate", regex="^(immediate|scheduled|recurring)$")
    schedule_config: Optional[Dict[str, Any]] = None

class NotificationRuleUpdate(BaseModel):
    rule_name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    trigger_conditions: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    priority: Optional[NotificationPriority] = None
    channels: Optional[List[NotificationChannel]] = None
    throttle_duration_minutes: Optional[int] = Field(None, gt=0)
    max_notifications_per_day: Optional[int] = Field(None, gt=0)
    max_notifications_per_hour: Optional[int] = Field(None, gt=0)
    recipient_type: Optional[str] = Field(None, regex="^(specific_users|role_based|all_members)$")
    recipient_criteria: Optional[Dict[str, Any]] = None
    template_id: Optional[uuid.UUID] = None
    custom_content: Optional[Dict[str, Any]] = None
    schedule_type: Optional[str] = Field(None, regex="^(immediate|scheduled|recurring)$")
    schedule_config: Optional[Dict[str, Any]] = None

class NotificationRuleResponse(BaseModel):
    id: uuid.UUID
    makerspace_id: uuid.UUID
    rule_name: str
    description: Optional[str] = None
    notification_type: NotificationType
    trigger_event: str
    trigger_conditions: Dict[str, Any]
    is_active: bool
    priority: NotificationPriority
    channels: List[str]
    throttle_duration_minutes: Optional[int] = None
    max_notifications_per_day: Optional[int] = None
    max_notifications_per_hour: Optional[int] = None
    recipient_type: str
    recipient_criteria: Optional[Dict[str, Any]] = None
    template_id: Optional[uuid.UUID] = None
    custom_content: Optional[Dict[str, Any]] = None
    schedule_type: str
    schedule_config: Optional[Dict[str, Any]] = None
    triggered_count: int
    last_triggered: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Analytics Schemas
class NotificationAnalyticsResponse(BaseModel):
    id: uuid.UUID
    makerspace_id: uuid.UUID
    date: datetime
    period_type: str
    notifications_sent: int
    notifications_delivered: int
    notifications_read: int
    notifications_failed: int
    email_sent: int
    email_delivered: int
    email_opened: int
    email_clicked: int
    sms_sent: int
    sms_delivered: int
    push_sent: int
    push_delivered: int
    push_opened: int
    in_app_sent: int
    in_app_read: int
    average_delivery_time_seconds: Optional[float] = None
    average_read_time_seconds: Optional[float] = None
    click_through_rate: Optional[float] = None
    open_rate: Optional[float] = None
    unsubscribe_rate: Optional[float] = None
    top_notification_types: Optional[Dict[str, int]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Utility Schemas
class NotificationFilter(BaseModel):
    notification_types: Optional[List[NotificationType]] = None
    statuses: Optional[List[NotificationStatus]] = None
    priorities: Optional[List[NotificationPriority]] = None
    channels: Optional[List[NotificationChannel]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    recipient_id: Optional[uuid.UUID] = None
    read_status: Optional[bool] = None  # True for read, False for unread, None for all

class NotificationStats(BaseModel):
    total_notifications: int
    unread_count: int
    pending_count: int
    failed_count: int
    notifications_by_type: Dict[str, int]
    notifications_by_priority: Dict[str, int]
    recent_activity: List[Dict[str, Any]]

class NotificationTest(BaseModel):
    notification_type: NotificationType
    channel: NotificationChannel
    recipient_id: uuid.UUID
    test_data: Optional[Dict[str, Any]] = None

class PushTokenRegister(BaseModel):
    device_token: str
    device_type: str = Field(..., regex="^(ios|android|web)$")
    device_name: Optional[str] = None

class DigestPreview(BaseModel):
    digest_type: str = Field(..., regex="^(daily|weekly)$")
    recipient_id: uuid.UUID
    date: Optional[datetime] = None

class NotificationExport(BaseModel):
    format: str = Field(..., regex="^(csv|xlsx|json)$")
    filters: Optional[NotificationFilter] = None
    include_content: bool = True
    include_delivery_logs: bool = False

# Real-time schemas
class NotificationEvent(BaseModel):
    event_type: str = Field(..., regex="^(created|updated|delivered|read|failed)$")
    notification_id: uuid.UUID
    recipient_id: uuid.UUID
    data: Optional[Dict[str, Any]] = None
    timestamp: datetime

class UnreadNotificationsSummary(BaseModel):
    total_unread: int
    unread_by_type: Dict[str, int]
    unread_by_priority: Dict[str, int]
    latest_notifications: List[NotificationResponse]
    has_urgent: bool
    has_critical: bool

# Template rendering
class TemplateRenderRequest(BaseModel):
    template_id: uuid.UUID
    variables: Dict[str, Any]
    recipient_id: Optional[uuid.UUID] = None

class TemplateRenderResponse(BaseModel):
    subject: Optional[str] = None
    title: str
    message: str
    action_text: Optional[str] = None
    action_url: Optional[str] = None
    html_content: Optional[str] = None
    
# System schemas
class NotificationSystemHealth(BaseModel):
    queue_status: Dict[str, Any]
    processing_stats: Dict[str, Any]
    delivery_stats: Dict[str, Any]
    error_rates: Dict[str, float]
    system_status: str

class NotificationSystemConfig(BaseModel):
    max_retries: int = 3
    retry_delay_minutes: int = 5
    batch_size: int = 100
    queue_workers: int = 4
    rate_limits: Dict[str, int]
    provider_configs: Dict[str, Any]
