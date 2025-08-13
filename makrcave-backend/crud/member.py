from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc, asc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import secrets

from ..models.member import (
    Member, MembershipPlan, MemberInvite, MemberActivityLog, 
    MembershipTransaction, MemberRole, MemberStatus, InviteStatus
)
from ..schemas.member import (
    MemberCreate, MemberUpdate, MemberSuspend, MemberFilter, MemberSort,
    MembershipPlanCreate, MembershipPlanUpdate,
    MemberInviteCreate, MemberInviteUpdate,
    MemberActivityLogCreate,
    MembershipTransactionCreate, MembershipTransactionUpdate
)

# Member CRUD operations
def get_member(db: Session, member_id: str, user_id: str = None) -> Optional[Member]:
    """Get a member by ID"""
    query = db.query(Member).options(joinedload(Member.membership_plan))
    
    if user_id:
        # Check if user has access to this member
        member = query.filter(Member.id == member_id).first()
        if member and not _has_member_access(db, member, user_id):
            return None
        return member
    
    return query.filter(Member.id == member_id).first()

def get_member_by_email(db: Session, email: str, makerspace_id: str = None) -> Optional[Member]:
    """Get a member by email"""
    query = db.query(Member).options(joinedload(Member.membership_plan))
    
    if makerspace_id:
        query = query.filter(Member.makerspace_id == makerspace_id)
    
    return query.filter(Member.email == email).first()

def get_member_by_keycloak_id(db: Session, keycloak_user_id: str) -> Optional[Member]:
    """Get a member by Keycloak user ID"""
    return db.query(Member).options(joinedload(Member.membership_plan)).filter(
        Member.keycloak_user_id == keycloak_user_id
    ).first()

def get_members(
    db: Session, 
    user_id: str,
    skip: int = 0, 
    limit: int = 100, 
    filters: Optional[MemberFilter] = None,
    sort: Optional[MemberSort] = None
) -> List[Member]:
    """Get members with filtering and pagination"""
    query = db.query(Member).options(joinedload(Member.membership_plan))
    
    # Apply user access control
    user_makerspace_id = _get_user_makerspace_id(db, user_id)
    if user_makerspace_id:
        query = query.filter(Member.makerspace_id == user_makerspace_id)
    
    # Apply filters
    if filters:
        if filters.status:
            query = query.filter(Member.status.in_(filters.status))
        
        if filters.role:
            query = query.filter(Member.role.in_(filters.role))
        
        if filters.membership_plan_id:
            query = query.filter(Member.membership_plan_id == filters.membership_plan_id)
        
        if filters.makerspace_id:
            query = query.filter(Member.makerspace_id == filters.makerspace_id)
        
        if filters.is_active is not None:
            query = query.filter(Member.is_active == filters.is_active)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(or_(
                Member.first_name.ilike(search_term),
                Member.last_name.ilike(search_term),
                Member.email.ilike(search_term),
                Member.skills.contains([filters.search])  # JSON contains
            ))
    
    # Apply sorting
    if sort:
        sort_column = getattr(Member, sort.field, Member.created_at)
        if sort.direction == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(Member.created_at))
    
    return query.offset(skip).limit(limit).all()

def create_member(db: Session, member: MemberCreate, created_by: str) -> Member:
    """Create a new member"""
    # Set start and end dates if not provided
    start_date = member.start_date or datetime.utcnow()
    
    # Get membership plan to calculate end date
    plan = get_membership_plan(db, member.membership_plan_id)
    if not plan:
        raise ValueError("Invalid membership plan")
    
    end_date = member.end_date or (start_date + timedelta(days=plan.duration_days))
    
    db_member = Member(
        keycloak_user_id=member.keycloak_user_id,
        email=member.email,
        first_name=member.first_name,
        last_name=member.last_name,
        phone=member.phone,
        role=member.role,
        membership_plan_id=member.membership_plan_id,
        start_date=start_date,
        end_date=end_date,
        skills=member.skills,
        bio=member.bio,
        makerspace_id=member.makerspace_id,
        status=MemberStatus.ACTIVE,
        is_active=True
    )
    
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    
    # Log activity
    log_member_activity(
        db, db_member.id, "member_created", 
        f"Member account created by {created_by}"
    )
    
    return db_member

