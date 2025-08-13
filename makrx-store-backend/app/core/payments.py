"""
Payment integration for Stripe and Razorpay
Payment intent creation, webhook handling, and payment processing
"""

import stripe
import razorpay
import hmac
import hashlib
import json
from typing import Dict, Optional, Any
from decimal import Decimal
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize payment clients
if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY

if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )
else:
    razorpay_client = None

class PaymentProcessor:
    """Payment processing utility class"""
    
    @staticmethod
    async def create_stripe_payment_intent(
        amount: float,
        currency: str = "inr",
        customer_email: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Create Stripe payment intent"""
        try:
            # Convert amount to cents
            amount_cents = int(amount * 100)
            
            intent_data = {
                "amount": amount_cents,
                "currency": currency.lower(),
                "automatic_payment_methods": {"enabled": True},
                "metadata": metadata or {}
            }
            
            if customer_email:
                intent_data["receipt_email"] = customer_email
            
            intent = stripe.PaymentIntent.create(**intent_data)
            
            return {
                "payment_intent_id": intent.id,
                "client_secret": intent.client_secret,
                "amount": amount,
                "currency": currency,
                "status": intent.status
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe payment intent creation failed: {e}")
            raise Exception(f"Payment processing error: {str(e)}")
    
    @staticmethod
    async def create_razorpay_order(
        amount: float,
        currency: str = "INR",
        customer_email: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Create Razorpay order"""
        if not razorpay_client:
            raise Exception("Razorpay not configured")
        
        try:
            # Convert amount to paise (smallest currency unit)
            amount_paise = int(amount * 100)
            
            order_data = {
                "amount": amount_paise,
                "currency": currency.upper(),
                "notes": metadata or {}
            }
            
            if customer_email:
                order_data["notes"]["customer_email"] = customer_email
            
            order = razorpay_client.order.create(order_data)
            
            return {
                "order_id": order["id"],
                "amount": amount,
                "currency": currency,
                "status": order["status"],
                "key_id": settings.RAZORPAY_KEY_ID
            }
            
        except Exception as e:
            logger.error(f"Razorpay order creation failed: {e}")
            raise Exception(f"Payment processing error: {str(e)}")
    
    @staticmethod
    async def verify_stripe_webhook(
        payload: bytes,
        signature: str,
        webhook_secret: str
    ) -> Optional[Dict[str, Any]]:
        """Verify and parse Stripe webhook"""
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, webhook_secret
            )
            return event
            
        except ValueError:
            logger.error("Invalid Stripe webhook payload")
            return None
        except stripe.error.SignatureVerificationError:
            logger.error("Invalid Stripe webhook signature")
            return None
    
    @staticmethod
    async def verify_razorpay_webhook(
        payload: bytes,
        signature: str,
        webhook_secret: str
    ) -> Optional[Dict[str, Any]]:
        """Verify and parse Razorpay webhook"""
        try:
            # Verify signature
            expected_signature = hmac.new(
                webhook_secret.encode('utf-8'),
                payload,
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(signature, expected_signature):
                logger.error("Invalid Razorpay webhook signature")
                return None
            
            # Parse payload
            event = json.loads(payload.decode('utf-8'))
            return event
            
        except Exception as e:
            logger.error(f"Razorpay webhook verification failed: {e}")
            return None
    
    @staticmethod
    async def get_stripe_payment_status(payment_intent_id: str) -> Dict[str, Any]:
        """Get Stripe payment intent status"""
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                "payment_id": intent.id,
                "status": intent.status,
                "amount": intent.amount / 100,  # Convert from cents
                "currency": intent.currency,
                "payment_method": intent.payment_method,
                "created": intent.created,
                "metadata": intent.metadata
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to retrieve Stripe payment: {e}")
            raise Exception(f"Payment retrieval error: {str(e)}")
    
    @staticmethod
    async def get_razorpay_payment_status(payment_id: str) -> Dict[str, Any]:
        """Get Razorpay payment status"""
        if not razorpay_client:
            raise Exception("Razorpay not configured")
        
        try:
            payment = razorpay_client.payment.fetch(payment_id)
            
            return {
                "payment_id": payment["id"],
                "status": payment["status"],
                "amount": payment["amount"] / 100,  # Convert from paise
                "currency": payment["currency"],
                "method": payment["method"],
                "created_at": payment["created_at"],
                "order_id": payment.get("order_id"),
                "notes": payment.get("notes", {})
            }
            
        except Exception as e:
            logger.error(f"Failed to retrieve Razorpay payment: {e}")
            raise Exception(f"Payment retrieval error: {str(e)}")
    
    @staticmethod
    async def refund_stripe_payment(
        payment_intent_id: str,
        amount: Optional[float] = None,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create Stripe refund"""
        try:
            refund_data = {"payment_intent": payment_intent_id}
            
            if amount:
                refund_data["amount"] = int(amount * 100)  # Convert to cents
            
            if reason:
                refund_data["reason"] = reason
            
            refund = stripe.Refund.create(**refund_data)
            
            return {
                "refund_id": refund.id,
                "amount": refund.amount / 100,
                "currency": refund.currency,
                "status": refund.status,
                "reason": refund.reason
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe refund failed: {e}")
            raise Exception(f"Refund processing error: {str(e)}")
    
    @staticmethod
    async def refund_razorpay_payment(
        payment_id: str,
        amount: Optional[float] = None,
        notes: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Create Razorpay refund"""
        if not razorpay_client:
            raise Exception("Razorpay not configured")
        
        try:
            refund_data = {}
            
            if amount:
                refund_data["amount"] = int(amount * 100)  # Convert to paise
            
            if notes:
                refund_data["notes"] = notes
            
            refund = razorpay_client.payment.refund(payment_id, refund_data)
            
            return {
                "refund_id": refund["id"],
                "amount": refund["amount"] / 100,
                "currency": refund["currency"],
                "status": refund["status"],
                "payment_id": refund["payment_id"]
            }
            
        except Exception as e:
            logger.error(f"Razorpay refund failed: {e}")
            raise Exception(f"Refund processing error: {str(e)}")

# Payment processor instance
payment_processor = PaymentProcessor()

def calculate_application_fee(amount: float, provider_cut: float = 0.15) -> Dict[str, float]:
    """Calculate application fee for marketplace transactions"""
    application_fee = amount * provider_cut
    provider_amount = amount - application_fee
    
    return {
        "total_amount": amount,
        "application_fee": round(application_fee, 2),
        "provider_amount": round(provider_amount, 2),
        "fee_percentage": provider_cut * 100
    }

def get_payment_method_fees(method: str, amount: float) -> Dict[str, Any]:
    """Calculate payment method processing fees"""
    
    # Standard payment processing fees (approximate)
    fee_structures = {
        "card": {"percentage": 2.9, "fixed": 0.30},
        "upi": {"percentage": 0.0, "fixed": 0.0},  # Often free in India
        "netbanking": {"percentage": 1.5, "fixed": 0.0},
        "wallet": {"percentage": 1.8, "fixed": 0.0}
    }
    
    fee_structure = fee_structures.get(method, fee_structures["card"])
    
    percentage_fee = amount * (fee_structure["percentage"] / 100)
    total_fee = percentage_fee + fee_structure["fixed"]
    
    return {
        "method": method,
        "amount": amount,
        "percentage_fee": round(percentage_fee, 2),
        "fixed_fee": fee_structure["fixed"],
        "total_fee": round(total_fee, 2),
        "net_amount": round(amount - total_fee, 2)
    }

async def process_payment_webhook(
    provider: str,
    event_type: str,
    event_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Process payment webhook events"""
    
    processed_event = {
        "provider": provider,
        "event_type": event_type,
        "processed_at": None,
        "success": False,
        "error": None
    }
    
    try:
        if provider == "stripe":
            await _process_stripe_webhook(event_type, event_data)
        elif provider == "razorpay":
            await _process_razorpay_webhook(event_type, event_data)
        else:
            raise ValueError(f"Unknown payment provider: {provider}")
        
        processed_event["success"] = True
        logger.info(f"Processed {provider} webhook: {event_type}")
        
    except Exception as e:
        processed_event["error"] = str(e)
        logger.error(f"Failed to process {provider} webhook: {e}")
    
    return processed_event

async def _process_stripe_webhook(event_type: str, event_data: Dict[str, Any]):
    """Process Stripe webhook events"""
    
    if event_type == "payment_intent.succeeded":
        payment_intent = event_data["data"]["object"]
        # Update order status, send confirmation email, etc.
        logger.info(f"Stripe payment succeeded: {payment_intent['id']}")
        
    elif event_type == "payment_intent.payment_failed":
        payment_intent = event_data["data"]["object"]
        # Handle payment failure
        logger.warning(f"Stripe payment failed: {payment_intent['id']}")
        
    elif event_type == "charge.dispute.created":
        dispute = event_data["data"]["object"]
        # Handle chargeback/dispute
        logger.warning(f"Stripe dispute created: {dispute['id']}")

async def _process_razorpay_webhook(event_type: str, event_data: Dict[str, Any]):
    """Process Razorpay webhook events"""
    
    if event_type == "payment.captured":
        payment = event_data["payload"]["payment"]["entity"]
        # Update order status, send confirmation email, etc.
        logger.info(f"Razorpay payment captured: {payment['id']}")
        
    elif event_type == "payment.failed":
        payment = event_data["payload"]["payment"]["entity"]
        # Handle payment failure
        logger.warning(f"Razorpay payment failed: {payment['id']}")
        
    elif event_type == "order.paid":
        order = event_data["payload"]["order"]["entity"]
        # Handle order completion
        logger.info(f"Razorpay order paid: {order['id']}")

# Health check for payment providers
async def check_payment_health() -> Dict[str, bool]:
    """Check payment provider connectivity"""
    health_status = {}
    
    # Check Stripe
    if settings.STRIPE_SECRET_KEY:
        try:
            stripe.Account.retrieve()
            health_status["stripe"] = True
        except Exception as e:
            logger.error(f"Stripe health check failed: {e}")
            health_status["stripe"] = False
    else:
        health_status["stripe"] = None  # Not configured
    
    # Check Razorpay
    if razorpay_client:
        try:
            # Simple API call to test connectivity
            razorpay_client.payment.all({"count": 1})
            health_status["razorpay"] = True
        except Exception as e:
            logger.error(f"Razorpay health check failed: {e}")
            health_status["razorpay"] = False
    else:
        health_status["razorpay"] = None  # Not configured
    
    return health_status
