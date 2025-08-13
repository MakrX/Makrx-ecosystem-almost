"""Comprehensive notification service for MakrX ecosystem"""
import os
import smtplib
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import aiohttp
import boto3
from twilio.rest import Client as TwilioClient
from pydantic import BaseModel, Field
import logging
from jinja2 import Template

logger = logging.getLogger(__name__)

# Notification models
class NotificationType(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    WEBHOOK = "webhook"
    SLACK = "slack"
    WHATSAPP = "whatsapp"

class NotificationPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class NotificationCategory(str, Enum):
    # Order related
    ORDER_CONFIRMATION = "order_confirmation"
    ORDER_SHIPPED = "order_shipped"
    ORDER_DELIVERED = "order_delivered"
    ORDER_CANCELLED = "order_cancelled"
    
    # Payment related
    PAYMENT_SUCCESS = "payment_success"
    PAYMENT_FAILED = "payment_failed"
    REFUND_PROCESSED = "refund_processed"
    
    # Service related
    QUOTE_READY = "quote_ready"
    PRINT_STARTED = "print_started"
    PRINT_COMPLETED = "print_completed"
    QUALITY_CHECK = "quality_check"
    
    # MakrCave related
    EQUIPMENT_AVAILABLE = "equipment_available"
    CERTIFICATION_APPROVED = "certification_approved"
    SAFETY_ALERT = "safety_alert"
    MEMBERSHIP_EXPIRY = "membership_expiry"
    
    # System notifications
    ACCOUNT_CREATED = "account_created"
    PASSWORD_RESET = "password_reset"
    SECURITY_ALERT = "security_alert"
    MAINTENANCE_NOTICE = "maintenance_notice"
    
    # Marketing
    NEWSLETTER = "newsletter"
    PROMOTIONAL = "promotional"
    FEATURE_ANNOUNCEMENT = "feature_announcement"

class NotificationRequest(BaseModel):
    recipient: str = Field(..., description="Email, phone, or user ID")
    notification_type: NotificationType
    category: NotificationCategory
    priority: NotificationPriority = NotificationPriority.NORMAL
    
    subject: str = Field(..., description="Notification subject/title")
    message: str = Field(..., description="Notification content")
    template_name: Optional[str] = Field(None, description="Template to use")
    template_data: Dict[str, Any] = Field(default_factory=dict)
    
    # Scheduling
    scheduled_at: Optional[datetime] = Field(None, description="Schedule for later")
    expires_at: Optional[datetime] = Field(None, description="Expiry time")
    
    # Options
    attachments: List[str] = Field(default_factory=list, description="File paths")
    metadata: Dict[str, Any] = Field(default_factory=dict)
    user_preferences: Dict[str, bool] = Field(default_factory=dict)

class NotificationResponse(BaseModel):
    notification_id: str
    status: str
    message: str
    delivered_at: Optional[datetime] = None
    delivery_attempts: int = 0
    error_details: Optional[str] = None

class EmailConfig(BaseModel):
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    username: str
    password: str
    from_email: str
    from_name: str = "MakrX"
    use_tls: bool = True

class SMSConfig(BaseModel):
    provider: str = "twilio"  # twilio, aws_sns, etc.
    account_sid: Optional[str] = None
    auth_token: Optional[str] = None
    from_number: Optional[str] = None

class PushConfig(BaseModel):
    firebase_key: Optional[str] = None
    apple_key: Optional[str] = None

class NotificationService:
    """Unified notification service"""
    
    def __init__(self):
        self.email_config = self._load_email_config()
        self.sms_config = self._load_sms_config()
        self.push_config = self._load_push_config()
        
        # Initialize clients
        self.twilio_client = self._init_twilio()
        self.ses_client = self._init_ses()
        
        # Template cache
        self.templates = self._load_templates()
        
        # Delivery tracking
        self.delivery_queue = []
        self.failed_notifications = []
    
    def _load_email_config(self) -> EmailConfig:
        """Load email configuration"""
        return EmailConfig(
            smtp_host=os.getenv("SMTP_HOST", "smtp.gmail.com"),
            smtp_port=int(os.getenv("SMTP_PORT", "587")),
            username=os.getenv("SMTP_USERNAME", ""),
            password=os.getenv("SMTP_PASSWORD", ""),
            from_email=os.getenv("FROM_EMAIL", "noreply@makrx.store"),
            from_name=os.getenv("FROM_NAME", "MakrX"),
            use_tls=os.getenv("SMTP_USE_TLS", "true").lower() == "true"
        )
    
    def _load_sms_config(self) -> SMSConfig:
        """Load SMS configuration"""
        return SMSConfig(
            provider=os.getenv("SMS_PROVIDER", "twilio"),
            account_sid=os.getenv("TWILIO_ACCOUNT_SID"),
            auth_token=os.getenv("TWILIO_AUTH_TOKEN"),
            from_number=os.getenv("TWILIO_FROM_NUMBER")
        )
    
    def _load_push_config(self) -> PushConfig:
        """Load push notification configuration"""
        return PushConfig(
            firebase_key=os.getenv("FIREBASE_SERVER_KEY"),
            apple_key=os.getenv("APPLE_PUSH_KEY")
        )
    
    def _init_twilio(self):
        """Initialize Twilio client"""
        try:
            if self.sms_config.account_sid and self.sms_config.auth_token:
                return TwilioClient(
                    self.sms_config.account_sid,
                    self.sms_config.auth_token
                )
        except Exception as e:
            logger.warning(f"Twilio initialization failed: {e}")
        return None
    
    def _init_ses(self):
        """Initialize AWS SES client"""
        try:
            return boto3.client(
                'ses',
                region_name=os.getenv("AWS_REGION", "ap-south-1"),
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
            )
        except Exception as e:
            logger.warning(f"SES initialization failed: {e}")
        return None
    
    def _load_templates(self) -> Dict[str, str]:
        """Load notification templates"""
        templates = {
            "order_confirmation": """
            <h2>Order Confirmation - {{ order_number }}</h2>
            <p>Thank you for your order!</p>
            <p>Order Total: ₹{{ total_amount }}</p>
            <p>Estimated Delivery: {{ delivery_date }}</p>
            """,
            
            "payment_success": """
            <h2>Payment Successful</h2>
            <p>Your payment of ₹{{ amount }} has been processed successfully.</p>
            <p>Transaction ID: {{ transaction_id }}</p>
            """,
            
            "quote_ready": """
            <h2>Your 3D Printing Quote is Ready</h2>
            <p>File: {{ filename }}</p>
            <p>Total Cost: ₹{{ total_cost }}</p>
            <p>Estimated Delivery: {{ delivery_date }}</p>
            <a href="{{ quote_url }}">View Quote</a>
            """,
            
            "equipment_available": """
            <h2>Equipment Now Available</h2>
            <p>{{ equipment_name }} is now available for booking.</p>
            <p>Location: {{ location }}</p>
            <a href="{{ booking_url }}">Book Now</a>
            """,
            
            "safety_alert": """
            <h2>Safety Alert - {{ alert_type }}</h2>
            <p>{{ message }}</p>
            <p>Please take immediate action if required.</p>
            """,
            
            "password_reset": """
            <h2>Password Reset Request</h2>
            <p>Click the link below to reset your password:</p>
            <a href="{{ reset_url }}">Reset Password</a>
            <p>This link expires in 24 hours.</p>
            """
        }
        
        # Load custom templates from file system
        template_dir = os.getenv("TEMPLATE_DIR", "templates/notifications")
        if os.path.exists(template_dir):
            for filename in os.listdir(template_dir):
                if filename.endswith(".html"):
                    template_name = filename[:-5]  # Remove .html
                    with open(os.path.join(template_dir, filename), 'r') as f:
                        templates[template_name] = f.read()
        
        return templates
    
    async def send_notification(self, request: NotificationRequest) -> NotificationResponse:
        """Send notification via specified channel"""
        try:
            notification_id = f"notif_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(request.recipient) % 10000:04d}"
            
            # Check user preferences
            if not self._check_user_preferences(request):
                return NotificationResponse(
                    notification_id=notification_id,
                    status="skipped",
                    message="Blocked by user preferences"
                )
            
            # Schedule if needed
            if request.scheduled_at and request.scheduled_at > datetime.now():
                return await self._schedule_notification(notification_id, request)
            
            # Check if expired
            if request.expires_at and request.expires_at < datetime.now():
                return NotificationResponse(
                    notification_id=notification_id,
                    status="expired",
                    message="Notification expired"
                )
            
            # Route to appropriate handler
            if request.notification_type == NotificationType.EMAIL:
                return await self._send_email(notification_id, request)
            elif request.notification_type == NotificationType.SMS:
                return await self._send_sms(notification_id, request)
            elif request.notification_type == NotificationType.PUSH:
                return await self._send_push(notification_id, request)
            elif request.notification_type == NotificationType.WEBHOOK:
                return await self._send_webhook(notification_id, request)
            else:
                raise ValueError(f"Unsupported notification type: {request.notification_type}")
                
        except Exception as e:
            logger.error(f"Notification failed: {e}")
            return NotificationResponse(
                notification_id=notification_id,
                status="failed",
                message=str(e),
                error_details=str(e)
            )
    
    async def _send_email(self, notification_id: str, request: NotificationRequest) -> NotificationResponse:
        """Send email notification"""
        try:
            # Render template if specified
            content = self._render_template(request)
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = f"{self.email_config.from_name} <{self.email_config.from_email}>"
            msg['To'] = request.recipient
            msg['Subject'] = request.subject
            
            # Add content
            html_part = MIMEText(content, 'html')
            msg.attach(html_part)
            
            # Add attachments
            for attachment_path in request.attachments:
                if os.path.exists(attachment_path):
                    with open(attachment_path, 'rb') as f:
                        part = MIMEBase('application', 'octet-stream')
                        part.set_payload(f.read())
                        encoders.encode_base64(part)
                        part.add_header(
                            'Content-Disposition',
                            f'attachment; filename= {os.path.basename(attachment_path)}'
                        )
                        msg.attach(part)
            
            # Send via SMTP or SES
            if self.ses_client:
                return await self._send_via_ses(notification_id, msg, request)
            else:
                return await self._send_via_smtp(notification_id, msg, request)
                
        except Exception as e:
            logger.error(f"Email sending failed: {e}")
            return NotificationResponse(
                notification_id=notification_id,
                status="failed",
                message=f"Email failed: {str(e)}",
                error_details=str(e)
            )
    
    async def _send_via_smtp(self, notification_id: str, msg: MIMEMultipart, request: NotificationRequest) -> NotificationResponse:
        """Send email via SMTP"""
        try:
            server = smtplib.SMTP(self.email_config.smtp_host, self.email_config.smtp_port)
            
            if self.email_config.use_tls:
                server.starttls()
            
            server.login(self.email_config.username, self.email_config.password)
            server.send_message(msg)
            server.quit()
            
            return NotificationResponse(
                notification_id=notification_id,
                status="sent",
                message="Email sent successfully",
                delivered_at=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"SMTP sending failed: {e}")
            raise
    
    async def _send_via_ses(self, notification_id: str, msg: MIMEMultipart, request: NotificationRequest) -> NotificationResponse:
        """Send email via AWS SES"""
        try:
            response = self.ses_client.send_raw_email(
                RawMessage={'Data': msg.as_string()}
            )
            
            return NotificationResponse(
                notification_id=notification_id,
                status="sent",
                message="Email sent via SES",
                delivered_at=datetime.now(),
                metadata={"message_id": response['MessageId']}
            )
            
        except Exception as e:
            logger.error(f"SES sending failed: {e}")
            raise
    
    async def _send_sms(self, notification_id: str, request: NotificationRequest) -> NotificationResponse:
        """Send SMS notification"""
        try:
            if not self.twilio_client:
                raise ValueError("SMS service not configured")
            
            # Format phone number
            phone = self._format_phone_number(request.recipient)
            
            message = self.twilio_client.messages.create(
                body=request.message,
                from_=self.sms_config.from_number,
                to=phone
            )
            
            return NotificationResponse(
                notification_id=notification_id,
                status="sent",
                message="SMS sent successfully",
                delivered_at=datetime.now(),
                metadata={"twilio_sid": message.sid}
            )
            
        except Exception as e:
            logger.error(f"SMS sending failed: {e}")
            return NotificationResponse(
                notification_id=notification_id,
                status="failed",
                message=f"SMS failed: {str(e)}",
                error_details=str(e)
            )
    
    async def _send_push(self, notification_id: str, request: NotificationRequest) -> NotificationResponse:
        """Send push notification"""
        try:
            # Firebase Cloud Messaging implementation
            if not self.push_config.firebase_key:
                raise ValueError("Push notifications not configured")
            
            payload = {
                "to": request.recipient,  # FCM token
                "notification": {
                    "title": request.subject,
                    "body": request.message,
                    "icon": "https://makrx.store/icon.png",
                    "click_action": request.metadata.get("url", "https://makrx.store")
                },
                "data": request.metadata
            }
            
            headers = {
                "Authorization": f"key={self.push_config.firebase_key}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://fcm.googleapis.com/fcm/send",
                    json=payload,
                    headers=headers
                ) as response:
                    result = await response.json()
                    
                    if response.status == 200 and result.get("success", 0) > 0:
                        return NotificationResponse(
                            notification_id=notification_id,
                            status="sent",
                            message="Push notification sent",
                            delivered_at=datetime.now()
                        )
                    else:
                        raise ValueError(f"FCM error: {result}")
                        
        except Exception as e:
            logger.error(f"Push notification failed: {e}")
            return NotificationResponse(
                notification_id=notification_id,
                status="failed",
                message=f"Push failed: {str(e)}",
                error_details=str(e)
            )
    
    async def _send_webhook(self, notification_id: str, request: NotificationRequest) -> NotificationResponse:
        """Send webhook notification"""
        try:
            webhook_url = request.metadata.get("webhook_url")
            if not webhook_url:
                raise ValueError("Webhook URL not provided")
            
            payload = {
                "notification_id": notification_id,
                "category": request.category,
                "priority": request.priority,
                "subject": request.subject,
                "message": request.message,
                "timestamp": datetime.now().isoformat(),
                "data": request.template_data
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    webhook_url,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        return NotificationResponse(
                            notification_id=notification_id,
                            status="sent",
                            message="Webhook delivered",
                            delivered_at=datetime.now()
                        )
                    else:
                        raise ValueError(f"Webhook failed with status {response.status}")
                        
        except Exception as e:
            logger.error(f"Webhook failed: {e}")
            return NotificationResponse(
                notification_id=notification_id,
                status="failed",
                message=f"Webhook failed: {str(e)}",
                error_details=str(e)
            )
    
    def _render_template(self, request: NotificationRequest) -> str:
        """Render notification template"""
        if request.template_name and request.template_name in self.templates:
            template = Template(self.templates[request.template_name])
            return template.render(**request.template_data)
        elif request.category in self.templates:
            template = Template(self.templates[request.category])
            return template.render(**request.template_data)
        else:
            return request.message
    
    def _check_user_preferences(self, request: NotificationRequest) -> bool:
        """Check if user allows this type of notification"""
        # In production, check against user preferences in database
        preferences = request.user_preferences
        
        # Default preferences
        if not preferences:
            return True
        
        # Check category preferences
        if request.category == NotificationCategory.PROMOTIONAL:
            return preferences.get("marketing_emails", False)
        elif request.category in [NotificationCategory.SAFETY_ALERT, NotificationCategory.SECURITY_ALERT]:
            return True  # Always send safety/security alerts
        else:
            channel_key = f"{request.notification_type}_notifications"
            return preferences.get(channel_key, True)
    
    def _format_phone_number(self, phone: str) -> str:
        """Format phone number for international sending"""
        # Remove non-digits
        digits_only = ''.join(c for c in phone if c.isdigit())
        
        # Add country code if not present
        if len(digits_only) == 10:  # Indian number without country code
            return f"+91{digits_only}"
        elif len(digits_only) == 12 and digits_only.startswith("91"):
            return f"+{digits_only}"
        else:
            return phone  # Assume it's already formatted
    
    async def _schedule_notification(self, notification_id: str, request: NotificationRequest) -> NotificationResponse:
        """Schedule notification for later delivery"""
        # In production, use a proper job queue like Celery or RQ
        self.delivery_queue.append({
            "notification_id": notification_id,
            "request": request,
            "scheduled_at": request.scheduled_at
        })
        
        return NotificationResponse(
            notification_id=notification_id,
            status="scheduled",
            message=f"Notification scheduled for {request.scheduled_at}"
        )
    
    async def send_bulk_notifications(self, requests: List[NotificationRequest]) -> List[NotificationResponse]:
        """Send multiple notifications efficiently"""
        tasks = [self.send_notification(request) for request in requests]
        return await asyncio.gather(*tasks, return_exceptions=True)
    
    def get_delivery_status(self, notification_id: str) -> Dict[str, Any]:
        """Get delivery status of a notification"""
        # In production, query from database
        return {
            "notification_id": notification_id,
            "status": "delivered",
            "delivered_at": datetime.now().isoformat(),
            "delivery_attempts": 1
        }

# Global notification service instance
notification_service = NotificationService()

# Convenience functions for common notifications
async def send_order_confirmation(order_data: Dict[str, Any], customer_email: str) -> NotificationResponse:
    """Send order confirmation email"""
    request = NotificationRequest(
        recipient=customer_email,
        notification_type=NotificationType.EMAIL,
        category=NotificationCategory.ORDER_CONFIRMATION,
        subject=f"Order Confirmation - {order_data['order_number']}",
        message="Your order has been confirmed",
        template_name="order_confirmation",
        template_data=order_data
    )
    return await notification_service.send_notification(request)

async def send_payment_success(payment_data: Dict[str, Any], customer_email: str) -> NotificationResponse:
    """Send payment success notification"""
    request = NotificationRequest(
        recipient=customer_email,
        notification_type=NotificationType.EMAIL,
        category=NotificationCategory.PAYMENT_SUCCESS,
        subject="Payment Successful",
        message="Your payment has been processed",
        template_name="payment_success",
        template_data=payment_data
    )
    return await notification_service.send_notification(request)

async def send_quote_ready(quote_data: Dict[str, Any], customer_email: str) -> NotificationResponse:
    """Send quote ready notification"""
    request = NotificationRequest(
        recipient=customer_email,
        notification_type=NotificationType.EMAIL,
        category=NotificationCategory.QUOTE_READY,
        subject="Your 3D Printing Quote is Ready",
        message="Your quote has been calculated",
        template_name="quote_ready",
        template_data=quote_data
    )
    return await notification_service.send_notification(request)

async def send_safety_alert(alert_data: Dict[str, Any], recipient: str, notification_type: NotificationType = NotificationType.EMAIL) -> NotificationResponse:
    """Send safety alert"""
    request = NotificationRequest(
        recipient=recipient,
        notification_type=notification_type,
        category=NotificationCategory.SAFETY_ALERT,
        priority=NotificationPriority.URGENT,
        subject=f"Safety Alert - {alert_data['alert_type']}",
        message=alert_data['message'],
        template_name="safety_alert",
        template_data=alert_data
    )
    return await notification_service.send_notification(request)
