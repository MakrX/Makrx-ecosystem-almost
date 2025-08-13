from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum
from decimal import Decimal

# Enums
class TransactionType(str, Enum):
    MEMBERSHIP = "membership"
    CREDIT_PURCHASE = "credit_purchase"
    SERVICE = "service"
    MATERIAL = "material"
    WORKSHOP = "workshop"
    PRINTING_3D = "printing_3d"
    LASER_CUTTING = "laser_cutting"
    REFUND = "refund"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"
    CANCELLED = "cancelled"

class PaymentGateway(str, Enum):
    RAZORPAY = "razorpay"
    STRIPE = "stripe"
    UPI = "upi"
    CASH = "cash"
    BANK_TRANSFER = "bank_transfer"
    CREDIT = "credit"

class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

# Transaction schemas
class TransactionBase(BaseModel):
    amount: float = Field(..., gt=0)
    currency: str = Field(default="INR", max_length=3)
    type: TransactionType
    description: Optional[str] = None
    service_type: Optional[str] = None
    service_id: Optional[str] = None
    service_metadata: Dict[str, Any] = {}

class TransactionCreate(TransactionBase):
    user_id: str
    member_id: Optional[str] = None
    makerspace_id: str
    gateway: Optional[PaymentGateway] = None
    payment_method_id: Optional[str] = None
    billing_period_start: Optional[datetime] = None
    billing_period_end: Optional[datetime] = None
    notes: Optional[str] = None

class TransactionUpdate(BaseModel):
    status: Optional[TransactionStatus] = None
    gateway_transaction_id: Optional[str] = None
    gateway_order_id: Optional[str] = None
    gateway_payment_id: Optional[str] = None
    gateway_signature: Optional[str] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None

class TransactionResponse(TransactionBase):
    id: str
    user_id: str
    member_id: Optional[str] = None
    makerspace_id: str
    status: TransactionStatus
    gateway: Optional[PaymentGateway] = None
    gateway_transaction_id: Optional[str] = None
    gateway_order_id: Optional[str] = None
    credits_used: int = 0
    credits_earned: int = 0
    billing_period_start: Optional[datetime] = None
    billing_period_end: Optional[datetime] = None
    processed_by: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Invoice schemas
class InvoiceLineItem(BaseModel):
    description: str
    quantity: int = 1
    unit_price: float
    total_price: float
    tax_rate: float = 0
    tax_amount: float = 0

class InvoiceBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    amount: float = Field(..., gt=0)
    tax_amount: float = Field(default=0, ge=0)
    total_amount: float = Field(..., gt=0)
    currency: str = Field(default="INR", max_length=3)
    line_items: List[InvoiceLineItem] = []

class InvoiceCreate(InvoiceBase):
    user_id: str
    member_id: Optional[str] = None
    makerspace_id: str
    transaction_id: Optional[str] = None
    bill_to_name: str
    bill_to_email: EmailStr
    bill_to_address: Optional[str] = None
    bill_to_phone: Optional[str] = None
    bill_to_tax_id: Optional[str] = None
    issue_date: datetime
    due_date: Optional[datetime] = None

class InvoiceUpdate(BaseModel):
    status: Optional[InvoiceStatus] = None
    paid_date: Optional[datetime] = None
    email_sent: Optional[bool] = None
    email_sent_at: Optional[datetime] = None

class InvoiceResponse(InvoiceBase):
    id: str
    invoice_number: str
    user_id: str
    member_id: Optional[str] = None
    makerspace_id: str
    transaction_id: Optional[str] = None
    status: InvoiceStatus
    file_path: Optional[str] = None
    file_url: Optional[str] = None
    bill_to_name: str
    bill_to_email: str
    bill_to_address: Optional[str] = None
    bill_to_phone: Optional[str] = None
    bill_to_tax_id: Optional[str] = None
    issue_date: datetime
    due_date: Optional[datetime] = None
    paid_date: Optional[datetime] = None
    email_sent: bool = False
    email_sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Credit Wallet schemas
class CreditWalletResponse(BaseModel):
    id: str
    user_id: str
    member_id: Optional[str] = None
    makerspace_id: str
    balance: int
    total_earned: int
    total_spent: int
    conversion_rate: float
    is_active: bool
    auto_recharge_enabled: bool
    auto_recharge_threshold: int
    auto_recharge_amount: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_transaction_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CreditWalletUpdate(BaseModel):
    auto_recharge_enabled: Optional[bool] = None
    auto_recharge_threshold: Optional[int] = Field(None, ge=0)
    auto_recharge_amount: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None

class CreditTransactionCreate(BaseModel):
    wallet_id: str
    user_id: str
    type: str = Field(..., regex="^(earned|spent|refund|manual_adjustment)$")
    amount: int
    description: Optional[str] = None
    service_type: Optional[str] = None
    service_id: Optional[str] = None
    metadata: Dict[str, Any] = {}
    processed_by: Optional[str] = None

class CreditTransactionResponse(BaseModel):
    id: str
    wallet_id: str
    user_id: str
    type: str
    amount: int
    balance_after: int
    related_transaction_id: Optional[str] = None
    service_type: Optional[str] = None
    service_id: Optional[str] = None
    description: Optional[str] = None
    metadata: Dict[str, Any] = {}
    processed_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Refund schemas
