from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, Text, ForeignKey, JSON, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from ..database import Base
import uuid
import enum
from datetime import datetime

# Import access control models
from .access_control import user_roles, UserSession, AccessLog

class MemberRole(str, enum.Enum):
    MAKER = "maker"
    SERVICE_PROVIDER = "service_provider"
    ADMIN = "admin"
    MAKERSPACE_ADMIN = "makerspace_admin"
    SUPER_ADMIN = "super_admin"

class MemberStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    PENDING = "pending"
    SUSPENDED = "suspended"
    LOCKED = "locked"

class InviteStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class TwoFactorMethod(str, enum.Enum):
    NONE = "none"
    TOTP = "totp"
    SMS = "sms"
    EMAIL = "email"

class Member(Base):
    """Enhanced member model with access control integration"""
    __tablename__ = "members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    keycloak_user_id = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    
    # Primary role for backward compatibility
    role = Column(Enum(MemberRole), nullable=False, default=MemberRole.MAKER)
    
    # Membership details
    membership_plan_id = Column(UUID(as_uuid=True), ForeignKey("membership_plans.id"), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)
    status = Column(Enum(MemberStatus), nullable=False, default=MemberStatus.ACTIVE)
    
    # Profile information
    skills = Column(JSON, default=list)
    bio = Column(Text)
    profile_image_url = Column(String(500))
    
    # Activity tracking
    last_login = Column(DateTime(timezone=True))
    login_count = Column(Integer, default=0)
    projects_count = Column(Integer, default=0)
    reservations_count = Column(Integer, default=0)
    
    # Credits and usage
    credits_used = Column(Integer, default=0)
    credits_remaining = Column(Integer, default=100)
    hours_used_this_month = Column(Float, default=0.0)
    
    # Security and access control
    failed_login_attempts = Column(Integer, default=0)
    account_locked = Column(Boolean, default=False)
    account_locked_until = Column(DateTime(timezone=True), nullable=True)
    last_failed_login = Column(DateTime(timezone=True), nullable=True)
    password_expires_at = Column(DateTime(timezone=True), nullable=True)
    requires_password_change = Column(Boolean, default=False)
    
    # Two-factor authentication
    two_factor_method = Column(Enum(TwoFactorMethod), default=TwoFactorMethod.NONE)
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String(255), nullable=True)  # Encrypted TOTP secret
    two_factor_backup_codes = Column(ARRAY(String), nullable=True)  # Encrypted backup codes
    two_factor_phone = Column(String(20), nullable=True)  # For SMS 2FA
    
    # Password history (for policy enforcement)
    password_history = Column(JSON, default=list)  # Last N password hashes
    password_changed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Session management
    max_concurrent_sessions = Column(Integer, default=5)
    force_logout_on_password_change = Column(Boolean, default=True)
    
    # Admin fields
    notes = Column(Text)
    suspension_reason = Column(Text)
    suspended_by = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=True)
    suspended_at = Column(DateTime(timezone=True))
    
    # Terms and privacy
    terms_accepted_at = Column(DateTime(timezone=True), nullable=True)
    privacy_accepted_at = Column(DateTime(timezone=True), nullable=True)
    marketing_consent = Column(Boolean, default=False)
    
    # Compliance and GDPR
    data_retention_date = Column(DateTime(timezone=True), nullable=True)
    gdpr_consent = Column(Boolean, default=False)
    gdpr_consent_date = Column(DateTime(timezone=True), nullable=True)
    data_export_requested = Column(Boolean, default=False)
    data_deletion_requested = Column(Boolean, default=False)
    data_deletion_scheduled = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    join_date = Column(DateTime(timezone=True), server_default=func.now())
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign keys
    makerspace_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Relationships
    membership_plan = relationship("MembershipPlan", back_populates="members")
    activity_logs = relationship("MemberActivityLog", back_populates="member")
    suspended_by_user = relationship("Member", remote_side=[id], foreign_keys=[suspended_by])
    
    # Access control relationships
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    access_logs = relationship("AccessLog", back_populates="user")
    
    def __repr__(self):
        return f"<Member(email={self.email}, name={self.first_name} {self.last_name})>"
    
    def get_effective_permissions(self):
        """Get all effective permissions from all assigned roles"""
        permissions = set()
        for role in self.roles:
            role_permissions = role.get_effective_permissions()
            permissions.update([perm.codename for perm in role_permissions])
        return list(permissions)
    
    def has_permission(self, permission_code: str) -> bool:
        """Check if member has specific permission"""
        # Super admin has all permissions
        if self.role == MemberRole.SUPER_ADMIN:
            return True
        
        # Check through roles
        effective_permissions = self.get_effective_permissions()
        return permission_code in effective_permissions
    
    def has_role(self, role_name: str) -> bool:
        """Check if member has specific role"""
        return any(role.name == role_name for role in self.roles)
    
    def get_highest_priority_role(self):
        """Get the role with highest priority level"""
        if not self.roles:
            return None
        return max(self.roles, key=lambda r: r.priority_level)
    
    def is_account_locked(self) -> bool:
        """Check if account is currently locked"""
        if not self.account_locked:
            return False
        
        if self.account_locked_until and datetime.utcnow() > self.account_locked_until:
            # Lock has expired, unlock account
            self.account_locked = False
            self.account_locked_until = None
            self.failed_login_attempts = 0
            return False
        
        return True
    
    def increment_failed_login(self, max_attempts: int = 5, lockout_minutes: int = 30):
        """Increment failed login attempts and lock if necessary"""
        self.failed_login_attempts += 1
        self.last_failed_login = datetime.utcnow()
        
        if self.failed_login_attempts >= max_attempts:
            self.account_locked = True
            from datetime import timedelta
            self.account_locked_until = datetime.utcnow() + timedelta(minutes=lockout_minutes)
    
    def reset_failed_logins(self):
        """Reset failed login counter on successful login"""
        self.failed_login_attempts = 0
        self.last_failed_login = None
        self.account_locked = False
        self.account_locked_until = None
        self.last_login = datetime.utcnow()
        self.login_count += 1
    
    def update_last_activity(self):
        """Update last activity timestamp"""
        self.last_activity = datetime.utcnow()
    
    def get_active_sessions_count(self):
        """Get count of active sessions"""
        return len([s for s in self.sessions if s.is_active and not s.is_expired()])
    
    def can_create_new_session(self) -> bool:
        """Check if user can create a new session"""
        if self.is_account_locked():
            return False
        
        active_sessions = self.get_active_sessions_count()
        return active_sessions < self.max_concurrent_sessions
    
    def terminate_all_sessions(self, reason: str = "admin_action"):
        """Terminate all active sessions"""
        for session in self.sessions:
            if session.is_active:
                session.is_active = False
                session.ended_at = datetime.utcnow()
                session.end_reason = reason
    
    def is_password_expired(self, max_age_days: int = 90) -> bool:
        """Check if password is expired"""
        if not self.password_expires_at:
            return False
        return datetime.utcnow() > self.password_expires_at
    
    def add_password_to_history(self, password_hash: str, max_history: int = 5):
        """Add password hash to history"""
        if not self.password_history:
            self.password_history = []
        
        self.password_history.insert(0, password_hash)
        if len(self.password_history) > max_history:
            self.password_history = self.password_history[:max_history]
        
        self.password_changed_at = datetime.utcnow()
    
    def can_reuse_password(self, password_hash: str) -> bool:
        """Check if password can be reused based on history"""
        if not self.password_history:
            return True
        return password_hash not in self.password_history
    
    def enable_two_factor(self, method: TwoFactorMethod, secret: str = None, phone: str = None):
        """Enable two-factor authentication"""
        self.two_factor_method = method
        self.two_factor_enabled = True
        
        if method == TwoFactorMethod.TOTP and secret:
            self.two_factor_secret = secret  # Should be encrypted
        elif method == TwoFactorMethod.SMS and phone:
            self.two_factor_phone = phone
    
    def disable_two_factor(self):
        """Disable two-factor authentication"""
        self.two_factor_method = TwoFactorMethod.NONE
        self.two_factor_enabled = False
        self.two_factor_secret = None
        self.two_factor_backup_codes = None
        self.two_factor_phone = None
    
    def generate_backup_codes(self, count: int = 10) -> list:
        """Generate backup codes for 2FA"""
        import secrets
        import string
        
        codes = []
        for _ in range(count):
            code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
            codes.append(code)
        
        # Store encrypted codes
        self.two_factor_backup_codes = codes  # Should be encrypted
        return codes
    
    def use_backup_code(self, code: str) -> bool:
        """Use a backup code for 2FA"""
        if not self.two_factor_backup_codes or code not in self.two_factor_backup_codes:
            return False
        
        # Remove used code
        self.two_factor_backup_codes.remove(code)
        return True
    
    def is_membership_expired(self) -> bool:
        """Check if membership is expired"""
        return datetime.utcnow() > self.end_date
    
    def is_membership_expiring_soon(self, days: int = 7) -> bool:
        """Check if membership is expiring soon"""
        from datetime import timedelta
        warning_date = datetime.utcnow() + timedelta(days=days)
        return self.end_date <= warning_date
    
    def can_access_makerspace(self) -> bool:
        """Check if member can access makerspace"""
        return (
            self.is_active and 
            self.status == MemberStatus.ACTIVE and 
            not self.is_account_locked() and
            not self.is_membership_expired()
        )
    
    def get_dashboard_config(self) -> dict:
        """Get merged dashboard configuration from roles"""
        config = {}
        for role in sorted(self.roles, key=lambda r: r.priority_level, reverse=True):
            if role.dashboard_config:
                config.update(role.dashboard_config)
        return config
    
    def get_menu_restrictions(self) -> dict:
        """Get merged menu restrictions from roles"""
        restrictions = {"hidden_items": [], "disabled_items": []}
        for role in self.roles:
            if role.menu_restrictions:
                if "hidden_items" in role.menu_restrictions:
                    restrictions["hidden_items"].extend(role.menu_restrictions["hidden_items"])
                if "disabled_items" in role.menu_restrictions:
                    restrictions["disabled_items"].extend(role.menu_restrictions["disabled_items"])
        
        # Remove duplicates
        restrictions["hidden_items"] = list(set(restrictions["hidden_items"]))
        restrictions["disabled_items"] = list(set(restrictions["disabled_items"]))
        return restrictions
    
    def to_dict(self, include_sensitive: bool = False):
        """Convert member to dictionary for API responses"""
        data = {
            "id": str(self.id),
            "keycloak_user_id": self.keycloak_user_id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone": self.phone,
            "role": self.role.value if self.role else None,
            "membership_plan_id": str(self.membership_plan_id),
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "is_active": self.is_active,
            "status": self.status.value if self.status else None,
            "skills": self.skills,
            "bio": self.bio,
            "profile_image_url": self.profile_image_url,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "login_count": self.login_count,
            "projects_count": self.projects_count,
            "reservations_count": self.reservations_count,
            "credits_used": self.credits_used,
            "credits_remaining": self.credits_remaining,
            "hours_used_this_month": self.hours_used_this_month,
            "notes": self.notes,
            "suspension_reason": self.suspension_reason,
            "suspended_by": str(self.suspended_by) if self.suspended_by else None,
            "suspended_at": self.suspended_at.isoformat() if self.suspended_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "join_date": self.join_date.isoformat() if self.join_date else None,
            "last_activity": self.last_activity.isoformat() if self.last_activity else None,
            "makerspace_id": str(self.makerspace_id),
            "roles": [role.to_dict() for role in self.roles],
            "permissions": self.get_effective_permissions(),
            "active_sessions": self.get_active_sessions_count(),
            "account_locked": self.account_locked,
            "two_factor_enabled": self.two_factor_enabled,
            "two_factor_method": self.two_factor_method.value if self.two_factor_method else None,
            "requires_password_change": self.requires_password_change,
            "membership_expired": self.is_membership_expired(),
            "membership_expiring_soon": self.is_membership_expiring_soon(),
            "can_access_makerspace": self.can_access_makerspace()
        }
        
        if include_sensitive:
            data.update({
                "failed_login_attempts": self.failed_login_attempts,
                "last_failed_login": self.last_failed_login.isoformat() if self.last_failed_login else None,
                "password_expires_at": self.password_expires_at.isoformat() if self.password_expires_at else None,
                "password_changed_at": self.password_changed_at.isoformat() if self.password_changed_at else None,
                "terms_accepted_at": self.terms_accepted_at.isoformat() if self.terms_accepted_at else None,
                "privacy_accepted_at": self.privacy_accepted_at.isoformat() if self.privacy_accepted_at else None,
                "marketing_consent": self.marketing_consent,
                "gdpr_consent": self.gdpr_consent,
                "gdpr_consent_date": self.gdpr_consent_date.isoformat() if self.gdpr_consent_date else None
            })
        
        return data

