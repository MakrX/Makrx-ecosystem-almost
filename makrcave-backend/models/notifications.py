from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, Text, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import uuid
import enum
from datetime import datetime, timedelta

class NotificationType(str, enum.Enum):
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

class NotificationChannel(str, enum.Enum):
    IN_APP = "in_app"
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    WEBHOOK = "webhook"
    SLACK = "slack"
    DISCORD = "discord"

class NotificationPriority(str, enum.Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"
    CRITICAL = "critical"

class NotificationStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"
    CANCELLED = "cancelled"

class Notification(Base):
    """Core notification model"""
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False, index=True)
    
    # Recipient information
    recipient_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=False, index=True)
    recipient_type = Column(String(50), default="member")  # member, admin, group
    
    # Notification content
    notification_type = Column(SQLEnum(NotificationType), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    action_url = Column(String(500), nullable=True)
    action_text = Column(String(100), nullable=True)
    
    # Priority and channels
    priority = Column(SQLEnum(NotificationPriority), default=NotificationPriority.NORMAL)
    channels = Column(ARRAY(String), nullable=False)  # Which channels to send through
    
    # Related resources
    related_resource_type = Column(String(50), nullable=True)  # job, equipment, inventory, etc.
    related_resource_id = Column(UUID(as_uuid=True), nullable=True)
    related_metadata = Column(JSON, nullable=True)
    
    # Delivery status
    status = Column(SQLEnum(NotificationStatus), default=NotificationStatus.PENDING, index=True)
    
    # Scheduling
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Delivery tracking
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Retry logic
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    next_retry_at = Column(DateTime(timezone=True), nullable=True)
    
    # Grouping and batching
    group_key = Column(String(255), nullable=True, index=True)  # For grouping similar notifications
    batch_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    recipient = relationship("Member", back_populates="notifications")
    delivery_logs = relationship("NotificationDeliveryLog", back_populates="notification", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Notification(id={self.id}, type={self.notification_type}, recipient={self.recipient_id})>"
    
    def is_expired(self) -> bool:
        """Check if notification is expired"""
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at
    
    def can_retry(self) -> bool:
        """Check if notification can be retried"""
        return (
            self.status == NotificationStatus.FAILED and
            self.retry_count < self.max_retries and
            (not self.next_retry_at or datetime.utcnow() >= self.next_retry_at)
        )

class NotificationDeliveryLog(Base):
    """Log for tracking notification delivery across channels"""
    __tablename__ = "notification_delivery_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    notification_id = Column(UUID(as_uuid=True), ForeignKey("notifications.id"), nullable=False)
    
    # Delivery details
    channel = Column(SQLEnum(NotificationChannel), nullable=False)
    delivery_address = Column(String(255), nullable=True)  # email, phone, webhook URL, etc.
    
    # Status tracking
    status = Column(SQLEnum(NotificationStatus), default=NotificationStatus.PENDING)
    attempt_count = Column(Integer, default=0)
    
    # Response tracking
    external_id = Column(String(255), nullable=True)  # ID from external service
    response_code = Column(String(10), nullable=True)
    response_message = Column(Text, nullable=True)
    response_metadata = Column(JSON, nullable=True)
    
    # Timing
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    failed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Error handling
    error_message = Column(Text, nullable=True)
    error_code = Column(String(50), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    notification = relationship("Notification", back_populates="delivery_logs")

class NotificationTemplate(Base):
    """Templates for notification content"""
    __tablename__ = "notification_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=True)  # Null for global
    
    # Template identification
    template_name = Column(String(100), nullable=False, index=True)
    notification_type = Column(SQLEnum(NotificationType), nullable=False)
    channel = Column(SQLEnum(NotificationChannel), nullable=False)
    language = Column(String(10), default="en")
    
    # Template content
    subject_template = Column(String(255), nullable=True)  # For email/SMS
    title_template = Column(String(255), nullable=False)
    message_template = Column(Text, nullable=False)
    action_text_template = Column(String(100), nullable=True)
    action_url_template = Column(String(500), nullable=True)
    
    # Template settings
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    priority = Column(SQLEnum(NotificationPriority), default=NotificationPriority.NORMAL)
    
    # Variables and validation
    required_variables = Column(ARRAY(String), nullable=True)
    optional_variables = Column(ARRAY(String), nullable=True)
    validation_schema = Column(JSON, nullable=True)
    
    # Styling and formatting
    html_template = Column(Text, nullable=True)  # For email
    css_styles = Column(Text, nullable=True)
    attachments = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=True)

class NotificationPreference(Base):
    """User preferences for notifications"""
    __tablename__ = "notification_preferences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=False, unique=True)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    
    # Global preferences
    global_enabled = Column(Boolean, default=True)
    quiet_hours_enabled = Column(Boolean, default=True)
    quiet_hours_start = Column(String(5), default="22:00")  # HH:MM format
    quiet_hours_end = Column(String(5), default="08:00")
    timezone = Column(String(50), default="UTC")
    
    # Channel preferences
    email_enabled = Column(Boolean, default=True)
    email_address = Column(String(255), nullable=True)
    email_frequency = Column(String(20), default="immediate")  # immediate, hourly, daily, weekly
    
    sms_enabled = Column(Boolean, default=False)
    sms_number = Column(String(20), nullable=True)
    
    push_enabled = Column(Boolean, default=True)
    push_tokens = Column(JSON, nullable=True)  # Device tokens for push notifications
    
    in_app_enabled = Column(Boolean, default=True)
    in_app_sound = Column(Boolean, default=True)
    
    # Notification type preferences
    notification_type_preferences = Column(JSON, nullable=True)  # Per-type settings
    
    # Digest preferences
    daily_digest_enabled = Column(Boolean, default=False)
    daily_digest_time = Column(String(5), default="09:00")
    weekly_digest_enabled = Column(Boolean, default=False)
    weekly_digest_day = Column(String(10), default="monday")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("Member", back_populates="notification_preferences")

class NotificationRule(Base):
    """Rules for automatic notification generation"""
    __tablename__ = "notification_rules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    
    # Rule identification
    rule_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    notification_type = Column(SQLEnum(NotificationType), nullable=False)
    
    # Trigger conditions
    trigger_event = Column(String(100), nullable=False)  # inventory_below_threshold, job_completed, etc.
    trigger_conditions = Column(JSON, nullable=False)  # Conditions that must be met
    
    # Rule settings
    is_active = Column(Boolean, default=True)
    priority = Column(SQLEnum(NotificationPriority), default=NotificationPriority.NORMAL)
    channels = Column(ARRAY(String), nullable=False)
    
    # Throttling and limits
    throttle_duration_minutes = Column(Integer, nullable=True)  # Minimum time between notifications
    max_notifications_per_day = Column(Integer, nullable=True)
    max_notifications_per_hour = Column(Integer, nullable=True)
    
    # Recipients
    recipient_type = Column(String(50), nullable=False)  # specific_users, role_based, all_members
    recipient_criteria = Column(JSON, nullable=True)  # Criteria for selecting recipients
    
    # Template and content
    template_id = Column(UUID(as_uuid=True), ForeignKey("notification_templates.id"), nullable=True)
    custom_content = Column(JSON, nullable=True)  # Override template content
    
    # Scheduling
    schedule_type = Column(String(20), default="immediate")  # immediate, scheduled, recurring
    schedule_config = Column(JSON, nullable=True)  # Scheduling configuration
    
    # Tracking
    triggered_count = Column(Integer, default=0)
    last_triggered = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=True)
    
    # Relationships
    template = relationship("NotificationTemplate")

class NotificationQueue(Base):
    """Queue for processing notifications"""
    __tablename__ = "notification_queue"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    notification_id = Column(UUID(as_uuid=True), ForeignKey("notifications.id"), nullable=False)
    
    # Queue management
    queue_name = Column(String(50), default="default")
    priority = Column(Integer, default=0)  # Higher number = higher priority
    
    # Processing status
    status = Column(String(20), default="pending")  # pending, processing, completed, failed
    processor_id = Column(String(100), nullable=True)  # ID of worker processing this
    
    # Timing
    queued_at = Column(DateTime(timezone=True), server_default=func.now())
    process_after = Column(DateTime(timezone=True), nullable=True)  # Delay processing until this time
    processing_started_at = Column(DateTime(timezone=True), nullable=True)
    processing_completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Error handling
    error_count = Column(Integer, default=0)
    last_error = Column(Text, nullable=True)
    
    # Relationships
    notification = relationship("Notification")

class NotificationAnalytics(Base):
    """Analytics for notification performance"""
    __tablename__ = "notification_analytics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    
    # Time period
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    period_type = Column(String(20), nullable=False)  # hourly, daily, weekly, monthly
    
    # Metrics by type
    notifications_sent = Column(Integer, default=0)
    notifications_delivered = Column(Integer, default=0)
    notifications_read = Column(Integer, default=0)
    notifications_failed = Column(Integer, default=0)
    
    # Metrics by channel
    email_sent = Column(Integer, default=0)
    email_delivered = Column(Integer, default=0)
    email_opened = Column(Integer, default=0)
    email_clicked = Column(Integer, default=0)
    
    sms_sent = Column(Integer, default=0)
    sms_delivered = Column(Integer, default=0)
    
    push_sent = Column(Integer, default=0)
    push_delivered = Column(Integer, default=0)
    push_opened = Column(Integer, default=0)
    
    in_app_sent = Column(Integer, default=0)
    in_app_read = Column(Integer, default=0)
    
    # Performance metrics
    average_delivery_time_seconds = Column(Float, nullable=True)
    average_read_time_seconds = Column(Float, nullable=True)
    
    # Engagement metrics
    click_through_rate = Column(Float, nullable=True)
    open_rate = Column(Float, nullable=True)
    unsubscribe_rate = Column(Float, nullable=True)
    
    # Top notification types
    top_notification_types = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Add relationship to Member model
from sqlalchemy.ext.declarative import declared_attr

class NotificationMixin:
    """Mixin to add to Member model"""
    
    @declared_attr
    def notifications(cls):
        return relationship("Notification", back_populates="recipient")
    
    @declared_attr
    def notification_preferences(cls):
        return relationship("NotificationPreference", back_populates="user", uselist=False)

# Indexes for performance
from sqlalchemy import Index

Index('idx_notifications_recipient_status', Notification.recipient_id, Notification.status)
Index('idx_notifications_type_scheduled', Notification.notification_type, Notification.scheduled_at)
Index('idx_notifications_makerspace_created', Notification.makerspace_id, Notification.created_at)
Index('idx_notification_queue_priority', NotificationQueue.queue_name, NotificationQueue.priority.desc())
Index('idx_notification_analytics_date', NotificationAnalytics.makerspace_id, NotificationAnalytics.date)
