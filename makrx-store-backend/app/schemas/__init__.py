"""
Pydantic schemas package
Request/response models for all API endpoints
"""

# Import all schemas to make them available
from app.schemas.commerce import *
from app.schemas.services import *
from app.schemas.admin import *

__all__ = [
    # Commerce schemas
    "Category", "CategoryCreate", "CategoryUpdate",
    "Product", "ProductCreate", "ProductUpdate", "ProductList", "ProductFilter", "ProductSearch",
    "Cart", "CartItem", "CartItemCreate", "CartItemUpdate", 
    "Order", "OrderCreate", "OrderItem", "OrderList",
    "Address", "CheckoutRequest", "CheckoutResponse",
    "CouponValidation", "CouponDiscount",
    
    # Service schemas
    "Upload", "UploadRequest", "UploadResponse", "UploadComplete",
    "Quote", "QuoteRequest", "QuoteResponse", "QuoteComparison",
    "ServiceProvider", "ServiceOrder", "ServiceOrderCreate", "ServiceOrderUpdate", "ServiceOrderList",
    "ServiceOrderLog", "ServiceOrderLogCreate", "ServiceOrderTracking",
    "ProviderJobFilter", "ProviderJobUpdate",
    "MeshAnalysis", "BatchQuoteRequest", "BatchQuoteResponse",
    "MaterialInfo", "QualityInfo", "ServiceCapabilities",
    
    # Admin schemas
    "Coupon", "CouponCreate", "CouponUpdate", "CouponList", "CouponUsage",
    "AuditLog", "AuditLogCreate", "AuditLogFilter", "AuditLogList",
    "SystemConfig", "SystemConfigCreate", "SystemConfigUpdate", "SystemConfigList",
    "Notification", "NotificationCreate", "NotificationList",
    "ApiKey", "ApiKeyCreate", "ApiKeyUpdate", "ApiKeyWithSecret", "ApiKeyList",
    "DashboardStats", "RevenueAnalytics", "ProductAnalytics", "ServiceAnalytics",
    "HealthCheck", "ServiceHealth", "MessageResponse", "ErrorResponse",
    "PaginationInfo", "FileUploadResponse", "WebhookEvent", "WebhookResponse",
    
    # Enums
    "OrderStatus", "PaymentStatus", "UploadStatus", "QuoteStatus", "ServiceOrderStatus",
    "PrintQuality", "PrintMaterial", "Priority", "CouponType", "NotificationStatus",
    "NotificationType", "AuditSeverity", "ProductSort"
]