# Update the original models to reference the enhanced member
class MemberActivityLog(Base):
    __tablename__ = "member_activity_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=False)
    
    # Activity details
    activity_type = Column(String(100), nullable=False)
    description = Column(Text)
    metadata = Column(JSON, default=dict)
    
    # Context
    ip_address = Column(String(45))
    user_agent = Column(Text)
    session_id = Column(String(100))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    member = relationship("Member", back_populates="activity_logs")

class MembershipTransaction(Base):
    __tablename__ = "membership_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=False)
    membership_plan_id = Column(UUID(as_uuid=True), ForeignKey("membership_plans.id"), nullable=False)
    
    # Transaction details
    transaction_type = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    
    # Payment details
    payment_method = Column(String(50))
    payment_id = Column(String(100))
    payment_status = Column(String(50), default="pending")
    
    # Validity period
    starts_at = Column(DateTime(timezone=True), nullable=False)
    ends_at = Column(DateTime(timezone=True), nullable=False)
    
    # Admin fields
    processed_by = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=True)
    notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    member = relationship("Member")
    membership_plan = relationship("MembershipPlan")
    processed_by_user = relationship("Member", foreign_keys=[processed_by])

# Indexes for better performance
from sqlalchemy import Index

# Create comprehensive indexes
Index('idx_enhanced_member_email', Member.email)
Index('idx_enhanced_member_keycloak_id', Member.keycloak_user_id)
Index('idx_enhanced_member_makerspace', Member.makerspace_id)
Index('idx_enhanced_member_status', Member.status)
Index('idx_enhanced_member_role', Member.role)
Index('idx_enhanced_member_active', Member.is_active)
Index('idx_enhanced_member_last_login', Member.last_login)
Index('idx_enhanced_member_membership_plan', Member.membership_plan_id)
Index('idx_enhanced_member_account_locked', Member.account_locked)
Index('idx_enhanced_member_two_factor', Member.two_factor_enabled)
Index('idx_enhanced_member_created_at', Member.created_at)
Index('idx_enhanced_member_join_date', Member.join_date)
Index('idx_enhanced_member_last_activity', Member.last_activity)
