from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, Float, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database import Base

class ProcurementStatus(str, enum.Enum):
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

class AvailabilityStatus(str, enum.Enum):
    IN_STOCK = "in_stock"
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"
    DISCONTINUED = "discontinued"
    BACKORDERED = "backordered"
    UNKNOWN = "unknown"

class ComponentCategory(str, enum.Enum):
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

class SupplierRating(str, enum.Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    UNKNOWN = "unknown"

class BOMTemplate(Base):
    __tablename__ = "bom_templates"

    id = Column(String(100), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Enum(ComponentCategory), nullable=False)
    
    # Template metadata
    version = Column(String(20), default="1.0")
    is_public = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    usage_count = Column(Integer, default=0)
    
    # Template data
    template_data = Column(JSON, nullable=False)  # Structured BOM template
    estimated_cost = Column(Float, nullable=True)
    complexity_level = Column(String(20), default="beginner")  # beginner, intermediate, advanced
    
    # Creator and approval
    created_by = Column(String(100), nullable=False)
    verified_by = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    bom_items = relationship("EnhancedBOMItem", back_populates="template")

class EnhancedBOMItem(Base):
    __tablename__ = "enhanced_bom_items"

    id = Column(String(100), primary_key=True, index=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=True)
    template_id = Column(String(100), ForeignKey("bom_templates.id"), nullable=True)
    
    # Core item information
    item_name = Column(String(200), nullable=False)
    part_code = Column(String(100), nullable=True, index=True)  # Internal part number
    manufacturer_part_number = Column(String(100), nullable=True, index=True)
    supplier_part_number = Column(String(100), nullable=True)
    
    # Categorization
    category = Column(Enum(ComponentCategory), nullable=False)
    subcategory = Column(String(100), nullable=True)
    component_type = Column(String(100), nullable=True)  # resistor, capacitor, IC, etc.
    
    # Quantity and units
    quantity = Column(Float, nullable=False, default=1.0)
    unit_of_measure = Column(String(20), default="each")  # each, meters, grams, etc.
    quantity_per_assembly = Column(Float, default=1.0)  # For nested assemblies
    
    # Technical specifications
    specifications = Column(JSON, nullable=True)  # Detailed technical specs
    tolerance = Column(String(50), nullable=True)  # ±5%, ±0.1mm, etc.
    material = Column(String(100), nullable=True)
    color = Column(String(50), nullable=True)
    size_dimensions = Column(JSON, nullable=True)  # {length, width, height, diameter}
    weight = Column(Float, nullable=True)  # grams
    
    # MakrX Store integration
    makrx_product_code = Column(String(100), nullable=True, index=True)
    makrx_store_url = Column(String(500), nullable=True)
    makrx_category_id = Column(String(100), nullable=True)
    
    # Pricing information
    unit_cost = Column(Float, nullable=True)
    total_cost = Column(Float, nullable=True)
    currency = Column(String(10), default="USD")
    price_last_updated = Column(DateTime(timezone=True), nullable=True)
    
    # Supplier information
    primary_supplier = Column(String(200), nullable=True)
    supplier_rating = Column(Enum(SupplierRating), default=SupplierRating.UNKNOWN)
    supplier_lead_time_days = Column(Integer, nullable=True)
    minimum_order_quantity = Column(Integer, default=1)
    alternative_suppliers = Column(JSON, nullable=True)  # List of backup suppliers
    
    # Inventory tracking
    procurement_status = Column(Enum(ProcurementStatus), default=ProcurementStatus.NEEDED)
    availability_status = Column(Enum(AvailabilityStatus), default=AvailabilityStatus.UNKNOWN)
    current_stock_level = Column(Integer, default=0)
    reserved_quantity = Column(Integer, default=0)
    available_quantity = Column(Integer, default=0)
    reorder_point = Column(Integer, default=5)
    max_stock_level = Column(Integer, nullable=True)
    
    # Auto-reordering
    auto_reorder_enabled = Column(Boolean, default=False)
    auto_reorder_quantity = Column(Integer, nullable=True)
    auto_reorder_supplier = Column(String(200), nullable=True)
    last_reorder_date = Column(DateTime(timezone=True), nullable=True)
    
    # Usage and compatibility
    is_critical_path = Column(Boolean, default=False)
    is_long_lead_item = Column(Boolean, default=False)
    substitution_allowed = Column(Boolean, default=False)
    alternatives = Column(JSON, nullable=True)  # Alternative part numbers
    usage_notes = Column(Text, nullable=True)
    assembly_notes = Column(Text, nullable=True)
    compatibility_notes = Column(Text, nullable=True)
    
    # Lifecycle and compliance
    lifecycle_status = Column(String(50), default="active")  # active, deprecated, obsolete
    rohs_compliant = Column(Boolean, nullable=True)
    reach_compliant = Column(Boolean, nullable=True)
    certifications = Column(JSON, nullable=True)  # CE, UL, FCC, etc.
    
    # Quality and testing
    quality_grade = Column(String(20), nullable=True)  # military, industrial, commercial
    testing_required = Column(Boolean, default=False)
    inspection_notes = Column(Text, nullable=True)
    
    # Metadata
    added_by = Column(String(100), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", foreign_keys=[project_id])
    template = relationship("BOMTemplate", back_populates="bom_items")
    purchase_orders = relationship("BOMPurchaseOrder", back_populates="bom_item")
    usage_history = relationship("BOMUsageHistory", back_populates="bom_item")
    inventory_transactions = relationship("BOMInventoryTransaction", back_populates="bom_item")

class BOMPurchaseOrder(Base):
    __tablename__ = "bom_purchase_orders"

    id = Column(String(100), primary_key=True, index=True)
    bom_item_id = Column(String(100), ForeignKey("enhanced_bom_items.id"), nullable=False)
    
    # Purchase order details
    po_number = Column(String(100), nullable=True, index=True)
    supplier_name = Column(String(200), nullable=False)
    supplier_contact = Column(JSON, nullable=True)  # Contact information
    
    # Order details
    quantity_ordered = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=True)
    total_amount = Column(Float, nullable=True)
    currency = Column(String(10), default="USD")
    
    # Dates and status
    order_date = Column(DateTime(timezone=True), server_default=func.now())
    expected_delivery = Column(DateTime(timezone=True), nullable=True)
    actual_delivery = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="pending")  # pending, confirmed, shipped, delivered, cancelled
    
    # Tracking and notes
    tracking_number = Column(String(100), nullable=True)
    delivery_notes = Column(Text, nullable=True)
    invoice_number = Column(String(100), nullable=True)
    
    # Quality and receiving
    quantity_received = Column(Float, default=0.0)
    quality_check_passed = Column(Boolean, nullable=True)
    discrepancy_notes = Column(Text, nullable=True)
    
    # Approval workflow
    requested_by = Column(String(100), nullable=False)
    approved_by = Column(String(100), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    bom_item = relationship("EnhancedBOMItem", back_populates="purchase_orders")

class BOMUsageHistory(Base):
    __tablename__ = "bom_usage_history"

    id = Column(String(100), primary_key=True, index=True)
    bom_item_id = Column(String(100), ForeignKey("enhanced_bom_items.id"), nullable=False)
    project_id = Column(String(100), nullable=True)
    
    # Usage details
    quantity_used = Column(Float, nullable=False)
    unit_cost_at_usage = Column(Float, nullable=True)
    total_cost = Column(Float, nullable=True)
    
    # Context
    used_for = Column(String(200), nullable=True)  # Assembly, testing, prototyping, etc.
    batch_number = Column(String(100), nullable=True)
    serial_numbers = Column(JSON, nullable=True)  # For serialized components
    
    # Quality and outcome
    usage_outcome = Column(String(50), default="successful")  # successful, failed, returned
    failure_reason = Column(Text, nullable=True)
    quality_issues = Column(Text, nullable=True)
    
    # Metadata
    used_by = Column(String(100), nullable=False)
    used_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    bom_item = relationship("EnhancedBOMItem", back_populates="usage_history")

class BOMInventoryTransaction(Base):
    __tablename__ = "bom_inventory_transactions"

    id = Column(String(100), primary_key=True, index=True)
    bom_item_id = Column(String(100), ForeignKey("enhanced_bom_items.id"), nullable=False)
    
    # Transaction details
    transaction_type = Column(String(50), nullable=False)  # purchase, usage, adjustment, transfer, return
    quantity_change = Column(Float, nullable=False)  # Positive for increases, negative for decreases
    unit_cost = Column(Float, nullable=True)
    total_value = Column(Float, nullable=True)
    
    # Balances after transaction
    quantity_before = Column(Float, nullable=False)
    quantity_after = Column(Float, nullable=False)
    
    # Reference information
    reference_id = Column(String(100), nullable=True)  # PO number, project ID, etc.
    reference_type = Column(String(50), nullable=True)  # purchase_order, project_usage, etc.
    
    # Location and batching
    location = Column(String(100), nullable=True)
    batch_number = Column(String(100), nullable=True)
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    
    # Notes and approval
    notes = Column(Text, nullable=True)
    performed_by = Column(String(100), nullable=False)
    approved_by = Column(String(100), nullable=True)
    transaction_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    bom_item = relationship("EnhancedBOMItem", back_populates="inventory_transactions")

class BOMAnalytics(Base):
    __tablename__ = "bom_analytics"

    id = Column(String(100), primary_key=True, index=True)
    project_id = Column(String(100), nullable=True)
    analysis_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Cost analysis
    total_bom_cost = Column(Float, nullable=True)
    cost_by_category = Column(JSON, nullable=True)
    cost_variance_percentage = Column(Float, nullable=True)
    
    # Procurement analysis
    total_items = Column(Integer, default=0)
    items_in_stock = Column(Integer, default=0)
    items_on_order = Column(Integer, default=0)
    items_need_procurement = Column(Integer, default=0)
    critical_path_items = Column(Integer, default=0)
    
    # Lead time analysis
    average_lead_time_days = Column(Float, nullable=True)
    longest_lead_time_days = Column(Float, nullable=True)
    estimated_procurement_completion = Column(DateTime(timezone=True), nullable=True)
    
    # Risk analysis
    single_source_items = Column(Integer, default=0)
    obsolete_items = Column(Integer, default=0)
    high_risk_items = Column(JSON, nullable=True)
    
    # Quality metrics
    items_requiring_testing = Column(Integer, default=0)
    compliance_issues = Column(JSON, nullable=True)
    
    # Generated by
    generated_by = Column(String(100), nullable=False)

class BOMCostHistory(Base):
    __tablename__ = "bom_cost_history"

    id = Column(String(100), primary_key=True, index=True)
    bom_item_id = Column(String(100), ForeignKey("enhanced_bom_items.id"), nullable=False)
    
    # Cost data
    unit_cost = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    supplier = Column(String(200), nullable=True)
    
    # Context
    cost_source = Column(String(50), nullable=False)  # quote, purchase, market_data
    quote_id = Column(String(100), nullable=True)
    effective_date = Column(DateTime(timezone=True), nullable=False)
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    
    # Volume pricing
    minimum_quantity = Column(Integer, default=1)
    break_quantities = Column(JSON, nullable=True)  # Volume break pricing
    
    # Market data
    market_trend = Column(String(20), nullable=True)  # increasing, decreasing, stable
    confidence_level = Column(String(20), default="medium")  # low, medium, high
    
    # Metadata
    recorded_by = Column(String(100), nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    bom_item = relationship("EnhancedBOMItem", foreign_keys=[bom_item_id])

class SupplierManagement(Base):
    __tablename__ = "supplier_management"

    id = Column(String(100), primary_key=True, index=True)
    supplier_name = Column(String(200), nullable=False, index=True)
    
    # Contact information
    contact_person = Column(String(200), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    website = Column(String(500), nullable=True)
    
    # Address
    address = Column(JSON, nullable=True)  # Structured address
    
    # Business information
    tax_id = Column(String(50), nullable=True)
    duns_number = Column(String(20), nullable=True)
    certifications = Column(JSON, nullable=True)  # ISO, AS9100, etc.
    
    # Performance metrics
    rating = Column(Enum(SupplierRating), default=SupplierRating.UNKNOWN)
    on_time_delivery_rate = Column(Float, nullable=True)  # Percentage
    quality_rating = Column(Float, nullable=True)  # 1-5 scale
    total_orders = Column(Integer, default=0)
    total_value = Column(Float, default=0.0)
    
    # Capabilities
    categories_served = Column(JSON, nullable=True)  # Categories they supply
    minimum_order_value = Column(Float, nullable=True)
    payment_terms = Column(String(100), nullable=True)
    shipping_methods = Column(JSON, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_preferred = Column(Boolean, default=False)
    risk_level = Column(String(20), default="medium")  # low, medium, high
    
    # Metadata
    added_by = Column(String(100), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
