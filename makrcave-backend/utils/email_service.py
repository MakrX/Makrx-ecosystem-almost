import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import List, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        self.from_name = os.getenv("FROM_NAME", "MakrCave")
        
    def send_email(
        self, 
        to_email: str, 
        subject: str, 
        html_body: str, 
        text_body: Optional[str] = None,
        attachments: Optional[List[str]] = None
    ) -> bool:
        """Send an email"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add text part
            if text_body:
                text_part = MIMEText(text_body, 'plain')
                msg.attach(text_part)
            
            # Add HTML part
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)
            
            # Add attachments
            if attachments:
                for file_path in attachments:
                    if os.path.isfile(file_path):
                        with open(file_path, "rb") as attachment:
                            part = MIMEBase('application', 'octet-stream')
                            part.set_payload(attachment.read())
                        
                        encoders.encode_base64(part)
                        part.add_header(
                            'Content-Disposition',
                            f'attachment; filename= {os.path.basename(file_path)}'
                        )
                        msg.attach(part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

# Initialize email service
email_service = EmailService()

def send_member_invite_email(
    email: str, 
    invite_token: str, 
    plan_name: str, 
    makerspace_name: str = "MakrCave",
    custom_message: Optional[str] = None
) -> bool:
    """Send member invitation email"""
    
    invite_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/invite/{invite_token}"
    
    subject = f"You're invited to join {makerspace_name}!"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Welcome to {makerspace_name}</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .logo {{ font-size: 28px; font-weight: bold; color: #2563eb; }}
            .content {{ line-height: 1.6; color: #333; }}
            .plan-info {{ background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }}
            .cta-button {{ display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">{makerspace_name}</div>
                <h1>You're Invited!</h1>
            </div>
            
            <div class="content">
                <p>Hello!</p>
                
                <p>You've been invited to join <strong>{makerspace_name}</strong>, our innovative makerspace community where creativity meets technology.</p>
                
                {f'<p style="font-style: italic; background-color: #fffbeb; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">"{custom_message}"</p>' if custom_message else ''}
                
                <div class="plan-info">
                    <h3 style="margin-top: 0; color: #2563eb;">Your Membership Plan</h3>
                    <p><strong>{plan_name}</strong></p>
                    <p>This plan gives you access to our state-of-the-art equipment, collaborative workspace, and vibrant maker community.</p>
                </div>
                
                <p>To complete your registration and activate your membership, click the button below:</p>
                
                <div style="text-align: center;">
                    <a href="{invite_url}" class="cta-button">Accept Invitation</a>
                </div>
                
                <p><small>If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="{invite_url}">{invite_url}</a></small></p>
                
                <p>This invitation will expire in 7 days, so be sure to complete your registration soon!</p>
                
                <p>We're excited to welcome you to our community of makers, creators, and innovators.</p>
                
                <p>Best regards,<br>
                The {makerspace_name} Team</p>
            </div>
            
            <div class="footer">
                <p>This invitation was sent to {email}. If you believe you received this email in error, please ignore it.</p>
                <p>&copy; {datetime.now().year} {makerspace_name}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
You're invited to join {makerspace_name}!

Hello!

You've been invited to join {makerspace_name}, our innovative makerspace community where creativity meets technology.

{f'Personal message: "{custom_message}"' if custom_message else ''}

Your Membership Plan: {plan_name}
This plan gives you access to our state-of-the-art equipment, collaborative workspace, and vibrant maker community.

To complete your registration and activate your membership, visit:
{invite_url}

This invitation will expire in 7 days, so be sure to complete your registration soon!

We're excited to welcome you to our community of makers, creators, and innovators.

Best regards,
The {makerspace_name} Team

---
This invitation was sent to {email}. If you believe you received this email in error, please ignore it.
© {datetime.now().year} {makerspace_name}. All rights reserved.
    """
    
    return email_service.send_email(email, subject, html_body, text_body)

