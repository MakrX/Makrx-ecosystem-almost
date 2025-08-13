"""
Pydantic schemas for commerce entities
Request/response models for products, categories, cart, orders
"""

from pydantic import BaseModel, Field, validator, root_validator
from typing import List, Optional, Dict, Any, Union
from decimal import Decimal
from datetime import datetime
from enum import Enum
import uuid

# Enums
class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

# Base schemas
class TimestampMixin(BaseModel):
    created_at: datetime
    updated_at: Optional[datetime] = None

# Category schemas
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    image_url: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    image_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class Category(CategoryBase, TimestampMixin):
    id: int
    children: List['Category'] = []
    
    class Config:
        orm_mode = True

# Product schemas
class ProductBase(BaseModel):
    slug: str = Field(..., min_length=1, max_length=255)
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    brand: Optional[str] = Field(None, max_length=100)
    category_id: int
    price: Decimal = Field(..., gt=0, decimal_places=2)
    sale_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    currency: str = Field("INR", min_length=3, max_length=3)
    stock_qty: int = Field(0, ge=0)
    track_inventory: bool = True
    allow_backorder: bool = False
    attributes: Dict[str, Any] = {}
    specifications: Dict[str, Any] = {}
    compatibility: List[str] = []
    images: List[str] = []
    videos: List[str] = []
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = Field(None, max_length=500)
    tags: List[str] = []
    is_active: bool = True
    is_featured: bool = False
    is_digital: bool = False
    weight: Optional[Decimal] = Field(None, gt=0, decimal_places=3)
    dimensions: Dict[str, float] = {}

    @validator('sale_price')
    def validate_sale_price(cls, v, values):
        if v is not None and 'price' in values and v >= values['price']:
            raise ValueError('Sale price must be less than regular price')
        return v

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    brand: Optional[str] = Field(None, max_length=100)
    category_id: Optional[int] = None
    price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    sale_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    stock_qty: Optional[int] = Field(None, ge=0)
    track_inventory: Optional[bool] = None
    allow_backorder: Optional[bool] = None
    attributes: Optional[Dict[str, Any]] = None
    specifications: Optional[Dict[str, Any]] = None
    compatibility: Optional[List[str]] = None
    images: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    weight: Optional[Decimal] = Field(None, gt=0, decimal_places=3)
    dimensions: Optional[Dict[str, float]] = None

class Product(ProductBase, TimestampMixin):
    id: int
    category: Optional[Category] = None
    effective_price: Decimal
    in_stock: bool
    
    class Config:
        orm_mode = True
    
    @root_validator
    def compute_effective_price(cls, values):
        sale_price = values.get('sale_price')
        price = values.get('price')
        values['effective_price'] = sale_price if sale_price else price
        return values
    
    @root_validator 
    def compute_stock_status(cls, values):
        stock_qty = values.get('stock_qty', 0)
        track_inventory = values.get('track_inventory', True)
        allow_backorder = values.get('allow_backorder', False)
        
        if not track_inventory or allow_backorder:
            values['in_stock'] = True
        else:
            values['in_stock'] = stock_qty > 0
        
        return values

class ProductList(BaseModel):
    products: List[Product]
    total: int
    page: int
    per_page: int
    pages: int

# Cart schemas
class CartItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    meta: Dict[str, Any] = {}

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)
    meta: Optional[Dict[str, Any]] = None

class CartItem(CartItemBase, TimestampMixin):
    id: int
    cart_id: uuid.UUID
    unit_price: Decimal
    total_price: Decimal
    product: Optional[Product] = None
    
    class Config:
        orm_mode = True

class CartBase(BaseModel):
    currency: str = Field("INR", min_length=3, max_length=3)

class Cart(CartBase, TimestampMixin):
    id: uuid.UUID
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    items: List[CartItem] = []
    subtotal: Decimal = Decimal('0.00')
    item_count: int = 0
    
    class Config:
        orm_mode = True
    
    @root_validator
    def compute_totals(cls, values):
        items = values.get('items', [])
        subtotal = sum(item.total_price for item in items)
        item_count = sum(item.quantity for item in items)
        
        values['subtotal'] = subtotal
        values['item_count'] = item_count
        return values

