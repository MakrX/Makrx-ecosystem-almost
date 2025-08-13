"""
SQLAlchemy models for admin and support functionality
Coupons, Audit Logs, System Configuration
"""

from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.db import Base

class Coupon(Base):
    __tablename__ = "coupons"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Discount configuration
    type = Column(String(20), nullable=False)  # percentage, fixed_amount, free_shipping
    value = Column(Numeric(10, 2), nullable=False)  # percentage (0-100) or amount
    currency = Column(String(3), default="INR")
    
    # Usage constraints
    constraints = Column(JSONB, default={})  # Complex rules as JSON
    # e.g., {"min_order_amount": 100, "max_discount": 50, "categories": [1,2,3], 
    #        "products": [], "user_groups": [], "first_order_only": true}
    
    # Usage limits
    usage_limit = Column(Integer)  # Total usage limit (null = unlimited)
    usage_limit_per_user = Column(Integer)  # Per-user limit
    current_usage = Column(Integer, default=0)
    
    # Validity period
    starts_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    usage_logs = relationship("CouponUsage", back_populates="coupon")

class CouponUsage(Base):
    __tablename__ = "coupon_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    coupon_id = Column(Integer, ForeignKey("coupons.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    user_id = Column(String(255), nullable=True, index=True)
    
    # Usage details
    discount_amount = Column(Numeric(10, 2), nullable=False)
    order_total = Column(Numeric(10, 2), nullable=False)
    
    # Timestamp
    used_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    coupon = relationship("Coupon", back_populates="usage_logs")
    
    # Indexes
    __table_args__ = (
        Index("ix_coupon_usage_user_coupon", "user_id", "coupon_id"),
        Index("ix_coupon_usage_used_at", "used_at"),
    )

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Actor information
    actor_type = Column(String(50), nullable=False)  # user, admin, system, service
    actor_id = Column(String(255), nullable=True, index=True)
    actor_email = Column(String(255), nullable=True)
    actor_ip = Column(String(45))  # IPv4 or IPv6
    user_agent = Column(String(500))
    
    # Action details
    action = Column(String(100), nullable=False, index=True)  # CREATE, UPDATE, DELETE, LOGIN, etc.
    resource = Column(String(100), nullable=False, index=True)  # product, order, user, etc.
    resource_id = Column(String(255), nullable=True, index=True)
    
    # Change tracking
    old_values = Column(JSONB)  # Previous state
    new_values = Column(JSONB)  # New state
    diff = Column(JSONB)  # Computed differences
    
    # Request context
    request_id = Column(String(50), index=True)  # Correlation ID
    endpoint = Column(String(255))  # API endpoint called
    method = Column(String(10))  # HTTP method
    
    # Additional metadata
    metadata = Column(JSONB, default={})
    description = Column(Text)
    
    # Classification
    severity = Column(String(20), default="info")  # info, warning, error, critical
    category = Column(String(50), index=True)  # security, business, system, etc.
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes
    __table_args__ = (
        Index("ix_audit_logs_actor_action", "actor_id", "action"),
        Index("ix_audit_logs_resource", "resource", "resource_id"),
        Index("ix_audit_logs_created_at", "created_at"),
        Index("ix_audit_logs_severity_category", "severity", "category"),
    )

class SystemConfig(Base):
    __tablename__ = "system_config"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), nullable=False, unique=True, index=True)
    value = Column(JSONB, nullable=False)
    
    # Metadata
    description = Column(Text)
    category = Column(String(50), index=True)  # pricing, features, limits, etc.
    data_type = Column(String(20))  # string, number, boolean, object, array
    
    # Access control
    is_public = Column(Boolean, default=False)  # Can be read by non-admin users
    is_readonly = Column(Boolean, default=False)  # Cannot be modified via API
    
    # Validation
    validation_schema = Column(JSONB)  # JSON schema for value validation
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Track who last modified
    updated_by = Column(String(255))

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Recipient
    user_id = Column(String(255), nullable=True, index=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(20), nullable=True)
    
    # Notification details
    type = Column(String(50), nullable=False, index=True)  # email, sms, push, webhook
    template = Column(String(100), nullable=False)  # Template identifier
    subject = Column(String(255))
    message = Column(Text, nullable=False)
    
    # Related entities
    related_type = Column(String(50))  # order, service_order, payment, etc.
    related_id = Column(String(255))
    
    # Delivery tracking
    status = Column(String(50), default="pending", index=True)
    # pending, sent, delivered, failed, bounced
    
    provider = Column(String(50))  # sendgrid, twilio, fcm, etc.
    provider_id = Column(String(255))  # External provider's message ID
    provider_response = Column(JSONB)
    
    # Retry logic
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    next_attempt_at = Column(DateTime(timezone=True))
    
    # Metadata
    metadata = Column(JSONB, default={})
    priority = Column(String(20), default="normal")  # low, normal, high, urgent
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    failed_at = Column(DateTime(timezone=True))
    
    # Indexes
    __table_args__ = (
        Index("ix_notifications_user_type", "user_id", "type"),
        Index("ix_notifications_status_created", "status", "created_at"),
        Index("ix_notifications_related", "related_type", "related_id"),
    )

class ApiKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Key details
    key_hash = Column(String(128), nullable=False, unique=True, index=True)  # SHA-256 hash
    key_prefix = Column(String(20), nullable=False, index=True)  # First few chars for identification
    
    # Owner
    owner_type = Column(String(50), nullable=False)  # user, service, integration
    owner_id = Column(String(255), nullable=False, index=True)
    
    # Permissions and scopes
    scopes = Column(JSONB, default=[])  # Array of permission scopes
    rate_limit = Column(Integer)  # Requests per hour
    
    # Status and validity
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True))
    last_used_at = Column(DateTime(timezone=True))
    
    # Usage tracking
    total_requests = Column(Integer, default=0)
    
    # Security
    allowed_ips = Column(JSONB, default=[])  # IP allowlist
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Indexes
    __table_args__ = (
        Index("ix_api_keys_owner", "owner_type", "owner_id"),
        Index("ix_api_keys_active_expires", "is_active", "expires_at"),
    )
