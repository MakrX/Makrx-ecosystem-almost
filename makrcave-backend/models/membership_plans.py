from sqlalchemy import Column, String, Boolean, Integer, Float, ForeignKey, JSON, DateTime, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from .base import Base

class PlanType(enum.Enum):
    FREE = "free"
    BASIC = "basic"
    STANDARD = "standard"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"
    CUSTOM = "custom"

class BillingCycle(enum.Enum):
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"
    LIFETIME = "lifetime"

class AccessType(enum.Enum):
    TIME_LIMITED = "time_limited"  # Limited hours per cycle
    UNLIMITED = "unlimited"        # Unlimited access during operating hours
    SPECIFIC_HOURS = "specific_hours"  # Specific time slots only
    WEEKDAYS_ONLY = "weekdays_only"
    WEEKENDS_ONLY = "weekends_only"

class MembershipPlan(Base):
    __tablename__ = "membership_plans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    
    # Basic Plan Information
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    plan_type = Column(SQLEnum(PlanType), default=PlanType.BASIC)
    
    # Pricing
    price = Column(Float, default=0.0)  # Base price
    currency = Column(String(3), default="USD")
    billing_cycle = Column(SQLEnum(BillingCycle), default=BillingCycle.MONTHLY)
    setup_fee = Column(Float, default=0.0)
    
    # Access Control
    access_type = Column(SQLEnum(AccessType), default=AccessType.UNLIMITED)
    max_hours_per_cycle = Column(Integer, nullable=True)  # For time_limited plans
    allowed_time_slots = Column(JSON, nullable=True)  # For specific_hours plans
    
    # Equipment Access
    included_equipment = Column(JSON, nullable=True)  # List of equipment IDs included
    equipment_hourly_rates = Column(JSON, nullable=True)  # Custom rates for equipment
    skill_requirements = Column(JSON, nullable=True)  # Required skills for this plan
    
    # Benefits and Features
    features = Column(JSON, nullable=True)  # List of plan features
    guest_passes_per_cycle = Column(Integer, default=0)
    storage_space_gb = Column(Float, default=0.0)
    project_limit = Column(Integer, nullable=True)  # Max concurrent projects
    priority_booking = Column(Boolean, default=False)
    
    # Restrictions
    max_booking_advance_days = Column(Integer, default=30)
    max_booking_duration_hours = Column(Integer, default=8)
    cancellation_hours_before = Column(Integer, default=24)
    
    # Plan Settings
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=True)  # Visible to members for self-signup
    requires_approval = Column(Boolean, default=False)
    auto_renew = Column(Boolean, default=True)
    grace_period_days = Column(Integer, default=3)
    
    # Limits
    max_members = Column(Integer, nullable=True)  # Maximum members for this plan
    current_members = Column(Integer, default=0)
    
    # Trial Settings
    trial_period_days = Column(Integer, default=0)
    trial_features = Column(JSON, nullable=True)
    
    # Discounts and Promotions
    discount_percent = Column(Float, default=0.0)
    discount_start_date = Column(DateTime(timezone=True), nullable=True)
    discount_end_date = Column(DateTime(timezone=True), nullable=True)
    promo_code = Column(String(50), nullable=True)
    
    # Display Settings
    display_order = Column(Integer, default=0)
    highlight_plan = Column(Boolean, default=False)  # Feature this plan
    badge_text = Column(String(50), nullable=True)  # "Most Popular", "Best Value", etc.
    custom_color = Column(String(7), nullable=True)  # Hex color for plan display
    
    # Terms and Conditions
    terms_text = Column(Text, nullable=True)
    contract_length_months = Column(Integer, nullable=True)
    early_termination_fee = Column(Float, default=0.0)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Relationships
    makerspace = relationship("Makerspace", back_populates="membership_plans")
    members = relationship("Member", back_populates="membership_plan")
    created_by_user = relationship("User", foreign_keys=[created_by])
    updated_by_user = relationship("User", foreign_keys=[updated_by])
    
    def __repr__(self):
        return f"<MembershipPlan(name={self.name}, price={self.price}, cycle={self.billing_cycle})>"

    def to_dict(self):
        """Convert plan to dictionary for API responses"""
        return {
            "id": str(self.id),
            "makerspace_id": str(self.makerspace_id),
            "name": self.name,
            "description": self.description,
            "plan_type": self.plan_type.value if self.plan_type else None,
            "price": self.price,
            "currency": self.currency,
            "billing_cycle": self.billing_cycle.value if self.billing_cycle else None,
            "setup_fee": self.setup_fee,
            "access_type": self.access_type.value if self.access_type else None,
            "max_hours_per_cycle": self.max_hours_per_cycle,
            "allowed_time_slots": self.allowed_time_slots,
            "included_equipment": self.included_equipment,
            "equipment_hourly_rates": self.equipment_hourly_rates,
            "skill_requirements": self.skill_requirements,
            "features": self.features,
            "guest_passes_per_cycle": self.guest_passes_per_cycle,
            "storage_space_gb": self.storage_space_gb,
            "project_limit": self.project_limit,
            "priority_booking": self.priority_booking,
            "max_booking_advance_days": self.max_booking_advance_days,
            "max_booking_duration_hours": self.max_booking_duration_hours,
            "cancellation_hours_before": self.cancellation_hours_before,
            "is_active": self.is_active,
            "is_public": self.is_public,
            "requires_approval": self.requires_approval,
            "auto_renew": self.auto_renew,
            "grace_period_days": self.grace_period_days,
            "max_members": self.max_members,
            "current_members": self.current_members,
            "trial_period_days": self.trial_period_days,
            "trial_features": self.trial_features,
            "discount_percent": self.discount_percent,
            "discount_start_date": self.discount_start_date.isoformat() if self.discount_start_date else None,
            "discount_end_date": self.discount_end_date.isoformat() if self.discount_end_date else None,
            "promo_code": self.promo_code,
            "display_order": self.display_order,
            "highlight_plan": self.highlight_plan,
            "badge_text": self.badge_text,
            "custom_color": self.custom_color,
            "terms_text": self.terms_text,
            "contract_length_months": self.contract_length_months,
            "early_termination_fee": self.early_termination_fee,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "created_by": str(self.created_by) if self.created_by else None,
            "updated_by": str(self.updated_by) if self.updated_by else None
        }

    def get_effective_price(self, promo_code: str = None, current_date = None):
        """Calculate effective price including any active discounts"""
        from datetime import datetime
        
        if current_date is None:
            current_date = datetime.utcnow()
        
        base_price = self.price
        
        # Check if discount is active
        if (self.discount_percent > 0 and 
            (self.discount_start_date is None or current_date >= self.discount_start_date) and
            (self.discount_end_date is None or current_date <= self.discount_end_date)):
            
            # Verify promo code if required
            if self.promo_code and promo_code != self.promo_code:
                return base_price
                
            discount_amount = base_price * (self.discount_percent / 100)
            return max(0, base_price - discount_amount)
        
        return base_price

    def can_accommodate_member(self):
        """Check if plan can accommodate another member"""
        if self.max_members is None:
            return True
        return self.current_members < self.max_members

    def get_display_features(self):
        """Get formatted features for display"""
        features = self.features or []
        
        # Add automatic features based on plan settings
        auto_features = []
        
        if self.access_type == AccessType.UNLIMITED:
            auto_features.append("Unlimited access during operating hours")
        elif self.access_type == AccessType.TIME_LIMITED and self.max_hours_per_cycle:
            auto_features.append(f"{self.max_hours_per_cycle} hours per {self.billing_cycle.value}")
        
        if self.guest_passes_per_cycle > 0:
            auto_features.append(f"{self.guest_passes_per_cycle} guest passes per {self.billing_cycle.value}")
        
        if self.storage_space_gb > 0:
            auto_features.append(f"{self.storage_space_gb}GB storage space")
        
        if self.priority_booking:
            auto_features.append("Priority equipment booking")
        
        if self.trial_period_days > 0:
            auto_features.append(f"{self.trial_period_days} day free trial")
        
        return auto_features + features

    @classmethod
    def get_default_plans(cls, makerspace_id: str):
        """Get default membership plans for a new makerspace"""
        return [
            {
                "makerspace_id": makerspace_id,
                "name": "Free Access",
                "description": "Basic access for community members",
                "plan_type": "free",
                "price": 0.0,
                "billing_cycle": "monthly",
                "access_type": "time_limited",
                "max_hours_per_cycle": 4,
                "features": ["Community workspace access", "Basic tool usage", "Project collaboration"],
                "is_public": True,
                "requires_approval": True,
                "display_order": 1
            },
            {
                "makerspace_id": makerspace_id,
                "name": "Maker",
                "description": "Perfect for hobbyists and regular makers",
                "plan_type": "basic",
                "price": 99.0,
                "billing_cycle": "monthly",
                "access_type": "unlimited",
                "features": ["Unlimited access", "All basic equipment", "Storage space", "Community events"],
                "guest_passes_per_cycle": 2,
                "storage_space_gb": 5.0,
                "priority_booking": False,
                "is_public": True,
                "highlight_plan": True,
                "badge_text": "Most Popular",
                "display_order": 2
            },
            {
                "makerspace_id": makerspace_id,
                "name": "Pro Maker",
                "description": "For serious makers and small businesses",
                "plan_type": "premium",
                "price": 199.0,
                "billing_cycle": "monthly",
                "access_type": "unlimited",
                "features": ["24/7 access", "All equipment including premium", "Dedicated storage", "Guest privileges", "Priority support"],
                "guest_passes_per_cycle": 5,
                "storage_space_gb": 20.0,
                "priority_booking": True,
                "max_booking_advance_days": 60,
                "is_public": True,
                "display_order": 3
            }
        ]
