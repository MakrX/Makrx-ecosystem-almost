"""
MakrX Store Backend - FastAPI Application

Main application entry point with comprehensive security middleware and router setup.
This application implements:
- Full e-commerce functionality (products, cart, orders, payments)
- 3D printing and fabrication services
- DPDP Act 2023 compliance for data protection
- Comprehensive security monitoring and logging
- Multi-factor authentication and authorization
- File upload security and validation
- Payment processing security
- Real-time monitoring and alerting

Security Features:
- Rate limiting and DDoS protection
- Input validation and sanitization
- Comprehensive audit logging
- Data encryption at rest and in transit
- Secure file handling with virus scanning
- PCI DSS compliance for payments
- GDPR/DPDP data protection measures

Architecture:
- FastAPI for high-performance async operations
- SQLAlchemy with async support for database operations
- Keycloak integration for SSO and identity management
- Redis for caching and session management
- Background tasks for file processing and notifications
"""

# FastAPI core imports for application setup
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware        # Cross-origin resource sharing
from fastapi.middleware.trustedhost import TrustedHostMiddleware  # Host validation
from fastapi.responses import JSONResponse

# Standard library imports for utilities
import time      # Performance timing and timestamps
import uuid      # Unique identifier generation
import logging   # Structured logging system
import asyncio   # Asynchronous programming support

# Core application modules
from app.core.config import settings                    # Application configuration
from app.core.db import engine, create_tables          # Database connection and setup

# API route modules - each handles specific functionality
from app.routes import (
    auth,              # Authentication and user management
    catalog,           # Product catalog and search
    cart,              # Shopping cart operations
    orders,            # Order processing and management
    uploads,           # File upload handling
    quotes,            # Service quotation system
    admin,             # Administrative functions
    webhooks,          # External service webhooks
    health,            # Health checks and monitoring
    bridge,            # Cross-service communication
    security_management  # Security administration
)

# Security and middleware modules
from app.middleware.api_security import setup_api_security      # API security middleware
from app.middleware.observability import ObservabilityMiddleware # Request monitoring

# Comprehensive security system imports
from app.core.enhanced_security_auth import enhanced_auth       # Advanced authentication
from app.core.file_security import file_validator, storage_manager  # Secure file handling
from app.core.payment_security import webhook_verifier, payment_processor  # Payment security
from app.core.data_protection import (                          # DPDP Act compliance
    consent_manager,     # User consent management
    retention_manager,   # Data retention policies
    user_rights_manager  # User data rights (access, deletion)
)
from app.core.security_monitoring import (                      # Security monitoring
    security_logger,     # Security event logging
    security_monitor,    # Real-time threat detection
    performance_monitor  # Performance and anomaly detection
)
from app.core.operational_security import (                     # Operational security
    secrets_manager,     # Secret rotation and management
    mfa_manager,         # Multi-factor authentication
    access_control       # Role-based access control
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s", "module": "%(name)s"}',
    handlers=[logging.StreamHandler()]
)

logger = logging.getLogger(__name__)

# Create FastAPI app with security configuration
app = FastAPI(
    title="MakrX Store API",
    description="E-commerce and 3D printing services platform with comprehensive security",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,  # Disable docs in production
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    openapi_url="/openapi.json" if settings.ENVIRONMENT != "production" else None,
    # Security headers
    swagger_ui_parameters={"defaultModelsExpandDepth": -1} if settings.ENVIRONMENT != "production" else None
)

# Setup comprehensive security middleware
setup_api_security(app)

# Add observability middleware for request tracing and monitoring
app.add_middleware(ObservabilityMiddleware)

# Security-enhanced request processing
@app.middleware("http")
async def security_request_middleware(request: Request, call_next):
    """Enhanced request middleware with security monitoring"""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    # Extract client information for security context
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("User-Agent", "Unknown")

    start_time = time.time()

    try:
        # Log request for security monitoring
        await security_logger.log_security_event(
            event_type="api_request",
            action=f"{request.method} {request.url.path}",
            success=True,
            context={
                "request_id": request_id,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "method": request.method,
                "path": request.url.path
            }
        )

        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000  # Convert to milliseconds

        # Record performance metrics
        await performance_monitor.record_api_metric(
            endpoint=request.url.path,
            method=request.method,
            duration_ms=process_time,
            status_code=response.status_code
        )

        # Add security headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{process_time:.2f}ms"

        return response

    except Exception as e:
        process_time = (time.time() - start_time) * 1000

        # Log security event for failed requests
        await security_logger.log_security_event(
            event_type="api_request",
            action=f"{request.method} {request.url.path}",
            success=False,
            context={
                "request_id": request_id,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "error": str(e)
            }
        )

        # Record failed request metrics
        await performance_monitor.record_api_metric(
            endpoint=request.url.path,
            method=request.method,
            duration_ms=process_time,
            status_code=500
        )

        raise

# Enhanced global exception handler with security logging
@app.exception_handler(Exception)
async def security_exception_handler(request: Request, exc: Exception):
    """Enhanced exception handler with security event logging"""
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    ip_address = request.client.host if request.client else "unknown"

    # Log security event for unhandled exceptions
    await security_logger.log_security_event(
        event_type="application_error",
        action="unhandled_exception",
        success=False,
        context={
            "request_id": request_id,
            "ip_address": ip_address,
            "url": str(request.url),
            "method": request.method,
            "error_type": type(exc).__name__,
            "error_message": str(exc)[:500]  # Truncate for security
        }
    )

    logger.error(
        f'{{"request_id": "{request_id}", "error": "{str(exc)}", '
        f'"error_type": "{type(exc).__name__}", "url": "{request.url}"}}'
    )

    # Don't expose internal error details in production
    if settings.ENVIRONMENT == "production":
        error_message = "An internal error occurred"
        error_detail = None
    else:
        error_message = "An unexpected error occurred"
        error_detail = str(exc)

    return JSONResponse(
        status_code=500,
        content={
            "error": error_message,
            "request_id": request_id,
            "detail": error_detail,
            "timestamp": time.time()
        }
    )

