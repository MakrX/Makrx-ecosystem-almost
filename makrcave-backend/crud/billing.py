from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc, asc, extract
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
import uuid
import secrets

from ..models.billing import (
    Transaction, Invoice, CreditWallet, CreditTransaction, Refund,
    PaymentMethod, BillingPlan, TransactionType, TransactionStatus,
    PaymentGateway, InvoiceStatus
)
from ..schemas.billing import (
    TransactionCreate, TransactionUpdate, TransactionFilter, TransactionSort,
    InvoiceCreate, InvoiceUpdate, CreditWalletUpdate, CreditTransactionCreate,
    RefundCreate, PaymentMethodCreate, CheckoutSessionCreate
)

# Transaction CRUD operations
def get_transaction(db: Session, transaction_id: str, user_id: str = None) -> Optional[Transaction]:
    """Get a transaction by ID"""
    query = db.query(Transaction)
    
    if user_id:
        query = query.filter(Transaction.user_id == user_id)
    
    return query.filter(Transaction.id == transaction_id).first()

def get_transactions(
    db: Session,
    user_id: str = None,
    skip: int = 0,
    limit: int = 100,
    filters: Optional[TransactionFilter] = None,
    sort: Optional[TransactionSort] = None
) -> List[Transaction]:
    """Get transactions with filtering and pagination"""
    query = db.query(Transaction)
    
    # Apply user filter
    if user_id:
        query = query.filter(Transaction.user_id == user_id)
    
    # Apply filters
    if filters:
        if filters.user_id:
            query = query.filter(Transaction.user_id == filters.user_id)
        
        if filters.member_id:
            query = query.filter(Transaction.member_id == filters.member_id)
        
        if filters.makerspace_id:
            query = query.filter(Transaction.makerspace_id == filters.makerspace_id)
        
        if filters.status:
            query = query.filter(Transaction.status.in_(filters.status))
        
        if filters.type:
            query = query.filter(Transaction.type.in_(filters.type))
        
        if filters.gateway:
            query = query.filter(Transaction.gateway.in_(filters.gateway))
        
        if filters.min_amount:
            query = query.filter(Transaction.amount >= filters.min_amount)
        
        if filters.max_amount:
            query = query.filter(Transaction.amount <= filters.max_amount)
        
        if filters.start_date:
            query = query.filter(Transaction.created_at >= filters.start_date)
        
        if filters.end_date:
            query = query.filter(Transaction.created_at <= filters.end_date)
        
        if filters.service_type:
            query = query.filter(Transaction.service_type == filters.service_type)
    
    # Apply sorting
    if sort:
        sort_column = getattr(Transaction, sort.field, Transaction.created_at)
        if sort.direction == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(Transaction.created_at))
    
    return query.offset(skip).limit(limit).all()

def create_transaction(db: Session, transaction: TransactionCreate) -> Transaction:
    """Create a new transaction"""
    db_transaction = Transaction(
        user_id=transaction.user_id,
        member_id=transaction.member_id,
        makerspace_id=transaction.makerspace_id,
        amount=transaction.amount,
        currency=transaction.currency,
        type=transaction.type,
        description=transaction.description,
        service_type=transaction.service_type,
        service_id=transaction.service_id,
        service_metadata=transaction.service_metadata,
        gateway=transaction.gateway,
        billing_period_start=transaction.billing_period_start,
        billing_period_end=transaction.billing_period_end,
        notes=transaction.notes
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def update_transaction(db: Session, transaction_id: str, update: TransactionUpdate) -> Optional[Transaction]:
    """Update a transaction"""
    db_transaction = get_transaction(db, transaction_id)
    if not db_transaction:
        return None
    
    update_data = update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_transaction, field, value)
    
    db_transaction.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def complete_transaction(
    db: Session, 
    transaction_id: str, 
    gateway_transaction_id: str,
    gateway_payment_id: str = None,
    gateway_signature: str = None
) -> Optional[Transaction]:
    """Mark transaction as completed"""
    db_transaction = get_transaction(db, transaction_id)
    if not db_transaction:
        return None
    
    db_transaction.status = TransactionStatus.SUCCESS
    db_transaction.gateway_transaction_id = gateway_transaction_id
    db_transaction.gateway_payment_id = gateway_payment_id
    db_transaction.gateway_signature = gateway_signature
    db_transaction.completed_at = datetime.utcnow()
    db_transaction.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_transaction)
    
    # Update credit wallet if credits were used/earned
    if db_transaction.credits_used > 0 or db_transaction.credits_earned > 0:
        update_credit_wallet_from_transaction(db, db_transaction)
    
    return db_transaction

