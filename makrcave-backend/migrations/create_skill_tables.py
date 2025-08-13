"""
Create skill management tables

This migration creates all tables needed for the skill management system:
- skills: Core skill definitions
- user_skills: User skill certifications
- skill_requests: Skill certification requests
- skill_audit_logs: Audit trail for skill changes
- skill_prerequisites: Many-to-many relationships for skill prerequisites
- skill_equipment: Many-to-many relationships between skills and equipment
"""

from sqlalchemy import text
from database import engine, Base
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def upgrade():
    """Create skill management tables"""
    logger.info("Creating skill management tables...")
    
    try:
        # Create tables using SQLAlchemy
        from models.skill import Skill, UserSkill, SkillRequest, SkillAuditLog, skill_prerequisites, skill_equipment
        
        # Create all skill-related tables
        Base.metadata.create_all(bind=engine, tables=[
            skill_prerequisites,
            skill_equipment,
            Skill.__table__,
            UserSkill.__table__,
            SkillRequest.__table__,
            SkillAuditLog.__table__
        ])
        
        logger.info("Successfully created skill management tables")
        
        # Insert default skills for demonstration
        with engine.connect() as conn:
            # Default skill categories and skills
            default_skills = [
                {
                    'id': 'skill-1',
                    'name': '3D Printer Operation',
                    'category': 'Digital Fabrication',
                    'level': 'beginner',
                    'description': 'Basic operation of FDM 3D printers including setup, printing, and maintenance',
                    'status': 'active',
                    'makerspace_id': 'ms-1'
                },
                {
                    'id': 'skill-2',
                    'name': 'Laser Cutter Safety',
                    'category': 'Laser Cutting',
                    'level': 'beginner',
                    'description': 'Safety protocols and basic operation of CO2 laser cutters',
                    'status': 'active',
                    'makerspace_id': 'ms-1'
                },
                {
                    'id': 'skill-3',
                    'name': 'CNC Operation',
                    'category': 'Machining',
                    'level': 'advanced',
                    'description': 'Safe operation of CNC milling machines and routers',
                    'status': 'active',
                    'makerspace_id': 'ms-1'
                },
                {
                    'id': 'skill-4',
                    'name': 'Advanced 3D Printing',
                    'category': 'Digital Fabrication',
                    'level': 'intermediate',
                    'description': 'Advanced techniques including multi-material printing and support optimization',
                    'status': 'active',
                    'makerspace_id': 'ms-1'
                },
                {
                    'id': 'skill-5',
                    'name': 'Material Handling',
                    'category': 'Safety',
                    'level': 'beginner',
                    'description': 'Safe handling of various materials including chemicals and sharp objects',
                    'status': 'active',
                    'makerspace_id': 'ms-1'
                },
                {
                    'id': 'skill-6',
                    'name': 'G-Code Programming',
                    'category': 'Programming',
                    'level': 'intermediate',
                    'description': 'Writing and editing G-code for CNC machines and 3D printers',
                    'status': 'active',
                    'makerspace_id': 'ms-1'
                }
            ]
            
            # Insert skills
            for skill in default_skills:
                conn.execute(text("""
                    INSERT INTO skills (id, name, category, level, description, status, makerspace_id, created_at)
                    VALUES (:id, :name, :category, :level, :description, :status, :makerspace_id, NOW())
                    ON CONFLICT (id) DO NOTHING
                """), skill)
            
            # Set up skill prerequisites
            prerequisites = [
                ('skill-4', 'skill-1'),  # Advanced 3D Printing requires basic 3D Printer Operation
                ('skill-3', 'skill-5'),  # CNC Operation requires Material Handling
                ('skill-6', 'skill-3'),  # G-Code Programming benefits from CNC Operation
            ]
            
            for skill_id, prereq_id in prerequisites:
                conn.execute(text("""
                    INSERT INTO skill_prerequisites (skill_id, prerequisite_id)
                    VALUES (:skill_id, :prereq_id)
                    ON CONFLICT DO NOTHING
                """), {'skill_id': skill_id, 'prereq_id': prereq_id})
            
            # Link skills to equipment (assuming equipment exists)
            skill_equipment_mappings = [
                ('skill-1', 'eq-1'),  # 3D Printer Operation -> Prusa i3 MK3S #1
                ('skill-1', 'eq-4'),  # 3D Printer Operation -> Ultimaker S3
                ('skill-2', 'eq-2'),  # Laser Cutter Safety -> Epilog Helix
                ('skill-3', 'eq-3'),  # CNC Operation -> Tormach CNC Mill
                ('skill-4', 'eq-4'),  # Advanced 3D Printing -> Ultimaker S3
                ('skill-5', 'eq-2'),  # Material Handling -> Laser Cutter
                ('skill-5', 'eq-3'),  # Material Handling -> CNC Mill
                ('skill-6', 'eq-3'),  # G-Code Programming -> CNC Mill
            ]
            
            for skill_id, equipment_id in skill_equipment_mappings:
                conn.execute(text("""
                    INSERT INTO skill_equipment (skill_id, equipment_id)
                    VALUES (:skill_id, :equipment_id)
                    ON CONFLICT DO NOTHING
                """), {'skill_id': skill_id, 'equipment_id': equipment_id})
            
            conn.commit()
            logger.info("Successfully inserted default skills and relationships")
            
    except Exception as e:
        logger.error(f"Error creating skill tables: {e}")
        raise

def downgrade():
    """Drop skill management tables"""
    logger.info("Dropping skill management tables...")
    
    try:
        with engine.connect() as conn:
            # Drop tables in reverse order due to foreign key constraints
            tables_to_drop = [
                'skill_audit_logs',
                'skill_requests', 
                'user_skills',
                'skill_equipment',
                'skill_prerequisites',
                'skills'
            ]
            
            for table in tables_to_drop:
                conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
            
            conn.commit()
            logger.info("Successfully dropped skill management tables")
            
    except Exception as e:
        logger.error(f"Error dropping skill tables: {e}")
        raise

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "downgrade":
        downgrade()
    else:
        upgrade()
