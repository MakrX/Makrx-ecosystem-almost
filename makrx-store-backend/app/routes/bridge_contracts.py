"""
Exact API contracts as specified in the architecture
Implementation-ready bridge endpoints with precise data shapes
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import jwt
import httpx
from datetime import datetime, timedelta

from app.core.config import settings
from app.core.db import get_db
from app.models.commerce import Product, Price
from app.core.security import get_current_user

router = APIRouter()

# ==========================================
# A) BOM → Cart (Cave → Store)
# ==========================================

class BOMItem(BaseModel):
    """BOM line item from Cave"""
    sku: str
    qty: int

class BOMPriceRequest(BaseModel):
    """Cave requests pricing for BOM items"""
    items: List[BOMItem]
    currency: str = "INR"

class BOMLineResponse(BaseModel):
    """Store response for each BOM line"""
    sku: str
    qty: int
    price: float
    in_stock: bool
    alt: Optional[List[dict]] = None  # Alternative products if out of stock

class BOMPriceResponse(BaseModel):
    """Complete BOM pricing response"""
    lines: List[BOMLineResponse]
    cart_url: str

@router.post("/bom/price-availability", response_model=BOMPriceResponse)
async def get_bom_pricing(
    request: BOMPriceRequest,
    db: Session = Depends(get_db)
):
    """
    Cave → Store: Get pricing and availability for BOM items
    Exact contract as specified in architecture
    """
    try:
        lines = []
        
        for item in request.items:
            # Look up product by SKU
            product = db.query(Product).filter(Product.sku == item.sku).first()
            
            if not product:
                # Product not found - suggest alternatives
                lines.append(BOMLineResponse(
                    sku=item.sku,
                    qty=item.qty,
                    price=0.0,
                    in_stock=False,
                    alt=[{"sku": f"{item.sku}-ALT", "price": 0.0}]
                ))
                continue
            
            # Get current price
            price = db.query(Price).filter(
                Price.product_id == product.id,
                Price.currency == request.currency
            ).first()
            
            if not price:
                # Default pricing if no specific price found
                unit_price = float(product.base_price) if hasattr(product, 'base_price') else 100.0
            else:
                unit_price = float(price.amount)
            
            # Check stock availability
            in_stock = product.stock_qty >= item.qty if hasattr(product, 'stock_qty') else True
            
            # Add alternatives if out of stock
            alternatives = []
            if not in_stock:
                # Mock alternative for now
                alternatives = [{
                    "sku": f"{item.sku}-N",
                    "price": unit_price * 1.05  # 5% higher for alternative
                }]
            
            lines.append(BOMLineResponse(
                sku=item.sku,
                qty=item.qty,
                price=unit_price,
                in_stock=in_stock,
                alt=alternatives if not in_stock else None
            ))
        
        # Generate cart token for prefilled cart
        cart_items = [{"sku": line.sku, "qty": line.qty} for line in lines if line.in_stock]
        cart_token = jwt.encode(
            {
                "items": cart_items,
                "exp": datetime.utcnow() + timedelta(hours=1),
                "source": "makrcave_bom"
            },
            settings.SECRET_KEY,
            algorithm="HS256"
        )
        
        cart_url = f"https://makrx.store/cart?token={cart_token}"
        
        return BOMPriceResponse(
            lines=lines,
            cart_url=cart_url
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process BOM pricing: {str(e)}"
        )

# ==========================================
# C) Service Order → Provider Job (Store → Cave bridge)
# ==========================================

class ServiceOrderRequest(BaseModel):
    """Exact shape for Store → Cave job publishing"""
    service_order_id: int
    upload_file_key: str
    material: str
    quality: str
    est_weight_g: float
    est_time_min: int
    delivery: dict  # {"mode": "ship", "city": "Chandigarh", "pincode": "160012"}
    capabilities: dict  # {"min_nozzle_mm": 0.4, "bed_min_mm": [220,220,250]}

class JobPublishResponse(BaseModel):
    """Cave response to job publish"""
    job_id: int
    routing: str = "published"
    accept_url: str

@router.post("/jobs/publish", response_model=JobPublishResponse)
async def publish_job_to_cave(
    request: ServiceOrderRequest,
    db: Session = Depends(get_db)
):
    """
    Store → Cave: Publish service order as production job
    Exact API contract as specified
    """
    try:
        # Call MakrCave backend with exact data shape
        cave_payload = {
            "external_order_id": str(request.service_order_id),
            "source": "makrx_store",
            "title": f"3D Print Job - Order {request.service_order_id}",
            "description": f"Material: {request.material}, Quality: {request.quality}",
            "file_url": f"{settings.S3_BASE_URL}/{request.upload_file_key}",
            "requirements": {
                "material": request.material,
                "quality": request.quality,
                "est_weight_g": request.est_weight_g,
                "est_time_min": request.est_time_min,
                "capabilities": request.capabilities
            },
            "delivery": request.delivery,
            "priority": "normal"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.MAKRCAVE_API_URL}/api/v1/bridge/jobs",
                json=cave_payload,
                headers={
                    "Authorization": f"Bearer {settings.SERVICE_JWT}",
                    "Content-Type": "application/json"
                }
            )
            response.raise_for_status()
            cave_response = response.json()
        
        # Return exactly as specified
        return JobPublishResponse(
            job_id=cave_response["job_id"],
            routing="published",
            accept_url=f"https://makrcave.com/provider/jobs/{cave_response['job_id']}"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to publish job to MakrCave"
        )

# ==========================================
# D) Job Status (Cave → Store callback)
# ==========================================

class JobMilestone(BaseModel):
    """Job milestone timestamp and note"""
    at: datetime
    note: str

class JobStatusUpdate(BaseModel):
    """Exact shape for Cave → Store status updates"""
    service_order_id: int
    status: str  # PUBLISHED|ACCEPTED|PRINTING|READY|SHIPPED|COMPLETED|CANCELLED
    milestone: JobMilestone

@router.post("/jobs/{job_id}/status")
async def receive_job_status_update(
    job_id: int,
    update: JobStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Cave → Store: Receive job status updates
    Exact callback contract as specified
    """
    try:
        # Find service order by ID
        from app.models.services import ServiceOrder
        service_order = db.query(ServiceOrder).filter(
            ServiceOrder.id == update.service_order_id
        ).first()
        
        if not service_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service order not found"
            )
        
        # Update status using exact mapping
        status_mapping = {
            "PUBLISHED": "pending_assignment",
            "ACCEPTED": "assigned_to_provider", 
            "PRINTING": "in_production",
            "READY": "ready_for_shipping",
            "SHIPPED": "shipped",
            "COMPLETED": "completed",
            "CANCELLED": "cancelled"
        }
        
        service_order.status = status_mapping.get(update.status, update.status)
        
        # Append milestone to timeline
        if not hasattr(service_order, 'milestones'):
            service_order.milestones = []
        
        service_order.milestones.append({
            "timestamp": update.milestone.at.isoformat(),
            "status": update.status,
            "note": update.milestone.note
        })
        
        db.commit()
        
        return {"success": True, "message": f"Status updated to {update.status}"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update job status"
        )