def fail_transaction(db: Session, transaction_id: str, reason: str = None) -> Optional[Transaction]:
    """Mark transaction as failed"""
    db_transaction = get_transaction(db, transaction_id)
    if not db_transaction:
        return None
    
    db_transaction.status = TransactionStatus.FAILED
    if reason:
        db_transaction.notes = f"{db_transaction.notes or ''}\nFailure reason: {reason}".strip()
    db_transaction.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

# Invoice CRUD operations
def get_invoice(db: Session, invoice_id: str, user_id: str = None) -> Optional[Invoice]:
    """Get an invoice by ID"""
    query = db.query(Invoice)
    
    if user_id:
        query = query.filter(Invoice.user_id == user_id)
    
    return query.filter(Invoice.id == invoice_id).first()

def get_invoice_by_number(db: Session, invoice_number: str) -> Optional[Invoice]:
    """Get an invoice by invoice number"""
    return db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()

def get_invoices(
    db: Session,
    user_id: str = None,
    makerspace_id: str = None,
    status: Optional[InvoiceStatus] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Invoice]:
    """Get invoices with filtering"""
    query = db.query(Invoice)
    
    if user_id:
        query = query.filter(Invoice.user_id == user_id)
    
    if makerspace_id:
        query = query.filter(Invoice.makerspace_id == makerspace_id)
    
    if status:
        query = query.filter(Invoice.status == status)
    
    return query.order_by(desc(Invoice.created_at)).offset(skip).limit(limit).all()

def create_invoice(db: Session, invoice: InvoiceCreate) -> Invoice:
    """Create a new invoice"""
    # Generate unique invoice number
    invoice_number = generate_invoice_number(db, invoice.makerspace_id)
    
    db_invoice = Invoice(
        invoice_number=invoice_number,
        user_id=invoice.user_id,
        member_id=invoice.member_id,
        makerspace_id=invoice.makerspace_id,
        transaction_id=invoice.transaction_id,
        title=invoice.title,
        description=invoice.description,
        amount=invoice.amount,
        tax_amount=invoice.tax_amount,
        total_amount=invoice.total_amount,
        currency=invoice.currency,
        line_items=invoice.line_items,
        bill_to_name=invoice.bill_to_name,
        bill_to_email=invoice.bill_to_email,
        bill_to_address=invoice.bill_to_address,
        bill_to_phone=invoice.bill_to_phone,
        bill_to_tax_id=invoice.bill_to_tax_id,
        issue_date=invoice.issue_date,
        due_date=invoice.due_date
    )
    
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def update_invoice(db: Session, invoice_id: str, update: InvoiceUpdate) -> Optional[Invoice]:
    """Update an invoice"""
    db_invoice = get_invoice(db, invoice_id)
    if not db_invoice:
        return None
    
    update_data = update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_invoice, field, value)
    
    db_invoice.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def generate_invoice_number(db: Session, makerspace_id: str) -> str:
    """Generate a unique invoice number"""
    current_year = datetime.now().year
    current_month = datetime.now().month
    
    # Count invoices for this month
    count = db.query(Invoice).filter(
        and_(
            Invoice.makerspace_id == makerspace_id,
            extract('year', Invoice.created_at) == current_year,
            extract('month', Invoice.created_at) == current_month
        )
    ).count()
    
    return f"INV-{current_year}-{current_month:02d}-{(count + 1):05d}"

# Credit Wallet CRUD operations
def get_or_create_credit_wallet(db: Session, user_id: str, makerspace_id: str) -> CreditWallet:
    """Get or create a credit wallet for a user"""
    wallet = db.query(CreditWallet).filter(
        and_(CreditWallet.user_id == user_id, CreditWallet.makerspace_id == makerspace_id)
    ).first()
    
    if not wallet:
        wallet = CreditWallet(
            user_id=user_id,
            makerspace_id=makerspace_id,
            balance=0,
            total_earned=0,
            total_spent=0
        )
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    
    return wallet

