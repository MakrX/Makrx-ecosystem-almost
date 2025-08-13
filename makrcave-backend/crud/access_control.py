from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, func, text
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

from ..models.access_control import (
    Permission, Role, UserSession, AccessLog, RoleAccessLog, 
    PasswordPolicy, PermissionType, RoleType, AccessScope,
    create_default_permissions, create_default_roles
)
from ..models.enhanced_member import Member
from ..schemas.access_control import (
    PermissionCreate, PermissionUpdate, RoleCreate, RoleUpdate,
    UserSessionCreate, AccessLogCreate, RoleAssignmentCreate,
    PasswordPolicyCreate, PasswordPolicyUpdate, AccessControlFilter,
    PasswordValidationRequest, BulkRoleAssignment, RoleExport, RoleImport
)

# Permission CRUD operations
def create_permission(db: Session, permission: PermissionCreate, created_by: str) -> Permission:
    """Create a new permission"""
    db_permission = Permission(
        **permission.dict(),
        created_by=created_by
    )
    db.add(db_permission)
    db.commit()
    db.refresh(db_permission)
    return db_permission

def get_permissions(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    permission_type: Optional[PermissionType] = None,
    access_scope: Optional[AccessScope] = None,
    is_active: Optional[bool] = None
) -> List[Permission]:
    """Get permissions with filtering"""
    query = db.query(Permission)
    
    if permission_type:
        query = query.filter(Permission.permission_type == permission_type)
    if access_scope:
        query = query.filter(Permission.access_scope == access_scope)
    if is_active is not None:
        query = query.filter(Permission.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()

def get_permission(db: Session, permission_id: str) -> Optional[Permission]:
    """Get permission by ID"""
    return db.query(Permission).filter(Permission.id == permission_id).first()

def get_permission_by_codename(db: Session, codename: str) -> Optional[Permission]:
    """Get permission by codename"""
    return db.query(Permission).filter(Permission.codename == codename).first()

def update_permission(db: Session, permission_id: str, permission_update: PermissionUpdate) -> Optional[Permission]:
    """Update permission"""
    db_permission = get_permission(db, permission_id)
    if not db_permission or db_permission.is_system:
        return None
    
    update_data = permission_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_permission, field, value)
    
    db.commit()
    db.refresh(db_permission)
    return db_permission

def delete_permission(db: Session, permission_id: str) -> bool:
    """Delete permission (only custom permissions)"""
    db_permission = get_permission(db, permission_id)
    if not db_permission or db_permission.is_system:
        return False
    
    db.delete(db_permission)
    db.commit()
    return True

# Role CRUD operations
def create_role(db: Session, role: RoleCreate, created_by: str) -> Role:
    """Create a new role"""
    # Get permissions by IDs
    permissions = db.query(Permission).filter(Permission.id.in_(role.permission_ids)).all()
    
    db_role = Role(
        **role.dict(exclude={"permission_ids"}),
        created_by=created_by
    )
    db_role.permissions = permissions
    
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

def get_roles(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    role_type: Optional[RoleType] = None,
    is_active: Optional[bool] = None,
    is_assignable: Optional[bool] = None,
    makerspace_id: Optional[str] = None
) -> List[Role]:
    """Get roles with filtering"""
    query = db.query(Role).options(joinedload(Role.permissions), joinedload(Role.users))
    
    if role_type:
        query = query.filter(Role.role_type == role_type)
    if is_active is not None:
        query = query.filter(Role.is_active == is_active)
    if is_assignable is not None:
        query = query.filter(Role.is_assignable == is_assignable)
    if makerspace_id:
        query = query.filter(
            or_(Role.makerspace_id == makerspace_id, Role.makerspace_id.is_(None))
        )
    
    return query.order_by(desc(Role.priority_level)).offset(skip).limit(limit).all()