def update_member(db: Session, member_id: str, member_update: MemberUpdate, updated_by: str) -> Optional[Member]:
    """Update a member"""
    db_member = get_member(db, member_id)
    if not db_member:
        return None
    
    update_data = member_update.dict(exclude_unset=True)
    
    # If changing membership plan, update end date
    if "membership_plan_id" in update_data:
        plan = get_membership_plan(db, update_data["membership_plan_id"])
        if plan:
            # Extend from current end date or now, whichever is later
            start_from = max(datetime.utcnow(), db_member.end_date)
            update_data["end_date"] = start_from + timedelta(days=plan.duration_days)
    
    for field, value in update_data.items():
        setattr(db_member, field, value)
    
    db_member.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_member)
    
    # Log activity
    log_member_activity(
        db, member_id, "member_updated", 
        f"Member information updated by {updated_by}"
    )
    
    return db_member

def suspend_member(db: Session, member_id: str, suspend_data: MemberSuspend) -> Optional[Member]:
    """Suspend a member"""
    db_member = get_member(db, member_id)
    if not db_member:
        return None
    
    db_member.status = MemberStatus.SUSPENDED
    db_member.is_active = False
    db_member.suspension_reason = suspend_data.reason
    db_member.suspended_by = suspend_data.suspended_by
    db_member.suspended_at = datetime.utcnow()
    db_member.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_member)
    
    # Log activity
    log_member_activity(
        db, member_id, "member_suspended", 
        f"Member suspended: {suspend_data.reason}"
    )
    
    return db_member

def reactivate_member(db: Session, member_id: str, reactivated_by: str) -> Optional[Member]:
    """Reactivate a suspended member"""
    db_member = get_member(db, member_id)
    if not db_member:
        return None
    
    # Check if membership is still valid
    if db_member.end_date > datetime.utcnow():
        db_member.status = MemberStatus.ACTIVE
        db_member.is_active = True
    else:
        db_member.status = MemberStatus.EXPIRED
        db_member.is_active = False
    
    db_member.suspension_reason = None
    db_member.suspended_by = None
    db_member.suspended_at = None
    db_member.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_member)
    
    # Log activity
    log_member_activity(
        db, member_id, "member_reactivated", 
        f"Member reactivated by {reactivated_by}"
    )
    
    return db_member

def delete_member(db: Session, member_id: str, deleted_by: str) -> bool:
    """Delete a member (soft delete by deactivating)"""
    db_member = get_member(db, member_id)
    if not db_member:
        return False
    
    # Log activity before deletion
    log_member_activity(
        db, member_id, "member_deleted", 
        f"Member account deleted by {deleted_by}"
    )
    
    # For safety, we don't actually delete but deactivate
    db_member.is_active = False
    db_member.status = MemberStatus.SUSPENDED
    db_member.suspension_reason = "Account deleted"
    db_member.suspended_by = deleted_by
    db_member.suspended_at = datetime.utcnow()
    
    db.commit()
    return True

# Membership Plan CRUD operations
def get_membership_plan(db: Session, plan_id: str) -> Optional[MembershipPlan]:
    """Get a membership plan by ID"""
    return db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()

def get_membership_plans(db: Session, makerspace_id: str, active_only: bool = True) -> List[MembershipPlan]:
    """Get membership plans for a makerspace"""
    query = db.query(MembershipPlan).filter(MembershipPlan.makerspace_id == makerspace_id)
    
    if active_only:
        query = query.filter(MembershipPlan.is_active == True)
    
    return query.order_by(MembershipPlan.price).all()

def create_membership_plan(db: Session, plan: MembershipPlanCreate) -> MembershipPlan:
    """Create a new membership plan"""
    db_plan = MembershipPlan(**plan.dict())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def update_membership_plan(db: Session, plan_id: str, plan_update: MembershipPlanUpdate) -> Optional[MembershipPlan]:
    """Update a membership plan"""
    db_plan = get_membership_plan(db, plan_id)
    if not db_plan:
        return None
    
    update_data = plan_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_plan, field, value)
    
    db_plan.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_plan)
    return db_plan

def delete_membership_plan(db: Session, plan_id: str) -> bool:
    """Delete a membership plan (only if no members are using it)"""
    db_plan = get_membership_plan(db, plan_id)
    if not db_plan:
        return False
    
    # Check if any members are using this plan
    member_count = db.query(Member).filter(Member.membership_plan_id == plan_id).count()
    if member_count > 0:
        return False  # Cannot delete plan with active members
    
    db.delete(db_plan)
    db.commit()
    return True

