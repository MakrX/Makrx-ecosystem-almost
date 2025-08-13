"""
SQLAlchemy models for subscriptions, credits, and payment systems
Material subscriptions, prepaid credits, payment plans
"""

from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.db import Base

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text)
    short_description = Column(String(500))
    
    # Pricing
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="INR")
    billing_cycle = Column(String(20), nullable=False)  # monthly, quarterly, yearly
    billing_interval = Column(Integer, default=1)  # every N cycles
    
    # Plan features and contents
    features = Column(JSONB, default=[])  # Array of features
    included_items = Column(JSONB, default=[])  # Products included in subscription
    
    # Subscription metadata
    max_subscribers = Column(Integer, nullable=True)  # null = unlimited
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    
    # Trial settings
    trial_days = Column(Integer, default=0)
    
    # Images and media
    images = Column(JSONB, default=[])
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    subscriptions = relationship("Subscription", back_populates="plan")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=False)
    user_id = Column(String(255), nullable=False, index=True)  # From JWT sub claim
    email = Column(String(255), nullable=False, index=True)
    
    # Subscription status
    status = Column(String(50), nullable=False, default="active", index=True)
    # active, paused, cancelled, expired, past_due, trialing
    
    # Billing information
    current_period_start = Column(DateTime(timezone=True), nullable=False)
    current_period_end = Column(DateTime(timezone=True), nullable=False)
    next_billing_date = Column(DateTime(timezone=True))
    
    # Trial information
    trial_start = Column(DateTime(timezone=True))
    trial_end = Column(DateTime(timezone=True))
    
    # Payment information
    payment_id = Column(String(255), nullable=True, index=True)  # Stripe subscription ID
    payment_method = Column(String(50))
    
    # Delivery information
    shipping_address = Column(JSONB, default={})
    delivery_preferences = Column(JSONB, default={})  # frequency, timing, etc.
    
    # Subscription metadata
    notes = Column(Text)
    metadata = Column(JSONB, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    cancelled_at = Column(DateTime(timezone=True))
    ended_at = Column(DateTime(timezone=True))
    
    # Relationships
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
    deliveries = relationship("SubscriptionDelivery", back_populates="subscription")
    
    # Indexes
    __table_args__ = (
        Index("ix_subscriptions_user_status", "user_id", "status"),
        Index("ix_subscriptions_billing_date", "next_billing_date"),
    )

class SubscriptionDelivery(Base):
    __tablename__ = "subscription_deliveries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("subscriptions.id"), nullable=False)
    
    # Delivery details
    delivery_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(50), default="pending", index=True)
    # pending, packed, shipped, delivered, failed, skipped
    
    # Contents
    items = Column(JSONB, default=[])  # Products included in this delivery
    total_value = Column(Numeric(10, 2), default=0)
    
    # Shipping information
    tracking_number = Column(String(100))
    carrier = Column(String(100))
    shipping_method = Column(String(100))
    
    # Delivery address (snapshot)
    delivery_address = Column(JSONB, default={})
    
    # Notes and metadata
    packing_notes = Column(Text)
    delivery_notes = Column(Text)
    metadata = Column(JSONB, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    shipped_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    
    # Relationships
    subscription = relationship("Subscription", back_populates="deliveries")

class CreditWallet(Base):
    __tablename__ = "credit_wallets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(String(255), nullable=False, unique=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    
    # Credit balances
    current_balance = Column(Numeric(15, 2), default=0, nullable=False)
    lifetime_earned = Column(Numeric(15, 2), default=0, nullable=False)
    lifetime_spent = Column(Numeric(15, 2), default=0, nullable=False)
    
    # Wallet settings
    currency = Column(String(3), default="INR")
    auto_topup_enabled = Column(Boolean, default=False)
    auto_topup_threshold = Column(Numeric(10, 2), default=0)
    auto_topup_amount = Column(Numeric(10, 2), default=0)
    
    # Security
    is_active = Column(Boolean, default=True)
    is_locked = Column(Boolean, default=False)
    locked_reason = Column(String(500))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_activity = Column(DateTime(timezone=True))
    
    # Relationships
    transactions = relationship("CreditTransaction", back_populates="wallet")

class CreditTransaction(Base):
    __tablename__ = "credit_transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    wallet_id = Column(UUID(as_uuid=True), ForeignKey("credit_wallets.id"), nullable=False)
    
    # Transaction details
    transaction_type = Column(String(50), nullable=False, index=True)
    # credit_purchase, order_payment, refund, bonus, adjustment, expiry
    
    amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(String(3), default="INR")
    balance_before = Column(Numeric(15, 2), nullable=False)
    balance_after = Column(Numeric(15, 2), nullable=False)
    
    # Reference information
    reference_type = Column(String(50))  # order, payment, promotion, etc.
    reference_id = Column(String(255))
    
    # Transaction metadata
    description = Column(String(500))
    notes = Column(Text)
    metadata = Column(JSONB, default={})
    
    # Status and processing
    status = Column(String(50), default="completed", index=True)
    # pending, completed, failed, reversed
    
    # Expiry (for earned credits)
    expires_at = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True))
    
    # Relationships
    wallet = relationship("CreditWallet", back_populates="transactions")
    
    # Indexes
    __table_args__ = (
        Index("ix_credit_transactions_type_created", "transaction_type", "created_at"),
        Index("ix_credit_transactions_reference", "reference_type", "reference_id"),
    )

class BOMIntegration(Base):
    __tablename__ = "bom_integrations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    makrcave_project_id = Column(String(255), nullable=False, index=True)
    makrcave_user_id = Column(String(255), nullable=False, index=True)
    
    # BOM details
    bom_name = Column(String(255), nullable=False)
    project_name = Column(String(255))
    total_items = Column(Integer, default=0)
    
    # Import details
    import_status = Column(String(50), default="pending", index=True)
    # pending, processing, completed, failed, partial
    
    imported_items = Column(Integer, default=0)
    failed_items = Column(Integer, default=0)
    
    # Mapping information
    item_mappings = Column(JSONB, default={})  # MakrCave item ID -> Store product ID
    unmapped_items = Column(JSONB, default=[])  # Items that couldn't be mapped
    
    # Cart integration
    cart_id = Column(UUID(as_uuid=True), nullable=True)
    auto_add_to_cart = Column(Boolean, default=True)
    
    # Processing notes
    import_notes = Column(Text)
    error_log = Column(JSONB, default=[])
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Indexes
    __table_args__ = (
        Index("ix_bom_integrations_project_user", "makrcave_project_id", "makrcave_user_id"),
        Index("ix_bom_integrations_status_created", "import_status", "created_at"),
    )

class QuickReorder(Base):
    __tablename__ = "quick_reorders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    makrcave_id = Column(String(255), nullable=True, index=True)  # If linked to makerspace
    
    # Reorder details
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Product list
    products = Column(JSONB, default=[])  # Array of {product_id, quantity, notes}
    total_items = Column(Integer, default=0)
    estimated_total = Column(Numeric(10, 2), default=0)
    
    # Reorder settings
    is_active = Column(Boolean, default=True)
    auto_reorder = Column(Boolean, default=False)
    reorder_threshold = Column(JSONB, default={})  # Inventory thresholds
    reorder_frequency = Column(String(50))  # weekly, monthly, as_needed
    
    # Usage tracking
    times_used = Column(Integer, default=0)
    last_ordered = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Indexes
    __table_args__ = (
        Index("ix_quick_reorders_user_active", "user_id", "is_active"),
        Index("ix_quick_reorders_makrcave", "makrcave_id"),
    )
