from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from ..database import Base
import uuid
import enum

class MemberRole(str, enum.Enum):
    MAKER = "maker"
    SERVICE_PROVIDER = "service_provider"
    ADMIN = "admin"
    MAKERSPACE_ADMIN = "makerspace_admin"

class MemberStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    PENDING = "pending"
    SUSPENDED = "suspended"

class InviteStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class MembershipPlan(Base):
    __tablename__ = "membership_plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    description = Column(Text)
    duration_days = Column(Integer, nullable=False, default=30)
    price = Column(Float, nullable=False, default=0.0)
    features = Column(JSON, default=list)  # List of features
    access_level = Column(JSON, default=dict)  # Equipment, rooms, limits
    is_active = Column(Boolean, default=True)
    makerspace_id = Column(String, nullable=False)  # Reference to makerspace
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    members = relationship("Member", back_populates="membership_plan")

class Member(Base):
    __tablename__ = "members"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    keycloak_user_id = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    
    # Role and permissions
    role = Column(Enum(MemberRole), nullable=False, default=MemberRole.MAKER)
    
    # Membership details
    membership_plan_id = Column(String, ForeignKey("membership_plans.id"), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)
    status = Column(Enum(MemberStatus), nullable=False, default=MemberStatus.ACTIVE)
    
    # Profile information
    skills = Column(JSON, default=list)  # List of skills
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
    
    # Admin fields
    notes = Column(Text)  # Admin notes about the member
    suspension_reason = Column(Text)
    suspended_by = Column(String)  # User ID who suspended the member
    suspended_at = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    join_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign keys
    makerspace_id = Column(String, nullable=False)  # Reference to makerspace
    
    # Relationships
    membership_plan = relationship("MembershipPlan", back_populates="members")
    activity_logs = relationship("MemberActivityLog", back_populates="member")

class MemberInvite(Base):
    __tablename__ = "member_invites"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), nullable=False, index=True)
    role = Column(Enum(MemberRole), nullable=False, default=MemberRole.MAKER)
    membership_plan_id = Column(String, ForeignKey("membership_plans.id"), nullable=False)
    
    # Invitation details
    invited_by = Column(String, nullable=False)  # User ID of inviter
    invite_token = Column(String(100), unique=True, nullable=False)
    invite_message = Column(Text)  # Custom message from inviter
    
    # Status and expiry
    status = Column(Enum(InviteStatus), nullable=False, default=InviteStatus.PENDING)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    accepted_at = Column(DateTime(timezone=True))
    
    # Email tracking
    email_sent = Column(Boolean, default=False)
    email_sent_at = Column(DateTime(timezone=True))
    reminder_sent = Column(Boolean, default=False)
    reminder_sent_at = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    makerspace_id = Column(String, nullable=False)
    
    # Relationships
    membership_plan = relationship("MembershipPlan")

class MemberActivityLog(Base):
    __tablename__ = "member_activity_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    member_id = Column(String, ForeignKey("members.id"), nullable=False)
    
    # Activity details
    activity_type = Column(String(100), nullable=False)  # login, project_created, reservation_made, etc.
    description = Column(Text)
    metadata = Column(JSON, default=dict)  # Additional activity data
    
    # Context
    ip_address = Column(String(45))  # IPv4 or IPv6
    user_agent = Column(Text)
    session_id = Column(String(100))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    member = relationship("Member", back_populates="activity_logs")

class MembershipTransaction(Base):
    __tablename__ = "membership_transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    member_id = Column(String, ForeignKey("members.id"), nullable=False)
    membership_plan_id = Column(String, ForeignKey("membership_plans.id"), nullable=False)
    
    # Transaction details
    transaction_type = Column(String(50), nullable=False)  # purchase, renewal, upgrade, downgrade
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    
    # Payment details
    payment_method = Column(String(50))  # stripe, razorpay, cash, etc.
    payment_id = Column(String(100))  # External payment system ID
    payment_status = Column(String(50), default="pending")  # pending, completed, failed, refunded
    
    # Validity period
    starts_at = Column(DateTime(timezone=True), nullable=False)
    ends_at = Column(DateTime(timezone=True), nullable=False)
    
    # Admin fields
    processed_by = Column(String)  # Admin user ID who processed the transaction
    notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    member = relationship("Member")
    membership_plan = relationship("MembershipPlan")

# Indexes for better performance
from sqlalchemy import Index

# Create indexes
Index('idx_member_email', Member.email)
Index('idx_member_keycloak_id', Member.keycloak_user_id)
Index('idx_member_makerspace', Member.makerspace_id)
Index('idx_member_status', Member.status)
Index('idx_member_role', Member.role)
Index('idx_invite_email', MemberInvite.email)
Index('idx_invite_token', MemberInvite.invite_token)
Index('idx_invite_status', MemberInvite.status)
Index('idx_activity_member', MemberActivityLog.member_id)
Index('idx_activity_type', MemberActivityLog.activity_type)
Index('idx_transaction_member', MembershipTransaction.member_id)
