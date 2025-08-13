#!/usr/bin/env python3
"""
Database initialization script for MakrCave Backend

This script creates the database tables and optionally seeds with sample data.
"""

import sys
import os
from datetime import datetime

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import init_db, get_db_session, reset_db
from models.inventory import InventoryItem, InventoryUsageLog, InventoryAlert
from models.equipment import Equipment, EquipmentMaintenanceLog, EquipmentReservation, EquipmentRating
from models.project import (
    Project, ProjectCollaborator, ProjectBOM, ProjectEquipmentReservation,
    ProjectFile, ProjectMilestone, ProjectActivityLog
)
from schemas.inventory import SupplierType, ItemStatus, UsageAction, AccessLevel
from schemas.equipment import EquipmentStatus, EquipmentCategory, ReservationStatus

def create_sample_data():
    """Create sample inventory data for testing"""
    db = get_db_session()
    
    try:
        # Sample inventory items
        sample_items = [
            {
                "id": "item_001",
                "name": "PLA Filament - Black",
                "category": "filament",
                "subcategory": "PLA",
                "quantity": 2.5,
                "unit": "kg",
                "min_threshold": 0.5,
                "location": "Rack A1",
                "status": ItemStatus.ACTIVE,
                "supplier_type": SupplierType.MAKRX,
                "product_code": "MKX-FIL-PLA-BLK-1KG",
                "linked_makerspace_id": "makrspace_001",
                "image_url": None,
                "notes": "High quality PLA filament",
                "restricted_access_level": AccessLevel.BASIC,
                "price": 25.99,
                "supplier": "MakrX Store",
                "description": "Premium PLA filament in black color",
                "created_by": "admin",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            },
            {
                "id": "item_002", 
                "name": "Arduino Uno R3",
                "category": "electronics",
                "subcategory": "Microcontroller",
                "quantity": 15,
                "unit": "pcs",
                "min_threshold": 5,
                "location": "Electronics Shelf B2",
                "status": ItemStatus.ACTIVE,
                "supplier_type": SupplierType.EXTERNAL,
                "product_code": None,
                "linked_makerspace_id": "makrspace_001",
                "image_url": None,
                "notes": "Arduino Uno R3 microcontroller boards",
                "restricted_access_level": AccessLevel.BASIC,
                "price": 22.50,
                "supplier": "Local Electronics Store",
                "description": "Arduino Uno R3 development board",
                "created_by": "admin",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            },
            {
                "id": "item_003",
                "name": "Precision Screwdriver Set",
                "category": "tools",
                "subcategory": "Hand Tools",
                "quantity": 3,
                "unit": "set",
                "min_threshold": 1,
                "location": "Tool Cabinet C1",
                "status": ItemStatus.ACTIVE,
                "supplier_type": SupplierType.MAKRX,
                "product_code": "MKX-TLS-SCRD-PRE-SET",
                "linked_makerspace_id": "makrspace_001",
                "image_url": None,
                "notes": "Professional precision screwdriver set",
                "restricted_access_level": AccessLevel.CERTIFIED,
                "price": 45.00,
                "supplier": "MakrX Store",
                "description": "12-piece precision screwdriver set",
                "created_by": "admin", 
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
        ]
        
        # Add sample items
        for item_data in sample_items:
            item = InventoryItem(**item_data)
            db.add(item)
        
        # Sample usage logs
        sample_logs = [
            {
                "id": "log_001",
                "inventory_item_id": "item_001",
                "user_id": "user_001",
                "user_name": "John Smith",
                "action": UsageAction.ISSUE,
                "quantity_before": 3.0,
                "quantity_after": 2.5,
                "reason": "3D printing project",
                "linked_project_id": "proj_001",
                "timestamp": datetime.now()
            },
            {
                "id": "log_002",
                "inventory_item_id": "item_002", 
                "user_id": "user_002",
                "user_name": "Jane Doe",
                "action": UsageAction.ISSUE,
                "quantity_before": 18,
                "quantity_after": 15,
                "reason": "Electronics workshop",
                "linked_project_id": "proj_002",
                "timestamp": datetime.now()
            }
        ]
        
        # Add sample logs
        for log_data in sample_logs:
            log = InventoryUsageLog(**log_data)
            db.add(log)
        
        db.commit()
        print("✅ Sample data created successfully")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating sample data: {e}")
    finally:
        db.close()

def main():
    """Main initialization function"""
    print("🚀 Initializing MakrCave Database...")
    
    # Parse command line arguments
    reset = "--reset" in sys.argv
    sample = "--sample" in sys.argv
    
    if reset:
        print("⚠️  Resetting database (all data will be lost)...")
        reset_db()
        print("✅ Database reset completed")
    else:
        print("📋 Creating database tables...")
        init_db()
        print("✅ Database tables created")
    
    if sample:
        print("📦 Creating sample data...")
        create_sample_data()
    
    print("🎉 Database initialization completed!")
    print("\n📚 Usage:")
    print("  python init_db.py --reset     # Reset database")
    print("  python init_db.py --sample    # Add sample data")
    print("  python init_db.py --reset --sample  # Reset and add sample data")

if __name__ == "__main__":
    main()
