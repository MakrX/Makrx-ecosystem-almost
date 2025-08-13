from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os

# Import security middleware
from middleware.security import add_security_middleware

from routes.inventory import router as inventory_router
from routes.equipment import router as equipment_router
from routes.project import router as project_router
from routes.member import router as member_router
from routes.billing import router as billing_router
from routes.analytics import router as analytics_router
from routes.makerspace_settings import router as settings_router
from routes.skill import router as skill_router
from routes.bridge import router as bridge_router
from routes.membership_plans import router as membership_plans_router
from routes.announcements import router as announcements_router
from routes.filament_tracking import router as filament_tracking_router
from routes.enhanced_projects import router as enhanced_projects_router
from routes.equipment_reservations import router as equipment_reservations_router
from routes.job_management import router as job_management_router
from routes.machine_access import router as machine_access_router
from routes.enhanced_bom import router as enhanced_bom_router
from routes.access_control import router as access_control_router
from routes.enhanced_analytics import router as enhanced_analytics_router
from routes.notifications import router as notifications_router
from routes.collaboration import router as collaboration_router
from routes.project_showcase import router as project_showcase_router

# Create FastAPI application
app = FastAPI(
    title="MakrCave Backend API",
    description="Backend API for MakrCave Inventory Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware configuration - Secure origins only
allowed_origins = [
    "https://makrcave.com",
    "https://makrx.org",
    "https://makrx.store",
    "http://localhost:3000",  # Gateway (development)
    "http://localhost:3001",  # MakrCave (development)
    "http://localhost:3002",  # Store (development)
    "http://localhost:3003",  # Store alternate (development)
]

# Add environment-specific origins
if os.getenv("ENVIRONMENT") == "development":
    allowed_origins.extend([
        "http://gateway-frontend:3000",
        "http://makrcave-frontend:3001",
        "http://makrx-store-frontend:3002"
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-CSRF-Token"
    ],
)

# Add security middleware (after CORS)
add_security_middleware(app)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": "server_error"}
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "makrcave-backend"}

# Include routers
app.include_router(inventory_router, prefix="/api/v1")
app.include_router(equipment_router, prefix="/api/v1")
app.include_router(project_router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(member_router, prefix="/api/v1/members", tags=["members"])
app.include_router(billing_router, prefix="/api/v1/billing", tags=["billing"])
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(settings_router, prefix="/api/v1/makerspace")
app.include_router(skill_router, prefix="/api/v1", tags=["skills"])
app.include_router(bridge_router, prefix="/api/v1/bridge", tags=["bridge"])
app.include_router(membership_plans_router)
app.include_router(announcements_router)
app.include_router(filament_tracking_router)
app.include_router(enhanced_projects_router, prefix="/api/v1/enhanced-projects", tags=["enhanced-projects"])
app.include_router(equipment_reservations_router, prefix="/api/v1", tags=["equipment-reservations"])
app.include_router(job_management_router, tags=["job-management"])
app.include_router(machine_access_router, tags=["machine-access"])
app.include_router(enhanced_bom_router, tags=["enhanced-bom"])
app.include_router(access_control_router, prefix="/api/v1/access-control", tags=["access-control"])
app.include_router(enhanced_analytics_router, prefix="/api/v1/enhanced-analytics", tags=["enhanced-analytics"])
app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(collaboration_router, tags=["collaboration"])
app.include_router(project_showcase_router, tags=["project-showcase"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "MakrCave Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
