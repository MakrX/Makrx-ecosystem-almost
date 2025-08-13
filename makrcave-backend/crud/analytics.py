from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_, extract
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, date, timedelta
import uuid

from models.analytics import (
    UsageEvent, AnalyticsSnapshot, ReportRequest, EquipmentUsageLog,
    InventoryAnalytics, ProjectAnalytics, RevenueAnalytics, EventType
)
from schemas.analytics import (
    UsageEventCreate, ReportRequestCreate, EquipmentUsageLogCreate,
    InventoryAnalyticsCreate, ProjectAnalyticsCreate, RevenueAnalyticsCreate,
    AnalyticsFilters, TimePeriodEnum
)

class AnalyticsCRUD:
    def __init__(self, db: Session):
        self.db = db

    # Usage Events
    def create_usage_event(self, makerspace_id: str, event_data: UsageEventCreate) -> UsageEvent:
        db_event = UsageEvent(
            makerspace_id=uuid.UUID(makerspace_id),
            **event_data.dict()
        )
        self.db.add(db_event)
        self.db.commit()
        self.db.refresh(db_event)
        return db_event

    def get_usage_events(
        self, 
        makerspace_id: str, 
        filters: AnalyticsFilters,
        skip: int = 0, 
        limit: int = 100
    ) -> List[UsageEvent]:
        query = self.db.query(UsageEvent).filter(
            UsageEvent.makerspace_id == uuid.UUID(makerspace_id)
        )
        
        if filters.start_date:
            query = query.filter(UsageEvent.timestamp >= filters.start_date)
        if filters.end_date:
            query = query.filter(UsageEvent.timestamp <= filters.end_date)
        if filters.user_id:
            query = query.filter(UsageEvent.user_id == filters.user_id)
        if filters.event_types:
            query = query.filter(UsageEvent.event_type.in_([et.value for et in filters.event_types]))
        if filters.equipment_id:
            query = query.filter(
                and_(
                    UsageEvent.resource_id == filters.equipment_id,
                    UsageEvent.resource_type == "equipment"
                )
            )
        
        return query.order_by(desc(UsageEvent.timestamp)).offset(skip).limit(limit).all()

    # Analytics Overview
    def get_analytics_overview(self, makerspace_id: str) -> Dict[str, Any]:
        # Check if we have any data, if not use mock data
        total_events = self.db.query(func.count(UsageEvent.id)).filter(
            UsageEvent.makerspace_id == uuid.UUID(makerspace_id)
        ).scalar() or 0

        if total_events == 0:
            # No data available, use mock data
            from utils.analytics_mock_data import get_mock_analytics_overview
            return get_mock_analytics_overview()
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # User metrics
        total_users = self.db.query(func.count(UsageEvent.user_id.distinct())).filter(
            UsageEvent.makerspace_id == uuid.UUID(makerspace_id)
        ).scalar() or 0
        
        active_today = self.db.query(func.count(UsageEvent.user_id.distinct())).filter(
            and_(
                UsageEvent.makerspace_id == uuid.UUID(makerspace_id),
                func.date(UsageEvent.timestamp) == today
            )
        ).scalar() or 0
        
        active_week = self.db.query(func.count(UsageEvent.user_id.distinct())).filter(
            and_(
                UsageEvent.makerspace_id == uuid.UUID(makerspace_id),
                func.date(UsageEvent.timestamp) >= week_ago
            )
        ).scalar() or 0
        
        # Project metrics (would need to join with projects table)
        project_events = self.db.query(func.count(UsageEvent.id)).filter(
            and_(
                UsageEvent.makerspace_id == uuid.UUID(makerspace_id),
                UsageEvent.event_type == EventType.PROJECT_CREATED
            )
        ).scalar() or 0
        
        # Revenue metrics
        total_revenue = self.db.query(func.sum(RevenueAnalytics.amount)).filter(
            RevenueAnalytics.makerspace_id == uuid.UUID(makerspace_id)
        ).scalar() or 0.0
        
        month_revenue = self.db.query(func.sum(RevenueAnalytics.amount)).filter(
            and_(
                RevenueAnalytics.makerspace_id == uuid.UUID(makerspace_id),
                RevenueAnalytics.date >= month_ago
            )
        ).scalar() or 0.0
        
        return {
            "total_users": total_users,
            "active_users_today": active_today,
            "active_users_week": active_week,
            "total_projects": project_events,
            "active_projects": 0,  # Would calculate based on recent activity
            "total_equipment": 0,  # Would join with equipment table
            "equipment_in_use": 0,  # Would check current reservations
            "total_inventory_items": 0,  # Would join with inventory table
            "low_stock_items": 0,  # Would check inventory thresholds
            "total_revenue": total_revenue,
            "revenue_this_month": month_revenue
        }

    # Usage Statistics
    def get_usage_stats(self, makerspace_id: str, period: TimePeriodEnum = TimePeriodEnum.DAILY) -> Dict[str, Any]:
        # Check if we have usage data
        total_events = self.db.query(func.count(UsageEvent.id)).filter(
            UsageEvent.makerspace_id == uuid.UUID(makerspace_id)
        ).scalar() or 0

        if total_events == 0:
            from utils.analytics_mock_data import get_mock_usage_stats
            return get_mock_usage_stats(period.value)
        end_date = datetime.now()
        
        if period == TimePeriodEnum.DAILY:
            start_date = end_date - timedelta(days=1)
        elif period == TimePeriodEnum.WEEKLY:
            start_date = end_date - timedelta(days=7)
        elif period == TimePeriodEnum.MONTHLY:
            start_date = end_date - timedelta(days=30)
        else:
            start_date = end_date - timedelta(days=365)
        
        # Login count
        logins = self.db.query(func.count(UsageEvent.id)).filter(
            and_(
                UsageEvent.makerspace_id == uuid.UUID(makerspace_id),
                UsageEvent.event_type == EventType.LOGIN,
                UsageEvent.timestamp >= start_date
            )
        ).scalar() or 0
        
        # New members
        new_members = self.db.query(func.count(UsageEvent.id)).filter(
            and_(
                UsageEvent.makerspace_id == uuid.UUID(makerspace_id),
                UsageEvent.event_type == EventType.MEMBER_REGISTERED,
                UsageEvent.timestamp >= start_date
            )
        ).scalar() or 0
        
        # Project creations
        projects = self.db.query(func.count(UsageEvent.id)).filter(
            and_(
                UsageEvent.makerspace_id == uuid.UUID(makerspace_id),
                UsageEvent.event_type == EventType.PROJECT_CREATED,
                UsageEvent.timestamp >= start_date
            )
        ).scalar() or 0
        
        # Equipment usage hours
        equipment_hours = self.db.query(func.sum(EquipmentUsageLog.duration_minutes)).filter(
            and_(
                EquipmentUsageLog.makerspace_id == uuid.UUID(makerspace_id),
                EquipmentUsageLog.session_start >= start_date
            )
        ).scalar() or 0
        equipment_hours = equipment_hours / 60.0 if equipment_hours else 0.0
        
        # Peak usage analysis
        hourly_activity = self.db.query(
            extract('hour', UsageEvent.timestamp).label('hour'),
            func.count(UsageEvent.id).label('activity_count')
        ).filter(
            and_(
                UsageEvent.makerspace_id == uuid.UUID(makerspace_id),
                UsageEvent.timestamp >= start_date
            )
        ).group_by(extract('hour', UsageEvent.timestamp)).all()
        
        peak_hour = "N/A"
        if hourly_activity:
            peak_hour_data = max(hourly_activity, key=lambda x: x.activity_count)
            peak_hour = f"{int(peak_hour_data.hour):02d}:00"
        
        # Most active day
        daily_activity = self.db.query(
            func.date(UsageEvent.timestamp).label('day'),
            func.count(UsageEvent.id).label('activity_count')
        ).filter(
            and_(
                UsageEvent.makerspace_id == uuid.UUID(makerspace_id),
                UsageEvent.timestamp >= start_date
            )
        ).group_by(func.date(UsageEvent.timestamp)).all()
        
        most_active_day = "N/A"
        if daily_activity:
            most_active_day_data = max(daily_activity, key=lambda x: x.activity_count)
            most_active_day = most_active_day_data.day.strftime('%Y-%m-%d')
        
        return {
            "period": period.value,
            "logins": logins,
            "new_members": new_members,
            "project_creations": projects,
            "equipment_hours": equipment_hours,
            "peak_hour": peak_hour,
            "most_active_day": most_active_day
        }

    # Inventory Insights
    def get_inventory_insights(self, makerspace_id: str) -> Dict[str, Any]:
        # Top consumed items
        top_consumed = self.db.query(
            InventoryAnalytics.inventory_item_id,
            func.sum(InventoryAnalytics.consumed_quantity).label('total_consumed'),
            func.sum(InventoryAnalytics.total_cost_consumed).label('total_cost')
        ).filter(
            InventoryAnalytics.makerspace_id == uuid.UUID(makerspace_id)
        ).group_by(
            InventoryAnalytics.inventory_item_id
        ).order_by(
            desc('total_consumed')
        ).limit(10).all()
        
        # Fastest depleting items (highest consumption rate)
        fastest_depleting = self.db.query(
            InventoryAnalytics.inventory_item_id,
            func.avg(InventoryAnalytics.consumption_rate).label('avg_rate')
        ).filter(
            InventoryAnalytics.makerspace_id == uuid.UUID(makerspace_id)
        ).group_by(
            InventoryAnalytics.inventory_item_id
        ).order_by(
            desc('avg_rate')
        ).limit(10).all()
        
        # Reorder alerts
        reorder_alerts = self.db.query(InventoryAnalytics).filter(
            and_(
                InventoryAnalytics.makerspace_id == uuid.UUID(makerspace_id),
                InventoryAnalytics.reorder_triggered == True,
                InventoryAnalytics.date >= datetime.now().date() - timedelta(days=7)
            )
        ).all()
        
        return {
            "top_consumed_items": [
                {
                    "item_id": str(item.inventory_item_id),
                    "total_consumed": float(item.total_consumed),
                    "total_cost": float(item.total_cost or 0)
                }
                for item in top_consumed
            ],
            "fastest_depleting": [
                {
                    "item_id": str(item.inventory_item_id),
                    "consumption_rate": float(item.avg_rate or 0)
                }
                for item in fastest_depleting
            ],
            "reorder_alerts": [
                {
                    "item_id": str(alert.inventory_item_id),
                    "date": alert.date.isoformat(),
                    "ending_quantity": float(alert.ending_quantity)
                }
                for alert in reorder_alerts
            ],
            "consumption_trends": [],  # Would implement trend analysis
            "efficiency_score": 85.0  # Placeholder calculation
        }

    # Equipment Metrics
    def get_equipment_metrics(self, makerspace_id: str) -> List[Dict[str, Any]]:
        # Group by equipment and calculate metrics
        equipment_stats = self.db.query(
            EquipmentUsageLog.equipment_id,
            func.sum(EquipmentUsageLog.duration_minutes).label('total_minutes'),
            func.count(EquipmentUsageLog.id).label('usage_count'),
            func.avg(EquipmentUsageLog.success_rate).label('avg_success_rate')
        ).filter(
            EquipmentUsageLog.makerspace_id == uuid.UUID(makerspace_id)
        ).group_by(EquipmentUsageLog.equipment_id).all()
        
        metrics = []
        for stat in equipment_stats:
            total_hours = (stat.total_minutes or 0) / 60.0
            uptime_percentage = min((total_hours / (24 * 30)) * 100, 100)  # Simplified calculation
            
            metrics.append({
                "equipment_id": str(stat.equipment_id),
                "equipment_name": f"Equipment {stat.equipment_id}",  # Would join with equipment table
                "total_usage_hours": total_hours,
                "reservation_count": stat.usage_count,
                "uptime_percentage": uptime_percentage,
                "maintenance_overdue": False,  # Would check maintenance schedules
                "peak_usage_times": ["09:00", "14:00"],  # Would calculate from usage patterns
                "usage_trend": []  # Would implement trend analysis
            })
        
        return metrics

    # Project Analytics
    def get_project_analytics(self, makerspace_id: str) -> Dict[str, Any]:
        project_stats = self.db.query(
            func.count(ProjectAnalytics.id).label('total_projects'),
            func.count(
                func.nullif(ProjectAnalytics.completion_rate == 100, False)
            ).label('completed_projects'),
            func.avg(ProjectAnalytics.total_cost).label('avg_cost'),
            func.avg(ProjectAnalytics.bom_items_count).label('avg_bom_size')
        ).filter(
            ProjectAnalytics.makerspace_id == uuid.UUID(makerspace_id)
        ).first()
        
        # Most active projects (by collaboration)
        most_active = self.db.query(ProjectAnalytics).filter(
            ProjectAnalytics.makerspace_id == uuid.UUID(makerspace_id)
        ).order_by(desc(ProjectAnalytics.collaboration_count)).limit(5).all()
        
        # Largest BOMs
        largest_boms = self.db.query(ProjectAnalytics).filter(
            ProjectAnalytics.makerspace_id == uuid.UUID(makerspace_id)
        ).order_by(desc(ProjectAnalytics.bom_items_count)).limit(5).all()
        
        # Costliest projects
        costliest = self.db.query(ProjectAnalytics).filter(
            ProjectAnalytics.makerspace_id == uuid.UUID(makerspace_id)
        ).order_by(desc(ProjectAnalytics.total_cost)).limit(5).all()
        
        return {
            "total_projects": project_stats.total_projects or 0,
            "completed_projects": project_stats.completed_projects or 0,
            "average_completion_time": 0.0,  # Would calculate from timestamps
            "most_active_projects": [
                {
                    "project_id": str(p.project_id),
                    "collaboration_count": p.collaboration_count,
                    "total_cost": float(p.total_cost or 0)
                }
                for p in most_active
            ],
            "largest_boms": [
                {
                    "project_id": str(p.project_id),
                    "bom_items_count": p.bom_items_count,
                    "total_cost": float(p.total_cost or 0)
                }
                for p in largest_boms
            ],
            "costliest_projects": [
                {
                    "project_id": str(p.project_id),
                    "total_cost": float(p.total_cost or 0),
                    "bom_items_count": p.bom_items_count
                }
                for p in costliest
            ],
            "makrx_store_percentage": 75.0  # Would calculate from BOM sources
        }

    # Revenue Analytics
    def get_revenue_analytics(self, makerspace_id: str) -> Dict[str, Any]:
        # Total revenue
        total_revenue = self.db.query(
            func.sum(RevenueAnalytics.amount)
        ).filter(
            RevenueAnalytics.makerspace_id == uuid.UUID(makerspace_id)
        ).scalar() or 0.0
        
        # Revenue by source
        revenue_by_source = self.db.query(
            RevenueAnalytics.revenue_type,
            func.sum(RevenueAnalytics.amount).label('total')
        ).filter(
            RevenueAnalytics.makerspace_id == uuid.UUID(makerspace_id)
        ).group_by(RevenueAnalytics.revenue_type).all()
        
        # Monthly trends
        monthly_trends = self.db.query(
            extract('year', RevenueAnalytics.date).label('year'),
            extract('month', RevenueAnalytics.date).label('month'),
            func.sum(RevenueAnalytics.amount).label('total')
        ).filter(
            RevenueAnalytics.makerspace_id == uuid.UUID(makerspace_id)
        ).group_by(
            extract('year', RevenueAnalytics.date),
            extract('month', RevenueAnalytics.date)
        ).order_by('year', 'month').all()
        
        # Payment methods
        payment_methods = self.db.query(
            RevenueAnalytics.payment_method,
            func.sum(RevenueAnalytics.amount).label('total')
        ).filter(
            RevenueAnalytics.makerspace_id == uuid.UUID(makerspace_id)
        ).group_by(RevenueAnalytics.payment_method).all()
        
        return {
            "total_revenue": float(total_revenue),
            "revenue_by_source": {
                source.revenue_type: float(source.total)
                for source in revenue_by_source
            },
            "monthly_trends": [
                {
                    "year": int(trend.year),
                    "month": int(trend.month),
                    "total": float(trend.total)
                }
                for trend in monthly_trends
            ],
            "payment_methods": {
                method.payment_method or "unknown": float(method.total)
                for method in payment_methods
            },
            "subscription_revenue": 0.0,  # Would filter by revenue_type
            "credit_sales": 0.0,
            "store_revenue": 0.0
        }

    # Report Generation
    def create_report_request(self, makerspace_id: str, requested_by: str, report_data: ReportRequestCreate) -> ReportRequest:
        db_request = ReportRequest(
            makerspace_id=uuid.UUID(makerspace_id),
            requested_by=uuid.UUID(requested_by),
            **report_data.dict()
        )
        self.db.add(db_request)
        self.db.commit()
        self.db.refresh(db_request)
        return db_request

    def get_report_requests(self, makerspace_id: str, user_id: str) -> List[ReportRequest]:
        return self.db.query(ReportRequest).filter(
            and_(
                ReportRequest.makerspace_id == uuid.UUID(makerspace_id),
                ReportRequest.requested_by == uuid.UUID(user_id)
            )
        ).order_by(desc(ReportRequest.requested_at)).all()

    def update_report_status(self, request_id: str, status: str, file_url: str = None, error_message: str = None) -> ReportRequest:
        db_request = self.db.query(ReportRequest).filter(ReportRequest.id == uuid.UUID(request_id)).first()
        if db_request:
            db_request.status = status
            if file_url:
                db_request.file_url = file_url
            if error_message:
                db_request.error_message = error_message
            if status == "completed":
                db_request.completed_at = datetime.utcnow()
                db_request.expires_at = datetime.utcnow() + timedelta(days=7)  # Files expire in 7 days
            
            self.db.commit()
            self.db.refresh(db_request)
        return db_request

    # Data Recording Methods
    def record_equipment_usage(self, makerspace_id: str, usage_data: EquipmentUsageLogCreate) -> EquipmentUsageLog:
        # Calculate duration if end time is provided
        duration_minutes = None
        if usage_data.session_end and usage_data.session_start:
            duration = usage_data.session_end - usage_data.session_start
            duration_minutes = int(duration.total_seconds() / 60)
        
        db_log = EquipmentUsageLog(
            makerspace_id=uuid.UUID(makerspace_id),
            duration_minutes=duration_minutes,
            **usage_data.dict(exclude={'session_end'})
        )
        if usage_data.session_end:
            db_log.session_end = usage_data.session_end
            
        self.db.add(db_log)
        self.db.commit()
        self.db.refresh(db_log)
        return db_log

    def record_inventory_analytics(self, makerspace_id: str, analytics_data: InventoryAnalyticsCreate) -> InventoryAnalytics:
        # Calculate derived fields
        total_cost_consumed = None
        if analytics_data.consumed_quantity and analytics_data.cost_per_unit:
            total_cost_consumed = analytics_data.consumed_quantity * analytics_data.cost_per_unit
        
        db_analytics = InventoryAnalytics(
            makerspace_id=uuid.UUID(makerspace_id),
            total_cost_consumed=total_cost_consumed,
            **analytics_data.dict()
        )
        self.db.add(db_analytics)
        self.db.commit()
        self.db.refresh(db_analytics)
        return db_analytics

    def record_project_analytics(self, makerspace_id: str, analytics_data: ProjectAnalyticsCreate) -> ProjectAnalytics:
        db_analytics = ProjectAnalytics(
            makerspace_id=uuid.UUID(makerspace_id),
            **analytics_data.dict()
        )
        self.db.add(db_analytics)
        self.db.commit()
        self.db.refresh(db_analytics)
        return db_analytics

    def record_revenue_analytics(self, makerspace_id: str, revenue_data: RevenueAnalyticsCreate) -> RevenueAnalytics:
        db_revenue = RevenueAnalytics(
            makerspace_id=uuid.UUID(makerspace_id),
            **revenue_data.dict()
        )
        self.db.add(db_revenue)
        self.db.commit()
        self.db.refresh(db_revenue)
        return db_revenue
