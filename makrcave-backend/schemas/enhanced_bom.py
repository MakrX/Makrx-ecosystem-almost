from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ProcurementStatus(str, Enum):
    NEEDED = "needed"
    RESEARCHING = "researching"
    QUOTE_REQUESTED = "quote_requested"
    QUOTE_RECEIVED = "quote_received"
    APPROVED = "approved"
    ORDERED = "ordered"
    SHIPPED = "shipped"
    RECEIVED = "received"
    RESERVED = "reserved"
    ALLOCATED = "allocated"
    CONSUMED = "consumed"
    CANCELLED = "cancelled"

class AvailabilityStatus(str, Enum):
    IN_STOCK = "in_stock"
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"
    DISCONTINUED = "discontinued"
    BACKORDERED = "backordered"
    UNKNOWN = "unknown"

class ComponentCategory(str, Enum):
    ELECTRONICS = "electronics"
    HARDWARE = "hardware"
    MATERIALS = "materials"
    CHEMICALS = "chemicals"
    TOOLS = "tools"
    FASTENERS = "fasteners"
    CONNECTORS = "connectors"
    SENSORS = "sensors"
    ACTUATORS = "actuators"
    POWER = "power"
    MECHANICAL = "mechanical"
    SOFTWARE = "software"
    CONSUMABLES = "consumables"

