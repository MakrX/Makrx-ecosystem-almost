"""
SQLAlchemy models for 3D printing and manufacturing services
Uploads, Quotes, Service Orders, Providers
"""

from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.db import Base

class Upload(Base):
    __tablename__ = "uploads"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(String(255), nullable=True, index=True)  # From JWT, nullable for anonymous
    session_id = Column(String(255), nullable=True, index=True)  # For anonymous uploads
    
    # File information
    file_key = Column(String(500), nullable=False, unique=True)  # S3 object key
    file_name = Column(String(255), nullable=False)
    file_hash = Column(String(64), nullable=True, index=True)  # SHA-256 hash
    file_size = Column(Integer, nullable=False)  # bytes
    mime_type = Column(String(100), nullable=False)
    
    # 3D model properties (computed after upload)
    dimensions = Column(JSONB, default={})  # {"x": 10.5, "y": 15.2, "z": 8.3} in mm
    volume_mm3 = Column(Numeric(15, 3))  # Volume in cubic millimeters
    surface_area_mm2 = Column(Numeric(15, 3))  # Surface area
    mesh_info = Column(JSONB, default={})  # vertices, faces, manifold status, etc.
    
    # Processing status
    status = Column(String(50), default="uploaded", index=True)
    # uploaded, processing, processed, failed, expired
    
    # Error information if processing failed
    error_message = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))  # Auto-cleanup old files
    
    # Relationships
    quotes = relationship("Quote", back_populates="upload", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index("ix_uploads_user_session", "user_id", "session_id"),
        Index("ix_uploads_status_created", "status", "created_at"),
    )

class Quote(Base):
    __tablename__ = "quotes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    upload_id = Column(UUID(as_uuid=True), ForeignKey("uploads.id"), nullable=False)
    user_id = Column(String(255), nullable=True, index=True)
    
    # Print specifications
    material = Column(String(50), nullable=False, index=True)  # pla, abs, petg, resin, etc.
    quality = Column(String(50), nullable=False)  # draft, standard, high, ultra
    color = Column(String(50), default="natural")
    infill_percentage = Column(Integer, default=20)
    layer_height = Column(Numeric(4, 2), default=0.2)  # mm
    supports = Column(Boolean, default=False)
    
    # Print settings (advanced options)
    settings = Column(JSONB, default={})  # printer-specific settings, speeds, temps, etc.
    
    # Estimates
    estimated_weight_g = Column(Numeric(8, 2))  # grams
    estimated_time_minutes = Column(Integer)  # total print time
    estimated_material_cost = Column(Numeric(8, 2))
    estimated_labor_cost = Column(Numeric(8, 2))
    estimated_machine_cost = Column(Numeric(8, 2))
    
    # Final pricing
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="INR")
    
    # Quote validity
    expires_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(50), default="active", index=True)
    # active, expired, accepted, cancelled
    
    # Location and delivery
    pickup_location = Column(String(255))
    delivery_address = Column(JSONB)  # Full address object
    shipping_cost = Column(Numeric(8, 2), default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    accepted_at = Column(DateTime(timezone=True))
    
    # Relationships
    upload = relationship("Upload", back_populates="quotes")
    service_orders = relationship("ServiceOrder", back_populates="quote")
    
    # Indexes
    __table_args__ = (
        Index("ix_quotes_material_quality", "material", "quality"),
        Index("ix_quotes_expires_status", "expires_at", "status"),
    )

class ServiceProviderRef(Base):
    __tablename__ = "service_providers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    makrcave_id = Column(String(255), nullable=True, unique=True, index=True)  # Reference to MakrCave
    
    # Capabilities and equipment
    capabilities = Column(JSONB, default={})  # materials, max_volume, technologies
    equipment = Column(JSONB, default=[])  # list of printers/machines
    
    # Location and contact
    location = Column(JSONB, default={})  # address, coordinates, timezone
    contact_info = Column(JSONB, default={})  # email, phone, website
    
    # Business details
    business_hours = Column(JSONB, default={})
    pricing_tiers = Column(JSONB, default={})  # volume discounts, rush fees
    
    # Status and ratings
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    rating = Column(Numeric(3, 2), default=0.0)
    total_jobs = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_active = Column(DateTime(timezone=True))
    
    # Relationships
    service_orders = relationship("ServiceOrder", back_populates="provider")

class ServiceOrder(Base):
    __tablename__ = "service_orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)  # Link to main order
    quote_id = Column(UUID(as_uuid=True), ForeignKey("quotes.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("service_providers.id"), nullable=True)
    
    # Service order details
    service_order_number = Column(String(50), nullable=False, unique=True, index=True)
    priority = Column(String(20), default="normal")  # low, normal, high, urgent
    
    # Status tracking
    status = Column(String(50), default="pending", index=True)
    # pending, routed, accepted, rejected, printing, post_processing, 
    # quality_check, ready, shipped, delivered, cancelled
    
    # Timeline and milestones
    milestones = Column(JSONB, default={})  # timestamp tracking for each status
    estimated_completion = Column(DateTime(timezone=True))
    actual_completion = Column(DateTime(timezone=True))
    
    # Production tracking
    tracking = Column(JSONB, default={})  # printer used, actual time, materials, etc.
    production_notes = Column(Text)
    quality_notes = Column(Text)
    
    # Shipping and delivery
    shipping_method = Column(String(100))
    tracking_number = Column(String(100))
    delivery_instructions = Column(Text)
    
    # Customer communication
    customer_notes = Column(Text)
    provider_notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    routed_at = Column(DateTime(timezone=True))
    accepted_at = Column(DateTime(timezone=True))
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    shipped_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    
    # Relationships
    order = relationship("Order", back_populates="service_orders")
    quote = relationship("Quote", back_populates="service_orders")
    provider = relationship("ServiceProviderRef", back_populates="service_orders")
    
    # Indexes
    __table_args__ = (
        Index("ix_service_orders_status_priority", "status", "priority"),
        Index("ix_service_orders_provider_status", "provider_id", "status"),
        Index("ix_service_orders_created_at", "created_at"),
    )

class ServiceOrderLog(Base):
    __tablename__ = "service_order_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    service_order_id = Column(UUID(as_uuid=True), ForeignKey("service_orders.id"), nullable=False)
    
    # Log entry details
    event_type = Column(String(50), nullable=False)  # status_change, note_added, file_uploaded
    old_value = Column(Text)
    new_value = Column(Text)
    message = Column(Text)
    
    # Actor information
    actor_type = Column(String(50))  # customer, provider, admin, system
    actor_id = Column(String(255))
    actor_name = Column(String(255))
    
    # Additional data
    metadata = Column(JSONB, default={})
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes
    __table_args__ = (
        Index("ix_service_order_logs_order_created", "service_order_id", "created_at"),
    )
