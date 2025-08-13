"""
SQLAlchemy models package
Imports all models to ensure they're registered with SQLAlchemy
"""

from app.models.commerce import (
    Category,
    Product,
    Cart,
    CartItem,
    Order,
    OrderItem
)

from app.models.services import (
    Upload,
    Quote,
    ServiceProviderRef,
    ServiceOrder,
    ServiceOrderLog
)

from app.models.admin import (
    Coupon,
    CouponUsage,
    AuditLog,
    SystemConfig,
    Notification,
    ApiKey
)

__all__ = [
    # Commerce models
    "Category",
    "Product", 
    "Cart",
    "CartItem",
    "Order",
    "OrderItem",
    
    # Service models
    "Upload",
    "Quote",
    "ServiceProviderRef",
    "ServiceOrder",
    "ServiceOrderLog",
    
    # Admin models
    "Coupon",
    "CouponUsage",
    "AuditLog",
    "SystemConfig",
    "Notification",
    "ApiKey",
]
