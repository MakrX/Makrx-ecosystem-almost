"""
Analytics Mock Data Generator

This utility provides mock data for analytics endpoints when real data is not available.
Useful for frontend development and testing without requiring a full database.
"""

from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional
import random
import uuid

class AnalyticsMockData:
    """Generate realistic mock data for analytics"""
    
    def __init__(self):
        self.base_date = datetime.now()
        self.makerspace_id = "makrspace_001"
        
        # Sample data pools
        self.user_names = ["John Smith", "Jane Doe", "Mike Johnson", "Sarah Wilson", "Dave Brown"]
        self.equipment_names = ["3D Printer Pro", "Laser Cutter X1", "CNC Mill", "Soldering Station", "Electronics Bench"]
        self.project_names = ["Smart Home Hub", "LED Art Display", "Robot Arm", "IoT Weather Station", "Custom PCB"]
        self.inventory_items = ["PLA Filament", "Arduino Uno", "Resistor Kit", "Wood Sheets", "Screws Set"]
        
    def get_analytics_overview(self) -> Dict[str, Any]:
        """Generate mock analytics overview data"""
        return {
            "total_users": random.randint(45, 85),
            "active_users_today": random.randint(8, 25),
            "active_users_week": random.randint(25, 45),
            "total_projects": random.randint(15, 35),
            "active_projects": random.randint(8, 18),
            "total_equipment": random.randint(12, 20),
            "equipment_in_use": random.randint(3, 8),
            "total_inventory_items": random.randint(150, 300),
            "low_stock_items": random.randint(5, 15),
            "total_revenue": round(random.uniform(5000, 15000), 2),
            "revenue_this_month": round(random.uniform(800, 2500), 2)
        }
    
    def get_usage_stats(self, period: str = "daily") -> Dict[str, Any]:
        """Generate mock usage statistics"""
        if period == "daily":
            days = 7
        elif period == "weekly": 
            days = 28
        else:
            days = 90
            
        return {
            "logins": random.randint(20, 80),
            "new_members": random.randint(2, 8),
            "project_creations": random.randint(3, 12),
            "equipment_reservations": random.randint(15, 45),
            "inventory_issues": random.randint(25, 75),
            "total_session_time": random.randint(120, 480),  # minutes
            "avg_session_duration": random.randint(45, 120),  # minutes
            "peak_hours": [14, 15, 16, 19, 20],
            "active_days": days - random.randint(0, 3),
            "user_retention_rate": round(random.uniform(75, 95), 1)
        }
    
    def get_inventory_insights(self) -> Dict[str, Any]:
        """Generate mock inventory insights"""
        top_items = []
        for i in range(5):
            top_items.append({
                "item_id": f"item_{i+1:03d}",
                "name": random.choice(self.inventory_items),
                "total_consumed": round(random.uniform(5, 50), 2),
                "cost_consumed": round(random.uniform(25, 250), 2),
                "consumption_rate": round(random.uniform(0.5, 5.0), 2)
            })
        
        return {
            "total_items_tracked": random.randint(120, 200),
            "total_consumption_value": round(random.uniform(2000, 8000), 2),
            "efficiency_score": round(random.uniform(78, 95), 1),
            "waste_percentage": round(random.uniform(2, 12), 1),
            "top_consumed_items": top_items,
            "low_stock_alerts": random.randint(3, 12),
            "reorder_suggestions": random.randint(5, 15),
            "cost_savings": round(random.uniform(150, 800), 2),
            "consumption_trend": "increasing" if random.random() > 0.5 else "stable"
        }
    
    def get_equipment_metrics(self) -> List[Dict[str, Any]]:
        """Generate mock equipment metrics"""
        metrics = []
        for i in range(5):
            metrics.append({
                "equipment_id": f"eq_{i+1:03d}",
                "name": random.choice(self.equipment_names),
                "total_usage_hours": round(random.uniform(50, 200), 1),
                "utilization_rate": round(random.uniform(45, 85), 1),
                "uptime_percentage": round(random.uniform(92, 99), 1),
                "maintenance_events": random.randint(1, 5),
                "avg_session_duration": round(random.uniform(45, 180), 1),
                "revenue_generated": round(random.uniform(200, 1500), 2),
                "user_count": random.randint(8, 25),
                "status": random.choice(["operational", "maintenance", "reserved"]),
                "next_maintenance": (self.base_date + timedelta(days=random.randint(5, 30))).isoformat()
            })
        
        return metrics
    
    def get_project_analytics(self) -> Dict[str, Any]:
        """Generate mock project analytics"""
        projects_by_status = {
            "planning": random.randint(2, 8),
            "in_progress": random.randint(5, 15),
            "completed": random.randint(10, 25),
            "on_hold": random.randint(1, 5)
        }
        
        return {
            "total_projects": sum(projects_by_status.values()),
            "projects_by_status": projects_by_status,
            "avg_completion_time": round(random.uniform(12, 45), 1),  # days
            "total_bom_value": round(random.uniform(5000, 25000), 2),
            "avg_project_cost": round(random.uniform(150, 800), 2),
            "success_rate": round(random.uniform(78, 92), 1),
            "collaboration_score": round(random.uniform(65, 88), 1),
            "equipment_utilization": round(random.uniform(70, 90), 1),
            "popular_categories": ["Electronics", "3D Printing", "Woodworking", "Robotics"],
            "monthly_completions": random.randint(3, 12)
        }
    
    def get_revenue_analytics(self) -> Dict[str, Any]:
        """Generate mock revenue analytics"""
        revenue_by_source = {
            "memberships": round(random.uniform(2000, 5000), 2),
            "equipment_usage": round(random.uniform(800, 2500), 2),
            "workshops": round(random.uniform(300, 1200), 2),
            "materials": round(random.uniform(400, 1500), 2),
            "storage": round(random.uniform(200, 800), 2)
        }
        
        return {
            "total_revenue": sum(revenue_by_source.values()),
            "revenue_by_source": revenue_by_source,
            "monthly_growth": round(random.uniform(-5, 25), 1),
            "avg_revenue_per_user": round(random.uniform(45, 150), 2),
            "recurring_revenue": round(random.uniform(2500, 6000), 2),
            "one_time_revenue": round(random.uniform(800, 2000), 2),
            "payment_methods": {
                "credit_card": 65,
                "bank_transfer": 20,
                "cash": 10,
                "digital_wallet": 5
            },
            "refunds_rate": round(random.uniform(1, 4), 1),
            "outstanding_invoices": round(random.uniform(200, 1000), 2)
        }
    
    def get_usage_events(self, filters: Optional[Dict] = None, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Generate mock usage events"""
        events = []
        event_types = ["login", "logout", "equipment_reservation", "inventory_issue", "project_creation", "workshop_attendance"]
        
        for i in range(min(limit, 50)):  # Limit to 50 for performance
            events.append({
                "id": str(uuid.uuid4()),
                "makerspace_id": self.makerspace_id,
                "user_id": f"user_{random.randint(1, 20):03d}",
                "event_type": random.choice(event_types),
                "event_category": random.choice(["authentication", "equipment", "inventory", "project"]),
                "timestamp": (self.base_date - timedelta(hours=random.randint(1, 168))).isoformat(),
                "metadata": {
                    "duration": random.randint(30, 240),
                    "value": round(random.uniform(5, 100), 2)
                }
            })
        
        return events
    
    def get_dashboard_sections(self) -> List[Dict[str, Any]]:
        """Generate mock dashboard sections with chart data"""
        return [
            {
                "section_id": "usage",
                "title": "Usage Analytics",
                "charts": [
                    {
                        "title": "Weekly Activity",
                        "data": [
                            {"label": "Logins", "value": random.randint(20, 80)},
                            {"label": "New Members", "value": random.randint(2, 8)},
                            {"label": "Projects", "value": random.randint(3, 12)}
                        ],
                        "chart_type": "bar",
                        "x_axis_label": "Activity Type",
                        "y_axis_label": "Count"
                    }
                ],
                "summary_stats": self.get_usage_stats(),
                "last_updated": datetime.now().isoformat()
            },
            {
                "section_id": "inventory",
                "title": "Inventory Insights", 
                "charts": [
                    {
                        "title": "Top Consumed Items",
                        "data": [
                            {"label": f"Item {i+1}", "value": random.randint(10, 50)}
                            for i in range(5)
                        ],
                        "chart_type": "pie"
                    }
                ],
                "summary_stats": {"efficiency_score": round(random.uniform(75, 95), 1)},
                "last_updated": datetime.now().isoformat()
            },
            {
                "section_id": "revenue",
                "title": "Revenue Analytics",
                "charts": [
                    {
                        "title": "Revenue by Source",
                        "data": [
                            {"label": "Memberships", "value": random.randint(2000, 5000)},
                            {"label": "Equipment", "value": random.randint(800, 2500)},
                            {"label": "Workshops", "value": random.randint(300, 1200)}
                        ],
                        "chart_type": "pie"
                    }
                ],
                "summary_stats": {"total_revenue": round(random.uniform(5000, 15000), 2)},
                "last_updated": datetime.now().isoformat()
            }
        ]

# Global instance for easy access
mock_data = AnalyticsMockData()

def get_mock_analytics_overview():
    """Get mock analytics overview"""
    return mock_data.get_analytics_overview()

def get_mock_dashboard_data():
    """Get complete mock dashboard data"""
    return {
        "overview": mock_data.get_analytics_overview(),
        "sections": mock_data.get_dashboard_sections(),
        "generated_at": datetime.now().isoformat(),
        "cache_expires_at": (datetime.now() + timedelta(minutes=15)).isoformat()
    }

def get_mock_usage_stats(period: str = "daily"):
    """Get mock usage statistics"""
    return mock_data.get_usage_stats(period)

def get_mock_inventory_insights():
    """Get mock inventory insights"""
    return mock_data.get_inventory_insights()

def get_mock_equipment_metrics():
    """Get mock equipment metrics"""
    return mock_data.get_equipment_metrics()

def get_mock_project_analytics():
    """Get mock project analytics"""
    return mock_data.get_project_analytics()

def get_mock_revenue_analytics():
    """Get mock revenue analytics"""
    return mock_data.get_revenue_analytics()

def get_mock_usage_events(filters=None, skip=0, limit=100):
    """Get mock usage events"""
    return mock_data.get_usage_events(filters, skip, limit)
