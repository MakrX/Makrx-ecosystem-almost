#!/usr/bin/env python3
"""
Service Orders Routes - Handle 3D printing service orders and job routing
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_
from typing import List, Dict, Any, Optional
import httpx
import logging
import os
import json
from uuid import UUID, uuid4
from datetime import datetime, timedelta
from pydantic import BaseModel, Field, EmailStr
from enum import Enum

from ..core.db import get_db
from ..core.storage import upload_file_to_storage, generate_presigned_url
from ..models.commerce import Order, OrderItem, Product
from ..schemas.commerce import OrderResponse

logger = logging.getLogger(__name__)

# Configuration
MAKRCAVE_API_URL = os.getenv("MAKRCAVE_API_URL", "http://makrcave-backend:8000")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8000")

router = APIRouter(prefix="/service-orders", tags=["3D Printing Service Orders"])

# Enums
class ServiceOrderStatus(str, Enum):
    PENDING_QUOTE = "pending_quote"
    QUOTED = "quoted" 
    PAYMENT_PENDING = "payment_pending"
    PAID = "paid"
    DISPATCHED = "dispatched"
    IN_PRODUCTION = "in_production"
    COMPLETED = "completed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    FAILED = "failed"

class JobPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class PrintMaterial(str, Enum):
    PLA = "pla"
    ABS = "abs"
    PETG = "petg"
    TPU = "tpu"
    WOOD_PLA = "wood_pla"
    CARBON_FIBER = "carbon_fiber"

class PrintQuality(str, Enum):
    DRAFT = "draft"      # 0.3mm
    STANDARD = "standard"  # 0.2mm
    HIGH = "high"        # 0.15mm
    ULTRA = "ultra"      # 0.1mm

# Pydantic Models
class FileAnalysis(BaseModel):
    filename: str
    file_size: int
    dimensions: Dict[str, float]  # {x, y, z} in mm
    volume: float  # cubic cm
    surface_area: float  # square cm
    estimated_print_time: int  # minutes
    estimated_material_weight: float  # grams
    complexity_score: float  # 0-1 scale
    supports_required: bool
    issues: List[str] = []

class ServiceQuoteRequest(BaseModel):
    file_urls: List[str] = Field(..., description="URLs of uploaded 3D files")
    material: PrintMaterial = Field(default=PrintMaterial.PLA)
    quality: PrintQuality = Field(default=PrintQuality.STANDARD)
    quantity: int = Field(default=1, ge=1, le=100)
    priority: JobPriority = Field(default=JobPriority.NORMAL)
    notes: Optional[str] = None
    user_email: EmailStr
    delivery_address: Optional[Dict[str, str]] = None
    preferred_provider: Optional[str] = None

class ServiceQuoteResponse(BaseModel):
    quote_id: str
    total_price: float
    currency: str = "INR"
    estimated_delivery: datetime
    breakdown: Dict[str, Any]
    file_analyses: List[FileAnalysis]
    available_providers: List[Dict[str, Any]]
    expires_at: datetime

class ServiceOrderRequest(BaseModel):
    quote_id: str
    payment_method: str = "stripe"
    billing_address: Dict[str, str]
    shipping_address: Dict[str, str]
    special_instructions: Optional[str] = None

class ServiceOrderResponse(BaseModel):
    order_id: str
    service_order_id: str
    status: ServiceOrderStatus
    total_amount: float
    estimated_delivery: datetime
    tracking_info: Optional[Dict[str, Any]] = None
    provider_info: Optional[Dict[str, Any]] = None
    job_details: Optional[Dict[str, Any]] = None

class ProviderJobRequest(BaseModel):
    job_id: str
    service_order_id: str
    customer_email: str
    files: List[Dict[str, Any]]
    specifications: Dict[str, Any]
    quantity: int
    priority: JobPriority
    estimated_value: float
    deadline: datetime
    special_instructions: Optional[str] = None

# HTTP Client for MakrCave API
async def get_makrcave_client() -> httpx.AsyncClient:
    """Get HTTP client for MakrCave API calls"""
    return httpx.AsyncClient(
        base_url=MAKRCAVE_API_URL,
        timeout=30.0,
        headers={"Content-Type": "application/json"}
    )

@router.post("/upload", response_model=Dict[str, Any])
async def upload_3d_files(
    files: List[UploadFile] = File(...),
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Upload 3D files for service quote
    
    Handles STL, OBJ, 3MF files and performs basic analysis
    """
    try:
        uploaded_files = []
        
        for file in files:
            # Validate file type
            allowed_extensions = ['.stl', '.obj', '.3mf', '.ply']
            file_extension = os.path.splitext(file.filename)[1].lower()
            
            if file_extension not in allowed_extensions:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file type: {file_extension}. Allowed: {', '.join(allowed_extensions)}"
                )
            
            # Upload to storage
            file_url = await upload_file_to_storage(
                file.file,
                file.filename,
                "3d-uploads"
            )
            
            # Schedule file analysis
            background_tasks.add_task(
                analyze_3d_file,
                file_url,
                file.filename,
                file.size
            )
            
            uploaded_files.append({
                "filename": file.filename,
                "url": file_url,
                "size": file.size,
                "status": "uploaded"
            })
        
        return {
            "success": True,
            "message": f"Uploaded {len(uploaded_files)} files",
            "files": uploaded_files
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File upload error: {e}")
        raise HTTPException(status_code=500, detail="File upload failed")

@router.post("/quote", response_model=ServiceQuoteResponse)
async def generate_service_quote(
    quote_request: ServiceQuoteRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Generate quote for 3D printing service
    
    Analyzes files, calculates pricing, and finds available providers
    """
    try:
        quote_id = str(uuid4())
        
        # Analyze uploaded files
        file_analyses = []
        total_volume = 0
        total_print_time = 0
        supports_required = False
        
        for file_url in quote_request.file_urls:
            analysis = await analyze_3d_file_from_url(file_url)
            if analysis:
                file_analyses.append(analysis)
                total_volume += analysis.volume
                total_print_time += analysis.estimated_print_time
                supports_required = supports_required or analysis.supports_required
        
        if not file_analyses:
            raise HTTPException(status_code=400, detail="No valid 3D files found")
        
        # Calculate pricing
        pricing = calculate_service_pricing(
            total_volume,
            total_print_time,
            quote_request.material,
            quote_request.quality,
            quote_request.quantity,
            quote_request.priority,
            supports_required
        )
        
        # Find available providers
        providers = await find_available_providers(
            total_volume,
            quote_request.material,
            quote_request.quality,
            quote_request.quantity,
            quote_request.preferred_provider
        )
        
        if not providers:
            raise HTTPException(
                status_code=404,
                detail="No available providers found for this job"
            )
        
        # Calculate delivery estimate
        base_delivery_days = 3 if quote_request.priority == JobPriority.URGENT else 7
        estimated_delivery = datetime.utcnow() + timedelta(days=base_delivery_days)
        
        # Store quote in cache/database
        quote_data = {
            "quote_id": quote_id,
            "request": quote_request.dict(),
            "file_analyses": [fa.dict() for fa in file_analyses],
            "pricing": pricing,
            "providers": providers,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
        }
        
        # TODO: Store in Redis or database
        await store_quote(quote_id, quote_data)
        
        return ServiceQuoteResponse(
            quote_id=quote_id,
            total_price=pricing["total"],
            estimated_delivery=estimated_delivery,
            breakdown=pricing,
            file_analyses=file_analyses,
            available_providers=providers,
            expires_at=datetime.utcnow() + timedelta(hours=24)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Quote generation error: {e}")
        raise HTTPException(status_code=500, detail="Quote generation failed")

@router.post("/order", response_model=ServiceOrderResponse)
async def create_service_order(
    order_request: ServiceOrderRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Create service order from quote and dispatch to provider
    """
    try:
        # Retrieve quote
        quote_data = await get_quote(order_request.quote_id)
        if not quote_data:
            raise HTTPException(status_code=404, detail="Quote not found or expired")
        
        # Create main order record
        order_id = str(uuid4())
        service_order_id = str(uuid4())
        
        order = Order(
            id=order_id,
            user_email=quote_data["request"]["user_email"],
            status="pending_payment",
            currency="INR",
            subtotal=quote_data["pricing"]["subtotal"],
            tax_amount=quote_data["pricing"]["tax"],
            shipping_amount=quote_data["pricing"]["shipping"],
            total_amount=quote_data["pricing"]["total"],
            billing_address=json.dumps(order_request.billing_address),
            shipping_address=json.dumps(order_request.shipping_address),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(order)
        
        # Create order item for the service
        order_item = OrderItem(
            id=str(uuid4()),
            order_id=order_id,
            product_name="3D Printing Service",
            quantity=quote_data["request"]["quantity"],
            unit_price=quote_data["pricing"]["base_price"],
            line_total=quote_data["pricing"]["total"],
            metadata=json.dumps({
                "service_order_id": service_order_id,
                "quote_id": order_request.quote_id,
                "material": quote_data["request"]["material"],
                "quality": quote_data["request"]["quality"],
                "files": quote_data["request"]["file_urls"]
            }),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(order_item)
        db.commit()
        
        # Dispatch job to MakrCave providers
        job_dispatch_result = await dispatch_job_to_providers(
            service_order_id,
            quote_data,
            order_request
        )
        
        if not job_dispatch_result["success"]:
            # Rollback order if job dispatch fails
            db.delete(order_item)
            db.delete(order)
            db.commit()
            raise HTTPException(
                status_code=500,
                detail="Failed to dispatch job to providers"
            )
        
        # Schedule order processing
        background_tasks.add_task(
            process_service_order_payment,
            service_order_id,
            order_id,
            quote_data["pricing"]["total"]
        )
        
        return ServiceOrderResponse(
            order_id=order_id,
            service_order_id=service_order_id,
            status=ServiceOrderStatus.PAYMENT_PENDING,
            total_amount=quote_data["pricing"]["total"],
            estimated_delivery=datetime.fromisoformat(quote_data["request"]["estimated_delivery"]) if "estimated_delivery" in quote_data["request"] else datetime.utcnow() + timedelta(days=7),
            provider_info=job_dispatch_result.get("provider"),
            job_details=job_dispatch_result.get("job_details")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Service order creation error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Service order creation failed")

@router.get("/order/{service_order_id}", response_model=ServiceOrderResponse)
async def get_service_order(
    service_order_id: str,
    db: Session = Depends(get_db)
):
    """Get service order status and details"""
    try:
        # Find order by service_order_id in metadata
        order_item = db.query(OrderItem).filter(
            OrderItem.metadata.contains(f'"service_order_id": "{service_order_id}"')
        ).first()
        
        if not order_item:
            raise HTTPException(status_code=404, detail="Service order not found")
        
        order = db.query(Order).filter(Order.id == order_item.order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        metadata = json.loads(order_item.metadata)
        
        # Get job status from MakrCave
        job_status = await get_job_status_from_makrcave(service_order_id)
        
        return ServiceOrderResponse(
            order_id=str(order.id),
            service_order_id=service_order_id,
            status=ServiceOrderStatus(order.status),
            total_amount=float(order.total_amount),
            estimated_delivery=order.created_at + timedelta(days=7),  # TODO: Get from job
            tracking_info=job_status.get("tracking_info"),
            provider_info=job_status.get("provider_info"),
            job_details=job_status.get("job_details")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Service order retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve service order")

# Helper Functions

async def analyze_3d_file(file_url: str, filename: str, file_size: int) -> FileAnalysis:
    """Analyze 3D file for printing requirements"""
    try:
        # This is a simplified analysis - in production, integrate with 3D analysis library
        # like Open3D, or external service like slicer API
        
        # Mock analysis for demonstration
        mock_analysis = FileAnalysis(
            filename=filename,
            file_size=file_size,
            dimensions={"x": 50.0, "y": 30.0, "z": 20.0},
            volume=25.5,  # cubic cm
            surface_area=85.2,  # square cm
            estimated_print_time=120,  # 2 hours
            estimated_material_weight=30.0,  # grams
            complexity_score=0.6,
            supports_required=True,
            issues=[]
        )
        
        # TODO: Implement actual file analysis
        # - Download file from storage
        # - Parse STL/OBJ geometry
        # - Calculate volume, surface area
        # - Detect overhangs requiring supports
        # - Estimate print time based on slicing
        
        return mock_analysis
        
    except Exception as e:
        logger.error(f"3D file analysis error: {e}")
        return None

async def analyze_3d_file_from_url(file_url: str) -> Optional[FileAnalysis]:
    """Analyze 3D file from URL"""
    try:
        # Extract filename from URL
        filename = file_url.split('/')[-1]
        
        # Mock file size - in production, get from storage metadata
        file_size = 1024 * 100  # 100KB
        
        return await analyze_3d_file(file_url, filename, file_size)
        
    except Exception as e:
        logger.error(f"File analysis from URL error: {e}")
        return None

def calculate_service_pricing(
    volume: float,
    print_time: int,
    material: PrintMaterial,
    quality: PrintQuality,
    quantity: int,
    priority: JobPriority,
    supports_required: bool
) -> Dict[str, float]:
    """Calculate 3D printing service pricing"""
    
    # Base pricing per cubic cm
    material_rates = {
        PrintMaterial.PLA: 0.50,
        PrintMaterial.ABS: 0.60,
        PrintMaterial.PETG: 0.70,
        PrintMaterial.TPU: 1.20,
        PrintMaterial.WOOD_PLA: 0.80,
        PrintMaterial.CARBON_FIBER: 2.00
    }
    
    # Quality multipliers
    quality_multipliers = {
        PrintQuality.DRAFT: 0.8,
        PrintQuality.STANDARD: 1.0,
        PrintQuality.HIGH: 1.3,
        PrintQuality.ULTRA: 1.6
    }
    
    # Priority multipliers
    priority_multipliers = {
        JobPriority.LOW: 0.9,
        JobPriority.NORMAL: 1.0,
        JobPriority.HIGH: 1.3,
        JobPriority.URGENT: 1.8
    }
    
    # Base calculations
    material_cost = volume * material_rates[material] * quantity
    quality_adjustment = material_cost * (quality_multipliers[quality] - 1)
    priority_adjustment = material_cost * (priority_multipliers[priority] - 1)
    
    # Time-based pricing (per hour)
    time_cost = (print_time / 60) * 15.0 * quantity  # $15/hour
    
    # Support cost
    support_cost = volume * 0.20 * quantity if supports_required else 0
    
    # Setup fee
    setup_fee = 5.0 if quantity == 1 else 5.0 + (quantity - 1) * 1.0
    
    subtotal = material_cost + quality_adjustment + priority_adjustment + time_cost + support_cost + setup_fee
    
    # Quantity discounts
    if quantity >= 10:
        subtotal *= 0.9  # 10% discount
    elif quantity >= 5:
        subtotal *= 0.95  # 5% discount
    
    # Calculate tax and shipping
    tax_rate = 0.08  # 8% tax
    tax = subtotal * tax_rate
    
    shipping = 10.0 if priority != JobPriority.URGENT else 25.0
    
    total = subtotal + tax + shipping
    
    return {
        "base_price": round(material_cost, 2),
        "material_cost": round(material_cost, 2),
        "quality_adjustment": round(quality_adjustment, 2),
        "priority_adjustment": round(priority_adjustment, 2),
        "time_cost": round(time_cost, 2),
        "support_cost": round(support_cost, 2),
        "setup_fee": round(setup_fee, 2),
        "subtotal": round(subtotal, 2),
        "tax": round(tax, 2),
        "shipping": round(shipping, 2),
        "total": round(total, 2)
    }

async def find_available_providers(
    volume: float,
    material: PrintMaterial,
    quality: PrintQuality,
    quantity: int,
    preferred_provider: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Find available providers from MakrCave network"""
    try:
        async with get_makrcave_client() as client:
            search_params = {
                "material": material.value,
                "quality": quality.value,
                "volume": volume,
                "quantity": quantity
            }
            
            if preferred_provider:
                search_params["provider_id"] = preferred_provider
            
            response = await client.get("/api/v1/providers/search", params=search_params)
            
            if response.status_code == 200:
                return response.json().get("providers", [])
            else:
                # Return mock providers for development
                return [
                    {
                        "id": "provider_1",
                        "name": "TechMaker Hub",
                        "location": "San Francisco, CA",
                        "rating": 4.8,
                        "estimated_delivery": 3,
                        "capabilities": [material.value],
                        "queue_length": 2
                    },
                    {
                        "id": "provider_2", 
                        "name": "Rapid Prototypes Inc",
                        "location": "Austin, TX",
                        "rating": 4.6,
                        "estimated_delivery": 5,
                        "capabilities": [material.value],
                        "queue_length": 5
                    }
                ]
                
    except Exception as e:
        logger.error(f"Provider search error: {e}")
        return []

async def dispatch_job_to_providers(
    service_order_id: str,
    quote_data: Dict[str, Any],
    order_request: ServiceOrderRequest
) -> Dict[str, Any]:
    """Dispatch job to MakrCave provider network"""
    try:
        job_id = str(uuid4())
        
        # Prepare job request
        job_request = ProviderJobRequest(
            job_id=job_id,
            service_order_id=service_order_id,
            customer_email=quote_data["request"]["user_email"],
            files=quote_data["request"]["file_urls"],
            specifications={
                "material": quote_data["request"]["material"],
                "quality": quote_data["request"]["quality"],
                "priority": quote_data["request"]["priority"],
                "supports_required": any(fa["supports_required"] for fa in quote_data["file_analyses"]),
                "special_instructions": order_request.special_instructions
            },
            quantity=quote_data["request"]["quantity"],
            priority=JobPriority(quote_data["request"]["priority"]),
            estimated_value=quote_data["pricing"]["total"],
            deadline=datetime.utcnow() + timedelta(days=7)
        )
        
        async with get_makrcave_client() as client:
            response = await client.post(
                "/api/v1/jobs/dispatch",
                json=job_request.dict()
            )
            
            if response.status_code in [200, 201]:
                job_data = response.json()
                return {
                    "success": True,
                    "job_id": job_id,
                    "provider": job_data.get("assigned_provider"),
                    "job_details": job_data
                }
            else:
                logger.error(f"Job dispatch failed: {response.status_code} - {response.text}")
                return {"success": False, "error": "Job dispatch failed"}
                
    except Exception as e:
        logger.error(f"Job dispatch error: {e}")
        return {"success": False, "error": str(e)}

async def get_job_status_from_makrcave(service_order_id: str) -> Dict[str, Any]:
    """Get job status from MakrCave"""
    try:
        async with get_makrcave_client() as client:
            response = await client.get(f"/api/v1/jobs/by-service-order/{service_order_id}")
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"status": "unknown"}
                
    except Exception as e:
        logger.error(f"Job status retrieval error: {e}")
        return {"status": "error", "error": str(e)}

async def store_quote(quote_id: str, quote_data: Dict[str, Any]):
    """Store quote data (Redis/database)"""
    # TODO: Implement proper storage
    # For now, this is a placeholder
    pass

async def get_quote(quote_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve quote data"""
    # TODO: Implement proper retrieval
    # For now, return mock data
    return {
        "quote_id": quote_id,
        "request": {
            "user_email": "user@example.com",
            "material": "pla",
            "quality": "standard",
            "quantity": 1,
            "priority": "normal",
            "file_urls": ["http://example.com/file.stl"]
        },
        "pricing": {
            "base_price": 25.00,
            "subtotal": 30.00,
            "tax": 2.40,
            "shipping": 10.00,
            "total": 42.40
        }
    }

async def process_service_order_payment(
    service_order_id: str,
    order_id: str,
    amount: float
):
    """Process payment for service order"""
    # TODO: Implement payment processing
    # This would integrate with Stripe/payment processor
    logger.info(f"Processing payment for service order {service_order_id}: ${amount}")
