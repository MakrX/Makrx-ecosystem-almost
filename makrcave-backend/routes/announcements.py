from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from uuid import UUID

from ..database import get_db
from ..dependencies import get_current_user, get_current_admin_user
from ..models.user import User
from ..models.announcements import (
    Announcement, AnnouncementAcknowledgment, AnnouncementView,
    AnnouncementType, Priority, TargetAudience
)
from ..models.member import Member

router = APIRouter(prefix="/api/v1/announcements", tags=["Announcements"])

# Pydantic models for requests/responses
from pydantic import BaseModel, Field
from typing import Optional

class AnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    summary: Optional[str] = Field(None, max_length=500)
    announcement_type: AnnouncementType = AnnouncementType.GENERAL
    priority: Priority = Priority.NORMAL
    target_audience: TargetAudience = TargetAudience.ALL_MEMBERS
    target_membership_plans: Optional[List[str]] = None
    target_skills: Optional[List[str]] = None
    target_members: Optional[List[str]] = None
    publish_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_published: bool = False
    is_pinned: bool = False
    show_on_dashboard: bool = True
    show_in_email: bool = False
    show_as_popup: bool = False
    require_acknowledgment: bool = False
    image_url: Optional[str] = Field(None, max_length=500)
    attachments: Optional[List[str]] = None
    action_button_text: Optional[str] = Field(None, max_length=100)
    action_button_url: Optional[str] = Field(None, max_length=500)
    background_color: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')
    text_color: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')
    icon: Optional[str] = Field(None, max_length=50)
    event_date: Optional[datetime] = None
    event_location: Optional[str] = Field(None, max_length=255)
    event_capacity: Optional[int] = Field(None, ge=1)
    registration_required: bool = False
    registration_url: Optional[str] = Field(None, max_length=500)
    maintenance_start: Optional[datetime] = None
    maintenance_end: Optional[datetime] = None
    affected_equipment: Optional[List[str]] = None

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    summary: Optional[str] = Field(None, max_length=500)
    announcement_type: Optional[AnnouncementType] = None
    priority: Optional[Priority] = None
    target_audience: Optional[TargetAudience] = None
    target_membership_plans: Optional[List[str]] = None
    target_skills: Optional[List[str]] = None
    target_members: Optional[List[str]] = None
    publish_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_published: Optional[bool] = None
    is_pinned: Optional[bool] = None
    show_on_dashboard: Optional[bool] = None
    show_in_email: Optional[bool] = None
    show_as_popup: Optional[bool] = None
    require_acknowledgment: Optional[bool] = None
    image_url: Optional[str] = Field(None, max_length=500)
    attachments: Optional[List[str]] = None
    action_button_text: Optional[str] = Field(None, max_length=100)
    action_button_url: Optional[str] = Field(None, max_length=500)
    background_color: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')
    text_color: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')
    icon: Optional[str] = Field(None, max_length=50)
    event_date: Optional[datetime] = None
    event_location: Optional[str] = Field(None, max_length=255)
    event_capacity: Optional[int] = Field(None, ge=1)
    registration_required: Optional[bool] = None
    registration_url: Optional[str] = Field(None, max_length=500)
    maintenance_start: Optional[datetime] = None
    maintenance_end: Optional[datetime] = None
    affected_equipment: Optional[List[str]] = None

class AnnouncementResponse(BaseModel):
    id: str
    title: str
    content: str
    summary: Optional[str]
    announcement_type: str
    priority: str
    target_audience: str
    is_published: bool
    is_pinned: bool
    show_on_dashboard: bool
    require_acknowledgment: bool
    view_count: int
    acknowledgment_count: int
    click_count: int
    created_at: str
    updated_at: str
    created_by: str
    is_active: bool
    type_icon: str
    priority_color: str

class AcknowledgmentRequest(BaseModel):
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

# Routes