def update_credit_wallet(db: Session, wallet_id: str, update: CreditWalletUpdate) -> Optional[CreditWallet]:
    """Update credit wallet settings"""
    wallet = db.query(CreditWallet).filter(CreditWallet.id == wallet_id).first()
    if not wallet:
        return None
    
    update_data = update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(wallet, field, value)
    
    wallet.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(wallet)
    return wallet

def create_credit_transaction(db: Session, credit_transaction: CreditTransactionCreate) -> CreditTransaction:
    """Create a credit transaction and update wallet balance"""
    wallet = db.query(CreditWallet).filter(CreditWallet.id == credit_transaction.wallet_id).first()
    if not wallet:
        raise ValueError("Credit wallet not found")
    
    # Calculate new balance
    new_balance = wallet.balance + credit_transaction.amount
    if new_balance < 0:
        raise ValueError("Insufficient credit balance")
    
    # Create credit transaction
    db_credit_transaction = CreditTransaction(
        wallet_id=credit_transaction.wallet_id,
        user_id=credit_transaction.user_id,
        type=credit_transaction.type,
        amount=credit_transaction.amount,
        balance_after=new_balance,
        service_type=credit_transaction.service_type,
        service_id=credit_transaction.service_id,
        description=credit_transaction.description,
        metadata=credit_transaction.metadata,
        processed_by=credit_transaction.processed_by
    )
    
    # Update wallet balance
    wallet.balance = new_balance
    if credit_transaction.amount > 0:
        wallet.total_earned += credit_transaction.amount
    else:
        wallet.total_spent += abs(credit_transaction.amount)
    
    wallet.last_transaction_at = datetime.utcnow()
    wallet.updated_at = datetime.utcnow()
    
    db.add(db_credit_transaction)
    db.commit()
    db.refresh(db_credit_transaction)
    
    return db_credit_transaction

def update_credit_wallet_from_transaction(db: Session, transaction: Transaction):
    """Update credit wallet based on transaction"""
    if not transaction.user_id:
        return
    
    wallet = get_or_create_credit_wallet(db, transaction.user_id, transaction.makerspace_id)
    
    # Handle credits used
    if transaction.credits_used > 0:
        credit_transaction = CreditTransactionCreate(
            wallet_id=wallet.id,
            user_id=transaction.user_id,
            type="spent",
            amount=-transaction.credits_used,
            description=f"Credits used for {transaction.description}",
            service_type=transaction.service_type,
            service_id=transaction.service_id,
            related_transaction_id=transaction.id
        )
        create_credit_transaction(db, credit_transaction)
    
    # Handle credits earned
    if transaction.credits_earned > 0:
        credit_transaction = CreditTransactionCreate(
            wallet_id=wallet.id,
            user_id=transaction.user_id,
            type="earned",
            amount=transaction.credits_earned,
            description=f"Credits earned from {transaction.description}",
            service_type=transaction.service_type,
            service_id=transaction.service_id,
            related_transaction_id=transaction.id
        )
        create_credit_transaction(db, credit_transaction)

def get_credit_transactions(
    db: Session,
    wallet_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[CreditTransaction]:
    """Get credit transactions for a wallet"""
    return db.query(CreditTransaction).filter(
        CreditTransaction.wallet_id == wallet_id
    ).order_by(desc(CreditTransaction.created_at)).offset(skip).limit(limit).all()

# Refund operations
def create_refund(db: Session, refund: RefundCreate) -> Refund:
    """Create a refund"""
    original_transaction = get_transaction(db, refund.original_transaction_id)
    if not original_transaction:
        raise ValueError("Original transaction not found")
    
    if original_transaction.status != TransactionStatus.SUCCESS:
        raise ValueError("Can only refund successful transactions")
    
    db_refund = Refund(
        original_transaction_id=refund.original_transaction_id,
        user_id=original_transaction.user_id,
        makerspace_id=original_transaction.makerspace_id,
        amount=refund.amount,
        currency=refund.currency,
        reason=refund.reason,
        type=refund.type,
        processed_by=refund.processed_by
    )
    
    db.add(db_refund)
    
    # Update original transaction status
    if refund.type == "full" or refund.amount >= original_transaction.amount:
        original_transaction.status = TransactionStatus.REFUNDED
    else:
        original_transaction.status = TransactionStatus.PARTIALLY_REFUNDED
    
    original_transaction.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_refund)
    return db_refund

