from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks, Request
from fastapi.security import HTTPBearer
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import os
import io
from datetime import datetime, timedelta

from ..database import get_db
from ..dependencies import get_current_user
from ..schemas.billing import (
    TransactionCreate, TransactionUpdate, TransactionResponse,
    InvoiceCreate, InvoiceUpdate, InvoiceResponse,
    CreditWalletResponse, CreditWalletUpdate, CreditTransactionResponse,
    RefundCreate, RefundResponse,
    PaymentMethodCreate, PaymentMethodResponse,
    CheckoutSessionCreate, CheckoutSessionResponse,
    BillingAnalytics, TransactionFilter, TransactionSort,
    ServiceBillingCreate, ServiceBillingResponse,
    WebhookPayload, BulkRefundRequest, CreditAdjustment
)
from ..crud import billing as crud_billing
from ..utils.payment_service import payment_service, calculate_service_charge
from ..utils.invoice_generator import generate_invoice_pdf, save_invoice_to_file, generate_invoice_filename
from ..utils.email_service import send_invoice_email

router = APIRouter()
security = HTTPBearer()

# Transaction routes
@router.post("/transactions/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction: TransactionCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new transaction"""
    # Check permissions
    if not _can_create_transactions(current_user, transaction.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create transactions"
        )
    
    try:
        db_transaction = crud_billing.create_transaction(db, transaction)
        return db_transaction
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create transaction: {str(e)}"
        )

