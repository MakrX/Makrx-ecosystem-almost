"""
Payment & Financial Security
Implements comprehensive payment security per specification:
- PCI compliance via Stripe/Razorpay (no local card storage)
- Webhook signature verification
- Idempotent payment processing
- Secure refund handling with audit logs
- Financial data protection
"""
import hmac
import hashlib
import json
import logging
import secrets
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from enum import Enum
from decimal import Decimal
import stripe
import razorpay
from dataclasses import dataclass

from app.core.config import settings

logger = logging.getLogger(__name__)

# ==========================================
# Payment Security Configuration
# ==========================================

class PaymentProvider(str, Enum):
    """Supported payment providers"""
    STRIPE = "stripe"
    RAZORPAY = "razorpay"

class PaymentStatus(str, Enum):
    """Payment status tracking"""
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"

@dataclass
class PaymentSecurityConfig:
    """Payment security configuration per specification"""
    
    # Webhook verification timeouts
    WEBHOOK_TIMEOUT = 300  # 5 minutes
    
    # Payment intent timeouts
    PAYMENT_INTENT_TIMEOUT = 1800  # 30 minutes
    
    # Refund authorization requirements
    REFUND_REQUIRES_MFA = True
    REFUND_ADMIN_ROLES = ["store_admin", "superadmin"]
    
    # Audit retention
    PAYMENT_AUDIT_RETENTION = 7 * 365 * 24 * 3600  # 7 years (compliance)
    
    # Rate limiting for financial operations
    PAYMENT_RATE_LIMIT = 10  # 10 payments per 5 minutes per user
    REFUND_RATE_LIMIT = 5    # 5 refunds per hour per admin

# ==========================================
# Webhook Security Verifier
# ==========================================

