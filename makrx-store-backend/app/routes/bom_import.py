"""
MakrCave BOM Import API Routes
Enables importing Bills of Materials from MakrCave projects into store cart
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_, func
from typing import List, Optional, Dict, Any
import logging
import json
import httpx
from datetime import datetime, timedelta
from uuid import uuid4

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.commerce import Product, Cart, CartItem
from app.models.subscriptions import BOMIntegration
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bom-import", tags=["BOM Import"])

# Configuration
MAKRCAVE_API_URL = "http://makrcave-backend:8000"

# Pydantic Models
class BOMImportRequest(BaseModel):
    makrcave_project_id: str
    makrcave_user_id: str
    auto_add_to_cart: bool = True
    create_quick_reorder: bool = False
    quick_reorder_name: Optional[str] = None

class BOMItem(BaseModel):
    id: str
    name: str
    description: Optional[str]
    quantity: int
    unit: str
    manufacturer: Optional[str]
    part_number: Optional[str]
    specifications: Dict[str, Any] = {}
    estimated_cost: Optional[float] = None
    category: Optional[str] = None
    notes: Optional[str] = None

class BOMData(BaseModel):
    project_id: str
    project_name: str
    total_items: int
    items: List[BOMItem]
    created_at: datetime
    updated_at: datetime

class ProductMatch(BaseModel):
    confidence: float  # 0-1 score
    match_type: str  # exact, partial, fuzzy, manual
    store_product_id: int
    store_product_name: str
    store_product_brand: Optional[str]
    store_product_price: float
    quantity_available: int
    match_reasons: List[str] = []

class BOMMappingResult(BaseModel):
    bom_item_id: str
    bom_item_name: str
    bom_quantity: int
    matches: List[ProductMatch] = []
    best_match: Optional[ProductMatch] = None
    status: str  # mapped, unmapped, multiple_matches, out_of_stock

class BOMImportResponse(BaseModel):
    import_id: str
    status: str
    total_items: int
    mapped_items: int
    unmapped_items: int
    cart_id: Optional[str] = None
    estimated_total: float
    mapping_results: List[BOMMappingResult]
    warnings: List[str] = []

class ProductMappingRequest(BaseModel):
    bom_item_id: str
    store_product_id: int
    quantity: Optional[int] = None

class BulkMappingRequest(BaseModel):
    mappings: List[ProductMappingRequest]
    add_to_cart: bool = True

@router.post("/import", response_model=BOMImportResponse)
async def import_bom_from_makrcave(
    request: BOMImportRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Import BOM from MakrCave project and map to store products
    """
    try:
        # Fetch BOM data from MakrCave
        bom_data = await fetch_bom_from_makrcave(
            request.makrcave_project_id,
            request.makrcave_user_id
        )
        
        if not bom_data:
            raise HTTPException(status_code=404, detail="BOM not found in MakrCave")
        
        # Create BOM integration record
        integration_id = uuid4()
        integration = BOMIntegration(
            id=integration_id,
            makrcave_project_id=request.makrcave_project_id,
            makrcave_user_id=request.makrcave_user_id,
            bom_name=bom_data.project_name,
            project_name=bom_data.project_name,
            total_items=len(bom_data.items),
            import_status="processing",
            auto_add_to_cart=request.auto_add_to_cart
        )
        
        db.add(integration)
        db.commit()
        db.refresh(integration)
        
        # Map BOM items to store products
        mapping_results = []
        mapped_count = 0
        unmapped_count = 0
        estimated_total = 0.0
        warnings = []
        
        for bom_item in bom_data.items:
            result = await map_bom_item_to_products(db, bom_item)
            mapping_results.append(result)
            
            if result.best_match:
                mapped_count += 1
                estimated_total += result.best_match.store_product_price * bom_item.quantity
            else:
                unmapped_count += 1
                warnings.append(f"No suitable match found for {bom_item.name}")
        
        # Create or get cart if auto-adding
        cart = None
        if request.auto_add_to_cart and mapped_count > 0:
            cart = await get_or_create_user_cart(db, user_id)
            
            # Add mapped items to cart
            for result in mapping_results:
                if result.best_match and result.status == "mapped":
                    await add_item_to_cart(
                        db, 
                        cart.id, 
                        result.best_match.store_product_id, 
                        result.bom_quantity,
                        {
                            "bom_import_id": str(integration_id),
                            "bom_item_id": result.bom_item_id,
                            "bom_item_name": result.bom_item_name
                        }
                    )
            
            integration.cart_id = cart.id
        
        # Update integration with results
        integration.imported_items = mapped_count
        integration.failed_items = unmapped_count
        integration.import_status = "completed" if unmapped_count == 0 else "partial"
        integration.item_mappings = {
            result.bom_item_id: result.best_match.store_product_id 
            for result in mapping_results 
            if result.best_match
        }
        integration.unmapped_items = [
            {
                "id": result.bom_item_id,
                "name": result.bom_item_name,
                "quantity": result.bom_quantity,
                "reason": "No suitable match found"
            }
            for result in mapping_results 
            if not result.best_match
        ]
        integration.completed_at = datetime.utcnow()
        
        db.commit()
        
        # Schedule background tasks
        if request.create_quick_reorder and mapped_count > 0:
            background_tasks.add_task(
                create_quick_reorder_from_bom,
                user_id,
                str(integration_id),
                request.quick_reorder_name or f"BOM: {bom_data.project_name}"
            )
        
        background_tasks.add_task(
            notify_makrcave_import_complete,
            request.makrcave_project_id,
            request.makrcave_user_id,
            str(integration_id),
            mapped_count,
            unmapped_count
        )
        
        return BOMImportResponse(
            import_id=str(integration_id),
            status=integration.import_status,
            total_items=len(bom_data.items),
            mapped_items=mapped_count,
            unmapped_items=unmapped_count,
            cart_id=str(cart.id) if cart else None,
            estimated_total=estimated_total,
            mapping_results=mapping_results,
            warnings=warnings
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"BOM import error: {e}")
        # Update integration status if it was created
        if 'integration' in locals():
            integration.import_status = "failed"
            integration.error_log = [{"error": str(e), "timestamp": datetime.utcnow().isoformat()}]
            db.commit()
        raise HTTPException(status_code=500, detail="BOM import failed")

