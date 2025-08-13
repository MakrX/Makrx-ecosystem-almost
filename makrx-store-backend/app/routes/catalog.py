"""
Catalog API routes
Products and categories endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import logging

from app.core.db import get_db
from app.core.security import get_current_user, AuthUser
from app.schemas import (
    Product, ProductCreate, ProductUpdate, ProductList, ProductSearch, ProductFilter,
    Category, CategoryCreate, CategoryUpdate
)
from app.crud.products import product_crud
from app.crud.categories import category_crud
from app.utils.pagination import paginate_query

logger = logging.getLogger(__name__)

router = APIRouter()

# Category endpoints
@router.get("/categories", response_model=List[Category])
async def get_categories(
    parent_id: Optional[int] = Query(None, description="Filter by parent category"),
    include_inactive: bool = Query(False, description="Include inactive categories"),
    db: AsyncSession = Depends(get_db)
):
    """Get all categories with optional filtering"""
    try:
        categories = await category_crud.get_categories(
            db, 
            parent_id=parent_id,
            include_inactive=include_inactive
        )
        return categories
    except Exception as e:
        logger.error(f"Failed to get categories: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve categories")

@router.get("/categories/{category_id}", response_model=Category)
async def get_category(
    category_id: int = Path(..., description="Category ID"),
    db: AsyncSession = Depends(get_db)
):
    """Get category by ID"""
    category = await category_crud.get_by_id(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.get("/categories/slug/{slug}", response_model=Category)
async def get_category_by_slug(
    slug: str = Path(..., description="Category slug"),
    db: AsyncSession = Depends(get_db)
):
    """Get category by slug"""
    category = await category_crud.get_by_slug(db, slug)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.get("/categories/by-path/{path:path}", response_model=Category)
async def get_category_by_path(
    path: str = Path(..., description="Category path (e.g., 3d-printing/materials/pla)"),
    db: AsyncSession = Depends(get_db)
):
    """Get category by hierarchical path"""
    try:
        category = await category_crud.get_by_path(db, path)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return category
    except Exception as e:
        logger.error(f"Failed to get category by path {path}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve category")

# Product endpoints
@router.get("/products", response_model=ProductList)
async def get_products(
    q: Optional[str] = Query(None, description="Search query"),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    price_min: Optional[float] = Query(None, description="Minimum price", ge=0),
    price_max: Optional[float] = Query(None, description="Maximum price", ge=0),
    in_stock: Optional[bool] = Query(None, description="Filter by stock availability"),
    is_featured: Optional[bool] = Query(None, description="Filter featured products"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    sort: str = Query("created_desc", description="Sort order"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db)
):
    """Get products with filtering, searching, and pagination"""
    try:
        # Build filter object
        filters = ProductFilter(
            category_id=category_id,
            brand=brand,
            price_min=price_min,
            price_max=price_max,
            in_stock=in_stock,
            is_featured=is_featured,
            tags=tags
        )
        
        # Build search object
        search = ProductSearch(
            q=q,
            filters=filters,
            sort=sort,
            page=page,
            per_page=per_page
        )
        
        products, total = await product_crud.search_products(db, search)
        
        return ProductList(
            products=products,
            total=total,
            page=page,
            per_page=per_page,
            pages=(total + per_page - 1) // per_page
        )
        
    except Exception as e:
        logger.error(f"Failed to search products: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve products")

@router.get("/products/{product_id}", response_model=Product)
async def get_product(
    product_id: int = Path(..., description="Product ID"),
    db: AsyncSession = Depends(get_db)
):
    """Get product by ID"""
    product = await product_crud.get_by_id(db, product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/products/slug/{slug}", response_model=Product)
async def get_product_by_slug(
    slug: str = Path(..., description="Product slug"),
    db: AsyncSession = Depends(get_db)
):
    """Get product by slug"""
    product = await product_crud.get_by_slug(db, slug)
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/products/category/{category_id}", response_model=ProductList)
async def get_products_by_category(
    category_id: int = Path(..., description="Category ID"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    sort: str = Query("created_desc", description="Sort order"),
    db: AsyncSession = Depends(get_db)
):
    """Get products in a specific category"""
    try:
        # Verify category exists
        category = await category_crud.get_by_id(db, category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        # Build search with category filter
        search = ProductSearch(
            filters=ProductFilter(category_id=category_id),
            sort=sort,
            page=page,
            per_page=per_page
        )
        
        products, total = await product_crud.search_products(db, search)
        
        return ProductList(
            products=products,
            total=total,
            page=page,
            per_page=per_page,
            pages=(total + per_page - 1) // per_page
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get products by category: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve products")

@router.get("/products/featured", response_model=List[Product])
async def get_featured_products(
    limit: int = Query(10, ge=1, le=50, description="Number of featured products"),
    db: AsyncSession = Depends(get_db)
):
    """Get featured products"""
    try:
        products = await product_crud.get_featured_products(db, limit=limit)
        return products
    except Exception as e:
        logger.error(f"Failed to get featured products: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve featured products")

@router.get("/search/suggestions")
async def get_search_suggestions(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(10, ge=1, le=20, description="Number of suggestions"),
    db: AsyncSession = Depends(get_db)
):
    """Get search suggestions for autocomplete"""
    try:
        suggestions = await product_crud.get_search_suggestions(db, query=q, limit=limit)
        return {"suggestions": suggestions}
    except Exception as e:
        logger.error(f"Failed to get search suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get suggestions")

@router.get("/brands")
async def get_brands(
    db: AsyncSession = Depends(get_db)
):
    """Get all product brands"""
    try:
        brands = await product_crud.get_all_brands(db)
        return {"brands": brands}
    except Exception as e:
        logger.error(f"Failed to get brands: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve brands")

# Product comparison endpoints
@router.post("/products/compare")
async def compare_products(
    product_ids: List[int],
    db: AsyncSession = Depends(get_db)
):
    """Compare multiple products"""
    if len(product_ids) < 2 or len(product_ids) > 5:
        raise HTTPException(
            status_code=400, 
            detail="Must compare between 2 and 5 products"
        )
    
    try:
        products = []
        for product_id in product_ids:
            product = await product_crud.get_by_id(db, product_id)
            if not product or not product.is_active:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Product {product_id} not found"
                )
            products.append(product)
        
        # Build comparison data
        comparison = {
            "products": products,
            "comparison_attributes": await product_crud.get_comparison_attributes(products)
        }
        
        return comparison
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to compare products: {e}")
        raise HTTPException(status_code=500, detail="Failed to compare products")

# Analytics endpoints (public data only)
@router.get("/analytics/popular-products")
async def get_popular_products(
    category_id: Optional[int] = Query(None, description="Filter by category"),
    limit: int = Query(10, ge=1, le=50, description="Number of products"),
    days: int = Query(30, ge=1, le=365, description="Time period in days"),
    db: AsyncSession = Depends(get_db)
):
    """Get popular products based on order data"""
    try:
        products = await product_crud.get_popular_products(
            db, 
            category_id=category_id,
            limit=limit,
            days=days
        )
        return {"products": products}
    except Exception as e:
        logger.error(f"Failed to get popular products: {e}")
        raise HTTPException(status_code=500, detail="Failed to get popular products")

@router.get("/categories/{category_id}/stats")
async def get_category_stats(
    category_id: int = Path(..., description="Category ID"),
    db: AsyncSession = Depends(get_db)
):
    """Get category statistics"""
    try:
        category = await category_crud.get_by_id(db, category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        stats = await category_crud.get_category_stats(db, category_id)
        return stats
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get category stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get category statistics")
