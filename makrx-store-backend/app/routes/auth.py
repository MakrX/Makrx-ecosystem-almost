"""
Authentication API routes
User authentication and session management
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user, AuthUser
from app.schemas import MessageResponse

router = APIRouter()

@router.get("/me")
async def get_current_user_info(
    current_user: AuthUser = Depends(get_current_user)
):
    """Get current user information"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    return {
        "user_id": current_user.sub,
        "email": current_user.email,
        "name": current_user.name,
        "roles": current_user.roles,
        "email_verified": current_user.email_verified
    }

@router.post("/logout", response_model=MessageResponse)
async def logout():
    """Logout endpoint (handled by frontend/Keycloak)"""
    return MessageResponse(message="Logout successful")