# Member Invite CRUD operations
def get_member_invite(db: Session, invite_id: str) -> Optional[MemberInvite]:
    """Get a member invite by ID"""
    return db.query(MemberInvite).options(joinedload(MemberInvite.membership_plan)).filter(
        MemberInvite.id == invite_id
    ).first()

def get_member_invite_by_token(db: Session, invite_token: str) -> Optional[MemberInvite]:
    """Get a member invite by token"""
    return db.query(MemberInvite).options(joinedload(MemberInvite.membership_plan)).filter(
        MemberInvite.invite_token == invite_token
    ).first()

def get_member_invites(db: Session, makerspace_id: str, status: Optional[InviteStatus] = None) -> List[MemberInvite]:
    """Get member invites for a makerspace"""
    query = db.query(MemberInvite).options(joinedload(MemberInvite.membership_plan)).filter(
        MemberInvite.makerspace_id == makerspace_id
    )
    
    if status:
        query = query.filter(MemberInvite.status == status)
    
    return query.order_by(desc(MemberInvite.created_at)).all()

def create_member_invite(db: Session, invite: MemberInviteCreate) -> MemberInvite:
    """Create a new member invite"""
    # Generate unique invite token
    invite_token = secrets.token_urlsafe(32)
    
    # Set expiry date (7 days from now)
    expires_at = datetime.utcnow() + timedelta(days=7)
    
    db_invite = MemberInvite(
        email=invite.email,
        role=invite.role,
        membership_plan_id=invite.membership_plan_id,
        invited_by=invite.invited_by,
        invite_token=invite_token,
        invite_message=invite.invite_message,
        expires_at=expires_at,
        makerspace_id=invite.makerspace_id
    )
    
    db.add(db_invite)
    db.commit()
    db.refresh(db_invite)
    return db_invite

def update_member_invite(db: Session, invite_id: str, invite_update: MemberInviteUpdate) -> Optional[MemberInvite]:
    """Update a member invite"""
    db_invite = get_member_invite(db, invite_id)
    if not db_invite:
        return None
    
    update_data = invite_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_invite, field, value)
    
    db_invite.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_invite)
    return db_invite

def accept_member_invite(db: Session, invite_token: str, keycloak_user_id: str) -> Optional[Member]:
    """Accept a member invite and create member account"""
    db_invite = get_member_invite_by_token(db, invite_token)
    if not db_invite:
        return None
    
    # Check if invite is still valid
    if db_invite.status != InviteStatus.PENDING or db_invite.expires_at < datetime.utcnow():
        return None
    
    # Check if member already exists
    existing_member = get_member_by_email(db, db_invite.email, db_invite.makerspace_id)
    if existing_member:
        return None
    
    # Create member from invite
    member_data = MemberCreate(
        keycloak_user_id=keycloak_user_id,
        email=db_invite.email,
        first_name="",  # Will be updated from Keycloak
        last_name="",   # Will be updated from Keycloak
        role=db_invite.role,
        membership_plan_id=db_invite.membership_plan_id,
        makerspace_id=db_invite.makerspace_id
    )
    
    new_member = create_member(db, member_data, "invite_acceptance")
    
    # Update invite status
    db_invite.status = InviteStatus.ACCEPTED
    db_invite.accepted_at = datetime.utcnow()
    db_invite.updated_at = datetime.utcnow()
    db.commit()
    
    return new_member

def cancel_member_invite(db: Session, invite_id: str) -> bool:
    """Cancel a member invite"""
    db_invite = get_member_invite(db, invite_id)
    if not db_invite:
        return False
    
    db_invite.status = InviteStatus.CANCELLED
    db_invite.updated_at = datetime.utcnow()
    db.commit()
    return True

# Activity Log operations
def log_member_activity(
    db: Session, 
    member_id: str, 
    activity_type: str, 
    description: str = None,
    metadata: Dict[str, Any] = None,
    ip_address: str = None,
    user_agent: str = None,
    session_id: str = None
):
    """Log member activity"""
    activity = MemberActivityLog(
        member_id=member_id,
        activity_type=activity_type,
        description=description,
        metadata=metadata or {},
        ip_address=ip_address,
        user_agent=user_agent,
        session_id=session_id
    )
    
    db.add(activity)
    db.commit()

