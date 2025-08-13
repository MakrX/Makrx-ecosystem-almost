from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime
import enum

from ..database import Base

class ItemStatus(enum.Enum):
    ACTIVE = "active"
    IN_USE = "in_use"
    DAMAGED = "damaged"
    RESERVED = "reserved"
    DISCONTINUED = "discontinued"

class SupplierType(enum.Enum):
    MAKRX = "makrx"
    EXTERNAL = "external"

class AccessLevel(enum.Enum):
    BASIC = "basic"
    CERTIFIED = "certified"
    ADMIN_ONLY = "admin_only"

class UsageAction(enum.Enum):
    ADD = "add"
    ISSUE = "issue"
    RESTOCK = "restock"
    ADJUST = "adjust"
    DAMAGE = "damage"
    TRANSFER = "transfer"

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    # Primary fields
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    subcategory = Column(String)
    quantity = Column(Float, nullable=False, default=0)
    unit = Column(String, nullable=False)
    min_threshold = Column(Integer, nullable=False)
    location = Column(String, nullable=False, index=True)
    status = Column(Enum(ItemStatus), nullable=False, default=ItemStatus.ACTIVE)
    supplier_type = Column(Enum(SupplierType), nullable=False, default=SupplierType.EXTERNAL)
    product_code = Column(String, index=True)  # For MakrX Store integration
    linked_makerspace_id = Column(String, ForeignKey("makerspaces.id"), nullable=False, index=True)
    
    # Optional fields
    image_url = Column(String)
    notes = Column(Text)
    owner_user_id = Column(String, ForeignKey("users.id"))  # For personal tools
    restricted_access_level = Column(Enum(AccessLevel), default=AccessLevel.BASIC)
    price = Column(Float)
    supplier = Column(String)
    description = Column(Text)
    is_scanned = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"))
    updated_by = Column(String, ForeignKey("users.id"))
    
    # Relationships
    usage_logs = relationship("InventoryUsageLog", back_populates="inventory_item", cascade="all, delete-orphan")
    makerspace = relationship("Makerspace", back_populates="inventory_items")
    owner_user = relationship("User", foreign_keys=[owner_user_id])
    created_by_user = relationship("User", foreign_keys=[created_by])
    updated_by_user = relationship("User", foreign_keys=[updated_by])

class InventoryUsageLog(Base):
    __tablename__ = "inventory_usage_logs"
    
    id = Column(String, primary_key=True, index=True)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    user_name = Column(String, nullable=False)  # Denormalized for performance
    action = Column(Enum(UsageAction), nullable=False)
    quantity_before = Column(Float, nullable=False)
    quantity_after = Column(Float, nullable=False)
    reason = Column(String)
    linked_project_id = Column(String, ForeignKey("projects.id"))
    linked_job_id = Column(String, ForeignKey("jobs.id"))
    
    # Additional context
    metadata = Column(JSON)  # For storing additional context data
    
    # Relationships
    inventory_item = relationship("InventoryItem", back_populates="usage_logs")
    user = relationship("User")
    project = relationship("Project", foreign_keys=[linked_project_id])
    job = relationship("Job", foreign_keys=[linked_job_id])

class InventoryAlert(Base):
    __tablename__ = "inventory_alerts"
    
    id = Column(String, primary_key=True, index=True)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id"), nullable=False)
    alert_type = Column(String, nullable=False)  # "low_stock", "out_of_stock", "expiry_warning"
    triggered_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    resolved_at = Column(DateTime)
    is_resolved = Column(Boolean, default=False)
    notification_sent = Column(Boolean, default=False)
    
    # Alert details
    threshold_value = Column(Float)
    current_value = Column(Float)
    message = Column(String)
    
    # Relationships
    inventory_item = relationship("InventoryItem")

class BulkImportJob(Base):
    __tablename__ = "bulk_import_jobs"
    
    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    total_rows = Column(Integer, nullable=False)
    processed_rows = Column(Integer, default=0)
    successful_rows = Column(Integer, default=0)
    failed_rows = Column(Integer, default=0)
    status = Column(String, default="processing")  # "processing", "completed", "failed"
    error_log = Column(JSON)  # Store validation errors
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"))
    makerspace_id = Column(String, ForeignKey("makerspaces.id"))
    
    # Relationships
    created_by_user = relationship("User")
    makerspace = relationship("Makerspace")

# Additional models for the complete ecosystem

class Makerspace(Base):
    __tablename__ = "makerspaces"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String)
    description = Column(Text)
    
    # Settings
    settings = Column(JSON)  # Store makerspace-specific settings
    
    # Relationships
    inventory_items = relationship("InventoryItem", back_populates="makerspace")

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    role = Column(String, nullable=False)
    assigned_makerspaces = Column(JSON)  # List of makerspace IDs
    
    # Profile
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    is_active = Column(Boolean, default=True)

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    owner_id = Column(String, ForeignKey("users.id"))
    status = Column(String, default="active")
    
    # Relationships
    owner = relationship("User")

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    project_id = Column(String, ForeignKey("projects.id"))
    status = Column(String, default="pending")
    
    # Relationships
    project = relationship("Project")
