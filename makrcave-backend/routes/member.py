from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from ..database import get_db
from ..dependencies import get_current_user
from ..schemas.member import (
    MemberCreate, MemberUpdate, MemberResponse, MemberSummaryResponse, MemberSuspend,
    MembershipPlanCreate, MembershipPlanUpdate, MembershipPlanResponse,
    MemberInviteCreate, MemberInviteUpdate, MemberInviteResponse,
    MemberActivityLogResponse, MembershipTransactionResponse,
    MemberFilter, MemberSort, MemberStatistics, BulkMemberOperation
)
from ..crud import member as crud_member
from ..utils.email_service import send_member_invite_email

router = APIRouter()
security = HTTPBearer()

# Member management routes
@router.post("/", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
async def create_member(
    member: MemberCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None
):
    """Create a new member"""
    try:
        # Check permissions
        if not _can_manage_members(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to create members"
            )
        
        # Check if member already exists
        existing_member = crud_member.get_member_by_email(db, member.email, member.makerspace_id)
        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Member with this email already exists"
            )
        
        # Create member
        db_member = crud_member.create_member(db, member, current_user["user_id"])
        
        # Send welcome email in background
        if background_tasks:
            background_tasks.add_task(
                send_welcome_email, 
                db_member.email, 
                db_member.first_name,
                db_member.membership_plan.name if db_member.membership_plan else "Basic"
            )
        
        return db_member
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create member: {str(e)}"
        )

