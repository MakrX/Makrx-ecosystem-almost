from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
from enum import Enum
import uuid

class MetricType(str, Enum):
    USAGE = "usage"
    UTILIZATION = "utilization"
    REVENUE = "revenue"
    ENGAGEMENT = "engagement"
    PERFORMANCE = "performance"
    EFFICIENCY = "efficiency"

class AggregationPeriod(str, Enum):
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

class TrendDirection(str, Enum):
    UP = "up"
    DOWN = "down"
    STABLE = "stable"
    VOLATILE = "volatile"

class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# Enhanced Usage Metrics Schemas
class EnhancedUsageMetricsCreate(BaseModel):
    period: AggregationPeriod
    total_active_users: int = 0
    new_registrations: int = 0
    returning_users: int = 0
    user_retention_rate: float = Field(0.0, ge=0, le=100)
    average_session_duration: float = Field(0.0, ge=0)
    total_logins: int = 0
    unique_logins: int = 0
    failed_logins: int = 0
    project_creations: int = 0
    project_completions: int = 0
    file_uploads: int = 0
    collaboration_events: int = 0
    equipment_reservations: int = 0
    equipment_hours_used: float = Field(0.0, ge=0)
    equipment_efficiency_score: float = Field(0.0, ge=0, le=100)
    maintenance_events: int = 0
    equipment_failures: int = 0
    inventory_transactions: int = 0
    materials_consumed: float = Field(0.0, ge=0)
    restock_events: int = 0
    inventory_turnover_rate: float = Field(0.0, ge=0)
    waste_percentage: float = Field(0.0, ge=0, le=100)
    revenue_generated: float = Field(0.0, ge=0)
    transactions_count: int = 0
    average_transaction_value: float = Field(0.0, ge=0)
    subscription_renewals: int = 0
    credit_purchases: int = 0
    overall_engagement_score: float = Field(0.0, ge=0, le=100)
    community_participation_score: float = Field(0.0, ge=0, le=100)
    tool_adoption_rate: float = Field(0.0, ge=0, le=100)
    skill_progression_rate: float = Field(0.0, ge=0, le=100)
    peak_usage_hour: Optional[str] = None
    busiest_day_of_week: Optional[str] = None
    top_equipment_categories: Optional[List[Dict[str, Any]]] = None
    popular_project_types: Optional[List[Dict[str, Any]]] = None

class EnhancedUsageMetricsResponse(EnhancedUsageMetricsCreate):
    id: uuid.UUID
    makerspace_id: uuid.UUID
    timestamp: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Equipment Utilization Schemas
class EquipmentUtilizationMetricsCreate(BaseModel):
    equipment_id: uuid.UUID
    date: datetime
    period_type: AggregationPeriod
    total_available_hours: float = Field(..., ge=0)
    total_booked_hours: float = Field(0.0, ge=0)
    total_used_hours: float = Field(0.0, ge=0)
    idle_hours: float = Field(0.0, ge=0)
    maintenance_hours: float = Field(0.0, ge=0)
    utilization_rate: float = Field(0.0, ge=0, le=100)
    booking_efficiency: float = Field(0.0, ge=0, le=100)
    uptime_percentage: float = Field(0.0, ge=0, le=100)
    peak_usage_hours: Optional[List[Dict[str, Any]]] = None
    usage_frequency: int = Field(0, ge=0)
    average_session_duration: float = Field(0.0, ge=0)
    unique_users: int = Field(0, ge=0)
    successful_sessions: int = Field(0, ge=0)
    failed_sessions: int = Field(0, ge=0)
    success_rate: float = Field(0.0, ge=0, le=100)
    user_satisfaction_score: Optional[float] = Field(None, ge=1, le=10)
    energy_consumption_kwh: float = Field(0.0, ge=0)
    maintenance_cost: float = Field(0.0, ge=0)
    revenue_generated: float = Field(0.0, ge=0)
    cost_per_hour: float = Field(0.0, ge=0)
    roi_percentage: float = Field(0.0)
    predicted_maintenance_date: Optional[datetime] = None
    wear_level_percentage: float = Field(0.0, ge=0, le=100)
    replacement_priority_score: float = Field(0.0, ge=0, le=100)

