"""Comprehensive payment processing service for MakrX Store"""
import os
import uuid
import hmac
import hashlib
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from enum import Enum
from pydantic import BaseModel, Field
import stripe
import razorpay
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

# Payment models
class PaymentMethod(str, Enum):
    STRIPE = "stripe"
    RAZORPAY = "razorpay"
    UPI = "upi"
    NETBANKING = "netbanking"
    WALLET = "wallet"
    COD = "cod"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"

class Currency(str, Enum):
    INR = "INR"
    USD = "USD"

class PaymentRequest(BaseModel):
    amount: float = Field(..., description="Payment amount")
    currency: Currency = Field(Currency.INR, description="Payment currency")
    payment_method: PaymentMethod = Field(..., description="Payment method")
    order_id: Optional[str] = Field(None, description="Associated order ID")
    customer_email: str = Field(..., description="Customer email")
    customer_phone: Optional[str] = Field(None, description="Customer phone")
    billing_address: Dict[str, Any] = Field(..., description="Billing address")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

class PaymentResponse(BaseModel):
    payment_id: str
    status: PaymentStatus
    client_secret: Optional[str] = None
    redirect_url: Optional[str] = None
    qr_code: Optional[str] = None
    expires_at: Optional[datetime] = None
    gateway_response: Dict[str, Any] = Field(default_factory=dict)

class RefundRequest(BaseModel):
    payment_id: str
    amount: Optional[float] = Field(None, description="Partial refund amount")
    reason: str = Field(..., description="Refund reason")

class RefundResponse(BaseModel):
    refund_id: str
    status: str
    amount: float
    currency: str
    created_at: datetime