def get_role(db: Session, role_id: str, makerspace_id: Optional[str] = None) -> Optional[Role]:
    """Get role by ID"""
    query = db.query(Role).options(joinedload(Role.permissions), joinedload(Role.users))
    query = query.filter(Role.id == role_id)
    
    if makerspace_id:
        query = query.filter(
            or_(Role.makerspace_id == makerspace_id, Role.makerspace_id.is_(None))
        )
    
    return query.first()

def update_role(db: Session, role_id: str, role_update: RoleUpdate, updated_by: str) -> Optional[Role]:
    """Update role"""
    db_role = get_role(db, role_id)
    if not db_role or db_role.is_system:
        return None
    
    update_data = role_update.dict(exclude_unset=True, exclude={"permission_ids"})
    for field, value in update_data.items():
        setattr(db_role, field, value)
    
    # Update permissions if provided
    if role_update.permission_ids is not None:
        permissions = db.query(Permission).filter(Permission.id.in_(role_update.permission_ids)).all()
        db_role.permissions = permissions
    
    db_role.last_modified_by = updated_by
    db.commit()
    db.refresh(db_role)
    return db_role

def delete_role(db: Session, role_id: str) -> bool:
    """Delete role (only custom roles with no users)"""
    db_role = get_role(db, role_id)
    if not db_role or db_role.is_system or len(db_role.users) > 0:
        return False
    
    db.delete(db_role)
    db.commit()
    return True

# Role assignment operations
def assign_role_to_user(db: Session, assignment: RoleAssignmentCreate, assigned_by: str) -> RoleAccessLog:
    """Assign role to user"""
    # Get user and role
    user = db.query(Member).filter(Member.id == assignment.user_id).first()
    role = get_role(db, assignment.role_id)
    
    if not user or not role:
        raise ValueError("User or role not found")
    
    if not role.can_assign_to_user(assignment.user_id, str(user.makerspace_id)):
        raise ValueError("Role cannot be assigned to this user")
    
    # Check if already assigned
    if role in user.roles:
        raise ValueError("Role already assigned to user")
    
    # Get previous permissions for logging
    previous_permissions = user.get_effective_permissions()
    
    # Assign role
    user.roles.append(role)
    
    # Log the assignment
    log_entry = RoleAccessLog(
        role_id=assignment.role_id,
        user_id=assignment.user_id,
        modified_by=assigned_by,
        action="assigned",
        previous_permissions=previous_permissions,
        new_permissions=user.get_effective_permissions(),
        reason=assignment.reason,
        effective_date=assignment.effective_date,
        expiry_date=assignment.expiry_date
    )
    
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry

def revoke_role_from_user(db: Session, role_id: str, user_id: str, revoked_by: str, reason: str = None) -> bool:
    """Revoke role from user"""
    user = db.query(Member).filter(Member.id == user_id).first()
    role = get_role(db, role_id)
    
    if not user or not role or role not in user.roles:
        return False
    
    # Get previous permissions for logging
    previous_permissions = user.get_effective_permissions()
    
    # Revoke role
    user.roles.remove(role)
    
    # Log the revocation
    log_entry = RoleAccessLog(
        role_id=role_id,
        user_id=user_id,
        modified_by=revoked_by,
        action="revoked",
        previous_permissions=previous_permissions,
        new_permissions=user.get_effective_permissions(),
        reason=reason
    )
    
    db.add(log_entry)
    db.commit()
    return True

# User session management
def create_user_session(db: Session, session: UserSessionCreate) -> UserSession:
    """Create a new user session"""
    db_session = UserSession(**session.dict())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_user_sessions(
    db: Session, 
    user_id: Optional[str] = None, 
    active_only: bool = True,
    skip: int = 0,
    limit: int = 100
) -> List[UserSession]:
    """Get user sessions"""
    query = db.query(UserSession)
    
    if user_id:
        query = query.filter(UserSession.user_id == user_id)
    if active_only:
        query = query.filter(UserSession.is_active == True)
    
    return query.order_by(desc(UserSession.created_at)).offset(skip).limit(limit).all()

def get_session(db: Session, session_id: str) -> Optional[UserSession]:
    """Get session by ID"""
    return db.query(UserSession).filter(UserSession.id == session_id).first()

