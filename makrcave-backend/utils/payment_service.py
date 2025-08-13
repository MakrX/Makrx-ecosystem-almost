import os
import hmac
import hashlib
import requests
import json
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging
import razorpay

logger = logging.getLogger(__name__)

class PaymentGatewayError(Exception):
    """Custom exception for payment gateway errors"""
    pass

class RazorpayService:
    """Razorpay payment gateway integration"""
    
    def __init__(self):
        self.key_id = os.getenv("RAZORPAY_KEY_ID")
        self.key_secret = os.getenv("RAZORPAY_KEY_SECRET")
        self.webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")
        self.base_url = "https://api.razorpay.com/v1"

        if self.key_id and self.key_secret:
            self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
        else:
            self.client = None
            logger.warning("Razorpay credentials not configured")
    
    def create_order(
        self, 
        amount: float, 
        currency: str = "INR", 
        receipt: str = None,
        notes: Dict[str, str] = None
    ) -> Dict[str, Any]:
        """Create a Razorpay order"""
        try:
            data = {
                "amount": int(amount * 100),  # Amount in paise
                "currency": currency,
                "receipt": receipt or f"rcpt_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "notes": notes or {}
            }

            if not self.client:
                raise PaymentGatewayError("Razorpay client not configured")

            return self.client.order.create(data=data)

        except Exception as e:
            error_msg = f"Razorpay API request failed: {str(e)}"
            logger.error(error_msg)
            raise PaymentGatewayError(error_msg)
    
    def verify_payment_signature(
        self, 
        razorpay_order_id: str, 
        razorpay_payment_id: str, 
        razorpay_signature: str
    ) -> bool:
        """Verify Razorpay payment signature"""
        try:
            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            expected_signature = hmac.new(
                self.key_secret.encode('utf-8'),
                message.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, razorpay_signature)
            
        except Exception as e:
            logger.error(f"Signature verification failed: {str(e)}")
            return False
    
    def get_payment(self, payment_id: str) -> Dict[str, Any]:
        """Get payment details from Razorpay"""
        try:
            if not self.client:
                raise PaymentGatewayError("Razorpay client not configured")

            return self.client.payment.fetch(payment_id)

        except Exception as e:
            error_msg = f"Razorpay API request failed: {str(e)}"
            logger.error(error_msg)
            raise PaymentGatewayError(error_msg)
    
    def create_refund(
        self, 
        payment_id: str, 
        amount: float = None, 
        notes: Dict[str, str] = None
    ) -> Dict[str, Any]:
        """Create a refund for a payment"""
        try:
            if not self.client:
                raise PaymentGatewayError("Razorpay client not configured")

            data = {"notes": notes or {}}
            if amount:
                data["amount"] = int(amount * 100)  # Amount in paise

            return self.client.payment.refund(payment_id, data)

        except Exception as e:
            error_msg = f"Razorpay API request failed: {str(e)}"
            logger.error(error_msg)
            raise PaymentGatewayError(error_msg)
    
    def verify_webhook_signature(self, payload: str, signature: str) -> bool:
        """Verify Razorpay webhook signature"""
        try:
            expected_signature = hmac.new(
                self.webhook_secret.encode('utf-8'),
                payload.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, signature)
            
        except Exception as e:
            logger.error(f"Webhook signature verification failed: {str(e)}")
            return False

