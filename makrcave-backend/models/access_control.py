from sqlalchemy import Column, String, Boolean, Integer, Float, ForeignKey, JSON, DateTime, Text, Enum as SQLEnum, Table
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from ..database import Base

# Association tables for many-to-many relationships
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', UUID(as_uuid=True), ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', UUID(as_uuid=True), ForeignKey('permissions.id'), primary_key=True)
)

user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('members.id'), primary_key=True),
    Column('role_id', UUID(as_uuid=True), ForeignKey('roles.id'), primary_key=True)
)

role_makerspace_access = Table(
    'role_makerspace_access',
    Base.metadata,
    Column('role_id', UUID(as_uuid=True), ForeignKey('roles.id'), primary_key=True),
    Column('makerspace_id', UUID(as_uuid=True), primary_key=True)
)

class PermissionType(enum.Enum):
    """Types of permissions in the system"""
    # Member management
    VIEW_MEMBERS = "view_members"
    CREATE_MEMBERS = "create_members"
    EDIT_MEMBERS = "edit_members"
    DELETE_MEMBERS = "delete_members"
    SUSPEND_MEMBERS = "suspend_members"
    EXPORT_MEMBERS = "export_members"
    
    # Equipment management
    VIEW_EQUIPMENT = "view_equipment"
    CREATE_EQUIPMENT = "create_equipment"
    EDIT_EQUIPMENT = "edit_equipment"
    DELETE_EQUIPMENT = "delete_equipment"
    MANAGE_RESERVATIONS = "manage_reservations"
    VIEW_ALL_RESERVATIONS = "view_all_reservations"
    
    # Project management
    VIEW_ALL_PROJECTS = "view_all_projects"
    MANAGE_PUBLIC_PROJECTS = "manage_public_projects"
    APPROVE_PROJECTS = "approve_projects"
    
    # Inventory management
    VIEW_INVENTORY = "view_inventory"
    MANAGE_INVENTORY = "manage_inventory"
    APPROVE_PURCHASES = "approve_purchases"
    VIEW_INVENTORY_REPORTS = "view_inventory_reports"
    
    # Financial
    VIEW_BILLING = "view_billing"
    MANAGE_BILLING = "manage_billing"
    VIEW_FINANCIAL_REPORTS = "view_financial_reports"
    PROCESS_PAYMENTS = "process_payments"
    
    # Analytics and reports
    VIEW_ANALYTICS = "view_analytics"
    EXPORT_REPORTS = "export_reports"
    VIEW_USAGE_STATS = "view_usage_stats"
    
    # System administration
    MANAGE_SETTINGS = "manage_settings"
    MANAGE_ROLES = "manage_roles"
    MANAGE_PERMISSIONS = "manage_permissions"
    SYSTEM_ADMIN = "system_admin"
    
    # Makerspace management
    CREATE_MAKERSPACES = "create_makerspaces"
    EDIT_MAKERSPACE_SETTINGS = "edit_makerspace_settings"
    DELETE_MAKERSPACES = "delete_makerspaces"

class AccessScope(enum.Enum):
    """Scope of access for permissions"""
    GLOBAL = "global"  # Access to all makerspaces
    MAKERSPACE = "makerspace"  # Access to specific makerspace only
    SELF = "self"  # Access to own resources only

class RoleType(enum.Enum):
    """Built-in role types"""
    SUPER_ADMIN = "super_admin"
    MAKERSPACE_ADMIN = "makerspace_admin"
    STAFF = "staff"
    MEMBER = "member"
    SERVICE_PROVIDER = "service_provider"
    GUEST = "guest"
    CUSTOM = "custom"

class Permission(Base):
    """System permissions that can be assigned to roles"""
    __tablename__ = "permissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Permission details
    name = Column(String(100), nullable=False, unique=True)
    codename = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    permission_type = Column(SQLEnum(PermissionType), nullable=False)
    access_scope = Column(SQLEnum(AccessScope), default=AccessScope.MAKERSPACE)
    
    # Permission settings
    is_system = Column(Boolean, default=False)  # System permissions cannot be deleted
    is_active = Column(Boolean, default=True)
    requires_two_factor = Column(Boolean, default=False)  # For sensitive operations
    
    # Resource constraints
    resource_types = Column(JSON, nullable=True)  # Which resource types this permission applies to
    field_restrictions = Column(JSON, nullable=True)  # Which fields can be accessed
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), nullable=True)
    
    # Relationships
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")
    
    def __repr__(self):
        return f"<Permission(name={self.name}, type={self.permission_type})>"

