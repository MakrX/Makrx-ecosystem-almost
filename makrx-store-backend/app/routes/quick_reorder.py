"""
Quick Reorder System API Routes
Enables makerspaces and service providers to quickly reorder frequently used items
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_, func
from typing import List, Optional, Dict, Any
import logging
import json
from datetime import datetime, timedelta
from uuid import uuid4

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.commerce import Product, Order, OrderItem, Cart, CartItem
from app.models.subscriptions import QuickReorder
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/quick-reorder", tags=["Quick Reorder"])

# Pydantic Models
class QuickReorderItem(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)
    notes: Optional[str] = None
    priority: int = Field(default=1, ge=1, le=5)  # 1=low, 5=critical

class CreateQuickReorderRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    items: List[QuickReorderItem] = Field(..., min_items=1)
    makrcave_id: Optional[str] = None  # Link to makerspace
    auto_reorder: bool = False
    reorder_frequency: Optional[str] = Field(None, regex="^(weekly|monthly|as_needed)$")
    reorder_threshold: Optional[Dict[str, int]] = None  # Product ID -> threshold

class UpdateQuickReorderRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    items: Optional[List[QuickReorderItem]] = None
    auto_reorder: Optional[bool] = None
    reorder_frequency: Optional[str] = None
    reorder_threshold: Optional[Dict[str, int]] = None
    is_active: Optional[bool] = None

class QuickReorderResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    total_items: int
    estimated_total: float
    currency: str
    is_active: bool
    auto_reorder: bool
    reorder_frequency: Optional[str]
    times_used: int
    last_ordered: Optional[datetime]
    created_at: datetime
    items: List[Dict[str, Any]]

class ReorderExecutionRequest(BaseModel):
    reorder_id: str
    quantity_multiplier: float = Field(default=1.0, gt=0, le=10)
    exclude_out_of_stock: bool = True
    add_to_cart: bool = True
    notes: Optional[str] = None

class ReorderExecutionResponse(BaseModel):
    success: bool
    cart_id: Optional[str] = None
    order_id: Optional[str] = None
    items_added: int
    items_skipped: int
    total_amount: float
    skipped_items: List[Dict[str, Any]] = []
    warnings: List[str] = []

@router.post("/create", response_model=QuickReorderResponse)
async def create_quick_reorder(
    request: CreateQuickReorderRequest,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new quick reorder template
    """
    try:
        # Validate all products exist and are active
        product_ids = [item.product_id for item in request.items]
        products = db.query(Product).filter(
            and_(
                Product.id.in_(product_ids),
                Product.is_active == True
            )
        ).all()
        
        if len(products) != len(product_ids):
            found_ids = {p.id for p in products}
            missing_ids = set(product_ids) - found_ids
            raise HTTPException(
                status_code=400,
                detail=f"Products not found or inactive: {list(missing_ids)}"
            )
        
        # Calculate estimated total
        product_lookup = {p.id: p for p in products}
        estimated_total = 0
        validated_items = []
        
        for item in request.items:
            product = product_lookup[item.product_id]
            effective_price = product.sale_price or product.price
            item_total = float(effective_price) * item.quantity
            estimated_total += item_total
            
            validated_items.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "notes": item.notes,
                "priority": item.priority,
                "estimated_price": float(effective_price),
                "estimated_total": item_total
            })
        
        # Create quick reorder record
        quick_reorder = QuickReorder(
            id=uuid4(),
            user_id=user_id,
            makrcave_id=request.makrcave_id,
            name=request.name,
            description=request.description,
            products=validated_items,
            total_items=len(validated_items),
            estimated_total=estimated_total,
            auto_reorder=request.auto_reorder,
            reorder_frequency=request.reorder_frequency,
            reorder_threshold=request.reorder_threshold or {},
            created_at=datetime.utcnow()
        )
        
        db.add(quick_reorder)
        db.commit()
        db.refresh(quick_reorder)
        
        # Build response
        return QuickReorderResponse(
            id=str(quick_reorder.id),
            name=quick_reorder.name,
            description=quick_reorder.description,
            total_items=quick_reorder.total_items,
            estimated_total=quick_reorder.estimated_total,
            currency="INR",
            is_active=quick_reorder.is_active,
            auto_reorder=quick_reorder.auto_reorder,
            reorder_frequency=quick_reorder.reorder_frequency,
            times_used=quick_reorder.times_used,
            last_ordered=quick_reorder.last_ordered,
            created_at=quick_reorder.created_at,
            items=validated_items
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create quick reorder error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create quick reorder")

@router.get("/list", response_model=List[QuickReorderResponse])
async def list_quick_reorders(
    makrcave_id: Optional[str] = None,
    include_inactive: bool = False,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List user's quick reorder templates
    """
    try:
        query = db.query(QuickReorder).filter(QuickReorder.user_id == user_id)
        
        if makrcave_id:
            query = query.filter(QuickReorder.makrcave_id == makrcave_id)
        
        if not include_inactive:
            query = query.filter(QuickReorder.is_active == True)
        
        reorders = query.order_by(QuickReorder.created_at.desc()).all()
        
        response = []
        for reorder in reorders:
            response.append(QuickReorderResponse(
                id=str(reorder.id),
                name=reorder.name,
                description=reorder.description,
                total_items=reorder.total_items,
                estimated_total=reorder.estimated_total,
                currency="INR",
                is_active=reorder.is_active,
                auto_reorder=reorder.auto_reorder,
                reorder_frequency=reorder.reorder_frequency,
                times_used=reorder.times_used,
                last_ordered=reorder.last_ordered,
                created_at=reorder.created_at,
                items=reorder.products or []
            ))
        
        return response
        
    except Exception as e:
        logger.error(f"List quick reorders error: {e}")
        raise HTTPException(status_code=500, detail="Failed to list quick reorders")

@router.get("/{reorder_id}", response_model=QuickReorderResponse)
async def get_quick_reorder(
    reorder_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get specific quick reorder template with current pricing
    """
    try:
        reorder = db.query(QuickReorder).filter(
            and_(
                QuickReorder.id == reorder_id,
                QuickReorder.user_id == user_id
            )
        ).first()
        
        if not reorder:
            raise HTTPException(status_code=404, detail="Quick reorder not found")
        
        # Update pricing for items
        updated_items = []
        current_total = 0
        
        for item in reorder.products or []:
            product = db.query(Product).filter(Product.id == item["product_id"]).first()
            if product and product.is_active:
                current_price = product.sale_price or product.price
                item_total = float(current_price) * item["quantity"]
                current_total += item_total
                
                updated_item = item.copy()
                updated_item.update({
                    "current_price": float(current_price),
                    "current_total": item_total,
                    "price_changed": float(current_price) != item.get("estimated_price", 0),
                    "in_stock": product.stock_qty > 0,
                    "stock_qty": product.stock_qty,
                    "product_name": product.name,
                    "product_brand": product.brand
                })
                updated_items.append(updated_item)
        
        return QuickReorderResponse(
            id=str(reorder.id),
            name=reorder.name,
            description=reorder.description,
            total_items=len(updated_items),
            estimated_total=current_total,
            currency="INR",
            is_active=reorder.is_active,
            auto_reorder=reorder.auto_reorder,
            reorder_frequency=reorder.reorder_frequency,
            times_used=reorder.times_used,
            last_ordered=reorder.last_ordered,
            created_at=reorder.created_at,
            items=updated_items
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get quick reorder error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get quick reorder")

@router.put("/{reorder_id}", response_model=QuickReorderResponse)
async def update_quick_reorder(
    reorder_id: str,
    request: UpdateQuickReorderRequest,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update quick reorder template
    """
    try:
        reorder = db.query(QuickReorder).filter(
            and_(
                QuickReorder.id == reorder_id,
                QuickReorder.user_id == user_id
            )
        ).first()
        
        if not reorder:
            raise HTTPException(status_code=404, detail="Quick reorder not found")
        
        # Update fields
        if request.name is not None:
            reorder.name = request.name
        if request.description is not None:
            reorder.description = request.description
        if request.auto_reorder is not None:
            reorder.auto_reorder = request.auto_reorder
        if request.reorder_frequency is not None:
            reorder.reorder_frequency = request.reorder_frequency
        if request.reorder_threshold is not None:
            reorder.reorder_threshold = request.reorder_threshold
        if request.is_active is not None:
            reorder.is_active = request.is_active
        
        # Update items if provided
        if request.items is not None:
            # Validate products
            product_ids = [item.product_id for item in request.items]
            products = db.query(Product).filter(
                and_(
                    Product.id.in_(product_ids),
                    Product.is_active == True
                )
            ).all()
            
            if len(products) != len(product_ids):
                found_ids = {p.id for p in products}
                missing_ids = set(product_ids) - found_ids
                raise HTTPException(
                    status_code=400,
                    detail=f"Products not found or inactive: {list(missing_ids)}"
                )
            
            # Calculate new totals
            product_lookup = {p.id: p for p in products}
            estimated_total = 0
            validated_items = []
            
            for item in request.items:
                product = product_lookup[item.product_id]
                effective_price = product.sale_price or product.price
                item_total = float(effective_price) * item.quantity
                estimated_total += item_total
                
                validated_items.append({
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "notes": item.notes,
                    "priority": item.priority,
                    "estimated_price": float(effective_price),
                    "estimated_total": item_total
                })
            
            reorder.products = validated_items
            reorder.total_items = len(validated_items)
            reorder.estimated_total = estimated_total
        
        reorder.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(reorder)
        
        return QuickReorderResponse(
            id=str(reorder.id),
            name=reorder.name,
            description=reorder.description,
            total_items=reorder.total_items,
            estimated_total=reorder.estimated_total,
            currency="INR",
            is_active=reorder.is_active,
            auto_reorder=reorder.auto_reorder,
            reorder_frequency=reorder.reorder_frequency,
            times_used=reorder.times_used,
            last_ordered=reorder.last_ordered,
            created_at=reorder.created_at,
            items=reorder.products or []
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update quick reorder error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update quick reorder")

@router.post("/execute", response_model=ReorderExecutionResponse)
async def execute_quick_reorder(
    request: ReorderExecutionRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Execute a quick reorder - add items to cart or create order
    """
    try:
        reorder = db.query(QuickReorder).filter(
            and_(
                QuickReorder.id == request.reorder_id,
                QuickReorder.user_id == user_id,
                QuickReorder.is_active == True
            )
        ).first()
        
        if not reorder:
            raise HTTPException(status_code=404, detail="Quick reorder not found or inactive")
        
        # Get or create cart if adding to cart
        cart = None
        if request.add_to_cart:
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
        
        items_added = 0
        items_skipped = 0
        total_amount = 0
        skipped_items = []
        warnings = []
        
        # Process each item
        for item in reorder.products or []:
            product = db.query(Product).filter(Product.id == item["product_id"]).first()
            
            if not product or not product.is_active:
                items_skipped += 1
                skipped_items.append({
                    "product_id": item["product_id"],
                    "reason": "Product not found or inactive",
                    "original_quantity": item["quantity"]
                })
                continue
            
            # Calculate quantity with multiplier
            final_quantity = int(item["quantity"] * request.quantity_multiplier)
            
            # Check stock
            if request.exclude_out_of_stock and product.stock_qty < final_quantity:
                items_skipped += 1
                skipped_items.append({
                    "product_id": item["product_id"],
                    "product_name": product.name,
                    "reason": f"Insufficient stock: {product.stock_qty} available, {final_quantity} requested",
                    "available_quantity": product.stock_qty,
                    "requested_quantity": final_quantity
                })
                continue
            
            # Add stock warning if needed
            if product.stock_qty < final_quantity:
                warnings.append(f"{product.name}: Only {product.stock_qty} available, {final_quantity} requested")
                final_quantity = product.stock_qty
            
            # Calculate pricing
            current_price = product.sale_price or product.price
            item_total = float(current_price) * final_quantity
            total_amount += item_total
            
            # Add to cart if requested
            if request.add_to_cart and cart:
                # Check if item already in cart
                existing_item = db.query(CartItem).filter(
                    and_(
                        CartItem.cart_id == cart.id,
                        CartItem.product_id == product.id
                    )
                ).first()
                
                if existing_item:
                    existing_item.quantity += final_quantity
                    existing_item.updated_at = datetime.utcnow()
                else:
                    cart_item = CartItem(
                        cart_id=cart.id,
                        product_id=product.id,
                        quantity=final_quantity,
                        unit_price=current_price,
                        meta={
                            "quick_reorder_id": str(reorder.id),
                            "quick_reorder_name": reorder.name,
                            "notes": request.notes
                        }
                    )
                    db.add(cart_item)
            
            items_added += 1
        
        # Update reorder usage stats
        reorder.times_used += 1
        reorder.last_ordered = datetime.utcnow()
        
        # Update cart timestamp
        if cart:
            cart.updated_at = datetime.utcnow()
        
        db.commit()
        
        # Schedule inventory threshold check
        background_tasks.add_task(
            check_reorder_thresholds,
            user_id,
            str(reorder.id)
        )
        
        return ReorderExecutionResponse(
            success=True,
            cart_id=str(cart.id) if cart else None,
            order_id=None,  # Would be set if directly creating order
            items_added=items_added,
            items_skipped=items_skipped,
            total_amount=total_amount,
            skipped_items=skipped_items,
            warnings=warnings
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Execute quick reorder error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to execute quick reorder")

@router.delete("/{reorder_id}")
async def delete_quick_reorder(
    reorder_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a quick reorder template
    """
    try:
        reorder = db.query(QuickReorder).filter(
            and_(
                QuickReorder.id == reorder_id,
                QuickReorder.user_id == user_id
            )
        ).first()
        
        if not reorder:
            raise HTTPException(status_code=404, detail="Quick reorder not found")
        
        db.delete(reorder)
        db.commit()
        
        return {"success": True, "message": "Quick reorder deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete quick reorder error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete quick reorder")

@router.post("/from-order/{order_id}")
async def create_reorder_from_order(
    order_id: int,
    name: str,
    description: Optional[str] = None,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a quick reorder template from a previous order
    """
    try:
        # Get order and verify ownership
        order = db.query(Order).filter(
            and_(
                Order.id == order_id,
                Order.user_id == user_id
            )
        ).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Get order items
        order_items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
        
        if not order_items:
            raise HTTPException(status_code=400, detail="Order has no items")
        
        # Build items list
        reorder_items = []
        for item in order_items:
            # Verify product still exists and is active
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product and product.is_active:
                reorder_items.append(QuickReorderItem(
                    product_id=item.product_id,
                    quantity=item.quantity,
                    notes=f"From order #{order.order_number}"
                ))
        
        if not reorder_items:
            raise HTTPException(status_code=400, detail="No valid products found in order")
        
        # Create quick reorder
        create_request = CreateQuickReorderRequest(
            name=name,
            description=description or f"Recreated from order #{order.order_number}",
            items=reorder_items
        )
        
        return await create_quick_reorder(create_request, user_id, db)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create reorder from order error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create reorder from order")

@router.get("/suggestions/{makrcave_id}")
async def get_reorder_suggestions(
    makrcave_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get suggested items for reordering based on usage patterns
    """
    try:
        # This would analyze MakrCave inventory levels and usage patterns
        # For now, return frequently ordered items
        
        # Get user's order history
        recent_orders = db.query(Order).filter(
            and_(
                Order.user_id == user_id,
                Order.created_at >= datetime.utcnow() - timedelta(days=90)
            )
        ).all()
        
        order_ids = [order.id for order in recent_orders]
        
        if not order_ids:
            return {"suggestions": []}
        
        # Find frequently ordered products
        frequent_items = db.query(
            OrderItem.product_id,
            func.count(OrderItem.id).label('order_count'),
            func.sum(OrderItem.quantity).label('total_quantity'),
            func.avg(OrderItem.quantity).label('avg_quantity')
        ).filter(
            OrderItem.order_id.in_(order_ids)
        ).group_by(OrderItem.product_id).having(
            func.count(OrderItem.id) >= 2
        ).order_by(func.count(OrderItem.id).desc()).limit(20).all()
        
        suggestions = []
        for item in frequent_items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product and product.is_active:
                suggestions.append({
                    "product_id": product.id,
                    "product_name": product.name,
                    "brand": product.brand,
                    "current_price": float(product.sale_price or product.price),
                    "suggested_quantity": int(item.avg_quantity),
                    "order_frequency": item.order_count,
                    "total_ordered": item.total_quantity,
                    "in_stock": product.stock_qty > 0,
                    "stock_level": product.stock_qty
                })
        
        return {"suggestions": suggestions}
        
    except Exception as e:
        logger.error(f"Get reorder suggestions error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get reorder suggestions")

# Background Tasks

async def check_reorder_thresholds(user_id: str, reorder_id: str):
    """Check if any products in the reorder are below threshold (background task)"""
    try:
        # This would check MakrCave inventory levels and trigger notifications
        # For now, just log the check
        logger.info(f"Checking reorder thresholds for user {user_id}, reorder {reorder_id}")
        
    except Exception as e:
        logger.error(f"Reorder threshold check error: {e}")
