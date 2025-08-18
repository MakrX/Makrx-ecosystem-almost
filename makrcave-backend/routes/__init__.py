"""Unified API router with route classifications and dependencies."""

from fastapi import APIRouter, Depends
from ..dependencies import get_current_user, require_roles, require_scope

api_router = APIRouter()

# --- Public Routes ---
# (No public routes currently defined)

# --- Authenticated Routes ---
from .analytics import router as analytics_router
api_router.include_router(
    analytics_router,
    prefix="/api/v1",
    dependencies=[Depends(get_current_user)],
)

from .announcements import router as announcements_router
api_router.include_router(
    announcements_router,
    dependencies=[Depends(get_current_user)],
)

from .bridge import router as bridge_router
api_router.include_router(
    bridge_router,
    prefix="/api/v1/bridge",
    tags=["bridge"],
    dependencies=[Depends(get_current_user)],
)

from .bridge_contracts import router as bridge_contracts_router
api_router.include_router(
    bridge_contracts_router,
    dependencies=[Depends(get_current_user)],
)

from .bom_export import router as bom_export_router
api_router.include_router(
    bom_export_router,
    dependencies=[Depends(get_current_user)],
)

from .collaboration import router as collaboration_router
api_router.include_router(
    collaboration_router,
    tags=["collaboration"],
    dependencies=[Depends(get_current_user)],
)

from .enhanced_bom import router as enhanced_bom_router
api_router.include_router(
    enhanced_bom_router,
    tags=["enhanced-bom"],
    dependencies=[Depends(get_current_user)],
)

from .enhanced_projects import router as enhanced_projects_router
api_router.include_router(
    enhanced_projects_router,
    prefix="/api/v1/enhanced-projects",
    tags=["enhanced-projects"],
    dependencies=[Depends(get_current_user)],
)

from .equipment_reservations import router as equipment_reservations_router
api_router.include_router(
    equipment_reservations_router,
    prefix="/api/v1",
    tags=["equipment-reservations"],
    dependencies=[Depends(get_current_user)],
)

from .filament_tracking import router as filament_tracking_router
api_router.include_router(
    filament_tracking_router,
    dependencies=[Depends(get_current_user)],
)

from .membership_plans import router as membership_plans_router
api_router.include_router(
    membership_plans_router,
    dependencies=[Depends(get_current_user)],
)

from .notifications import router as notifications_router
api_router.include_router(
    notifications_router,
    prefix="/api/v1/notifications",
    tags=["notifications"],
    dependencies=[Depends(get_current_user)],
)

from .project_showcase import router as project_showcase_router
api_router.include_router(
    project_showcase_router,
    tags=["project-showcase"],
    dependencies=[Depends(get_current_user)],
)

# --- Role-gated Routes ---
from .access_control import router as access_control_router
api_router.include_router(
    access_control_router,
    prefix="/api/v1/access-control",
    tags=["access-control"],
    dependencies=[Depends(get_current_user), Depends(require_roles(["super_admin"]))],
)

from .billing import router as billing_router
api_router.include_router(
    billing_router,
    prefix="/api/v1/billing",
    tags=["billing"],
    dependencies=[Depends(get_current_user), Depends(require_roles(["super_admin", "makerspace_admin"]))],
)

from .enhanced_analytics import router as enhanced_analytics_router
api_router.include_router(
    enhanced_analytics_router,
    prefix="/api/v1/enhanced-analytics",
    tags=["enhanced-analytics"],
    dependencies=[Depends(get_current_user), Depends(require_roles(["super_admin", "makerspace_admin"]))],
)

from .makerspace_settings import router as makerspace_settings_router
api_router.include_router(
    makerspace_settings_router,
    prefix="/api/v1/makerspace",
    dependencies=[Depends(get_current_user), Depends(require_roles(["super_admin"]))],
)

from .machine_access import router as machine_access_router
api_router.include_router(
    machine_access_router,
    tags=["machine-access"],
    dependencies=[Depends(get_current_user), Depends(require_roles(["super_admin", "makerspace_admin"]))],
)

from .member import router as member_router
api_router.include_router(
    member_router,
    prefix="/api/v1/members",
    tags=["members"],
    dependencies=[Depends(get_current_user), Depends(require_roles(["admin", "makerspace_admin", "super_admin"]))],
)

from .providers import router as providers_router
api_router.include_router(
    providers_router,
    dependencies=[Depends(get_current_user), Depends(require_roles(["service_provider", "makerspace_admin", "super_admin"]))],
)

from .skill import router as skill_router
api_router.include_router(
    skill_router,
    prefix="/api/v1",
    tags=["skills"],
    dependencies=[Depends(get_current_user), Depends(require_roles(["super_admin", "makerspace_admin"]))],
)

# --- Scoped Routes ---
from .equipment import router as equipment_router
api_router.include_router(
    equipment_router,
    prefix="/api/v1",
    dependencies=[Depends(get_current_user), Depends(require_scope("makerspace"))],
)

from .inventory import router as inventory_router
api_router.include_router(
    inventory_router,
    prefix="/api/v1",
    dependencies=[Depends(get_current_user), Depends(require_scope("makerspace"))],
)

from .job_management import router as job_management_router
api_router.include_router(
    job_management_router,
    tags=["job-management"],
    dependencies=[Depends(get_current_user), Depends(require_scope("makerspace"))],
)

from .project import router as project_router
api_router.include_router(
    project_router,
    prefix="/api/v1/projects",
    tags=["projects"],
    dependencies=[Depends(get_current_user), Depends(require_scope("self"))],
)
