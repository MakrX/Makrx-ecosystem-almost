"""
SQLAlchemy models for commerce entities
Products, Categories, Cart, Orders
"""

from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.db import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), nullable=False, index=True)
    path = Column(String(1000), nullable=False, unique=True, index=True)  # Full hierarchical path
    description = Column(Text)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    # Images and banners
    image_url = Column(String(500))
    banner_image = Column(String(500))

    # SEO fields
    seo_title = Column(String(255))
    seo_description = Column(String(500))

    # Hierarchy and display
    sort_order = Column(Integer, default=0)
    level = Column(Integer, default=0, index=True)  # Depth level in hierarchy
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    parent = relationship("Category", remote_side=[id], back_populates="children")
    children = relationship("Category", back_populates="parent")
    products = relationship("Product", back_populates="category")

    # Indexes for hierarchical queries
    __table_args__ = (
        Index("ix_categories_parent_active", "parent_id", "is_active"),
        Index("ix_categories_level_sort", "level", "sort_order"),
    )

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    short_description = Column(String(500))
    brand = Column(String(100), index=True)  # Legacy brand name field
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=True, index=True)  # New brand reference
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    # Pricing
    price = Column(Numeric(10, 2), nullable=False)
    sale_price = Column(Numeric(10, 2), nullable=True)
    currency = Column(String(3), default="INR")
    
    # Inventory
    stock_qty = Column(Integer, default=0)
    track_inventory = Column(Boolean, default=True)
    allow_backorder = Column(Boolean, default=False)
    
    # Specifications and attributes (flexible JSONB)
    attributes = Column(JSONB, default={})  # e.g., {"diameter": "1.75mm", "material": "PLA"}
    specifications = Column(JSONB, default={})  # Technical specs
    compatibility = Column(JSONB, default=[])  # Compatible printers/systems
    
    # Media
    images = Column(JSONB, default=[])  # Array of image URLs
    videos = Column(JSONB, default=[])  # Array of video URLs
    
    # SEO and metadata
    meta_title = Column(String(255))
    meta_description = Column(String(500))
    tags = Column(JSONB, default=[])  # Array of tags
    
    # Status and visibility
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_digital = Column(Boolean, default=False)
    
    # Dimensions and weight
    weight = Column(Numeric(8, 3))  # kg
    dimensions = Column(JSONB, default={})  # {"length": 10, "width": 10, "height": 5}
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    category = relationship("Category", back_populates="products")
    brand_info = relationship("Brand", back_populates="products", foreign_keys=[brand_id])
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    
    # Indexes
    __table_args__ = (
        Index("ix_products_category_active", "category_id", "is_active"),
        Index("ix_products_brand_active", "brand", "is_active"),
        Index("ix_products_price", "price"),
    )

class Cart(Base):
    __tablename__ = "carts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(String(255), nullable=True, index=True)  # From JWT sub claim
    session_id = Column(String(255), nullable=True, index=True)  # For anonymous users
    currency = Column(String(3), default="INR")
    expires_at = Column(DateTime(timezone=True))  # Auto-cleanup old carts
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index("ix_carts_user_session", "user_id", "session_id"),
    )

class CartItem(Base):
    __tablename__ = "cart_items"
    
    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(UUID(as_uuid=True), ForeignKey("carts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)  # Price at time of adding
    
    # Additional metadata (customizations, options)
    meta = Column(JSONB, default={})  # e.g., {"color": "red", "custom_text": "Hello"}
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), nullable=False, unique=True, index=True)
    user_id = Column(String(255), nullable=True, index=True)  # From JWT sub claim
    email = Column(String(255), nullable=False, index=True)
    
    # Order status
    status = Column(String(50), nullable=False, default="pending", index=True)
    # pending, processing, shipped, delivered, cancelled, refunded
    
    # Financial totals
    currency = Column(String(3), default="INR")
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0)
    shipping_amount = Column(Numeric(10, 2), default=0)
    discount_amount = Column(Numeric(10, 2), default=0)
    total = Column(Numeric(10, 2), nullable=False)
    
    # Payment information
    payment_id = Column(String(255), nullable=True, index=True)  # Stripe/Razorpay payment ID
    payment_status = Column(String(50), default="pending")
    payment_method = Column(String(50))  # card, upi, netbanking, etc.
    
    # Addresses and shipping
    addresses = Column(JSONB, default={})  # {"billing": {...}, "shipping": {...}}
    shipping_method = Column(String(100))
    tracking_number = Column(String(100))
    
    # Metadata
    notes = Column(Text)
    source = Column(String(50), default="web")  # web, mobile, api
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    shipped_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    
    # Relationships
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    service_orders = relationship("ServiceOrder", back_populates="order")
    
    # Indexes
    __table_args__ = (
        Index("ix_orders_user_status", "user_id", "status"),
        Index("ix_orders_created_at", "created_at"),
        Index("ix_orders_payment", "payment_id", "payment_status"),
    )

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    
    # Product snapshot at time of order
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100))
    
    # Customizations and metadata
    meta = Column(JSONB, default={})
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text)
    logo = Column(String(500))
    banner_image = Column(String(500))
    website = Column(String(500))
    founded = Column(Integer)
    headquarters = Column(String(255))
    specialties = Column(JSONB, default=[])  # Array of specialty areas

    # SEO fields
    seo_title = Column(String(255))
    seo_description = Column(String(500))

    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    products = relationship("Product", back_populates="brand_info")


class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=False)
    banner_image = Column(String(500))

    # Curator information
    curator_name = Column(String(255))
    curator_bio = Column(Text)

    # SEO fields
    seo_title = Column(String(255))
    seo_description = Column(String(500))

    # Metadata
    tags = Column(JSONB, default=[])  # Related tags
    featured_categories = Column(JSONB, default=[])  # Featured category IDs

    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    products = relationship("CollectionProduct", back_populates="collection")


class CollectionProduct(Base):
    __tablename__ = "collection_products"

    id = Column(Integer, primary_key=True, index=True)
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    sort_order = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)  # Featured within collection
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    collection = relationship("Collection", back_populates="products")
    product = relationship("Product")

    # Unique constraint
    __table_args__ = (
        Index("ix_collection_products_unique", "collection_id", "product_id", unique=True),
        Index("ix_collection_products_sort", "collection_id", "sort_order"),
    )


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text)
    usage_count = Column(Integer, default=0, index=True)  # Number of products using this tag

    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ProductTag(Base):
    __tablename__ = "product_tags"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    tag_id = Column(Integer, ForeignKey("tags.id"), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    product = relationship("Product")
    tag = relationship("Tag")

    # Unique constraint
    __table_args__ = (
        Index("ix_product_tags_unique", "product_id", "tag_id", unique=True),
    )


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    sku = Column(String(100), nullable=False, unique=True, index=True)

    # Variant-specific attributes
    attributes = Column(JSONB, default={})  # e.g., {"color": "red", "size": "L"}

    # Pricing (overrides parent product if set)
    price = Column(Numeric(10, 2))
    sale_price = Column(Numeric(10, 2))

    # Inventory
    stock_qty = Column(Integer, default=0)

    # Images specific to this variant
    images = Column(JSONB, default=[])

    # Status
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    product = relationship("Product", back_populates="variants")

    # Indexes
    __table_args__ = (
        Index("ix_product_variants_product_active", "product_id", "is_active"),
    )