@router.get("/", response_model=List[AnnouncementResponse])
async def get_announcements(
    active_only: bool = Query(True, description="Only return active announcements"),
    published_only: bool = Query(True, description="Only return published announcements"),
    announcement_type: Optional[AnnouncementType] = Query(None, description="Filter by announcement type"),
    priority: Optional[Priority] = Query(None, description="Filter by priority"),
    dashboard_only: bool = Query(False, description="Only return announcements shown on dashboard"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of announcements to return"),
    offset: int = Query(0, ge=0, description="Number of announcements to skip"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get announcements for the current makerspace"""
    
    # Get makerspace_id from user context
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if not makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No makerspace associated with current user"
        )
    
    query = db.query(Announcement).filter(Announcement.makerspace_id == makerspace_id)
    
    if published_only:
        query = query.filter(Announcement.is_published == True)
    
    if announcement_type:
        query = query.filter(Announcement.announcement_type == announcement_type)
    
    if priority:
        query = query.filter(Announcement.priority == priority)
    
    if dashboard_only:
        query = query.filter(Announcement.show_on_dashboard == True)
    
    # Apply active filter if requested
    if active_only:
        current_time = datetime.utcnow()
        query = query.filter(
            and_(
                or_(Announcement.publish_at.is_(None), Announcement.publish_at <= current_time),
                or_(Announcement.expires_at.is_(None), Announcement.expires_at > current_time)
            )
        )
    
    # Order by pinned first, then by created date (newest first)
    query = query.order_by(desc(Announcement.is_pinned), desc(Announcement.created_at))
    
    # Apply pagination
    announcements = query.offset(offset).limit(limit).all()
    
    # Format response with additional computed fields
    response_announcements = []
    for announcement in announcements:
        announcement_dict = announcement.to_dict()
        announcement_dict['is_active'] = announcement.is_active()
        announcement_dict['type_icon'] = announcement.get_type_icon()
        announcement_dict['priority_color'] = announcement.get_priority_color()
        response_announcements.append(announcement_dict)
    
    return response_announcements

@router.get("/member", response_model=List[AnnouncementResponse])
async def get_member_announcements(
    include_acknowledged: bool = Query(False, description="Include already acknowledged announcements"),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get announcements targeted to the current member"""
    
    # Get member record
    member = db.query(Member).filter(Member.user_id == current_user.id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member record not found"
        )
    
    # Get all active announcements for the makerspace
    current_time = datetime.utcnow()
    query = db.query(Announcement).filter(
        and_(
            Announcement.makerspace_id == member.makerspace_id,
            Announcement.is_published == True,
            or_(Announcement.publish_at.is_(None), Announcement.publish_at <= current_time),
            or_(Announcement.expires_at.is_(None), Announcement.expires_at > current_time)
        )
    )
    
    all_announcements = query.all()
    
    # Filter announcements targeted to this member
    targeted_announcements = []
    for announcement in all_announcements:
        if announcement.is_targeted_to_member(member):
            targeted_announcements.append(announcement)
    
    # If not including acknowledged, filter out acknowledged announcements
    if not include_acknowledged:
        acknowledged_ids = db.query(AnnouncementAcknowledgment.announcement_id).filter(
            AnnouncementAcknowledgment.member_id == member.id
        ).all()
        acknowledged_ids = [str(ack[0]) for ack in acknowledged_ids]
        
        targeted_announcements = [
            ann for ann in targeted_announcements 
            if str(ann.id) not in acknowledged_ids
        ]
    
    # Sort by priority and pinned status
    def sort_key(ann):
        priority_order = {
            Priority.CRITICAL: 5,
            Priority.URGENT: 4,
            Priority.HIGH: 3,
            Priority.NORMAL: 2,
            Priority.LOW: 1
        }
        return (ann.is_pinned, priority_order.get(ann.priority, 2), ann.created_at)
    
    targeted_announcements.sort(key=sort_key, reverse=True)
    
    # Limit results
    targeted_announcements = targeted_announcements[:limit]
    
    # Format response
    response_announcements = []
    for announcement in targeted_announcements:
        announcement_dict = announcement.to_dict()
        announcement_dict['is_active'] = announcement.is_active()
        announcement_dict['type_icon'] = announcement.get_type_icon()
        announcement_dict['priority_color'] = announcement.get_priority_color()
        response_announcements.append(announcement_dict)
    
    return response_announcements

@router.get("/{announcement_id}", response_model=Dict[str, Any])
async def get_announcement(
    announcement_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific announcement details"""
    
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    # Check access permissions
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if str(announcement.makerspace_id) != str(makerspace_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this announcement"
        )
    
    # Record view if this is a member viewing
    member = db.query(Member).filter(Member.user_id == current_user.id).first()
    if member:
        # Check if this member can see this announcement
        if not announcement.is_targeted_to_member(member):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This announcement is not targeted to you"
            )
        
        # Record the view
        existing_view = db.query(AnnouncementView).filter(
            and_(
                AnnouncementView.announcement_id == announcement_id,
                AnnouncementView.member_id == member.id
            )
        ).first()
        
        if not existing_view:
            view = AnnouncementView(
                announcement_id=announcement.id,
                member_id=member.id
            )
            db.add(view)
            announcement.increment_view_count()
            db.commit()
    
    announcement_dict = announcement.to_dict()
    announcement_dict['is_active'] = announcement.is_active()
    announcement_dict['type_icon'] = announcement.get_type_icon()
    announcement_dict['priority_color'] = announcement.get_priority_color()
    
    # Add acknowledgment status if member
    if member:
        acknowledgment = db.query(AnnouncementAcknowledgment).filter(
            and_(
                AnnouncementAcknowledgment.announcement_id == announcement_id,
                AnnouncementAcknowledgment.member_id == member.id
            )
        ).first()
        announcement_dict['is_acknowledged'] = acknowledgment is not None
        announcement_dict['acknowledged_at'] = acknowledgment.acknowledged_at.isoformat() if acknowledgment else None
    
    return announcement_dict

@router.post("/", response_model=Dict[str, Any])
async def create_announcement(
    announcement_data: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new announcement"""
    
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if not makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No makerspace associated with current user"
        )
    
    # Validate event-specific fields
    if announcement_data.announcement_type == AnnouncementType.EVENT:
        if not announcement_data.event_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="event_date is required for event announcements"
            )
    
    # Validate maintenance-specific fields
    if announcement_data.announcement_type == AnnouncementType.MAINTENANCE:
        if not announcement_data.maintenance_start or not announcement_data.maintenance_end:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="maintenance_start and maintenance_end are required for maintenance announcements"
            )
    
    # Create announcement
    announcement = Announcement(
        makerspace_id=makerspace_id,
        created_by=current_user.id,
        **announcement_data.dict()
    )
    
    # Set published_at if being published immediately
    if announcement_data.is_published and not announcement_data.publish_at:
        announcement.published_at = datetime.utcnow()
    
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    
    announcement_dict = announcement.to_dict()
    announcement_dict['is_active'] = announcement.is_active()
    announcement_dict['type_icon'] = announcement.get_type_icon()
    announcement_dict['priority_color'] = announcement.get_priority_color()
    
    return announcement_dict

@router.put("/{announcement_id}", response_model=Dict[str, Any])
async def update_announcement(
    announcement_id: str,
    announcement_data: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update an existing announcement"""
    
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    # Check access permissions
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if str(announcement.makerspace_id) != str(makerspace_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this announcement"
        )
    
    # Validate type-specific fields if type is being changed
    new_type = announcement_data.announcement_type or announcement.announcement_type
    
    if new_type == AnnouncementType.EVENT:
        event_date = announcement_data.event_date if announcement_data.event_date is not None else announcement.event_date
        if not event_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="event_date is required for event announcements"
            )
    
    if new_type == AnnouncementType.MAINTENANCE:
        start = announcement_data.maintenance_start if announcement_data.maintenance_start is not None else announcement.maintenance_start
        end = announcement_data.maintenance_end if announcement_data.maintenance_end is not None else announcement.maintenance_end
        if not start or not end:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="maintenance_start and maintenance_end are required for maintenance announcements"
            )
    
    # Update announcement fields
    update_data = announcement_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(announcement, field, value)
    
    announcement.updated_by = current_user.id
    announcement.updated_at = datetime.utcnow()
    
    # Set published_at if being published for the first time
    if announcement_data.is_published and not announcement.published_at:
        announcement.published_at = datetime.utcnow()
    
    db.commit()
    db.refresh(announcement)
    
    announcement_dict = announcement.to_dict()
    announcement_dict['is_active'] = announcement.is_active()
    announcement_dict['type_icon'] = announcement.get_type_icon()
    announcement_dict['priority_color'] = announcement.get_priority_color()
    
    return announcement_dict

@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_announcement(
    announcement_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete an announcement"""
    
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    # Check access permissions
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if str(announcement.makerspace_id) != str(makerspace_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this announcement"
        )
    
    # Delete related records first
    db.query(AnnouncementAcknowledgment).filter(
        AnnouncementAcknowledgment.announcement_id == announcement_id
    ).delete()
    
    db.query(AnnouncementView).filter(
        AnnouncementView.announcement_id == announcement_id
    ).delete()
    
    db.delete(announcement)
    db.commit()
    
    return None

@router.post("/{announcement_id}/acknowledge", response_model=Dict[str, Any])
async def acknowledge_announcement(
    announcement_id: str,
    ack_data: AcknowledgmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Acknowledge an announcement (member endpoint)"""
    
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    # Get member record
    member = db.query(Member).filter(Member.user_id == current_user.id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member record not found"
        )
    
    # Check if announcement is targeted to this member
    if not announcement.is_targeted_to_member(member):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This announcement is not targeted to you"
        )
    
    # Check if already acknowledged
    existing_ack = db.query(AnnouncementAcknowledgment).filter(
        and_(
            AnnouncementAcknowledgment.announcement_id == announcement_id,
            AnnouncementAcknowledgment.member_id == member.id
        )
    ).first()
    
    if existing_ack:
        return {
            "message": "Announcement already acknowledged",
            "acknowledged_at": existing_ack.acknowledged_at.isoformat()
        }
    
    # Create acknowledgment
    acknowledgment = AnnouncementAcknowledgment(
        announcement_id=announcement.id,
        member_id=member.id,
        ip_address=ack_data.ip_address,
        user_agent=ack_data.user_agent
    )
    
    db.add(acknowledgment)
    announcement.acknowledgment_count += 1
    db.commit()
    
    return {
        "message": "Announcement acknowledged successfully",
        "acknowledged_at": acknowledgment.acknowledged_at.isoformat()
    }

@router.post("/{announcement_id}/click", response_model=Dict[str, str])
async def record_announcement_click(
    announcement_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record a click on announcement action button"""
    
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    announcement.increment_click_count()
    db.commit()
    
    return {"message": "Click recorded successfully"}

@router.get("/{announcement_id}/stats", response_model=Dict[str, Any])
async def get_announcement_stats(
    announcement_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get detailed statistics for an announcement"""
    
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    # Check access permissions
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if str(announcement.makerspace_id) != str(makerspace_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this announcement"
        )
    
    # Get detailed stats
    total_views = db.query(AnnouncementView).filter(
        AnnouncementView.announcement_id == announcement_id
    ).count()
    
    unique_viewers = db.query(AnnouncementView.member_id).filter(
        AnnouncementView.announcement_id == announcement_id
    ).distinct().count()
    
    total_acknowledgments = db.query(AnnouncementAcknowledgment).filter(
        AnnouncementAcknowledgment.announcement_id == announcement_id
    ).count()
    
    # Calculate target audience size
    target_members_count = 0
    if announcement.target_audience == TargetAudience.ALL_MEMBERS:
        target_members_count = db.query(Member).filter(
            Member.makerspace_id == announcement.makerspace_id
        ).count()
    elif announcement.target_audience == TargetAudience.ACTIVE_MEMBERS:
        target_members_count = db.query(Member).filter(
            and_(
                Member.makerspace_id == announcement.makerspace_id,
                Member.is_active == True
            )
        ).count()
    # Add other audience calculations as needed
    
    # Calculate rates
    view_rate = (unique_viewers / target_members_count * 100) if target_members_count > 0 else 0
    acknowledgment_rate = (total_acknowledgments / target_members_count * 100) if target_members_count > 0 else 0
    click_through_rate = (announcement.click_count / total_views * 100) if total_views > 0 else 0
    
    return {
        "announcement_id": str(announcement_id),
        "title": announcement.title,
        "target_audience_size": target_members_count,
        "total_views": total_views,
        "unique_viewers": unique_viewers,
        "total_acknowledgments": total_acknowledgments,
        "action_button_clicks": announcement.click_count,
        "view_rate": round(view_rate, 2),
        "acknowledgment_rate": round(acknowledgment_rate, 2),
        "click_through_rate": round(click_through_rate, 2),
        "created_at": announcement.created_at.isoformat(),
        "published_at": announcement.published_at.isoformat() if announcement.published_at else None
    }
