from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class ItemStatus(str, Enum):
    ACTIVE = "active"
    IN_USE = "in_use"
    DAMAGED = "damaged"
    RESERVED = "reserved"
    DISCONTINUED = "discontinued"

class SupplierType(str, Enum):
    MAKRX = "makrx"
    EXTERNAL = "external"

class AccessLevel(str, Enum):
    BASIC = "basic"
    CERTIFIED = "certified"
    ADMIN_ONLY = "admin_only"

class UsageAction(str, Enum):
    ADD = "add"
    ISSUE = "issue"
    RESTOCK = "restock"
    ADJUST = "adjust"
    DAMAGE = "damage"
    TRANSFER = "transfer"

# Base schemas
class InventoryUsageLogBase(BaseModel):
    user_id: str
    user_name: str
    action: UsageAction
    quantity_before: float
    quantity_after: float
    reason: Optional[str] = None
    linked_project_id: Optional[str] = None
    linked_job_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class InventoryUsageLogCreate(InventoryUsageLogBase):
    inventory_item_id: str

class InventoryUsageLogUpdate(BaseModel):
    reason: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class InventoryUsageLog(InventoryUsageLogBase):
    id: str
    inventory_item_id: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Inventory Item schemas
class InventoryItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    subcategory: Optional[str] = Field(None, max_length=100)
    quantity: float = Field(..., ge=0)
    unit: str = Field(..., min_length=1, max_length=50)
    min_threshold: int = Field(..., ge=0)
    location: str = Field(..., min_length=1, max_length=255)
    status: ItemStatus = ItemStatus.ACTIVE
    supplier_type: SupplierType = SupplierType.EXTERNAL
    product_code: Optional[str] = Field(None, max_length=100)
    linked_makerspace_id: str
    
    # Optional fields
    image_url: Optional[str] = None
    notes: Optional[str] = None
    owner_user_id: Optional[str] = None
    restricted_access_level: AccessLevel = AccessLevel.BASIC
    price: Optional[float] = Field(None, ge=0)
    supplier: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    is_scanned: bool = False

    @validator('product_code')
    def validate_product_code(cls, v, values):
        if values.get('supplier_type') == SupplierType.MAKRX and not v:
            raise ValueError('MakrX items must have a product code')
        return v

    @validator('category')
    def validate_category(cls, v):
        valid_categories = [
            'filament', 'resin', 'tools', 'electronics', 'materials', 
            'machines', 'sensors', 'components', 'consumables'
        ]
        if v not in valid_categories:
            raise ValueError(f'Category must be one of: {", ".join(valid_categories)}')
        return v

class InventoryItemCreate(InventoryItemBase):
    created_by: str

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    subcategory: Optional[str] = Field(None, max_length=100)
    quantity: Optional[float] = Field(None, ge=0)
    unit: Optional[str] = Field(None, min_length=1, max_length=50)
    min_threshold: Optional[int] = Field(None, ge=0)
    location: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[ItemStatus] = None
    supplier_type: Optional[SupplierType] = None
    product_code: Optional[str] = Field(None, max_length=100)
    
    # Optional fields
    image_url: Optional[str] = None
    notes: Optional[str] = None
    restricted_access_level: Optional[AccessLevel] = None
    price: Optional[float] = Field(None, ge=0)
    supplier: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    updated_by: str

class InventoryItem(InventoryItemBase):
    id: str
    created_at: datetime
    updated_at: datetime
    created_by: str
    updated_by: Optional[str] = None
    usage_logs: List[InventoryUsageLog] = []
    
    class Config:
        from_attributes = True

# Bulk operation schemas
class BulkUpdateRequest(BaseModel):
    item_ids: List[str]
    updates: Dict[str, Any]
    updated_by: str

class BulkIssueRequest(BaseModel):
    items: List[Dict[str, Any]]  # [{item_id: str, quantity: float, reason: str}]
    user_id: str
    user_name: str
    reason: Optional[str] = None
    linked_project_id: Optional[str] = None
    linked_job_id: Optional[str] = None

