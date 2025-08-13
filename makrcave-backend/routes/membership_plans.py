from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

from ..database import get_db
from ..dependencies import get_current_user, get_current_admin_user
from ..models.user import User
from ..models.membership_plans import MembershipPlan, PlanType, BillingCycle, AccessType
from ..models.member import Member

router = APIRouter(prefix="/api/v1/membership-plans", tags=["Membership Plans"])

# Pydantic models for requests/responses
from pydantic import BaseModel, Field
from typing import Optional

class MembershipPlanCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    plan_type: PlanType = PlanType.BASIC
    price: float = Field(ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    billing_cycle: BillingCycle = BillingCycle.MONTHLY
    setup_fee: float = Field(default=0.0, ge=0)
    access_type: AccessType = AccessType.UNLIMITED
    max_hours_per_cycle: Optional[int] = Field(None, ge=1)
    allowed_time_slots: Optional[Dict[str, Any]] = None
    included_equipment: Optional[List[str]] = None
    equipment_hourly_rates: Optional[Dict[str, float]] = None
    skill_requirements: Optional[List[str]] = None
    features: Optional[List[str]] = None
    guest_passes_per_cycle: int = Field(default=0, ge=0)
    storage_space_gb: float = Field(default=0.0, ge=0)
    project_limit: Optional[int] = Field(None, ge=1)
    priority_booking: bool = False
    max_booking_advance_days: int = Field(default=30, ge=1)
    max_booking_duration_hours: int = Field(default=8, ge=1)
    cancellation_hours_before: int = Field(default=24, ge=0)
    is_public: bool = True
    requires_approval: bool = False
    auto_renew: bool = True
    grace_period_days: int = Field(default=3, ge=0)
    max_members: Optional[int] = Field(None, ge=1)
    trial_period_days: int = Field(default=0, ge=0)
    trial_features: Optional[List[str]] = None
    discount_percent: float = Field(default=0.0, ge=0, le=100)
    discount_start_date: Optional[datetime] = None
    discount_end_date: Optional[datetime] = None
    promo_code: Optional[str] = Field(None, max_length=50)
    display_order: int = Field(default=0, ge=0)
    highlight_plan: bool = False
    badge_text: Optional[str] = Field(None, max_length=50)
    custom_color: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')
    terms_text: Optional[str] = None
    contract_length_months: Optional[int] = Field(None, ge=1)
    early_termination_fee: float = Field(default=0.0, ge=0)

class MembershipPlanUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    plan_type: Optional[PlanType] = None
    price: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    billing_cycle: Optional[BillingCycle] = None
    setup_fee: Optional[float] = Field(None, ge=0)
    access_type: Optional[AccessType] = None
    max_hours_per_cycle: Optional[int] = Field(None, ge=1)
    allowed_time_slots: Optional[Dict[str, Any]] = None
    included_equipment: Optional[List[str]] = None
    equipment_hourly_rates: Optional[Dict[str, float]] = None
    skill_requirements: Optional[List[str]] = None
    features: Optional[List[str]] = None
    guest_passes_per_cycle: Optional[int] = Field(None, ge=0)
    storage_space_gb: Optional[float] = Field(None, ge=0)
    project_limit: Optional[int] = Field(None, ge=1)
    priority_booking: Optional[bool] = None
    max_booking_advance_days: Optional[int] = Field(None, ge=1)
    max_booking_duration_hours: Optional[int] = Field(None, ge=1)
    cancellation_hours_before: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    is_public: Optional[bool] = None
    requires_approval: Optional[bool] = None
    auto_renew: Optional[bool] = None
    grace_period_days: Optional[int] = Field(None, ge=0)
    max_members: Optional[int] = Field(None, ge=1)
    trial_period_days: Optional[int] = Field(None, ge=0)
    trial_features: Optional[List[str]] = None
    discount_percent: Optional[float] = Field(None, ge=0, le=100)
    discount_start_date: Optional[datetime] = None
    discount_end_date: Optional[datetime] = None
    promo_code: Optional[str] = Field(None, max_length=50)
    display_order: Optional[int] = Field(None, ge=0)
    highlight_plan: Optional[bool] = None
    badge_text: Optional[str] = Field(None, max_length=50)
    custom_color: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')
    terms_text: Optional[str] = None
    contract_length_months: Optional[int] = Field(None, ge=1)
    early_termination_fee: Optional[float] = Field(None, ge=0)

class MembershipPlanResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    plan_type: str
    price: float
    currency: str
    billing_cycle: str
    setup_fee: float
    access_type: str
    features: List[str]
    is_active: bool
    is_public: bool
    current_members: int
    max_members: Optional[int]
    highlight_plan: bool
    badge_text: Optional[str]
    display_order: int
    effective_price: float
    created_at: str
    updated_at: str

# Routes

@router.get("/", response_model=List[MembershipPlanResponse])
async def get_membership_plans(
    include_inactive: bool = Query(False, description="Include inactive plans"),
    public_only: bool = Query(False, description="Only return public plans"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all membership plans for the current makerspace"""
    
    # Get makerspace_id from user context
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if not makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No makerspace associated with current user"
        )
    
    query = db.query(MembershipPlan).filter(MembershipPlan.makerspace_id == makerspace_id)
    
    if not include_inactive:
        query = query.filter(MembershipPlan.is_active == True)
    
    if public_only:
        query = query.filter(MembershipPlan.is_public == True)
    
    plans = query.order_by(MembershipPlan.display_order, MembershipPlan.price).all()
    
    # Calculate effective prices and format response
    response_plans = []
    for plan in plans:
        plan_dict = plan.to_dict()
        plan_dict['effective_price'] = plan.get_effective_price()
        plan_dict['features'] = plan.get_display_features()
        response_plans.append(plan_dict)
    
    return response_plans

@router.get("/{plan_id}", response_model=Dict[str, Any])
async def get_membership_plan(
    plan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific membership plan details"""
    
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership plan not found"
        )
    
    # Check access permissions
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if str(plan.makerspace_id) != str(makerspace_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this membership plan"
        )
    
    plan_dict = plan.to_dict()
    plan_dict['effective_price'] = plan.get_effective_price()
    plan_dict['features'] = plan.get_display_features()
    
    return plan_dict

@router.post("/", response_model=Dict[str, Any])
async def create_membership_plan(
    plan_data: MembershipPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new membership plan"""
    
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if not makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No makerspace associated with current user"
        )
    
    # Check if plan name already exists in this makerspace
    existing_plan = db.query(MembershipPlan).filter(
        and_(
            MembershipPlan.makerspace_id == makerspace_id,
            MembershipPlan.name == plan_data.name
        )
    ).first()
    
    if existing_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A membership plan with this name already exists"
        )
    
    # Validate access type and hours
    if plan_data.access_type == AccessType.TIME_LIMITED and not plan_data.max_hours_per_cycle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="max_hours_per_cycle is required for time_limited access type"
        )
    
    # Create plan
    plan = MembershipPlan(
        makerspace_id=makerspace_id,
        created_by=current_user.id,
        **plan_data.dict()
    )
    
    db.add(plan)
    db.commit()
    db.refresh(plan)
    
    plan_dict = plan.to_dict()
    plan_dict['effective_price'] = plan.get_effective_price()
    plan_dict['features'] = plan.get_display_features()
    
    return plan_dict

@router.put("/{plan_id}", response_model=Dict[str, Any])
async def update_membership_plan(
    plan_id: str,
    plan_data: MembershipPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update an existing membership plan"""
    
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership plan not found"
        )
    
    # Check access permissions
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if str(plan.makerspace_id) != str(makerspace_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this membership plan"
        )
    
    # Check if new name conflicts (if name is being changed)
    if plan_data.name and plan_data.name != plan.name:
        existing_plan = db.query(MembershipPlan).filter(
            and_(
                MembershipPlan.makerspace_id == makerspace_id,
                MembershipPlan.name == plan_data.name,
                MembershipPlan.id != plan_id
            )
        ).first()
        
        if existing_plan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A membership plan with this name already exists"
            )
    
    # Validate access type and hours
    access_type = plan_data.access_type or plan.access_type
    max_hours = plan_data.max_hours_per_cycle if plan_data.max_hours_per_cycle is not None else plan.max_hours_per_cycle
    
    if access_type == AccessType.TIME_LIMITED and not max_hours:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="max_hours_per_cycle is required for time_limited access type"
        )
    
    # Update plan fields
    update_data = plan_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)
    
    plan.updated_by = current_user.id
    plan.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(plan)
    
    plan_dict = plan.to_dict()
    plan_dict['effective_price'] = plan.get_effective_price()
    plan_dict['features'] = plan.get_display_features()
    
    return plan_dict

