from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, JSON, DateTime, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from .base import Base

class AnnouncementType(enum.Enum):
    GENERAL = "general"
    MAINTENANCE = "maintenance"
    EVENT = "event"
    POLICY = "policy"
    EMERGENCY = "emergency"
    PROMOTION = "promotion"
    NEW_EQUIPMENT = "new_equipment"
    SCHEDULE_CHANGE = "schedule_change"
    SAFETY = "safety"

class Priority(enum.Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"
    CRITICAL = "critical"

class TargetAudience(enum.Enum):
    ALL_MEMBERS = "all_members"
    ACTIVE_MEMBERS = "active_members"
    SPECIFIC_PLANS = "specific_plans"
    SPECIFIC_SKILLS = "specific_skills"
    SPECIFIC_MEMBERS = "specific_members"
    ADMINS_ONLY = "admins_only"
    NEW_MEMBERS = "new_members"

class Announcement(Base):
    __tablename__ = "announcements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    makerspace_id = Column(UUID(as_uuid=True), ForeignKey("makerspaces.id"), nullable=False)
    
    # Content
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(String(500), nullable=True)  # Short preview text
    
    # Type and Priority
    announcement_type = Column(SQLEnum(AnnouncementType), default=AnnouncementType.GENERAL)
    priority = Column(SQLEnum(Priority), default=Priority.NORMAL)
    
    # Targeting
    target_audience = Column(SQLEnum(TargetAudience), default=TargetAudience.ALL_MEMBERS)
    target_membership_plans = Column(JSON, nullable=True)  # List of plan IDs
    target_skills = Column(JSON, nullable=True)  # List of skill IDs
    target_members = Column(JSON, nullable=True)  # List of specific member IDs
    
    # Scheduling
    publish_at = Column(DateTime(timezone=True), nullable=True)  # When to publish (future scheduling)
    expires_at = Column(DateTime(timezone=True), nullable=True)  # When announcement expires
    
    # Display Settings
    is_published = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)  # Pin to top of announcements
    show_on_dashboard = Column(Boolean, default=True)
    show_in_email = Column(Boolean, default=False)
    show_as_popup = Column(Boolean, default=False)
    require_acknowledgment = Column(Boolean, default=False)  # Members must acknowledge reading
    
    # Rich Content
    image_url = Column(String(500), nullable=True)
    attachments = Column(JSON, nullable=True)  # List of file URLs/names
    action_button_text = Column(String(100), nullable=True)
    action_button_url = Column(String(500), nullable=True)
    
    # Styling
    background_color = Column(String(7), nullable=True)  # Hex color
    text_color = Column(String(7), nullable=True)  # Hex color
    icon = Column(String(50), nullable=True)  # Icon name/class
    
    # Event-specific fields (when announcement_type = event)
    event_date = Column(DateTime(timezone=True), nullable=True)
    event_location = Column(String(255), nullable=True)
    event_capacity = Column(Integer, nullable=True)
    registration_required = Column(Boolean, default=False)
    registration_url = Column(String(500), nullable=True)
    
    # Maintenance-specific fields (when announcement_type = maintenance)
    maintenance_start = Column(DateTime(timezone=True), nullable=True)
    maintenance_end = Column(DateTime(timezone=True), nullable=True)
    affected_equipment = Column(JSON, nullable=True)  # List of equipment IDs
    
    # Stats
    view_count = Column(Integer, default=0)
    acknowledgment_count = Column(Integer, default=0)
    click_count = Column(Integer, default=0)  # Action button clicks
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Relationships
    makerspace = relationship("Makerspace", back_populates="announcements")
    created_by_user = relationship("User", foreign_keys=[created_by])
    updated_by_user = relationship("User", foreign_keys=[updated_by])
    acknowledgments = relationship("AnnouncementAcknowledgment", back_populates="announcement")
    
    def __repr__(self):
        return f"<Announcement(title={self.title}, type={self.announcement_type}, priority={self.priority})>"

    def to_dict(self):
        """Convert announcement to dictionary for API responses"""
        return {
            "id": str(self.id),
            "makerspace_id": str(self.makerspace_id),
            "title": self.title,
            "content": self.content,
            "summary": self.summary,
            "announcement_type": self.announcement_type.value if self.announcement_type else None,
            "priority": self.priority.value if self.priority else None,
            "target_audience": self.target_audience.value if self.target_audience else None,
            "target_membership_plans": self.target_membership_plans,
            "target_skills": self.target_skills,
            "target_members": self.target_members,
            "publish_at": self.publish_at.isoformat() if self.publish_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "is_published": self.is_published,
            "is_pinned": self.is_pinned,
            "show_on_dashboard": self.show_on_dashboard,
            "show_in_email": self.show_in_email,
            "show_as_popup": self.show_as_popup,
            "require_acknowledgment": self.require_acknowledgment,
            "image_url": self.image_url,
            "attachments": self.attachments,
            "action_button_text": self.action_button_text,
            "action_button_url": self.action_button_url,
            "background_color": self.background_color,
            "text_color": self.text_color,
            "icon": self.icon,
            "event_date": self.event_date.isoformat() if self.event_date else None,
            "event_location": self.event_location,
            "event_capacity": self.event_capacity,
            "registration_required": self.registration_required,
            "registration_url": self.registration_url,
            "maintenance_start": self.maintenance_start.isoformat() if self.maintenance_start else None,
            "maintenance_end": self.maintenance_end.isoformat() if self.maintenance_end else None,
            "affected_equipment": self.affected_equipment,
            "view_count": self.view_count,
            "acknowledgment_count": self.acknowledgment_count,
            "click_count": self.click_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "created_by": str(self.created_by) if self.created_by else None,
            "updated_by": str(self.updated_by) if self.updated_by else None
        }

    def is_active(self, current_time=None):
        """Check if announcement is currently active"""
        from datetime import datetime
        
        if current_time is None:
            current_time = datetime.utcnow()
        
        # Must be published
        if not self.is_published:
            return False
        
        # Check if it's time to publish
        if self.publish_at and current_time < self.publish_at:
            return False
        
        # Check if it has expired
        if self.expires_at and current_time > self.expires_at:
            return False
        
        return True

    def is_targeted_to_member(self, member):
        """Check if announcement is targeted to a specific member"""
        if self.target_audience == TargetAudience.ALL_MEMBERS:
            return True
        
        if self.target_audience == TargetAudience.ACTIVE_MEMBERS:
            return member.is_active if hasattr(member, 'is_active') else True
        
        if self.target_audience == TargetAudience.SPECIFIC_PLANS:
            if self.target_membership_plans and member.membership_plan_id:
                return str(member.membership_plan_id) in self.target_membership_plans
            return False
        
        if self.target_audience == TargetAudience.SPECIFIC_SKILLS:
            if self.target_skills and hasattr(member, 'skills'):
                member_skills = [str(skill.id) for skill in member.skills]
                return any(skill_id in member_skills for skill_id in self.target_skills)
            return False
        
        if self.target_audience == TargetAudience.SPECIFIC_MEMBERS:
            if self.target_members:
                return str(member.id) in self.target_members
            return False
        
        if self.target_audience == TargetAudience.ADMINS_ONLY:
            return member.role in ['admin', 'makerspace_admin', 'super_admin'] if hasattr(member, 'role') else False
        
        if self.target_audience == TargetAudience.NEW_MEMBERS:
            # Consider members joined in last 30 days as new
            from datetime import datetime, timedelta
            if hasattr(member, 'created_at'):
                return member.created_at > (datetime.utcnow() - timedelta(days=30))
            return False
        
        return False

    def get_priority_color(self):
        """Get color class for priority display"""
        priority_colors = {
            Priority.LOW: "text-gray-600",
            Priority.NORMAL: "text-blue-600",
            Priority.HIGH: "text-orange-600",
            Priority.URGENT: "text-red-600",
            Priority.CRITICAL: "text-red-800"
        }
        return priority_colors.get(self.priority, "text-gray-600")

    def get_type_icon(self):
        """Get icon for announcement type"""
        type_icons = {
            AnnouncementType.GENERAL: "📢",
            AnnouncementType.MAINTENANCE: "🔧",
            AnnouncementType.EVENT: "📅",
            AnnouncementType.POLICY: "📋",
            AnnouncementType.EMERGENCY: "🚨",
            AnnouncementType.PROMOTION: "🎉",
            AnnouncementType.NEW_EQUIPMENT: "🛠️",
            AnnouncementType.SCHEDULE_CHANGE: "⏰",
            AnnouncementType.SAFETY: "⚠️"
        }
        return type_icons.get(self.announcement_type, "📢")

    def increment_view_count(self):
        """Increment view count"""
        self.view_count += 1

    def increment_click_count(self):
        """Increment action button click count"""
        self.click_count += 1


class AnnouncementAcknowledgment(Base):
    __tablename__ = "announcement_acknowledgments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    announcement_id = Column(UUID(as_uuid=True), ForeignKey("announcements.id"), nullable=False)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=False)
    
    acknowledged_at = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String(45), nullable=True)  # For tracking
    user_agent = Column(String(500), nullable=True)  # For tracking
    
    # Relationships
    announcement = relationship("Announcement", back_populates="acknowledgments")
    member = relationship("Member")
    
    def __repr__(self):
        return f"<AnnouncementAcknowledgment(announcement_id={self.announcement_id}, member_id={self.member_id})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "announcement_id": str(self.announcement_id),
            "member_id": str(self.member_id),
            "acknowledged_at": self.acknowledged_at.isoformat() if self.acknowledged_at else None
        }


class AnnouncementView(Base):
    __tablename__ = "announcement_views"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    announcement_id = Column(UUID(as_uuid=True), ForeignKey("announcements.id"), nullable=False)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=True)  # Can be null for anonymous views
    
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    # Relationships
    announcement = relationship("Announcement")
    member = relationship("Member")
    
    def __repr__(self):
        return f"<AnnouncementView(announcement_id={self.announcement_id}, member_id={self.member_id})>"
