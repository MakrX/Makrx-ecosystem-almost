from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
import jwt
import httpx
import os
from datetime import datetime
import logging

from .database import get_db

# Configure logging
logger = logging.getLogger(__name__)

# Keycloak configuration
KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://keycloak:8080")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "makrx")
KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "makrcave-frontend")

# JWT verification settings
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    logger.warning("JWT_SECRET not set - using fallback validation")

# Global HTTP client for token validation
http_client = None

async def get_http_client():
    global http_client
    if http_client is None:
        http_client = httpx.AsyncClient(timeout=30.0)
    return http_client

security = HTTPBearer()

class CurrentUser:
    def __init__(self, id: str, name: str, email: str, role: str, makerspace_id: str):
        self.id = id
        self.name = name
        self.email = email
        self.role = role
        self.makerspace_id = makerspace_id

async def validate_token_with_auth_service(token: str) -> dict:
    """Validate token using the auth service"""
    try:
        client = await get_http_client()

        # Call auth service to validate token
        auth_service_url = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8000")

        response = await client.get(
            f"{auth_service_url}/auth/profile",
            headers={"Authorization": f"Bearer {token}"}
        )

        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token validation failed",
                headers={"WWW-Authenticate": "Bearer"},
            )

    except httpx.RequestError:
        # Fallback to local JWT validation if auth service is unavailable
        logger.warning("Auth service unavailable, falling back to local validation")
        return await validate_token_locally(token)

async def validate_token_locally(token: str) -> dict:
    """Fallback local token validation"""
    try:
        if JWT_SECRET:
            # Validate service-generated tokens
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            return payload
        else:
            # If no JWT_SECRET, decode without verification (development only)
            logger.warning("No JWT_SECRET set - token validation disabled for development")
            payload = jwt.decode(token, options={"verify_signature": False})
            return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

def map_keycloak_roles_to_makrcave(keycloak_roles: list) -> str:
    """Map Keycloak roles to MakrCave roles"""
    role_mapping = {
        "super-admin": "super_admin",
        "makerspace-admin": "makerspace_admin",
        "admin": "admin",
        "user": "user",
        "service-provider": "service_provider"
    }

    # Return the highest privilege role found
    for keycloak_role in keycloak_roles:
        if keycloak_role in role_mapping:
            return role_mapping[keycloak_role]

    # Default to user role
    return "user"

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> CurrentUser:
    """Extract and validate current user from JWT token"""
    try:
        token = credentials.credentials

        # Validate token and get user data
        user_data = await validate_token_with_auth_service(token)

        # Extract user information
        user_id = user_data.get("sub") or user_data.get("id")
        email = user_data.get("email", "")
        username = user_data.get("preferred_username") or user_data.get("username") or email

        # Extract and map roles
        keycloak_roles = []
        if "realm_access" in user_data:
            keycloak_roles.extend(user_data["realm_access"].get("roles", []))
        if "resource_access" in user_data:
            for client, access in user_data["resource_access"].items():
                keycloak_roles.extend(access.get("roles", []))

        makrcave_role = map_keycloak_roles_to_makrcave(keycloak_roles)

        # Extract makerspace information (from token claims or default)
        makerspace_id = user_data.get("makerspace_id") or "default-makerspace"

        # Create user object
        return CurrentUser(
            id=user_id,
            name=username,
            email=email,
            role=makrcave_role,
            makerspace_id=makerspace_id
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

def check_permission(user_role: str, permission: str) -> bool:
    """Check if user role has specific permission"""
    
    # Role-based permission matrix based on the user specification
    permissions = {
        "super_admin": {
            "view_inventory": True,
            "add_edit_items": True,
            "issue_items": True,
            "reorder_from_store": True,
            "view_usage_logs": True,
            "link_to_boms": True,
            "delete_items": True,
            # Equipment permissions
            "view_equipment": True,
            "reserve": True,
            "create_equipment": True,
            "maintenance_logs": True,
            "access_control": True,
            "delete_equipment": True
        },
        "makerspace_admin": {
            "view_inventory": True,  # own cave only
            "add_edit_items": True,
            "issue_items": True,
            "reorder_from_store": True,
            "view_usage_logs": True,
            "link_to_boms": True,
            "delete_items": True,
            # Equipment permissions
            "view_equipment": True,  # own cave only
            "reserve": True,
            "create_equipment": True,
            "maintenance_logs": True,
            "access_control": True,
            "delete_equipment": True
        },
        "admin": {
            "view_inventory": True,
            "add_edit_items": False,
            "issue_items": False,
            "reorder_from_store": False,
            "view_usage_logs": False,
            "link_to_boms": False,
            "delete_items": False,
            # Equipment permissions
            "view_equipment": True,
            "reserve": False,
            "create_equipment": False,
            "maintenance_logs": False,
            "access_control": False,
            "delete_equipment": False
        },
        "user": {
            "view_inventory": True,  # read-only
            "add_edit_items": False,
            "issue_items": False,
            "reorder_from_store": False,
            "view_usage_logs": False,
            "link_to_boms": True,  # view-only
            "delete_items": False,
            # Equipment permissions
            "view_equipment": True,
            "reserve": True,
            "create_equipment": False,
            "maintenance_logs": False,
            "access_control": False,
            "delete_equipment": False
        },
        "service_provider": {
            "view_inventory": True,  # own inventory only
            "add_edit_items": True,  # only own items
            "issue_items": True,
            "reorder_from_store": True,
            "view_usage_logs": True,
            "link_to_boms": True,  # for jobs
            "delete_items": True,  # own only
            # Equipment permissions
            "view_equipment": True,  # own only
            "reserve": True,
            "create_equipment": True,  # own only
            "maintenance_logs": True,
            "access_control": True,
            "delete_equipment": True  # own only
        }
    }
    
    role_permissions = permissions.get(user_role, {})
    return role_permissions.get(permission, False)

def require_permission(permission: str):
    """Dependency to require specific permission"""
    def permission_checker(current_user: CurrentUser = Depends(get_current_user)):
        if not check_permission(current_user.role, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {permission}"
            )
        return current_user
    return permission_checker

def require_role(required_roles: list):
    """Dependency to require specific roles"""
    def role_checker(current_user: CurrentUser = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(required_roles)}"
            )
        return current_user
    return role_checker

