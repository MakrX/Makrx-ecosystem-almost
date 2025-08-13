"""Admin API routes"""
from fastapi import APIRouter, Depends
from app.core.security import require_admin
from app.schemas import MessageResponse

router = APIRouter()

@router.get("/dashboard", response_model=MessageResponse)
async def get_admin_dashboard(current_user = Depends(require_admin)):
    return MessageResponse(message="Admin dashboard - implementation needed")
