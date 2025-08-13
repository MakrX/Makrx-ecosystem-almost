"""
Complete End-to-End User Flows
Implements exact sequences from architecture specification
"""
from fastapi import APIRouter, HTTPException, Depends, status, Header
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import datetime, timedelta
import httpx
import json

from app.core.db import get_db
from app.core.unified_auth import get_current_user, get_idempotency_key, idempotency
from app.middleware.observability import audit, metrics, track_quote_to_order_conversion
from app.models.commerce import Order, Product
from app.models.services import ServiceOrder, Upload, Quote

router = APIRouter()

# ==========================================
# C) Upload → Quote (Store only, but file keys later feed Cave)
# ==========================================

class PresignedURLRequest(BaseModel):
    """Request for presigned upload URL"""
    filename: str
    content_type: str
    file_size: int

class PresignedURLResponse(BaseModel):
    """Response with presigned URL for direct S3 upload"""
    upload_url: str
    file_key: str
    upload_id: str
    expires_in: int = 3600  # 1 hour

@router.post("/upload/sign", response_model=PresignedURLResponse)
async def get_presigned_upload_url(
    request: PresignedURLRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    POST /upload/sign → presigned PUT URL
    Files: Only presigned S3/MinIO URLs; APIs exchange keys, not bytes
    """
    try:
        # Validate file type and size
        allowed_types = ['.stl', '.3mf', '.obj']
        if not any(request.filename.lower().endswith(ext) for ext in allowed_types):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only .stl, .3mf, .obj files allowed"
            )
        
        # Generate unique file key
        user_id = current_user["keycloak_id"]
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        file_key = f"uploads/{user_id}/{timestamp}_{request.filename}"
        
        # Create upload record
        upload = Upload(
            user_id=user_id,
            filename=request.filename,
            file_key=file_key,
            content_type=request.content_type,
            file_size=request.file_size,
            status="pending",
            created_at=datetime.utcnow()
        )
        
        db.add(upload)
        db.commit()
        db.refresh(upload)
        
        # Generate presigned URL (mock for now)
        # In production: use boto3.client('s3').generate_presigned_url()
        presigned_url = f"https://s3.makrx.org/{file_key}?upload_id={upload.id}&expires=3600"
        
        return PresignedURLResponse(
            upload_url=presigned_url,
            file_key=file_key,
            upload_id=str(upload.id),
            expires_in=3600
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate presigned URL: {str(e)}"
        )

class UploadCompleteRequest(BaseModel):
    """Notification that upload completed"""
    upload_id: str
    file_key: str
    etag: Optional[str] = None

class UploadCompleteResponse(BaseModel):
    """Response confirming upload completion"""
    upload_id: str
    file_key: str
    status: str
    file_info: Dict[str, Any]

@router.post("/upload/complete", response_model=UploadCompleteResponse)
async def complete_upload(
    request: UploadCompleteRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    POST /upload/complete → { "file_key":"uploads/uid/file.stl" }
    Backend computes dims/volume (MVP) or calls slicer (V1+)
    """
    try:
        # Find upload record
        upload = db.query(Upload).filter(
            Upload.id == request.upload_id,
            Upload.user_id == current_user["keycloak_id"]
        ).first()
        
        if not upload:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Upload not found"
            )
        
        # Update upload status
        upload.status = "completed"
        upload.file_key = request.file_key
        upload.completed_at = datetime.utcnow()
        
        # Compute file dimensions/volume (MVP mock implementation)
        file_info = {
            "dimensions_mm": {
                "x": 85.2,
                "y": 54.7, 
                "z": 12.3
            },
            "volume_mm3": 12847.5,
            "estimated_weight_g": 15.8,  # Assumes PLA density
            "bounding_box": [85.2, 54.7, 12.3],
            "analysis_method": "mvp_estimation"
        }
        
        upload.file_info = file_info
        db.commit()
        
        return UploadCompleteResponse(
            upload_id=request.upload_id,
            file_key=request.file_key,
            status="completed",
            file_info=file_info
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete upload: {str(e)}"
        )

