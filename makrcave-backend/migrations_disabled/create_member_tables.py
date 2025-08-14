"""
Create member management tables

This script creates the necessary database tables for the member management system.
Run this script to set up the member tables in your database.
"""

import sys
import os

# Add the parent directory to the path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from models.member import Base, Member, MembershipPlan, MemberInvite, MemberActivityLog, MembershipTransaction
from database import DATABASE_URL, engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_member_tables():
    """Create all member-related tables"""
    try:
        logger.info("Creating member management tables...")
        
        # Create tables
        Base.metadata.create_all(bind=engine, tables=[
            MembershipPlan.__table__,
            Member.__table__,
            MemberInvite.__table__,
            MemberActivityLog.__table__,
            MembershipTransaction.__table__
        ])
        
        logger.info("Member tables created successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Error creating member tables: {str(e)}")
        return False

def seed_default_membership_plans():
    """Create default membership plans"""
    from sqlalchemy.orm import sessionmaker
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Check if plans already exist
        existing_plans = session.query(MembershipPlan).count()
        if existing_plans > 0:
            logger.info("Membership plans already exist, skipping seed data.")
            return True
        
        logger.info("Creating default membership plans...")
        
        # Basic Plan
        basic_plan = MembershipPlan(
            name="Basic Maker",
            description="Entry-level membership with access to basic tools and workspace",
            duration_days=30,
            price=29.99,
            features=[
                "8 hours per day access",
                "Basic 3D printer access",
                "Workshop space access",
                "Community support"
            ],
            access_level={
                "equipment": ["basic_3d_printer", "hand_tools", "workbenches"],
                "rooms": ["workshop", "common_area"],
                "hours_per_day": 8,
                "max_reservations": 3
            },
            is_active=True,
            makerspace_id="default_makerspace"
        )
        
        # Pro Plan
        pro_plan = MembershipPlan(
            name="Pro Maker",
            description="Professional membership with unlimited access to most equipment",
            duration_days=30,
            price=99.99,
            features=[
                "Unlimited daily access",
                "All 3D printers and laser cutters",
                "Electronics lab access",
                "Priority support",
                "Guest passes"
            ],
            access_level={
                "equipment": ["3d_printer", "laser_cutter", "cnc_mill", "electronics_lab", "hand_tools"],
                "rooms": ["workshop", "electronics_lab", "meeting_room", "common_area"],
                "max_reservations": 10
            },
            is_active=True,
            makerspace_id="default_makerspace"
        )
        
        # Premium Plan
        premium_plan = MembershipPlan(
            name="Premium",
            description="Ultimate membership with full access and additional perks",
            duration_days=365,
            price=999.99,
            features=[
                "24/7 facility access",
                "All equipment access",
                "Personal storage space",
                "Dedicated support",
                "Free materials allowance",
                "Priority booking"
            ],
            access_level={
                "equipment": ["all"],
                "rooms": ["all"],
                "storage": True,
                "priority_booking": True,
                "materials_allowance": 100
            },
            is_active=True,
            makerspace_id="default_makerspace"
        )
        
        # Student Plan
        student_plan = MembershipPlan(
            name="Student",
            description="Discounted membership for students and educators",
            duration_days=30,
            price=19.99,
            features=[
                "6 hours per day access",
                "Basic equipment access",
                "Educational workshops",
                "Study space access"
            ],
            access_level={
                "equipment": ["basic_3d_printer", "hand_tools", "workbenches"],
                "rooms": ["workshop", "study_area", "common_area"],
                "hours_per_day": 6,
                "max_reservations": 2
            },
            is_active=True,
            makerspace_id="default_makerspace"
        )
        
        # Service Provider Plan
        service_provider_plan = MembershipPlan(
            name="Service Provider",
            description="Commercial membership for service providers and businesses",
            duration_days=365,
            price=1999.99,
            features=[
                "Commercial license",
                "All equipment access",
                "Priority booking",
                "Dedicated storage",
                "Client meeting space",
                "Marketing opportunities"
            ],
            access_level={
                "equipment": ["all"],
                "rooms": ["all"],
                "commercial_license": True,
                "priority_booking": True,
                "storage": True,
                "client_access": True
            },
            is_active=True,
            makerspace_id="default_makerspace"
        )
        
        # Add all plans to session
        session.add_all([basic_plan, pro_plan, premium_plan, student_plan, service_provider_plan])
        session.commit()
        
        logger.info(f"Created {5} default membership plans successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Error creating default membership plans: {str(e)}")
        session.rollback()
        return False
    finally:
        session.close()

def verify_tables():
    """Verify that all tables were created correctly"""
    try:
        with engine.connect() as connection:
            # Check each table
            tables_to_check = [
                'membership_plans',
                'members', 
                'member_invites',
                'member_activity_logs',
                'membership_transactions'
            ]
            
            for table_name in tables_to_check:
                result = connection.execute(text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'"))
                if result.fetchone():
                    logger.info(f"✓ Table '{table_name}' exists")
                else:
                    logger.error(f"✗ Table '{table_name}' not found")
                    return False
            
            logger.info("All member tables verified successfully!")
            return True
            
    except Exception as e:
        logger.error(f"Error verifying tables: {str(e)}")
        return False

def main():
    """Main migration function"""
    logger.info("Starting member management database migration...")
    
    # Create tables
    if not create_member_tables():
        logger.error("Failed to create member tables")
        return False
    
    # Verify tables
    if not verify_tables():
        logger.error("Table verification failed")
        return False
    
    # Seed default data
    if not seed_default_membership_plans():
        logger.error("Failed to seed default membership plans")
        return False
    
    logger.info("Member management database migration completed successfully!")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
