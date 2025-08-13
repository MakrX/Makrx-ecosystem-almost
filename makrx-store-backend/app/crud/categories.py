"""
CRUD operations for categories
Database operations for category management
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any
import logging

from app.models.commerce import Category, Product
from app.schemas import CategoryCreate, CategoryUpdate

logger = logging.getLogger(__name__)

class CategoryCRUD:
    """CRUD operations for categories"""
    
    async def create(self, db: AsyncSession, category_data: CategoryCreate) -> Category:
        """Create a new category"""
        try:
            category = Category(**category_data.dict())
            db.add(category)
            await db.commit()
            await db.refresh(category)
            return category
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to create category: {e}")
            raise
    
    async def get_by_id(self, db: AsyncSession, category_id: int) -> Optional[Category]:
        """Get category by ID with children"""
        try:
            query = select(Category).options(
                selectinload(Category.children),
                selectinload(Category.parent)
            ).where(Category.id == category_id)
            
            result = await db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Failed to get category by ID {category_id}: {e}")
            return None
    
    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[Category]:
        """Get category by slug with children"""
        try:
            query = select(Category).options(
                selectinload(Category.children),
                selectinload(Category.parent)
            ).where(Category.slug == slug)

            result = await db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Failed to get category by slug {slug}: {e}")
            return None

    async def get_by_path(self, db: AsyncSession, path: str) -> Optional[Category]:
        """Get category by hierarchical path (e.g., 'electronics/arduino/boards')"""
        try:
            query = select(Category).options(
                selectinload(Category.children),
                selectinload(Category.parent)
            ).where(Category.path == path)

            result = await db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Failed to get category by path {path}: {e}")
            return None
    
    async def get_categories(
        self, 
        db: AsyncSession, 
        parent_id: Optional[int] = None,
        include_inactive: bool = False
    ) -> List[Category]:
        """Get categories with optional filtering"""
        try:
            query = select(Category).options(
                selectinload(Category.children),
                selectinload(Category.parent)
            )
            
            # Filter by parent
            if parent_id is not None:
                query = query.where(Category.parent_id == parent_id)
            else:
                # Get root categories by default
                query = query.where(Category.parent_id.is_(None))
            
            # Filter by active status
            if not include_inactive:
                query = query.where(Category.is_active == True)
            
            # Order by sort_order and name
            query = query.order_by(Category.sort_order, Category.name)
            
            result = await db.execute(query)
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f"Failed to get categories: {e}")
            return []
    
    async def get_category_tree(self, db: AsyncSession, include_inactive: bool = False) -> List[Category]:
        """Get full category tree (all levels)"""
        try:
            query = select(Category).options(
                selectinload(Category.children),
                selectinload(Category.parent)
            )
            
            if not include_inactive:
                query = query.where(Category.is_active == True)
            
            query = query.order_by(Category.sort_order, Category.name)
            
            result = await db.execute(query)
            all_categories = list(result.scalars().all())
            
            # Build tree structure (return only root categories, children are loaded)
            root_categories = [cat for cat in all_categories if cat.parent_id is None]
            return root_categories
        except Exception as e:
            logger.error(f"Failed to get category tree: {e}")
            return []
    
    async def update(self, db: AsyncSession, category_id: int, category_data: CategoryUpdate) -> Optional[Category]:
        """Update category"""
        try:
            category = await self.get_by_id(db, category_id)
            if not category:
                return None
            
            update_data = category_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(category, field, value)
            
            await db.commit()
            await db.refresh(category)
            return category
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to update category {category_id}: {e}")
            raise
    
    async def delete(self, db: AsyncSession, category_id: int) -> bool:
        """Soft delete category (set is_active = False)"""
        try:
            category = await self.get_by_id(db, category_id)
            if not category:
                return False
            
            # Check if category has products
            product_count = await self.get_product_count(db, category_id)
            if product_count > 0:
                # Don't delete categories with products, just deactivate
                category.is_active = False
            else:
                # Can safely mark as inactive
                category.is_active = False
            
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to delete category {category_id}: {e}")
            return False
    
    async def get_product_count(self, db: AsyncSession, category_id: int) -> int:
        """Get count of active products in category"""
        try:
            query = select(func.count(Product.id)).where(
                and_(
                    Product.category_id == category_id,
                    Product.is_active == True
                )
            )
            
            result = await db.execute(query)
            return result.scalar() or 0
        except Exception as e:
            logger.error(f"Failed to get product count for category {category_id}: {e}")
            return 0
    
    async def get_category_stats(self, db: AsyncSession, category_id: int) -> Dict[str, Any]:
        """Get category statistics"""
        try:
            # Get basic product count
            product_count = await self.get_product_count(db, category_id)
            
            # Get subcategory count
            subcat_query = select(func.count(Category.id)).where(
                and_(
                    Category.parent_id == category_id,
                    Category.is_active == True
                )
            )
            subcat_result = await db.execute(subcat_query)
            subcategory_count = subcat_result.scalar() or 0
            
            # Get price range for products in category
            price_query = select(
                func.min(func.coalesce(Product.sale_price, Product.price)).label('min_price'),
                func.max(func.coalesce(Product.sale_price, Product.price)).label('max_price'),
                func.avg(func.coalesce(Product.sale_price, Product.price)).label('avg_price')
            ).where(
                and_(
                    Product.category_id == category_id,
                    Product.is_active == True
                )
            )
            
            price_result = await db.execute(price_query)
            price_stats = price_result.first()
            
            return {
                "product_count": product_count,
                "subcategory_count": subcategory_count,
                "price_range": {
                    "min": float(price_stats.min_price) if price_stats.min_price else None,
                    "max": float(price_stats.max_price) if price_stats.max_price else None,
                    "avg": float(price_stats.avg_price) if price_stats.avg_price else None
                }
            }
        except Exception as e:
            logger.error(f"Failed to get category stats for {category_id}: {e}")
            return {
                "product_count": 0,
                "subcategory_count": 0,
                "price_range": {"min": None, "max": None, "avg": None}
            }
    
    async def reorder_categories(self, db: AsyncSession, category_orders: List[Dict[str, int]]) -> bool:
        """Reorder categories by updating sort_order"""
        try:
            for item in category_orders:
                category_id = item.get("id")
                sort_order = item.get("sort_order")
                
                if category_id and sort_order is not None:
                    category = await self.get_by_id(db, category_id)
                    if category:
                        category.sort_order = sort_order
            
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to reorder categories: {e}")
            return False
    
    async def get_category_path(self, db: AsyncSession, category_id: int) -> List[Category]:
        """Get category breadcrumb path from root to category"""
        try:
            path = []
            current_category = await self.get_by_id(db, category_id)
            
            while current_category:
                path.insert(0, current_category)  # Insert at beginning
                if current_category.parent_id:
                    current_category = await self.get_by_id(db, current_category.parent_id)
                else:
                    break
            
            return path
        except Exception as e:
            logger.error(f"Failed to get category path for {category_id}: {e}")
            return []
    
    async def search_categories(self, db: AsyncSession, query: str, limit: int = 10) -> List[Category]:
        """Search categories by name"""
        try:
            search_term = f"%{query}%"
            
            search_query = select(Category).where(
                and_(
                    Category.is_active == True,
                    Category.name.ilike(search_term)
                )
            ).order_by(Category.name).limit(limit)
            
            result = await db.execute(search_query)
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f"Failed to search categories: {e}")
            return []

# Global instance
category_crud = CategoryCRUD()
