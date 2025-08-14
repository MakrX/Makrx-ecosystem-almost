from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class MemberRole(str, Enum):
    USER = "user"
    SERVICE_PROVIDER = "service_provider"
    ADMIN = "admin"
    MAKERSPACE_ADMIN = "makerspace_admin"

class MemberStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    PENDING = "pending"
    SUSPENDED = "suspended"

class InviteStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

# Base schemas
class MembershipPlanBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    duration_days: int = Field(..., gt=0)
    price: float = Field(..., ge=0)
    features: List[str] = []
    access_level: Dict[str, Any] = {}
    is_active: bool = True

class MembershipPlanCreate(MembershipPlanBase):
    makerspace_id: str

class MembershipPlanUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    duration_days: Optional[int] = Field(None, gt=0)
    price: Optional[float] = Field(None, ge=0)
    features: Optional[List[str]] = None
    access_level: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class MembershipPlanResponse(MembershipPlanBase):
    id: str
    makerspace_id: str
    created_at: datetime
    updated_at: Optional[datetime]
    member_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Member schemas
class MemberBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    role: MemberRole = MemberRole.USER
    skills: List[str] = []
    bio: Optional[str] = None

class MemberCreate(MemberBase):
    keycloak_user_id: str
    membership_plan_id: str
    makerspace_id: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class MemberUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    role: Optional[MemberRole] = None
    membership_plan_id: Optional[str] = None
    skills: Optional[List[str]] = None
    bio: Optional[str] = None
    is_active: Optional[bool] = None
    status: Optional[MemberStatus] = None
    notes: Optional[str] = None

class MemberSuspend(BaseModel):
    reason: str = Field(..., min_length=1)
    suspended_by: str

class MemberResponse(MemberBase):
    id: str
    keycloak_user_id: str
    membership_plan_id: str
    membership_plan_name: Optional[str] = None
    start_date: datetime
    end_date: datetime
    is_active: bool
    status: MemberStatus
    profile_image_url: Optional[str] = None
    last_login: Optional[datetime] = None
    login_count: int
    projects_count: int
    reservations_count: int
    credits_used: int
    credits_remaining: int
    hours_used_this_month: float
    notes: Optional[str] = None
    suspension_reason: Optional[str] = None
    suspended_by: Optional[str] = None
    suspended_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime]
    join_date: datetime
    makerspace_id: str

    class Config:
        from_attributes = True

class MemberSummaryResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: MemberRole
    status: MemberStatus
    membership_plan_name: Optional[str] = None
    last_login: Optional[datetime] = None
    join_date: datetime
    projects_count: int
    reservations_count: int

    class Config:
        from_attributes = True

# Member invite schemas
class MemberInviteBase(BaseModel):
    email: EmailStr
    role: MemberRole = MemberRole.USER
    membership_plan_id: str
    invite_message: Optional[str] = None

class MemberInviteCreate(MemberInviteBase):
    makerspace_id: str
    invited_by: str

class MemberInviteUpdate(BaseModel):
    status: Optional[InviteStatus] = None
    invite_message: Optional[str] = None

class MemberInviteResponse(MemberInviteBase):
    id: str
    invited_by: str
    invite_token: str
    status: InviteStatus
    expires_at: datetime
    accepted_at: Optional[datetime] = None
    email_sent: bool
    email_sent_at: Optional[datetime] = None
    reminder_sent: bool
    reminder_sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime]
    makerspace_id: str
    membership_plan_name: Optional[str] = None

    class Config:
        from_attributes = True

# Activity log schemas
class MemberActivityLogCreate(BaseModel):
    member_id: str
    activity_type: str
    description: Optional[str] = None
    metadata: Dict[str, Any] = {}
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    session_id: Optional[str] = None

class MemberActivityLogResponse(BaseModel):
    id: str
    member_id: str
    activity_type: str
    description: Optional[str] = None
    metadata: Dict[str, Any]
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    session_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Transaction schemas
class MembershipTransactionCreate(BaseModel):
    member_id: str
    membership_plan_id: str
    transaction_type: str
    amount: float = Field(..., ge=0)
    currency: str = "USD"
    payment_method: Optional[str] = None
    payment_id: Optional[str] = None
    starts_at: datetime
    ends_at: datetime
    processed_by: Optional[str] = None
    notes: Optional[str] = None

class MembershipTransactionUpdate(BaseModel):
    payment_status: Optional[str] = None
    payment_id: Optional[str] = None
    notes: Optional[str] = None

class MembershipTransactionResponse(BaseModel):
    id: str
    member_id: str
    membership_plan_id: str
    transaction_type: str
    amount: float
    currency: str
    payment_method: Optional[str] = None
    payment_id: Optional[str] = None
    payment_status: str
    starts_at: datetime
    ends_at: datetime
    processed_by: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Utility schemas
class MemberFilter(BaseModel):
    status: Optional[List[MemberStatus]] = None
    role: Optional[List[MemberRole]] = None
    membership_plan_id: Optional[str] = None
    makerspace_id: Optional[str] = None
    search: Optional[str] = None  # Search in name, email, skills
    is_active: Optional[bool] = None

class MemberSort(BaseModel):
    field: str = "created_at"
    direction: str = "desc"

    @validator('field')
    def validate_field(cls, v):
        allowed_fields = [
            'created_at', 'updated_at', 'join_date', 'last_login',
            'first_name', 'last_name', 'email', 'status', 'role'
        ]
        if v not in allowed_fields:
            raise ValueError(f'Sort field must be one of: {allowed_fields}')
        return v

    @validator('direction')
    def validate_direction(cls, v):
        if v.lower() not in ['asc', 'desc']:
            raise ValueError('Sort direction must be "asc" or "desc"')
        return v.lower()

class MemberStatistics(BaseModel):
    total_members: int
    active_members: int
    expired_members: int
    pending_members: int
    suspended_members: int
    members_by_role: Dict[str, int]
    members_by_plan: Dict[str, int]
    new_members_this_month: int
    expiring_soon: int  # Members expiring in next 30 days

class BulkMemberOperation(BaseModel):
    member_ids: List[str]
    operation: str  # suspend, activate, change_plan, etc.
    data: Optional[Dict[str, Any]] = {}

class MemberImport(BaseModel):
    members: List[MemberCreate]
    send_invites: bool = True
    skip_duplicates: bool = True

class MemberExport(BaseModel):
    format: str = "csv"  # csv, xlsx, json
    include_fields: Optional[List[str]] = None
    filters: Optional[MemberFilter] = None