def terminate_session(db: Session, session_id: str, reason: str = "user_logout") -> bool:
    """Terminate user session"""
    session = get_session(db, session_id)
    if not session or not session.is_active:
        return False
    
    session.is_active = False
    session.ended_at = datetime.utcnow()
    session.end_reason = reason
    
    db.commit()
    return True

# Access logging
def create_access_log(db: Session, access_log: AccessLogCreate) -> AccessLog:
    """Create access log entry"""
    db_log = AccessLog(**access_log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_audit_logs(
    db: Session,
    filters: AccessControlFilter,
    skip: int = 0,
    limit: int = 100
) -> List[AccessLog]:
    """Get audit logs with filtering"""
    query = db.query(AccessLog).options(joinedload(AccessLog.user))
    
    if filters.user_ids:
        query = query.filter(AccessLog.user_id.in_(filters.user_ids))
    if filters.date_from:
        query = query.filter(AccessLog.created_at >= filters.date_from)
    if filters.date_to:
        query = query.filter(AccessLog.created_at <= filters.date_to)
    
    return query.order_by(desc(AccessLog.created_at)).offset(skip).limit(limit).all()

# Password policy management
def create_password_policy(db: Session, policy: PasswordPolicyCreate, created_by: str) -> PasswordPolicy:
    """Create password policy"""
    db_policy = PasswordPolicy(
        **policy.dict(),
        created_by=created_by
    )
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)
    return db_policy

def get_password_policies(db: Session, makerspace_id: Optional[str] = None) -> List[PasswordPolicy]:
    """Get password policies"""
    query = db.query(PasswordPolicy).filter(PasswordPolicy.is_active == True)
    
    if makerspace_id:
        query = query.filter(
            or_(PasswordPolicy.makerspace_id == makerspace_id, PasswordPolicy.makerspace_id.is_(None))
        )
    
    return query.order_by(desc(PasswordPolicy.makerspace_id.is_(None))).all()

def get_effective_password_policy(db: Session, makerspace_id: str) -> Optional[PasswordPolicy]:
    """Get effective password policy for makerspace"""
    # First try makerspace-specific policy
    policy = db.query(PasswordPolicy).filter(
        and_(
            PasswordPolicy.makerspace_id == makerspace_id,
            PasswordPolicy.is_active == True
        )
    ).first()
    
    # Fall back to global policy
    if not policy:
        policy = db.query(PasswordPolicy).filter(
            and_(
                PasswordPolicy.makerspace_id.is_(None),
                PasswordPolicy.is_active == True
            )
        ).first()
    
    return policy

def validate_password(db: Session, password: str, makerspace_id: str) -> dict:
    """Validate password against policy"""
    policy = get_effective_password_policy(db, makerspace_id)
    
    if not policy:
        # Default validation if no policy
        return {
            "valid": len(password) >= 8,
            "errors": [] if len(password) >= 8 else ["Password must be at least 8 characters long"],
            "strength_score": min(100, len(password) * 5)
        }
    
    return policy.validate_password(password)

# User access management
def get_user_access_summary(db: Session, user_id: str) -> Optional[dict]:
    """Get comprehensive user access summary"""
    user = db.query(Member).options(
        joinedload(Member.roles).joinedload(Role.permissions),
        joinedload(Member.sessions)
    ).filter(Member.id == user_id).first()
    
    if not user:
        return None
    
    active_sessions = [s for s in user.sessions if s.is_active and not s.is_expired()]
    
    return {
        "user_id": str(user.id),
        "user_email": user.email,
        "user_name": f"{user.first_name} {user.last_name}",
        "roles": [role.to_dict() for role in user.roles],
        "permissions": user.get_effective_permissions(),
        "active_sessions": len(active_sessions),
        "last_login": user.last_login,
        "account_locked": user.account_locked,
        "password_expires_at": user.password_expires_at,
        "requires_password_change": user.requires_password_change,
        "two_factor_enabled": user.two_factor_enabled
    }