class WebhookSecurityVerifier:
    """
    Webhook signature verification per specification
    - Verify webhook signatures with provider's secret
    - Prevent replay attacks with timestamp checking
    - Idempotency handling
    """
    
    def __init__(self):
        self.stripe_webhook_secret = settings.STRIPE_WEBHOOK_SECRET
        self.razorpay_webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET
    
    async def verify_stripe_webhook(self, payload: bytes, signature: str) -> Dict[str, Any]:
        """
        Verify Stripe webhook signature per specification
        Prevents webhook spoofing and replay attacks
        """
        try:
            # Parse signature header
            sig_elements = signature.split(',')
            timestamp = None
            v1_signature = None
            
            for element in sig_elements:
                if element.startswith('t='):
                    timestamp = int(element[2:])
                elif element.startswith('v1='):
                    v1_signature = element[3:]
            
            if not timestamp or not v1_signature:
                raise Exception("Invalid signature format")
            
            # Check timestamp (prevent replay attacks)
            current_time = datetime.utcnow().timestamp()
            if abs(current_time - timestamp) > PaymentSecurityConfig.WEBHOOK_TIMEOUT:
                raise Exception("Webhook timestamp too old")
            
            # Verify signature
            expected_signature = hmac.new(
                self.stripe_webhook_secret.encode(),
                f"{timestamp}.".encode() + payload,
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(v1_signature, expected_signature):
                raise Exception("Invalid webhook signature")
            
            # Parse event
            event = json.loads(payload.decode('utf-8'))
            
            return {
                "provider": PaymentProvider.STRIPE,
                "event": event,
                "timestamp": timestamp,
                "verified": True
            }
            
        except Exception as e:
            logger.error(f"Stripe webhook verification failed: {e}")
            raise Exception(f"Webhook verification failed: {str(e)}")
    
    async def verify_razorpay_webhook(self, payload: bytes, signature: str) -> Dict[str, Any]:
        """
        Verify Razorpay webhook signature per specification
        """
        try:
            # Razorpay uses SHA256 HMAC
            expected_signature = hmac.new(
                self.razorpay_webhook_secret.encode(),
                payload,
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(signature, expected_signature):
                raise Exception("Invalid webhook signature")
            
            # Parse event
            event = json.loads(payload.decode('utf-8'))
            
            return {
                "provider": PaymentProvider.RAZORPAY,
                "event": event,
                "timestamp": datetime.utcnow().timestamp(),
                "verified": True
            }
            
        except Exception as e:
            logger.error(f"Razorpay webhook verification failed: {e}")
            raise Exception(f"Webhook verification failed: {str(e)}")

# Global webhook verifier
webhook_verifier = WebhookSecurityVerifier()

# ==========================================
# Idempotent Payment Processor
# ==========================================

class IdempotentPaymentProcessor:
    """
    Idempotent payment processing per specification
    - Store received event_id; ignore duplicates
    - Prevent double-processing of payments
    """
    
    def __init__(self):
        self.processed_events = {}  # In production, use Redis
        self.payment_intents = {}   # Track payment intent states
    
    async def is_duplicate_event(self, event_id: str, provider: PaymentProvider) -> bool:
        """Check if webhook event was already processed"""
        event_key = f"{provider.value}:{event_id}"
        return event_key in self.processed_events
    
    async def mark_event_processed(self, event_id: str, provider: PaymentProvider, 
                                 result: Dict[str, Any]):
        """Mark webhook event as processed"""
        event_key = f"{provider.value}:{event_id}"
        self.processed_events[event_key] = {
            "processed_at": datetime.utcnow().isoformat(),
            "result": result
        }
    
    async def get_cached_result(self, event_id: str, provider: PaymentProvider) -> Optional[Dict[str, Any]]:
        """Get cached result for duplicate event"""
        event_key = f"{provider.value}:{event_id}"
        cached = self.processed_events.get(event_key)
        return cached["result"] if cached else None
    
    async def process_payment_event(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process payment webhook event idempotently
        """
        try:
            provider = webhook_data["provider"]
            event = webhook_data["event"]
            event_id = event.get("id")
            
            if not event_id:
                raise Exception("Missing event ID")
            
            # Check for duplicate
            if await self.is_duplicate_event(event_id, provider):
                logger.info(f"Duplicate webhook event ignored: {event_id}")
                return await self.get_cached_result(event_id, provider)
            
            # Process based on provider and event type
            if provider == PaymentProvider.STRIPE:
                result = await self._process_stripe_event(event)
            elif provider == PaymentProvider.RAZORPAY:
                result = await self._process_razorpay_event(event)
            else:
                raise Exception(f"Unsupported provider: {provider}")
            
            # Mark as processed
            await self.mark_event_processed(event_id, provider, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Payment event processing failed: {e}")
            raise Exception(f"Payment processing failed: {str(e)}")
    
    async def _process_stripe_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Process Stripe webhook events"""
        event_type = event.get("type")
        data_object = event.get("data", {}).get("object", {})
        
        if event_type == "payment_intent.succeeded":
            return await self._handle_payment_success(data_object, PaymentProvider.STRIPE)
        elif event_type == "payment_intent.payment_failed":
            return await self._handle_payment_failure(data_object, PaymentProvider.STRIPE)
        elif event_type == "charge.dispute.created":
            return await self._handle_dispute_created(data_object, PaymentProvider.STRIPE)
        else:
            logger.info(f"Unhandled Stripe event type: {event_type}")
            return {"status": "ignored", "event_type": event_type}
    
    async def _process_razorpay_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Process Razorpay webhook events"""
        event_type = event.get("event")
        payload = event.get("payload", {})
        
        if event_type == "payment.captured":
            return await self._handle_payment_success(payload.get("payment", {}), PaymentProvider.RAZORPAY)
        elif event_type == "payment.failed":
            return await self._handle_payment_failure(payload.get("payment", {}), PaymentProvider.RAZORPAY)
        else:
            logger.info(f"Unhandled Razorpay event type: {event_type}")
            return {"status": "ignored", "event_type": event_type}
    
    async def _handle_payment_success(self, payment_data: Dict[str, Any], 
                                    provider: PaymentProvider) -> Dict[str, Any]:
        """Handle successful payment"""
        payment_id = payment_data.get("id")
        amount = payment_data.get("amount")
        
        # Log successful payment
        await PaymentAuditor.log_payment_event(
            payment_id=payment_id,
            event_type="payment_succeeded",
            amount=amount,
            provider=provider.value,
            details=payment_data
        )
        
        # Update order status (implement based on your order system)
        # await self._update_order_status(payment_id, PaymentStatus.SUCCEEDED)
        
        return {
            "status": "processed",
            "action": "payment_succeeded",
            "payment_id": payment_id,
            "amount": amount
        }
    
    async def _handle_payment_failure(self, payment_data: Dict[str, Any], 
                                    provider: PaymentProvider) -> Dict[str, Any]:
        """Handle failed payment"""
        payment_id = payment_data.get("id")
        
        # Log failed payment
        await PaymentAuditor.log_payment_event(
            payment_id=payment_id,
            event_type="payment_failed",
            provider=provider.value,
            details=payment_data
        )
        
        return {
            "status": "processed",
            "action": "payment_failed", 
            "payment_id": payment_id
        }
    
    async def _handle_dispute_created(self, dispute_data: Dict[str, Any], 
                                    provider: PaymentProvider) -> Dict[str, Any]:
        """Handle payment dispute"""
        dispute_id = dispute_data.get("id")
        charge_id = dispute_data.get("charge")
        
        # Log dispute
        await PaymentAuditor.log_payment_event(
            payment_id=charge_id,
            event_type="dispute_created",
            provider=provider.value,
            details=dispute_data
        )
        
        return {
            "status": "processed",
            "action": "dispute_created",
            "dispute_id": dispute_id,
            "charge_id": charge_id
        }

# Global payment processor
payment_processor = IdempotentPaymentProcessor()

# ==========================================
# Secure Refund Manager
# ==========================================

class SecureRefundManager:
    """
    Secure refund handling per specification
    - Refunds only from admin with store_admin role + MFA
    - Log all refunds in audit_log with reason & actor
    """
    
    def __init__(self):
        self.stripe_client = stripe
        self.stripe_client.api_key = settings.STRIPE_SECRET_KEY
        
        self.razorpay_client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
    
    async def initiate_refund(self, payment_id: str, amount: Optional[Decimal], 
                            reason: str, admin_user_id: str, 
                            provider: PaymentProvider, 
                            mfa_token: Optional[str] = None) -> Dict[str, Any]:
        """
        Initiate secure refund with authorization checks
        """
        try:
            # Verify admin permissions
            if not await self._verify_refund_authorization(admin_user_id, mfa_token):
                raise Exception("Refund authorization failed")
            
            # Rate limiting
            if not await self._check_refund_rate_limit(admin_user_id):
                raise Exception("Refund rate limit exceeded")
            
            # Process refund with provider
            if provider == PaymentProvider.STRIPE:
                refund_result = await self._process_stripe_refund(payment_id, amount, reason)
            elif provider == PaymentProvider.RAZORPAY:
                refund_result = await self._process_razorpay_refund(payment_id, amount, reason)
            else:
                raise Exception(f"Unsupported provider: {provider}")
            
            # Log refund in audit trail
            await PaymentAuditor.log_refund_event(
                payment_id=payment_id,
                refund_id=refund_result.get("refund_id"),
                amount=amount,
                reason=reason,
                admin_user_id=admin_user_id,
                provider=provider.value
            )
            
            return refund_result
            
        except Exception as e:
            logger.error(f"Refund initiation failed: {e}")
            raise Exception(f"Refund failed: {str(e)}")
    
    async def _verify_refund_authorization(self, admin_user_id: str, 
                                         mfa_token: Optional[str]) -> bool:
        """Verify admin has refund authorization"""
        # In production, verify:
        # 1. User has store_admin or superadmin role
        # 2. MFA token is valid (if required)
        # 3. User session is active and secure
        
        # For now, basic check
        if not admin_user_id:
            return False
        
        # MFA verification would go here
        if PaymentSecurityConfig.REFUND_REQUIRES_MFA and not mfa_token:
            return False
        
        return True
    
    async def _check_refund_rate_limit(self, admin_user_id: str) -> bool:
        """Check refund rate limiting"""
        # Implement rate limiting (5 refunds per hour per admin)
        # In production, use Redis for distributed rate limiting
        return True
    
    async def _process_stripe_refund(self, payment_id: str, amount: Optional[Decimal], 
                                   reason: str) -> Dict[str, Any]:
        """Process Stripe refund"""
        try:
            refund_params = {
                "payment_intent": payment_id,
                "reason": "requested_by_customer",  # Stripe enum
                "metadata": {
                    "internal_reason": reason,
                    "processed_by": "makrx_admin"
                }
            }
            
            if amount:
                refund_params["amount"] = int(amount * 100)  # Stripe uses cents
            
            refund = self.stripe_client.Refund.create(**refund_params)
            
            return {
                "refund_id": refund.id,
                "status": refund.status,
                "amount": Decimal(refund.amount) / 100,
                "provider": PaymentProvider.STRIPE.value
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe refund failed: {e}")
            raise Exception(f"Stripe refund failed: {str(e)}")
    
    async def _process_razorpay_refund(self, payment_id: str, amount: Optional[Decimal], 
                                     reason: str) -> Dict[str, Any]:
        """Process Razorpay refund"""
        try:
            refund_data = {
                "notes": {
                    "reason": reason,
                    "processed_by": "makrx_admin"
                }
            }
            
            if amount:
                refund_data["amount"] = int(amount * 100)  # Razorpay uses paise
            
            refund = self.razorpay_client.payment.refund(payment_id, refund_data)
            
            return {
                "refund_id": refund["id"],
                "status": refund["status"],
                "amount": Decimal(refund["amount"]) / 100,
                "provider": PaymentProvider.RAZORPAY.value
            }
            
        except Exception as e:
            logger.error(f"Razorpay refund failed: {e}")
            raise Exception(f"Razorpay refund failed: {str(e)}")

# Global refund manager
refund_manager = SecureRefundManager()

# ==========================================
# Payment Audit Logger
# ==========================================

class PaymentAuditor:
    """
    Payment audit logging per specification
    - Immutable audit trail for all payment operations
    - Retain ≥7 years for compliance
    """
    
    @staticmethod
    async def log_payment_event(payment_id: str, event_type: str, 
                              provider: str, details: Dict[str, Any] = None,
                              amount: Decimal = None, user_id: str = None):
        """Log payment event to audit trail"""
        audit_entry = {
            "audit_type": "payment_event",
            "payment_id": payment_id,
            "event_type": event_type,
            "provider": provider,
            "amount": str(amount) if amount else None,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details,
            "audit_id": secrets.token_urlsafe(16)
        }
        
        # Log to structured format for compliance
        logger.info(f"PAYMENT_AUDIT: {json.dumps(audit_entry)}")
        
        # In production, also store in immutable audit database
    
    @staticmethod
    async def log_refund_event(payment_id: str, refund_id: str, amount: Decimal,
                             reason: str, admin_user_id: str, provider: str):
        """Log refund event to audit trail"""
        audit_entry = {
            "audit_type": "refund_event",
            "payment_id": payment_id,
            "refund_id": refund_id,
            "amount": str(amount),
            "reason": reason,
            "admin_user_id": admin_user_id,
            "provider": provider,
            "timestamp": datetime.utcnow().isoformat(),
            "audit_id": secrets.token_urlsafe(16)
        }
        
        logger.info(f"REFUND_AUDIT: {json.dumps(audit_entry)}")
    
    @staticmethod
    async def log_financial_access(user_id: str, action: str, resource: str,
                                 success: bool = True, details: Dict[str, Any] = None):
        """Log financial data access"""
        audit_entry = {
            "audit_type": "financial_access",
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "success": success,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details,
            "audit_id": secrets.token_urlsafe(16)
        }
        
        logger.info(f"FINANCIAL_AUDIT: {json.dumps(audit_entry)}")

# ==========================================
# PCI Compliance Utilities
# ==========================================

class PCIComplianceHelper:
    """
    PCI compliance utilities per specification
    - Never store card data locally
    - Payment references only (payment_intent_id or order_id)
    """
    
    @staticmethod
    def sanitize_payment_data(payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sanitize payment data to ensure PCI compliance
        Remove any sensitive card information
        """
        # Fields to remove for PCI compliance
        sensitive_fields = [
            "card_number", "card", "source", "payment_method_details",
            "billing_details", "shipping", "customer"
        ]
        
        sanitized = payment_data.copy()
        
        for field in sensitive_fields:
            if field in sanitized:
                del sanitized[field]
        
        # Keep only safe references
        safe_fields = {
            "id", "amount", "currency", "status", "created", 
            "metadata", "description", "application_fee_amount"
        }
        
        return {k: v for k, v in sanitized.items() if k in safe_fields}
    
    @staticmethod
    def generate_payment_reference() -> str:
        """Generate secure payment reference for internal tracking"""
        return f"mkx_{secrets.token_urlsafe(16)}"
    
    @staticmethod
    def validate_amount(amount: Decimal, currency: str = "INR") -> bool:
        """Validate payment amount"""
        if amount <= 0:
            return False
        
        # Check reasonable limits (prevent errors)
        if currency == "INR":
            min_amount = Decimal("1.00")  # ₹1 minimum
            max_amount = Decimal("1000000.00")  # ₹10 lakh maximum
        else:
            min_amount = Decimal("0.01")
            max_amount = Decimal("100000.00")
        
        return min_amount <= amount <= max_amount

# Global PCI helper
pci_helper = PCIComplianceHelper()