def process_refund(db: Session, refund_id: str, gateway_refund_id: str = None) -> Optional[Refund]:
    """Mark refund as processed"""
    refund = db.query(Refund).filter(Refund.id == refund_id).first()
    if not refund:
        return None
    
    refund.status = "processed"
    refund.gateway_refund_id = gateway_refund_id
    refund.processed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(refund)
    return refund

# Payment Method operations
def get_payment_methods(db: Session, user_id: str) -> List[PaymentMethod]:
    """Get payment methods for a user"""
    return db.query(PaymentMethod).filter(
        and_(PaymentMethod.user_id == user_id, PaymentMethod.is_active == True)
    ).order_by(desc(PaymentMethod.is_default), desc(PaymentMethod.last_used_at)).all()

def create_payment_method(db: Session, payment_method: PaymentMethodCreate) -> PaymentMethod:
    """Create a new payment method"""
    # If this is set as default, unset other default methods
    if payment_method.is_default:
        db.query(PaymentMethod).filter(
            and_(PaymentMethod.user_id == payment_method.user_id, PaymentMethod.is_default == True)
        ).update({"is_default": False})
    
    db_payment_method = PaymentMethod(**payment_method.dict())
    db.add(db_payment_method)
    db.commit()
    db.refresh(db_payment_method)
    return db_payment_method

def set_default_payment_method(db: Session, user_id: str, payment_method_id: str) -> bool:
    """Set a payment method as default"""
    # Unset all default methods for user
    db.query(PaymentMethod).filter(
        and_(PaymentMethod.user_id == user_id, PaymentMethod.is_default == True)
    ).update({"is_default": False})
    
    # Set new default
    result = db.query(PaymentMethod).filter(
        and_(PaymentMethod.id == payment_method_id, PaymentMethod.user_id == user_id)
    ).update({"is_default": True, "updated_at": datetime.utcnow()})
    
    db.commit()
    return result > 0

def delete_payment_method(db: Session, user_id: str, payment_method_id: str) -> bool:
    """Delete (deactivate) a payment method"""
    result = db.query(PaymentMethod).filter(
        and_(PaymentMethod.id == payment_method_id, PaymentMethod.user_id == user_id)
    ).update({"is_active": False, "updated_at": datetime.utcnow()})
    
    db.commit()
    return result > 0