def get_member_activities(db: Session, member_id: str, limit: int = 50) -> List[MemberActivityLog]:
    """Get member activities"""
    return db.query(MemberActivityLog).filter(
        MemberActivityLog.member_id == member_id
    ).order_by(desc(MemberActivityLog.created_at)).limit(limit).all()

# Statistics and analytics
def get_member_statistics(db: Session, makerspace_id: str) -> Dict[str, Any]:
    """Get member statistics for a makerspace"""
    total_members = db.query(Member).filter(Member.makerspace_id == makerspace_id).count()
    
    active_members = db.query(Member).filter(
        and_(Member.makerspace_id == makerspace_id, Member.status == MemberStatus.ACTIVE)
    ).count()
    
    expired_members = db.query(Member).filter(
        and_(Member.makerspace_id == makerspace_id, Member.status == MemberStatus.EXPIRED)
    ).count()
    
    pending_members = db.query(Member).filter(
        and_(Member.makerspace_id == makerspace_id, Member.status == MemberStatus.PENDING)
    ).count()
    
    suspended_members = db.query(Member).filter(
        and_(Member.makerspace_id == makerspace_id, Member.status == MemberStatus.SUSPENDED)
    ).count()
    
    # Members by role
    role_stats = db.query(Member.role, func.count(Member.id)).filter(
        Member.makerspace_id == makerspace_id
    ).group_by(Member.role).all()
    
    members_by_role = {role: count for role, count in role_stats}
    
    # Members by plan
    plan_stats = db.query(MembershipPlan.name, func.count(Member.id)).join(
        Member, Member.membership_plan_id == MembershipPlan.id
    ).filter(Member.makerspace_id == makerspace_id).group_by(MembershipPlan.name).all()
    
    members_by_plan = {plan: count for plan, count in plan_stats}
    
    # New members this month
    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_members_this_month = db.query(Member).filter(
        and_(
            Member.makerspace_id == makerspace_id,
            Member.created_at >= start_of_month
        )
    ).count()
    
    # Expiring soon (next 30 days)
    expiring_soon_date = datetime.utcnow() + timedelta(days=30)
    expiring_soon = db.query(Member).filter(
        and_(
            Member.makerspace_id == makerspace_id,
            Member.status == MemberStatus.ACTIVE,
            Member.end_date <= expiring_soon_date,
            Member.end_date > datetime.utcnow()
        )
    ).count()
    
    return {
        "total_members": total_members,
        "active_members": active_members,
        "expired_members": expired_members,
        "pending_members": pending_members,
        "suspended_members": suspended_members,
        "members_by_role": members_by_role,
        "members_by_plan": members_by_plan,
        "new_members_this_month": new_members_this_month,
        "expiring_soon": expiring_soon
    }

# Helper functions
def _has_member_access(db: Session, member: Member, user_id: str) -> bool:
    """Check if user has access to view/edit member"""
    # For now, just check if they're in the same makerspace
    # This should be expanded based on actual user model
    return True  # Placeholder

def _get_user_makerspace_id(db: Session, user_id: str) -> Optional[str]:
    """Get the makerspace ID for a user"""
    # This should be implemented based on your user model
    return None  # Placeholder

def update_member_login(db: Session, member_id: str, ip_address: str = None, user_agent: str = None):
    """Update member login information"""
    db_member = get_member(db, member_id)
    if db_member:
        db_member.last_login = datetime.utcnow()
        db_member.login_count += 1
        db.commit()
        
        # Log activity
        log_member_activity(
            db, member_id, "login", "Member logged in",
            metadata={"ip_address": ip_address, "user_agent": user_agent}
        )

def check_expired_memberships(db: Session) -> List[Member]:
    """Check and update expired memberships"""
    now = datetime.utcnow()
    expired_members = db.query(Member).filter(
        and_(
            Member.end_date < now,
            Member.status == MemberStatus.ACTIVE
        )
    ).all()
    
    for member in expired_members:
        member.status = MemberStatus.EXPIRED
        member.is_active = False
        member.updated_at = now
        
        # Log activity
        log_member_activity(
            db, member.id, "membership_expired", 
            "Membership has expired"
        )
    
    if expired_members:
        db.commit()
    
    return expired_members