def send_member_welcome_email(
    email: str, 
    first_name: str, 
    plan_name: str,
    makerspace_name: str = "MakrCave"
) -> bool:
    """Send welcome email to new member"""
    
    subject = f"Welcome to {makerspace_name}, {first_name}!"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Welcome to {makerspace_name}</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .logo {{ font-size: 28px; font-weight: bold; color: #2563eb; }}
            .content {{ line-height: 1.6; color: #333; }}
            .plan-info {{ background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }}
            .next-steps {{ background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }}
            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">{makerspace_name}</div>
                <h1>Welcome, {first_name}! 🎉</h1>
            </div>
            
            <div class="content">
                <p>Congratulations and welcome to {makerspace_name}!</p>
                
                <p>We're thrilled to have you join our community of makers, creators, and innovators. Your membership is now active and you're ready to start bringing your ideas to life.</p>
                
                <div class="plan-info">
                    <h3 style="margin-top: 0; color: #2563eb;">Your Membership</h3>
                    <p><strong>{plan_name}</strong></p>
                    <p>Your membership gives you access to our state-of-the-art equipment, collaborative workspace, and supportive community.</p>
                </div>
                
                <div class="next-steps">
                    <h3 style="margin-top: 0;">Next Steps</h3>
                    <ul>
                        <li><strong>Complete your profile:</strong> Add your skills and interests to connect with like-minded makers</li>
                        <li><strong>Book an orientation:</strong> Schedule a facility tour and equipment training session</li>
                        <li><strong>Start your first project:</strong> Browse our project templates or upload your own ideas</li>
                        <li><strong>Join the community:</strong> Introduce yourself in our member forums</li>
                    </ul>
                </div>
                
                <h3>What's Included</h3>
                <ul>
                    <li>Access to 3D printers, laser cutters, and other maker equipment</li>
                    <li>Collaborative workspace and meeting rooms</li>
                    <li>Expert staff support and training sessions</li>
                    <li>Community events and workshops</li>
                    <li>Online project management tools</li>
                </ul>
                
                <h3>Need Help?</h3>
                <p>Our team is here to help you make the most of your membership. If you have any questions or need assistance, don't hesitate to reach out to us.</p>
                
                <p>We can't wait to see what you'll create!</p>
                
                <p>Happy making,<br>
                The {makerspace_name} Team</p>
            </div>
            
            <div class="footer">
                <p>This email was sent to {email} as part of your {makerspace_name} membership.</p>
                <p>&copy; {datetime.now().year} {makerspace_name}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
Welcome to {makerspace_name}, {first_name}!

Congratulations and welcome to {makerspace_name}!

We're thrilled to have you join our community of makers, creators, and innovators. Your membership is now active and you're ready to start bringing your ideas to life.

Your Membership: {plan_name}
Your membership gives you access to our state-of-the-art equipment, collaborative workspace, and supportive community.

Next Steps:
- Complete your profile: Add your skills and interests to connect with like-minded makers
- Book an orientation: Schedule a facility tour and equipment training session
- Start your first project: Browse our project templates or upload your own ideas
- Join the community: Introduce yourself in our member forums

What's Included:
- Access to 3D printers, laser cutters, and other maker equipment
- Collaborative workspace and meeting rooms
- Expert staff support and training sessions
- Community events and workshops
- Online project management tools

Need Help?
Our team is here to help you make the most of your membership. If you have any questions or need assistance, don't hesitate to reach out to us.

We can't wait to see what you'll create!

Happy making,
The {makerspace_name} Team

---
This email was sent to {email} as part of your {makerspace_name} membership.
© {datetime.now().year} {makerspace_name}. All rights reserved.
    """
    
    return email_service.send_email(email, subject, html_body, text_body)

def send_membership_expiry_reminder(
    email: str, 
    first_name: str, 
    days_until_expiry: int,
    plan_name: str,
    makerspace_name: str = "MakrCave"
) -> bool:
    """Send membership expiry reminder email"""
    
    if days_until_expiry <= 0:
        subject = f"Your {makerspace_name} membership has expired"
        urgency_text = "has expired"
        action_text = "Renew now to restore your access"
    elif days_until_expiry <= 7:
        subject = f"Your {makerspace_name} membership expires in {days_until_expiry} days"
        urgency_text = f"expires in {days_until_expiry} days"
        action_text = "Renew now to avoid interruption"
    else:
        subject = f"Reminder: Your {makerspace_name} membership expires soon"
        urgency_text = f"expires in {days_until_expiry} days"
        action_text = "Consider renewing early"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Membership Renewal Reminder</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .logo {{ font-size: 28px; font-weight: bold; color: #2563eb; }}
            .content {{ line-height: 1.6; color: #333; }}
            .warning {{ background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }}
            .cta-button {{ display: inline-block; padding: 12px 30px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">{makerspace_name}</div>
                <h1>Membership Renewal Reminder</h1>
            </div>
            
            <div class="content">
                <p>Hi {first_name},</p>
                
                <div class="warning">
                    <h3 style="margin-top: 0;">⚠️ Your {plan_name} membership {urgency_text}</h3>
                    <p>{action_text} to continue enjoying all the benefits of {makerspace_name}.</p>
                </div>
                
                <p>We hope you've been enjoying your time at {makerspace_name} and all the amazing projects you've been able to create with access to our equipment and community.</p>
                
                <h3>Don't let your creativity stop!</h3>
                <p>Renewing your membership ensures you'll continue to have:</p>
                <ul>
                    <li>Unlimited access to our maker equipment</li>
                    <li>Use of our collaborative workspace</li>
                    <li>Support from our expert staff</li>
                    <li>Participation in community events and workshops</li>
                    <li>Access to online project management tools</li>
                </ul>
                
                <div style="text-align: center;">
                    <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/billing/renew" class="cta-button">Renew Membership</a>
                </div>
                
                <p>If you have any questions about your membership or need assistance with renewal, please don't hesitate to contact us. We're here to help!</p>
                
                <p>Thank you for being part of our maker community.</p>
                
                <p>Best regards,<br>
                The {makerspace_name} Team</p>
            </div>
            
            <div class="footer">
                <p>This reminder was sent to {email} regarding your {makerspace_name} membership.</p>
                <p>&copy; {datetime.now().year} {makerspace_name}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return email_service.send_email(email, subject, html_body)

def send_membership_suspended_email(
    email: str, 
    first_name: str, 
    reason: str,
    makerspace_name: str = "MakrCave"
) -> bool:
    """Send membership suspension notification email"""
    
    subject = f"Important: Your {makerspace_name} membership has been suspended"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Membership Suspension Notice</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .logo {{ font-size: 28px; font-weight: bold; color: #2563eb; }}
            .content {{ line-height: 1.6; color: #333; }}
            .suspension-notice {{ background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }}
            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">{makerspace_name}</div>
                <h1>Membership Suspension Notice</h1>
            </div>
            
            <div class="content">
                <p>Dear {first_name},</p>
                
                <div class="suspension-notice">
                    <h3 style="margin-top: 0; color: #dc2626;">Your membership has been suspended</h3>
                    <p><strong>Reason:</strong> {reason}</p>
                </div>
                
                <p>Your access to {makerspace_name} facilities and services has been temporarily suspended. This means you will not be able to:</p>
                <ul>
                    <li>Access the makerspace facilities</li>
                    <li>Use equipment or tools</li>
                    <li>Make new reservations</li>
                    <li>Participate in workshops or events</li>
                </ul>
                
                <h3>What happens next?</h3>
                <p>If you believe this suspension was made in error or would like to discuss the situation, please contact our team immediately. We're committed to working with our members to resolve any issues.</p>
                
                <p>To discuss your membership status or appeal this decision, please contact us at:</p>
                <ul>
                    <li>Email: support@{makerspace_name.lower().replace(' ', '')}.com</li>
                    <li>Phone: [Contact Number]</li>
                    <li>In person during business hours</li>
                </ul>
                
                <p>We value you as a member of our community and hope to resolve this matter promptly.</p>
                
                <p>Sincerely,<br>
                The {makerspace_name} Team</p>
            </div>
            
            <div class="footer">
                <p>This notice was sent to {email} regarding your {makerspace_name} membership.</p>
                <p>&copy; {datetime.now().year} {makerspace_name}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return email_service.send_email(email, subject, html_body)
