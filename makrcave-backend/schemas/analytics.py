from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
from enum import Enum
import uuid

class EventTypeEnum(str, Enum):
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

class TimePeriodEnum(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"

class ReportFormatEnum(str, Enum):
    CSV = "csv"
    PDF = "pdf"
    XLSX = "xlsx"

class UsageEventCreate(BaseModel):
    event_type: EventTypeEnum
    user_id: Optional[uuid.UUID] = None
    event_data: Optional[Dict[str, Any]] = None
    resource_id: Optional[uuid.UUID] = None
    resource_type: Optional[str] = None
    duration_minutes: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class UsageEventResponse(BaseModel):
    id: uuid.UUID
    makerspace_id: uuid.UUID
    user_id: Optional[uuid.UUID]
    event_type: str
    event_data: Optional[Dict[str, Any]]
    resource_id: Optional[uuid.UUID]
    resource_type: Optional[str]
    timestamp: datetime
    duration_minutes: Optional[int]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True

class AnalyticsOverviewResponse(BaseModel):
    total_users: int
    active_users_today: int
    active_users_week: int
    total_projects: int
    active_projects: int
    total_equipment: int
    equipment_in_use: int
    total_inventory_items: int
    low_stock_items: int
    total_revenue: float
    revenue_this_month: float

class UsageStatsResponse(BaseModel):
    period: str
    logins: int
    new_members: int
    project_creations: int
    equipment_hours: float
    peak_hour: str
    most_active_day: str

class InventoryInsightsResponse(BaseModel):
    top_consumed_items: List[Dict[str, Any]]
    fastest_depleting: List[Dict[str, Any]]
    reorder_alerts: List[Dict[str, Any]]
    consumption_trends: List[Dict[str, Any]]
    efficiency_score: float

class EquipmentMetricsResponse(BaseModel):
    equipment_id: uuid.UUID
    equipment_name: str
    total_usage_hours: float
    reservation_count: int
    uptime_percentage: float
    maintenance_overdue: bool
    peak_usage_times: List[str]
    usage_trend: List[Dict[str, Any]]

class ProjectAnalyticsResponse(BaseModel):
    total_projects: int
    completed_projects: int
    average_completion_time: float
    most_active_projects: List[Dict[str, Any]]
    largest_boms: List[Dict[str, Any]]
    costliest_projects: List[Dict[str, Any]]
    makrx_store_percentage: float

class RevenueAnalyticsResponse(BaseModel):
    total_revenue: float
    revenue_by_source: Dict[str, float]
    monthly_trends: List[Dict[str, Any]]
    payment_methods: Dict[str, float]
    subscription_revenue: float
    credit_sales: float
    store_revenue: float

class ReportRequestCreate(BaseModel):
    report_type: str = Field(..., description="Type of report: inventory, usage, revenue, equipment")
    report_format: ReportFormatEnum
    filters: Optional[Dict[str, Any]] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    @validator('report_type')
    def validate_report_type(cls, v):
        allowed_types = ['inventory', 'usage', 'revenue', 'equipment', 'projects', 'members']
        if v not in allowed_types:
            raise ValueError(f'Report type must be one of: {", ".join(allowed_types)}')
        return v

class ReportRequestResponse(BaseModel):
    id: uuid.UUID
    report_type: str
    report_format: str
    status: str
    file_url: Optional[str]
    error_message: Optional[str]
    requested_at: datetime
    completed_at: Optional[datetime]
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True

class AnalyticsFilters(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    user_id: Optional[uuid.UUID] = None
    equipment_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None
    event_types: Optional[List[EventTypeEnum]] = None
    time_period: Optional[TimePeriodEnum] = TimePeriodEnum.DAILY

class ChartDataPoint(BaseModel):
    label: str
    value: Union[int, float]
    date: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class ChartData(BaseModel):
    title: str
    data: List[ChartDataPoint]
    chart_type: str = "line"  # line, bar, pie, area
    x_axis_label: Optional[str] = None
    y_axis_label: Optional[str] = None

class DashboardSection(BaseModel):
    section_id: str
    title: str
    charts: List[ChartData]
    summary_stats: Optional[Dict[str, Any]] = None
    last_updated: datetime

class AnalyticsDashboardResponse(BaseModel):
    overview: AnalyticsOverviewResponse
    sections: List[DashboardSection]
    generated_at: datetime
    cache_expires_at: datetime

class EquipmentUsageLogCreate(BaseModel):
    equipment_id: uuid.UUID
    user_id: uuid.UUID
    session_start: datetime
    session_end: Optional[datetime] = None
    job_id: Optional[uuid.UUID] = None
    materials_consumed: Optional[Dict[str, Any]] = None
    success_rate: Optional[float] = Field(None, ge=0, le=100)
    power_consumption_kwh: Optional[float] = Field(None, ge=0)
    maintenance_required: bool = False
    notes: Optional[str] = None

class InventoryAnalyticsCreate(BaseModel):
    inventory_item_id: uuid.UUID
    date: date
    starting_quantity: float = Field(..., ge=0)
    consumed_quantity: float = Field(default=0, ge=0)
    restocked_quantity: float = Field(default=0, ge=0)
    ending_quantity: float = Field(..., ge=0)
    cost_per_unit: Optional[float] = Field(None, ge=0)
    projects_using: int = Field(default=0, ge=0)

class ProjectAnalyticsCreate(BaseModel):
    project_id: uuid.UUID
    created_by: uuid.UUID
    total_cost: Optional[float] = Field(None, ge=0)
    bom_items_count: int = Field(default=0, ge=0)
    external_items_count: int = Field(default=0, ge=0)
    print_time_hours: Optional[float] = Field(None, ge=0)
    material_efficiency: Optional[float] = Field(None, ge=0, le=100)
    completion_rate: Optional[float] = Field(None, ge=0, le=100)
    equipment_hours_used: Optional[float] = Field(None, ge=0)
    collaboration_count: int = Field(default=0, ge=0)
    complexity_score: Optional[float] = Field(None, ge=0, le=10)

class RevenueAnalyticsCreate(BaseModel):
    date: date
    revenue_type: str = Field(..., description="membership, credits, store, service")
    amount: float = Field(..., gt=0)
    currency: str = Field(default="USD", max_length=3)
    payment_method: Optional[str] = None
    user_id: Optional[uuid.UUID] = None
    reference_id: Optional[uuid.UUID] = None
    tax_amount: Optional[float] = Field(None, ge=0)
    net_amount: Optional[float] = Field(None, ge=0)

    @validator('revenue_type')
    def validate_revenue_type(cls, v):
        allowed_types = ['membership', 'credits', 'store', 'service', 'equipment_rental', 'training']
        if v not in allowed_types:
            raise ValueError(f'Revenue type must be one of: {", ".join(allowed_types)}')
        return v

class AnalyticsSnapshotCreate(BaseModel):
    snapshot_type: str
    time_period: TimePeriodEnum
    start_date: datetime
    end_date: datetime
    data: Dict[str, Any]

class AnalyticsSnapshotResponse(BaseModel):
    id: uuid.UUID
    makerspace_id: uuid.UUID
    snapshot_type: str
    time_period: str
    start_date: datetime
    end_date: datetime
    data: Dict[str, Any]
    generated_at: datetime

    class Config:
        from_attributes = True