class StripeService:
    """Stripe payment gateway integration"""
    
    def __init__(self):
        self.secret_key = os.getenv("STRIPE_SECRET_KEY")
        self.publishable_key = os.getenv("STRIPE_PUBLISHABLE_KEY")
        self.webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        self.base_url = "https://api.stripe.com/v1"
        
        if not self.secret_key:
            logger.warning("Stripe credentials not configured")
    
    def create_payment_intent(
        self, 
        amount: float, 
        currency: str = "usd", 
        metadata: Dict[str, str] = None
    ) -> Dict[str, Any]:
        """Create a Stripe payment intent"""
        try:
            url = f"{self.base_url}/payment_intents"
            
            data = {
                "amount": int(amount * 100),  # Amount in cents
                "currency": currency.lower(),
                "metadata": metadata or {}
            }
            
            response = requests.post(
                url,
                data=data,
                headers={
                    "Authorization": f"Bearer {self.secret_key}",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                error_msg = f"Stripe payment intent creation failed: {response.text}"
                logger.error(error_msg)
                raise PaymentGatewayError(error_msg)
                
        except requests.RequestException as e:
            error_msg = f"Stripe API request failed: {str(e)}"
            logger.error(error_msg)
            raise PaymentGatewayError(error_msg)
    
    def confirm_payment_intent(self, payment_intent_id: str) -> Dict[str, Any]:
        """Confirm a Stripe payment intent"""
        try:
            url = f"{self.base_url}/payment_intents/{payment_intent_id}/confirm"
            
            response = requests.post(
                url,
                headers={
                    "Authorization": f"Bearer {self.secret_key}",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                error_msg = f"Stripe payment confirmation failed: {response.text}"
                logger.error(error_msg)
                raise PaymentGatewayError(error_msg)
                
        except requests.RequestException as e:
            error_msg = f"Stripe API request failed: {str(e)}"
            logger.error(error_msg)
            raise PaymentGatewayError(error_msg)
    
    def create_refund(
        self, 
        payment_intent_id: str, 
        amount: float = None, 
        metadata: Dict[str, str] = None
    ) -> Dict[str, Any]:
        """Create a refund for a payment"""
        try:
            url = f"{self.base_url}/refunds"
            
            data = {
                "payment_intent": payment_intent_id,
                "metadata": metadata or {}
            }
            
            if amount:
                data["amount"] = int(amount * 100)  # Amount in cents
            
            response = requests.post(
                url,
                data=data,
                headers={
                    "Authorization": f"Bearer {self.secret_key}",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                error_msg = f"Stripe refund failed: {response.text}"
                logger.error(error_msg)
                raise PaymentGatewayError(error_msg)
                
        except requests.RequestException as e:
            error_msg = f"Stripe API request failed: {str(e)}"
            logger.error(error_msg)
            raise PaymentGatewayError(error_msg)
    
    def verify_webhook_signature(
        self, 
        payload: str, 
        signature: str, 
        timestamp: str
    ) -> bool:
        """Verify Stripe webhook signature"""
        try:
            # Extract timestamp and signature from header
            elements = signature.split(',')
            signature_dict = {}
            
            for element in elements:
                key, value = element.split('=', 1)
                signature_dict[key] = value
            
            if 't' not in signature_dict or 'v1' not in signature_dict:
                return False
            
            # Check timestamp tolerance (5 minutes)
            webhook_timestamp = int(signature_dict['t'])
            current_timestamp = int(datetime.now().timestamp())
            
            if abs(current_timestamp - webhook_timestamp) > 300:  # 5 minutes
                return False
            
            # Verify signature
            signed_payload = f"{webhook_timestamp}.{payload}"
            expected_signature = hmac.new(
                self.webhook_secret.encode('utf-8'),
                signed_payload.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, signature_dict['v1'])
            
        except Exception as e:
            logger.error(f"Stripe webhook signature verification failed: {str(e)}")
            return False

class PaymentService:
    """Unified payment service that handles multiple gateways"""
    
    def __init__(self):
        self.razorpay = RazorpayService()
        self.stripe = StripeService()
    
    def create_checkout_session(
        self, 
        gateway: str, 
        amount: float, 
        currency: str = "INR",
        transaction_id: str = None,
        user_id: str = None,
        metadata: Dict[str, Any] = None
    ) -> Tuple[str, Dict[str, Any]]:
        """Create a checkout session for the specified gateway"""
        
        if gateway.lower() == "razorpay":
            notes = {
                "transaction_id": transaction_id,
                "user_id": user_id
            }
            if metadata:
                notes.update({k: str(v) for k, v in metadata.items()})
            
            order = self.razorpay.create_order(
                amount=amount,
                currency=currency,
                receipt=f"txn_{transaction_id}",
                notes=notes
            )
            
            return order["id"], {
                "gateway": "razorpay",
                "order_id": order["id"],
                "amount": order["amount"],
                "currency": order["currency"],
                "key_id": self.razorpay.key_id
            }
            
        elif gateway.lower() == "stripe":
            metadata_dict = {
                "transaction_id": transaction_id,
                "user_id": user_id
            }
            if metadata:
                metadata_dict.update({k: str(v) for k, v in metadata.items()})
            
            intent = self.stripe.create_payment_intent(
                amount=amount,
                currency=currency,
                metadata=metadata_dict
            )
            
            return intent["id"], {
                "gateway": "stripe",
                "client_secret": intent["client_secret"],
                "payment_intent_id": intent["id"],
                "amount": intent["amount"],
                "currency": intent["currency"],
                "publishable_key": self.stripe.publishable_key
            }
        
        else:
            raise PaymentGatewayError(f"Unsupported payment gateway: {gateway}")
    
    def verify_payment(
        self, 
        gateway: str, 
        payment_data: Dict[str, Any]
    ) -> Tuple[bool, Dict[str, Any]]:
        """Verify a payment from the specified gateway"""
        
        if gateway.lower() == "razorpay":
            is_valid = self.razorpay.verify_payment_signature(
                payment_data["razorpay_order_id"],
                payment_data["razorpay_payment_id"],
                payment_data["razorpay_signature"]
            )
            
            if is_valid:
                payment_details = self.razorpay.get_payment(payment_data["razorpay_payment_id"])
                return True, {
                    "gateway_transaction_id": payment_details["id"],
                    "gateway_order_id": payment_details["order_id"],
                    "amount": payment_details["amount"] / 100,  # Convert from paise
                    "currency": payment_details["currency"],
                    "status": payment_details["status"],
                    "method": payment_details.get("method"),
                    "gateway_data": payment_details
                }
            
            return False, {"error": "Invalid payment signature"}
            
        elif gateway.lower() == "stripe":
            try:
                intent = self.stripe.confirm_payment_intent(payment_data["payment_intent_id"])
                
                return True, {
                    "gateway_transaction_id": intent["id"],
                    "amount": intent["amount"] / 100,  # Convert from cents
                    "currency": intent["currency"],
                    "status": intent["status"],
                    "gateway_data": intent
                }
                
            except PaymentGatewayError:
                return False, {"error": "Payment confirmation failed"}
        
        else:
            return False, {"error": f"Unsupported payment gateway: {gateway}"}
    
    def create_refund(
        self, 
        gateway: str, 
        gateway_transaction_id: str, 
        amount: float = None,
        reason: str = None
    ) -> Dict[str, Any]:
        """Create a refund through the specified gateway"""
        
        if gateway.lower() == "razorpay":
            notes = {"reason": reason} if reason else {}
            return self.razorpay.create_refund(
                payment_id=gateway_transaction_id,
                amount=amount,
                notes=notes
            )
            
        elif gateway.lower() == "stripe":
            metadata = {"reason": reason} if reason else {}
            return self.stripe.create_refund(
                payment_intent_id=gateway_transaction_id,
                amount=amount,
                metadata=metadata
            )
        
        else:
            raise PaymentGatewayError(f"Unsupported payment gateway: {gateway}")
    
    def verify_webhook(
        self, 
        gateway: str, 
        payload: str, 
        signature: str, 
        timestamp: str = None
    ) -> bool:
        """Verify webhook signature from the specified gateway"""
        
        if gateway.lower() == "razorpay":
            return self.razorpay.verify_webhook_signature(payload, signature)
            
        elif gateway.lower() == "stripe":
            return self.stripe.verify_webhook_signature(payload, signature, timestamp)
        
        else:
            return False

# Initialize payment service
payment_service = PaymentService()

def calculate_service_charge(
    amount: float, 
    service_type: str, 
    gateway: str = "razorpay"
) -> Tuple[float, float, float]:
    """Calculate service charges and taxes"""
    
    # Gateway charges (approximate)
    gateway_charges = {
        "razorpay": {
            "percentage": 2.0,  # 2% + GST
            "fixed": 0
        },
        "stripe": {
            "percentage": 2.9,  # 2.9% + 30 cents
            "fixed": 0.30
        }
    }
    
    # Service charges (can be customized per service type)
    service_charges = {
        "membership": 0,
        "credit_purchase": 0,
        "3d_printing": 0,
        "laser_cutting": 0,
        "workshop": 0,
        "material": 0
    }
    
    gateway_fee = 0
    if gateway in gateway_charges:
        gateway_config = gateway_charges[gateway]
        gateway_fee = (amount * gateway_config["percentage"] / 100) + gateway_config["fixed"]
    
    service_fee = service_charges.get(service_type, 0)
    
    # GST (18% on service charges in India)
    gst_rate = 0.18
    tax_amount = (gateway_fee + service_fee) * gst_rate
    
    total_amount = amount + gateway_fee + service_fee + tax_amount
    
    return total_amount, gateway_fee + service_fee, tax_amount

def format_currency(amount: float, currency: str = "INR") -> str:
    """Format amount with currency symbol"""
    symbols = {
        "INR": "₹",
        "USD": "$",
        "EUR": "€",
        "GBP": "£"
    }
    
    symbol = symbols.get(currency, currency)
    return f"{symbol}{amount:,.2f}"