class Role(Base):
    """Roles that group permissions and can be assigned to users"""
    __tablename__ = "roles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Role details
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    role_type = Column(SQLEnum(RoleType), default=RoleType.CUSTOM)
    
    # Role settings
    is_system = Column(Boolean, default=False)  # System roles cannot be deleted
    is_active = Column(Boolean, default=True)
    is_assignable = Column(Boolean, default=True)  # Can this role be assigned to users
    max_assignments = Column(Integer, nullable=True)  # Maximum number of users that can have this role
    
    # Makerspace scope
    makerspace_id = Column(UUID(as_uuid=True), nullable=True)  # Null for global roles
    is_default = Column(Boolean, default=False)  # Default role for new members in this makerspace
    
    # Priority and hierarchy
    priority_level = Column(Integer, default=0)  # Higher number = higher priority
    parent_role_id = Column(UUID(as_uuid=True), ForeignKey('roles.id'), nullable=True)
    
    # Access constraints
    session_timeout_minutes = Column(Integer, default=480)  # 8 hours default
    allowed_ip_ranges = Column(ARRAY(String), nullable=True)
    requires_two_factor = Column(Boolean, default=False)
    max_concurrent_sessions = Column(Integer, default=5)
    
    # Feature access
    feature_flags = Column(JSON, nullable=True)  # Additional feature toggles
    dashboard_config = Column(JSON, nullable=True)  # Custom dashboard configuration
    menu_restrictions = Column(JSON, nullable=True)  # Which menu items to hide/show
    
    # Membership plan integration
    required_membership_plans = Column(ARRAY(UUID(as_uuid=True)), nullable=True)
    excluded_membership_plans = Column(ARRAY(UUID(as_uuid=True)), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), nullable=True)
    last_modified_by = Column(UUID(as_uuid=True), nullable=True)
    
    # Relationships
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")
    users = relationship("Member", secondary=user_roles, back_populates="roles")
    parent_role = relationship("Role", remote_side=[id], back_populates="child_roles")
    child_roles = relationship("Role", back_populates="parent_role")
    access_logs = relationship("RoleAccessLog", back_populates="role")
    
    def __repr__(self):
        return f"<Role(name={self.name}, type={self.role_type})>"
    
    def get_effective_permissions(self):
        """Get all permissions including inherited from parent roles"""
        permissions = set(self.permissions)
        
        # Add permissions from parent role
        if self.parent_role:
            parent_permissions = self.parent_role.get_effective_permissions()
            permissions.update(parent_permissions)
        
        return list(permissions)
    
    def can_assign_to_user(self, user_id: str, makerspace_id: str = None):
        """Check if this role can be assigned to a user"""
        if not self.is_assignable or not self.is_active:
            return False
        
        # Check makerspace scope
        if self.makerspace_id and self.makerspace_id != makerspace_id:
            return False
        
        # Check maximum assignments
        if self.max_assignments and len(self.users) >= self.max_assignments:
            return False
        
        return True
    
    def to_dict(self):
        """Convert role to dictionary for API responses"""
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "role_type": self.role_type.value if self.role_type else None,
            "is_system": self.is_system,
            "is_active": self.is_active,
            "is_assignable": self.is_assignable,
            "max_assignments": self.max_assignments,
            "makerspace_id": str(self.makerspace_id) if self.makerspace_id else None,
            "is_default": self.is_default,
            "priority_level": self.priority_level,
            "parent_role_id": str(self.parent_role_id) if self.parent_role_id else None,
            "session_timeout_minutes": self.session_timeout_minutes,
            "requires_two_factor": self.requires_two_factor,
            "max_concurrent_sessions": self.max_concurrent_sessions,
            "feature_flags": self.feature_flags,
            "dashboard_config": self.dashboard_config,
            "menu_restrictions": self.menu_restrictions,
            "required_membership_plans": [str(plan_id) for plan_id in self.required_membership_plans] if self.required_membership_plans else [],
            "excluded_membership_plans": [str(plan_id) for plan_id in self.excluded_membership_plans] if self.excluded_membership_plans else [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "permissions": [perm.codename for perm in self.permissions],
            "user_count": len(self.users) if self.users else 0
        }

