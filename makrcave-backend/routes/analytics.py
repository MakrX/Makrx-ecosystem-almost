"""Analytics API routes with real database integration"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import logging

from database import get_db
from dependencies import get_current_user, get_current_makerspace, require_permission
from services.real_analytics_service import get_real_analytics_service
from utils.analytics_mock_data import AnalyticsMockData  # Fallback only

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize fallback mock data generator
mock_data = AnalyticsMockData()

@router.get("/overview")
async def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    makerspace = Depends(get_current_makerspace),
    _: bool = Depends(require_permission("analytics:read"))
):
    """Get analytics overview with real database data"""
    try:
        analytics_service = get_real_analytics_service(db)
        
        # Get real-time analytics (last 24 hours)
        real_time_data = analytics_service.get_real_time_analytics(makerspace.id, hours=24)
        
        # Get usage analytics (last 30 days)
        usage_data = analytics_service.get_usage_analytics(makerspace.id, days=30)
        
        # Get revenue analytics (last 30 days)
        revenue_data = analytics_service.get_revenue_analytics(makerspace.id, days=30)
        
        # Combine into overview format
        overview = {
            "makerspace_id": makerspace.id,
            "generated_at": datetime.utcnow().isoformat(),
            "real_time_metrics": real_time_data.get("metrics", {}),
            "alerts": real_time_data.get("alerts", []),
            "summary": {
                "total_revenue": revenue_data.get("summary", {}).get("total_revenue", 0),
                "revenue_growth": revenue_data.get("summary", {}).get("growth_rate", 0),
                "active_members": real_time_data.get("metrics", {}).get("active_members", 0),
                "equipment_utilization": real_time_data.get("metrics", {}).get("equipment_utilization", 0),
                "current_occupancy": real_time_data.get("metrics", {}).get("current_occupancy", 0),
                "safety_incidents": real_time_data.get("metrics", {}).get("safety_incidents", 0)
            },
            "engagement_summary": usage_data.get("member_engagement", {}),
            "peak_usage_hours": usage_data.get("peak_hours", [])[:5]  # Top 5 peak hours
        }
        
        return {"success": True, "data": overview}
        
    except Exception as e:
        logger.error(f"Analytics overview error: {e}")
        # Fallback to mock data with error indication
        return {
            "success": False,
            "error": "Database unavailable, using mock data",
            "data": mock_data.get_analytics_overview()
        }

@router.get("/usage")
async def get_usage_analytics(
    period: str = Query("daily", description="Period: daily, weekly, monthly"),
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    makerspace = Depends(get_current_makerspace),
    _: bool = Depends(require_permission("analytics:read"))
):
    """Get detailed usage analytics"""
    try:
        analytics_service = get_real_analytics_service(db)
        usage_data = analytics_service.get_usage_analytics(makerspace.id, days=days)
        
        return {
            "success": True,
            "period": period,
            "days_analyzed": days,
            "data": usage_data
        }
        
    except Exception as e:
        logger.error(f"Usage analytics error: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": mock_data.get_usage_stats(period)
        }

@router.get("/revenue")
async def get_revenue_analytics(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    makerspace = Depends(get_current_makerspace),
    _: bool = Depends(require_permission("analytics:read"))
):
    """Get revenue and financial analytics"""
    try:
        analytics_service = get_real_analytics_service(db)
        revenue_data = analytics_service.get_revenue_analytics(makerspace.id, days=days)
        
        return {
            "success": True,
            "days_analyzed": days,
            "data": revenue_data
        }
        
    except Exception as e:
        logger.error(f"Revenue analytics error: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": mock_data.get_revenue_breakdown()
        }

@router.get("/equipment")
async def get_equipment_analytics(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    makerspace = Depends(get_current_makerspace),
    _: bool = Depends(require_permission("analytics:read"))
):
    """Get equipment utilization and maintenance analytics"""
    try:
        analytics_service = get_real_analytics_service(db)
        equipment_data = analytics_service.get_equipment_analytics(makerspace.id, days=days)
        
        return {
            "success": True,
            "days_analyzed": days,
            "data": equipment_data
        }
        
    except Exception as e:
        logger.error(f"Equipment analytics error: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": mock_data.get_equipment_utilization()
        }

@router.get("/members")
async def get_member_analytics(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    makerspace = Depends(get_current_makerspace),
    _: bool = Depends(require_permission("analytics:read"))
):
    """Get member engagement and skill analytics"""
    try:
        analytics_service = get_real_analytics_service(db)
        member_data = analytics_service.get_member_analytics(makerspace.id, days=days)
        
        return {
            "success": True,
            "days_analyzed": days,
            "data": member_data
        }
        
    except Exception as e:
        logger.error(f"Member analytics error: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": mock_data.get_member_engagement()
        }

@router.get("/safety")
async def get_safety_analytics(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    makerspace = Depends(get_current_makerspace),
    _: bool = Depends(require_permission("analytics:read"))
):
    """Get safety and incident analytics"""
    try:
        analytics_service = get_real_analytics_service(db)
        safety_data = analytics_service.get_safety_analytics(makerspace.id, days=days)
        
        return {
            "success": True,
            "days_analyzed": days,
            "data": safety_data
        }
        
    except Exception as e:
        logger.error(f"Safety analytics error: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": {"error": "Safety analytics unavailable"}
        }

@router.get("/real-time")
async def get_realtime_analytics(
    hours: int = Query(24, ge=1, le=168, description="Hours to look back"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    makerspace = Depends(get_current_makerspace),
    _: bool = Depends(require_permission("analytics:read"))
):
    """Get real-time analytics data"""
    try:
        analytics_service = get_real_analytics_service(db)
        realtime_data = analytics_service.get_real_time_analytics(makerspace.id, hours=hours)
        
        return {
            "success": True,
            "hours_analyzed": hours,
            "data": realtime_data
        }
        
    except Exception as e:
        logger.error(f"Real-time analytics error: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": mock_data.get_realtime_data()
        }

@router.get("/trends")
async def get_trend_analysis(
    metric: str = Query("revenue", description="Metric to analyze: revenue, usage, members"),
    period: str = Query("daily", description="Period: daily, weekly, monthly"),
    days: int = Query(90, ge=7, le=365, description="Days to analyze"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    makerspace = Depends(get_current_makerspace),
    _: bool = Depends(require_permission("analytics:read"))
):
    """Get trend analysis for specific metrics"""
    try:
        analytics_service = get_real_analytics_service(db)
        
        if metric == "revenue":
            data = analytics_service.get_revenue_analytics(makerspace.id, days=days)
            trend_data = data.get("daily_trends", [])
        elif metric == "usage":
            data = analytics_service.get_usage_analytics(makerspace.id, days=days)
            trend_data = data.get("daily_trends", [])
        elif metric == "members":
            data = analytics_service.get_member_analytics(makerspace.id, days=days)
            trend_data = data.get("daily_trends", [])
        else:
            raise HTTPException(status_code=400, detail="Invalid metric")
        
        # Calculate trend direction
        if len(trend_data) >= 2:
            recent_avg = sum(item.get("revenue", item.get("unique_members", 0)) for item in trend_data[-7:]) / 7
            older_avg = sum(item.get("revenue", item.get("unique_members", 0)) for item in trend_data[-14:-7]) / 7
            trend_direction = "up" if recent_avg > older_avg else "down"
            trend_percentage = ((recent_avg - older_avg) / older_avg * 100) if older_avg > 0 else 0
        else:
            trend_direction = "stable"
            trend_percentage = 0
        
        return {
            "success": True,
            "metric": metric,
            "period": period,
            "days_analyzed": days,
            "trend_direction": trend_direction,
            "trend_percentage": round(trend_percentage, 2),
            "data": trend_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Trend analysis error: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": mock_data.get_trend_data(metric, period)
        }

@router.get("/export")
async def export_analytics(
    format: str = Query("json", description="Export format: json, csv"),
    metrics: str = Query("all", description="Metrics to export: all, revenue, usage, equipment, members, safety"),
    days: int = Query(30, ge=1, le=365, description="Days to export"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    makerspace = Depends(get_current_makerspace),
    _: bool = Depends(require_permission("analytics:export"))
):
    """Export analytics data in various formats"""
    try:
        analytics_service = get_real_analytics_service(db)
        export_data = {}
        
        if metrics == "all" or "revenue" in metrics:
            export_data["revenue"] = analytics_service.get_revenue_analytics(makerspace.id, days=days)
        
        if metrics == "all" or "usage" in metrics:
            export_data["usage"] = analytics_service.get_usage_analytics(makerspace.id, days=days)
        
        if metrics == "all" or "equipment" in metrics:
            export_data["equipment"] = analytics_service.get_equipment_analytics(makerspace.id, days=days)
        
        if metrics == "all" or "members" in metrics:
            export_data["members"] = analytics_service.get_member_analytics(makerspace.id, days=days)
        
        if metrics == "all" or "safety" in metrics:
            export_data["safety"] = analytics_service.get_safety_analytics(makerspace.id, days=days)
        
        export_data["metadata"] = {
            "makerspace_id": makerspace.id,
            "export_date": datetime.utcnow().isoformat(),
            "days_analyzed": days,
            "format": format
        }
        
        if format == "csv":
            # In a real implementation, convert to CSV format
            # For now, return JSON with CSV indication
            export_data["note"] = "CSV export would be implemented here"
        
        return {
            "success": True,
            "format": format,
            "data": export_data
        }
        
    except Exception as e:
        logger.error(f"Analytics export error: {e}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")