def get_enhanced_members(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    filters: AccessControlFilter = None
) -> List[Member]:
    """Get enhanced member list with access control info"""
    query = db.query(Member).options(
        joinedload(Member.roles),
        joinedload(Member.sessions),
        joinedload(Member.membership_plan)
    )
    
    if filters:
        if filters.user_ids:
            query = query.filter(Member.id.in_(filters.user_ids))
        if filters.makerspace_id:
            query = query.filter(Member.makerspace_id == filters.makerspace_id)
        if filters.is_active is not None:
            query = query.filter(Member.is_active == filters.is_active)
        if filters.has_active_session is not None:
            if filters.has_active_session:
                query = query.join(UserSession).filter(UserSession.is_active == True)
            else:
                query = query.outerjoin(UserSession).filter(
                    or_(UserSession.id.is_(None), UserSession.is_active == False)
                )
    
    return query.order_by(desc(Member.created_at)).offset(skip).limit(limit).all()

# Analytics and statistics
def get_access_control_stats(db: Session, makerspace_id: Optional[str] = None) -> dict:
    """Get access control statistics"""
    # Base queries
    user_query = db.query(Member)
    role_query = db.query(Role)
    session_query = db.query(UserSession)
    
    if makerspace_id:
        user_query = user_query.filter(Member.makerspace_id == makerspace_id)
        role_query = role_query.filter(
            or_(Role.makerspace_id == makerspace_id, Role.makerspace_id.is_(None))
        )
        session_query = session_query.join(Member).filter(Member.makerspace_id == makerspace_id)
    
    # User statistics
    total_users = user_query.count()
    active_users = user_query.filter(Member.is_active == True).count()
    locked_users = user_query.filter(Member.account_locked == True).count()
    users_requiring_password_change = user_query.filter(Member.requires_password_change == True).count()
    users_with_2fa = user_query.filter(Member.two_factor_enabled == True).count()
    
    # Role statistics
    total_roles = role_query.count()
    system_roles = role_query.filter(Role.is_system == True).count()
    custom_roles = total_roles - system_roles
    
    # Permission statistics
    total_permissions = db.query(Permission).filter(Permission.is_active == True).count()
    
    # Session statistics
    active_sessions = session_query.filter(UserSession.is_active == True).count()
    
    # Recent activity
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_login_attempts = db.query(AccessLog).filter(
        and_(
            AccessLog.action == "login",
            AccessLog.created_at >= yesterday
        )
    ).count()
    
    failed_login_attempts = db.query(AccessLog).filter(
        and_(
            AccessLog.action == "login",
            AccessLog.success == False,
            AccessLog.created_at >= yesterday
        )
    ).count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "locked_users": locked_users,
        "users_requiring_password_change": users_requiring_password_change,
        "users_with_2fa": users_with_2fa,
        "total_roles": total_roles,
        "system_roles": system_roles,
        "custom_roles": custom_roles,
        "total_permissions": total_permissions,
        "active_sessions": active_sessions,
        "recent_login_attempts": recent_login_attempts,
        "failed_login_attempts": failed_login_attempts
    }

