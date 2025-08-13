from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from database import Base
import uuid
from datetime import datetime
from enum import Enum

class EventType(str, Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    PROJECT_CREATED = "project_created"
    PROJECT_UPDATED = "project_updated"
    PROJECT_COMPLETED = "project_completed"
    EQUIPMENT_RESERVED = "equipment_reserved"
    EQUIPMENT_USED = "equipment_used"
    EQUIPMENT_RETURNED = "equipment_returned"
    INVENTORY_CONSUMED = "inventory_consumed"
    INVENTORY_RESTOCKED = "inventory_restocked"
    MEMBER_REGISTERED = "member_registered"
    PAYMENT_MADE = "payment_made"
    CREDIT_PURCHASED = "credit_purchased"
    JOB_SUBMITTED = "job_submitted"
    JOB_COMPLETED = "job_completed"
    FILE_UPLOADED = "file_uploaded"

class AnalyticsSnapshotType(str, Enum):
    DAILY_SUMMARY = "daily_summary"
    WEEKLY_SUMMARY = "weekly_summary"
    MONTHLY_SUMMARY = "monthly_summary"
    INVENTORY_TREND = "inventory_trend"
    EQUIPMENT_UTILIZATION = "equipment_utilization"
    REVENUE_SUMMARY = "revenue_summary"
    USER_ENGAGEMENT = "user_engagement"

class UsageEvent(Base):
    __tablename__ = "usage_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    event_type = Column(String(50), nullable=False)
    event_data = Column(JSON, nullable=True)
    resource_id = Column(UUID(as_uuid=True), nullable=True)  # ID of equipment, project, etc.
    resource_type = Column(String(50), nullable=True)  # 'equipment', 'project', 'inventory'
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    duration_minutes = Column(Integer, nullable=True)  # For time-based events
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<UsageEvent(id={self.id}, type={self.event_type}, user={self.user_id})>"

class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    snapshot_type = Column(String(50), nullable=False)
    time_period = Column(String(20), nullable=False)  # 'daily', 'weekly', 'monthly'
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    data = Column(JSON, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    def __repr__(self):
        return f"<AnalyticsSnapshot(id={self.id}, type={self.snapshot_type}, period={self.time_period})>"

class ReportRequest(Base):
    __tablename__ = "report_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    requested_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    report_type = Column(String(50), nullable=False)  # 'inventory', 'usage', 'revenue', etc.
    report_format = Column(String(10), nullable=False)  # 'csv', 'pdf', 'xlsx'
    filters = Column(JSON, nullable=True)  # Date range, user filters, etc.
    status = Column(String(20), default="pending", nullable=False)  # pending, processing, completed, failed
    file_url = Column(String(500), nullable=True)  # URL to generated file
    error_message = Column(Text, nullable=True)
    requested_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)  # When the report file expires

    def __repr__(self):
        return f"<ReportRequest(id={self.id}, type={self.report_type}, status={self.status})>"

class EquipmentUsageLog(Base):
    __tablename__ = "equipment_usage_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    equipment_id = Column(UUID(as_uuid=True), ForeignKey("equipment.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    session_start = Column(DateTime, nullable=False)
    session_end = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    job_id = Column(UUID(as_uuid=True), nullable=True)  # Related print job if applicable
    materials_consumed = Column(JSON, nullable=True)  # List of materials used
    success_rate = Column(Float, nullable=True)  # % success for print jobs
    power_consumption_kwh = Column(Float, nullable=True)
    maintenance_required = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<EquipmentUsageLog(id={self.id}, equipment={self.equipment_id}, duration={self.duration_minutes})>"

class InventoryAnalytics(Base):
    __tablename__ = "inventory_analytics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    inventory_item_id = Column(UUID(as_uuid=True), ForeignKey("inventory_items.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    starting_quantity = Column(Float, nullable=False)
    consumed_quantity = Column(Float, default=0)
    restocked_quantity = Column(Float, default=0)
    ending_quantity = Column(Float, nullable=False)
    reorder_triggered = Column(Boolean, default=False)
    cost_per_unit = Column(Float, nullable=True)
    total_cost_consumed = Column(Float, nullable=True)
    consumption_rate = Column(Float, nullable=True)  # Units per day
    projects_using = Column(Integer, default=0)  # Number of projects that used this item
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<InventoryAnalytics(id={self.id}, item={self.inventory_item_id}, date={self.date})>"

class ProjectAnalytics(Base):
    __tablename__ = "project_analytics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    total_cost = Column(Float, nullable=True)
    bom_items_count = Column(Integer, default=0)
    external_items_count = Column(Integer, default=0)  # Items not from MakrX.Store
    print_time_hours = Column(Float, nullable=True)
    material_efficiency = Column(Float, nullable=True)  # % of material actually used
    completion_rate = Column(Float, nullable=True)  # % of project completed
    equipment_hours_used = Column(Float, nullable=True)
    collaboration_count = Column(Integer, default=0)  # Number of collaborators
    complexity_score = Column(Float, nullable=True)  # Based on BOM size, equipment used, etc.
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<ProjectAnalytics(id={self.id}, project={self.project_id}, cost={self.total_cost})>"

class RevenueAnalytics(Base):
    __tablename__ = "revenue_analytics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    revenue_type = Column(String(50), nullable=False)  # 'membership', 'credits', 'store', 'service'
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    transaction_count = Column(Integer, default=1)
    payment_method = Column(String(50), nullable=True)  # 'razorpay', 'stripe', 'cash'
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reference_id = Column(UUID(as_uuid=True), nullable=True)  # Order ID, subscription ID, etc.
    tax_amount = Column(Float, nullable=True)
    net_amount = Column(Float, nullable=True)  # After fees and taxes
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<RevenueAnalytics(id={self.id}, type={self.revenue_type}, amount={self.amount})>"
