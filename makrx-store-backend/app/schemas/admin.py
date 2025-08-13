"""
Pydantic schemas for admin and common entities
Request/response models for coupons, audit logs, system config
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from decimal import Decimal
from datetime import datetime
from enum import Enum
import uuid

# Enums
class CouponType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED_AMOUNT = "fixed_amount"
    FREE_SHIPPING = "free_shipping"

class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    BOUNCED = "bounced"

class NotificationType(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    WEBHOOK = "webhook"

class AuditSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

# Base schemas
class TimestampMixin(BaseModel):
    created_at: datetime
    updated_at: Optional[datetime] = None

# Coupon schemas
class CouponBase(BaseModel):
    code: str = Field(..., min_length=3, max_length=50, regex=r'^[A-Z0-9_-]+$')
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    type: CouponType
    value: Decimal = Field(..., gt=0)
    currency: str = Field("INR", min_length=3, max_length=3)
    constraints: Dict[str, Any] = {}
    usage_limit: Optional[int] = Field(None, gt=0)
    usage_limit_per_user: Optional[int] = Field(None, gt=0)
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: bool = True

    @validator('value')
    def validate_value(cls, v, values):
        coupon_type = values.get('type')
        if coupon_type == CouponType.PERCENTAGE and v > 100:
            raise ValueError('Percentage discount cannot exceed 100%')
        return v

    @validator('expires_at')
    def validate_dates(cls, v, values):
        starts_at = values.get('starts_at')
        if v and starts_at and v <= starts_at:
            raise ValueError('Expiry date must be after start date')
        return v

class CouponCreate(CouponBase):
    pass

class CouponUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    value: Optional[Decimal] = Field(None, gt=0)
    constraints: Optional[Dict[str, Any]] = None
    usage_limit: Optional[int] = Field(None, gt=0)
    usage_limit_per_user: Optional[int] = Field(None, gt=0)
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None

class Coupon(CouponBase, TimestampMixin):
    id: int
    current_usage: int = 0
    
    class Config:
        orm_mode = True

class CouponUsage(BaseModel):
    id: int
    coupon_id: int
    order_id: int
    user_id: Optional[str] = None
    discount_amount: Decimal
    order_total: Decimal
    used_at: datetime
    
    class Config:
        orm_mode = True

class CouponList(BaseModel):
    coupons: List[Coupon]
    total: int
    page: int
    per_page: int
    pages: int

# Audit Log schemas
class AuditLogCreate(BaseModel):
    actor_type: str = Field(..., max_length=50)
    actor_id: Optional[str] = Field(None, max_length=255)
    actor_email: Optional[str] = Field(None, max_length=255)
    actor_ip: Optional[str] = Field(None, max_length=45)
    user_agent: Optional[str] = Field(None, max_length=500)
    action: str = Field(..., max_length=100)
    resource: str = Field(..., max_length=100)
    resource_id: Optional[str] = Field(None, max_length=255)
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    diff: Optional[Dict[str, Any]] = None
    request_id: Optional[str] = Field(None, max_length=50)
    endpoint: Optional[str] = Field(None, max_length=255)
    method: Optional[str] = Field(None, max_length=10)
    metadata: Dict[str, Any] = {}
    description: Optional[str] = None
    severity: AuditSeverity = AuditSeverity.INFO
    category: Optional[str] = Field(None, max_length=50)

class AuditLog(AuditLogCreate):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class AuditLogFilter(BaseModel):
    actor_id: Optional[str] = None
    action: Optional[str] = None
    resource: Optional[str] = None
    resource_id: Optional[str] = None
    severity: Optional[AuditSeverity] = None
    category: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

class AuditLogList(BaseModel):
    logs: List[AuditLog]
    total: int
    page: int
    per_page: int
    pages: int

# System Configuration schemas
class SystemConfigBase(BaseModel):
    key: str = Field(..., min_length=1, max_length=100, regex=r'^[a-z0-9_.-]+$')
    value: Any
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=50)
    data_type: Optional[str] = Field(None, max_length=20)
    is_public: bool = False
    is_readonly: bool = False
    validation_schema: Optional[Dict[str, Any]] = None

class SystemConfigCreate(SystemConfigBase):
    pass

class SystemConfigUpdate(BaseModel):
    value: Optional[Any] = None
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=50)
    is_public: Optional[bool] = None
    is_readonly: Optional[bool] = None
    validation_schema: Optional[Dict[str, Any]] = None

class SystemConfig(SystemConfigBase, TimestampMixin):
    id: int
    updated_by: Optional[str] = None
    
    class Config:
        orm_mode = True

class SystemConfigList(BaseModel):
    configs: List[SystemConfig]
    total: int

# Notification schemas
class NotificationBase(BaseModel):
    user_id: Optional[str] = Field(None, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    type: NotificationType
    template: str = Field(..., max_length=100)
    subject: Optional[str] = Field(None, max_length=255)
    message: str
    related_type: Optional[str] = Field(None, max_length=50)
    related_id: Optional[str] = Field(None, max_length=255)
    metadata: Dict[str, Any] = {}
    priority: str = Field("normal", regex=r'^(low|normal|high|urgent)$')

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase, TimestampMixin):
    id: uuid.UUID
    status: NotificationStatus
    provider: Optional[str] = Field(None, max_length=50)
    provider_id: Optional[str] = Field(None, max_length=255)
    provider_response: Optional[Dict[str, Any]] = None
    attempts: int = 0
    max_attempts: int = 3
    next_attempt_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    failed_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class NotificationList(BaseModel):
    notifications: List[Notification]
    total: int
    page: int
    per_page: int
    pages: int

# API Key schemas
class ApiKeyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    owner_type: str = Field(..., max_length=50)
    owner_id: str = Field(..., max_length=255)
    scopes: List[str] = []
    rate_limit: Optional[int] = Field(None, gt=0)
    expires_at: Optional[datetime] = None
    allowed_ips: List[str] = []

class ApiKeyCreate(ApiKeyBase):
    pass

class ApiKeyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    scopes: Optional[List[str]] = None
    rate_limit: Optional[int] = Field(None, gt=0)
    expires_at: Optional[datetime] = None
    allowed_ips: Optional[List[str]] = None
    is_active: Optional[bool] = None

class ApiKey(ApiKeyBase, TimestampMixin):
    id: int
    key_prefix: str
    is_active: bool
    last_used_at: Optional[datetime] = None
    total_requests: int = 0
    
    class Config:
        orm_mode = True

class ApiKeyWithSecret(ApiKey):
    key: str  # Only returned on creation

class ApiKeyList(BaseModel):
    api_keys: List[ApiKey]
    total: int
    page: int
    per_page: int
    pages: int

# Dashboard and analytics schemas
class DashboardStats(BaseModel):
    total_orders: int
    total_revenue: Decimal
    active_service_orders: int
    pending_uploads: int
    total_users: int
    orders_today: int
    revenue_today: Decimal
    average_order_value: Decimal
    top_products: List[Dict[str, Any]]
    recent_orders: List[Dict[str, Any]]

class RevenueAnalytics(BaseModel):
    period: str  # daily, weekly, monthly
    data: List[Dict[str, Any]]  # [{date, revenue, orders}, ...]
    total_revenue: Decimal
    total_orders: int
    growth_rate: Optional[Decimal] = None

class ProductAnalytics(BaseModel):
    product_id: int
    product_name: str
    total_orders: int
    total_revenue: Decimal
    average_rating: Optional[Decimal] = None
    views: int
    conversion_rate: Optional[Decimal] = None

class ServiceAnalytics(BaseModel):
    total_uploads: int
    total_quotes: int
    total_service_orders: int
    quote_conversion_rate: Decimal
    average_quote_value: Decimal
    popular_materials: List[Dict[str, Any]]
    turnaround_times: Dict[str, Any]

# Health check schemas
class HealthCheck(BaseModel):
    status: str = "healthy"
    timestamp: datetime
    version: str
    environment: str
    services: Dict[str, Any] = {}

class ServiceHealth(BaseModel):
    name: str
    status: str  # healthy, degraded, unhealthy
    response_time_ms: Optional[float] = None
    last_check: datetime
    details: Optional[Dict[str, Any]] = None

# Common response schemas
class MessageResponse(BaseModel):
    message: str
    success: bool = True

class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
    request_id: Optional[str] = None

class PaginationInfo(BaseModel):
    page: int
    per_page: int
    pages: int
    total: int
    has_next: bool
    has_prev: bool

# File upload schemas
class FileUploadResponse(BaseModel):
    filename: str
    file_key: str
    file_size: int
    content_type: str
    upload_url: str

# Webhook schemas
class WebhookEvent(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]
    timestamp: datetime
    source: str

class WebhookResponse(BaseModel):
    received: bool = True
    processed: bool = True
    message: Optional[str] = None