@router.get("/", response_model=List[MemberSummaryResponse])
async def get_members(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[List[str]] = Query(None),
    role_filter: Optional[List[str]] = Query(None),
    membership_plan_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    sort_field: str = Query("created_at"),
    sort_direction: str = Query("desc"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get members with filtering and pagination"""
    try:
        # Check permissions
        if not _can_view_members(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view members"
            )
        
        # Build filters
        filters = MemberFilter(
            status=status_filter,
            role=role_filter,
            membership_plan_id=membership_plan_id,
            search=search,
            is_active=is_active,
            makerspace_id=_get_user_makerspace_id(current_user)
        )
        
        sort = MemberSort(field=sort_field, direction=sort_direction)
        
        members = crud_member.get_members(
            db, current_user["user_id"], skip, limit, filters, sort
        )
        
        # Convert to summary response
        summary_members = []
        for member in members:
            summary = MemberSummaryResponse(
                id=member.id,
                email=member.email,
                first_name=member.first_name,
                last_name=member.last_name,
                role=member.role,
                status=member.status,
                membership_plan_name=member.membership_plan.name if member.membership_plan else None,
                last_login=member.last_login,
                join_date=member.join_date,
                projects_count=member.projects_count,
                reservations_count=member.reservations_count
            )
            summary_members.append(summary)
        
        return summary_members
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch members: {str(e)}"
        )

@router.get("/{member_id}", response_model=MemberResponse)
async def get_member(
    member_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get member by ID"""
    member = crud_member.get_member(db, member_id, current_user["user_id"])
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found or access denied"
        )
    
    # Add membership plan name
    response = MemberResponse.from_orm(member)
    if member.membership_plan:
        response.membership_plan_name = member.membership_plan.name
    
    return response

@router.put("/{member_id}", response_model=MemberResponse)
async def update_member(
    member_id: str,
    member_update: MemberUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update member"""
    # Check permissions
    if not _can_manage_members(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update members"
        )
    
    member = crud_member.update_member(db, member_id, member_update, current_user["user_id"])
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    # Add membership plan name
    response = MemberResponse.from_orm(member)
    if member.membership_plan:
        response.membership_plan_name = member.membership_plan.name
    
    return response

@router.post("/{member_id}/suspend", response_model=MemberResponse)
async def suspend_member(
    member_id: str,
    suspend_data: MemberSuspend,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Suspend a member"""
    # Check permissions
    if not _can_manage_members(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to suspend members"
        )
    
    suspend_data.suspended_by = current_user["user_id"]
    member = crud_member.suspend_member(db, member_id, suspend_data)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    return member

@router.post("/{member_id}/reactivate", response_model=MemberResponse)
async def reactivate_member(
    member_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reactivate a suspended member"""
    # Check permissions
    if not _can_manage_members(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to reactivate members"
        )
    
    member = crud_member.reactivate_member(db, member_id, current_user["user_id"])
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    return member

@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(
    member_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete member"""
    # Check permissions
    if not _can_manage_members(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to delete members"
        )
    
    success = crud_member.delete_member(db, member_id, current_user["user_id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

@router.get("/{member_id}/activities", response_model=List[MemberActivityLogResponse])
async def get_member_activities(
    member_id: str,
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get member activity log"""
    # Check if user can view this member
    member = crud_member.get_member(db, member_id, current_user["user_id"])
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found or access denied"
        )
    
    activities = crud_member.get_member_activities(db, member_id, limit)
    return activities

# Membership Plan routes
@router.post("/plans/", response_model=MembershipPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_membership_plan(
    plan: MembershipPlanCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new membership plan"""
    # Check permissions
    if not _can_manage_membership_plans(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create membership plans"
        )
    
    plan.makerspace_id = _get_user_makerspace_id(current_user)
    db_plan = crud_member.create_membership_plan(db, plan)
    
    # Add member count
    response = MembershipPlanResponse.from_orm(db_plan)
    response.member_count = 0
    
    return response

@router.get("/plans/", response_model=List[MembershipPlanResponse])
async def get_membership_plans(
    active_only: bool = Query(True),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get membership plans"""
    makerspace_id = _get_user_makerspace_id(current_user)
    plans = crud_member.get_membership_plans(db, makerspace_id, active_only)
    
    # Add member counts
    response_plans = []
    for plan in plans:
        response = MembershipPlanResponse.from_orm(plan)
        response.member_count = len(plan.members) if plan.members else 0
        response_plans.append(response)
    
    return response_plans

@router.put("/plans/{plan_id}", response_model=MembershipPlanResponse)
async def update_membership_plan(
    plan_id: str,
    plan_update: MembershipPlanUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update membership plan"""
    # Check permissions
    if not _can_manage_membership_plans(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update membership plans"
        )
    
    plan = crud_member.update_membership_plan(db, plan_id, plan_update)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership plan not found"
        )
    
    # Add member count
    response = MembershipPlanResponse.from_orm(plan)
    response.member_count = len(plan.members) if plan.members else 0
    
    return response

@router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_membership_plan(
    plan_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete membership plan"""
    # Check permissions
    if not _can_manage_membership_plans(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to delete membership plans"
        )
    
    success = crud_member.delete_membership_plan(db, plan_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete membership plan - it may be in use by members"
        )

# Member Invite routes
@router.post("/invites/", response_model=MemberInviteResponse, status_code=status.HTTP_201_CREATED)
async def create_member_invite(
    invite: MemberInviteCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None
):
    """Send member invite"""
    # Check permissions
    if not _can_manage_members(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to send invites"
        )
    
    # Check if member already exists
    existing_member = crud_member.get_member_by_email(db, invite.email, invite.makerspace_id)
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Member with this email already exists"
        )
    
    invite.makerspace_id = _get_user_makerspace_id(current_user)
    invite.invited_by = current_user["user_id"]
    
    db_invite = crud_member.create_member_invite(db, invite)
    
    # Send invite email in background
    if background_tasks:
        background_tasks.add_task(
            send_member_invite_email,
            db_invite.email,
            db_invite.invite_token,
            db_invite.membership_plan.name if db_invite.membership_plan else "Basic",
            invite.invite_message
        )
    
    # Add membership plan name
    response = MemberInviteResponse.from_orm(db_invite)
    if db_invite.membership_plan:
        response.membership_plan_name = db_invite.membership_plan.name
    
    return response

@router.get("/invites/", response_model=List[MemberInviteResponse])
async def get_member_invites(
    status_filter: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get member invites"""
    # Check permissions
    if not _can_view_members(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view invites"
        )
    
    makerspace_id = _get_user_makerspace_id(current_user)
    invites = crud_member.get_member_invites(db, makerspace_id, status_filter)
    
    # Add membership plan names
    response_invites = []
    for invite in invites:
        response = MemberInviteResponse.from_orm(invite)
        if invite.membership_plan:
            response.membership_plan_name = invite.membership_plan.name
        response_invites.append(response)
    
    return response_invites

@router.post("/invites/{invite_id}/resend")
async def resend_member_invite(
    invite_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None
):
    """Resend member invite"""
    # Check permissions
    if not _can_manage_members(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to resend invites"
        )
    
    invite = crud_member.get_member_invite(db, invite_id)
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invite not found"
        )
    
    # Send invite email in background
    if background_tasks:
        background_tasks.add_task(
            send_member_invite_email,
            invite.email,
            invite.invite_token,
            invite.membership_plan.name if invite.membership_plan else "Basic",
            invite.invite_message
        )
    
    return {"message": "Invite resent successfully"}

@router.delete("/invites/{invite_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_member_invite(
    invite_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel member invite"""
    # Check permissions
    if not _can_manage_members(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to cancel invites"
        )
    
    success = crud_member.cancel_member_invite(db, invite_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invite not found"
        )

# Public invite acceptance route (no auth required)
@router.post("/invites/{invite_token}/accept", response_model=MemberResponse)
async def accept_member_invite(
    invite_token: str,
    keycloak_user_id: str,
    db: Session = Depends(get_db)
):
    """Accept member invite (public endpoint)"""
    member = crud_member.accept_member_invite(db, invite_token, keycloak_user_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired invite token"
        )
    
    return member

# Statistics routes
@router.get("/analytics/statistics", response_model=MemberStatistics)
async def get_member_statistics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get member statistics"""
    # Check permissions
    if not _can_view_members(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view statistics"
        )
    
    makerspace_id = _get_user_makerspace_id(current_user)
    stats = crud_member.get_member_statistics(db, makerspace_id)
    
    return MemberStatistics(**stats)

# Bulk operations
@router.post("/bulk-operations")
async def bulk_member_operations(
    operation: BulkMemberOperation,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Perform bulk operations on members"""
    # Check permissions
    if not _can_manage_members(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions for bulk operations"
        )
    
    results = []
    for member_id in operation.member_ids:
        try:
            if operation.operation == "suspend":
                suspend_data = MemberSuspend(
                    reason=operation.data.get("reason", "Bulk suspension"),
                    suspended_by=current_user["user_id"]
                )
                result = crud_member.suspend_member(db, member_id, suspend_data)
            elif operation.operation == "reactivate":
                result = crud_member.reactivate_member(db, member_id, current_user["user_id"])
            else:
                results.append({"member_id": member_id, "success": False, "error": "Unknown operation"})
                continue
            
            results.append({"member_id": member_id, "success": True})
        except Exception as e:
            results.append({"member_id": member_id, "success": False, "error": str(e)})
    
    return {"results": results}

# Helper functions
def _can_view_members(user: dict) -> bool:
    """Check if user can view members"""
    return user.get("role") in ["super_admin", "makerspace_admin", "admin"]

def _can_manage_members(user: dict) -> bool:
    """Check if user can manage members"""
    return user.get("role") in ["super_admin", "makerspace_admin"]

def _can_manage_membership_plans(user: dict) -> bool:
    """Check if user can manage membership plans"""
    return user.get("role") in ["super_admin", "makerspace_admin"]

def _get_user_makerspace_id(user: dict) -> str:
    """Get user's makerspace ID"""
    # This should be implemented based on your user model
    return user.get("makerspace_id", "default_makerspace")

# Background task functions
async def send_welcome_email(email: str, first_name: str, plan_name: str):
    """Send welcome email to new member"""
    # Implementation would send actual email
    print(f"Sending welcome email to {email} ({first_name}) for plan {plan_name}")

async def send_member_invite_email(email: str, invite_token: str, plan_name: str, message: str = None):
    """Send invite email to prospective member"""
    # Implementation would send actual email with invite link
    print(f"Sending invite email to {email} with token {invite_token}")