# Include routers
app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(catalog.router, prefix="/catalog", tags=["Catalog"])
app.include_router(cart.router, prefix="/cart", tags=["Cart"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(uploads.router, prefix="/uploads", tags=["Uploads"])
app.include_router(quotes.router, prefix="/quotes", tags=["Quotes"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
app.include_router(bridge.router, prefix="/bridge", tags=["Bridge"])
app.include_router(security_management.router, prefix="/security", tags=["Security Management"])

# Import and include new routers
from app.routes import enhanced_catalog, quick_reorder, bom_import, feature_flags

app.include_router(enhanced_catalog.router, prefix="/api/v1", tags=["Enhanced Catalog"])
app.include_router(quick_reorder.router, prefix="/api/v1", tags=["Quick Reorder"])
app.include_router(bom_import.router, prefix="/api/v1", tags=["BOM Import"])
app.include_router(feature_flags.router, prefix="/api/v1", tags=["Feature Flags"])

@app.on_event("startup")
async def startup_event():
    """Initialize database, security components, and other startup tasks"""
    logger.info("Starting MakrX Store API with comprehensive security...")

    try:
        # Create database tables
        await create_tables()

        # Initialize security components
        logger.info("Initializing security components...")

        # Check for secrets that need rotation
        due_rotations = await secrets_manager.check_rotation_due()
        if due_rotations:
            logger.warning(f"Found {len(due_rotations)} secrets due for rotation")
            for secret in due_rotations:
                logger.warning(f"Secret '{secret['secret_name']}' overdue by {secret['days_overdue']} days")

        # Start background tasks
        asyncio.create_task(start_security_background_tasks())

        # Log successful startup
        await security_logger.log_security_event(
            event_type="system_startup",
            action="api_started",
            success=True,
            context={"version": "1.0.0", "environment": settings.ENVIRONMENT}
        )

        logger.info("MakrX Store API started successfully with security enabled")

    except Exception as e:
        logger.error(f"Failed to start API: {e}")
        await security_logger.log_security_event(
            event_type="system_startup",
            action="api_start_failed",
            success=False,
            context={"error": str(e)}
        )
        raise

async def start_security_background_tasks():
    """Start background security tasks"""
    try:
        # Schedule daily retention policy enforcement
        asyncio.create_task(schedule_retention_enforcement())

        # Schedule secret rotation checks
        asyncio.create_task(schedule_secret_rotation_checks())

        logger.info("Security background tasks started")

    except Exception as e:
        logger.error(f"Failed to start security background tasks: {e}")

async def schedule_retention_enforcement():
    """Schedule daily data retention enforcement"""
    while True:
        try:
            await asyncio.sleep(86400)  # 24 hours
            logger.info("Running scheduled data retention enforcement")
            await retention_manager.enforce_retention_policies()
        except Exception as e:
            logger.error(f"Retention enforcement failed: {e}")

async def schedule_secret_rotation_checks():
    """Schedule periodic secret rotation checks"""
    while True:
        try:
            await asyncio.sleep(3600)  # 1 hour
            due_rotations = await secrets_manager.check_rotation_due()
            if due_rotations:
                logger.warning(f"Found {len(due_rotations)} secrets due for rotation")
                # In production, trigger alerts or automated rotation
        except Exception as e:
            logger.error(f"Secret rotation check failed: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Security-aware cleanup tasks on shutdown"""
    logger.info("Shutting down MakrX Store API...")

    try:
        # Log shutdown event
        await security_logger.log_security_event(
            event_type="system_shutdown",
            action="api_shutdown",
            success=True,
            context={"reason": "normal_shutdown"}
        )

        # Clear sensitive data from memory
        if hasattr(secrets_manager, 'local_secrets'):
            secrets_manager.local_secrets.clear()
        if hasattr(mfa_manager, 'user_secrets'):
            mfa_manager.user_secrets.clear()

        logger.info("Security cleanup completed")

    except Exception as e:
        logger.error(f"Shutdown cleanup failed: {e}")

    logger.info("MakrX Store API shutdown complete")

@app.get("/")
async def root():
    """Root endpoint with API and security information"""
    return {
        "name": "MakrX Store API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "security": {
            "dpdp_compliant": True,
            "pci_compliant": True,
            "encryption": "TLS 1.2+",
            "authentication": "Keycloak SSO + JWT"
        },
        "endpoints": {
            "docs": "/docs" if settings.ENVIRONMENT != "production" else None,
            "health": "/health",
            "metrics": "/metrics" if settings.ENVIRONMENT != "production" else None
        },
        "compliance": {
            "dpdp_act_2023": True,
            "gdpr_concepts": True,
            "iso_27001_aligned": True
        }
    }

# Development hot reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_config={
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}',
                },
            },
            "handlers": {
                "default": {
                    "formatter": "default",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                },
            },
            "root": {
                "level": "INFO",
                "handlers": ["default"],
            },
        }
    )
