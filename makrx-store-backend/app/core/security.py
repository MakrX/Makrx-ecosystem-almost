"""Security utilities for authentication and authorization using Keycloak JWTs."""

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Optional

import httpx
from app.core.config import settings
from app.core.unified_auth import get_request_id
from app.schemas.auth_error import AuthError
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTClaimsError, JWTError

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

# JWKS caching
jwks_cache: Optional[dict] = None
jwks_cache_expiry: Optional[datetime] = None


async def get_jwks() -> dict:
    """Fetch JWKS from Keycloak with simple caching."""
    global jwks_cache, jwks_cache_expiry
    if jwks_cache and jwks_cache_expiry and datetime.utcnow() < jwks_cache_expiry:
        return jwks_cache

    async with httpx.AsyncClient() as client:
        response = await client.get(settings.KEYCLOAK_JWKS_URL)
        response.raise_for_status()
        jwks_cache = response.json()
        jwks_cache_expiry = datetime.utcnow() + timedelta(hours=1)
        return jwks_cache


async def decode_token(token: str, request_id: Optional[str] = None) -> dict:
    """Decode and verify a JWT using the realm's JWKS."""
    try:
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        jwks = await get_jwks()
        key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
        if not key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=AuthError(
                    error="Unauthorized",
                    message="Invalid token",
                    code="invalid_token",
                    request_id=request_id,
                ).model_dump(),
                headers={"WWW-Authenticate": "Bearer"},
            )

        return jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=settings.KEYCLOAK_CLIENT_ID,
            issuer=settings.KEYCLOAK_ISSUER,
        )

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=AuthError(
                error="Unauthorized",
                message="Token expired",
                code="token_expired",
                request_id=request_id,
            ).model_dump(),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (JWTClaimsError, JWTError) as exc:
        logger.error(f"JWT verification failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=AuthError(
                error="Unauthorized",
                message="Invalid token",
                code="invalid_token",
                request_id=request_id,
            ).model_dump(),
            headers={"WWW-Authenticate": "Bearer"},
        )


@dataclass
class AuthUser:
    """Authenticated user extracted from JWT."""

    user_id: str
    email: str
    name: str
    roles: List[str]
    email_verified: bool = False

    def has_role(self, role: str) -> bool:  # pragma: no cover - simple helper
        return role in self.roles


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[AuthUser]:
    """Extract and verify the current user from Authorization header."""
    if not credentials:
        return None

    try:
        request_id = get_request_id(request)
        payload = await decode_token(credentials.credentials, request_id=request_id)
        roles = payload.get("realm_access", {}).get("roles", [])
        return AuthUser(
            user_id=payload.get("sub"),
            email=payload.get("email", ""),
            name=payload.get("preferred_username") or payload.get("email", ""),
            roles=roles,
            email_verified=payload.get("email_verified", False),
        )
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - unexpected errors
        logger.error(f"Token validation error: {exc}")
        return None


async def require_auth(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> AuthUser:
    """Ensure a valid JWT is present."""
    user = await get_current_user(request, credentials)
    if not user:
        request_id = get_request_id(request)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=AuthError(
                error="Unauthorized",
                message="Authentication required",
                code="authentication_required",
                request_id=request_id,
            ).model_dump(),
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_role(required_roles: List[str]):
    """Create a dependency that checks for required roles."""

    async def role_checker(
        request: Request, user: AuthUser = Depends(require_auth)
    ) -> AuthUser:
        if not any(role in user.roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=AuthError(
                    error="Forbidden",
                    message=f"Insufficient permissions. Required: {required_roles}",
                    code="insufficient_permissions",
                    request_id=get_request_id(request),
                ).model_dump(),
            )
        return user

    return role_checker


# Convenience dependencies
require_admin = require_role(["admin", "super_admin"])
require_super_admin = require_role(["super_admin"])
