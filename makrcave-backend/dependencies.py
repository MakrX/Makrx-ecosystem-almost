from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt
from jose.exceptions import JWTError
from schemas.auth_error import AuthError
from security import jwks
from security.events import SecurityEventType, log_security_event
from security.helpers import set_request_context

# Configure logging
logger = logging.getLogger(__name__)

# Keycloak configuration
KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://keycloak:8080")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "makrx")
KEYCLOAK_AUDIENCE = os.getenv("KEYCLOAK_AUDIENCE", "makrcave-backend")
KEYCLOAK_ISSUER = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}"
JWKS_URL = f"{KEYCLOAK_ISSUER}/protocol/openid-connect/certs"

ALLOWED_ALGS = {"RS256"}

security = HTTPBearer()


class CurrentUser:
    def __init__(
        self,
        id: str,
        name: str,
        email: str,
        role: str,
        makerspace_id: Optional[str] = None,
    ):
        self.id = id
        self.name = name
        self.email = email
        self.role = role
        self.makerspace_id = makerspace_id


async def validate_token(token: str, request_id: Optional[str] = None) -> dict:
    """Validate token using Keycloak JWKS"""
    try:
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        alg = header.get("alg")

        key = await jwks.get_jwk(kid, JWKS_URL)

        payload = jwt.decode(
            token,
            key,
            algorithms=[alg],
            options={
                "verify_aud": False,
                "verify_iss": False,
                "verify_iat": False,
                "verify_nbf": False,
                "verify_exp": False,
            },
        )

        if payload.get("iss") != KEYCLOAK_ISSUER:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=AuthError(
                    error="Unauthorized",
                    message="Invalid token issuer",
                    code="invalid_issuer",
                    request_id=request_id,
                ).model_dump(),
                headers={"WWW-Authenticate": "Bearer"},
            )

        aud_claim = payload.get("aud", [])
        if isinstance(aud_claim, str):
            aud_claim = [aud_claim]
        if KEYCLOAK_AUDIENCE not in aud_claim:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=AuthError(
                    error="Unauthorized",
                    message="Invalid token audience",
                    code="invalid_audience",
                    request_id=request_id,
                ).model_dump(),
                headers={"WWW-Authenticate": "Bearer"},
            )

        current_ts = datetime.utcnow().timestamp()
        leeway = 60
        exp = payload.get("exp")
        if exp and exp < current_ts - leeway:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=AuthError(
                    error="Unauthorized",
                    message="Token has expired",
                    code="token_expired",
                    request_id=request_id,
                ).model_dump(),
                headers={"WWW-Authenticate": "Bearer"},
            )
        nbf = payload.get("nbf")
        if nbf and nbf >= current_ts + leeway:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=AuthError(
                    error="Unauthorized",
                    message="Token not yet valid",
                    code="token_not_yet_valid",
                    request_id=request_id,
                ).model_dump(),
                headers={"WWW-Authenticate": "Bearer"},
            )
        iat = payload.get("iat")
        if iat and iat > current_ts + leeway:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=AuthError(
                    error="Unauthorized",
                    message="Invalid token issued-at",
                    code="invalid_iat",
                    request_id=request_id,
                ).model_dump(),
                headers={"WWW-Authenticate": "Bearer"},
            )

        if alg not in ALLOWED_ALGS:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=AuthError(
                    error="Unauthorized",
                    message="Invalid token algorithm",
                    code="invalid_algorithm",
                    request_id=request_id,
                ).model_dump(),
                headers={"WWW-Authenticate": "Bearer"},
            )

        if payload.get("typ") != "Bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=AuthError(
                    error="Unauthorized",
                    message="Invalid token type",
                    code="invalid_token_type",
                    request_id=request_id,
                ).model_dump(),
                headers={"WWW-Authenticate": "Bearer"},
            )

        filtered_payload = {
            "sub": payload.get("sub"),
            "email": payload.get("email"),
            "realm_access": {"roles": payload.get("realm_access", {}).get("roles", [])},
            "groups": payload.get("groups", []),
        }
        if "makerspace_id" in payload:
            filtered_payload["makerspace_id"] = payload["makerspace_id"]
        if "provider_id" in payload:
            filtered_payload["provider_id"] = payload["provider_id"]
        return filtered_payload
    except HTTPException:
        raise
    except JWTError as exc:
        logger.error(f"Token validation error: {exc}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=AuthError(
                error="Unauthorized",
                message="Token validation failed",
                code="token_validation_failed",
                request_id=request_id,
            ).model_dump(),
            headers={"WWW-Authenticate": "Bearer"},
        )


def map_keycloak_roles_to_makrcave(keycloak_roles: list) -> str:
    """Map Keycloak roles to MakrCave roles"""
    role_mapping = {
        "super-admin": "super_admin",
        "makerspace-admin": "makerspace_admin",
        "admin": "admin",
        "user": "user",
        "service-provider": "service_provider",
    }

    # Return the highest privilege role found
    for keycloak_role in keycloak_roles:
        if keycloak_role in role_mapping:
            return role_mapping[keycloak_role]

    # Default to user role
    return "user"


