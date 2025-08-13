from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks, Request
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta

from ..database import get_db
from ..dependencies import get_current_user
from ..schemas.access_control import (
    PermissionCreate, PermissionUpdate, PermissionResponse,
    RoleCreate, RoleUpdate, RoleResponse,
    UserSessionResponse, AccessLogResponse,
    RoleAssignmentCreate, RoleAssignmentResponse,
    PasswordPolicyCreate, PasswordPolicyUpdate, PasswordPolicyResponse,
    PasswordValidationRequest, PasswordValidationResponse,
    UserAccessSummary, BulkRoleAssignment, AccessControlFilter, AccessControlStats,
    EnhancedMemberResponse, RoleExport, RoleImport, PermissionExport,
    AuditLogFilter, SecurityAlert
)
from ..crud import access_control as crud_access_control
from ..models.access_control import PermissionType, RoleType, AccessScope

router = APIRouter()
security = HTTPBearer()

# Permission Management Routes
@router.post("/permissions/", response_model=PermissionResponse, status_code=status.HTTP_201_CREATED)
async def create_permission(
    permission: PermissionCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new permission"""
    if not _has_permission(current_user, "manage_permissions"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create permissions"
        )
    
    try:
        db_permission = crud_access_control.create_permission(db, permission, current_user["user_id"])
        return db_permission
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create permission: {str(e)}"
        )

@router.get("/permissions/", response_model=List[PermissionResponse])
async def get_permissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    permission_type: Optional[PermissionType] = None,
    access_scope: Optional[AccessScope] = None,
    is_active: Optional[bool] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get permissions with filtering"""
    if not _has_permission(current_user, "view_permissions"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view permissions"
        )
    
    permissions = crud_access_control.get_permissions(
        db, skip, limit, permission_type, access_scope, is_active
    )
    return permissions

@router.get("/permissions/{permission_id}", response_model=PermissionResponse)
async def get_permission(
    permission_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get permission by ID"""
    if not _has_permission(current_user, "view_permissions"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view permissions"
        )
    
    permission = crud_access_control.get_permission(db, permission_id)
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )
    return permission

@router.put("/permissions/{permission_id}", response_model=PermissionResponse)
async def update_permission(
    permission_id: str,
    permission_update: PermissionUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update permission"""
    if not _has_permission(current_user, "manage_permissions"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update permissions"
        )
    
    permission = crud_access_control.update_permission(db, permission_id, permission_update)
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )
    return permission

@router.delete("/permissions/{permission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_permission(
    permission_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete permission (only custom permissions)"""
    if not _has_permission(current_user, "manage_permissions"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to delete permissions"
        )
    
    success = crud_access_control.delete_permission(db, permission_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete system permission or permission not found"
        )

# Role Management Routes
@router.post("/roles/", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    role: RoleCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new role"""
    if not _has_permission(current_user, "manage_roles"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create roles"
        )
    
    # Set makerspace context if not super admin
    if not _is_super_admin(current_user):
        role.makerspace_id = _get_user_makerspace_id(current_user)
    
    try:
        db_role = crud_access_control.create_role(db, role, current_user["user_id"])
        return db_role
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create role: {str(e)}"
        )

@router.get("/roles/", response_model=List[RoleResponse])
async def get_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role_type: Optional[RoleType] = None,
    is_active: Optional[bool] = None,
    is_assignable: Optional[bool] = None,
    makerspace_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get roles with filtering"""
    if not _has_permission(current_user, "view_roles"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view roles"
        )
    
    # Limit to user's makerspace if not super admin
    if not _is_super_admin(current_user) and not makerspace_id:
        makerspace_id = _get_user_makerspace_id(current_user)
    
    roles = crud_access_control.get_roles(
        db, skip, limit, role_type, is_active, is_assignable, makerspace_id
    )
    return roles

@router.get("/roles/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get role by ID"""
    if not _has_permission(current_user, "view_roles"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view roles"
        )
    
    role = crud_access_control.get_role(db, role_id, _get_user_makerspace_id(current_user))
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found or access denied"
        )
    return role