class UserSession(Base):
    """Track user sessions for access control"""
    __tablename__ = "user_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('members.id'), nullable=False)
    
    # Session details
    session_token = Column(String(255), unique=True, nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    
    # Session state
    is_active = Column(Boolean, default=True)
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    
    # Security
    two_factor_verified = Column(Boolean, default=False)
    login_method = Column(String(50), nullable=True)  # password, sso, api_key, etc.
    device_fingerprint = Column(String(255), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    end_reason = Column(String(50), nullable=True)  # logout, timeout, forced, etc.
    
    # Relationships
    user = relationship("Member", back_populates="sessions")
    access_logs = relationship("AccessLog", back_populates="session")
    
    def is_expired(self):
        """Check if session is expired"""
        from datetime import datetime
        return datetime.utcnow() > self.expires_at
    
    def extend_session(self, minutes: int = 60):
        """Extend session timeout"""
        from datetime import datetime, timedelta
        self.expires_at = datetime.utcnow() + timedelta(minutes=minutes)
        self.last_activity = datetime.utcnow()

class AccessLog(Base):
    """Log all access attempts and actions"""
    __tablename__ = "access_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('members.id'), nullable=False)
    session_id = Column(UUID(as_uuid=True), ForeignKey('user_sessions.id'), nullable=True)
    
    # Access details
    action = Column(String(100), nullable=False)  # login, logout, view_page, api_call, etc.
    resource = Column(String(255), nullable=True)  # What was accessed
    resource_id = Column(String(100), nullable=True)
    method = Column(String(10), nullable=True)  # HTTP method
    endpoint = Column(String(255), nullable=True)
    
    # Request details
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    referrer = Column(Text, nullable=True)
    
    # Response details
    status_code = Column(Integer, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    bytes_sent = Column(Integer, nullable=True)
    
    # Security
    success = Column(Boolean, default=True)
    failure_reason = Column(String(255), nullable=True)
    security_flags = Column(JSON, nullable=True)  # suspicious activity indicators
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("Member")
    session = relationship("UserSession", back_populates="access_logs")

class RoleAccessLog(Base):
    """Log role assignment and permission changes"""
    __tablename__ = "role_access_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role_id = Column(UUID(as_uuid=True), ForeignKey('roles.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('members.id'), nullable=False)
    modified_by = Column(UUID(as_uuid=True), ForeignKey('members.id'), nullable=False)
    
    # Change details
    action = Column(String(50), nullable=False)  # assigned, revoked, modified
    previous_permissions = Column(JSON, nullable=True)
    new_permissions = Column(JSON, nullable=True)
    reason = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    effective_date = Column(DateTime(timezone=True), nullable=True)
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    role = relationship("Role", back_populates="access_logs")
    user = relationship("Member", foreign_keys=[user_id])
    modified_by_user = relationship("Member", foreign_keys=[modified_by])

class PasswordPolicy(Base):
    """Password policy configuration per makerspace"""
    __tablename__ = "password_policies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), nullable=True)  # Null for global policy
    
    # Password requirements
    min_length = Column(Integer, default=8)
    max_length = Column(Integer, default=128)
    require_uppercase = Column(Boolean, default=True)
    require_lowercase = Column(Boolean, default=True)
    require_numbers = Column(Boolean, default=True)
    require_special_chars = Column(Boolean, default=True)
    allowed_special_chars = Column(String(100), default="!@#$%^&*()_+-=[]{}|;:,.<>?")
    
    # History and reuse
    prevent_reuse_count = Column(Integer, default=5)  # Last N passwords cannot be reused
    max_age_days = Column(Integer, default=90)  # Force password change after N days
    warn_before_expiry_days = Column(Integer, default=7)
    
    # Lockout policy
    max_failed_attempts = Column(Integer, default=5)
    lockout_duration_minutes = Column(Integer, default=30)
    progressive_lockout = Column(Boolean, default=True)  # Increase lockout time with each attempt
    
    # Two-factor authentication
    require_2fa = Column(Boolean, default=False)
    require_2fa_for_roles = Column(ARRAY(UUID(as_uuid=True)), nullable=True)
    allowed_2fa_methods = Column(ARRAY(String), default=["totp", "sms", "email"])
    
    # Session management
    session_timeout_minutes = Column(Integer, default=480)  # 8 hours
    idle_timeout_minutes = Column(Integer, default=60)
    max_concurrent_sessions = Column(Integer, default=3)
    force_logout_on_password_change = Column(Boolean, default=True)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), nullable=True)
    
    def validate_password(self, password: str) -> dict:
        """Validate password against policy"""
        errors = []
        
        if len(password) < self.min_length:
            errors.append(f"Password must be at least {self.min_length} characters long")
        
        if len(password) > self.max_length:
            errors.append(f"Password must be no more than {self.max_length} characters long")
        
        if self.require_uppercase and not any(c.isupper() for c in password):
            errors.append("Password must contain at least one uppercase letter")
        
        if self.require_lowercase and not any(c.islower() for c in password):
            errors.append("Password must contain at least one lowercase letter")
        
        if self.require_numbers and not any(c.isdigit() for c in password):
            errors.append("Password must contain at least one number")
        
        if self.require_special_chars:
            if not any(c in self.allowed_special_chars for c in password):
                errors.append(f"Password must contain at least one special character: {self.allowed_special_chars}")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "strength_score": self._calculate_strength(password)
        }
    
    def _calculate_strength(self, password: str) -> int:
        """Calculate password strength score (0-100)"""
        score = 0
        
        # Length bonus
        if len(password) >= self.min_length:
            score += min(25, len(password) * 2)
        
        # Character variety
        if any(c.isupper() for c in password):
            score += 15
        if any(c.islower() for c in password):
            score += 15
        if any(c.isdigit() for c in password):
            score += 15
        if any(c in self.allowed_special_chars for c in password):
            score += 20
        
        # Pattern penalties
        if password.lower() in ['password', '123456', 'qwerty', 'admin']:
            score -= 50
        
        return max(0, min(100, score))

