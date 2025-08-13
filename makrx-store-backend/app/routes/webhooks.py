"""Webhook API routes for payment processing"""
import os
import json
import hmac
import hashlib
import logging
from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, Request, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.db import get_db
from app.schemas import MessageResponse
from app.models.commerce import Order

logger = logging.getLogger(__name__)
router = APIRouter()

def verify_stripe_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify Stripe webhook signature"""
    try:
        expected_sig = hmac.new(
            secret.encode('utf-8'),
            payload,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(f"sha256={expected_sig}", signature)
    except Exception:
        return False

def verify_razorpay_signature(payload: str, signature: str, secret: str) -> bool:
    """Verify Razorpay webhook signature"""
    try:
        expected_sig = hmac.new(
            secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected_sig, signature)
    except Exception:
        return False

@router.post("/stripe", response_model=MessageResponse)
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhook events"""
    try:
        payload = await request.body()
        signature = request.headers.get('stripe-signature', '')
        
        # Verify signature
        if not verify_stripe_signature(
            payload, 
            signature, 
            settings.STRIPE_WEBHOOK_SECRET
        ):
            logger.warning("Invalid Stripe webhook signature")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid signature"
            )
        
        # Parse event
        event = json.loads(payload.decode('utf-8'))
        event_type = event.get('type', '')
        
        logger.info(f"Processing Stripe webhook: {event_type}")
        
        if event_type == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            order_id = payment_intent.get('metadata', {}).get('order_id')
            
            if order_id:
                # Update order status
                order = db.query(Order).filter(Order.id == order_id).first()
                if order:
                    order.status = 'paid'
                    order.payment_status = 'completed'
                    order.paid_at = datetime.utcnow()
                    order.payment_intent_id = payment_intent['id']
                    
                    # Update order metadata
                    order.metadata = order.metadata or {}
                    order.metadata.update({
                        'stripe_payment_intent': payment_intent['id'],
                        'payment_method': payment_intent.get('payment_method'),
                        'amount_paid': payment_intent['amount_received'] / 100
                    })
                    
                    db.commit()
                    logger.info(f"Order {order_id} marked as paid")
                    
                    # TODO: Trigger service order processing if applicable
                    # await process_service_order(order, db)
        
        elif event_type == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            order_id = payment_intent.get('metadata', {}).get('order_id')
            
            if order_id:
                order = db.query(Order).filter(Order.id == order_id).first()
                if order:
                    order.payment_status = 'failed'
                    order.metadata = order.metadata or {}
                    order.metadata.update({
                        'payment_failure_reason': payment_intent.get('last_payment_error', {}).get('message', 'Unknown')
                    })
                    db.commit()
                    logger.info(f"Order {order_id} payment failed")
        
        return MessageResponse(message=f"Stripe webhook {event_type} processed successfully")
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON in Stripe webhook")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )
    except Exception as e:
        logger.error(f"Error processing Stripe webhook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook processing failed"
        )

@router.post("/razorpay", response_model=MessageResponse)
async def razorpay_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Razorpay webhook events"""
    try:
        payload_bytes = await request.body()
        payload = payload_bytes.decode('utf-8')
        signature = request.headers.get('x-razorpay-signature', '')
        
        # Verify signature
        if not verify_razorpay_signature(
            payload,
            signature,
            settings.RAZORPAY_WEBHOOK_SECRET
        ):
            logger.warning("Invalid Razorpay webhook signature")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid signature"
            )
        
        # Parse event
        event = json.loads(payload)
        event_type = event.get('event', '')
        
        logger.info(f"Processing Razorpay webhook: {event_type}")
        
        if event_type == 'payment.captured':
            payment = event['payload']['payment']['entity']
            order_id = payment.get('notes', {}).get('order_id')
            
            if order_id:
                # Update order status
                order = db.query(Order).filter(Order.id == order_id).first()
                if order:
                    order.status = 'paid'
                    order.payment_status = 'completed'
                    order.paid_at = datetime.utcnow()
                    order.payment_intent_id = payment['id']
                    
                    # Update order metadata
                    order.metadata = order.metadata or {}
                    order.metadata.update({
                        'razorpay_payment_id': payment['id'],
                        'razorpay_order_id': payment.get('order_id'),
                        'payment_method': payment.get('method'),
                        'amount_paid': payment['amount'] / 100  # Convert paise to rupees
                    })
                    
                    db.commit()
                    logger.info(f"Order {order_id} marked as paid")
                    
                    # TODO: Trigger service order processing if applicable
                    # await process_service_order(order, db)
        
        elif event_type == 'payment.failed':
            payment = event['payload']['payment']['entity']
            order_id = payment.get('notes', {}).get('order_id')
            
            if order_id:
                order = db.query(Order).filter(Order.id == order_id).first()
                if order:
                    order.payment_status = 'failed'
                    order.metadata = order.metadata or {}
                    order.metadata.update({
                        'payment_failure_reason': payment.get('error_description', 'Unknown'),
                        'error_code': payment.get('error_code')
                    })
                    db.commit()
                    logger.info(f"Order {order_id} payment failed")
        
        return MessageResponse(message=f"Razorpay webhook {event_type} processed successfully")
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON in Razorpay webhook")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )
    except Exception as e:
        logger.error(f"Error processing Razorpay webhook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook processing failed"
        )

# TODO: Add order processing function that triggers service orders
async def process_service_order(order: Order, db: Session):
    """Process service orders after payment confirmation"""
    # This will be implemented when bridge services are added
    pass
