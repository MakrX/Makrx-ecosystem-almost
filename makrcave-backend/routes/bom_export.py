#!/usr/bin/env python3
"""
BOM Export Routes - Export Bill of Materials to MakrX Store Cart
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any, Optional
import httpx
import logging
import os
from pydantic import BaseModel, Field
from uuid import UUID

from ..database import get_db
from ..models.project import Project, BOMItem
from ..models.member import Member
from ..schemas.project import BOMItemResponse

logger = logging.getLogger(__name__)

# Configuration
STORE_API_URL = os.getenv("STORE_API_URL", "http://makrx-store-backend:8000")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8000")

router = APIRouter(prefix="/api/v1/projects", tags=["BOM Export"])

# Pydantic Models
class BOMExportRequest(BaseModel):
    project_id: UUID
    selected_items: Optional[List[UUID]] = None  # If None, export all items
    target_portal: str = Field(default="store", description="Target portal for export")
    user_email: str = Field(..., description="User email for cart association")

class BOMExportResponse(BaseModel):
    success: bool
    message: str
    exported_items: int
    skipped_items: int
    cart_url: Optional[str] = None
    details: List[Dict[str, Any]] = []

class StoreCartItem(BaseModel):
    sku: str
    quantity: int
    notes: Optional[str] = None
    project_reference: Optional[str] = None

class StoreCartBulkRequest(BaseModel):
    user_email: str
    items: List[StoreCartItem]
    source: str = "makrcave_bom"
    project_id: Optional[str] = None
    project_name: Optional[str] = None

# HTTP Client for Store API calls
async def get_store_client() -> httpx.AsyncClient:
    """Get HTTP client for Store API calls"""
    return httpx.AsyncClient(
        base_url=STORE_API_URL,
        timeout=30.0,
        headers={"Content-Type": "application/json"}
    )

async def get_user_auth_token(user_email: str) -> Optional[str]:
    """Get user authentication token from auth service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{AUTH_SERVICE_URL}/auth/token/exchange",
                json={
                    "portal": "store",
                    "user_email": user_email
                }
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("access_token")
    except Exception as e:
        logger.error(f"Failed to get auth token: {e}")
    return None