# Default system roles and permissions setup
def create_default_permissions():
    """Create default system permissions"""
    permissions = []
    for perm_type in PermissionType:
        permission = {
            "name": perm_type.value.replace("_", " ").title(),
            "codename": perm_type.value,
            "description": f"Permission to {perm_type.value.replace('_', ' ')}",
            "permission_type": perm_type,
            "is_system": True
        }
        permissions.append(permission)
    return permissions

def create_default_roles():
    """Create default system roles"""
    return [
        {
            "name": "Super Admin",
            "description": "Full system access across all makerspaces",
            "role_type": RoleType.SUPER_ADMIN,
            "is_system": True,
            "priority_level": 1000,
            "requires_two_factor": True,
            "permissions": [perm.value for perm in PermissionType]
        },
        {
            "name": "Makerspace Admin",
            "description": "Full access within assigned makerspace",
            "role_type": RoleType.MAKERSPACE_ADMIN,
            "is_system": True,
            "priority_level": 900,
            "requires_two_factor": True,
            "permissions": [
                PermissionType.VIEW_MEMBERS.value,
                PermissionType.CREATE_MEMBERS.value,
                PermissionType.EDIT_MEMBERS.value,
                PermissionType.SUSPEND_MEMBERS.value,
                PermissionType.VIEW_EQUIPMENT.value,
                PermissionType.CREATE_EQUIPMENT.value,
                PermissionType.EDIT_EQUIPMENT.value,
                PermissionType.MANAGE_RESERVATIONS.value,
                PermissionType.VIEW_ALL_RESERVATIONS.value,
                PermissionType.VIEW_INVENTORY.value,
                PermissionType.MANAGE_INVENTORY.value,
                PermissionType.VIEW_BILLING.value,
                PermissionType.MANAGE_BILLING.value,
                PermissionType.VIEW_ANALYTICS.value,
                PermissionType.EXPORT_REPORTS.value,
                PermissionType.MANAGE_SETTINGS.value,
                PermissionType.EDIT_MAKERSPACE_SETTINGS.value
            ]
        },
        {
            "name": "Staff",
            "description": "Staff member with operational access",
            "role_type": RoleType.STAFF,
            "is_system": True,
            "priority_level": 500,
            "permissions": [
                PermissionType.VIEW_MEMBERS.value,
                PermissionType.CREATE_MEMBERS.value,
                PermissionType.EDIT_MEMBERS.value,
                PermissionType.VIEW_EQUIPMENT.value,
                PermissionType.MANAGE_RESERVATIONS.value,
                PermissionType.VIEW_ALL_RESERVATIONS.value,
                PermissionType.VIEW_INVENTORY.value,
                PermissionType.MANAGE_INVENTORY.value,
                PermissionType.VIEW_BILLING.value
            ]
        },
        {
            "name": "Member",
            "description": "Regular makerspace member",
            "role_type": RoleType.MEMBER,
            "is_system": True,
            "is_default": True,
            "priority_level": 100,
            "permissions": [
                PermissionType.VIEW_EQUIPMENT.value
            ]
        },
        {
            "name": "Service Provider",
            "description": "External service provider",
            "role_type": RoleType.SERVICE_PROVIDER,
            "is_system": True,
            "priority_level": 200,
            "permissions": [
                PermissionType.VIEW_EQUIPMENT.value
            ]
        }
    ]