# Analytics and reporting
def get_billing_analytics(db: Session, makerspace_id: str, start_date: datetime = None, end_date: datetime = None) -> Dict[str, Any]:
    """Get billing analytics for a makerspace"""
    if not start_date:
        start_date = datetime.now() - timedelta(days=365)
    if not end_date:
        end_date = datetime.now()
    
    # Base query for successful transactions
    base_query = db.query(Transaction).filter(
        and_(
            Transaction.makerspace_id == makerspace_id,
            Transaction.status == TransactionStatus.SUCCESS,
            Transaction.created_at >= start_date,
            Transaction.created_at <= end_date
        )
    )
    
    # Total revenue
    total_revenue = base_query.with_entities(func.sum(Transaction.amount)).scalar() or 0
    
    # Current month revenue
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    revenue_this_month = base_query.filter(
        Transaction.created_at >= current_month_start
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0
    
    # Last month revenue
    last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
    last_month_end = current_month_start - timedelta(microseconds=1)
    revenue_last_month = base_query.filter(
        and_(
            Transaction.created_at >= last_month_start,
            Transaction.created_at <= last_month_end
        )
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0
    
    # Revenue growth
    revenue_growth = ((revenue_this_month - revenue_last_month) / revenue_last_month * 100) if revenue_last_month > 0 else 0
    
    # Transaction counts
    total_transactions = db.query(Transaction).filter(
        and_(
            Transaction.makerspace_id == makerspace_id,
            Transaction.created_at >= start_date,
            Transaction.created_at <= end_date
        )
    ).count()
    
    successful_transactions = base_query.count()
    
    failed_transactions = db.query(Transaction).filter(
        and_(
            Transaction.makerspace_id == makerspace_id,
            Transaction.status == TransactionStatus.FAILED,
            Transaction.created_at >= start_date,
            Transaction.created_at <= end_date
        )
    ).count()
    
    pending_transactions = db.query(Transaction).filter(
        and_(
            Transaction.makerspace_id == makerspace_id,
            Transaction.status == TransactionStatus.PENDING,
            Transaction.created_at >= start_date,
            Transaction.created_at <= end_date
        )
    ).count()
    
    # Average transaction value
    average_transaction_value = total_revenue / successful_transactions if successful_transactions > 0 else 0
    
    # Revenue by type
    revenue_by_type = {}
    type_revenue = base_query.with_entities(
        Transaction.type, func.sum(Transaction.amount)
    ).group_by(Transaction.type).all()
    
    for tx_type, revenue in type_revenue:
        revenue_by_type[tx_type.value] = float(revenue)
    
    # Revenue by month (last 12 months)
    revenue_by_month = []
    for i in range(12):
        month_start = (datetime.now().replace(day=1) - timedelta(days=30*i)).replace(hour=0, minute=0, second=0, microsecond=0)
        month_end = (month_start + timedelta(days=31)).replace(day=1) - timedelta(microseconds=1)
        
        month_revenue = base_query.filter(
            and_(
                Transaction.created_at >= month_start,
                Transaction.created_at <= month_end
            )
        ).with_entities(func.sum(Transaction.amount)).scalar() or 0
        
        revenue_by_month.append({
            "month": month_start.strftime("%Y-%m"),
            "revenue": float(month_revenue)
        })
    
    revenue_by_month.reverse()
    
    # Top services by revenue
    top_services = base_query.filter(
        Transaction.service_type.isnot(None)
    ).with_entities(
        Transaction.service_type, func.sum(Transaction.amount), func.count(Transaction.id)
    ).group_by(Transaction.service_type).order_by(desc(func.sum(Transaction.amount))).limit(10).all()
    
    top_services_data = [
        {
            "service": service,
            "revenue": float(revenue),
            "transactions": count
        }
        for service, revenue, count in top_services
    ]
    
    # Payment method distribution
    payment_method_distribution = {}
    gateway_counts = base_query.with_entities(
        Transaction.gateway, func.count(Transaction.id)
    ).group_by(Transaction.gateway).all()
    
    for gateway, count in gateway_counts:
        if gateway:
            payment_method_distribution[gateway.value] = count
    
    return {
        "total_revenue": float(total_revenue),
        "revenue_this_month": float(revenue_this_month),
        "revenue_last_month": float(revenue_last_month),
        "revenue_growth": float(revenue_growth),
        "total_transactions": total_transactions,
        "successful_transactions": successful_transactions,
        "failed_transactions": failed_transactions,
        "pending_transactions": pending_transactions,
        "average_transaction_value": float(average_transaction_value),
        "revenue_by_type": revenue_by_type,
        "revenue_by_month": revenue_by_month,
        "top_services": top_services_data,
        "payment_method_distribution": payment_method_distribution
    }

# Helper functions
def can_use_credits(db: Session, user_id: str, makerspace_id: str, amount: int) -> bool:
    """Check if user has enough credits"""
    wallet = get_or_create_credit_wallet(db, user_id, makerspace_id)
    return wallet.balance >= amount

def charge_credits(db: Session, user_id: str, makerspace_id: str, amount: int, description: str, service_type: str = None, service_id: str = None) -> bool:
    """Charge credits from user wallet"""
    wallet = get_or_create_credit_wallet(db, user_id, makerspace_id)
    
    if wallet.balance < amount:
        return False
    
    credit_transaction = CreditTransactionCreate(
        wallet_id=wallet.id,
        user_id=user_id,
        type="spent",
        amount=-amount,
        description=description,
        service_type=service_type,
        service_id=service_id
    )
    
    create_credit_transaction(db, credit_transaction)
    return True

def add_credits(db: Session, user_id: str, makerspace_id: str, amount: int, description: str, processed_by: str = None) -> CreditTransaction:
    """Add credits to user wallet"""
    wallet = get_or_create_credit_wallet(db, user_id, makerspace_id)
    
    credit_transaction = CreditTransactionCreate(
        wallet_id=wallet.id,
        user_id=user_id,
        type="earned" if not processed_by else "manual_adjustment",
        amount=amount,
        description=description,
        processed_by=processed_by
    )
    
    return create_credit_transaction(db, credit_transaction)
