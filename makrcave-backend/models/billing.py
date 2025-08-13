from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from ..database import Base
import uuid
import enum

class TransactionType(str, enum.Enum):
    MEMBERSHIP = "membership"
    CREDIT_PURCHASE = "credit_purchase"
    SERVICE = "service"
    MATERIAL = "material"
    WORKSHOP = "workshop"
    PRINTING_3D = "printing_3d"
    LASER_CUTTING = "laser_cutting"
    REFUND = "refund"

class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"
    CANCELLED = "cancelled"

class PaymentGateway(str, enum.Enum):
    RAZORPAY = "razorpay"
    STRIPE = "stripe"
    UPI = "upi"
    CASH = "cash"
    BANK_TRANSFER = "bank_transfer"
    CREDIT = "credit"

class InvoiceStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    member_id = Column(String, ForeignKey("members.id"))
    makerspace_id = Column(String, nullable=False, index=True)
    
    # Transaction details
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="INR")
    type = Column(Enum(TransactionType), nullable=False)
    status = Column(Enum(TransactionStatus), nullable=False, default=TransactionStatus.PENDING)
    description = Column(Text)
    
    # Payment gateway details
    gateway = Column(Enum(PaymentGateway))
    gateway_transaction_id = Column(String(100))
    gateway_order_id = Column(String(100))
    gateway_payment_id = Column(String(100))
    gateway_signature = Column(String(500))
    
    # Service-specific details
    service_type = Column(String(50))  # 3d_print, laser_cut, workshop, etc.
    service_id = Column(String)  # Reference to specific service/job
    service_metadata = Column(JSON, default=dict)  # Additional service data
    
    # Credit system
    credits_used = Column(Integer, default=0)
    credits_earned = Column(Integer, default=0)
    
    # Billing period (for subscriptions)
    billing_period_start = Column(DateTime(timezone=True))
    billing_period_end = Column(DateTime(timezone=True))
    
    # Admin fields
    processed_by = Column(String)  # Admin who processed manual transactions
    notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    member = relationship("Member", back_populates="transactions")
    invoices = relationship("Invoice", back_populates="transaction")
    refunds = relationship("Refund", back_populates="original_transaction")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    invoice_number = Column(String(50), unique=True, nullable=False)
    user_id = Column(String, nullable=False, index=True)
    member_id = Column(String, ForeignKey("members.id"))
    makerspace_id = Column(String, nullable=False)
    transaction_id = Column(String, ForeignKey("transactions.id"))
    
    # Invoice details
    status = Column(Enum(InvoiceStatus), nullable=False, default=InvoiceStatus.DRAFT)
    amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0)
    total_amount = Column(Float, nullable=False)
    currency = Column(String(3), default="INR")
    
    # Invoice content
    title = Column(String(200), nullable=False)
    description = Column(Text)
    line_items = Column(JSON, default=list)  # Detailed breakdown
    
    # File storage
    file_path = Column(String(500))  # Path to generated PDF
    file_url = Column(String(500))   # Public URL to download
    
    # Billing details
    bill_to_name = Column(String(200))
    bill_to_email = Column(String(255))
    bill_to_address = Column(Text)
    bill_to_phone = Column(String(20))
    bill_to_tax_id = Column(String(50))  # GST/Tax ID
    
    # Due dates
    issue_date = Column(DateTime(timezone=True), nullable=False)
    due_date = Column(DateTime(timezone=True))
    paid_date = Column(DateTime(timezone=True))
    
    # Email tracking
    email_sent = Column(Boolean, default=False)
    email_sent_at = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    transaction = relationship("Transaction", back_populates="invoices")
    member = relationship("Member")

class CreditWallet(Base):
    __tablename__ = "credit_wallets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, unique=True, nullable=False, index=True)
    member_id = Column(String, ForeignKey("members.id"), unique=True)
    makerspace_id = Column(String, nullable=False)
    
    # Credit balance
    balance = Column(Integer, default=0)
    total_earned = Column(Integer, default=0)
    total_spent = Column(Integer, default=0)
    
    # Credit conversion rate (e.g., 1 INR = 1 credit)
    conversion_rate = Column(Float, default=1.0)
    
    # Wallet settings
    is_active = Column(Boolean, default=True)
    auto_recharge_enabled = Column(Boolean, default=False)
    auto_recharge_threshold = Column(Integer, default=10)
    auto_recharge_amount = Column(Integer, default=100)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_transaction_at = Column(DateTime(timezone=True))
    
    # Relationships
    member = relationship("Member")
    credit_transactions = relationship("CreditTransaction", back_populates="wallet")