class EquipmentUtilizationMetricsResponse(EquipmentUtilizationMetricsCreate):
    id: uuid.UUID
    makerspace_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Enhanced Revenue Analytics Schemas
class RevenueAnalyticsEnhancedCreate(BaseModel):
    transaction_date: datetime
    reporting_period: AggregationPeriod
    membership_revenue: float = Field(0.0, ge=0)
    equipment_rental_revenue: float = Field(0.0, ge=0)
    service_revenue: float = Field(0.0, ge=0)
    training_revenue: float = Field(0.0, ge=0)
    store_revenue: float = Field(0.0, ge=0)
    credit_sales_revenue: float = Field(0.0, ge=0)
    late_fees_revenue: float = Field(0.0, ge=0)
    other_revenue: float = Field(0.0, ge=0)
    card_payments: float = Field(0.0, ge=0)
    bank_transfer_payments: float = Field(0.0, ge=0)
    cash_payments: float = Field(0.0, ge=0)
    digital_wallet_payments: float = Field(0.0, ge=0)
    credit_system_payments: float = Field(0.0, ge=0)
    total_transactions: int = Field(0, ge=0)
    average_transaction_value: float = Field(0.0, ge=0)
    largest_transaction: float = Field(0.0, ge=0)
    smallest_transaction: float = Field(0.0, ge=0)
    new_customer_revenue: float = Field(0.0, ge=0)
    returning_customer_revenue: float = Field(0.0, ge=0)
    customer_lifetime_value: float = Field(0.0, ge=0)
    churn_impact: float = Field(0.0, ge=0)
    gross_revenue: float = Field(0.0, ge=0)
    payment_processing_fees: float = Field(0.0, ge=0)
    refunds_issued: float = Field(0.0, ge=0)
    chargebacks: float = Field(0.0, ge=0)
    net_revenue: float = Field(0.0, ge=0)
    revenue_growth_rate: float = 0.0
    quarterly_growth_rate: float = 0.0
    yearly_growth_rate: float = 0.0
    projected_monthly_revenue: Optional[float] = None
    confidence_interval: Optional[float] = None
    trend_direction: Optional[TrendDirection] = None
    top_revenue_sources: Optional[List[Dict[str, Any]]] = None
    geographical_breakdown: Optional[Dict[str, float]] = None
    seasonal_factors: Optional[Dict[str, float]] = None

class RevenueAnalyticsEnhancedResponse(RevenueAnalyticsEnhancedCreate):
    id: uuid.UUID
    makerspace_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Member Engagement Schemas
class MemberEngagementMetricsCreate(BaseModel):
    member_id: uuid.UUID
    analysis_date: datetime
    period_type: AggregationPeriod
    login_frequency: int = Field(0, ge=0)
    total_session_time: float = Field(0.0, ge=0)
    average_session_duration: float = Field(0.0, ge=0)
    last_activity_date: Optional[datetime] = None
    projects_created: int = Field(0, ge=0)
    projects_completed: int = Field(0, ge=0)
    project_completion_rate: float = Field(0.0, ge=0, le=100)
    collaborative_projects: int = Field(0, ge=0)
    public_projects_shared: int = Field(0, ge=0)
    equipment_used: int = Field(0, ge=0)
    total_equipment_hours: float = Field(0.0, ge=0)
    favorite_equipment_category: Optional[str] = None
    skill_certifications_earned: int = Field(0, ge=0)
    forum_posts: int = Field(0, ge=0)
    comments_made: int = Field(0, ge=0)
    likes_given: int = Field(0, ge=0)
    likes_received: int = Field(0, ge=0)
    mentoring_sessions: int = Field(0, ge=0)
    events_attended: int = Field(0, ge=0)
    tutorials_completed: int = Field(0, ge=0)
    skills_acquired: int = Field(0, ge=0)
    certifications_achieved: int = Field(0, ge=0)
    knowledge_base_searches: int = Field(0, ge=0)
    help_requests: int = Field(0, ge=0)
    total_spent: float = Field(0.0, ge=0)
    credits_purchased: float = Field(0.0, ge=0)
    store_purchases: int = Field(0, ge=0)
    subscription_renewals: int = Field(0, ge=0)
    overall_engagement_score: float = Field(0.0, ge=0, le=100)
    activity_engagement_score: float = Field(0.0, ge=0, le=100)
    social_engagement_score: float = Field(0.0, ge=0, le=100)
    learning_engagement_score: float = Field(0.0, ge=0, le=100)
    financial_engagement_score: float = Field(0.0, ge=0, le=100)
    churn_risk_score: float = Field(0.0, ge=0, le=100)
    engagement_trend: Optional[TrendDirection] = None
    retention_probability: float = Field(0.0, ge=0, le=100)
    preferred_visit_times: Optional[List[Dict[str, Any]]] = None
    interest_categories: Optional[List[str]] = None
    recommendation_acceptance_rate: float = Field(0.0, ge=0, le=100)