@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_membership_plan(
    plan_id: str,
    force: bool = Query(False, description="Force delete even if members are assigned"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a membership plan"""
    
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership plan not found"
        )
    
    # Check access permissions
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if str(plan.makerspace_id) != str(makerspace_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this membership plan"
        )
    
    # Check if plan has active members
    member_count = db.query(Member).filter(Member.membership_plan_id == plan_id).count()
    if member_count > 0 and not force:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete plan with {member_count} active members. Use force=true to override."
        )
    
    # If forcing delete, update members to remove plan assignment
    if force and member_count > 0:
        db.query(Member).filter(Member.membership_plan_id == plan_id).update(
            {Member.membership_plan_id: None}
        )
    
    db.delete(plan)
    db.commit()
    
    return None

@router.post("/{plan_id}/duplicate", response_model=Dict[str, Any])
async def duplicate_membership_plan(
    plan_id: str,
    new_name: str = Query(..., description="Name for the duplicated plan"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Duplicate an existing membership plan"""
    
    original_plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()
    if not original_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership plan not found"
        )
    
    # Check access permissions
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if str(original_plan.makerspace_id) != str(makerspace_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this membership plan"
        )
    
    # Check if new name conflicts
    existing_plan = db.query(MembershipPlan).filter(
        and_(
            MembershipPlan.makerspace_id == makerspace_id,
            MembershipPlan.name == new_name
        )
    ).first()
    
    if existing_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A membership plan with this name already exists"
        )
    
    # Create duplicate plan
    plan_data = original_plan.to_dict()
    
    # Remove fields that shouldn't be duplicated
    exclude_fields = ['id', 'current_members', 'created_at', 'updated_at', 'created_by', 'updated_by']
    for field in exclude_fields:
        plan_data.pop(field, None)
    
    # Set new name and reset some fields
    plan_data['name'] = new_name
    plan_data['current_members'] = 0
    plan_data['is_active'] = True
    
    new_plan = MembershipPlan(
        **plan_data,
        created_by=current_user.id,
        makerspace_id=makerspace_id
    )
    
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    
    new_plan_dict = new_plan.to_dict()
    new_plan_dict['effective_price'] = new_plan.get_effective_price()
    new_plan_dict['features'] = new_plan.get_display_features()
    
    return new_plan_dict