# Security features
def get_security_alerts(
    db: Session,
    resolved: Optional[bool] = None,
    severity: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> List[dict]:
    """Get security alerts (placeholder implementation)"""
    # This would typically query a security_alerts table
    # For now, return sample data based on recent failed logins
    
    alerts = []
    
    # Check for recent failed login attempts
    recent_failures = db.query(AccessLog).filter(
        and_(
            AccessLog.action == "login",
            AccessLog.success == False,
            AccessLog.created_at >= datetime.utcnow() - timedelta(hours=24)
        )
    ).group_by(AccessLog.ip_address).having(func.count(AccessLog.id) >= 5).all()
    
    for failure in recent_failures:
        alerts.append({
            "id": str(uuid.uuid4()),
            "alert_type": "multiple_failed_logins",
            "severity": "medium",
            "title": "Multiple Failed Login Attempts",
            "description": f"Multiple failed login attempts from IP {failure.ip_address}",
            "ip_address": failure.ip_address,
            "details": {"attempt_count": 5},  # Simplified
            "resolved": False,
            "created_at": failure.created_at
        })
    
    return alerts[skip:skip+limit]

# System setup
def setup_default_roles_and_permissions(db: Session, makerspace_id: str) -> dict:
    """Setup default roles and permissions for a makerspace"""
    created_permissions = []
    created_roles = []
    
    # Create default permissions if they don't exist
    default_permissions = create_default_permissions()
    for perm_data in default_permissions:
        existing = get_permission_by_codename(db, perm_data["codename"])
        if not existing:
            permission = Permission(**perm_data)
            db.add(permission)
            created_permissions.append(perm_data["codename"])
    
    db.commit()
    
    # Create default roles for the makerspace
    default_roles = create_default_roles()
    for role_data in default_roles:
        # Check if role already exists for this makerspace
        existing = db.query(Role).filter(
            and_(
                Role.name == role_data["name"],
                Role.makerspace_id == makerspace_id
            )
        ).first()
        
        if not existing:
            # Get permissions by codename
            permission_codes = role_data.pop("permissions", [])
            permissions = db.query(Permission).filter(
                Permission.codename.in_(permission_codes)
            ).all()
            
            role = Role(
                **role_data,
                makerspace_id=makerspace_id,
                permissions=permissions
            )
            db.add(role)
            created_roles.append(role_data["name"])
    
    db.commit()
    
    return {
        "created_permissions": created_permissions,
        "created_roles": created_roles
    }

# Import/Export functions
def export_roles(db: Session, export_config: RoleExport) -> dict:
    """Export roles to specified format"""
    query = db.query(Role).options(joinedload(Role.permissions))
    
    if export_config.makerspace_id:
        query = query.filter(Role.makerspace_id == export_config.makerspace_id)
    
    roles = query.all()
    
    export_data = []
    for role in roles:
        role_dict = role.to_dict()
        
        if export_config.include_permissions:
            role_dict["permission_details"] = [
                {
                    "codename": perm.codename,
                    "name": perm.name,
                    "description": perm.description
                }
                for perm in role.permissions
            ]
        
        if export_config.include_users:
            role_dict["user_count"] = len(role.users)
            role_dict["users"] = [
                {"id": str(user.id), "email": user.email, "name": f"{user.first_name} {user.last_name}"}
                for user in role.users
            ]
        
        export_data.append(role_dict)
    
    return {
        "format": export_config.format,
        "exported_at": datetime.utcnow().isoformat(),
        "total_roles": len(export_data),
        "data": export_data
    }

def import_roles(db: Session, import_data: RoleImport, imported_by: str) -> dict:
    """Import roles from data"""
    results = {"created": [], "updated": [], "errors": []}
    
    for role_data in import_data.roles:
        try:
            # Check if role exists
            existing = None
            if import_data.update_existing:
                existing = db.query(Role).filter(
                    and_(
                        Role.name == role_data.name,
                        Role.makerspace_id == role_data.makerspace_id
                    )
                ).first()
            
            if existing:
                # Update existing role
                update_data = role_data.dict(exclude={"permission_ids"})
                for field, value in update_data.items():
                    if hasattr(existing, field):
                        setattr(existing, field, value)
                
                # Update permissions
                permissions = db.query(Permission).filter(
                    Permission.id.in_(role_data.permission_ids)
                ).all()
                existing.permissions = permissions
                existing.last_modified_by = imported_by
                
                db.commit()
                results["updated"].append(role_data.name)
            else:
                # Create new role
                db_role = create_role(db, role_data, imported_by)
                results["created"].append(role_data.name)
                
        except Exception as e:
            error_msg = f"Failed to import role '{role_data.name}': {str(e)}"
            results["errors"].append(error_msg)
            
            if not import_data.skip_invalid:
                raise Exception(error_msg)
    
    return results