class MemberEngagementMetricsResponse(MemberEngagementMetricsCreate):
    id: uuid.UUID
    makerspace_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Analytics Alert Schemas
class AnalyticsAlertCreate(BaseModel):
    alert_type: str
    severity: AlertSeverity
    title: str = Field(..., max_length=200)
    description: str
    metric_type: str
    metric_value: Optional[float] = None
    threshold_value: Optional[float] = None
    related_resource_id: Optional[uuid.UUID] = None
    related_resource_type: Optional[str] = None
    actions_taken: Optional[List[Dict[str, Any]]] = None

class AnalyticsAlertUpdate(BaseModel):
    is_active: Optional[bool] = None
    acknowledged_by: Optional[uuid.UUID] = None
    resolution_notes: Optional[str] = None
    actions_taken: Optional[List[Dict[str, Any]]] = None

class AnalyticsAlertResponse(AnalyticsAlertCreate):
    id: uuid.UUID
    makerspace_id: uuid.UUID
    is_active: bool
    acknowledged_by: Optional[uuid.UUID] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    notification_sent: bool
    escalation_level: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Performance Benchmark Schemas
class PerformanceBenchmarkCreate(BaseModel):
    benchmark_name: str = Field(..., max_length=100)
    benchmark_type: str
    category: Optional[str] = None
    current_value: float
    target_value: float
    industry_average: Optional[float] = None
    previous_period_value: Optional[float] = None
    measurement_period: AggregationPeriod
    measurement_date: datetime
    measurement_method: Optional[str] = None
    notes: Optional[str] = None

class PerformanceBenchmarkResponse(PerformanceBenchmarkCreate):
    id: uuid.UUID
    makerspace_id: uuid.UUID
    performance_percentage: float
    trend_direction: Optional[TrendDirection] = None
    achievement_status: str
    variance_percentage: Optional[float] = None
    confidence_level: Optional[float] = None
    improvement_needed: Optional[float] = None
    data_quality_score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Analytics Report Schemas
class AnalyticsReportCreate(BaseModel):
    report_name: str = Field(..., max_length=200)
    report_type: str
    report_category: str
    description: Optional[str] = None
    generation_parameters: Optional[Dict[str, Any]] = None
    data_sources: Optional[List[str]] = None
    filters_applied: Optional[Dict[str, Any]] = None
    report_start_date: datetime
    report_end_date: datetime
    file_format: str = Field(..., regex="^(pdf|xlsx|csv|json)$")
    is_public: bool = False
    access_permissions: Optional[List[str]] = None
    expires_at: Optional[datetime] = None

class AnalyticsReportResponse(AnalyticsReportCreate):
    id: uuid.UUID
    makerspace_id: uuid.UUID
    generated_by: uuid.UUID
    file_size_bytes: Optional[int] = None
    file_path: Optional[str] = None
    download_url: Optional[str] = None
    download_count: int
    last_downloaded: Optional[datetime] = None
    is_archived: bool
    archived_at: Optional[datetime] = None
    data_completeness: Optional[float] = None
    accuracy_score: Optional[float] = None
    freshness_score: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Analytics Configuration Schemas
class AnalyticsConfigurationCreate(BaseModel):
    config_name: str = Field(..., max_length=100)
    config_type: str
    is_enabled: bool = True
    collection_frequency: Optional[str] = None
    aggregation_periods: Optional[List[AggregationPeriod]] = None
    retention_days: int = Field(365, gt=0, le=2555)  # max 7 years
    alert_thresholds: Optional[Dict[str, float]] = None
    notification_settings: Optional[Dict[str, Any]] = None
    escalation_rules: Optional[List[Dict[str, Any]]] = None
    enable_real_time: bool = True
    enable_machine_learning: bool = False
    enable_forecasting: bool = True
    enable_anomaly_detection: bool = True
    batch_size: int = Field(1000, gt=0, le=10000)
    parallel_processing: bool = True
    cache_duration_minutes: int = Field(60, gt=0, le=1440)
    data_anonymization: bool = True
    gdpr_compliant: bool = True
    audit_trail_enabled: bool = True

