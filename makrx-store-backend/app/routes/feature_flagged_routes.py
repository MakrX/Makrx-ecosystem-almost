"""
Feature Flag Protected API Routes
Demonstrates API protection using feature flags per specification
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Dict, Any, List, Optional
import logging

from app.core.feature_flags import (
    require_flag,
    check_flag,
    get_flag_value,
    build_flag_context,
    get_flag_context,
    KillSwitch,
    feature_disabled_response,
    feature_not_available_response,
    store_feature_required,
    admin_feature_required,
    FlagContext
)
from app.schemas.admin import MessageResponse

router = APIRouter()
logger = logging.getLogger(__name__)

# ==========================================
# Store Catalog Routes (Feature Flagged)
# ==========================================

@router.get("/catalog")
@store_feature_required("store.catalog.enabled")
async def get_catalog(request: Request):
    """
    Get product catalog - protected by store.catalog.enabled flag
    Returns 404 if catalog is disabled
    """
    context = build_flag_context(request)
    
    # Check if compare drawer is enabled for UI hints
    compare_enabled = check_flag("store.catalog.compare_drawer", context)
    kits_enabled = check_flag("store.catalog.kits", context)
    
    return {
        "products": [
            {"id": 1, "name": "Sample Product", "price": 999},
            {"id": 2, "name": "Another Product", "price": 1999}
        ],
        "features": {
            "compare_enabled": compare_enabled,
            "kits_enabled": kits_enabled
        },
        "total": 2
    }

@router.get("/catalog/kits")
@store_feature_required("store.catalog.kits")
async def get_product_kits():
    """Curated kits - only available when feature is enabled"""
    return {
        "kits": [
            {"id": 1, "name": "Beginner 3D Printing Kit", "products": [1, 2, 3]},
            {"id": 2, "name": "Advanced Maker Kit", "products": [4, 5, 6, 7]}
        ]
    }

# ==========================================
# Upload Routes (Kill Switch Pattern)
# ==========================================

@router.post("/upload/sign")
async def get_upload_signature(request: Request):
    """
    Upload signature endpoint with kill switch protection
    Returns 503 if uploads are disabled (maintenance mode)
    """
    context = build_flag_context(request)
    
    if not KillSwitch.check_upload_enabled(context):
        return feature_disabled_response("File Upload", maintenance=True)
    
    # Check 3D preview flag for feature hints
    preview_3d_enabled = check_flag("store.upload.preview_3d", context)
    
    return {
        "upload_url": "https://s3.example.com/presigned-url",
        "fields": {"key": "uploads/file.stl"},
        "features": {
            "preview_3d": preview_3d_enabled
        }
    }

@router.post("/upload/process")
@store_feature_required("store.upload.enabled")
async def process_upload(request: Request):
    """Process uploaded file"""
    context = build_flag_context(request)
    
    # Different processing based on flags
    heuristic_enabled = check_flag("store.quote.heuristic", context)
    slicer_enabled = check_flag("store.quote.slicer_v1", context)
    
    processing_method = "slicer" if slicer_enabled else "heuristic" if heuristic_enabled else "basic"
    
    return {
        "file_id": "file_123",
        "status": "processing",
        "method": processing_method,
        "estimated_time": "2-5 minutes"
    }

# ==========================================
# Payment Routes (Kill Switch)
# ==========================================

@router.post("/checkout/create")
async def create_checkout(request: Request):
    """
    Create checkout session with payment kill switch
    """
    context = build_flag_context(request)
    
    if not KillSwitch.check_payments_enabled(context):
        return feature_disabled_response("Payments", maintenance=True)
    
    # Check regional payment options
    cod_enabled = check_flag("store.checkout.cod", context)
    one_page_checkout = check_flag("store.checkout.one_page", context)
    
    payment_methods = ["card", "upi"]
    if cod_enabled:
        payment_methods.append("cod")
    
    return {
        "checkout_id": "chk_123",
        "payment_methods": payment_methods,
        "checkout_type": "one_page" if one_page_checkout else "stepped"
    }

@router.get("/checkout/options")
async def get_checkout_options(request: Request, pincode: Optional[str] = None):
    """Get available checkout options based on location"""
    context = build_flag_context(request)
    if pincode:
        context.pincode = pincode
    
    # COD availability based on pincode
    cod_enabled = check_flag("store.checkout.cod", context)
    
    return {
        "payment_methods": {
            "card": True,
            "upi": True,
            "cod": cod_enabled
        },
        "shipping_options": ["standard", "express"] if cod_enabled else ["standard"]
    }

# ==========================================
# Service Order Routes
# ==========================================

@router.post("/service-orders")
@store_feature_required("store.service_orders.enabled")
async def create_service_order(request: Request):
    """Create service order (quote → job conversion)"""
    context = build_flag_context(request)
    
    # Check if we can publish to Cave
    publish_enabled = check_flag("store.service_orders.publish_to_cave", context)
    cave_publish_enabled = check_flag("cave.jobs.publish_enabled", context)
    
    can_publish = publish_enabled and cave_publish_enabled
    
    service_order = {
        "id": "so_123",
        "status": "created",
        "will_publish_to_cave": can_publish
    }
    
    if can_publish:
        # Simulate publishing to Cave
        logger.info("Publishing service order to Cave")
        service_order["cave_job_id"] = "job_456"
        service_order["status"] = "published"
    else:
        service_order["status"] = "queued"
        service_order["reason"] = "cave_publishing_disabled"
    
    return service_order

# ==========================================
# Admin Routes (Role + Feature Protection)
# ==========================================

@router.get("/admin/products")
@admin_feature_required("store.admin.products")
async def admin_get_products():
    """Admin products management - requires both admin role and feature flag"""
    return {
        "products": [
            {"id": 1, "name": "Product 1", "status": "active"},
            {"id": 2, "name": "Product 2", "status": "draft"}
        ]
    }

@router.get("/admin/orders")
@admin_feature_required("store.admin.orders")
async def admin_get_orders():
    """Admin orders management"""
    return {
        "orders": [
            {"id": 1, "customer": "John Doe", "status": "completed"},
            {"id": 2, "customer": "Jane Smith", "status": "processing"}
        ]
    }

@router.get("/admin/reports")
@admin_feature_required("store.admin.reports")
async def admin_get_reports():
    """Admin reports - feature flagged"""
    return {
        "revenue": {"today": 15000, "this_month": 450000},
        "orders": {"today": 12, "this_month": 156},
        "message": "Reports feature is enabled"
    }

# ==========================================
# Account Features (Gradually Rolled Out)
# ==========================================

@router.get("/account/wishlist")
@store_feature_required("store.account.wishlist")
async def get_wishlist():
    """Wishlist feature - gradually being rolled out"""
    return {
        "items": [],
        "message": "Wishlist feature is available for your account"
    }

@router.get("/account/subscriptions")
@store_feature_required("store.account.subscriptions")
async def get_subscriptions():
    """Subscriptions feature"""
    return {
        "subscriptions": [],
        "credits": 0,
        "message": "Subscriptions feature is available"
    }

@router.post("/account/addresses")
async def save_address(request: Request):
    """Save address - check if address book is enabled"""
    context = build_flag_context(request)
    
    if not check_flag("store.account.address_book", context):
        return {"message": "Address saved to session only"}
    
    return {"message": "Address saved to your address book", "address_id": "addr_123"}

# ==========================================
# Experimental Routes (A/B Testing)
# ==========================================

@router.get("/search/results")
async def search_results(request: Request, q: str):
    """Search results with layout experiments"""
    context = build_flag_context(request)
    
    # Get experiment variant
    layout_variant = get_flag_value("store.search.results_layout", context, "grid")
    typeahead_enabled = check_flag("store.search.typeahead_entities", context)
    
    results = [
        {"id": 1, "title": "Sample Product", "price": 999},
        {"id": 2, "title": "Another Product", "price": 1999}
    ]
    
    return {
        "query": q,
        "results": results,
        "layout": layout_variant,
        "features": {
            "typeahead_entities": typeahead_enabled
        }
    }

# ==========================================
# Configuration Routes
# ==========================================

@router.get("/config/material-rates")
async def get_material_rates(request: Request):
    """Get material rates configuration"""
    context = build_flag_context(request)
    
    # Get config flag value
    rate_version = get_flag_value("store.quote.material_rates", context, "v1")
    
    # Return different rate tables based on version
    rates = {
        "v1": {"PLA": 50, "ABS": 60, "PETG": 80},
        "v1.2.0": {"PLA": 55, "ABS": 65, "PETG": 85, "TPU": 120}
    }
    
    return {
        "version": rate_version,
        "rates": rates.get(rate_version, rates["v1"])
    }

# ==========================================
# Feature Flag Status Endpoint
# ==========================================

@router.get("/flags/status")
async def get_flag_status(request: Request):
    """
    Get feature flag status for current user/context
    Useful for frontend feature detection
    """
    context = build_flag_context(request)
    
    # Key flags for frontend
    flags_to_check = [
        "store.catalog.enabled",
        "store.upload.enabled", 
        "store.payments.enabled",
        "store.catalog.compare_drawer",
        "store.catalog.kits",
        "store.checkout.cod",
        "store.account.wishlist",
        "store.account.subscriptions",
        "store.reviews.enabled"
    ]
    
    flag_status = {}
    for flag_key in flags_to_check:
        flag_status[flag_key] = check_flag(flag_key, context)
    
    return {
        "flags": flag_status,
        "context": {
            "has_user": bool(context.user_id),
            "roles": context.roles,
            "country": context.country,
            "pincode": context.pincode
        }
    }

# ==========================================
# Error Handling Examples
# ==========================================

@router.get("/example/feature-disabled")
async def example_disabled():
    """Example of a disabled feature"""
    return feature_disabled_response("Example Feature")

@router.get("/example/feature-maintenance")  
async def example_maintenance():
    """Example of a feature in maintenance"""
    return feature_disabled_response("Example Feature", maintenance=True)

@router.get("/example/feature-not-available")
async def example_not_available():
    """Example of feature not available to user"""
    return feature_not_available_response("Premium Feature")

# ==========================================
# Cave Integration Routes (Cross-Service)
# ==========================================

@router.post("/cave/publish-job")
async def publish_job_to_cave(request: Request):
    """Publish job to Cave with feature flag protection"""
    context = build_flag_context(request)
    
    # Check both local and remote flags
    local_publish_enabled = check_flag("store.service_orders.publish_to_cave", context)
    cave_receive_enabled = check_flag("cave.jobs.publish_enabled", context)
    
    if not local_publish_enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Job publishing is temporarily disabled"
        )
    
    if not cave_receive_enabled:
        # Queue for later processing
        return {
            "status": "queued",
            "message": "Job queued - Cave is not accepting jobs currently",
            "retry_after": 3600
        }
    
    # Proceed with publishing
    return {
        "status": "published",
        "cave_job_id": "job_789",
        "message": "Job successfully published to Cave"
    }

# Export router
__all__ = ["router"]