class RefundCreate(BaseModel):
    original_transaction_id: str
    amount: float = Field(..., gt=0)
    currency: str = Field(default="INR", max_length=3)
    reason: str = Field(..., min_length=1)
    type: str = Field(default="full", regex="^(full|partial)$")
    processed_by: str

class RefundResponse(BaseModel):
    id: str
    original_transaction_id: str
    user_id: str
    makerspace_id: str
    amount: float
    currency: str
    reason: str
    type: str
    status: str
    gateway_refund_id: Optional[str] = None
    processed_by: str
    created_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Payment Method schemas
class PaymentMethodCreate(BaseModel):
    user_id: str
    member_id: Optional[str] = None
    type: str = Field(..., regex="^(card|upi|bank_account)$")
    gateway: PaymentGateway
    gateway_method_id: str
    last_four: Optional[str] = Field(None, max_length=4)
    card_brand: Optional[str] = None
    expiry_month: Optional[int] = Field(None, ge=1, le=12)
    expiry_year: Optional[int] = None
    bank_name: Optional[str] = None
    account_holder_name: Optional[str] = None
    upi_id: Optional[str] = None
    is_default: bool = False

class PaymentMethodResponse(BaseModel):
    id: str
    user_id: str
    member_id: Optional[str] = None
    type: str
    gateway: PaymentGateway
    last_four: Optional[str] = None
    card_brand: Optional[str] = None
    expiry_month: Optional[int] = None
    expiry_year: Optional[int] = None
    bank_name: Optional[str] = None
    account_holder_name: Optional[str] = None
    upi_id: Optional[str] = None
    is_default: bool
    is_active: bool
    created_at: datetime
    last_used_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Checkout schemas
class CheckoutSessionCreate(BaseModel):
    user_id: str
    member_id: Optional[str] = None
    makerspace_id: str
    amount: float = Field(..., gt=0)
    currency: str = Field(default="INR", max_length=3)
    type: TransactionType
    description: str
    service_type: Optional[str] = None
    service_id: Optional[str] = None
    service_metadata: Dict[str, Any] = {}
    payment_method_id: Optional[str] = None
    return_url: Optional[str] = None
    cancel_url: Optional[str] = None

class CheckoutSessionResponse(BaseModel):
    session_id: str
    checkout_url: str
    transaction_id: str
    expires_at: datetime

# Analytics schemas
class BillingAnalytics(BaseModel):
    total_revenue: float
    revenue_this_month: float
    revenue_last_month: float
    revenue_growth: float
    total_transactions: int
    successful_transactions: int
    failed_transactions: int
    pending_transactions: int
    average_transaction_value: float
    revenue_by_type: Dict[str, float]
    revenue_by_month: List[Dict[str, Any]]
    top_services: List[Dict[str, Any]]
    payment_method_distribution: Dict[str, int]

class TransactionFilter(BaseModel):
    user_id: Optional[str] = None
    member_id: Optional[str] = None
    makerspace_id: Optional[str] = None
    status: Optional[List[TransactionStatus]] = None
    type: Optional[List[TransactionType]] = None
    gateway: Optional[List[PaymentGateway]] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    service_type: Optional[str] = None

class TransactionSort(BaseModel):
    field: str = "created_at"
    direction: str = "desc"

    @validator('field')
    def validate_field(cls, v):
        allowed_fields = [
            'created_at', 'updated_at', 'completed_at', 'amount',
            'status', 'type', 'gateway'
        ]
        if v not in allowed_fields:
            raise ValueError(f'Sort field must be one of: {allowed_fields}')
        return v

    @validator('direction')
    def validate_direction(cls, v):
        if v.lower() not in ['asc', 'desc']:
            raise ValueError('Sort direction must be "asc" or "desc"')
        return v.lower()

# Webhook schemas
class WebhookPayload(BaseModel):
    gateway: PaymentGateway
    event_type: str
    transaction_id: Optional[str] = None
    gateway_transaction_id: Optional[str] = None
    status: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    metadata: Dict[str, Any] = {}
    signature: Optional[str] = None
    timestamp: Optional[datetime] = None

# Bulk operations
class BulkRefundRequest(BaseModel):
    transaction_ids: List[str]
    reason: str
    processed_by: str
    refund_amount: Optional[float] = None  # If not provided, full refund

class CreditAdjustment(BaseModel):
    user_id: str
    amount: int  # Can be positive or negative
    reason: str
    processed_by: str
    type: str = "manual_adjustment"

class BulkCreditAdjustment(BaseModel):
    adjustments: List[CreditAdjustment]

# Export schemas
class TransactionExport(BaseModel):
    format: str = "csv"  # csv, xlsx, pdf
    filters: Optional[TransactionFilter] = None
    include_fields: Optional[List[str]] = None
    date_range: Optional[Dict[str, datetime]] = None

# Service billing schemas
class ServiceBillingCreate(BaseModel):
    user_id: str
    member_id: Optional[str] = None
    makerspace_id: str
    service_type: str  # 3d_print, laser_cut, workshop, etc.
    service_id: str
    amount: float = Field(..., gt=0)
    currency: str = Field(default="INR", max_length=3)
    description: str
    metadata: Dict[str, Any] = {}
    auto_charge: bool = True  # Auto-charge from credits or payment method

class ServiceBillingResponse(BaseModel):
    transaction_id: str
    status: TransactionStatus
    amount_charged: float
    credits_used: int
    payment_required: bool
    checkout_url: Optional[str] = None
