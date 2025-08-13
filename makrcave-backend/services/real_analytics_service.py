"""Real analytics service replacing mock data with actual database queries"""
from datetime import datetime, timedelta, date
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, extract, text
from sqlalchemy.sql import case
import logging
from collections import defaultdict

from database import get_db
from models.enhanced_analytics import (
    UsageMetric, RevenueRecord, EquipmentUsage, 
    MemberActivity, SafetyIncident, SystemHealth
)
from models.enhanced_member import Member, MemberSkill, Certification
from models.equipment import Equipment, EquipmentReservation
from models.makerspace_settings import MakerspaceSettings
from models.project import Project
from models.billing import Transaction, CreditTransaction

logger = logging.getLogger(__name__)

class RealAnalyticsService:
    """Production analytics service with real database queries"""
    
    def __init__(self, db: Session):
        self.db = db
        
    def get_real_time_analytics(self, makerspace_id: str, hours: int = 24) -> Dict[str, Any]:
        """Get real-time analytics for the last N hours"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            # Active members in period
            active_members = self.db.query(func.count(func.distinct(MemberActivity.member_id))).filter(
                and_(
                    MemberActivity.makerspace_id == makerspace_id,
                    MemberActivity.timestamp >= cutoff_time
                )
            ).scalar() or 0
            
            # Equipment utilization
            total_equipment = self.db.query(func.count(Equipment.id)).filter(
                Equipment.makerspace_id == makerspace_id
            ).scalar() or 1
            
            active_equipment = self.db.query(func.count(func.distinct(EquipmentUsage.equipment_id))).filter(
                and_(
                    EquipmentUsage.makerspace_id == makerspace_id,
                    EquipmentUsage.start_time >= cutoff_time,
                    EquipmentUsage.end_time.is_(None)  # Currently in use
                )
            ).scalar() or 0
            
            utilization_rate = (active_equipment / total_equipment) * 100
            
            # Revenue in period
            revenue = self.db.query(func.sum(Transaction.amount)).filter(
                and_(
                    Transaction.makerspace_id == makerspace_id,
                    Transaction.created_at >= cutoff_time,
                    Transaction.status == 'completed'
                )
            ).scalar() or 0.0
            
            # Current occupancy
            current_occupancy = self.db.query(func.count(MemberActivity.id)).filter(
                and_(
                    MemberActivity.makerspace_id == makerspace_id,
                    MemberActivity.activity_type == 'checkin',
                    MemberActivity.timestamp >= cutoff_time
                )
            ).scalar() or 0
            
            # Safety incidents
            safety_incidents = self.db.query(func.count(SafetyIncident.id)).filter(
                and_(
                    SafetyIncident.makerspace_id == makerspace_id,
                    SafetyIncident.incident_date >= cutoff_time.date(),
                    SafetyIncident.severity.in_(['medium', 'high', 'critical'])
                )
            ).scalar() or 0
            
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "period_hours": hours,
                "metrics": {
                    "active_members": active_members,
                    "equipment_utilization": round(utilization_rate, 1),
                    "current_occupancy": current_occupancy,
                    "revenue": float(revenue),
                    "safety_incidents": safety_incidents,
                    "status": "healthy" if safety_incidents == 0 else "attention_needed"
                },
                "alerts": self._get_current_alerts(makerspace_id)
            }
            
        except Exception as e:
            logger.error(f"Real-time analytics error: {e}")
            return {"error": str(e), "timestamp": datetime.utcnow().isoformat()}
    
    def get_usage_analytics(self, makerspace_id: str, days: int = 30) -> Dict[str, Any]:
        """Get detailed usage analytics"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            # Daily usage trends
            daily_usage = self.db.query(
                func.date(MemberActivity.timestamp).label('date'),
                func.count(func.distinct(MemberActivity.member_id)).label('unique_members'),
                func.count(MemberActivity.id).label('total_activities')
            ).filter(
                and_(
                    MemberActivity.makerspace_id == makerspace_id,
                    MemberActivity.timestamp >= start_date
                )
            ).group_by(func.date(MemberActivity.timestamp)).order_by('date').all()
            
            # Peak hours analysis
            hourly_usage = self.db.query(
                extract('hour', MemberActivity.timestamp).label('hour'),
                func.count(MemberActivity.id).label('activity_count')
            ).filter(
                and_(
                    MemberActivity.makerspace_id == makerspace_id,
                    MemberActivity.timestamp >= start_date
                )
            ).group_by(extract('hour', MemberActivity.timestamp)).all()
            
            # Equipment popularity
            equipment_usage = self.db.query(
                Equipment.name,
                Equipment.category,
                func.count(EquipmentUsage.id).label('usage_count'),
                func.avg(
                    func.extract('epoch', EquipmentUsage.end_time - EquipmentUsage.start_time) / 3600
                ).label('avg_duration_hours')
            ).join(EquipmentUsage).filter(
                and_(
                    Equipment.makerspace_id == makerspace_id,
                    EquipmentUsage.start_time >= start_date
                )
            ).group_by(Equipment.id, Equipment.name, Equipment.category).order_by('usage_count desc').limit(10).all()
            
            # Member engagement levels
            member_engagement = self.db.query(
                case(
                    (func.count(MemberActivity.id) >= 20, 'high'),
                    (func.count(MemberActivity.id) >= 10, 'medium'),
                    else_='low'
                ).label('engagement_level'),
                func.count(func.distinct(MemberActivity.member_id)).label('member_count')
            ).filter(
                and_(
                    MemberActivity.makerspace_id == makerspace_id,
                    MemberActivity.timestamp >= start_date
                )
            ).group_by(MemberActivity.member_id).subquery()
            
            engagement_summary = self.db.query(
                member_engagement.c.engagement_level,
                func.count().label('member_count')
            ).group_by(member_engagement.c.engagement_level).all()
            
            return {
                "period_days": days,
                "daily_trends": [
                    {
                        "date": str(row.date),
                        "unique_members": row.unique_members,
                        "total_activities": row.total_activities
                    }
                    for row in daily_usage
                ],
                "peak_hours": [
                    {"hour": int(row.hour), "activity_count": row.activity_count}
                    for row in hourly_usage
                ],
                "popular_equipment": [
                    {
                        "name": row.name,
                        "category": row.category,
                        "usage_count": row.usage_count,
                        "avg_duration_hours": round(float(row.avg_duration_hours or 0), 2)
                    }
                    for row in equipment_usage
                ],
                "member_engagement": {
                    row.engagement_level: row.member_count
                    for row in engagement_summary
                }
            }
            
        except Exception as e:
            logger.error(f"Usage analytics error: {e}")
            return {"error": str(e)}
    
    def get_revenue_analytics(self, makerspace_id: str, days: int = 30) -> Dict[str, Any]:
        """Get revenue and financial analytics"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            # Daily revenue trends
            daily_revenue = self.db.query(
                func.date(Transaction.created_at).label('date'),
                func.sum(Transaction.amount).label('revenue'),
                func.count(Transaction.id).label('transaction_count')
            ).filter(
                and_(
                    Transaction.makerspace_id == makerspace_id,
                    Transaction.created_at >= start_date,
                    Transaction.status == 'completed'
                )
            ).group_by(func.date(Transaction.created_at)).order_by('date').all()
            
            # Revenue by category
            revenue_by_category = self.db.query(
                Transaction.category,
                func.sum(Transaction.amount).label('revenue'),
                func.count(Transaction.id).label('count')
            ).filter(
                and_(
                    Transaction.makerspace_id == makerspace_id,
                    Transaction.created_at >= start_date,
                    Transaction.status == 'completed'
                )
            ).group_by(Transaction.category).all()
            
            # Top paying members
            top_members = self.db.query(
                Member.email,
                Member.first_name,
                Member.last_name,
                func.sum(Transaction.amount).label('total_spent'),
                func.count(Transaction.id).label('transaction_count')
            ).join(Transaction, Transaction.member_id == Member.id).filter(
                and_(
                    Transaction.makerspace_id == makerspace_id,
                    Transaction.created_at >= start_date,
                    Transaction.status == 'completed'
                )
            ).group_by(Member.id).order_by('total_spent desc').limit(10).all()
            
            # Credit system analytics
            credit_analytics = self.db.query(
                func.sum(case((CreditTransaction.transaction_type == 'purchase', CreditTransaction.amount), else_=0)).label('credits_purchased'),
                func.sum(case((CreditTransaction.transaction_type == 'usage', CreditTransaction.amount), else_=0)).label('credits_used'),
                func.count(func.distinct(CreditTransaction.member_id)).label('active_credit_users')
            ).filter(
                and_(
                    CreditTransaction.makerspace_id == makerspace_id,
                    CreditTransaction.created_at >= start_date
                )
            ).first()
            
            # Calculate totals and growth
            total_revenue = sum(float(row.revenue or 0) for row in daily_revenue)
            total_transactions = sum(row.transaction_count for row in daily_revenue)
            
            # Growth calculation (compare with previous period)
            prev_start = start_date - timedelta(days=days)
            prev_revenue = self.db.query(func.sum(Transaction.amount)).filter(
                and_(
                    Transaction.makerspace_id == makerspace_id,
                    Transaction.created_at >= prev_start,
                    Transaction.created_at < start_date,
                    Transaction.status == 'completed'
                )
            ).scalar() or 0.0
            
            growth_rate = ((total_revenue - float(prev_revenue)) / float(prev_revenue) * 100) if prev_revenue > 0 else 0
            
            return {
                "period_days": days,
                "summary": {
                    "total_revenue": round(total_revenue, 2),
                    "total_transactions": total_transactions,
                    "average_transaction": round(total_revenue / total_transactions, 2) if total_transactions > 0 else 0,
                    "growth_rate": round(growth_rate, 2)
                },
                "daily_trends": [
                    {
                        "date": str(row.date),
                        "revenue": float(row.revenue or 0),
                        "transaction_count": row.transaction_count
                    }
                    for row in daily_revenue
                ],
                "revenue_by_category": [
                    {
                        "category": row.category,
                        "revenue": float(row.revenue or 0),
                        "count": row.count
                    }
                    for row in revenue_by_category
                ],
                "top_members": [
                    {
                        "name": f"{row.first_name} {row.last_name}",
                        "email": row.email,
                        "total_spent": float(row.total_spent or 0),
                        "transaction_count": row.transaction_count
                    }
                    for row in top_members
                ],
                "credit_system": {
                    "credits_purchased": float(credit_analytics.credits_purchased or 0),
                    "credits_used": float(credit_analytics.credits_used or 0),
                    "active_users": credit_analytics.active_credit_users or 0
                }
            }
            
        except Exception as e:
            logger.error(f"Revenue analytics error: {e}")
            return {"error": str(e)}
    
    def get_equipment_analytics(self, makerspace_id: str, days: int = 30) -> Dict[str, Any]:
        """Get detailed equipment analytics"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            # Equipment utilization rates
            equipment_stats = self.db.query(
                Equipment.id,
                Equipment.name,
                Equipment.category,
                Equipment.status,
                func.count(EquipmentUsage.id).label('usage_sessions'),
                func.sum(
                    func.extract('epoch', EquipmentUsage.end_time - EquipmentUsage.start_time) / 3600
                ).label('total_hours'),
                func.avg(
                    func.extract('epoch', EquipmentUsage.end_time - EquipmentUsage.start_time) / 3600
                ).label('avg_session_hours')
            ).outerjoin(
                EquipmentUsage,
                and_(
                    EquipmentUsage.equipment_id == Equipment.id,
                    EquipmentUsage.start_time >= start_date
                )
            ).filter(
                Equipment.makerspace_id == makerspace_id
            ).group_by(Equipment.id).all()
            
            # Maintenance tracking
            maintenance_due = self.db.query(
                Equipment.id,
                Equipment.name,
                Equipment.next_maintenance_date,
                Equipment.maintenance_hours_interval,
                func.sum(
                    func.extract('epoch', EquipmentUsage.end_time - EquipmentUsage.start_time) / 3600
                ).label('hours_since_maintenance')
            ).outerjoin(EquipmentUsage).filter(
                and_(
                    Equipment.makerspace_id == makerspace_id,
                    Equipment.next_maintenance_date <= datetime.utcnow() + timedelta(days=7)
                )
            ).group_by(Equipment.id).all()
            
            # Equipment reservations
            upcoming_reservations = self.db.query(
                Equipment.name,
                EquipmentReservation.start_time,
                EquipmentReservation.end_time,
                Member.first_name,
                Member.last_name
            ).join(Equipment).join(Member).filter(
                and_(
                    Equipment.makerspace_id == makerspace_id,
                    EquipmentReservation.start_time >= datetime.utcnow(),
                    EquipmentReservation.start_time <= datetime.utcnow() + timedelta(days=7),
                    EquipmentReservation.status == 'confirmed'
                )
            ).order_by(EquipmentReservation.start_time).limit(20).all()
            
            # Calculate utilization rates (assuming 12 hours/day operation)
            operating_hours_per_day = 12
            total_available_hours = days * operating_hours_per_day
            
            equipment_list = []
            for eq in equipment_stats:
                utilization_rate = (float(eq.total_hours or 0) / total_available_hours) * 100 if total_available_hours > 0 else 0
                equipment_list.append({
                    "id": eq.id,
                    "name": eq.name,
                    "category": eq.category,
                    "status": eq.status,
                    "usage_sessions": eq.usage_sessions or 0,
                    "total_hours": round(float(eq.total_hours or 0), 2),
                    "avg_session_hours": round(float(eq.avg_session_hours or 0), 2),
                    "utilization_rate": round(utilization_rate, 1)
                })
            
            return {
                "period_days": days,
                "equipment_stats": equipment_list,
                "maintenance_alerts": [
                    {
                        "id": eq.id,
                        "name": eq.name,
                        "due_date": eq.next_maintenance_date.isoformat() if eq.next_maintenance_date else None,
                        "hours_since_maintenance": round(float(eq.hours_since_maintenance or 0), 2),
                        "urgency": "overdue" if eq.next_maintenance_date and eq.next_maintenance_date < datetime.utcnow() else "due_soon"
                    }
                    for eq in maintenance_due
                ],
                "upcoming_reservations": [
                    {
                        "equipment": res.name,
                        "start_time": res.start_time.isoformat(),
                        "end_time": res.end_time.isoformat(),
                        "member": f"{res.first_name} {res.last_name}"
                    }
                    for res in upcoming_reservations
                ],
                "summary": {
                    "total_equipment": len(equipment_list),
                    "active_equipment": len([eq for eq in equipment_list if eq["status"] == "operational"]),
                    "maintenance_due": len(maintenance_due),
                    "average_utilization": round(sum(eq["utilization_rate"] for eq in equipment_list) / len(equipment_list), 1) if equipment_list else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Equipment analytics error: {e}")
            return {"error": str(e)}
    
    def get_member_analytics(self, makerspace_id: str, days: int = 30) -> Dict[str, Any]:
        """Get member engagement and skill analytics"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            # Member activity levels
            member_activity = self.db.query(
                Member.id,
                Member.first_name,
                Member.last_name,
                Member.email,
                Member.membership_type,
                func.count(MemberActivity.id).label('activity_count'),
                func.max(MemberActivity.timestamp).label('last_activity')
            ).outerjoin(
                MemberActivity,
                and_(
                    MemberActivity.member_id == Member.id,
                    MemberActivity.timestamp >= start_date
                )
            ).filter(
                Member.makerspace_id == makerspace_id
            ).group_by(Member.id).all()
            
            # Skills and certifications
            skills_distribution = self.db.query(
                MemberSkill.skill_name,
                MemberSkill.skill_level,
                func.count(MemberSkill.id).label('member_count')
            ).join(Member).filter(
                Member.makerspace_id == makerspace_id
            ).group_by(MemberSkill.skill_name, MemberSkill.skill_level).all()
            
            # Recent certifications
            recent_certifications = self.db.query(
                Certification.certification_name,
                Certification.certification_date,
                Member.first_name,
                Member.last_name
            ).join(Member).filter(
                and_(
                    Member.makerspace_id == makerspace_id,
                    Certification.certification_date >= start_date
                )
            ).order_by(Certification.certification_date.desc()).limit(10).all()
            
            # Membership type distribution
            membership_distribution = self.db.query(
                Member.membership_type,
                func.count(Member.id).label('count')
            ).filter(
                Member.makerspace_id == makerspace_id
            ).group_by(Member.membership_type).all()
            
            # Engagement categories
            high_engagement = len([m for m in member_activity if (m.activity_count or 0) >= 20])
            medium_engagement = len([m for m in member_activity if 10 <= (m.activity_count or 0) < 20])
            low_engagement = len([m for m in member_activity if (m.activity_count or 0) < 10])
            
            return {
                "period_days": days,
                "summary": {
                    "total_members": len(member_activity),
                    "active_members": len([m for m in member_activity if m.activity_count and m.activity_count > 0]),
                    "high_engagement": high_engagement,
                    "medium_engagement": medium_engagement,
                    "low_engagement": low_engagement
                },
                "membership_distribution": [
                    {"type": row.membership_type, "count": row.count}
                    for row in membership_distribution
                ],
                "skills_distribution": [
                    {
                        "skill": row.skill_name,
                        "level": row.skill_level,
                        "member_count": row.member_count
                    }
                    for row in skills_distribution
                ],
                "recent_certifications": [
                    {
                        "certification": cert.certification_name,
                        "date": cert.certification_date.isoformat(),
                        "member": f"{cert.first_name} {cert.last_name}"
                    }
                    for cert in recent_certifications
                ],
                "engagement_trends": {
                    "high": high_engagement,
                    "medium": medium_engagement,
                    "low": low_engagement
                }
            }
            
        except Exception as e:
            logger.error(f"Member analytics error: {e}")
            return {"error": str(e)}
    
    def get_safety_analytics(self, makerspace_id: str, days: int = 30) -> Dict[str, Any]:
        """Get safety and incident analytics"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            # Safety incidents
            incidents = self.db.query(
                SafetyIncident.id,
                SafetyIncident.incident_date,
                SafetyIncident.incident_type,
                SafetyIncident.severity,
                SafetyIncident.description,
                SafetyIncident.equipment_involved,
                SafetyIncident.resolution_status
            ).filter(
                and_(
                    SafetyIncident.makerspace_id == makerspace_id,
                    SafetyIncident.incident_date >= start_date.date()
                )
            ).order_by(SafetyIncident.incident_date.desc()).all()
            
            # Incident trends by type
            incident_trends = self.db.query(
                SafetyIncident.incident_type,
                SafetyIncident.severity,
                func.count(SafetyIncident.id).label('count')
            ).filter(
                and_(
                    SafetyIncident.makerspace_id == makerspace_id,
                    SafetyIncident.incident_date >= start_date.date()
                )
            ).group_by(SafetyIncident.incident_type, SafetyIncident.severity).all()
            
            # Equipment safety scores
            equipment_safety = self.db.query(
                Equipment.name,
                Equipment.category,
                func.count(SafetyIncident.id).label('incident_count')
            ).outerjoin(
                SafetyIncident,
                SafetyIncident.equipment_involved == Equipment.name
            ).filter(
                Equipment.makerspace_id == makerspace_id
            ).group_by(Equipment.id).order_by('incident_count desc').all()
            
            return {
                "period_days": days,
                "summary": {
                    "total_incidents": len(incidents),
                    "critical_incidents": len([i for i in incidents if i.severity == 'critical']),
                    "resolved_incidents": len([i for i in incidents if i.resolution_status == 'resolved']),
                    "pending_incidents": len([i for i in incidents if i.resolution_status == 'open'])
                },
                "incidents": [
                    {
                        "id": inc.id,
                        "date": inc.incident_date.isoformat(),
                        "type": inc.incident_type,
                        "severity": inc.severity,
                        "description": inc.description,
                        "equipment": inc.equipment_involved,
                        "status": inc.resolution_status
                    }
                    for inc in incidents
                ],
                "incident_trends": [
                    {
                        "type": trend.incident_type,
                        "severity": trend.severity,
                        "count": trend.count
                    }
                    for trend in incident_trends
                ],
                "equipment_safety": [
                    {
                        "equipment": eq.name,
                        "category": eq.category,
                        "incident_count": eq.incident_count or 0
                    }
                    for eq in equipment_safety
                ]
            }
            
        except Exception as e:
            logger.error(f"Safety analytics error: {e}")
            return {"error": str(e)}
    
    def _get_current_alerts(self, makerspace_id: str) -> List[Dict[str, Any]]:
        """Get current system alerts"""
        alerts = []
        
        try:
            # Check for overdue maintenance
            overdue_maintenance = self.db.query(func.count(Equipment.id)).filter(
                and_(
                    Equipment.makerspace_id == makerspace_id,
                    Equipment.next_maintenance_date < datetime.utcnow()
                )
            ).scalar() or 0
            
            if overdue_maintenance > 0:
                alerts.append({
                    "type": "maintenance",
                    "severity": "high",
                    "message": f"{overdue_maintenance} equipment items have overdue maintenance",
                    "count": overdue_maintenance
                })
            
            # Check for critical safety incidents
            critical_incidents = self.db.query(func.count(SafetyIncident.id)).filter(
                and_(
                    SafetyIncident.makerspace_id == makerspace_id,
                    SafetyIncident.severity == 'critical',
                    SafetyIncident.resolution_status == 'open'
                )
            ).scalar() or 0
            
            if critical_incidents > 0:
                alerts.append({
                    "type": "safety",
                    "severity": "critical",
                    "message": f"{critical_incidents} critical safety incidents require attention",
                    "count": critical_incidents
                })
            
            # Check equipment status
            offline_equipment = self.db.query(func.count(Equipment.id)).filter(
                and_(
                    Equipment.makerspace_id == makerspace_id,
                    Equipment.status == 'offline'
                )
            ).scalar() or 0
            
            if offline_equipment > 0:
                alerts.append({
                    "type": "equipment",
                    "severity": "medium",
                    "message": f"{offline_equipment} equipment items are offline",
                    "count": offline_equipment
                })
                
        except Exception as e:
            logger.error(f"Alert generation error: {e}")
            alerts.append({
                "type": "system",
                "severity": "low",
                "message": "Unable to check system alerts",
                "error": str(e)
            })
        
        return alerts

def get_real_analytics_service(db: Session = None) -> RealAnalyticsService:
    """Get analytics service instance"""
    if db is None:
        db = next(get_db())
    return RealAnalyticsService(db)
