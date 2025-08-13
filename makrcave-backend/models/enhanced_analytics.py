from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Text, Boolean, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import uuid
import enum
from datetime import datetime, timedelta

class MetricType(str, enum.Enum):
    USAGE = "usage"
    UTILIZATION = "utilization"
    REVENUE = "revenue"
    ENGAGEMENT = "engagement"
    PERFORMANCE = "performance"
    EFFICIENCY = "efficiency"

class AggregationPeriod(str, enum.Enum):
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

class AlertSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class TrendDirection(str, enum.Enum):
    UP = "up"
    DOWN = "down"
    STABLE = "stable"
    VOLATILE = "volatile"

class EnhancedUsageMetrics(Base):
    """Comprehensive usage tracking with detailed metrics"""
    __tablename__ = "enhanced_usage_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False, index=True)
    
    # Time tracking
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    period = Column(String(20), nullable=False)  # hourly, daily, weekly, monthly
    
    # User metrics
    total_active_users = Column(Integer, default=0)
    new_registrations = Column(Integer, default=0)
    returning_users = Column(Integer, default=0)
    user_retention_rate = Column(Float, default=0.0)
    average_session_duration = Column(Float, default=0.0)  # minutes
    
    # Activity metrics
    total_logins = Column(Integer, default=0)
    unique_logins = Column(Integer, default=0)
    failed_logins = Column(Integer, default=0)
    project_creations = Column(Integer, default=0)
    project_completions = Column(Integer, default=0)
    file_uploads = Column(Integer, default=0)
    collaboration_events = Column(Integer, default=0)
    
    # Equipment usage
    equipment_reservations = Column(Integer, default=0)
    equipment_hours_used = Column(Float, default=0.0)
    equipment_efficiency_score = Column(Float, default=0.0)
    maintenance_events = Column(Integer, default=0)
    equipment_failures = Column(Integer, default=0)
    
    # Inventory metrics
    inventory_transactions = Column(Integer, default=0)
    materials_consumed = Column(Float, default=0.0)
    restock_events = Column(Integer, default=0)
    inventory_turnover_rate = Column(Float, default=0.0)
    waste_percentage = Column(Float, default=0.0)
    
    # Financial activity
    revenue_generated = Column(Float, default=0.0)
    transactions_count = Column(Integer, default=0)
    average_transaction_value = Column(Float, default=0.0)
    subscription_renewals = Column(Integer, default=0)
    credit_purchases = Column(Integer, default=0)
    
    # Engagement scores
    overall_engagement_score = Column(Float, default=0.0)
    community_participation_score = Column(Float, default=0.0)
    tool_adoption_rate = Column(Float, default=0.0)
    skill_progression_rate = Column(Float, default=0.0)
    
    # Additional metadata
    peak_usage_hour = Column(String(10), nullable=True)
    busiest_day_of_week = Column(String(10), nullable=True)
    top_equipment_categories = Column(JSON, nullable=True)
    popular_project_types = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class EquipmentUtilizationMetrics(Base):
    """Detailed equipment utilization and performance tracking"""
    __tablename__ = "equipment_utilization_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    equipment_id = Column(UUID(as_uuid=True), ForeignKey("equipment.id"), nullable=False)
    
    # Time period
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    period_type = Column(String(20), nullable=False)  # daily, weekly, monthly
    
    # Utilization metrics
    total_available_hours = Column(Float, nullable=False)
    total_booked_hours = Column(Float, default=0.0)
    total_used_hours = Column(Float, default=0.0)
    idle_hours = Column(Float, default=0.0)
    maintenance_hours = Column(Float, default=0.0)
    
    # Performance metrics
    utilization_rate = Column(Float, default=0.0)  # used_hours / available_hours * 100
    booking_efficiency = Column(Float, default=0.0)  # used_hours / booked_hours * 100
    uptime_percentage = Column(Float, default=0.0)
    
    # Usage patterns
    peak_usage_hours = Column(JSON, nullable=True)  # [{"hour": 14, "usage": 85}, ...]
    usage_frequency = Column(Integer, default=0)  # number of sessions
    average_session_duration = Column(Float, default=0.0)  # minutes
    unique_users = Column(Integer, default=0)
    
    # Quality metrics
    successful_sessions = Column(Integer, default=0)
    failed_sessions = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    user_satisfaction_score = Column(Float, nullable=True)  # 1-10 scale
    
    # Cost and efficiency
    energy_consumption_kwh = Column(Float, default=0.0)
    maintenance_cost = Column(Float, default=0.0)
    revenue_generated = Column(Float, default=0.0)
    cost_per_hour = Column(Float, default=0.0)
    roi_percentage = Column(Float, default=0.0)
    
    # Predictive metrics
    predicted_maintenance_date = Column(DateTime(timezone=True), nullable=True)
    wear_level_percentage = Column(Float, default=0.0)
    replacement_priority_score = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class RevenueAnalyticsEnhanced(Base):
    """Enhanced revenue tracking with detailed breakdowns"""
    __tablename__ = "revenue_analytics_enhanced"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    
    # Time tracking
    transaction_date = Column(DateTime(timezone=True), nullable=False, index=True)
    reporting_period = Column(String(20), nullable=False)  # daily, weekly, monthly
    
    # Revenue categories
    membership_revenue = Column(Float, default=0.0)
    equipment_rental_revenue = Column(Float, default=0.0)
    service_revenue = Column(Float, default=0.0)
    training_revenue = Column(Float, default=0.0)
    store_revenue = Column(Float, default=0.0)
    credit_sales_revenue = Column(Float, default=0.0)
    late_fees_revenue = Column(Float, default=0.0)
    other_revenue = Column(Float, default=0.0)
    
    # Payment method breakdown
    card_payments = Column(Float, default=0.0)
    bank_transfer_payments = Column(Float, default=0.0)
    cash_payments = Column(Float, default=0.0)
    digital_wallet_payments = Column(Float, default=0.0)
    credit_system_payments = Column(Float, default=0.0)
    
    # Transaction metrics
    total_transactions = Column(Integer, default=0)
    average_transaction_value = Column(Float, default=0.0)
    largest_transaction = Column(Float, default=0.0)
    smallest_transaction = Column(Float, default=0.0)
    
    # Customer metrics
    new_customer_revenue = Column(Float, default=0.0)
    returning_customer_revenue = Column(Float, default=0.0)
    customer_lifetime_value = Column(Float, default=0.0)
    churn_impact = Column(Float, default=0.0)
    
    # Costs and margins
    gross_revenue = Column(Float, default=0.0)
    payment_processing_fees = Column(Float, default=0.0)
    refunds_issued = Column(Float, default=0.0)
    chargebacks = Column(Float, default=0.0)
    net_revenue = Column(Float, default=0.0)
    
    # Growth metrics
    revenue_growth_rate = Column(Float, default=0.0)  # compared to previous period
    quarterly_growth_rate = Column(Float, default=0.0)
    yearly_growth_rate = Column(Float, default=0.0)
    
    # Forecasting
    projected_monthly_revenue = Column(Float, nullable=True)
    confidence_interval = Column(Float, nullable=True)
    trend_direction = Column(String(20), nullable=True)
    
    # Additional metadata
    top_revenue_sources = Column(JSON, nullable=True)
    geographical_breakdown = Column(JSON, nullable=True)
    seasonal_factors = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MemberEngagementMetrics(Base):
    """Comprehensive member engagement and behavior analytics"""
    __tablename__ = "member_engagement_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=False)
    
    # Time period
    analysis_date = Column(DateTime(timezone=True), nullable=False, index=True)
    period_type = Column(String(20), nullable=False)  # weekly, monthly, quarterly
    
    # Activity metrics
    login_frequency = Column(Integer, default=0)
    total_session_time = Column(Float, default=0.0)  # hours
    average_session_duration = Column(Float, default=0.0)  # minutes
    last_activity_date = Column(DateTime(timezone=True), nullable=True)
    
    # Project engagement
    projects_created = Column(Integer, default=0)
    projects_completed = Column(Integer, default=0)
    project_completion_rate = Column(Float, default=0.0)
    collaborative_projects = Column(Integer, default=0)
    public_projects_shared = Column(Integer, default=0)
    
    # Equipment usage
    equipment_used = Column(Integer, default=0)  # unique equipment count
    total_equipment_hours = Column(Float, default=0.0)
    favorite_equipment_category = Column(String(100), nullable=True)
    skill_certifications_earned = Column(Integer, default=0)
    
    # Community engagement
    forum_posts = Column(Integer, default=0)
    comments_made = Column(Integer, default=0)
    likes_given = Column(Integer, default=0)
    likes_received = Column(Integer, default=0)
    mentoring_sessions = Column(Integer, default=0)
    events_attended = Column(Integer, default=0)
    
    # Learning and growth
    tutorials_completed = Column(Integer, default=0)
    skills_acquired = Column(Integer, default=0)
    certifications_achieved = Column(Integer, default=0)
    knowledge_base_searches = Column(Integer, default=0)
    help_requests = Column(Integer, default=0)
    
    # Financial engagement
    total_spent = Column(Float, default=0.0)
    credits_purchased = Column(Float, default=0.0)
    store_purchases = Column(Integer, default=0)
    subscription_renewals = Column(Integer, default=0)
    
    # Engagement scores (0-100)
    overall_engagement_score = Column(Float, default=0.0)
    activity_engagement_score = Column(Float, default=0.0)
    social_engagement_score = Column(Float, default=0.0)
    learning_engagement_score = Column(Float, default=0.0)
    financial_engagement_score = Column(Float, default=0.0)
    
    # Risk indicators
    churn_risk_score = Column(Float, default=0.0)  # 0-100, higher = more risk
    engagement_trend = Column(String(20), nullable=True)  # increasing, decreasing, stable
    retention_probability = Column(Float, default=0.0)
    
    # Personalization data
    preferred_visit_times = Column(JSON, nullable=True)
    interest_categories = Column(JSON, nullable=True)
    recommendation_acceptance_rate = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AnalyticsAlert(Base):
    """System alerts for important analytics events"""
    __tablename__ = "analytics_alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    
    # Alert details
    alert_type = Column(String(50), nullable=False)  # threshold, anomaly, trend, etc.
    severity = Column(String(20), nullable=False)  # low, medium, high, critical
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    # Related data
    metric_type = Column(String(50), nullable=False)
    metric_value = Column(Float, nullable=True)
    threshold_value = Column(Float, nullable=True)
    related_resource_id = Column(UUID(as_uuid=True), nullable=True)
    related_resource_type = Column(String(50), nullable=True)
    
    # Alert status
    is_active = Column(Boolean, default=True)
    acknowledged_by = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    # Action tracking
    actions_taken = Column(JSON, nullable=True)
    notification_sent = Column(Boolean, default=False)
    escalation_level = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class PerformanceBenchmark(Base):
    """Performance benchmarks and KPI tracking"""
    __tablename__ = "performance_benchmarks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    
    # Benchmark details
    benchmark_name = Column(String(100), nullable=False)
    benchmark_type = Column(String(50), nullable=False)  # utilization, revenue, engagement
    category = Column(String(50), nullable=True)
    
    # Values
    current_value = Column(Float, nullable=False)
    target_value = Column(Float, nullable=False)
    industry_average = Column(Float, nullable=True)
    previous_period_value = Column(Float, nullable=True)
    
    # Performance indicators
    performance_percentage = Column(Float, nullable=False)  # current vs target
    trend_direction = Column(String(20), nullable=True)
    achievement_status = Column(String(20), nullable=False)  # exceeded, met, below, critical
    
    # Time tracking
    measurement_period = Column(String(20), nullable=False)
    measurement_date = Column(DateTime(timezone=True), nullable=False)
    
    # Analysis
    variance_percentage = Column(Float, nullable=True)
    confidence_level = Column(Float, nullable=True)
    improvement_needed = Column(Float, nullable=True)
    
    # Metadata
    measurement_method = Column(String(100), nullable=True)
    data_quality_score = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AnalyticsReport(Base):
    """Generated analytics reports with metadata"""
    __tablename__ = "analytics_reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    
    # Report details
    report_name = Column(String(200), nullable=False)
    report_type = Column(String(50), nullable=False)
    report_category = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    
    # Generation details
    generated_by = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=False)
    generation_parameters = Column(JSON, nullable=True)
    data_sources = Column(JSON, nullable=True)
    filters_applied = Column(JSON, nullable=True)
    
    # Time range
    report_start_date = Column(DateTime(timezone=True), nullable=False)
    report_end_date = Column(DateTime(timezone=True), nullable=False)
    
    # File information
    file_format = Column(String(10), nullable=False)
    file_size_bytes = Column(Integer, nullable=True)
    file_path = Column(String(500), nullable=True)
    download_url = Column(String(500), nullable=True)
    
    # Access control
    is_public = Column(Boolean, default=False)
    access_permissions = Column(JSON, nullable=True)
    download_count = Column(Integer, default=0)
    last_downloaded = Column(DateTime(timezone=True), nullable=True)
    
    # Lifecycle
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_archived = Column(Boolean, default=False)
    archived_at = Column(DateTime(timezone=True), nullable=True)
    
    # Quality metrics
    data_completeness = Column(Float, nullable=True)
    accuracy_score = Column(Float, nullable=True)
    freshness_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class AnalyticsConfiguration(Base):
    """Configuration for analytics collection and processing"""
    __tablename__ = "analytics_configuration"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    
    # Configuration details
    config_name = Column(String(100), nullable=False)
    config_type = Column(String(50), nullable=False)  # collection, processing, alerting
    is_enabled = Column(Boolean, default=True)
    
    # Settings
    collection_frequency = Column(String(20), nullable=True)  # realtime, hourly, daily
    aggregation_periods = Column(ARRAY(String), nullable=True)
    retention_days = Column(Integer, default=365)
    
    # Thresholds and alerts
    alert_thresholds = Column(JSON, nullable=True)
    notification_settings = Column(JSON, nullable=True)
    escalation_rules = Column(JSON, nullable=True)
    
    # Processing options
    enable_real_time = Column(Boolean, default=True)
    enable_machine_learning = Column(Boolean, default=False)
    enable_forecasting = Column(Boolean, default=True)
    enable_anomaly_detection = Column(Boolean, default=True)
    
    # Performance settings
    batch_size = Column(Integer, default=1000)
    parallel_processing = Column(Boolean, default=True)
    cache_duration_minutes = Column(Integer, default=60)
    
    # Compliance and privacy
    data_anonymization = Column(Boolean, default=True)
    gdpr_compliant = Column(Boolean, default=True)
    audit_trail_enabled = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Comprehensive indexes for performance
Index('idx_usage_metrics_makerspace_period', EnhancedUsageMetrics.makerspace_id, EnhancedUsageMetrics.period, EnhancedUsageMetrics.timestamp)
Index('idx_equipment_utilization_equipment_date', EquipmentUtilizationMetrics.equipment_id, EquipmentUtilizationMetrics.date)
Index('idx_revenue_enhanced_makerspace_date', RevenueAnalyticsEnhanced.makerspace_id, RevenueAnalyticsEnhanced.transaction_date)
Index('idx_engagement_member_date', MemberEngagementMetrics.member_id, MemberEngagementMetrics.analysis_date)
Index('idx_analytics_alerts_active', AnalyticsAlert.makerspace_id, AnalyticsAlert.is_active, AnalyticsAlert.severity)
Index('idx_performance_benchmarks_type', PerformanceBenchmark.makerspace_id, PerformanceBenchmark.benchmark_type, PerformanceBenchmark.measurement_date)