@router.get("/status/{import_id}")
async def get_import_status(
    import_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get status of BOM import
    """
    try:
        integration = db.query(BOMIntegration).filter(
            and_(
                BOMIntegration.id == import_id,
                BOMIntegration.makrcave_user_id == user_id
            )
        ).first()
        
        if not integration:
            raise HTTPException(status_code=404, detail="Import not found")
        
        return {
            "import_id": str(integration.id),
            "status": integration.import_status,
            "total_items": integration.total_items,
            "imported_items": integration.imported_items,
            "failed_items": integration.failed_items,
            "cart_id": str(integration.cart_id) if integration.cart_id else None,
            "created_at": integration.created_at,
            "completed_at": integration.completed_at,
            "item_mappings": integration.item_mappings,
            "unmapped_items": integration.unmapped_items,
            "error_log": integration.error_log
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get import status error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get import status")

@router.post("/manual-mapping")
async def apply_manual_mapping(
    request: BulkMappingRequest,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Apply manual product mappings for unmapped BOM items
    """
    try:
        results = []
        cart = None
        
        if request.add_to_cart:
            cart = await get_or_create_user_cart(db, user_id)
        
        for mapping in request.mappings:
            # Verify product exists
            product = db.query(Product).filter(Product.id == mapping.store_product_id).first()
            if not product or not product.is_active:
                results.append({
                    "bom_item_id": mapping.bom_item_id,
                    "success": False,
                    "error": "Product not found or inactive"
                })
                continue
            
            # Add to cart if requested
            if cart:
                quantity = mapping.quantity or 1
                await add_item_to_cart(
                    db,
                    cart.id,
                    mapping.store_product_id,
                    quantity,
                    {
                        "manual_mapping": True,
                        "bom_item_id": mapping.bom_item_id
                    }
                )
            
            results.append({
                "bom_item_id": mapping.bom_item_id,
                "success": True,
                "product_id": mapping.store_product_id,
                "product_name": product.name,
                "price": float(product.sale_price or product.price)
            })
        
        return {
            "success": True,
            "cart_id": str(cart.id) if cart else None,
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Manual mapping error: {e}")
        raise HTTPException(status_code=500, detail="Failed to apply manual mapping")

@router.get("/project/{project_id}/preview")
async def preview_bom_import(
    project_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Preview BOM import without actually importing
    """
    try:
        # Fetch BOM data from MakrCave
        bom_data = await fetch_bom_from_makrcave(project_id, user_id)
        
        if not bom_data:
            raise HTTPException(status_code=404, detail="BOM not found")
        
        # Map items to get preview
        preview_results = []
        total_estimated_cost = 0.0
        mappable_items = 0
        
        for bom_item in bom_data.items:
            result = await map_bom_item_to_products(db, bom_item)
            preview_results.append(result)
            
            if result.best_match:
                mappable_items += 1
                total_estimated_cost += result.best_match.store_product_price * bom_item.quantity
        
        return {
            "project_id": project_id,
            "project_name": bom_data.project_name,
            "total_items": len(bom_data.items),
            "mappable_items": mappable_items,
            "unmappable_items": len(bom_data.items) - mappable_items,
            "estimated_total": total_estimated_cost,
            "mapping_preview": preview_results[:10],  # Show first 10 for preview
            "bom_updated_at": bom_data.updated_at
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"BOM preview error: {e}")
        raise HTTPException(status_code=500, detail="Failed to preview BOM")

@router.get("/user/imports")
async def list_user_imports(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all BOM imports for the user
    """
    try:
        imports = db.query(BOMIntegration).filter(
            BOMIntegration.makrcave_user_id == user_id
        ).order_by(BOMIntegration.created_at.desc()).all()
        
        return {
            "imports": [
                {
                    "import_id": str(imp.id),
                    "project_name": imp.project_name,
                    "bom_name": imp.bom_name,
                    "status": imp.import_status,
                    "total_items": imp.total_items,
                    "imported_items": imp.imported_items,
                    "failed_items": imp.failed_items,
                    "created_at": imp.created_at,
                    "completed_at": imp.completed_at
                }
                for imp in imports
            ]
        }
        
    except Exception as e:
        logger.error(f"List imports error: {e}")
        raise HTTPException(status_code=500, detail="Failed to list imports")

@router.delete("/import/{import_id}")
async def delete_import(
    import_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a BOM import record
    """
    try:
        integration = db.query(BOMIntegration).filter(
            and_(
                BOMIntegration.id == import_id,
                BOMIntegration.makrcave_user_id == user_id
            )
        ).first()
        
        if not integration:
            raise HTTPException(status_code=404, detail="Import not found")
        
        db.delete(integration)
        db.commit()
        
        return {"success": True, "message": "Import deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete import error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete import")

# Helper Functions

async def fetch_bom_from_makrcave(project_id: str, user_id: str) -> Optional[BOMData]:
    """Fetch BOM data from MakrCave API"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{MAKRCAVE_API_URL}/api/v1/projects/{project_id}/bom",
                headers={"X-User-ID": user_id}
            )
            
            if response.status_code == 200:
                data = response.json()
                return BOMData(**data)
            elif response.status_code == 404:
                return None
            else:
                logger.error(f"MakrCave API error: {response.status_code} - {response.text}")
                return None
                
    except Exception as e:
        logger.error(f"Failed to fetch BOM from MakrCave: {e}")
        return None

async def map_bom_item_to_products(db: Session, bom_item: BOMItem) -> BOMMappingResult:
    """Map a BOM item to store products using various matching strategies"""
    
    matches = []
    
    # Strategy 1: Exact part number match
    if bom_item.part_number:
        exact_matches = db.query(Product).filter(
            and_(
                Product.is_active == True,
                or_(
                    Product.attributes['part_number'].astext == bom_item.part_number,
                    Product.attributes['sku'].astext == bom_item.part_number
                )
            )
        ).all()
        
        for product in exact_matches:
            matches.append(ProductMatch(
                confidence=0.95,
                match_type="exact",
                store_product_id=product.id,
                store_product_name=product.name,
                store_product_brand=product.brand,
                store_product_price=float(product.sale_price or product.price),
                quantity_available=product.stock_qty,
                match_reasons=["Exact part number match"]
            ))
    
    # Strategy 2: Name and manufacturer match
    if bom_item.manufacturer and not matches:
        name_brand_matches = db.query(Product).filter(
            and_(
                Product.is_active == True,
                Product.brand.ilike(f"%{bom_item.manufacturer}%"),
                Product.name.ilike(f"%{bom_item.name[:20]}%")  # First 20 chars
            )
        ).all()
        
        for product in name_brand_matches:
            confidence = calculate_name_similarity(bom_item.name, product.name)
            if confidence > 0.7:
                matches.append(ProductMatch(
                    confidence=confidence * 0.8,  # Reduce confidence for partial match
                    match_type="partial",
                    store_product_id=product.id,
                    store_product_name=product.name,
                    store_product_brand=product.brand,
                    store_product_price=float(product.sale_price or product.price),
                    quantity_available=product.stock_qty,
                    match_reasons=["Brand and name similarity"]
                ))
    
    # Strategy 3: Fuzzy name matching
    if not matches:
        fuzzy_matches = db.query(Product).filter(
            and_(
                Product.is_active == True,
                or_(
                    Product.name.ilike(f"%{bom_item.name[:10]}%"),
                    Product.description.ilike(f"%{bom_item.name[:10]}%")
                )
            )
        ).limit(5).all()
        
        for product in fuzzy_matches:
            confidence = calculate_name_similarity(bom_item.name, product.name)
            if confidence > 0.5:
                matches.append(ProductMatch(
                    confidence=confidence * 0.6,
                    match_type="fuzzy",
                    store_product_id=product.id,
                    store_product_name=product.name,
                    store_product_brand=product.brand,
                    store_product_price=float(product.sale_price or product.price),
                    quantity_available=product.stock_qty,
                    match_reasons=["Name similarity"]
                ))
    
    # Sort matches by confidence
    matches.sort(key=lambda x: x.confidence, reverse=True)
    
    # Determine best match and status
    best_match = None
    status = "unmapped"
    
    if matches:
        # Check stock availability
        in_stock_matches = [m for m in matches if m.quantity_available >= bom_item.quantity]
        
        if in_stock_matches:
            best_match = in_stock_matches[0]
            status = "mapped"
        elif matches:
            best_match = matches[0]
            status = "out_of_stock"
        
        if len(matches) > 1 and matches[0].confidence < 0.8:
            status = "multiple_matches"
    
    return BOMMappingResult(
        bom_item_id=bom_item.id,
        bom_item_name=bom_item.name,
        bom_quantity=bom_item.quantity,
        matches=matches[:3],  # Return top 3 matches
        best_match=best_match,
        status=status
    )

def calculate_name_similarity(name1: str, name2: str) -> float:
    """Calculate similarity between two product names"""
    name1 = name1.lower().strip()
    name2 = name2.lower().strip()
    
    # Simple word overlap calculation
    words1 = set(name1.split())
    words2 = set(name2.split())
    
    if not words1 or not words2:
        return 0.0
    
    overlap = len(words1.intersection(words2))
    total = len(words1.union(words2))
    
    return overlap / total if total > 0 else 0.0

async def get_or_create_user_cart(db: Session, user_id: str) -> Cart:
    """Get existing cart or create new one for user"""
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    
    if not cart:
        cart = Cart(
            id=uuid4(),
            user_id=user_id,
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        db.add(cart)
        db.commit()
        db.refresh(cart)
    
    return cart

async def add_item_to_cart(
    db: Session, 
    cart_id: str, 
    product_id: int, 
    quantity: int, 
    meta: Optional[Dict[str, Any]] = None
):
    """Add item to cart or update quantity if exists"""
    existing_item = db.query(CartItem).filter(
        and_(
            CartItem.cart_id == cart_id,
            CartItem.product_id == product_id
        )
    ).first()
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return
    
    if existing_item:
        existing_item.quantity += quantity
        existing_item.updated_at = datetime.utcnow()
    else:
        cart_item = CartItem(
            cart_id=cart_id,
            product_id=product_id,
            quantity=quantity,
            unit_price=product.sale_price or product.price,
            meta=meta or {}
        )
        db.add(cart_item)
    
    db.commit()

# Background Tasks

async def create_quick_reorder_from_bom(user_id: str, integration_id: str, name: str):
    """Create a quick reorder template from successfully mapped BOM items"""
    try:
        # This would create a quick reorder using the mapped items
        logger.info(f"Creating quick reorder for user {user_id} from BOM import {integration_id}")
        
    except Exception as e:
        logger.error(f"Failed to create quick reorder from BOM: {e}")

async def notify_makrcave_import_complete(
    project_id: str, 
    user_id: str, 
    integration_id: str, 
    mapped_count: int, 
    unmapped_count: int
):
    """Notify MakrCave that BOM import is complete"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(
                f"{MAKRCAVE_API_URL}/api/v1/projects/{project_id}/bom-import-complete",
                json={
                    "integration_id": integration_id,
                    "mapped_items": mapped_count,
                    "unmapped_items": unmapped_count,
                    "store_url": f"/bom-import/status/{integration_id}"
                },
                headers={"X-User-ID": user_id}
            )
            
    except Exception as e:
        logger.error(f"Failed to notify MakrCave: {e}")