class AnalyticsConfigurationResponse(AnalyticsConfigurationCreate):
    id: uuid.UUID
    makerspace_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Comprehensive Dashboard Schemas
class KPIMetric(BaseModel):
    name: str
    value: Union[int, float, str]
    previous_value: Optional[Union[int, float, str]] = None
    change_percentage: Optional[float] = None
    trend: Optional[TrendDirection] = None
    status: str = "good"  # good, warning, critical
    unit: Optional[str] = None
    target: Optional[Union[int, float]] = None

class ChartDataPoint(BaseModel):
    label: str
    value: Union[int, float]
    date: Optional[datetime] = None
    category: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class AnalyticsChart(BaseModel):
    chart_id: str
    title: str
    chart_type: str = "line"  # line, bar, pie, area, scatter, heatmap
    data: List[ChartDataPoint]
    x_axis_label: Optional[str] = None
    y_axis_label: Optional[str] = None
    color_scheme: Optional[List[str]] = None
    annotations: Optional[List[Dict[str, Any]]] = None

class DashboardSection(BaseModel):
    section_id: str
    title: str
    description: Optional[str] = None
    kpi_metrics: List[KPIMetric] = []
    charts: List[AnalyticsChart] = []
    alerts: List[AnalyticsAlertResponse] = []
    last_updated: datetime
    refresh_interval: int = 300  # seconds

class ComprehensiveDashboardResponse(BaseModel):
    makerspace_id: uuid.UUID
    dashboard_title: str
    overview_metrics: List[KPIMetric]
    sections: List[DashboardSection]
    generated_at: datetime
    cache_expires_at: datetime
    data_freshness: Dict[str, datetime]
    performance_score: float = Field(..., ge=0, le=100)

# Analytics Query and Filter Schemas
class AnalyticsQuery(BaseModel):
    metrics: List[str]
    dimensions: Optional[List[str]] = None
    filters: Optional[Dict[str, Any]] = None
    date_range: Optional[Dict[str, datetime]] = None
    aggregation: AggregationPeriod = AggregationPeriod.DAILY
    limit: int = Field(1000, gt=0, le=10000)
    offset: int = Field(0, ge=0)
    sort_by: Optional[str] = None
    sort_order: str = Field("desc", regex="^(asc|desc)$")

class AnalyticsQueryResult(BaseModel):
    query: AnalyticsQuery
    results: List[Dict[str, Any]]
    total_count: int
    execution_time_ms: int
    data_sources: List[str]
    cache_hit: bool
    metadata: Optional[Dict[str, Any]] = None

# Predictive Analytics Schemas
class ForecastRequest(BaseModel):
    metric: str
    periods: int = Field(..., gt=0, le=365)
    confidence_level: float = Field(0.95, gt=0, lt=1)
    seasonality: bool = True
    trend: bool = True
    include_holidays: bool = False

class ForecastResult(BaseModel):
    metric: str
    forecast_data: List[ChartDataPoint]
    confidence_intervals: List[Dict[str, float]]
    model_accuracy: float
    model_type: str
    forecast_quality: str  # excellent, good, fair, poor
    warnings: List[str] = []

# Export and Import Schemas
class AnalyticsExportRequest(BaseModel):
    export_type: str = Field(..., regex="^(dashboard|metrics|reports|all)$")
    format: str = Field(..., regex="^(json|csv|xlsx|pdf)$")
    date_range: Optional[Dict[str, datetime]] = None
    filters: Optional[Dict[str, Any]] = None
    include_raw_data: bool = False
    include_visualizations: bool = True

class AnalyticsExportResponse(BaseModel):
    export_id: uuid.UUID
    status: str
    file_url: Optional[str] = None
    file_size_bytes: Optional[int] = None
    generated_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    error_message: Optional[str] = None