class QuoteRequest(BaseModel):
    """Request for 3D printing quote"""
    upload_id: str
    material: str = "PLA"
    quality: str = "standard"
    quantity: int = 1
    infill_percentage: int = 20
    supports: bool = False

class QuoteResponse(BaseModel):
    """3D printing quote with pricing breakdown"""
    quote_id: str
    upload_id: str
    price: float
    currency: str = "INR"
    estimated_weight_g: float
    estimated_time_minutes: int
    breakdown: Dict[str, Any]
    expires_at: datetime
    upload: Dict[str, Any]  # Contains file_key for later Cave routing

@router.post("/quote", response_model=QuoteResponse)
async def generate_quote(
    request: QuoteRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    POST /quote → pricing with file_key
    Quote result carries: est_weight_g, est_time_min, price, upload.file_key
    """
    try:
        # Validate upload belongs to user
        upload = db.query(Upload).filter(
            Upload.id == request.upload_id,
            Upload.user_id == current_user["keycloak_id"],
            Upload.status == "completed"
        ).first()
        
        if not upload:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Upload not found or not completed"
            )
        
        # Get file info for pricing calculation
        file_info = upload.file_info or {}
        volume_mm3 = file_info.get("volume_mm3", 10000)  # Default if not analyzed
        
        # Calculate pricing using exact engine from architecture
        pricing_result = calculate_3d_print_pricing(
            volume_mm3=volume_mm3,
            material=request.material,
            quality=request.quality,
            quantity=request.quantity,
            infill_percentage=request.infill_percentage,
            supports=request.supports
        )
        
        # Create quote record
        quote = Quote(
            user_id=current_user["keycloak_id"],
            upload_id=request.upload_id,
            material=request.material,
            quality=request.quality,
            quantity=request.quantity,
            price=pricing_result["total_price"],
            currency="INR",
            estimated_weight_g=pricing_result["estimated_weight_g"],
            estimated_time_minutes=pricing_result["estimated_time_minutes"],
            breakdown=pricing_result["breakdown"],
            expires_at=datetime.utcnow() + timedelta(hours=24),
            created_at=datetime.utcnow()
        )
        
        db.add(quote)
        db.commit()
        db.refresh(quote)
        
        return QuoteResponse(
            quote_id=str(quote.id),
            upload_id=request.upload_id,
            price=pricing_result["total_price"],
            currency="INR",
            estimated_weight_g=pricing_result["estimated_weight_g"],
            estimated_time_minutes=pricing_result["estimated_time_minutes"],
            breakdown=pricing_result["breakdown"],
            expires_at=quote.expires_at,
            upload={
                "file_key": upload.file_key,  # Critical for Cave routing
                "filename": upload.filename,
                "file_info": upload.file_info
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quote: {str(e)}"
        )

def calculate_3d_print_pricing(
    volume_mm3: float,
    material: str,
    quality: str,
    quantity: int = 1,
    infill_percentage: int = 20,
    supports: bool = False
) -> Dict[str, Any]:
    """
    MVP: volume_cm³ * material_rate + time_factor * k + setup_fee
    Exact pricing engine as specified
    """
    # Convert to cm³
    volume_cm3 = volume_mm3 / 1000
    
    # Material rates (INR per cm³)
    material_rates = {
        "PLA": 2.5,
        "ABS": 3.0,
        "PETG": 3.5,
        "TPU": 4.0
    }
    
    # Quality multipliers
    quality_multipliers = {
        "draft": 0.8,
        "standard": 1.0,
        "high": 1.4,
        "ultra": 2.0
    }
    
    base_rate = material_rates.get(material, 2.5)
    quality_mult = quality_multipliers.get(quality, 1.0)
    
    # Calculate components
    material_cost = volume_cm3 * base_rate * (infill_percentage / 100) * quantity
    
    # Time estimation (minutes)
    base_time_per_cm3 = 45  # minutes per cm³
    time_factor = quality_multipliers.get(quality, 1.0)
    supports_factor = 1.3 if supports else 1.0
    estimated_time = volume_cm3 * base_time_per_cm3 * time_factor * supports_factor * quantity
    
    # Machine cost (₹0.50 per minute)
    machine_cost = estimated_time * 0.50
    
    # Labor and setup
    setup_fee = 50.0  # Base setup
    labor_cost = 25.0 * quantity  # Per part labor
    
    # Support material cost
    support_cost = material_cost * 0.15 if supports else 0.0
    
    # Total calculation
    subtotal = material_cost + machine_cost + labor_cost + support_cost
    total_price = subtotal + setup_fee
    
    return {
        "total_price": round(total_price, 2),
        "estimated_weight_g": round(volume_cm3 * 1.24 * (infill_percentage / 100) * quantity, 2),  # PLA density
        "estimated_time_minutes": int(estimated_time),
        "breakdown": {
            "material_cost": round(material_cost, 2),
            "machine_cost": round(machine_cost, 2),
            "labor_cost": round(labor_cost, 2),
            "support_cost": round(support_cost, 2),
            "setup_fee": setup_fee,
            "subtotal": round(subtotal, 2),
            "total": round(total_price, 2)
        }
    }

# ==========================================
# Complete 3D Print Job Flow (Sequence A)
# ==========================================

class ServiceOrderCreateRequest(BaseModel):
    """Create service order from quote"""
    quote_id: str
    shipping_address: Dict[str, Any]
    delivery_mode: str = "ship"  # ship, pickup
    special_instructions: Optional[str] = None

@router.post("/service-orders/from-quote")
async def create_service_order_from_quote(
    request: ServiceOrderCreateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    idempotency_key: Optional[str] = Depends(get_idempotency_key),
    db: Session = Depends(get_db)
):
    """
    Convert quote to service order → triggers job publishing to Cave
    Implements: Quote → Payment → Service Order → Cave Job Pipeline
    """
    try:
        # Check for duplicate requests
        if idempotency_key:
            cached_result = await idempotency.get_cached_result(
                idempotency_key, "create_service_order"
            )
            if cached_result:
                return cached_result
        
        # Validate quote
        quote = db.query(Quote).filter(
            Quote.id == request.quote_id,
            Quote.user_id == current_user["keycloak_id"]
        ).first()
        
        if not quote:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quote not found"
            )
        
        if quote.expires_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quote has expired"
            )
        
        # Get upload info for Cave routing
        upload = db.query(Upload).filter(Upload.id == quote.upload_id).first()
        if not upload:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Associated upload not found"
            )
        
        # Create service order
        service_order = ServiceOrder(
            user_id=current_user["keycloak_id"],
            quote_id=quote.id,
            upload_id=upload.id,
            status="pending_payment",
            total_price=quote.price,
            currency=quote.currency,
            estimated_delivery=datetime.utcnow() + timedelta(days=7),
            shipping_address=request.shipping_address,
            delivery_mode=request.delivery_mode,
            special_instructions=request.special_instructions,
            created_at=datetime.utcnow()
        )
        
        db.add(service_order)
        db.commit()
        db.refresh(service_order)
        
        # Prepare for payment
        payment_metadata = {
            "service_order_id": service_order.id,
            "quote_id": quote.id,
            "upload_file_key": upload.file_key,
            "material": quote.material,
            "quality": quote.quality,
            "estimated_time_minutes": quote.estimated_time_minutes,
            "user_id": current_user["keycloak_id"]
        }
        
        result = {
            "service_order_id": service_order.id,
            "status": "pending_payment",
            "payment_amount": quote.price,
            "currency": quote.currency,
            "payment_metadata": payment_metadata,
            "next_step": "complete_payment"
        }
        
        # Cache result for idempotency
        if idempotency_key:
            await idempotency.record_operation(
                idempotency_key, "create_service_order", result
            )
        
        # Track quote conversion
        track_quote_to_order_conversion(request.quote_id, True, "unknown")
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create service order: {str(e)}"
        )

@router.post("/service-orders/{service_order_id}/publish-to-cave")
async def publish_service_order_to_cave(
    service_order_id: str,
    db: Session = Depends(get_db)
):
    """
    Called by payment webhook → publishes job to Cave
    Implements: Store �� Cave bridge with exact data shape
    """
    try:
        # Get service order with all related data
        service_order = db.query(ServiceOrder).filter(
            ServiceOrder.id == service_order_id
        ).first()
        
        if not service_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service order not found"
            )
        
        # Get quote and upload
        quote = db.query(Quote).filter(Quote.id == service_order.quote_id).first()
        upload = db.query(Upload).filter(Upload.id == service_order.upload_id).first()
        
        if not quote or not upload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing quote or upload data"
            )
        
        # Prepare Cave job request with exact contract
        cave_job_request = {
            "service_order_id": int(service_order_id),
            "upload_file_key": upload.file_key,
            "material": quote.material,
            "quality": quote.quality,
            "est_weight_g": quote.estimated_weight_g,
            "est_time_min": quote.estimated_time_minutes,
            "delivery": {
                "mode": service_order.delivery_mode,
                "address": service_order.shipping_address,
                "estimated_date": service_order.estimated_delivery.isoformat()
            },
            "capabilities": {
                "min_nozzle_mm": 0.4,
                "bed_min_mm": [200, 200, 200]  # Default requirements
            }
        }
        
        # Call Cave bridge API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.MAKRCAVE_API_URL}/api/v1/bridge/jobs/publish",
                json=cave_job_request,
                headers={
                    "Authorization": f"Bearer {settings.SERVICE_JWT}",
                    "Content-Type": "application/json"
                }
            )
            response.raise_for_status()
            cave_response = response.json()
        
        # Update service order with Cave job mapping
        service_order.status = "assigned_to_provider"
        service_order.cave_job_id = cave_response["job_id"]
        service_order.provider_accept_url = cave_response["accept_url"]
        
        db.commit()
        
        # Log successful job publication
        audit.log_service_order_lifecycle(
            service_order_id=service_order_id,
            status="published_to_cave",
            metadata={
                "cave_job_id": cave_response["job_id"],
                "accept_url": cave_response["accept_url"]
            },
            request_id="webhook_triggered"
        )
        
        return {
            "success": True,
            "service_order_id": service_order_id,
            "cave_job_id": cave_response["job_id"],
            "status": "published_to_cave",
            "provider_accept_url": cave_response["accept_url"]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to publish to Cave: {str(e)}"
        )

# ==========================================
# Status Tracking for User
# ==========================================

@router.get("/service-orders/{service_order_id}/status")
async def get_service_order_status(
    service_order_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get real-time service order status with timeline
    Shows Cave job progress to Store customers
    """
    try:
        service_order = db.query(ServiceOrder).filter(
            ServiceOrder.id == service_order_id,
            ServiceOrder.user_id == current_user["keycloak_id"]
        ).first()
        
        if not service_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service order not found"
            )
        
        # Get timeline from milestones
        timeline = getattr(service_order, 'milestones', [])
        
        return {
            "service_order_id": service_order_id,
            "status": service_order.status,
            "cave_job_id": getattr(service_order, 'cave_job_id', None),
            "estimated_delivery": service_order.estimated_delivery,
            "timeline": timeline,
            "provider_accept_url": getattr(service_order, 'provider_accept_url', None),
            "tracking_available": len(timeline) > 0
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get status: {str(e)}"
        )