@router.get("/transactions/", response_model=List[TransactionResponse])
async def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[List[str]] = Query(None),
    type_filter: Optional[List[str]] = Query(None),
    gateway_filter: Optional[List[str]] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    user_id: Optional[str] = Query(None),
    sort_field: str = Query("created_at"),
    sort_direction: str = Query("desc"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get transactions with filtering"""
    # Build filters
    filters = TransactionFilter(
        user_id=user_id if _can_view_all_transactions(current_user) else current_user["user_id"],
        makerspace_id=_get_user_makerspace_id(current_user),
        status=status_filter,
        type=type_filter,
        gateway=gateway_filter,
        start_date=start_date,
        end_date=end_date
    )
    
    sort = TransactionSort(field=sort_field, direction=sort_direction)
    
    transactions = crud_billing.get_transactions(db, current_user["user_id"], skip, limit, filters, sort)
    return transactions

@router.get("/transactions/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get transaction by ID"""
    transaction = crud_billing.get_transaction(db, transaction_id, current_user["user_id"])
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    return transaction

@router.put("/transactions/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: str,
    transaction_update: TransactionUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update transaction (admin only)"""
    if not _can_manage_billing(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update transactions"
        )
    
    transaction = crud_billing.update_transaction(db, transaction_id, transaction_update)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    return transaction

# Checkout and payment routes
@router.post("/checkout/", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    checkout_request: CheckoutSessionCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create checkout session for payment"""
    # Check permissions
    if not _can_create_transactions(current_user, checkout_request.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    try:
        # Calculate total amount with charges
        total_amount, fees, tax = calculate_service_charge(
            checkout_request.amount,
            checkout_request.type.value,
            "razorpay"  # Default gateway
        )
        
        # Create transaction record
        transaction_data = TransactionCreate(
            user_id=checkout_request.user_id,
            member_id=checkout_request.member_id,
            makerspace_id=checkout_request.makerspace_id,
            amount=checkout_request.amount,
            currency=checkout_request.currency,
            type=checkout_request.type,
            description=checkout_request.description,
            service_type=checkout_request.service_type,
            service_id=checkout_request.service_id,
            service_metadata=checkout_request.service_metadata,
            gateway="razorpay"
        )
        
        db_transaction = crud_billing.create_transaction(db, transaction_data)
        
        # Create payment gateway session
        gateway_order_id, checkout_data = payment_service.create_checkout_session(
            gateway="razorpay",
            amount=total_amount,
            currency=checkout_request.currency,
            transaction_id=db_transaction.id,
            user_id=checkout_request.user_id,
            metadata=checkout_request.service_metadata
        )
        
        # Update transaction with gateway order ID
        crud_billing.update_transaction(
            db, 
            db_transaction.id, 
            TransactionUpdate(gateway_order_id=gateway_order_id)
        )
        
        return CheckoutSessionResponse(
            session_id=gateway_order_id,
            checkout_url=f"/billing/checkout/{gateway_order_id}",
            transaction_id=db_transaction.id,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create checkout session: {str(e)}"
        )

@router.post("/payment/verify")
async def verify_payment(
    payment_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None
):
    """Verify payment and complete transaction"""
    try:
        # Get transaction by gateway order ID
        transaction = db.query(crud_billing.Transaction).filter(
            crud_billing.Transaction.gateway_order_id == payment_data.get("razorpay_order_id")
        ).first()
        
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        # Verify payment
        is_valid, payment_details = payment_service.verify_payment("razorpay", payment_data)
        
        if is_valid:
            # Complete transaction
            completed_transaction = crud_billing.complete_transaction(
                db,
                transaction.id,
                payment_details["gateway_transaction_id"],
                payment_details.get("gateway_order_id"),
                payment_data.get("razorpay_signature")
            )
            
            # Generate invoice in background
            if background_tasks:
                background_tasks.add_task(
                    generate_and_send_invoice,
                    db,
                    completed_transaction.id
                )
            
            return {"status": "success", "transaction_id": completed_transaction.id}
        else:
            # Mark transaction as failed
            crud_billing.fail_transaction(db, transaction.id, "Payment verification failed")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment verification failed"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment verification failed: {str(e)}"
        )

# Credit wallet routes
@router.get("/wallet/", response_model=CreditWalletResponse)
async def get_credit_wallet(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's credit wallet"""
    makerspace_id = _get_user_makerspace_id(current_user)
    wallet = crud_billing.get_or_create_credit_wallet(db, current_user["user_id"], makerspace_id)
    return wallet

@router.put("/wallet/", response_model=CreditWalletResponse)
async def update_credit_wallet(
    wallet_update: CreditWalletUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update credit wallet settings"""
    makerspace_id = _get_user_makerspace_id(current_user)
    wallet = crud_billing.get_or_create_credit_wallet(db, current_user["user_id"], makerspace_id)
    
    updated_wallet = crud_billing.update_credit_wallet(db, wallet.id, wallet_update)
    if not updated_wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )
    return updated_wallet

@router.get("/wallet/transactions/", response_model=List[CreditTransactionResponse])
async def get_credit_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get credit transaction history"""
    makerspace_id = _get_user_makerspace_id(current_user)
    wallet = crud_billing.get_or_create_credit_wallet(db, current_user["user_id"], makerspace_id)
    
    transactions = crud_billing.get_credit_transactions(db, wallet.id, skip, limit)
    return transactions

@router.post("/credits/purchase/")
async def purchase_credits(
    amount: float = Query(..., gt=0),
    credits: int = Query(..., gt=0),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Purchase credits"""
    makerspace_id = _get_user_makerspace_id(current_user)
    
    # Create transaction for credit purchase
    transaction_data = TransactionCreate(
        user_id=current_user["user_id"],
        makerspace_id=makerspace_id,
        amount=amount,
        type="credit_purchase",
        description=f"Purchase of {credits} credits",
        credits_earned=credits
    )
    
    # Create checkout session
    checkout_data = CheckoutSessionCreate(
        user_id=current_user["user_id"],
        makerspace_id=makerspace_id,
        amount=amount,
        type="credit_purchase",
        description=f"Purchase of {credits} credits",
        service_metadata={"credits": credits}
    )
    
    return await create_checkout_session(checkout_data, current_user, db)

@router.post("/credits/adjust/")
async def adjust_credits(
    adjustment: CreditAdjustment,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually adjust user credits (admin only)"""
    if not _can_manage_billing(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    try:
        makerspace_id = _get_user_makerspace_id(current_user)
        credit_transaction = crud_billing.add_credits(
            db,
            adjustment.user_id,
            makerspace_id,
            adjustment.amount,
            adjustment.reason,
            current_user["user_id"]
        )
        return credit_transaction
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# Invoice routes
@router.get("/invoices/", response_model=List[InvoiceResponse])
async def get_invoices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    status_filter: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's invoices"""
    user_id = current_user["user_id"] if not _can_view_all_invoices(current_user) else None
    makerspace_id = _get_user_makerspace_id(current_user)
    
    invoices = crud_billing.get_invoices(db, user_id, makerspace_id, status_filter, skip, limit)
    return invoices

@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get invoice by ID"""
    user_id = current_user["user_id"] if not _can_view_all_invoices(current_user) else None
    invoice = crud_billing.get_invoice(db, invoice_id, user_id)
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    return invoice

@router.get("/invoices/{invoice_id}/download")
async def download_invoice(
    invoice_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download invoice PDF"""
    user_id = current_user["user_id"] if not _can_view_all_invoices(current_user) else None
    invoice = crud_billing.get_invoice(db, invoice_id, user_id)
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Check if PDF file exists
    if invoice.file_path and os.path.exists(invoice.file_path):
        return FileResponse(
            invoice.file_path,
            media_type="application/pdf",
            filename=f"invoice_{invoice.invoice_number}.pdf"
        )
    else:
        # Generate PDF on the fly
        invoice_data = {
            "invoice_number": invoice.invoice_number,
            "issue_date": invoice.issue_date,
            "due_date": invoice.due_date,
            "paid_date": invoice.paid_date,
            "status": invoice.status,
            "title": invoice.title,
            "description": invoice.description,
            "amount": invoice.amount,
            "tax_amount": invoice.tax_amount,
            "total_amount": invoice.total_amount,
            "currency": invoice.currency,
            "line_items": invoice.line_items,
            "bill_to_name": invoice.bill_to_name,
            "bill_to_email": invoice.bill_to_email,
            "bill_to_address": invoice.bill_to_address,
            "bill_to_phone": invoice.bill_to_phone,
            "bill_to_tax_id": invoice.bill_to_tax_id
        }
        
        pdf_bytes = generate_invoice_pdf(invoice_data)
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=invoice_{invoice.invoice_number}.pdf"}
        )

# Service billing routes
@router.post("/service/charge/", response_model=ServiceBillingResponse)
async def charge_for_service(
    service_billing: ServiceBillingCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Charge user for a service"""
    try:
        # Check if user has enough credits
        if service_billing.auto_charge:
            # Convert amount to credits (1 INR = 1 credit for simplicity)
            credits_needed = int(service_billing.amount)
            
            if crud_billing.can_use_credits(db, service_billing.user_id, service_billing.makerspace_id, credits_needed):
                # Charge credits
                success = crud_billing.charge_credits(
                    db,
                    service_billing.user_id,
                    service_billing.makerspace_id,
                    credits_needed,
                    service_billing.description,
                    service_billing.service_type,
                    service_billing.service_id
                )
                
                if success:
                    # Create successful transaction record
                    transaction_data = TransactionCreate(
                        user_id=service_billing.user_id,
                        member_id=service_billing.member_id,
                        makerspace_id=service_billing.makerspace_id,
                        amount=service_billing.amount,
                        currency=service_billing.currency,
                        type="service",
                        description=service_billing.description,
                        service_type=service_billing.service_type,
                        service_id=service_billing.service_id,
                        service_metadata=service_billing.metadata,
                        gateway="credit",
                        credits_used=credits_needed
                    )
                    
                    db_transaction = crud_billing.create_transaction(db, transaction_data)
                    
                    # Mark as completed
                    crud_billing.complete_transaction(
                        db,
                        db_transaction.id,
                        f"credit_{db_transaction.id}",
                        None,
                        None
                    )
                    
                    return ServiceBillingResponse(
                        transaction_id=db_transaction.id,
                        status="success",
                        amount_charged=service_billing.amount,
                        credits_used=credits_needed,
                        payment_required=False
                    )
        
        # Create transaction for payment
        transaction_data = TransactionCreate(
            user_id=service_billing.user_id,
            member_id=service_billing.member_id,
            makerspace_id=service_billing.makerspace_id,
            amount=service_billing.amount,
            currency=service_billing.currency,
            type="service",
            description=service_billing.description,
            service_type=service_billing.service_type,
            service_id=service_billing.service_id,
            service_metadata=service_billing.metadata
        )
        
        db_transaction = crud_billing.create_transaction(db, transaction_data)
        
        # Create checkout session
        gateway_order_id, checkout_data = payment_service.create_checkout_session(
            gateway="razorpay",
            amount=service_billing.amount,
            currency=service_billing.currency,
            transaction_id=db_transaction.id,
            user_id=service_billing.user_id,
            metadata=service_billing.metadata
        )
        
        return ServiceBillingResponse(
            transaction_id=db_transaction.id,
            status="pending",
            amount_charged=0,
            credits_used=0,
            payment_required=True,
            checkout_url=f"/billing/checkout/{gateway_order_id}"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Service billing failed: {str(e)}"
        )

# Refund routes
@router.post("/refunds/", response_model=RefundResponse)
async def create_refund(
    refund: RefundCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a refund"""
    if not _can_manage_billing(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    try:
        refund.processed_by = current_user["user_id"]
        db_refund = crud_billing.create_refund(db, refund)
        
        # Process refund with payment gateway
        original_transaction = crud_billing.get_transaction(db, refund.original_transaction_id)
        if original_transaction and original_transaction.gateway_transaction_id:
            try:
                gateway_refund = payment_service.create_refund(
                    original_transaction.gateway.value,
                    original_transaction.gateway_transaction_id,
                    refund.amount,
                    refund.reason
                )
                
                crud_billing.process_refund(db, db_refund.id, gateway_refund.get("id"))
            except Exception as e:
                logger.warning(f"Gateway refund failed: {str(e)}")
        
        return db_refund
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# Analytics routes
@router.get("/analytics/", response_model=BillingAnalytics)
async def get_billing_analytics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get billing analytics"""
    if not _can_view_analytics(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    makerspace_id = _get_user_makerspace_id(current_user)
    analytics = crud_billing.get_billing_analytics(db, makerspace_id, start_date, end_date)
    
    return BillingAnalytics(**analytics)

# Webhook routes
@router.post("/webhooks/razorpay")
async def razorpay_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Razorpay webhooks"""
    try:
        payload = await request.body()
        signature = request.headers.get("X-Razorpay-Signature", "")
        
        # Verify webhook signature
        if not payment_service.verify_webhook("razorpay", payload.decode(), signature):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature"
            )
        
        # Process webhook
        webhook_data = await request.json()
        event_type = webhook_data.get("event")
        
        if event_type == "payment.captured":
            # Handle successful payment
            payment_data = webhook_data.get("payload", {}).get("payment", {}).get("entity", {})
            order_id = payment_data.get("order_id")
            
            if order_id:
                transaction = db.query(crud_billing.Transaction).filter(
                    crud_billing.Transaction.gateway_order_id == order_id
                ).first()
                
                if transaction:
                    crud_billing.complete_transaction(
                        db,
                        transaction.id,
                        payment_data.get("id"),
                        order_id
                    )
        
        elif event_type == "payment.failed":
            # Handle failed payment
            payment_data = webhook_data.get("payload", {}).get("payment", {}).get("entity", {})
            order_id = payment_data.get("order_id")
            
            if order_id:
                transaction = db.query(crud_billing.Transaction).filter(
                    crud_billing.Transaction.gateway_order_id == order_id
                ).first()
                
                if transaction:
                    crud_billing.fail_transaction(
                        db,
                        transaction.id,
                        payment_data.get("error_description", "Payment failed")
                    )
        
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing failed: {str(e)}"
        )

# Helper functions
def _can_create_transactions(user: dict, target_user_id: str = None) -> bool:
    """Check if user can create transactions"""
    if user.get("role") in ["super_admin", "makerspace_admin"]:
        return True
    return user.get("user_id") == target_user_id

def _can_view_all_transactions(user: dict) -> bool:
    """Check if user can view all transactions"""
    return user.get("role") in ["super_admin", "makerspace_admin"]

def _can_view_all_invoices(user: dict) -> bool:
    """Check if user can view all invoices"""
    return user.get("role") in ["super_admin", "makerspace_admin"]

def _can_manage_billing(user: dict) -> bool:
    """Check if user can manage billing"""
    return user.get("role") in ["super_admin", "makerspace_admin"]

def _can_view_analytics(user: dict) -> bool:
    """Check if user can view analytics"""
    return user.get("role") in ["super_admin", "makerspace_admin"]

def _get_user_makerspace_id(user: dict) -> str:
    """Get user's makerspace ID"""
    return user.get("makerspace_id", "default_makerspace")

# Background tasks
async def generate_and_send_invoice(db: Session, transaction_id: str):
    """Generate invoice and send email"""
    try:
        transaction = crud_billing.get_transaction(db, transaction_id)
        if not transaction:
            return
        
        # Create invoice
        invoice_data = InvoiceCreate(
            user_id=transaction.user_id,
            member_id=transaction.member_id,
            makerspace_id=transaction.makerspace_id,
            transaction_id=transaction.id,
            title=f"Payment for {transaction.description}",
            description=transaction.description,
            amount=transaction.amount,
            total_amount=transaction.amount,
            bill_to_name="Customer",  # This should come from user profile
            bill_to_email="customer@example.com",  # This should come from user profile
            issue_date=datetime.utcnow()
        )
        
        invoice = crud_billing.create_invoice(db, invoice_data)
        
        # Generate PDF
        invoice_dict = {
            "invoice_number": invoice.invoice_number,
            "issue_date": invoice.issue_date,
            "title": invoice.title,
            "description": invoice.description,
            "amount": invoice.amount,
            "total_amount": invoice.total_amount,
            "currency": invoice.currency,
            "bill_to_name": invoice.bill_to_name,
            "bill_to_email": invoice.bill_to_email
        }
        
        file_path = generate_invoice_filename(invoice.invoice_number, invoice.makerspace_id)
        save_invoice_to_file(invoice_dict, file_path)
        
        # Update invoice with file path
        crud_billing.update_invoice(
            db,
            invoice.id,
            InvoiceUpdate(file_path=file_path, status="sent")
        )
        
    except Exception as e:
        logger.error(f"Invoice generation failed: {str(e)}")