@router.post("/initialize-defaults", response_model=List[Dict[str, Any]])
async def initialize_default_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Initialize default membership plans for a makerspace"""
    
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if not makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No makerspace associated with current user"
        )
    
    # Check if plans already exist
    existing_count = db.query(MembershipPlan).filter(
        MembershipPlan.makerspace_id == makerspace_id
    ).count()
    
    if existing_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Makerspace already has {existing_count} membership plans"
        )
    
    # Create default plans
    default_plans_data = MembershipPlan.get_default_plans(str(makerspace_id))
    created_plans = []
    
    for plan_data in default_plans_data:
        plan = MembershipPlan(
            **plan_data,
            created_by=current_user.id
        )
        db.add(plan)
        db.flush()  # Flush to get ID
        
        plan_dict = plan.to_dict()
        plan_dict['effective_price'] = plan.get_effective_price()
        plan_dict['features'] = plan.get_display_features()
        created_plans.append(plan_dict)
    
    db.commit()
    
    return created_plans

@router.get("/{plan_id}/members", response_model=List[Dict[str, Any]])
async def get_plan_members(
    plan_id: str,
    active_only: bool = Query(True, description="Only return active members"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get members assigned to a specific membership plan"""
    
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership plan not found"
        )
    
    # Check access permissions
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if str(plan.makerspace_id) != str(makerspace_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this membership plan"
        )
    
    query = db.query(Member).filter(Member.membership_plan_id == plan_id)
    
    if active_only:
        query = query.filter(Member.is_active == True)
    
    members = query.all()
    
    return [member.to_dict() for member in members]
