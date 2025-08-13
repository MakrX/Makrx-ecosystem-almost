"""
CRUD operations for products
Database operations for product management
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc, text
from sqlalchemy.orm import selectinload
from typing import List, Optional, Tuple, Dict, Any
import logging

from app.models.commerce import Product, Category, OrderItem
from app.schemas import ProductCreate, ProductUpdate, ProductSearch, ProductFilter, ProductSort

logger = logging.getLogger(__name__)

class ProductCRUD:
    """CRUD operations for products"""
    
    async def create(self, db: AsyncSession, product_data: ProductCreate) -> Product:
        """Create a new product"""
        try:
            product = Product(**product_data.dict())
            db.add(product)
            await db.commit()
            await db.refresh(product)
            return product
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to create product: {e}")
            raise
    
    async def get_by_id(self, db: AsyncSession, product_id: int) -> Optional[Product]:
        """Get product by ID with category"""
        try:
            query = select(Product).options(
                selectinload(Product.category)
            ).where(Product.id == product_id)
            
            result = await db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Failed to get product by ID {product_id}: {e}")
            return None
    
    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[Product]:
        """Get product by slug with category"""
        try:
            query = select(Product).options(
                selectinload(Product.category)
            ).where(Product.slug == slug)
            
            result = await db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Failed to get product by slug {slug}: {e}")
            return None
    
    async def update(self, db: AsyncSession, product_id: int, product_data: ProductUpdate) -> Optional[Product]:
        """Update product"""
        try:
            product = await self.get_by_id(db, product_id)
            if not product:
                return None
            
            update_data = product_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(product, field, value)
            
            await db.commit()
            await db.refresh(product)
            return product
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to update product {product_id}: {e}")
            raise
    
    async def delete(self, db: AsyncSession, product_id: int) -> bool:
        """Soft delete product (set is_active = False)"""
        try:
            product = await self.get_by_id(db, product_id)
            if not product:
                return False
            
            product.is_active = False
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to delete product {product_id}: {e}")
            return False
    
    async def search_products(self, db: AsyncSession, search: ProductSearch) -> Tuple[List[Product], int]:
        """Search products with filtering, sorting, and pagination"""
        try:
            # Base query
            query = select(Product).options(
                selectinload(Product.category)
            ).where(Product.is_active == True)
            
            # Count query for pagination
            count_query = select(func.count(Product.id)).where(Product.is_active == True)
            
            # Apply filters
            if search.filters:
                filters = search.filters
                
                # Category filter
                if filters.category_id:
                    query = query.where(Product.category_id == filters.category_id)
                    count_query = count_query.where(Product.category_id == filters.category_id)
                
                # Brand filter
                if filters.brand:
                    query = query.where(Product.brand.ilike(f"%{filters.brand}%"))
                    count_query = count_query.where(Product.brand.ilike(f"%{filters.brand}%"))
                
                # Price range filters
                if filters.price_min is not None:
                    query = query.where(
                        or_(
                            and_(Product.sale_price.isnot(None), Product.sale_price >= filters.price_min),
                            and_(Product.sale_price.is_(None), Product.price >= filters.price_min)
                        )
                    )
                    count_query = count_query.where(
                        or_(
                            and_(Product.sale_price.isnot(None), Product.sale_price >= filters.price_min),
                            and_(Product.sale_price.is_(None), Product.price >= filters.price_min)
                        )
                    )
                
                if filters.price_max is not None:
                    query = query.where(
                        or_(
                            and_(Product.sale_price.isnot(None), Product.sale_price <= filters.price_max),
                            and_(Product.sale_price.is_(None), Product.price <= filters.price_max)
                        )
                    )
                    count_query = count_query.where(
                        or_(
                            and_(Product.sale_price.isnot(None), Product.sale_price <= filters.price_max),
                            and_(Product.sale_price.is_(None), Product.price <= filters.price_max)
                        )
                    )
                
                # Stock filter
                if filters.in_stock is not None:
                    if filters.in_stock:
                        query = query.where(
                            or_(
                                Product.track_inventory == False,
                                Product.allow_backorder == True,
                                Product.stock_qty > 0
                            )
                        )
                        count_query = count_query.where(
                            or_(
                                Product.track_inventory == False,
                                Product.allow_backorder == True,
                                Product.stock_qty > 0
                            )
                        )
                    else:
                        query = query.where(
                            and_(
                                Product.track_inventory == True,
                                Product.allow_backorder == False,
                                Product.stock_qty <= 0
                            )
                        )
                        count_query = count_query.where(
                            and_(
                                Product.track_inventory == True,
                                Product.allow_backorder == False,
                                Product.stock_qty <= 0
                            )
                        )
                
                # Featured filter
                if filters.is_featured is not None:
                    query = query.where(Product.is_featured == filters.is_featured)
                    count_query = count_query.where(Product.is_featured == filters.is_featured)
                
                # Tags filter (array contains)
                if filters.tags:
                    for tag in filters.tags:
                        query = query.where(Product.tags.contains([tag]))
                        count_query = count_query.where(Product.tags.contains([tag]))
            
            # Apply search query
            if search.q:
                search_term = f"%{search.q}%"
                search_filter = or_(
                    Product.name.ilike(search_term),
                    Product.description.ilike(search_term),
                    Product.short_description.ilike(search_term),
                    Product.brand.ilike(search_term)
                )
                query = query.where(search_filter)
                count_query = count_query.where(search_filter)
            
            # Apply sorting
            if search.sort == ProductSort.NAME_ASC:
                query = query.order_by(asc(Product.name))
            elif search.sort == ProductSort.NAME_DESC:
                query = query.order_by(desc(Product.name))
            elif search.sort == ProductSort.PRICE_ASC:
                query = query.order_by(
                    asc(func.coalesce(Product.sale_price, Product.price))
                )
            elif search.sort == ProductSort.PRICE_DESC:
                query = query.order_by(
                    desc(func.coalesce(Product.sale_price, Product.price))
                )
            elif search.sort == ProductSort.CREATED_ASC:
                query = query.order_by(asc(Product.created_at))
            elif search.sort == ProductSort.CREATED_DESC:
                query = query.order_by(desc(Product.created_at))
            else:  # Default to created_desc
                query = query.order_by(desc(Product.created_at))
            
            # Get total count
            count_result = await db.execute(count_query)
            total = count_result.scalar()
            
            # Apply pagination
            offset = (search.page - 1) * search.per_page
            query = query.offset(offset).limit(search.per_page)
            
            # Execute query
            result = await db.execute(query)
            products = result.scalars().all()
            
            return list(products), total
            
        except Exception as e:
            logger.error(f"Failed to search products: {e}")
            raise
    
    async def get_featured_products(self, db: AsyncSession, limit: int = 10) -> List[Product]:
        """Get featured products"""
        try:
            query = select(Product).options(
                selectinload(Product.category)
            ).where(
                and_(Product.is_active == True, Product.is_featured == True)
            ).order_by(desc(Product.created_at)).limit(limit)
            
            result = await db.execute(query)
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f"Failed to get featured products: {e}")
            return []
    
    async def get_popular_products(
        self, 
        db: AsyncSession, 
        category_id: Optional[int] = None,
        limit: int = 10,
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """Get popular products based on order data"""
        try:
            # This would typically join with order_items and calculate popularity
            # For now, return featured products as a placeholder
            query = select(Product).options(
                selectinload(Product.category)
            ).where(Product.is_active == True)
            
            if category_id:
                query = query.where(Product.category_id == category_id)
            
            query = query.order_by(desc(Product.created_at)).limit(limit)
            
            result = await db.execute(query)
            products = result.scalars().all()
            
            return [
                {
                    "product": product,
                    "order_count": 0,  # Would calculate from actual orders
                    "popularity_score": 0.0
                }
                for product in products
            ]
        except Exception as e:
            logger.error(f"Failed to get popular products: {e}")
            return []
    
    async def get_search_suggestions(self, db: AsyncSession, query: str, limit: int = 10) -> List[str]:
        """Get search suggestions for autocomplete"""
        try:
            search_term = f"%{query}%"
            
            # Get product names and brands that match
            name_query = select(Product.name).where(
                and_(
                    Product.is_active == True,
                    Product.name.ilike(search_term)
                )
            ).limit(limit // 2)
            
            brand_query = select(Product.brand).where(
                and_(
                    Product.is_active == True,
                    Product.brand.isnot(None),
                    Product.brand.ilike(search_term)
                )
            ).distinct().limit(limit // 2)
            
            name_result = await db.execute(name_query)
            brand_result = await db.execute(brand_query)
            
            suggestions = []
            suggestions.extend([name for name in name_result.scalars() if name])
            suggestions.extend([brand for brand in brand_result.scalars() if brand])
            
            return list(set(suggestions))[:limit]  # Remove duplicates and limit
            
        except Exception as e:
            logger.error(f"Failed to get search suggestions: {e}")
            return []
    
    async def get_all_brands(self, db: AsyncSession) -> List[str]:
        """Get all product brands"""
        try:
            query = select(Product.brand).where(
                and_(
                    Product.is_active == True,
                    Product.brand.isnot(None)
                )
            ).distinct().order_by(Product.brand)
            
            result = await db.execute(query)
            return [brand for brand in result.scalars() if brand]
        except Exception as e:
            logger.error(f"Failed to get brands: {e}")
            return []
    
    async def get_comparison_attributes(self, products: List[Product]) -> Dict[str, Any]:
        """Get comparison attributes for a set of products"""
        try:
            if not products:
                return {}
            
            # Extract common attributes for comparison
            all_specs = {}
            all_attributes = {}
            
            for product in products:
                if product.specifications:
                    for key, value in product.specifications.items():
                        if key not in all_specs:
                            all_specs[key] = []
                        all_specs[key].append(value)
                
                if product.attributes:
                    for key, value in product.attributes.items():
                        if key not in all_attributes:
                            all_attributes[key] = []
                        all_attributes[key].append(value)
            
            return {
                "specifications": all_specs,
                "attributes": all_attributes,
                "price_range": {
                    "min": min(p.price for p in products),
                    "max": max(p.price for p in products)
                }
            }
        except Exception as e:
            logger.error(f"Failed to get comparison attributes: {e}")
            return {}

# Global instance
product_crud = ProductCRUD()