class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    wallet_id = Column(String, ForeignKey("credit_wallets.id"), nullable=False)
    user_id = Column(String, nullable=False)
    
    # Transaction details
    type = Column(String(50), nullable=False)  # earned, spent, refund, manual_adjustment
    amount = Column(Integer, nullable=False)  # Positive for earned, negative for spent
    balance_after = Column(Integer, nullable=False)
    
    # Reference to related transaction/service
    related_transaction_id = Column(String, ForeignKey("transactions.id"))
    service_type = Column(String(50))
    service_id = Column(String)
    
    # Description and metadata
    description = Column(Text)
    metadata = Column(JSON, default=dict)
    
    # Admin fields
    processed_by = Column(String)  # For manual adjustments
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    wallet = relationship("CreditWallet", back_populates="credit_transactions")
    related_transaction = relationship("Transaction")

class Refund(Base):
    __tablename__ = "refunds"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    original_transaction_id = Column(String, ForeignKey("transactions.id"), nullable=False)
    user_id = Column(String, nullable=False)
    makerspace_id = Column(String, nullable=False)
    
    # Refund details
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="INR")
    reason = Column(Text, nullable=False)
    type = Column(String(50), default="full")  # full, partial
    
    # Processing details
    status = Column(String(50), default="pending")  # pending, processed, failed
    gateway_refund_id = Column(String(100))
    processed_by = Column(String, nullable=False)  # Admin who processed the refund
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True))
    
    # Relationships
    original_transaction = relationship("Transaction", back_populates="refunds")

class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    member_id = Column(String, ForeignKey("members.id"))
    
    # Payment method details
    type = Column(String(50), nullable=False)  # card, upi, bank_account
    gateway = Column(Enum(PaymentGateway), nullable=False)
    gateway_method_id = Column(String(100))  # Gateway-specific ID
    
    # Card details (encrypted/tokenized)
    last_four = Column(String(4))
    card_brand = Column(String(20))  # visa, mastercard, etc.
    expiry_month = Column(Integer)
    expiry_year = Column(Integer)
    
    # Bank/UPI details
    bank_name = Column(String(100))
    account_holder_name = Column(String(200))
    upi_id = Column(String(100))
    
    # Settings
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_used_at = Column(DateTime(timezone=True))
    
    # Relationships
    member = relationship("Member")

class BillingPlan(Base):
    __tablename__ = "billing_plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    membership_plan_id = Column(String, ForeignKey("membership_plans.id"), nullable=False)
    makerspace_id = Column(String, nullable=False)
    
    # Billing configuration
    billing_type = Column(String(50), nullable=False)  # one_time, recurring
    billing_interval = Column(String(50))  # monthly, quarterly, yearly
    billing_interval_count = Column(Integer, default=1)
    
    # Pricing
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="INR")
    tax_rate = Column(Float, default=0)  # Tax percentage
    
    # Trial and discounts
    trial_period_days = Column(Integer, default=0)
    discount_amount = Column(Float, default=0)
    discount_percentage = Column(Float, default=0)
    
    # Settings
    auto_renew = Column(Boolean, default=True)
    grace_period_days = Column(Integer, default=7)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    membership_plan = relationship("MembershipPlan")

# Indexes for better performance
from sqlalchemy import Index

# Create indexes
Index('idx_transaction_user', Transaction.user_id)
Index('idx_transaction_status', Transaction.status)
Index('idx_transaction_type', Transaction.type)
Index('idx_transaction_gateway_id', Transaction.gateway_transaction_id)
Index('idx_transaction_date', Transaction.created_at)
Index('idx_invoice_number', Invoice.invoice_number)
Index('idx_invoice_user', Invoice.user_id)
Index('idx_invoice_status', Invoice.status)
Index('idx_credit_wallet_user', CreditWallet.user_id)
Index('idx_credit_transaction_wallet', CreditTransaction.wallet_id)
Index('idx_refund_original_transaction', Refund.original_transaction_id)
