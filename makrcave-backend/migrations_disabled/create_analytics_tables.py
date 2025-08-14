#!/usr/bin/env python3
"""
Analytics Tables Migration Script for MakrCave Backend

This script creates all the analytics tables in the database.
Run this after the main database initialization to add analytics capabilities.
"""

import sys
import os
from datetime import datetime

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, get_db_session
from models.analytics import Base as AnalyticsBase
from models.analytics import (
    UsageEvent, AnalyticsSnapshot, ReportRequest, EquipmentUsageLog,
    InventoryAnalytics, ProjectAnalytics, RevenueAnalytics
)
from sqlalchemy import text

def create_analytics_tables():
    """Create all analytics tables"""
    print("📊 Creating analytics tables...")
    
    try:
        # Create all analytics tables
        AnalyticsBase.metadata.create_all(bind=engine)
        print("✅ Analytics tables created successfully")
        
        # Create indexes for better performance
        create_analytics_indexes()
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating analytics tables: {e}")
        return False

def create_analytics_indexes():
    """Create performance indexes for analytics tables"""
    print("🔍 Creating analytics indexes...")
    
    indexes = [
        # Usage events indexes
        "CREATE INDEX IF NOT EXISTS idx_usage_events_makerspace_timestamp ON usage_events(makerspace_id, timestamp DESC);",
        "CREATE INDEX IF NOT EXISTS idx_usage_events_user_timestamp ON usage_events(user_id, timestamp DESC);",
        "CREATE INDEX IF NOT EXISTS idx_usage_events_type_timestamp ON usage_events(event_type, timestamp DESC);",
        
        # Equipment usage logs indexes
        "CREATE INDEX IF NOT EXISTS idx_equipment_usage_equipment_timestamp ON equipment_usage_logs(equipment_id, start_time DESC);",
        "CREATE INDEX IF NOT EXISTS idx_equipment_usage_user_timestamp ON equipment_usage_logs(user_id, start_time DESC);",
        
        # Inventory analytics indexes
        "CREATE INDEX IF NOT EXISTS idx_inventory_analytics_item_date ON inventory_analytics(item_id, date DESC);",
        "CREATE INDEX IF NOT EXISTS idx_inventory_analytics_makerspace_date ON inventory_analytics(makerspace_id, date DESC);",
        
        # Project analytics indexes
        "CREATE INDEX IF NOT EXISTS idx_project_analytics_project_date ON project_analytics(project_id, date DESC);",
        "CREATE INDEX IF NOT EXISTS idx_project_analytics_makerspace_date ON project_analytics(makerspace_id, date DESC);",
        
        # Revenue analytics indexes
        "CREATE INDEX IF NOT EXISTS idx_revenue_analytics_makerspace_date ON revenue_analytics(makerspace_id, transaction_date DESC);",
        "CREATE INDEX IF NOT EXISTS idx_revenue_analytics_source_date ON revenue_analytics(revenue_source, transaction_date DESC);",
        
        # Report requests indexes
        "CREATE INDEX IF NOT EXISTS idx_report_requests_user_created ON report_requests(requested_by, created_at DESC);",
        "CREATE INDEX IF NOT EXISTS idx_report_requests_makerspace_created ON report_requests(makerspace_id, created_at DESC);",
        "CREATE INDEX IF NOT EXISTS idx_report_requests_status ON report_requests(status);",
        
        # Analytics snapshots indexes
        "CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_makerspace_date ON analytics_snapshots(makerspace_id, snapshot_date DESC);",
        "CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_type_date ON analytics_snapshots(snapshot_type, snapshot_date DESC);"
    ]
    
    try:
        with engine.connect() as conn:
            for index_sql in indexes:
                conn.execute(text(index_sql))
                conn.commit()
        
        print("✅ Analytics indexes created successfully")
        
    except Exception as e:
        print(f"⚠️  Warning: Some indexes may not have been created: {e}")

