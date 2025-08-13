"""
Health check endpoints
System health monitoring and status checks
"""

from fastapi import APIRouter, Depends
from datetime import datetime
import logging

from app.schemas import HealthCheck, ServiceHealth
from app.core.config import settings
from app.core.db import check_database
from app.core.storage import check_storage_health
from app.core.payments import check_payment_health

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=HealthCheck)
async def health_check():
    """Basic health check endpoint"""
    return HealthCheck(
        status="healthy",
        timestamp=datetime.utcnow(),
        version="1.0.0",
        environment=settings.ENVIRONMENT
    )

@router.get("/detailed", response_model=HealthCheck)
async def detailed_health_check():
    """Detailed health check with service status"""
    services = {}
    overall_status = "healthy"
    
    # Check database
    try:
        db_healthy = await check_database()
        services["database"] = ServiceHealth(
            name="PostgreSQL",
            status="healthy" if db_healthy else "unhealthy",
            last_check=datetime.utcnow()
        ).dict()
        if not db_healthy:
            overall_status = "degraded"
    except Exception as e:
        services["database"] = ServiceHealth(
            name="PostgreSQL",
            status="unhealthy",
            last_check=datetime.utcnow(),
            details={"error": str(e)}
        ).dict()
        overall_status = "unhealthy"
    
    # Check storage
    try:
        storage_healthy = await check_storage_health()
        services["storage"] = ServiceHealth(
            name="S3/MinIO",
            status="healthy" if storage_healthy else "unhealthy",
            last_check=datetime.utcnow()
        ).dict()
        if not storage_healthy and overall_status != "unhealthy":
            overall_status = "degraded"
    except Exception as e:
        services["storage"] = ServiceHealth(
            name="S3/MinIO",
            status="unhealthy",
            last_check=datetime.utcnow(),
            details={"error": str(e)}
        ).dict()
        overall_status = "unhealthy"
    
    # Check payment providers
    try:
        payment_health = await check_payment_health()
        for provider, status in payment_health.items():
            if status is not None:  # Provider is configured
                services[f"payment_{provider}"] = ServiceHealth(
                    name=provider.capitalize(),
                    status="healthy" if status else "unhealthy",
                    last_check=datetime.utcnow()
                ).dict()
                if not status and overall_status != "unhealthy":
                    overall_status = "degraded"
    except Exception as e:
        logger.error(f"Payment health check failed: {e}")
    
    return HealthCheck(
        status=overall_status,
        timestamp=datetime.utcnow(),
        version="1.0.0",
        environment=settings.ENVIRONMENT,
        services=services
    )

@router.get("/readiness")
async def readiness_check():
    """Kubernetes readiness probe"""
    try:
        # Check critical dependencies
        db_healthy = await check_database()
        if not db_healthy:
            return {"status": "not ready", "reason": "database unavailable"}, 503
        
        return {"status": "ready"}
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return {"status": "not ready", "reason": str(e)}, 503

@router.get("/liveness")
async def liveness_check():
    """Kubernetes liveness probe"""
    return {"status": "alive", "timestamp": datetime.utcnow()}