class PaymentService:
    """Unified payment processing service"""
    
    def __init__(self):
        # Initialize payment gateways
        self.stripe_client = self._init_stripe()
        self.razorpay_client = self._init_razorpay()
        
        # Configuration
        self.webhook_endpoints = {
            PaymentMethod.STRIPE: "/webhooks/stripe",
            PaymentMethod.RAZORPAY: "/webhooks/razorpay"
        }
        
        # Fee configuration (in percentage)
        self.gateway_fees = {
            PaymentMethod.STRIPE: 2.9,  # 2.9% + 30¢
            PaymentMethod.RAZORPAY: 2.0,  # 2% for Indian cards
            PaymentMethod.UPI: 0.0,  # No fee for UPI
            PaymentMethod.NETBANKING: 1.5,
            PaymentMethod.WALLET: 1.0,
            PaymentMethod.COD: 0.0
        }
    
    def _init_stripe(self):
        """Initialize Stripe client"""
        try:
            stripe_key = os.getenv("STRIPE_SECRET_KEY")
            if stripe_key and not stripe_key.startswith("sk_test_"):
                # Production key validation
                stripe.api_key = stripe_key
                return stripe
            elif stripe_key:
                # Test environment
                stripe.api_key = stripe_key
                return stripe
            else:
                logger.warning("Stripe not configured - missing STRIPE_SECRET_KEY")
                return None
        except Exception as e:
            logger.error(f"Failed to initialize Stripe: {e}")
            return None
    
    def _init_razorpay(self):
        """Initialize Razorpay client"""
        try:
            key_id = os.getenv("RAZORPAY_KEY_ID")
            key_secret = os.getenv("RAZORPAY_KEY_SECRET")
            
            if key_id and key_secret:
                return razorpay.Client(auth=(key_id, key_secret))
            else:
                logger.warning("Razorpay not configured - missing credentials")
                return None
        except Exception as e:
            logger.error(f"Failed to initialize Razorpay: {e}")
            return None
    
    async def create_payment_intent(self, request: PaymentRequest) -> PaymentResponse:
        """Create payment intent based on method"""
        try:
            payment_id = f"pay_{uuid.uuid4().hex[:16]}"
            
            # Route to appropriate gateway
            if request.payment_method == PaymentMethod.STRIPE:
                return await self._create_stripe_payment(payment_id, request)
            elif request.payment_method == PaymentMethod.RAZORPAY:
                return await self._create_razorpay_payment(payment_id, request)
            elif request.payment_method == PaymentMethod.UPI:
                return await self._create_upi_payment(payment_id, request)
            elif request.payment_method == PaymentMethod.COD:
                return await self._create_cod_payment(payment_id, request)
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Payment method {request.payment_method} not supported"
                )
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Payment creation failed: {e}")
            raise HTTPException(status_code=500, detail=f"Payment creation failed: {str(e)}")
    
    async def _create_stripe_payment(self, payment_id: str, request: PaymentRequest) -> PaymentResponse:
        """Create Stripe payment intent"""
        if not self.stripe_client:
            raise HTTPException(status_code=503, detail="Stripe not configured")
        
        try:
            # Convert amount to cents for Stripe
            amount_cents = int(request.amount * 100)
            
            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=request.currency.lower(),
                automatic_payment_methods={"enabled": True},
                customer_email=request.customer_email,
                metadata={
                    "makrx_payment_id": payment_id,
                    "order_id": request.order_id,
                    **request.metadata
                },
                receipt_email=request.customer_email
            )
            
            return PaymentResponse(
                payment_id=payment_id,
                status=PaymentStatus.PENDING,
                client_secret=intent.client_secret,
                expires_at=datetime.now() + timedelta(hours=1),
                gateway_response={
                    "stripe_payment_intent_id": intent.id,
                    "status": intent.status
                }
            )
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {e}")
            raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    
    async def _create_razorpay_payment(self, payment_id: str, request: PaymentRequest) -> PaymentResponse:
        """Create Razorpay order"""
        if not self.razorpay_client:
            raise HTTPException(status_code=503, detail="Razorpay not configured")
        
        try:
            # Convert amount to paise for Razorpay
            amount_paise = int(request.amount * 100)
            
            # Create order
            order_data = {
                "amount": amount_paise,
                "currency": request.currency,
                "receipt": payment_id,
                "notes": {
                    "makrx_payment_id": payment_id,
                    "order_id": request.order_id,
                    "customer_email": request.customer_email,
                    **request.metadata
                }
            }
            
            order = self.razorpay_client.order.create(data=order_data)
            
            return PaymentResponse(
                payment_id=payment_id,
                status=PaymentStatus.PENDING,
                expires_at=datetime.now() + timedelta(hours=1),
                gateway_response={
                    "razorpay_order_id": order["id"],
                    "key_id": os.getenv("RAZORPAY_KEY_ID"),
                    "amount": amount_paise,
                    "currency": request.currency,
                    "name": "MakrX Store",
                    "description": f"Payment for order {request.order_id}",
                    "prefill": {
                        "email": request.customer_email,
                        "contact": request.customer_phone
                    }
                }
            )
            
        except Exception as e:
            logger.error(f"Razorpay error: {e}")
            raise HTTPException(status_code=400, detail=f"Razorpay error: {str(e)}")
    
    async def _create_upi_payment(self, payment_id: str, request: PaymentRequest) -> PaymentResponse:
        """Create UPI payment (using Razorpay UPI)"""
        if not self.razorpay_client:
            # Fallback to manual UPI
            return await self._create_manual_upi_payment(payment_id, request)
        
        try:
            # Use Razorpay for UPI payments
            amount_paise = int(request.amount * 100)
            
            order_data = {
                "amount": amount_paise,
                "currency": request.currency,
                "receipt": payment_id,
                "method": "upi",
                "notes": {
                    "makrx_payment_id": payment_id,
                    "order_id": request.order_id,
                    **request.metadata
                }
            }
            
            order = self.razorpay_client.order.create(data=order_data)
            
            return PaymentResponse(
                payment_id=payment_id,
                status=PaymentStatus.PENDING,
                gateway_response={
                    "razorpay_order_id": order["id"],
                    "payment_method": "upi",
                    "amount": amount_paise
                },
                expires_at=datetime.now() + timedelta(minutes=15)  # UPI expires faster
            )
            
        except Exception as e:
            logger.error(f"UPI payment error: {e}")
            return await self._create_manual_upi_payment(payment_id, request)
    
    async def _create_manual_upi_payment(self, payment_id: str, request: PaymentRequest) -> PaymentResponse:
        """Create manual UPI payment with QR code"""
        try:
            # Generate UPI payment link
            upi_id = os.getenv("UPI_ID", "makrx@paytm")  # Your UPI ID
            merchant_name = "MakrX Store"
            
            # Create UPI URL
            upi_url = (
                f"upi://pay?"
                f"pa={upi_id}&"
                f"pn={merchant_name}&"
                f"am={request.amount}&"
                f"cu={request.currency}&"
                f"tn=Payment for Order {request.order_id}&"
                f"tr={payment_id}"
            )
            
            return PaymentResponse(
                payment_id=payment_id,
                status=PaymentStatus.PENDING,
                redirect_url=upi_url,
                qr_code=upi_url,  # QR code data
                expires_at=datetime.now() + timedelta(minutes=15),
                gateway_response={
                    "upi_url": upi_url,
                    "upi_id": upi_id,
                    "amount": request.amount,
                    "currency": request.currency
                }
            )
            
        except Exception as e:
            logger.error(f"Manual UPI creation failed: {e}")
            raise HTTPException(status_code=500, detail="UPI payment creation failed")
    
    async def _create_cod_payment(self, payment_id: str, request: PaymentRequest) -> PaymentResponse:
        """Create Cash on Delivery payment"""
        # COD is available only for certain pin codes and order values
        if request.amount < 100:
            raise HTTPException(status_code=400, detail="COD minimum order value is ₹100")
        
        if request.amount > 5000:
            raise HTTPException(status_code=400, detail="COD maximum order value is ₹5000")
        
        # Check if delivery address supports COD
        pincode = request.billing_address.get("postal_code")
        if not self._is_cod_available(pincode):
            raise HTTPException(status_code=400, detail="COD not available for this location")
        
        return PaymentResponse(
            payment_id=payment_id,
            status=PaymentStatus.PENDING,
            gateway_response={
                "payment_method": "cod",
                "amount": request.amount,
                "currency": request.currency,
                "cod_charges": self._calculate_cod_charges(request.amount)
            }
        )
    
    def _is_cod_available(self, pincode: str) -> bool:
        """Check if COD is available for given pincode"""
        # In production, check against a database of serviceable pincodes
        # For now, basic validation
        if not pincode or len(pincode) != 6:
            return False
        
        # Mock: COD available for major cities
        major_city_prefixes = ["110", "400", "560", "600", "500", "700", "411"]
        return any(pincode.startswith(prefix) for prefix in major_city_prefixes)
    
    def _calculate_cod_charges(self, amount: float) -> float:
        """Calculate COD handling charges"""
        if amount < 500:
            return 40.0  # ₹40 for orders below ₹500
        elif amount < 1000:
            return 25.0  # ₹25 for orders ₹500-1000
        else:
            return 0.0   # Free COD for orders above ₹1000
    
    async def verify_payment(self, payment_id: str, gateway_data: Dict[str, Any]) -> bool:
        """Verify payment from gateway webhook/response"""
        try:
            # Route to appropriate verification method
            payment_method = self._get_payment_method_from_id(payment_id)
            
            if payment_method == PaymentMethod.STRIPE:
                return await self._verify_stripe_payment(gateway_data)
            elif payment_method == PaymentMethod.RAZORPAY:
                return await self._verify_razorpay_payment(gateway_data)
            else:
                # For UPI and COD, manual verification required
                return True
                
        except Exception as e:
            logger.error(f"Payment verification failed: {e}")
            return False
    
    async def _verify_stripe_payment(self, data: Dict[str, Any]) -> bool:
        """Verify Stripe payment"""
        try:
            payment_intent_id = data.get("payment_intent_id")
            if not payment_intent_id:
                return False
            
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return intent.status == "succeeded"
            
        except Exception as e:
            logger.error(f"Stripe verification failed: {e}")
            return False
    
    async def _verify_razorpay_payment(self, data: Dict[str, Any]) -> bool:
        """Verify Razorpay payment"""
        try:
            razorpay_payment_id = data.get("razorpay_payment_id")
            razorpay_order_id = data.get("razorpay_order_id")
            razorpay_signature = data.get("razorpay_signature")
            
            if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature]):
                return False
            
            # Verify signature
            key_secret = os.getenv("RAZORPAY_KEY_SECRET")
            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            
            generated_signature = hmac.new(
                key_secret.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(razorpay_signature, generated_signature)
            
        except Exception as e:
            logger.error(f"Razorpay verification failed: {e}")
            return False
    
    async def create_refund(self, refund_request: RefundRequest) -> RefundResponse:
        """Create refund for a payment"""
        try:
            payment_method = self._get_payment_method_from_id(refund_request.payment_id)
            
            if payment_method == PaymentMethod.STRIPE:
                return await self._create_stripe_refund(refund_request)
            elif payment_method == PaymentMethod.RAZORPAY:
                return await self._create_razorpay_refund(refund_request)
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Refunds not supported for {payment_method}"
                )
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Refund creation failed: {e}")
            raise HTTPException(status_code=500, detail=f"Refund failed: {str(e)}")
    
    async def _create_stripe_refund(self, request: RefundRequest) -> RefundResponse:
        """Create Stripe refund"""
        try:
            # Get original payment intent
            payment_intent_id = self._get_stripe_payment_intent_id(request.payment_id)
            
            refund_data = {
                "payment_intent": payment_intent_id,
                "reason": "requested_by_customer",
                "metadata": {
                    "makrx_refund_reason": request.reason,
                    "makrx_payment_id": request.payment_id
                }
            }
            
            if request.amount:
                refund_data["amount"] = int(request.amount * 100)  # Convert to cents
            
            refund = stripe.Refund.create(**refund_data)
            
            return RefundResponse(
                refund_id=refund.id,
                status=refund.status,
                amount=refund.amount / 100,  # Convert back to dollars
                currency=refund.currency.upper(),
                created_at=datetime.fromtimestamp(refund.created)
            )
            
        except Exception as e:
            logger.error(f"Stripe refund failed: {e}")
            raise HTTPException(status_code=400, detail=f"Stripe refund failed: {str(e)}")
    
    async def _create_razorpay_refund(self, request: RefundRequest) -> RefundResponse:
        """Create Razorpay refund"""
        try:
            # Get original payment ID
            razorpay_payment_id = self._get_razorpay_payment_id(request.payment_id)
            
            refund_data = {
                "amount": int(request.amount * 100) if request.amount else None,  # Convert to paise
                "notes": {
                    "reason": request.reason,
                    "makrx_payment_id": request.payment_id
                }
            }
            
            # Remove None values
            refund_data = {k: v for k, v in refund_data.items() if v is not None}
            
            refund = self.razorpay_client.payment.refund(razorpay_payment_id, refund_data)
            
            return RefundResponse(
                refund_id=refund["id"],
                status=refund["status"],
                amount=refund["amount"] / 100,  # Convert back to rupees
                currency=refund["currency"],
                created_at=datetime.fromtimestamp(refund["created_at"])
            )
            
        except Exception as e:
            logger.error(f"Razorpay refund failed: {e}")
            raise HTTPException(status_code=400, detail=f"Razorpay refund failed: {str(e)}")
    
    def _get_payment_method_from_id(self, payment_id: str) -> PaymentMethod:
        """Extract payment method from payment ID"""
        # In production, store this in database
        # For now, mock based on prefix or database lookup
        return PaymentMethod.RAZORPAY  # Default to Razorpay for Indian customers
    
    def _get_stripe_payment_intent_id(self, payment_id: str) -> str:
        """Get Stripe payment intent ID from internal payment ID"""
        # In production, look up from database
        raise NotImplementedError("Database lookup required")
    
    def _get_razorpay_payment_id(self, payment_id: str) -> str:
        """Get Razorpay payment ID from internal payment ID"""
        # In production, look up from database
        raise NotImplementedError("Database lookup required")
    
    def calculate_platform_fee(self, amount: float, payment_method: PaymentMethod) -> float:
        """Calculate platform fee for payment method"""
        fee_percentage = self.gateway_fees.get(payment_method, 2.0)
        return (amount * fee_percentage) / 100
    
    def get_supported_methods(self, amount: float, country: str = "IN") -> List[PaymentMethod]:
        """Get supported payment methods for amount and country"""
        methods = []
        
        if country == "IN":
            methods.extend([
                PaymentMethod.RAZORPAY,
                PaymentMethod.UPI,
                PaymentMethod.NETBANKING
            ])
            
            # COD for eligible orders
            if 100 <= amount <= 5000:
                methods.append(PaymentMethod.COD)
        
        # Stripe for international or premium accounts
        methods.append(PaymentMethod.STRIPE)
        
        return methods

# Global payment service instance
payment_service = PaymentService()
