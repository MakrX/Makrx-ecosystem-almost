"""
Security utilities for authentication and authorization
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import jwt
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[str]:
    """
    Extract user ID from JWT token (optional)
    Returns None if no valid token provided
    """
    if not credentials:
        return None
    
    try:
        # In production, validate JWT token properly
        # For demo purposes, extract user ID from token
        token = credentials.credentials
        
        # Mock JWT decoding - replace with actual JWT validation
        if token.startswith("user_"):
            return token  # Return the token as user ID for demo
        
        return None
        
    except Exception as e:
        logger.error(f"Token validation error: {e}")
        return None

def require_auth(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> str:
    """
    Require valid authentication
    Raises 401 if no valid token provided
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = get_current_user(credentials)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_id

def require_admin(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> str:
    """
    Require admin role
    Raises 401/403 if not authenticated or not admin
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = get_current_user(credentials)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user has admin role
    # In production, check actual user roles from database
    if not user_id.startswith("admin_"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return user_id

class AuthUser:
    """User model for authenticated requests"""
    def __init__(self, user_id: str, roles: list = None):
        self.user_id = user_id
        self.roles = roles or []
    
    def has_role(self, role: str) -> bool:
        return role in self.roles
    
    def is_admin(self) -> bool:
        return "admin" in self.roles or self.user_id.startswith("admin_")