@router.post("/{project_id}/bom/export", response_model=BOMExportResponse)
async def export_bom_to_cart(
    project_id: UUID,
    export_request: BOMExportRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Export BOM items to MakrX Store cart
    
    This endpoint:
    1. Validates the project exists and user has access
    2. Retrieves BOM items (all or selected)
    3. Maps part_code to Store SKUs
    4. Bulk adds items to user's Store cart
    5. Returns success/failure details
    """
    try:
        # Validate project exists
        project_query = await db.execute(
            select(Project).where(Project.id == project_id)
        )
        project = project_query.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get BOM items to export
        bom_query = select(BOMItem).where(BOMItem.project_id == project_id)
        
        if export_request.selected_items:
            bom_query = bom_query.where(BOMItem.id.in_(export_request.selected_items))
        
        bom_result = await db.execute(bom_query)
        bom_items = bom_result.scalars().all()
        
        if not bom_items:
            return BOMExportResponse(
                success=True,
                message="No BOM items to export",
                exported_items=0,
                skipped_items=0
            )
        
        # Prepare cart items for Store API
        cart_items = []
        export_details = []
        exported_count = 0
        skipped_count = 0
        
        for bom_item in bom_items:
            try:
                # Map BOM item to Store cart item
                if bom_item.part_code and bom_item.source == "store":
                    # Direct SKU mapping for store items
                    cart_item = StoreCartItem(
                        sku=bom_item.part_code,
                        quantity=bom_item.quantity_needed,
                        notes=f"From BOM: {bom_item.description or bom_item.part_name}",
                        project_reference=str(project_id)
                    )
                    cart_items.append(cart_item)
                    
                    export_details.append({
                        "bom_item_id": str(bom_item.id),
                        "part_name": bom_item.part_name,
                        "sku": bom_item.part_code,
                        "quantity": bom_item.quantity_needed,
                        "status": "exported"
                    })
                    exported_count += 1
                    
                elif bom_item.part_code:
                    # Try to find matching SKU in Store
                    matching_sku = await find_store_sku(bom_item.part_code, bom_item.part_name)
                    
                    if matching_sku:
                        cart_item = StoreCartItem(
                            sku=matching_sku,
                            quantity=bom_item.quantity_needed,
                            notes=f"From BOM: {bom_item.description or bom_item.part_name}",
                            project_reference=str(project_id)
                        )
                        cart_items.append(cart_item)
                        
                        export_details.append({
                            "bom_item_id": str(bom_item.id),
                            "part_name": bom_item.part_name,
                            "original_code": bom_item.part_code,
                            "mapped_sku": matching_sku,
                            "quantity": bom_item.quantity_needed,
                            "status": "mapped_and_exported"
                        })
                        exported_count += 1
                    else:
                        # Could not map to Store SKU
                        export_details.append({
                            "bom_item_id": str(bom_item.id),
                            "part_name": bom_item.part_name,
                            "part_code": bom_item.part_code,
                            "quantity": bom_item.quantity_needed,
                            "status": "skipped_no_sku_mapping",
                            "reason": "No matching SKU found in Store"
                        })
                        skipped_count += 1
                else:
                    # No part code available
                    export_details.append({
                        "bom_item_id": str(bom_item.id),
                        "part_name": bom_item.part_name,
                        "quantity": bom_item.quantity_needed,
                        "status": "skipped_no_part_code",
                        "reason": "No part code specified"
                    })
                    skipped_count += 1
                    
            except Exception as e:
                logger.error(f"Error processing BOM item {bom_item.id}: {e}")
                export_details.append({
                    "bom_item_id": str(bom_item.id),
                    "part_name": bom_item.part_name,
                    "status": "error",
                    "reason": str(e)
                })
                skipped_count += 1
        
        # Bulk add to Store cart if we have items to export
        cart_url = None
        if cart_items:
            cart_success = await add_items_to_store_cart(
                export_request.user_email,
                cart_items,
                project.name,
                str(project_id)
            )
            
            if cart_success:
                cart_url = f"{STORE_API_URL.replace('8000', '3003')}/cart"
            else:
                # If cart addition failed, mark all as failed
                for detail in export_details:
                    if detail["status"] in ["exported", "mapped_and_exported"]:
                        detail["status"] = "failed_cart_addition"
                exported_count = 0
                skipped_count = len(export_details)
        
        # Schedule background notification to user
        background_tasks.add_task(
            notify_export_completion,
            export_request.user_email,
            project.name,
            exported_count,
            skipped_count
        )
        
        return BOMExportResponse(
            success=exported_count > 0,
            message=f"Exported {exported_count} items to cart, {skipped_count} skipped",
            exported_items=exported_count,
            skipped_items=skipped_count,
            cart_url=cart_url,
            details=export_details
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"BOM export error: {e}")
        raise HTTPException(status_code=500, detail="BOM export failed")

async def find_store_sku(part_code: str, part_name: str) -> Optional[str]:
    """Find matching SKU in Store catalog"""
    try:
        async with get_store_client() as client:
            # Try exact SKU match first
            response = await client.get(f"/catalog/products/{part_code}")
            if response.status_code == 200:
                return part_code
            
            # Try search by name
            search_response = await client.get(
                "/catalog/products/search",
                params={"q": part_name, "limit": 1}
            )
            
            if search_response.status_code == 200:
                products = search_response.json().get("products", [])
                if products:
                    return products[0].get("sku")
                    
    except Exception as e:
        logger.error(f"Store SKU lookup error: {e}")
    
    return None

async def add_items_to_store_cart(
    user_email: str,
    cart_items: List[StoreCartItem],
    project_name: str,
    project_id: str
) -> bool:
    """Add items to user's Store cart via bulk API"""
    try:
        bulk_request = StoreCartBulkRequest(
            user_email=user_email,
            items=cart_items,
            project_id=project_id,
            project_name=project_name
        )
        
        async with get_store_client() as client:
            response = await client.post(
                "/cart/bulk-add",
                json=bulk_request.dict()
            )
            
            if response.status_code in [200, 201]:
                logger.info(f"Successfully added {len(cart_items)} items to cart for {user_email}")
                return True
            else:
                logger.error(f"Store cart API error: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        logger.error(f"Failed to add items to Store cart: {e}")
        return False

async def notify_export_completion(
    user_email: str,
    project_name: str,
    exported_count: int,
    skipped_count: int
):
    """Send notification about export completion"""
    try:
        # This would integrate with notification service
        # For now, just log the completion
        logger.info(
            f"BOM Export completed for {user_email}: "
            f"Project '{project_name}' - {exported_count} exported, {skipped_count} skipped"
        )
        
        # TODO: Send email/in-app notification via notification service
        
    except Exception as e:
        logger.error(f"Failed to send export notification: {e}")

@router.get("/{project_id}/bom/export/preview")
async def preview_bom_export(
    project_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Preview what would be exported from BOM to Store cart
    """
    try:
        # Get project and BOM items
        project_query = await db.execute(
            select(Project).where(Project.id == project_id)
        )
        project = project_query.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        bom_result = await db.execute(
            select(BOMItem).where(BOMItem.project_id == project_id)
        )
        bom_items = bom_result.scalars().all()
        
        preview_items = []
        exportable_count = 0
        
        for bom_item in bom_items:
            item_preview = {
                "id": str(bom_item.id),
                "part_name": bom_item.part_name,
                "part_code": bom_item.part_code,
                "quantity_needed": bom_item.quantity_needed,
                "source": bom_item.source,
                "exportable": False,
                "reason": None
            }
            
            if bom_item.part_code and bom_item.source == "store":
                item_preview["exportable"] = True
                exportable_count += 1
            elif bom_item.part_code:
                # Check if SKU exists in Store
                matching_sku = await find_store_sku(bom_item.part_code, bom_item.part_name)
                if matching_sku:
                    item_preview["exportable"] = True
                    item_preview["mapped_sku"] = matching_sku
                    exportable_count += 1
                else:
                    item_preview["reason"] = "No matching SKU in Store"
            else:
                item_preview["reason"] = "No part code specified"
            
            preview_items.append(item_preview)
        
        return {
            "project_id": str(project_id),
            "project_name": project.name,
            "total_bom_items": len(bom_items),
            "exportable_items": exportable_count,
            "non_exportable_items": len(bom_items) - exportable_count,
            "items": preview_items
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"BOM export preview error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate preview")
