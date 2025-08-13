from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional, List, Dict, Any, Set
from datetime import datetime
from enum import Enum

# Enums
class PermissionType(str, Enum):
    VIEW_MEMBERS = "view_members"
    CREATE_MEMBERS = "create_members"
    EDIT_MEMBERS = "edit_members"
    DELETE_MEMBERS = "delete_members"
    SUSPEND_MEMBERS = "suspend_members"
    EXPORT_MEMBERS = "export_members"
    VIEW_EQUIPMENT = "view_equipment"
    CREATE_EQUIPMENT = "create_equipment"
    EDIT_EQUIPMENT = "edit_equipment"
    DELETE_EQUIPMENT = "delete_equipment"
    MANAGE_RESERVATIONS = "manage_reservations"
    VIEW_ALL_RESERVATIONS = "view_all_reservations"
    VIEW_ALL_PROJECTS = "view_all_projects"
    MANAGE_PUBLIC_PROJECTS = "manage_public_projects"
    APPROVE_PROJECTS = "approve_projects"
    VIEW_INVENTORY = "view_inventory"
    MANAGE_INVENTORY = "manage_inventory"
    APPROVE_PURCHASES = "approve_purchases"
    VIEW_INVENTORY_REPORTS = "view_inventory_reports"
    VIEW_BILLING = "view_billing"
    MANAGE_BILLING = "manage_billing"
    VIEW_FINANCIAL_REPORTS = "view_financial_reports"
    PROCESS_PAYMENTS = "process_payments"
    VIEW_ANALYTICS = "view_analytics"
    EXPORT_REPORTS = "export_reports"
    VIEW_USAGE_STATS = "view_usage_stats"
    MANAGE_SETTINGS = "manage_settings"
    MANAGE_ROLES = "manage_roles"
    MANAGE_PERMISSIONS = "manage_permissions"
    SYSTEM_ADMIN = "system_admin"
    CREATE_MAKERSPACES = "create_makerspaces"
    EDIT_MAKERSPACE_SETTINGS = "edit_makerspace_settings"
    DELETE_MAKERSPACES = "delete_makerspaces"

class AccessScope(str, Enum):
    GLOBAL = "global"
    MAKERSPACE = "makerspace"
    SELF = "self"

class RoleType(str, Enum):
    SUPER_ADMIN = "super_admin"
    MAKERSPACE_ADMIN = "makerspace_admin"
    STAFF = "staff"
    MEMBER = "member"
    SERVICE_PROVIDER = "service_provider"
    GUEST = "guest"
    CUSTOM = "custom"

# Permission schemas
class PermissionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    codename: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    permission_type: PermissionType
    access_scope: AccessScope = AccessScope.MAKERSPACE
    is_active: bool = True
    requires_two_factor: bool = False
    resource_types: Optional[List[str]] = None
    field_restrictions: Optional[Dict[str, Any]] = None

class PermissionCreate(PermissionBase):
    pass

class PermissionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None
    requires_two_factor: Optional[bool] = None
    resource_types: Optional[List[str]] = None
    field_restrictions: Optional[Dict[str, Any]] = None

class PermissionResponse(PermissionBase):
    id: str
    is_system: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None

    class Config:
        from_attributes = True

# Role schemas
class RoleBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: bool = True
    is_assignable: bool = True
    max_assignments: Optional[int] = Field(None, gt=0)
    is_default: bool = False
    priority_level: int = Field(0, ge=0, le=1000)
    parent_role_id: Optional[str] = None
    session_timeout_minutes: int = Field(480, gt=0, le=43200)  # Max 30 days
    allowed_ip_ranges: Optional[List[str]] = None
    requires_two_factor: bool = False
    max_concurrent_sessions: int = Field(5, gt=0, le=100)
    feature_flags: Optional[Dict[str, Any]] = None
    dashboard_config: Optional[Dict[str, Any]] = None
    menu_restrictions: Optional[Dict[str, Any]] = None
    required_membership_plans: Optional[List[str]] = None
    excluded_membership_plans: Optional[List[str]] = None

class RoleCreate(RoleBase):
    role_type: RoleType = RoleType.CUSTOM
    makerspace_id: Optional[str] = None
    permission_ids: List[str] = []

class RoleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None
    is_assignable: Optional[bool] = None
    max_assignments: Optional[int] = Field(None, gt=0)
    is_default: Optional[bool] = None
    priority_level: Optional[int] = Field(None, ge=0, le=1000)
    parent_role_id: Optional[str] = None
    session_timeout_minutes: Optional[int] = Field(None, gt=0, le=43200)
    allowed_ip_ranges: Optional[List[str]] = None
    requires_two_factor: Optional[bool] = None
    max_concurrent_sessions: Optional[int] = Field(None, gt=0, le=100)
    feature_flags: Optional[Dict[str, Any]] = None
    dashboard_config: Optional[Dict[str, Any]] = None
    menu_restrictions: Optional[Dict[str, Any]] = None
    required_membership_plans: Optional[List[str]] = None
    excluded_membership_plans: Optional[List[str]] = None
    permission_ids: Optional[List[str]] = None