def create_sample_analytics_data():
    """Create sample analytics data for testing"""
    print("📋 Creating sample analytics data...")
    
    db = get_db_session()
    
    try:
        # Sample usage events
        sample_events = [
            UsageEvent(
                makerspace_id="makrspace_001",
                user_id="user_001",
                event_type="login",
                event_category="authentication",
                metadata={"login_method": "email", "device": "desktop"},
                timestamp=datetime.now()
            ),
            UsageEvent(
                makerspace_id="makrspace_001",
                user_id="user_001",
                event_type="equipment_reservation",
                event_category="equipment",
                metadata={"equipment_id": "eq_001", "duration": 120},
                timestamp=datetime.now()
            ),
            UsageEvent(
                makerspace_id="makrspace_001",
                user_id="user_002",
                event_type="inventory_issue",
                event_category="inventory",
                metadata={"item_id": "item_001", "quantity": 0.5},
                timestamp=datetime.now()
            )
        ]
        
        for event in sample_events:
            db.add(event)
        
        # Sample equipment usage logs
        sample_equipment_logs = [
            EquipmentUsageLog(
                makerspace_id="makrspace_001",
                equipment_id="eq_001",
                user_id="user_001",
                start_time=datetime.now(),
                duration_minutes=120,
                usage_type="3d_printing",
                materials_used={"filament": "PLA", "weight": "0.5kg"},
                project_id="proj_001"
            ),
            EquipmentUsageLog(
                makerspace_id="makrspace_001",
                equipment_id="eq_002",
                user_id="user_002",
                start_time=datetime.now(),
                duration_minutes=45,
                usage_type="laser_cutting",
                materials_used={"wood": "plywood", "thickness": "3mm"},
                project_id="proj_002"
            )
        ]
        
        for log in sample_equipment_logs:
            db.add(log)
        
        # Sample inventory analytics
        sample_inventory_analytics = [
            InventoryAnalytics(
                makerspace_id="makrspace_001",
                item_id="item_001",
                date=datetime.now().date(),
                quantity_consumed=0.5,
                cost_consumed=12.50,
                efficiency_score=85.0,
                waste_percentage=5.0,
                reorder_triggered=False
            ),
            InventoryAnalytics(
                makerspace_id="makrspace_001",
                item_id="item_002",
                date=datetime.now().date(),
                quantity_consumed=3.0,
                cost_consumed=67.50,
                efficiency_score=92.0,
                waste_percentage=2.0,
                reorder_triggered=True
            )
        ]
        
        for analytics in sample_inventory_analytics:
            db.add(analytics)
        
        # Sample revenue analytics
        sample_revenue_analytics = [
            RevenueAnalytics(
                makerspace_id="makrspace_001",
                transaction_date=datetime.now().date(),
                revenue_source="membership",
                amount=99.99,
                transaction_id="txn_001",
                payment_method="credit_card",
                customer_id="user_001",
                subscription_type="monthly",
                currency="USD"
            ),
            RevenueAnalytics(
                makerspace_id="makrspace_001",
                transaction_date=datetime.now().date(),
                revenue_source="equipment_usage",
                amount=25.00,
                transaction_id="txn_002",
                payment_method="credits",
                customer_id="user_002",
                equipment_id="eq_001",
                currency="USD"
            )
        ]
        
        for revenue in sample_revenue_analytics:
            db.add(revenue)
        
        db.commit()
        print("✅ Sample analytics data created successfully")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating sample analytics data: {e}")
    finally:
        db.close()

def drop_analytics_tables():
    """Drop all analytics tables (for reset)"""
    print("⚠️  Dropping analytics tables...")
    
    try:
        AnalyticsBase.metadata.drop_all(bind=engine)
        print("✅ Analytics tables dropped successfully")
        
    except Exception as e:
        print(f"❌ Error dropping analytics tables: {e}")

def main():
    """Main migration function"""
    print("🚀 Running Analytics Tables Migration...")
    
    # Parse command line arguments
    reset = "--reset" in sys.argv
    sample = "--sample" in sys.argv
    drop_only = "--drop" in sys.argv
    
    if drop_only:
        drop_analytics_tables()
        print("✅ Analytics tables dropped")
        return
    
    if reset:
        print("⚠️  Resetting analytics tables...")
        drop_analytics_tables()
    
    # Create tables
    success = create_analytics_tables()
    
    if success and sample:
        print("📦 Creating sample analytics data...")
        create_sample_analytics_data()
    
    if success:
        print("🎉 Analytics migration completed successfully!")
        print("\n📚 Analytics API Endpoints Available:")
        print("  GET  /api/v1/analytics/dashboard     # Complete dashboard data")
        print("  GET  /api/v1/analytics/overview      # Analytics overview")
        print("  GET  /api/v1/analytics/usage         # Usage statistics")
        print("  GET  /api/v1/analytics/inventory     # Inventory insights")
        print("  GET  /api/v1/analytics/equipment     # Equipment metrics")
        print("  GET  /api/v1/analytics/projects      # Project analytics")
        print("  GET  /api/v1/analytics/revenue       # Revenue analytics")
        print("  POST /api/v1/analytics/events        # Create usage event")
        print("  POST /api/v1/analytics/reports/request  # Request report")
        print("  GET  /api/v1/analytics/reports       # Get report requests")
    else:
        print("❌ Analytics migration failed!")
    
    print("\n📚 Usage:")
    print("  python create_analytics_tables.py                # Create tables")
    print("  python create_analytics_tables.py --sample       # Create tables with sample data")
    print("  python create_analytics_tables.py --reset        # Reset and recreate tables")
    print("  python create_analytics_tables.py --reset --sample  # Reset and add sample data")
    print("  python create_analytics_tables.py --drop         # Drop all analytics tables")

if __name__ == "__main__":
    main()