# ==========================================
# Frontend Deep-Link Handlers
# ==========================================

@router.get("/cart/import")
async def import_bom_to_cart(
    codes: str,  # "SKU1:2,SKU2:5" format
    db: Session = Depends(get_db)
):
    """
    Handle: https://makrx.store/cart?import=bom&codes=SKU1:2,SKU2:5
    Frontend deep-link from MakrCave BOM
    """
    try:
        items = []
        for code_qty in codes.split(','):
            sku, qty = code_qty.split(':')
            items.append({"sku": sku.strip(), "qty": int(qty.strip())})
        
        # Create temporary cart session
        cart_token = jwt.encode(
            {
                "items": items,
                "exp": datetime.utcnow() + timedelta(hours=2),
                "source": "makrcave_bom_import"
            },
            settings.SECRET_KEY,
            algorithm="HS256"
        )
        
        return {
            "success": True,
            "cart_token": cart_token,
            "redirect_url": f"/cart?token={cart_token}",
            "items_count": len(items)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid BOM codes format"
        )

@router.get("/cart/reorder")
async def handle_reorder_from_cave(
    sku: str,
    qty: int,
    source: str = "makrcave",
    db: Session = Depends(get_db)
):
    """
    Handle: https://makrx.store/cart?sku=SKU123&qty=3&source=makrcave
    Low-stock reorder from MakrCave
    """
    try:
        # Verify product exists and get current price
        product = db.query(Product).filter(Product.sku == sku).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {sku} not found"
            )
        
        # Create pre-filled cart for institutional purchase
        cart_data = {
            "items": [{"sku": sku, "qty": qty}],
            "source": source,
            "priority": "restock",
            "exp": datetime.utcnow() + timedelta(hours=4)
        }
        
        cart_token = jwt.encode(cart_data, settings.SECRET_KEY, algorithm="HS256")
        
        return {
            "success": True,
            "product": {
                "sku": sku,
                "name": product.name,
                "qty_requested": qty
            },
            "cart_url": f"/cart?token={cart_token}",
            "note": "Institutional reorder from MakrCave"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process reorder"
        )