class RoleResponse(RoleBase):
    id: str
    role_type: RoleType
    is_system: bool
    makerspace_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    last_modified_by: Optional[str] = None
    permissions: List[str] = []  # Permission codenames
    user_count: int = 0
    effective_permissions: Optional[List[str]] = None  # Including inherited

    class Config:
        from_attributes = True

# User session schemas
class UserSessionCreate(BaseModel):
    user_id: str
    session_token: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    location: Optional[str] = None
    expires_at: datetime
    two_factor_verified: bool = False
    login_method: Optional[str] = None
    device_fingerprint: Optional[str] = None

class UserSessionResponse(BaseModel):
    id: str
    user_id: str
    session_token: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    location: Optional[str] = None
    is_active: bool
    last_activity: datetime
    expires_at: datetime
    two_factor_verified: bool
    login_method: Optional[str] = None
    device_fingerprint: Optional[str] = None
    created_at: datetime
    ended_at: Optional[datetime] = None
    end_reason: Optional[str] = None

    class Config:
        from_attributes = True

# Access log schemas
class AccessLogCreate(BaseModel):
    user_id: str
    session_id: Optional[str] = None
    action: str
    resource: Optional[str] = None
    resource_id: Optional[str] = None
    method: Optional[str] = None
    endpoint: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    referrer: Optional[str] = None
    status_code: Optional[int] = None
    response_time_ms: Optional[int] = None
    bytes_sent: Optional[int] = None
    success: bool = True
    failure_reason: Optional[str] = None
    security_flags: Optional[Dict[str, Any]] = None

class AccessLogResponse(BaseModel):
    id: str
    user_id: str
    session_id: Optional[str] = None
    action: str
    resource: Optional[str] = None
    resource_id: Optional[str] = None
    method: Optional[str] = None
    endpoint: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    referrer: Optional[str] = None
    status_code: Optional[int] = None
    response_time_ms: Optional[int] = None
    bytes_sent: Optional[int] = None
    success: bool
    failure_reason: Optional[str] = None
    security_flags: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Role assignment schemas
class RoleAssignmentCreate(BaseModel):
    user_id: str
    role_id: str
    reason: Optional[str] = None
    effective_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None

class RoleAssignmentUpdate(BaseModel):
    reason: Optional[str] = None
    effective_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None

class RoleAssignmentResponse(BaseModel):
    id: str
    role_id: str
    user_id: str
    modified_by: str
    action: str
    previous_permissions: Optional[List[str]] = None
    new_permissions: Optional[List[str]] = None
    reason: Optional[str] = None
    created_at: datetime
    effective_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None

    class Config:
        from_attributes = True

# Password policy schemas
class PasswordPolicyBase(BaseModel):
    min_length: int = Field(8, ge=1, le=128)
    max_length: int = Field(128, ge=8, le=512)
    require_uppercase: bool = True
    require_lowercase: bool = True
    require_numbers: bool = True
    require_special_chars: bool = True
    allowed_special_chars: str = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    prevent_reuse_count: int = Field(5, ge=0, le=50)
    max_age_days: int = Field(90, ge=0, le=365)
    warn_before_expiry_days: int = Field(7, ge=0, le=30)
    max_failed_attempts: int = Field(5, ge=1, le=20)
    lockout_duration_minutes: int = Field(30, ge=1, le=1440)
    progressive_lockout: bool = True
    require_2fa: bool = False
    require_2fa_for_roles: Optional[List[str]] = None
    allowed_2fa_methods: List[str] = ["totp", "sms", "email"]
    session_timeout_minutes: int = Field(480, ge=1, le=43200)
    idle_timeout_minutes: int = Field(60, ge=1, le=1440)
    max_concurrent_sessions: int = Field(3, ge=1, le=20)
    force_logout_on_password_change: bool = True

    @validator('max_length')
    def max_length_must_be_greater_than_min(cls, v, values):
        if 'min_length' in values and v < values['min_length']:
            raise ValueError('max_length must be greater than min_length')
        return v

class PasswordPolicyCreate(PasswordPolicyBase):
    makerspace_id: Optional[str] = None