async def get_current_token(
    request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Validate the incoming JWT and populate request context."""

    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    token = credentials.credentials
    payload = await validate_token(token, request_id=request_id)
    set_request_context(
        request_id=request_id,
        sub=payload.get("sub"),
        roles=payload.get("realm_access", {}).get("roles", []),
        groups=payload.get("groups", []),
    )
    request.state.request_id = request_id
    return payload


async def get_current_user(
    request: Request, token: dict = Depends(get_current_token)
) -> CurrentUser:
    """Return the authenticated user object from the validated token."""
    try:
        user_id = token.get("sub")
        email = token.get("email", "")
        username = email
        keycloak_roles = token.get("realm_access", {}).get("roles", [])
        makrcave_role = map_keycloak_roles_to_makrcave(keycloak_roles)
        makerspace_id = token.get("makerspace_id")

        return CurrentUser(
            id=user_id,
            name=username,
            email=email,
            role=makrcave_role,
            makerspace_id=makerspace_id,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        request_id = getattr(request.state, "request_id", None)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=AuthError(
                error="Unauthorized",
                message="Authentication failed",
                code="authentication_failed",
                request_id=request_id,
            ).model_dump(),
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
            "delete_equipment": True,
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
            "delete_equipment": True,
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
            "delete_equipment": False,
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
            "delete_equipment": False,
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
            "delete_equipment": True,  # own only
        },
    }

    role_permissions = permissions.get(user_role, {})
    return role_permissions.get(permission, False)


def require_permission(permission: str):
    """Dependency to require specific permission"""

    def permission_checker(current_user: CurrentUser = Depends(get_current_user)):
        if not check_permission(current_user.role, permission):
            log_security_event(
                SecurityEventType.PERMISSION_DENIED,
                user_id=current_user.id,
                details={"required": permission, "role": current_user.role},
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {permission}",
            )
        return current_user

    return permission_checker


def require_role(required_roles: list):
    """Dependency to require specific roles"""

    def role_checker(current_user: CurrentUser = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(required_roles)}",
            )
        return current_user

    return role_checker


def require_roles(roles: list[str]):
    """Require that the JWT contains at least one of the specified roles."""

    def role_checker(token: dict = Depends(get_current_token)):
        token_roles = token.get("realm_access", {}).get("roles", [])
        if not any(role in token_roles for role in roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(roles)}",
            )
        return token

    return role_checker


def require_scope(scopes: list[str] | str):
    """Require that the JWT contains one of the specified scopes and verify
    group ownership."""

    required_scopes = [scopes] if isinstance(scopes, str) else scopes

    def scope_checker(request: Request, token: dict = Depends(get_current_token)):
        token_scopes = token.get("scope", "").split()
        token_roles = token.get("realm_access", {}).get("roles", [])
        token_groups = token.get("groups", [])
        request_id = getattr(request.state, "request_id", None)

        # Allow makerspace and super admins to bypass scope restrictions
        if any(role in token_roles for role in ["makerspace_admin", "super_admin"]):
            return token

        if not any(scope in token_scopes for scope in required_scopes):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=AuthError(
                    error="Forbidden",
                    message=(
                        "Insufficient scope. Required scopes: "
                        + ", ".join(required_scopes)
                    ),
                    code="insufficient_scope",
                    request_id=request_id,
                ).model_dump(),
            )

        for required in required_scopes:
            if required == "makerspace":
                makerspace_id = (
                    request.path_params.get("makerspace_id")
                    or request.query_params.get("makerspace_id")
                    or token.get("makerspace_id")
                )
                if makerspace_id and f"makerspace:{makerspace_id}" not in token_groups:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=AuthError(
                            error="Forbidden",
                            message="Insufficient makerspace scope",
                            code="insufficient_makerspace_scope",
                            request_id=request_id,
                        ).model_dump(),
                    )

            if required == "provider":
                provider_id = (
                    request.path_params.get("provider_id")
                    or request.query_params.get("provider_id")
                    or token.get("provider_id")
                )
                if provider_id and f"provider:{provider_id}" not in token_groups:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=AuthError(
                            error="Forbidden",
                            message="Insufficient provider scope",
                            code="insufficient_provider_scope",
                            request_id=request_id,
                        ).model_dump(),
                    )

            if required == "self":
                owner_id = (
                    request.path_params.get("user_id")
                    or request.path_params.get("owner_id")
                    or request.query_params.get("user_id")
                    or request.query_params.get("owner_id")
                )
                if owner_id and owner_id != token.get("sub"):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=AuthError(
                            error="Forbidden",
                            message="Access denied. Resource ownership mismatch",
                            code="access_denied",
                            request_id=request_id,
                        ).model_dump(),
                    )

        return token

    return scope_checker


def require_makerspace_access(
    item_makerspace_id: str, current_user: CurrentUser
) -> bool:
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
        if hasattr(item, "restricted_access_level") and item.restricted_access_level:
            from .utils.inventory_tools import validate_item_access_level

            return validate_item_access_level(
                self.user.role, item.restricted_access_level
            )

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
def get_permission_checker(
    current_user: CurrentUser = Depends(get_current_user),
) -> PermissionChecker:
    """Get permission checker instance for current user"""
    return PermissionChecker(current_user)