@router.put("/roles/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: str,
    role_update: RoleUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update role"""
    if not _has_permission(current_user, "manage_roles"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update roles"
        )
    
    role = crud_access_control.update_role(db, role_id, role_update, current_user["user_id"])
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found or access denied"
        )
    return role

@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    role_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete role (only custom roles)"""
    if not _has_permission(current_user, "manage_roles"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to delete roles"
        )
    
    success = crud_access_control.delete_role(db, role_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete system role, role in use, or role not found"
        )

# Role Assignment Routes
@router.post("/roles/{role_id}/assign", response_model=RoleAssignmentResponse, status_code=status.HTTP_201_CREATED)
async def assign_role_to_user(
    role_id: str,
    assignment: RoleAssignmentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assign role to user"""
    if not _has_permission(current_user, "manage_roles"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to assign roles"
        )
    
    assignment.role_id = role_id
    
    try:
        db_assignment = crud_access_control.assign_role_to_user(
            db, assignment, current_user["user_id"]
        )
        return db_assignment
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to assign role: {str(e)}"
        )

@router.delete("/roles/{role_id}/revoke/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_role_from_user(
    role_id: str,
    user_id: str,
    reason: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke role from user"""
    if not _has_permission(current_user, "manage_roles"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to revoke roles"
        )
    
    success = crud_access_control.revoke_role_from_user(
        db, role_id, user_id, current_user["user_id"], reason
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role assignment not found"
        )

@router.post("/roles/bulk-assign")
async def bulk_assign_roles(
    bulk_assignment: BulkRoleAssignment,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bulk assign or revoke roles"""
    if not _has_permission(current_user, "manage_roles"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions for bulk role operations"
        )
    
    results = []
    for user_id in bulk_assignment.user_ids:
        for role_id in bulk_assignment.role_ids:
            try:
                if bulk_assignment.action == "assign":
                    assignment = RoleAssignmentCreate(
                        user_id=user_id,
                        role_id=role_id,
                        reason=bulk_assignment.reason,
                        effective_date=bulk_assignment.effective_date,
                        expiry_date=bulk_assignment.expiry_date
                    )
                    result = crud_access_control.assign_role_to_user(
                        db, assignment, current_user["user_id"]
                    )
                elif bulk_assignment.action == "revoke":
                    result = crud_access_control.revoke_role_from_user(
                        db, role_id, user_id, current_user["user_id"], bulk_assignment.reason
                    )
                
                results.append({
                    "user_id": user_id,
                    "role_id": role_id,
                    "success": True,
                    "action": bulk_assignment.action
                })
            except Exception as e:
                results.append({
                    "user_id": user_id,
                    "role_id": role_id,
                    "success": False,
                    "error": str(e),
                    "action": bulk_assignment.action
                })
    
    return {"results": results}

# User Access Management Routes
@router.get("/users/{user_id}/access", response_model=UserAccessSummary)
async def get_user_access(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's complete access summary"""
    if not _has_permission(current_user, "view_members") and current_user["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view user access"
        )
    
    access_summary = crud_access_control.get_user_access_summary(db, user_id)
    if not access_summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return access_summary

@router.get("/users/", response_model=List[EnhancedMemberResponse])
async def get_enhanced_members(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    filters: AccessControlFilter = Depends(),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get enhanced member list with access control information"""
    if not _has_permission(current_user, "view_members"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view members"
        )
    
    # Apply makerspace filter if not super admin
    if not _is_super_admin(current_user):
        filters.makerspace_id = _get_user_makerspace_id(current_user)
    
    members = crud_access_control.get_enhanced_members(db, skip, limit, filters)
    return members

# Session Management Routes
@router.get("/sessions/", response_model=List[UserSessionResponse])
async def get_user_sessions(
    user_id: Optional[str] = Query(None),
    active_only: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user sessions"""
    if not _has_permission(current_user, "view_sessions") and user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view sessions"
        )
    
    # If no user_id specified and user can't view all, default to their own sessions
    if not user_id and not _has_permission(current_user, "view_sessions"):
        user_id = current_user["user_id"]
    
    sessions = crud_access_control.get_user_sessions(db, user_id, active_only, skip, limit)
    return sessions

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def terminate_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Terminate user session"""
    # Users can terminate their own sessions, admins can terminate any
    session = crud_access_control.get_session(db, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if (session.user_id != current_user["user_id"] and 
        not _has_permission(current_user, "manage_sessions")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to terminate session"
        )
    
    success = crud_access_control.terminate_session(db, session_id, "admin_terminated")
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to terminate session"
        )

# Password Policy Routes
@router.post("/password-policies/", response_model=PasswordPolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_password_policy(
    policy: PasswordPolicyCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create password policy"""
    if not _has_permission(current_user, "manage_settings"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create password policies"
        )
    
    # Set makerspace context if not super admin
    if not _is_super_admin(current_user):
        policy.makerspace_id = _get_user_makerspace_id(current_user)
    
    try:
        db_policy = crud_access_control.create_password_policy(db, policy, current_user["user_id"])
        return db_policy
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create password policy: {str(e)}"
        )

@router.get("/password-policies/", response_model=List[PasswordPolicyResponse])
async def get_password_policies(
    makerspace_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get password policies"""
    if not _has_permission(current_user, "view_settings"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view password policies"
        )
    
    # Limit to user's makerspace if not super admin
    if not _is_super_admin(current_user) and not makerspace_id:
        makerspace_id = _get_user_makerspace_id(current_user)
    
    policies = crud_access_control.get_password_policies(db, makerspace_id)
    return policies

@router.post("/password-policies/validate", response_model=PasswordValidationResponse)
async def validate_password(
    validation_request: PasswordValidationRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Validate password against policy"""
    makerspace_id = validation_request.makerspace_id or _get_user_makerspace_id(current_user)
    
    result = crud_access_control.validate_password(
        db, validation_request.password, makerspace_id
    )
    return result

# Audit and Logging Routes
@router.get("/audit-logs/", response_model=List[AccessLogResponse])
async def get_audit_logs(
    filters: AuditLogFilter = Depends(),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get audit logs"""
    if not _has_permission(current_user, "view_audit_logs"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view audit logs"
        )
    
    # Apply makerspace filter if not super admin
    if not _is_super_admin(current_user):
        filters.makerspace_id = _get_user_makerspace_id(current_user)
    
    logs = crud_access_control.get_audit_logs(db, filters, skip, limit)
    return logs

@router.get("/security-alerts/", response_model=List[SecurityAlert])
async def get_security_alerts(
    resolved: Optional[bool] = Query(None),
    severity: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get security alerts"""
    if not _has_permission(current_user, "view_security_alerts"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view security alerts"
        )
    
    alerts = crud_access_control.get_security_alerts(db, resolved, severity, skip, limit)
    return alerts

# Analytics and Statistics Routes
@router.get("/analytics/access-control", response_model=AccessControlStats)
async def get_access_control_stats(
    makerspace_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get access control analytics"""
    if not _has_permission(current_user, "view_analytics"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view analytics"
        )
    
    # Limit to user's makerspace if not super admin
    if not _is_super_admin(current_user) and not makerspace_id:
        makerspace_id = _get_user_makerspace_id(current_user)
    
    stats = crud_access_control.get_access_control_stats(db, makerspace_id)
    return AccessControlStats(**stats)

# Import/Export Routes
@router.post("/roles/export")
async def export_roles(
    export_config: RoleExport,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export roles to file"""
    if not _has_permission(current_user, "export_roles"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to export roles"
        )
    
    # Apply makerspace filter if not super admin
    if not _is_super_admin(current_user):
        export_config.makerspace_id = _get_user_makerspace_id(current_user)
    
    export_data = crud_access_control.export_roles(db, export_config)
    return export_data

@router.post("/roles/import")
async def import_roles(
    import_data: RoleImport,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Import roles from data"""
    if not _has_permission(current_user, "manage_roles"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to import roles"
        )
    
    results = crud_access_control.import_roles(db, import_data, current_user["user_id"])
    return results

# System Setup Routes
@router.post("/setup/default-roles", status_code=status.HTTP_201_CREATED)
async def setup_default_roles(
    makerspace_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Setup default roles and permissions for a makerspace"""
    if not _is_super_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can setup default roles"
        )
    
    if not makerspace_id:
        makerspace_id = _get_user_makerspace_id(current_user)
    
    try:
        result = crud_access_control.setup_default_roles_and_permissions(db, makerspace_id)
        return {"message": "Default roles and permissions created successfully", "details": result}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to setup default roles: {str(e)}"
        )

# Helper functions
def _has_permission(user: dict, permission: str) -> bool:
    """Check if user has specific permission"""
    user_permissions = user.get("permissions", [])
    user_role = user.get("role", "")
    
    # Super admins have all permissions
    if user_role == "super_admin":
        return True
    
    # Check direct permission
    if permission in user_permissions:
        return True
    
    # Check role-based permissions
    role_permissions = {
        "makerspace_admin": [
            "view_members", "create_members", "edit_members", "suspend_members",
            "view_roles", "manage_roles", "view_sessions", "manage_sessions",
            "view_settings", "manage_settings", "view_analytics", "export_roles"
        ],
        "staff": [
            "view_members", "create_members", "edit_members",
            "view_sessions", "view_settings"
        ]
    }
    
    role_perms = role_permissions.get(user_role, [])
    return permission in role_perms

def _is_super_admin(user: dict) -> bool:
    """Check if user is super admin"""
    return user.get("role") == "super_admin"

def _get_user_makerspace_id(user: dict) -> str:
    """Get user's makerspace ID"""
    return user.get("makerspace_id", "default_makerspace")

# Background task functions
async def send_role_assignment_notification(user_email: str, role_name: str, assigned_by: str):
    """Send notification when role is assigned"""
    print(f"Sending role assignment notification to {user_email}: {role_name} assigned by {assigned_by}")

async def send_security_alert(alert_type: str, details: dict):
    """Send security alert to administrators"""
    print(f"Security alert: {alert_type} - {details}")