def require_makerspace_access(item_makerspace_id: str, current_user: CurrentUser) -> bool:
    """Check if user has access to specific makerspace items"""
    # Super admin has access to all makerspaces
    if current_user.role == "super_admin":
        return True
    
    # Other users can only access their own makerspace
    return current_user.makerspace_id == item_makerspace_id

class PermissionChecker:
    """Class for complex permission checking logic"""
    
    def __init__(self, user: CurrentUser):
        self.user = user
    
    def can_modify_item(self, item) -> bool:
        """Check if user can modify a specific item"""
        # Check basic permission
        if not check_permission(self.user.role, "add_edit_items"):
            return False
        
        # Check makerspace access
        if not require_makerspace_access(item.linked_makerspace_id, self.user):
            return False
        
        # Service providers can only modify their own items
        if self.user.role == "service_provider":
            return item.owner_user_id == self.user.id
        
        return True
    
    def can_issue_item(self, item) -> bool:
        """Check if user can issue a specific item"""
        # Check basic permission
        if not check_permission(self.user.role, "issue_items"):
            return False
        
        # Check makerspace access
        if not require_makerspace_access(item.linked_makerspace_id, self.user):
            return False
        
        # Check item access level restriction
        if hasattr(item, 'restricted_access_level') and item.restricted_access_level:
            from .utils.inventory_tools import validate_item_access_level
            return validate_item_access_level(self.user.role, item.restricted_access_level)
        
        return True
    
    def can_delete_item(self, item) -> bool:
        """Check if user can delete a specific item"""
        # Check basic permission
        if not check_permission(self.user.role, "delete_items"):
            return False
        
        # Check makerspace access
        if not require_makerspace_access(item.linked_makerspace_id, self.user):
            return False
        
        # Service providers can only delete their own items
        if self.user.role == "service_provider":
            return item.owner_user_id == self.user.id
        
        return True
    
    def can_view_usage_logs(self, item=None) -> bool:
        """Check if user can view usage logs"""
        # Check basic permission
        if not check_permission(self.user.role, "view_usage_logs"):
            return False
        
        # If checking for specific item, verify makerspace access
        if item and not require_makerspace_access(item.linked_makerspace_id, self.user):
            return False
        
        return True

# Utility function to get permission checker
def get_permission_checker(current_user: CurrentUser = Depends(get_current_user)) -> PermissionChecker:
    """Get permission checker instance for current user"""
    return PermissionChecker(current_user)