class BulkDeleteRequest(BaseModel):
    item_ids: List[str]
    deleted_by: str
    reason: Optional[str] = None

# CSV Import schemas
class CSVImportRequest(BaseModel):
    filename: str
    data: List[Dict[str, Any]]
    makerspace_id: str
    created_by: str

class BulkImportJobStatus(BaseModel):
    id: str
    filename: str
    total_rows: int
    processed_rows: int
    successful_rows: int
    failed_rows: int
    status: str
    error_log: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Filter and search schemas
class InventoryFilter(BaseModel):
    category: Optional[str] = None
    status: Optional[ItemStatus] = None
    supplier_type: Optional[SupplierType] = None
    location: Optional[str] = None
    makerspace_id: Optional[str] = None
    owner_user_id: Optional[str] = None
    low_stock_only: bool = False
    search: Optional[str] = None
    
    # Pagination
    skip: int = Field(0, ge=0)
    limit: int = Field(100, ge=1, le=1000)
    
    # Sorting
    sort_by: str = "updated_at"
    sort_order: str = Field("desc", regex="^(asc|desc)$")

class InventoryResponse(BaseModel):
    items: List[InventoryItem]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

# Analytics and reporting schemas
class InventoryStats(BaseModel):
    total_items: int
    low_stock_items: int
    out_of_stock_items: int
    makrx_items: int
    external_items: int
    total_value: Optional[float] = None
    categories: Dict[str, int]
    locations: Dict[str, int]

class UsageReport(BaseModel):
    item_id: str
    item_name: str
    total_issued: float
    total_restocked: float
    current_quantity: float
    usage_frequency: int
    last_used: Optional[datetime] = None
    most_common_reason: Optional[str] = None

class LowStockAlert(BaseModel):
    id: str
    item_id: str
    item_name: str
    current_quantity: float
    min_threshold: int
    location: str
    category: str
    supplier_type: SupplierType
    product_code: Optional[str] = None
    can_reorder: bool
    suggested_quantity: Optional[int] = None

# MakrX Store integration schemas
class ReorderRequest(BaseModel):
    items: List[Dict[str, Any]]  # [{item_id: str, quantity: int, product_code: str}]
    makerspace_id: str
    requested_by: str

class ReorderResponse(BaseModel):
    success: bool
    store_url: str
    order_reference: Optional[str] = None
    message: str

# Error response schema
class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
    field: Optional[str] = None

# Success response schema
class SuccessResponse(BaseModel):
    message: str
    data: Optional[Dict[str, Any]] = None

# Additional response schemas for API routes
class InventoryItemResponse(InventoryItem):
    """Response schema for inventory items with usage logs"""
    pass

class InventoryUsageLogResponse(InventoryUsageLog):
    """Response schema for usage logs"""
    item_name: Optional[str] = None

class IssueItemRequest(BaseModel):
    quantity: float = Field(..., gt=0)
    reason: Optional[str] = None
    project_id: Optional[str] = None
    job_id: Optional[str] = None

class ReorderRequest(BaseModel):
    quantity: float = Field(..., gt=0)
    notes: Optional[str] = None

class InventoryStatsResponse(BaseModel):
    total_items: int
    low_stock_items: int
    critical_items: int
    makrx_items: int
    external_items: int
    total_categories: int
    recent_activities: int
    estimated_total_value: Optional[float] = None
    category_breakdown: Dict[str, int]
    location_breakdown: Dict[str, int]

class LowStockAlertResponse(BaseModel):
    item_id: str
    item_name: str
    current_quantity: float
    min_threshold: float
    category: str
    location: str
    supplier_type: SupplierType
    product_code: Optional[str] = None
    can_reorder: bool = False
    suggested_order_quantity: Optional[float] = None
    days_until_stockout: Optional[int] = None