class SupplierRating(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    UNKNOWN = "unknown"

# BOM Template Schemas
class BOMTemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    category: ComponentCategory
    
    version: str = Field(default="1.0", max_length=20)
    is_public: bool = False
    template_data: Dict[str, Any] = Field(..., min_items=1)
    estimated_cost: Optional[float] = Field(None, ge=0)
    complexity_level: str = Field(default="beginner", regex="^(beginner|intermediate|advanced)$")

class BOMTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[ComponentCategory] = None
    version: Optional[str] = Field(None, max_length=20)
    is_public: Optional[bool] = None
    template_data: Optional[Dict[str, Any]] = None
    estimated_cost: Optional[float] = Field(None, ge=0)
    complexity_level: Optional[str] = Field(None, regex="^(beginner|intermediate|advanced)$")

class BOMTemplateResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    category: ComponentCategory
    version: str
    is_public: bool
    is_verified: bool
    usage_count: int
    template_data: Dict[str, Any]
    estimated_cost: Optional[float]
    complexity_level: str
    created_by: str
    verified_by: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Enhanced BOM Item Schemas
class EnhancedBOMItemCreate(BaseModel):
    project_id: Optional[str] = None
    template_id: Optional[str] = None
    
    # Core item information
    item_name: str = Field(..., min_length=1, max_length=200)
    part_code: Optional[str] = Field(None, max_length=100)
    manufacturer_part_number: Optional[str] = Field(None, max_length=100)
    supplier_part_number: Optional[str] = None
    
    # Categorization
    category: ComponentCategory
    subcategory: Optional[str] = Field(None, max_length=100)
    component_type: Optional[str] = Field(None, max_length=100)
    
    # Quantity and units
    quantity: float = Field(..., gt=0)
    unit_of_measure: str = Field(default="each", max_length=20)
    quantity_per_assembly: float = Field(default=1.0, gt=0)
    
    # Technical specifications
    specifications: Optional[Dict[str, Any]] = None
    tolerance: Optional[str] = Field(None, max_length=50)
    material: Optional[str] = Field(None, max_length=100)
    color: Optional[str] = Field(None, max_length=50)
    size_dimensions: Optional[Dict[str, float]] = None
    weight: Optional[float] = Field(None, ge=0)
    
    # MakrX Store integration
    makrx_product_code: Optional[str] = Field(None, max_length=100)
    makrx_store_url: Optional[str] = Field(None, max_length=500)
    makrx_category_id: Optional[str] = None
    
    # Pricing information
    unit_cost: Optional[float] = Field(None, ge=0)
    currency: str = Field(default="USD", max_length=10)
    
    # Supplier information
    primary_supplier: Optional[str] = Field(None, max_length=200)
    supplier_rating: SupplierRating = SupplierRating.UNKNOWN
    supplier_lead_time_days: Optional[int] = Field(None, ge=0, le=365)
    minimum_order_quantity: int = Field(default=1, ge=1)
    alternative_suppliers: Optional[List[str]] = None
    
    # Inventory tracking
    current_stock_level: int = Field(default=0, ge=0)
    reorder_point: int = Field(default=5, ge=0)
    max_stock_level: Optional[int] = Field(None, ge=0)
    
    # Auto-reordering
    auto_reorder_enabled: bool = False
    auto_reorder_quantity: Optional[int] = Field(None, ge=1)
    auto_reorder_supplier: Optional[str] = None
    
    # Usage and compatibility
    is_critical_path: bool = False
    is_long_lead_item: bool = False
    substitution_allowed: bool = False
    alternatives: Optional[List[str]] = None
    usage_notes: Optional[str] = None
    assembly_notes: Optional[str] = None
    compatibility_notes: Optional[str] = None
    
    # Lifecycle and compliance
    lifecycle_status: str = Field(default="active", max_length=50)
    rohs_compliant: Optional[bool] = None
    reach_compliant: Optional[bool] = None
    certifications: Optional[List[str]] = None
    
    # Quality and testing
    quality_grade: Optional[str] = Field(None, max_length=20)
    testing_required: bool = False
    inspection_notes: Optional[str] = None

class EnhancedBOMItemUpdate(BaseModel):
    item_name: Optional[str] = Field(None, min_length=1, max_length=200)
    part_code: Optional[str] = Field(None, max_length=100)
    manufacturer_part_number: Optional[str] = Field(None, max_length=100)
    supplier_part_number: Optional[str] = None
    
    category: Optional[ComponentCategory] = None
    subcategory: Optional[str] = Field(None, max_length=100)
    component_type: Optional[str] = Field(None, max_length=100)
    
    quantity: Optional[float] = Field(None, gt=0)
    unit_of_measure: Optional[str] = Field(None, max_length=20)
    quantity_per_assembly: Optional[float] = Field(None, gt=0)
    
    specifications: Optional[Dict[str, Any]] = None
    tolerance: Optional[str] = Field(None, max_length=50)
    material: Optional[str] = Field(None, max_length=100)
    color: Optional[str] = Field(None, max_length=50)
    size_dimensions: Optional[Dict[str, float]] = None
    weight: Optional[float] = Field(None, ge=0)
    
    makrx_product_code: Optional[str] = Field(None, max_length=100)
    makrx_store_url: Optional[str] = Field(None, max_length=500)
    
    unit_cost: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = Field(None, max_length=10)
    
    primary_supplier: Optional[str] = Field(None, max_length=200)
    supplier_rating: Optional[SupplierRating] = None
    supplier_lead_time_days: Optional[int] = Field(None, ge=0, le=365)
    minimum_order_quantity: Optional[int] = Field(None, ge=1)
    alternative_suppliers: Optional[List[str]] = None
    
    procurement_status: Optional[ProcurementStatus] = None
    availability_status: Optional[AvailabilityStatus] = None
    current_stock_level: Optional[int] = Field(None, ge=0)
    reorder_point: Optional[int] = Field(None, ge=0)
    max_stock_level: Optional[int] = Field(None, ge=0)
    
    auto_reorder_enabled: Optional[bool] = None
    auto_reorder_quantity: Optional[int] = Field(None, ge=1)
    auto_reorder_supplier: Optional[str] = None
    
    is_critical_path: Optional[bool] = None
    is_long_lead_item: Optional[bool] = None
    substitution_allowed: Optional[bool] = None
    alternatives: Optional[List[str]] = None
    usage_notes: Optional[str] = None
    assembly_notes: Optional[str] = None
    compatibility_notes: Optional[str] = None
    
    lifecycle_status: Optional[str] = Field(None, max_length=50)
    rohs_compliant: Optional[bool] = None
    reach_compliant: Optional[bool] = None
    certifications: Optional[List[str]] = None
    
    quality_grade: Optional[str] = Field(None, max_length=20)
    testing_required: Optional[bool] = None
    inspection_notes: Optional[str] = None

class EnhancedBOMItemResponse(BaseModel):
    id: str
    project_id: Optional[str]
    template_id: Optional[str]
    
    item_name: str
    part_code: Optional[str]
    manufacturer_part_number: Optional[str]
    supplier_part_number: Optional[str]
    
    category: ComponentCategory
    subcategory: Optional[str]
    component_type: Optional[str]
    
    quantity: float
    unit_of_measure: str
    quantity_per_assembly: float
    
    specifications: Optional[Dict[str, Any]]
    tolerance: Optional[str]
    material: Optional[str]
    color: Optional[str]
    size_dimensions: Optional[Dict[str, float]]
    weight: Optional[float]
    
    makrx_product_code: Optional[str]
    makrx_store_url: Optional[str]
    makrx_category_id: Optional[str]
    
    unit_cost: Optional[float]
    total_cost: Optional[float]
    currency: str
    price_last_updated: Optional[datetime]
    
    primary_supplier: Optional[str]
    supplier_rating: SupplierRating
    supplier_lead_time_days: Optional[int]
    minimum_order_quantity: int
    alternative_suppliers: Optional[List[str]]
    
    procurement_status: ProcurementStatus
    availability_status: AvailabilityStatus
    current_stock_level: int
    reserved_quantity: int
    available_quantity: int
    reorder_point: int
    max_stock_level: Optional[int]
    
    auto_reorder_enabled: bool
    auto_reorder_quantity: Optional[int]
    auto_reorder_supplier: Optional[str]
    last_reorder_date: Optional[datetime]
    
    is_critical_path: bool
    is_long_lead_item: bool
    substitution_allowed: bool
    alternatives: Optional[List[str]]
    usage_notes: Optional[str]
    assembly_notes: Optional[str]
    compatibility_notes: Optional[str]
    
    lifecycle_status: str
    rohs_compliant: Optional[bool]
    reach_compliant: Optional[bool]
    certifications: Optional[List[str]]
    
    quality_grade: Optional[str]
    testing_required: bool
    inspection_notes: Optional[str]
    
    added_by: str
    added_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Purchase Order Schemas
class BOMPurchaseOrderCreate(BaseModel):
    bom_item_id: str = Field(..., min_length=1)
    
    po_number: Optional[str] = Field(None, max_length=100)
    supplier_name: str = Field(..., min_length=1, max_length=200)
    supplier_contact: Optional[Dict[str, Any]] = None
    
    quantity_ordered: float = Field(..., gt=0)
    unit_price: Optional[float] = Field(None, ge=0)
    currency: str = Field(default="USD", max_length=10)
    
    expected_delivery: Optional[datetime] = None
    delivery_notes: Optional[str] = None

class BOMPurchaseOrderUpdate(BaseModel):
    po_number: Optional[str] = Field(None, max_length=100)
    supplier_contact: Optional[Dict[str, Any]] = None
    
    quantity_ordered: Optional[float] = Field(None, gt=0)
    unit_price: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = Field(None, max_length=10)
    
    expected_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    status: Optional[str] = Field(None, max_length=50)
    
    tracking_number: Optional[str] = Field(None, max_length=100)
    delivery_notes: Optional[str] = None
    invoice_number: Optional[str] = Field(None, max_length=100)
    
    quantity_received: Optional[float] = Field(None, ge=0)
    quality_check_passed: Optional[bool] = None
    discrepancy_notes: Optional[str] = None

class BOMPurchaseOrderResponse(BaseModel):
    id: str
    bom_item_id: str
    
    po_number: Optional[str]
    supplier_name: str
    supplier_contact: Optional[Dict[str, Any]]
    
    quantity_ordered: float
    unit_price: Optional[float]
    total_amount: Optional[float]
    currency: str
    
    order_date: datetime
    expected_delivery: Optional[datetime]
    actual_delivery: Optional[datetime]
    status: str
    
    tracking_number: Optional[str]
    delivery_notes: Optional[str]
    invoice_number: Optional[str]
    
    quantity_received: float
    quality_check_passed: Optional[bool]
    discrepancy_notes: Optional[str]
    
    requested_by: str
    approved_by: Optional[str]
    approved_at: Optional[datetime]
    
    class Config:
        orm_mode = True

# Usage History Schemas
class BOMUsageHistoryCreate(BaseModel):
    bom_item_id: str = Field(..., min_length=1)
    project_id: Optional[str] = None
    
    quantity_used: float = Field(..., gt=0)
    unit_cost_at_usage: Optional[float] = Field(None, ge=0)
    
    used_for: Optional[str] = Field(None, max_length=200)
    batch_number: Optional[str] = Field(None, max_length=100)
    serial_numbers: Optional[List[str]] = None
    
    usage_outcome: str = Field(default="successful", max_length=50)
    failure_reason: Optional[str] = None
    quality_issues: Optional[str] = None

class BOMUsageHistoryResponse(BaseModel):
    id: str
    bom_item_id: str
    project_id: Optional[str]
    
    quantity_used: float
    unit_cost_at_usage: Optional[float]
    total_cost: Optional[float]
    
    used_for: Optional[str]
    batch_number: Optional[str]
    serial_numbers: Optional[List[str]]
    
    usage_outcome: str
    failure_reason: Optional[str]
    quality_issues: Optional[str]
    
    used_by: str
    used_at: datetime
    
    class Config:
        orm_mode = True

# Inventory Transaction Schemas
class BOMInventoryTransactionCreate(BaseModel):
    bom_item_id: str = Field(..., min_length=1)
    
    transaction_type: str = Field(..., max_length=50)
    quantity_change: float = Field(..., ne=0)
    unit_cost: Optional[float] = Field(None, ge=0)
    
    reference_id: Optional[str] = Field(None, max_length=100)
    reference_type: Optional[str] = Field(None, max_length=50)
    
    location: Optional[str] = Field(None, max_length=100)
    batch_number: Optional[str] = Field(None, max_length=100)
    expiry_date: Optional[datetime] = None
    
    notes: Optional[str] = None

class BOMInventoryTransactionResponse(BaseModel):
    id: str
    bom_item_id: str
    
    transaction_type: str
    quantity_change: float
    unit_cost: Optional[float]
    total_value: Optional[float]
    
    quantity_before: float
    quantity_after: float
    
    reference_id: Optional[str]
    reference_type: Optional[str]
    
    location: Optional[str]
    batch_number: Optional[str]
    expiry_date: Optional[datetime]
    
    notes: Optional[str]
    performed_by: str
    approved_by: Optional[str]
    transaction_date: datetime
    
    class Config:
        orm_mode = True

# Analytics Schemas
class BOMAnalyticsResponse(BaseModel):
    id: str
    project_id: Optional[str]
    analysis_date: datetime
    
    total_bom_cost: Optional[float]
    cost_by_category: Optional[Dict[str, float]]
    cost_variance_percentage: Optional[float]
    
    total_items: int
    items_in_stock: int
    items_on_order: int
    items_need_procurement: int
    critical_path_items: int
    
    average_lead_time_days: Optional[float]
    longest_lead_time_days: Optional[float]
    estimated_procurement_completion: Optional[datetime]
    
    single_source_items: int
    obsolete_items: int
    high_risk_items: Optional[List[str]]
    
    items_requiring_testing: int
    compliance_issues: Optional[List[str]]
    
    generated_by: str
    
    class Config:
        orm_mode = True

# Supplier Management Schemas
class SupplierManagementCreate(BaseModel):
    supplier_name: str = Field(..., min_length=1, max_length=200)
    
    contact_person: Optional[str] = Field(None, max_length=200)
    email: Optional[str] = Field(None, regex=r'^[^@]+@[^@]+\.[^@]+$')
    phone: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = Field(None, max_length=500)
    
    address: Optional[Dict[str, str]] = None
    
    tax_id: Optional[str] = Field(None, max_length=50)
    duns_number: Optional[str] = Field(None, max_length=20)
    certifications: Optional[List[str]] = None
    
    categories_served: Optional[List[str]] = None
    minimum_order_value: Optional[float] = Field(None, ge=0)
    payment_terms: Optional[str] = Field(None, max_length=100)
    shipping_methods: Optional[List[str]] = None
    
    is_preferred: bool = False
    risk_level: str = Field(default="medium", regex="^(low|medium|high)$")

class SupplierManagementUpdate(BaseModel):
    supplier_name: Optional[str] = Field(None, min_length=1, max_length=200)
    
    contact_person: Optional[str] = Field(None, max_length=200)
    email: Optional[str] = Field(None, regex=r'^[^@]+@[^@]+\.[^@]+$')
    phone: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = Field(None, max_length=500)
    
    address: Optional[Dict[str, str]] = None
    
    rating: Optional[SupplierRating] = None
    on_time_delivery_rate: Optional[float] = Field(None, ge=0, le=100)
    quality_rating: Optional[float] = Field(None, ge=1, le=5)
    
    categories_served: Optional[List[str]] = None
    minimum_order_value: Optional[float] = Field(None, ge=0)
    payment_terms: Optional[str] = Field(None, max_length=100)
    shipping_methods: Optional[List[str]] = None
    
    is_active: Optional[bool] = None
    is_preferred: Optional[bool] = None
    risk_level: Optional[str] = Field(None, regex="^(low|medium|high)$")

class SupplierManagementResponse(BaseModel):
    id: str
    supplier_name: str
    
    contact_person: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    website: Optional[str]
    
    address: Optional[Dict[str, str]]
    
    tax_id: Optional[str]
    duns_number: Optional[str]
    certifications: Optional[List[str]]
    
    rating: SupplierRating
    on_time_delivery_rate: Optional[float]
    quality_rating: Optional[float]
    total_orders: int
    total_value: float
    
    categories_served: Optional[List[str]]
    minimum_order_value: Optional[float]
    payment_terms: Optional[str]
    shipping_methods: Optional[List[str]]
    
    is_active: bool
    is_preferred: bool
    risk_level: str
    
    added_by: str
    added_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Search and filtering
class BOMSearchFilters(BaseModel):
    category: Optional[List[ComponentCategory]] = None
    procurement_status: Optional[List[ProcurementStatus]] = None
    availability_status: Optional[List[AvailabilityStatus]] = None
    supplier_rating: Optional[List[SupplierRating]] = None
    is_critical_path: Optional[bool] = None
    is_long_lead_item: Optional[bool] = None
    auto_reorder_enabled: Optional[bool] = None
    min_cost: Optional[float] = Field(None, ge=0)
    max_cost: Optional[float] = Field(None, ge=0)
    search_query: Optional[str] = None

class BOMListResponse(BaseModel):
    items: List[EnhancedBOMItemResponse]
    total_count: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_previous: bool

# Dashboard schemas
class BOMDashboardStats(BaseModel):
    total_items: int
    total_value: float
    items_by_status: Dict[str, int]
    items_by_category: Dict[str, int]
    critical_path_items: int
    items_needing_procurement: int
    auto_reorder_items: int
    average_lead_time: Optional[float]
    top_suppliers: List[Dict[str, Any]]
    recent_orders: List[Dict[str, Any]]

# MakrX Store integration schemas
class MakrXStoreProductLink(BaseModel):
    bom_item_id: str
    makrx_product_code: str
    quantity: int = Field(..., ge=1)
    notes: Optional[str] = None

class MakrXStoreOrderRequest(BaseModel):
    items: List[MakrXStoreProductLink]
    delivery_address: Optional[Dict[str, str]] = None
    priority: str = Field(default="normal", regex="^(low|normal|high|urgent)$")
    project_id: Optional[str] = None

class BOMCostAnalysis(BaseModel):
    total_cost: float
    cost_by_category: Dict[str, float]
    cost_by_supplier: Dict[str, float]
    high_cost_items: List[Dict[str, Any]]
    cost_variance_from_budget: Optional[float]
    cost_optimization_suggestions: List[str]