class PasswordPolicyUpdate(BaseModel):
    min_length: Optional[int] = Field(None, ge=1, le=128)
    max_length: Optional[int] = Field(None, ge=8, le=512)
    require_uppercase: Optional[bool] = None
    require_lowercase: Optional[bool] = None
    require_numbers: Optional[bool] = None
    require_special_chars: Optional[bool] = None
    allowed_special_chars: Optional[str] = None
    prevent_reuse_count: Optional[int] = Field(None, ge=0, le=50)
    max_age_days: Optional[int] = Field(None, ge=0, le=365)
    warn_before_expiry_days: Optional[int] = Field(None, ge=0, le=30)
    max_failed_attempts: Optional[int] = Field(None, ge=1, le=20)
    lockout_duration_minutes: Optional[int] = Field(None, ge=1, le=1440)
    progressive_lockout: Optional[bool] = None
    require_2fa: Optional[bool] = None
    require_2fa_for_roles: Optional[List[str]] = None
    allowed_2fa_methods: Optional[List[str]] = None
    session_timeout_minutes: Optional[int] = Field(None, ge=1, le=43200)
    idle_timeout_minutes: Optional[int] = Field(None, ge=1, le=1440)
    max_concurrent_sessions: Optional[int] = Field(None, ge=1, le=20)
    force_logout_on_password_change: Optional[bool] = None

class PasswordPolicyResponse(PasswordPolicyBase):
    id: str
    makerspace_id: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None

    class Config:
        from_attributes = True

# Validation schemas
class PasswordValidationRequest(BaseModel):
    password: str
    makerspace_id: Optional[str] = None

class PasswordValidationResponse(BaseModel):
    valid: bool
    errors: List[str] = []
    strength_score: int = Field(..., ge=0, le=100)
    suggestions: List[str] = []

# User access management schemas
class UserAccessSummary(BaseModel):
    user_id: str
    user_email: str
    user_name: str
    roles: List[RoleResponse] = []
    permissions: List[str] = []  # All effective permissions
    active_sessions: int = 0
    last_login: Optional[datetime] = None
    account_locked: bool = False
    password_expires_at: Optional[datetime] = None
    requires_password_change: bool = False
    two_factor_enabled: bool = False

class BulkRoleAssignment(BaseModel):
    user_ids: List[str]
    role_ids: List[str]
    action: str = Field(..., regex="^(assign|revoke)$")
    reason: Optional[str] = None
    effective_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None

class AccessControlFilter(BaseModel):
    user_ids: Optional[List[str]] = None
    role_ids: Optional[List[str]] = None
    permission_codes: Optional[List[str]] = None
    makerspace_id: Optional[str] = None
    is_active: Optional[bool] = None
    has_active_session: Optional[bool] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

class AccessControlStats(BaseModel):
    total_users: int
    active_users: int
    locked_users: int
    users_requiring_password_change: int
    users_with_2fa: int
    total_roles: int
    system_roles: int
    custom_roles: int
    total_permissions: int
    active_sessions: int
    recent_login_attempts: int
    failed_login_attempts: int

# Enhanced member schema integration
class EnhancedMemberResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: str  # Primary role for backward compatibility
    roles: List[RoleResponse] = []  # All assigned roles
    permissions: List[str] = []  # All effective permissions
    membership_plan_id: str
    membership_plan_name: Optional[str] = None
    start_date: datetime
    end_date: datetime
    is_active: bool
    status: str
    profile_image_url: Optional[str] = None
    skills: List[str] = []
    bio: Optional[str] = None
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
    updated_at: Optional[datetime] = None
    join_date: datetime
    makerspace_id: str
    
    # Access control fields
    active_sessions: int = 0
    account_locked: bool = False
    password_expires_at: Optional[datetime] = None
    requires_password_change: bool = False
    two_factor_enabled: bool = False
    failed_login_attempts: int = 0
    last_failed_login: Optional[datetime] = None

    class Config:
        from_attributes = True

# Import/Export schemas
class RoleExport(BaseModel):
    format: str = Field("json", regex="^(json|csv|xlsx)$")
    include_permissions: bool = True
    include_users: bool = False
    makerspace_id: Optional[str] = None

class RoleImport(BaseModel):
    roles: List[RoleCreate]
    update_existing: bool = False
    skip_invalid: bool = True

class PermissionExport(BaseModel):
    format: str = Field("json", regex="^(json|csv|xlsx)$")
    include_roles: bool = True
    system_permissions_only: bool = False

class AuditLogFilter(BaseModel):
    user_id: Optional[str] = None
    action: Optional[str] = None
    resource: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    success_only: bool = False
    makerspace_id: Optional[str] = None
    ip_address: Optional[str] = None

class SecurityAlert(BaseModel):
    id: str
    alert_type: str
    severity: str = Field(..., regex="^(low|medium|high|critical)$")
    title: str
    description: str
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    details: Dict[str, Any] = {}
    resolved: bool = False
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
