from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./makrcave.db")

# Create SQLAlchemy engine
# Only enable SQL logging in development for debugging
enable_sql_logging = os.getenv("ENVIRONMENT", "production") == "development"

engine = create_engine(
    DATABASE_URL,
    echo=enable_sql_logging,  # Only log SQL queries in development
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    # Security: Hide connection details in logs
    hide_parameters=not enable_sql_logging
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database tables
def init_db():
    """Initialize database tables"""
    from .models import inventory, member, project, equipment, billing  # Import all models
    Base.metadata.create_all(bind=engine)

# Database utility functions
def reset_db():
    """Reset database (drop and recreate all tables)"""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def get_db_session():
    """Get a database session for scripts/utilities"""
    return SessionLocal()
