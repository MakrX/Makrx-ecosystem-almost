#!/usr/bin/env python3
"""
MakrX Event Service - Real-time Status Synchronization
WebSocket and event-driven communication between services
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Set
from datetime import datetime
from uuid import uuid4
from pydantic import BaseModel, Field
from enum import Enum
import httpx
import os
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
MAKRCAVE_API_URL = os.getenv("MAKRCAVE_API_URL", "http://makrcave-backend:8000")
STORE_API_URL = os.getenv("STORE_API_URL", "http://makrx-store-backend:8000")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8000")

# Event Types
class EventType(str, Enum):
    # Order Events
    ORDER_CREATED = "order.created"
    ORDER_UPDATED = "order.updated"
    ORDER_PAYMENT_RECEIVED = "order.payment_received"
    ORDER_SHIPPED = "order.shipped"
    ORDER_DELIVERED = "order.delivered"
    ORDER_CANCELLED = "order.cancelled"
    
    # Service Order Events
    SERVICE_ORDER_CREATED = "service_order.created"
    SERVICE_ORDER_QUOTED = "service_order.quoted"
    SERVICE_ORDER_DISPATCHED = "service_order.dispatched"
    SERVICE_ORDER_ACCEPTED = "service_order.accepted"
    SERVICE_ORDER_IN_PROGRESS = "service_order.in_progress"
    SERVICE_ORDER_COMPLETED = "service_order.completed"
    SERVICE_ORDER_FAILED = "service_order.failed"
    
    # Job Events
    JOB_ASSIGNED = "job.assigned"
    JOB_STARTED = "job.started"
    JOB_PROGRESS_UPDATE = "job.progress_update"
    JOB_COMPLETED = "job.completed"
    JOB_FAILED = "job.failed"
    
    # Inventory Events
    INVENTORY_LOW_STOCK = "inventory.low_stock"
    INVENTORY_OUT_OF_STOCK = "inventory.out_of_stock"
    INVENTORY_RESTOCKED = "inventory.restocked"
    
    # Equipment Events
    EQUIPMENT_RESERVED = "equipment.reserved"
    EQUIPMENT_AVAILABLE = "equipment.available"
    EQUIPMENT_MAINTENANCE = "equipment.maintenance"
    
    # User Events
    USER_REGISTERED = "user.registered"
    USER_LOGIN = "user.login"
    USER_LOGOUT = "user.logout"
    
    # BOM Events
    BOM_EXPORTED_TO_CART = "bom.exported_to_cart"
    BOM_CART_PROCESSED = "bom.cart_processed"

class EventPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"

# Pydantic Models
class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    type: EventType
    source_service: str
    target_services: List[str] = []
    user_id: Optional[str] = None
    payload: Dict[str, Any]
    priority: EventPriority = EventPriority.NORMAL
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    retry_count: int = 0
    max_retries: int = 3

class WebSocketConnection(BaseModel):
    websocket: WebSocket
    user_id: Optional[str] = None
    subscriptions: Set[EventType] = Field(default_factory=set)
    connection_id: str = Field(default_factory=lambda: str(uuid4()))
    connected_at: datetime = Field(default_factory=datetime.utcnow)

class EventSubscription(BaseModel):
    user_id: Optional[str] = None
    event_types: List[EventType]
    webhook_url: Optional[str] = None
    filters: Dict[str, Any] = Field(default_factory=dict)

# Global state
active_connections: Dict[str, WebSocketConnection] = {}
event_subscriptions: Dict[str, EventSubscription] = {}
event_queue: asyncio.Queue = asyncio.Queue()
http_client: Optional[httpx.AsyncClient] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global http_client
    http_client = httpx.AsyncClient(timeout=30.0)
    
    # Start event processor
    asyncio.create_task(process_event_queue())
    
    logger.info("Event Service started")
    yield
    
    await http_client.aclose()
    logger.info("Event Service shutdown")

# FastAPI app
app = FastAPI(
    title="MakrX Event Service",
    description="Real-time Status Synchronization for MakrX Ecosystem",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration - Secure origins only
production_origins = [
    "https://makrx.org",
    "https://makrcave.com",
    "https://makrx.store",
    "wss://makrx.org",
    "wss://makrcave.com",
    "wss://makrx.store"
]

development_origins = [
    "http://localhost:3000",  # Gateway
    "http://localhost:3001",  # MakrCave
    "http://localhost:3002",  # Store
    "http://localhost:3003",  # Store (current)
    "ws://localhost:3000",
    "ws://localhost:3001",
    "ws://localhost:3002",
    "ws://localhost:3003",
    "http://gateway-frontend:3000",
    "http://makrcave-frontend:3001",
    "http://makrx-store-frontend:3002"
]

allowed_origins = production_origins.copy()
if os.getenv("ENVIRONMENT") == "development":
    allowed_origins.extend(development_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With"
    ],
)

# Health Check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "makrx-event-service",
        "timestamp": datetime.utcnow().isoformat(),
        "active_connections": len(active_connections),
        "pending_events": event_queue.qsize()
    }

# WebSocket Connection Management
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()
    
    connection = WebSocketConnection(
        websocket=websocket,
        user_id=user_id
    )
    
    active_connections[connection.connection_id] = connection
    logger.info(f"WebSocket connected: {user_id} ({connection.connection_id})")
    
    try:
        while True:
            # Listen for subscription updates from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "subscribe":
                event_types = message.get("event_types", [])
                connection.subscriptions.update(EventType(et) for et in event_types)
                logger.info(f"User {user_id} subscribed to: {event_types}")
                
                await websocket.send_text(json.dumps({
                    "type": "subscription_confirmed",
                    "event_types": list(connection.subscriptions),
                    "timestamp": datetime.utcnow().isoformat()
                }))
            
            elif message.get("type") == "unsubscribe":
                event_types = message.get("event_types", [])
                for et in event_types:
                    connection.subscriptions.discard(EventType(et))
                logger.info(f"User {user_id} unsubscribed from: {event_types}")
                
                await websocket.send_text(json.dumps({
                    "type": "unsubscription_confirmed",
                    "event_types": event_types,
                    "timestamp": datetime.utcnow().isoformat()
                }))
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {user_id} ({connection.connection_id})")
    except Exception as e:
        logger.error(f"WebSocket error for {user_id}: {e}")
    finally:
        if connection.connection_id in active_connections:
            del active_connections[connection.connection_id]

# Event Publishing
@app.post("/events/publish")
async def publish_event(event: Event, background_tasks: BackgroundTasks):
    """Publish an event to the system"""
    try:
        # Add to processing queue
        await event_queue.put(event)
        
        logger.info(f"Event published: {event.type} from {event.source_service}")
        
        return {
            "success": True,
            "event_id": event.id,
            "message": "Event published successfully"
        }
        
    except Exception as e:
        logger.error(f"Event publishing error: {e}")
        raise HTTPException(status_code=500, detail="Failed to publish event")

# Event Processing
async def process_event_queue():
    """Background task to process events from queue"""
    logger.info("Event processor started")
    
    while True:
        try:
            # Get event from queue
            event = await event_queue.get()
            
            # Process event
            await process_event(event)
            
            # Mark task as done
            event_queue.task_done()
            
        except Exception as e:
            logger.error(f"Event processing error: {e}")
            await asyncio.sleep(1)  # Brief pause on error

async def process_event(event: Event):
    """Process a single event"""
    try:
        # Send to WebSocket subscribers
        await broadcast_to_websockets(event)
        
        # Send to target services
        await send_to_services(event)
        
        # Send webhook notifications
        await send_webhook_notifications(event)
        
        logger.info(f"Processed event: {event.type} ({event.id})")
        
    except Exception as e:
        logger.error(f"Error processing event {event.id}: {e}")
        
        # Retry logic
        if event.retry_count < event.max_retries:
            event.retry_count += 1
            await asyncio.sleep(2 ** event.retry_count)  # Exponential backoff
            await event_queue.put(event)

async def broadcast_to_websockets(event: Event):
    """Broadcast event to WebSocket connections"""
    if not active_connections:
        return
    
    # Prepare WebSocket message
    message = {
        "type": "event",
        "event_type": event.type.value,
        "event_id": event.id,
        "source": event.source_service,
        "payload": event.payload,
        "timestamp": event.timestamp.isoformat()
    }
    
    message_json = json.dumps(message)
    disconnected_connections = []
    
    # Send to all subscribed connections
    for connection_id, connection in active_connections.items():
        try:
            # Check if user is subscribed to this event type
            if event.type in connection.subscriptions:
                # Check if event is for this user or is a global event
                if (event.user_id is None or 
                    event.user_id == connection.user_id):
                    
                    await connection.websocket.send_text(message_json)
                    
        except Exception as e:
            logger.error(f"WebSocket send error for {connection_id}: {e}")
            disconnected_connections.append(connection_id)
    
    # Clean up disconnected connections
    for connection_id in disconnected_connections:
        if connection_id in active_connections:
            del active_connections[connection_id]

async def send_to_services(event: Event):
    """Send event to target services"""
    if not event.target_services:
        return
    
    for service in event.target_services:
        try:
            service_url = get_service_url(service)
            if service_url:
                async with http_client.post(
                    f"{service_url}/events/receive",
                    json=event.dict(),
                    timeout=10.0
                ) as response:
                    if response.status_code != 200:
                        logger.warning(f"Service {service} returned {response.status_code}")
                        
        except Exception as e:
            logger.error(f"Error sending event to service {service}: {e}")

async def send_webhook_notifications(event: Event):
    """Send webhook notifications for subscribed events"""
    for subscription in event_subscriptions.values():
        try:
            if (event.type in subscription.event_types and
                subscription.webhook_url and
                event_matches_filters(event, subscription.filters)):
                
                webhook_payload = {
                    "event_id": event.id,
                    "event_type": event.type.value,
                    "source_service": event.source_service,
                    "timestamp": event.timestamp.isoformat(),
                    "payload": event.payload
                }
                
                async with http_client.post(
                    subscription.webhook_url,
                    json=webhook_payload,
                    timeout=10.0
                ) as response:
                    if response.status_code not in [200, 202]:
                        logger.warning(f"Webhook {subscription.webhook_url} returned {response.status_code}")
                        
        except Exception as e:
            logger.error(f"Webhook notification error: {e}")

def get_service_url(service: str) -> Optional[str]:
    """Get service URL for event delivery"""
    service_urls = {
        "makrcave": MAKRCAVE_API_URL,
        "store": STORE_API_URL,
        "auth": AUTH_SERVICE_URL
    }
    return service_urls.get(service)

def event_matches_filters(event: Event, filters: Dict[str, Any]) -> bool:
    """Check if event matches subscription filters"""
    if not filters:
        return True
    
    # Simple filter matching - can be extended
    for key, value in filters.items():
        if key in event.payload and event.payload[key] != value:
            return False
    
    return True

# Subscription Management
@app.post("/subscriptions")
async def create_subscription(subscription: EventSubscription):
    """Create event subscription"""
    subscription_id = str(uuid4())
    event_subscriptions[subscription_id] = subscription
    
    logger.info(f"Created subscription {subscription_id} for events: {subscription.event_types}")
    
    return {
        "subscription_id": subscription_id,
        "event_types": subscription.event_types,
        "webhook_url": subscription.webhook_url
    }

@app.delete("/subscriptions/{subscription_id}")
async def delete_subscription(subscription_id: str):
    """Delete event subscription"""
    if subscription_id in event_subscriptions:
        del event_subscriptions[subscription_id]
        logger.info(f"Deleted subscription {subscription_id}")
        return {"message": "Subscription deleted"}
    else:
        raise HTTPException(status_code=404, detail="Subscription not found")

# Convenience endpoints for common events
@app.post("/events/order-update")
async def publish_order_update(
    order_id: str,
    status: str,
    user_id: str,
    details: Dict[str, Any] = None
):
    """Publish order status update event"""
    event = Event(
        type=EventType.ORDER_UPDATED,
        source_service="store",
        target_services=["makrcave"],
        user_id=user_id,
        payload={
            "order_id": order_id,
            "status": status,
            "details": details or {}
        }
    )
    
    await event_queue.put(event)
    return {"message": "Order update event published"}

@app.post("/events/job-status")
async def publish_job_status(
    job_id: str,
    service_order_id: str,
    status: str,
    provider_id: str,
    user_id: str,
    progress: Dict[str, Any] = None
):
    """Publish job status update event"""
    event = Event(
        type=EventType.JOB_PROGRESS_UPDATE,
        source_service="makrcave",
        target_services=["store"],
        user_id=user_id,
        payload={
            "job_id": job_id,
            "service_order_id": service_order_id,
            "status": status,
            "provider_id": provider_id,
            "progress": progress or {}
        }
    )
    
    await event_queue.put(event)
    return {"message": "Job status event published"}

@app.post("/events/bom-export")
async def publish_bom_export(
    project_id: str,
    user_id: str,
    exported_items: int,
    cart_url: str
):
    """Publish BOM export to cart event"""
    event = Event(
        type=EventType.BOM_EXPORTED_TO_CART,
        source_service="makrcave",
        target_services=["store"],
        user_id=user_id,
        payload={
            "project_id": project_id,
            "exported_items": exported_items,
            "cart_url": cart_url
        }
    )
    
    await event_queue.put(event)
    return {"message": "BOM export event published"}

# Event receiver for services
@app.post("/events/receive")
async def receive_event(event: Event):
    """Receive event from another service"""
    logger.info(f"Received event: {event.type} from {event.source_service}")
    
    # Process the received event
    await process_event(event)
    
    return {"message": "Event received and processed"}

# Statistics
@app.get("/stats")
async def get_event_stats():
    """Get event service statistics"""
    return {
        "active_connections": len(active_connections),
        "pending_events": event_queue.qsize(),
        "subscriptions": len(event_subscriptions),
        "service_endpoints": {
            "makrcave": MAKRCAVE_API_URL,
            "store": STORE_API_URL,
            "auth": AUTH_SERVICE_URL
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
