from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date
import uuid

from ..database import get_db
from ..dependencies import get_current_user
from ..schemas.enhanced_analytics import (
    EnhancedUsageMetricsCreate, EnhancedUsageMetricsResponse,
    EquipmentUtilizationMetricsCreate, EquipmentUtilizationMetricsResponse,
    RevenueAnalyticsEnhancedCreate, RevenueAnalyticsEnhancedResponse,
    MemberEngagementMetricsCreate, MemberEngagementMetricsResponse,
    AnalyticsAlertCreate, AnalyticsAlertUpdate, AnalyticsAlertResponse,
    PerformanceBenchmarkCreate, PerformanceBenchmarkResponse,
    AnalyticsReportCreate, AnalyticsReportResponse,
    AnalyticsConfigurationCreate, AnalyticsConfigurationResponse,
    ComprehensiveDashboardResponse, AnalyticsQuery, AnalyticsQueryResult,
    ForecastRequest, ForecastResult, AnalyticsExportRequest, AnalyticsExportResponse,
    AggregationPeriod, MetricType, AlertSeverity, TrendDirection
)
from ..crud import enhanced_analytics as crud_analytics

router = APIRouter()

# Enhanced Usage Metrics Routes
@router.post("/usage-metrics/", response_model=EnhancedUsageMetricsResponse, status_code=status.HTTP_201_CREATED)
async def create_usage_metrics(
    metrics: EnhancedUsageMetricsCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create enhanced usage metrics entry"""
    if not _has_analytics_permission(current_user, "create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create analytics data"
        )
    
    try:
        db_metrics = crud_analytics.create_usage_metrics(
            db, metrics, _get_user_makerspace_id(current_user)
        )
        return db_metrics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create usage metrics: {str(e)}"
        )

@router.get("/usage-metrics/", response_model=List[EnhancedUsageMetricsResponse])
async def get_usage_metrics(
    period: Optional[AggregationPeriod] = None,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get usage metrics with filtering"""
    if not _has_analytics_permission(current_user, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view analytics data"
        )
    
    makerspace_id = _get_user_makerspace_id(current_user)
    metrics = crud_analytics.get_usage_metrics(
        db, makerspace_id, period, start_date, end_date, skip, limit
    )
    return metrics

@router.get("/usage-metrics/summary")
async def get_usage_summary(
    period: AggregationPeriod = AggregationPeriod.WEEKLY,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get usage metrics summary"""
    if not _has_analytics_permission(current_user, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view analytics data"
        )
    
    makerspace_id = _get_user_makerspace_id(current_user)
    summary = crud_analytics.get_usage_summary(db, makerspace_id, period)
    return summary

# Equipment Utilization Routes
@router.post("/equipment-utilization/", response_model=EquipmentUtilizationMetricsResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment_utilization(
    utilization: EquipmentUtilizationMetricsCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create equipment utilization metrics"""
    if not _has_analytics_permission(current_user, "create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create analytics data"
        )
    
    try:
        db_utilization = crud_analytics.create_equipment_utilization(
            db, utilization, _get_user_makerspace_id(current_user)
        )
        return db_utilization
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create equipment utilization metrics: {str(e)}"
        )

@router.get("/equipment-utilization/", response_model=List[EquipmentUtilizationMetricsResponse])
async def get_equipment_utilization(
    equipment_id: Optional[str] = Query(None),
    period_type: Optional[AggregationPeriod] = None,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get equipment utilization metrics"""
    if not _has_analytics_permission(current_user, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view analytics data"
        )
    
    makerspace_id = _get_user_makerspace_id(current_user)
    utilization = crud_analytics.get_equipment_utilization(
        db, makerspace_id, equipment_id, period_type, start_date, end_date, skip, limit
    )
    return utilization

@router.get("/equipment-utilization/summary")
async def get_equipment_utilization_summary(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get equipment utilization summary"""
    if not _has_analytics_permission(current_user, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view analytics data"
        )
    
    makerspace_id = _get_user_makerspace_id(current_user)
    summary = crud_analytics.get_equipment_utilization_summary(db, makerspace_id)
    return summary

# Enhanced Revenue Analytics Routes
@router.post("/revenue-analytics/", response_model=RevenueAnalyticsEnhancedResponse, status_code=status.HTTP_201_CREATED)
async def create_revenue_analytics(
    revenue: RevenueAnalyticsEnhancedCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create enhanced revenue analytics entry"""
    if not _has_analytics_permission(current_user, "create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create analytics data"
        )
    
    try:
        db_revenue = crud_analytics.create_revenue_analytics(
            db, revenue, _get_user_makerspace_id(current_user)
        )
        return db_revenue
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create revenue analytics: {str(e)}"
        )

@router.get("/revenue-analytics/", response_model=List[RevenueAnalyticsEnhancedResponse])
async def get_revenue_analytics(
    reporting_period: Optional[AggregationPeriod] = None,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get revenue analytics with filtering"""
    if not _has_analytics_permission(current_user, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view analytics data"
        )
    
    makerspace_id = _get_user_makerspace_id(current_user)
    revenue = crud_analytics.get_revenue_analytics(
        db, makerspace_id, reporting_period, start_date, end_date, skip, limit
    )
    return revenue

@router.get("/revenue-analytics/summary")
async def get_revenue_summary(
    period: AggregationPeriod = AggregationPeriod.MONTHLY,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get revenue analytics summary"""
    if not _has_analytics_permission(current_user, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view analytics data"
        )
    
    makerspace_id = _get_user_makerspace_id(current_user)
    summary = crud_analytics.get_revenue_summary(db, makerspace_id, period)
    return summary

# Member Engagement Routes
@router.post("/engagement-metrics/", response_model=MemberEngagementMetricsResponse, status_code=status.HTTP_201_CREATED)
async def create_engagement_metrics(
    engagement: MemberEngagementMetricsCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create member engagement metrics"""
    if not _has_analytics_permission(current_user, "create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create analytics data"
        )
    
    try:
        db_engagement = crud_analytics.create_engagement_metrics(
            db, engagement, _get_user_makerspace_id(current_user)
        )
        return db_engagement
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create engagement metrics: {str(e)}"
        )

@router.get("/engagement-metrics/", response_model=List[MemberEngagementMetricsResponse])
async def get_engagement_metrics(
    member_id: Optional[str] = Query(None),
    period_type: Optional[AggregationPeriod] = None,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get member engagement metrics"""
    if not _has_analytics_permission(current_user, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view analytics data"
        )
    
    makerspace_id = _get_user_makerspace_id(current_user)
    engagement = crud_analytics.get_engagement_metrics(
        db, makerspace_id, member_id, period_type, start_date, end_date, skip, limit
    )
    return engagement

@router.get("/engagement-metrics/summary")
async def get_engagement_summary(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get member engagement summary"""
    if not _has_analytics_permission(current_user, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view analytics data"
        )
    
    makerspace_id = _get_user_makerspace_id(current_user)
    summary = crud_analytics.get_engagement_summary(db, makerspace_id)
    return summary

# Analytics Alerts Routes
@router.post("/alerts/", response_model=AnalyticsAlertResponse, status_code=status.HTTP_201_CREATED)
async def create_analytics_alert(
    alert: AnalyticsAlertCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create analytics alert"""
    if not _has_analytics_permission(current_user, "create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create alerts"
        )
    
    try:
        db_alert = crud_analytics.create_alert(
            db, alert, _get_user_makerspace_id(current_user)
        )
        return db_alert
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create analytics alert: {str(e)}"
        )

@router.get("/alerts/", response_model=List[AnalyticsAlertResponse])
async def get_analytics_alerts(
    severity: Optional[AlertSeverity] = None,
    is_active: Optional[bool] = None,
    alert_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics alerts with filtering"""
    if not _has_analytics_permission(current_user, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view alerts"
        )
    
    makerspace_id = _get_user_makerspace_id(current_user)
    alerts = crud_analytics.get_alerts(
        db, makerspace_id, severity, is_active, alert_type, skip, limit
    )
    return alerts

@router.put("/alerts/{alert_id}", response_model=AnalyticsAlertResponse)
async def update_analytics_alert(
    alert_id: str,
    alert_update: AnalyticsAlertUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update analytics alert"""
    if not _has_analytics_permission(current_user, "update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update alerts"
        )
    
    alert = crud_analytics.update_alert(db, alert_id, alert_update, current_user["user_id"])
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    return alert

# Performance Benchmarks Routes
@router.post("/benchmarks/", response_model=PerformanceBenchmarkResponse, status_code=status.HTTP_201_CREATED)
async def create_performance_benchmark(
    benchmark: PerformanceBenchmarkCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create performance benchmark"""
    if not _has_analytics_permission(current_user, "create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create benchmarks"
        )
    
    try:
        db_benchmark = crud_analytics.create_benchmark(
            db, benchmark, _get_user_makerspace_id(current_user)
        )
        return db_benchmark
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create performance benchmark: {str(e)}"
        )

@router.get("/benchmarks/", response_model=List[PerformanceBenchmarkResponse])
async def get_performance_benchmarks(
    benchmark_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get performance benchmarks"""
    if not _has_analytics_permission(current_user, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view benchmarks"
        )
    
    makerspace_id = _get_user_makerspace_id(current_user)
    benchmarks = crud_analytics.get_benchmarks(
        db, makerspace_id, benchmark_type, category, skip, limit
    )
    return benchmarks

# Comprehensive Dashboard Route
@router.get("/dashboard/comprehensive", response_model=ComprehensiveDashboardResponse)
async def get_comprehensive_dashboard(
    refresh_cache: bool = Query(False),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics dashboard"""
    if not _has_analytics_permission(current_user, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view dashboard"
        )
    
    try:
        makerspace_id = _get_user_makerspace_id(current_user)
        dashboard = crud_analytics.get_comprehensive_dashboard(
            db, makerspace_id, refresh_cache
        )
        return dashboard
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate dashboard: {str(e)}"
        )

# Analytics Query Route
@router.post("/query/", response_model=AnalyticsQueryResult)
async def execute_analytics_query(
    query: AnalyticsQuery,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Execute custom analytics query"""
    if not _has_analytics_permission(current_user, "query"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to execute queries"
        )
    
    try:
        makerspace_id = _get_user_makerspace_id(current_user)
        result = crud_analytics.execute_query(db, makerspace_id, query)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute query: {str(e)}"
        )

# Forecasting Routes
@router.post("/forecast/", response_model=ForecastResult)
async def generate_forecast(
    forecast_request: ForecastRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate predictive forecast"""
    if not _has_analytics_permission(current_user, "forecast"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to generate forecasts"
        )
    
    try:
        makerspace_id = _get_user_makerspace_id(current_user)
        forecast = crud_analytics.generate_forecast(db, makerspace_id, forecast_request)
        return forecast
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate forecast: {str(e)}"
        )

# Analytics Reports Routes
@router.post("/reports/", response_model=AnalyticsReportResponse, status_code=status.HTTP_201_CREATED)
async def create_analytics_report(
    report: AnalyticsReportCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create analytics report"""
    if not _has_analytics_permission(current_user, "reports"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create reports"
        )
    
    try:
        makerspace_id = _get_user_makerspace_id(current_user)
        db_report = crud_analytics.create_report(
            db, report, makerspace_id, current_user["user_id"]
        )
        
        # Generate report in background
        background_tasks.add_task(
            crud_analytics.generate_report_file, db, str(db_report.id)
        )
        
        return db_report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create analytics report: {str(e)}"
        )

@router.get("/reports/", response_model=List[AnalyticsReportResponse])
async def get_analytics_reports(
    report_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics reports"""
    if not _has_analytics_permission(current_user, "reports"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view reports"
        )
    
    makerspace_id = _get_user_makerspace_id(current_user)
    reports = crud_analytics.get_reports(
        db, makerspace_id, current_user["user_id"], report_type, skip, limit
    )
    return reports

@router.get("/reports/{report_id}/download")
async def download_analytics_report(
    report_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download analytics report"""
    if not _has_analytics_permission(current_user, "reports"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to download reports"
        )
    
    report = crud_analytics.get_report(db, report_id, current_user["user_id"])
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    if not report.file_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report file not ready"
        )
    
    return FileResponse(
        path=report.file_path,
        filename=f"{report.report_name}.{report.file_format}",
        media_type="application/octet-stream"
    )

# Export Routes
@router.post("/export/", response_model=AnalyticsExportResponse, status_code=status.HTTP_202_ACCEPTED)
async def export_analytics_data(
    export_request: AnalyticsExportRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export analytics data"""
    if not _has_analytics_permission(current_user, "export"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to export data"
        )
    
    try:
        makerspace_id = _get_user_makerspace_id(current_user)
        export_response = crud_analytics.create_export_request(
            db, makerspace_id, current_user["user_id"], export_request
        )
        
        # Process export in background
        background_tasks.add_task(
            crud_analytics.process_export, db, str(export_response.export_id)
        )
        
        return export_response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create export: {str(e)}"
        )

# Configuration Routes
@router.post("/configuration/", response_model=AnalyticsConfigurationResponse, status_code=status.HTTP_201_CREATED)
async def create_analytics_configuration(
    config: AnalyticsConfigurationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create analytics configuration"""
    if not _has_analytics_permission(current_user, "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create configuration"
        )
    
    try:
        makerspace_id = _get_user_makerspace_id(current_user)
        db_config = crud_analytics.create_configuration(db, config, makerspace_id)
        return db_config
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create configuration: {str(e)}"
        )

@router.get("/configuration/", response_model=List[AnalyticsConfigurationResponse])
async def get_analytics_configurations(
    config_type: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics configurations"""
    if not _has_analytics_permission(current_user, "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view configuration"
        )
    
    makerspace_id = _get_user_makerspace_id(current_user)
    configs = crud_analytics.get_configurations(db, makerspace_id, config_type)
    return configs

# Real-time Analytics Route
@router.get("/realtime/metrics")
async def get_realtime_metrics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get real-time analytics metrics"""
    if not _has_analytics_permission(current_user, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view real-time metrics"
        )
    
    try:
        makerspace_id = _get_user_makerspace_id(current_user)
        metrics = crud_analytics.get_realtime_metrics(db, makerspace_id)
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get real-time metrics: {str(e)}"
        )

# Analytics Health Check
@router.get("/health")
async def analytics_health_check(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check analytics system health"""
    if not _has_analytics_permission(current_user, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view system health"
        )
    
    try:
        health = crud_analytics.get_system_health(db)
        return health
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system health: {str(e)}"
        )

# Helper functions
def _has_analytics_permission(user: dict, action: str) -> bool:
    """Check if user has analytics permission"""
    user_permissions = user.get("permissions", [])
    user_role = user.get("role", "")
    
    # Super admins have all permissions
    if user_role == "super_admin":
        return True
    
    # Check specific permissions
    permission_map = {
        "read": ["view_analytics", "view_reports"],
        "create": ["manage_analytics", "create_reports"],
        "update": ["manage_analytics", "edit_reports"],
        "delete": ["manage_analytics", "delete_reports"],
        "query": ["advanced_analytics", "custom_queries"],
        "forecast": ["advanced_analytics", "forecasting"],
        "reports": ["view_reports", "create_reports"],
        "export": ["export_data", "download_reports"],
        "admin": ["system_admin", "analytics_admin"]
    }
    
    required_permissions = permission_map.get(action, [])
    return any(perm in user_permissions for perm in required_permissions)

def _get_user_makerspace_id(user: dict) -> str:
    """Get user's makerspace ID"""
    return user.get("makerspace_id", "default_makerspace")
