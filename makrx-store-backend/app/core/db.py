"""
Database configuration and session management
SQLAlchemy with async PostgreSQL support
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session
from sqlalchemy import MetaData
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=10,
    max_overflow=20
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for all models
Base = declarative_base()

# Naming convention for constraints (helps with Alembic migrations)
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

Base.metadata = MetaData(naming_convention=convention)

async def get_db() -> AsyncSession:
    """
    Dependency to get database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def create_tables():
    """
    Create all database tables
    """
    try:
        async with engine.begin() as conn:
            # Import all models to ensure they're registered
            from app.models import (
                commerce, services, admin
            )
            
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

async def drop_tables():
    """
    Drop all database tables (use with caution!)
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        logger.info("Database tables dropped")

# Database health check
async def check_database():
    """
    Check database connectivity
    """
    try:
        async with AsyncSessionLocal() as session:
            await session.execute("SELECT 1")
            return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False