# Address schemas
class Address(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    line1: str = Field(..., min_length=1, max_length=255)
    line2: Optional[str] = Field(None, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)
    country: str = Field(..., min_length=2, max_length=3)
    phone: Optional[str] = Field(None, max_length=20)

# Order schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    meta: Dict[str, Any] = {}

class OrderItem(OrderItemBase, TimestampMixin):
    id: int
    order_id: int
    unit_price: Decimal
    total_price: Decimal
    product_name: str
    product_sku: Optional[str] = None
    product: Optional[Product] = None
    
    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    email: str = Field(..., regex=r'^[^@]+@[^@]+\.[^@]+$')
    currency: str = Field("INR", min_length=3, max_length=3)
    addresses: Dict[str, Address]
    shipping_method: Optional[str] = None
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemBase]

class Order(OrderBase, TimestampMixin):
    id: int
    order_number: str
    user_id: Optional[str] = None
    status: OrderStatus
    subtotal: Decimal
    tax_amount: Decimal = Decimal('0.00')
    shipping_amount: Decimal = Decimal('0.00')
    discount_amount: Decimal = Decimal('0.00')
    total: Decimal
    payment_id: Optional[str] = None
    payment_status: PaymentStatus
    payment_method: Optional[str] = None
    tracking_number: Optional[str] = None
    items: List[OrderItem] = []
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class OrderList(BaseModel):
    orders: List[Order]
    total: int
    page: int
    per_page: int
    pages: int

# Checkout schemas
class CheckoutRequest(BaseModel):
    cart_id: Optional[uuid.UUID] = None
    items: Optional[List[OrderItemBase]] = None
    shipping_address: Address
    billing_address: Optional[Address] = None
    shipping_method: str = "standard"
    payment_method: str = "card"  # card, upi, netbanking, wallet
    coupon_code: Optional[str] = None
    notes: Optional[str] = None
    
    @root_validator
    def validate_cart_or_items(cls, values):
        cart_id = values.get('cart_id')
        items = values.get('items')
        
        if not cart_id and not items:
            raise ValueError('Either cart_id or items must be provided')
        if cart_id and items:
            raise ValueError('Provide either cart_id or items, not both')
        
        return values

class CheckoutResponse(BaseModel):
    order_id: int
    order_number: str
    total: Decimal
    currency: str
    payment_intent: Dict[str, Any]  # Payment provider specific data
    
# Coupon schemas
class CouponValidation(BaseModel):
    code: str
    cart_total: Decimal
    user_id: Optional[str] = None
    
class CouponDiscount(BaseModel):
    code: str
    type: str  # percentage, fixed_amount, free_shipping
    value: Decimal
    discount_amount: Decimal
    is_valid: bool
    error_message: Optional[str] = None

# Search and filter schemas
class ProductFilter(BaseModel):
    category_id: Optional[int] = None
    brand: Optional[str] = None
    price_min: Optional[Decimal] = Field(None, ge=0)
    price_max: Optional[Decimal] = Field(None, ge=0)
    in_stock: Optional[bool] = None
    is_featured: Optional[bool] = None
    tags: Optional[List[str]] = None
    
    @validator('price_max')
    def validate_price_range(cls, v, values):
        if v is not None and 'price_min' in values and values['price_min'] is not None:
            if v <= values['price_min']:
                raise ValueError('price_max must be greater than price_min')
        return v

class ProductSort(str, Enum):
    NAME_ASC = "name_asc"
    NAME_DESC = "name_desc"
    PRICE_ASC = "price_asc"
    PRICE_DESC = "price_desc"
    CREATED_ASC = "created_asc"
    CREATED_DESC = "created_desc"
    POPULARITY = "popularity"
    RATING = "rating"

class ProductSearch(BaseModel):
    q: Optional[str] = Field(None, max_length=255)  # Search query
    filters: Optional[ProductFilter] = None
    sort: ProductSort = ProductSort.CREATED_DESC
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)

# Update forward references
Category.update_forward_refs()
