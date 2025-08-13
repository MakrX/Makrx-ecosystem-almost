#!/usr/bin/env python3
"""
Cart Bulk Operations - Handle bulk cart additions from external sources
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from typing import List, Dict, Any, Optional
import logging
from uuid import UUID, uuid4
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr

from ..core.db import get_db
from ..models.commerce import Cart, CartItem, Product
from ..schemas.commerce import CartResponse, CartItemResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cart", tags=["Cart Bulk Operations"])

# Pydantic Models
class BulkCartItem(BaseModel):
    sku: str = Field(..., description="Product SKU")
    quantity: int = Field(gt=0, description="Quantity to add")
    notes: Optional[str] = Field(None, description="Item-specific notes")
    project_reference: Optional[str] = Field(None, description="Reference to source project")
    unit_price_override: Optional[float] = Field(None, description="Override unit price")

class BulkCartRequest(BaseModel):
    user_email: EmailStr = Field(..., description="User email for cart identification")
    items: List[BulkCartItem] = Field(..., min_items=1, description="Items to add to cart")
    source: str = Field(default="api", description="Source system (makrcave_bom, manual, etc.)")
    project_id: Optional[str] = Field(None, description="Source project ID")
    project_name: Optional[str] = Field(None, description="Source project name")
    merge_strategy: str = Field(default="add", description="add|replace|update quantities")
    notes: Optional[str] = Field(None, description="General notes for the bulk operation")

class BulkCartResponse(BaseModel):
    success: bool
    message: str
    cart_id: str
    added_items: int
    updated_items: int
    failed_items: int
    total_cart_items: int
    cart_total: float
    details: List[Dict[str, Any]] = []
    cart_url: Optional[str] = None

class CartValidationResult(BaseModel):
    valid_items: List[BulkCartItem]
    invalid_items: List[Dict[str, Any]]
    product_map: Dict[str, Product]

@router.post("/bulk-add", response_model=BulkCartResponse)
async def bulk_add_to_cart(
    bulk_request: BulkCartRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Bulk add items to user's cart
    
    This endpoint handles:
    1. User cart creation/retrieval
    2. Product validation and pricing
    3. Inventory availability checks
    4. Bulk cart item addition with conflict resolution
    5. Cart total recalculation
    """
    try:
        # Validate products and prepare cart items
        validation_result = await validate_bulk_cart_items(bulk_request.items, db)
        
        if not validation_result.valid_items:
            return BulkCartResponse(
                success=False,
                message="No valid items to add to cart",
                cart_id="",
                added_items=0,
                updated_items=0,
                failed_items=len(bulk_request.items),
                total_cart_items=0,
                cart_total=0.0,
                details=[{"error": "All items failed validation"}]
            )
        
        # Get or create user cart
        cart = await get_or_create_user_cart(bulk_request.user_email, db)
        
        # Process cart additions based on merge strategy
        results = await process_bulk_cart_additions(
            cart,
            validation_result,
            bulk_request,
            db
        )
        
        # Recalculate cart totals
        await recalculate_cart_totals(cart, db)
        db.commit()
        
        # Schedule background tasks
        background_tasks.add_task(
            notify_bulk_cart_addition,
            bulk_request.user_email,
            bulk_request.project_name or "Bulk Import",
            results["added_items"],
            results["updated_items"]
        )
        
        cart_url = f"/cart"  # Frontend cart URL
        
        return BulkCartResponse(
            success=results["added_items"] > 0 or results["updated_items"] > 0,
            message=f"Added {results['added_items']} items, updated {results['updated_items']} items",
            cart_id=str(cart.id),
            added_items=results["added_items"],
            updated_items=results["updated_items"],
            failed_items=results["failed_items"],
            total_cart_items=len(cart.items),
            cart_total=float(cart.total_amount or 0),
            details=results["details"],
            cart_url=cart_url
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Bulk cart addition error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Bulk cart addition failed")

async def validate_bulk_cart_items(
    items: List[BulkCartItem],
    db: Session
) -> CartValidationResult:
    """Validate all cart items and prepare product mappings"""
    valid_items = []
    invalid_items = []
    product_map = {}
    
    # Get all SKUs for batch lookup
    skus = [item.sku for item in items]
    
    # Batch fetch products
    products_query = db.query(Product).filter(Product.sku.in_(skus))
    products = products_query.all()
    sku_to_product = {p.sku: p for p in products}
    
    for item in items:
        try:
            # Check if product exists
            product = sku_to_product.get(item.sku)
            if not product:
                invalid_items.append({
                    "sku": item.sku,
                    "quantity": item.quantity,
                    "reason": "Product not found",
                    "error_code": "PRODUCT_NOT_FOUND"
                })
                continue
            
            # Check if product is active
            if not product.is_active:
                invalid_items.append({
                    "sku": item.sku,
                    "quantity": item.quantity,
                    "reason": "Product is not active",
                    "error_code": "PRODUCT_INACTIVE"
                })
                continue
            
            # Check inventory availability
            if product.track_inventory and product.stock_quantity < item.quantity:
                invalid_items.append({
                    "sku": item.sku,
                    "quantity": item.quantity,
                    "available_quantity": product.stock_quantity,
                    "reason": "Insufficient inventory",
                    "error_code": "INSUFFICIENT_INVENTORY"
                })
                continue
            
            # Check quantity limits
            if product.min_order_quantity and item.quantity < product.min_order_quantity:
                invalid_items.append({
                    "sku": item.sku,
                    "quantity": item.quantity,
                    "min_quantity": product.min_order_quantity,
                    "reason": f"Minimum order quantity is {product.min_order_quantity}",
                    "error_code": "BELOW_MIN_QUANTITY"
                })
                continue
            
            if product.max_order_quantity and item.quantity > product.max_order_quantity:
                invalid_items.append({
                    "sku": item.sku,
                    "quantity": item.quantity,
                    "max_quantity": product.max_order_quantity,
                    "reason": f"Maximum order quantity is {product.max_order_quantity}",
                    "error_code": "ABOVE_MAX_QUANTITY"
                })
                continue
            
            # Item is valid
            valid_items.append(item)
            product_map[item.sku] = product
            
        except Exception as e:
            logger.error(f"Error validating item {item.sku}: {e}")
            invalid_items.append({
                "sku": item.sku,
                "quantity": item.quantity,
                "reason": f"Validation error: {str(e)}",
                "error_code": "VALIDATION_ERROR"
            })
    
    return CartValidationResult(
        valid_items=valid_items,
        invalid_items=invalid_items,
        product_map=product_map
    )

async def get_or_create_user_cart(user_email: str, db: Session) -> Cart:
    """Get existing cart or create new one for user"""
    try:
        # Try to find existing active cart
        existing_cart = db.query(Cart).filter(
            and_(
                Cart.user_email == user_email,
                Cart.status == "active"
            )
        ).first()
        
        if existing_cart:
            return existing_cart
        
        # Create new cart
        new_cart = Cart(
            id=uuid4(),
            user_email=user_email,
            status="active",
            currency="INR",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(new_cart)
        db.flush()  # Get the ID
        
        return new_cart
        
    except Exception as e:
        logger.error(f"Error getting/creating cart for {user_email}: {e}")
        raise

async def process_bulk_cart_additions(
    cart: Cart,
    validation_result: CartValidationResult,
    bulk_request: BulkCartRequest,
    db: Session
) -> Dict[str, Any]:
    """Process the actual cart additions based on merge strategy"""
    added_items = 0
    updated_items = 0
    failed_items = len(validation_result.invalid_items)
    details = []
    
    # Add invalid items to details
    for invalid_item in validation_result.invalid_items:
        details.append({
            "sku": invalid_item["sku"],
            "status": "failed",
            "reason": invalid_item["reason"],
            "error_code": invalid_item.get("error_code")
        })
    
    # Get existing cart items for conflict resolution
    existing_items = {item.product_sku: item for item in cart.items}
    
    for bulk_item in validation_result.valid_items:
        try:
            product = validation_result.product_map[bulk_item.sku]
            
            # Calculate pricing
            unit_price = bulk_item.unit_price_override or product.price
            line_total = unit_price * bulk_item.quantity
            
            if bulk_item.sku in existing_items:
                # Handle existing item based on merge strategy
                existing_item = existing_items[bulk_item.sku]
                
                if bulk_request.merge_strategy == "add":
                    # Add to existing quantity
                    new_quantity = existing_item.quantity + bulk_item.quantity
                    existing_item.quantity = new_quantity
                    existing_item.line_total = unit_price * new_quantity
                    existing_item.updated_at = datetime.utcnow()
                    
                    # Update notes if provided
                    if bulk_item.notes:
                        existing_notes = existing_item.notes or ""
                        existing_item.notes = f"{existing_notes}\n{bulk_item.notes}".strip()
                    
                    updated_items += 1
                    details.append({
                        "sku": bulk_item.sku,
                        "status": "updated",
                        "old_quantity": existing_item.quantity - bulk_item.quantity,
                        "new_quantity": new_quantity,
                        "action": "quantity_added"
                    })
                    
                elif bulk_request.merge_strategy == "replace":
                    # Replace existing item
                    existing_item.quantity = bulk_item.quantity
                    existing_item.unit_price = unit_price
                    existing_item.line_total = line_total
                    existing_item.notes = bulk_item.notes
                    existing_item.updated_at = datetime.utcnow()
                    
                    updated_items += 1
                    details.append({
                        "sku": bulk_item.sku,
                        "status": "updated",
                        "new_quantity": bulk_item.quantity,
                        "action": "replaced"
                    })
                    
                elif bulk_request.merge_strategy == "update":
                    # Update quantity only if new quantity is higher
                    if bulk_item.quantity > existing_item.quantity:
                        existing_item.quantity = bulk_item.quantity
                        existing_item.line_total = unit_price * bulk_item.quantity
                        existing_item.updated_at = datetime.utcnow()
                        
                        updated_items += 1
                        details.append({
                            "sku": bulk_item.sku,
                            "status": "updated",
                            "new_quantity": bulk_item.quantity,
                            "action": "quantity_increased"
                        })
                    else:
                        details.append({
                            "sku": bulk_item.sku,
                            "status": "skipped",
                            "reason": "Existing quantity is higher",
                            "existing_quantity": existing_item.quantity,
                            "requested_quantity": bulk_item.quantity
                        })
            else:
                # Add new item to cart
                cart_item = CartItem(
                    id=uuid4(),
                    cart_id=cart.id,
                    product_id=product.id,
                    product_sku=product.sku,
                    product_name=product.name,
                    quantity=bulk_item.quantity,
                    unit_price=unit_price,
                    line_total=line_total,
                    notes=bulk_item.notes,
                    project_reference=bulk_item.project_reference,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                
                db.add(cart_item)
                added_items += 1
                
                details.append({
                    "sku": bulk_item.sku,
                    "status": "added",
                    "quantity": bulk_item.quantity,
                    "unit_price": float(unit_price),
                    "line_total": float(line_total)
                })
                
        except Exception as e:
            logger.error(f"Error processing cart item {bulk_item.sku}: {e}")
            failed_items += 1
            details.append({
                "sku": bulk_item.sku,
                "status": "failed",
                "reason": f"Processing error: {str(e)}"
            })
    
    return {
        "added_items": added_items,
        "updated_items": updated_items,
        "failed_items": failed_items,
        "details": details
    }

async def recalculate_cart_totals(cart: Cart, db: Session):
    """Recalculate cart totals after bulk operations"""
    try:
        # Refresh cart items
        db.refresh(cart)
        
        subtotal = sum(item.line_total for item in cart.items)
        
        # Apply any applicable discounts (placeholder for future)
        discount_amount = 0.0
        
        # Calculate tax (placeholder - implement tax calculation)
        tax_rate = 0.0  # Implement proper tax calculation
        tax_amount = subtotal * tax_rate
        
        # Calculate shipping (placeholder - implement shipping calculation)
        shipping_amount = 0.0
        
        # Update cart totals
        cart.subtotal = subtotal
        cart.discount_amount = discount_amount
        cart.tax_amount = tax_amount
        cart.shipping_amount = shipping_amount
        cart.total_amount = subtotal - discount_amount + tax_amount + shipping_amount
        cart.item_count = len(cart.items)
        cart.updated_at = datetime.utcnow()
        
    except Exception as e:
        logger.error(f"Error recalculating cart totals: {e}")
        raise

async def notify_bulk_cart_addition(
    user_email: str,
    project_name: str,
    added_items: int,
    updated_items: int
):
    """Send notification about bulk cart addition completion"""
    try:
        logger.info(
            f"Bulk cart addition completed for {user_email}: "
            f"Project '{project_name}' - {added_items} added, {updated_items} updated"
        )
        
        # TODO: Integrate with notification service
        # await notification_service.send_cart_update_notification(
        #     user_email, project_name, added_items, updated_items
        # )
        
    except Exception as e:
        logger.error(f"Failed to send bulk cart notification: {e}")

@router.post("/bulk-validate", response_model=Dict[str, Any])
async def validate_bulk_cart_items_endpoint(
    items: List[BulkCartItem],
    db: Session = Depends(get_db)
):
    """
    Validate bulk cart items without adding them
    Used for preview functionality
    """
    try:
        validation_result = await validate_bulk_cart_items(items, db)
        
        return {
            "valid_items": len(validation_result.valid_items),
            "invalid_items": len(validation_result.invalid_items),
            "total_items": len(items),
            "validation_details": {
                "valid": [
                    {
                        "sku": item.sku,
                        "quantity": item.quantity,
                        "product_name": validation_result.product_map[item.sku].name,
                        "unit_price": float(validation_result.product_map[item.sku].price)
                    }
                    for item in validation_result.valid_items
                ],
                "invalid": validation_result.invalid_items
            }
        }
        
    except Exception as e:
        logger.error(f"Bulk cart validation error: {e}")
        raise HTTPException(status_code=500, detail="Validation failed")
