from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, Float, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database import Base

class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    IN_PROGRESS = "in-progress"
    COMPLETE = "complete"
    ON_HOLD = "on-hold"
    CANCELLED = "cancelled"

class ProjectVisibility(str, enum.Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    TEAM_ONLY = "team-only"

class ProjectType(str, enum.Enum):
    INTERNAL = "internal"
    OPEN_COLLAB = "open-collab"
    SPONSORED = "sponsored"

class CollaboratorRole(str, enum.Enum):
    VIEWER = "viewer"
    EDITOR = "editor"
    OWNER = "owner"

class ActivityType(str, enum.Enum):
    PROJECT_CREATED = "project_created"
    PROJECT_UPDATED = "project_updated"
    MEMBER_ADDED = "member_added"
    MEMBER_REMOVED = "member_removed"
    MEMBER_ROLE_CHANGED = "member_role_changed"
    BOM_ITEM_ADDED = "bom_item_added"
    BOM_ITEM_REMOVED = "bom_item_removed"
    BOM_ITEM_UPDATED = "bom_item_updated"
    EQUIPMENT_RESERVED = "equipment_reserved"
    EQUIPMENT_UNRESERVED = "equipment_unreserved"
    FILE_UPLOADED = "file_uploaded"
    FILE_REMOVED = "file_removed"
    MILESTONE_ADDED = "milestone_added"
    MILESTONE_COMPLETED = "milestone_completed"
    STATUS_CHANGED = "status_changed"
    # GitHub Integration Activities
    GITHUB_REPO_CONNECTED = "github_repo_connected"
    GITHUB_REPO_DISCONNECTED = "github_repo_disconnected"
    GITHUB_COMMIT_PUSHED = "github_commit_pushed"
    GITHUB_PULL_REQUEST_OPENED = "github_pull_request_opened"
    GITHUB_PULL_REQUEST_MERGED = "github_pull_request_merged"
    GITHUB_ISSUE_CREATED = "github_issue_created"
    GITHUB_ISSUE_CLOSED = "github_issue_closed"
    GITHUB_RELEASE_CREATED = "github_release_created"
    GITHUB_FILE_ADDED = "github_file_added"
    GITHUB_FILE_MODIFIED = "github_file_modified"
    GITHUB_FILE_DELETED = "github_file_deleted"

class Project(Base):
    __tablename__ = "projects"

    project_id = Column(String(100), primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    project_type = Column(Enum(ProjectType), nullable=False, default=ProjectType.INTERNAL, index=True)
    owner_id = Column(String(100), nullable=False, index=True)
    makerspace_id = Column(String(100), nullable=True, index=True)
    visibility = Column(Enum(ProjectVisibility), nullable=False, default=ProjectVisibility.PRIVATE)
    status = Column(Enum(ProjectStatus), nullable=False, default=ProjectStatus.DRAFT)
    
    # Timeline fields
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    # GitHub Integration
    github_repo_url = Column(String(500), nullable=True)  # GitHub repository URL
    github_repo_name = Column(String(200), nullable=True)  # Repository name (owner/repo)
    github_access_token = Column(String(500), nullable=True)  # Encrypted access token for private repos
    github_webhook_secret = Column(String(200), nullable=True)  # Webhook secret for real-time updates
    github_integration_enabled = Column(Boolean, default=False)  # Whether GitHub integration is active
    github_default_branch = Column(String(100), default="main")  # Default branch to track

    # Enhanced metadata for public projects and discovery
    tags = Column(JSON, nullable=True, default=list)  # List of project tags
    is_featured = Column(Boolean, default=False)  # Admin can feature projects
    is_approved = Column(Boolean, default=True)  # Admin approval for public projects

    # Public project features
    difficulty_level = Column(String(20), default="beginner")  # beginner, intermediate, advanced, expert
    estimated_duration = Column(String(50), nullable=True)  # "1-2 hours", "1 week", etc.
    required_skills = Column(JSON, nullable=True, default=list)  # Skills needed for this project
    learning_objectives = Column(JSON, nullable=True, default=list)  # What people will learn
    license_type = Column(String(50), default="cc-by-sa")  # Creative Commons or other license

    # Project metrics for public discovery
    view_count = Column(Integer, default=0)  # Number of times viewed
    fork_count = Column(Integer, default=0)  # Number of times forked/copied
    like_count = Column(Integer, default=0)  # Number of likes/favorites
    comment_count = Column(Integer, default=0)  # Number of comments
    download_count = Column(Integer, default=0)  # Number of downloads

    # Showcase specific fields
    category = Column(String(100), nullable=True)  # Project category
    subcategories = Column(JSON, nullable=True, default=list)  # Project subcategories
    estimated_time = Column(String(100), nullable=True)  # Time to complete
    estimated_cost = Column(Float, nullable=True)  # Estimated cost to build
    thumbnail_url = Column(String(500), nullable=True)  # Project thumbnail
    gallery_images = Column(JSON, nullable=True, default=list)  # Gallery images
    demo_video_url = Column(String(500), nullable=True)  # Demo video URL
    is_staff_pick = Column(Boolean, default=False)  # Staff pick highlight
    is_trending = Column(Boolean, default=False)  # Trending project
    featured_at = Column(DateTime(timezone=True), nullable=True)  # When featured

    # Equipment and space requirements
    required_equipment = Column(JSON, nullable=True, default=list)  # Equipment needed
    space_requirements = Column(Text, nullable=True)  # Space/workspace requirements
    safety_considerations = Column(Text, nullable=True)  # Safety notes and considerations
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    collaborators = relationship("ProjectCollaborator", back_populates="project", cascade="all, delete-orphan")
    bom_items = relationship("ProjectBOM", back_populates="project", cascade="all, delete-orphan")
    equipment_reservations = relationship("ProjectEquipmentReservation", back_populates="project", cascade="all, delete-orphan")
    files = relationship("ProjectFile", back_populates="project", cascade="all, delete-orphan")
    activity_logs = relationship("ProjectActivityLog", back_populates="project", cascade="all, delete-orphan")
    milestones = relationship("ProjectMilestone", back_populates="project", cascade="all, delete-orphan")

class ProjectCollaborator(Base):
    __tablename__ = "project_collaborators"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False)
    user_id = Column(String(100), nullable=False, index=True)
    role = Column(Enum(CollaboratorRole), nullable=False, default=CollaboratorRole.VIEWER)
    invited_by = Column(String(100), nullable=False)
    invited_at = Column(DateTime(timezone=True), server_default=func.now())
    accepted_at = Column(DateTime(timezone=True), nullable=True)

    # Enhanced collaboration features
    invitation_message = Column(Text, nullable=True)  # Custom invitation message
    email = Column(String(255), nullable=True)  # Email for external invitations
    skills_contributed = Column(JSON, nullable=True, default=list)  # Skills this person contributes
    responsibilities = Column(JSON, nullable=True, default=list)  # Specific responsibilities
    is_external = Column(Boolean, default=False)  # External collaborator (not makerspace member)
    contribution_hours = Column(Float, nullable=True)  # Estimated or actual hours contributed

    # Activity tracking
    last_activity_at = Column(DateTime(timezone=True), nullable=True)
    activity_score = Column(Integer, default=0)  # Contribution score based on activity

    # Relationships
    project = relationship("Project", back_populates="collaborators")

class ProjectBOM(Base):
    __tablename__ = "project_bom"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False)

    # Item details
    item_type = Column(String(50), nullable=False)  # "inventory" or "makrx_store"
    item_id = Column(String(100), nullable=False)  # Reference to inventory or store item
    item_name = Column(String(200), nullable=False)
    part_code = Column(String(100), nullable=True)  # Part number, SKU, or catalog code
    quantity = Column(Integer, nullable=False, default=1)
    unit_cost = Column(Float, nullable=True)
    total_cost = Column(Float, nullable=True)

    # Enhanced MakrX Store integration
    makrx_product_code = Column(String(100), nullable=True)  # Direct MakrX Store product code
    makrx_store_url = Column(String(500), nullable=True)  # Direct link to product in store
    auto_reorder_enabled = Column(Boolean, default=False)  # Enable automatic reordering
    auto_reorder_quantity = Column(Integer, nullable=True)  # Quantity to reorder automatically
    preferred_supplier = Column(String(200), nullable=True)  # Preferred supplier for this item

    # Usage details
    usage_notes = Column(Text, nullable=True)
    alternatives = Column(JSON, nullable=True, default=list)  # List of alternative items
    is_critical = Column(Boolean, default=False)  # Critical path item
    procurement_status = Column(String(50), default="needed")  # needed, ordered, received, reserved
    availability_status = Column(String(50), default="unknown")  # in-stock, low-stock, out-of-stock, unknown
    stock_level = Column(Integer, nullable=True)  # Current stock level
    reorder_point = Column(Integer, nullable=True)  # Reorder threshold

    # Enhanced tracking
    category = Column(String(100), nullable=True)  # Component category (electronics, hardware, materials, etc.)
    specifications = Column(JSON, nullable=True)  # Technical specifications
    compatibility_notes = Column(Text, nullable=True)  # Compatibility with other components

    # Metadata
    added_by = Column(String(100), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project", back_populates="bom_items")

class ProjectEquipmentReservation(Base):
    __tablename__ = "project_equipment_reservations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False)
    equipment_id = Column(String(100), nullable=False)  # Reference to equipment
    reservation_id = Column(String(100), nullable=True)  # Reference to actual reservation
    
    # Reservation details
    requested_start = Column(DateTime(timezone=True), nullable=False)
    requested_end = Column(DateTime(timezone=True), nullable=False)
    actual_start = Column(DateTime(timezone=True), nullable=True)
    actual_end = Column(DateTime(timezone=True), nullable=True)
    
    # Status and notes
    status = Column(String(50), default="requested")  # requested, confirmed, in_use, completed, cancelled
    usage_notes = Column(Text, nullable=True)
    
    # Metadata
    requested_by = Column(String(100), nullable=False)
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="equipment_reservations")

class ProjectFile(Base):
    __tablename__ = "project_files"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False)
    
    # File details
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(100), nullable=False)  # document, image, 3d_model, drawing, etc.
    file_size = Column(Integer, nullable=False)
    file_url = Column(String(500), nullable=False)  # URL or path to file
    
    # File metadata
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False)  # Whether file is publicly accessible
    version = Column(String(20), default="1.0")
    
    # Upload details
    uploaded_by = Column(String(100), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="files")

class ProjectMilestone(Base):
    __tablename__ = "project_milestones"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False)
    
    # Milestone details
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    target_date = Column(DateTime(timezone=True), nullable=True)
    completion_date = Column(DateTime(timezone=True), nullable=True)
    
    # Status and priority
    is_completed = Column(Boolean, default=False)
    priority = Column(String(20), default="medium")  # low, medium, high, critical
    order_index = Column(Integer, default=0)  # For ordering milestones
    
    # Metadata
    created_by = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_by = Column(String(100), nullable=True)
    
    # Relationships
    project = relationship("Project", back_populates="milestones")

class ProjectActivityLog(Base):
    __tablename__ = "project_activity_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False)
    
    # Activity details
    activity_type = Column(Enum(ActivityType), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Activity data (JSON for flexibility)
    metadata = Column(JSON, nullable=True)  # Store additional context about the activity
    
    # User and timing
    user_id = Column(String(100), nullable=False)
    user_name = Column(String(100), nullable=False)  # Cached for display
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="activity_logs")

class ProjectTeamRole(Base):
    """Custom team roles for projects beyond basic collaborator roles"""
    __tablename__ = "project_team_roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False)
    user_id = Column(String(100), nullable=False, index=True)

    # Custom role definition
    role_name = Column(String(100), nullable=False)  # "Lead Developer", "3D Printing Specialist", etc.
    role_description = Column(Text, nullable=True)
    permissions = Column(JSON, nullable=True, default=list)  # Specific permissions for this role

    # Role assignment details
    assigned_by = Column(String(100), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    # Relationships
    project = relationship("Project", foreign_keys=[project_id])

class ProjectFork(Base):
    """Track project forks for public projects"""
    __tablename__ = "project_forks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    original_project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False)
    forked_project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False)

    # Fork details
    forked_by = Column(String(100), nullable=False, index=True)
    fork_reason = Column(Text, nullable=True)  # Why they forked it
    modifications_planned = Column(Text, nullable=True)  # What they plan to change

    # Metadata
    forked_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    original_project = relationship("Project", foreign_keys=[original_project_id])
    forked_project = relationship("Project", foreign_keys=[forked_project_id])

class ProjectLike(Base):
    """Track likes/favorites for public projects"""
    __tablename__ = "project_likes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False)
    user_id = Column(String(100), nullable=False, index=True)

    # Like details
    liked_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project", foreign_keys=[project_id])

class ProjectComment(Base):
    """Comments on public projects"""
    __tablename__ = "project_comments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False)
    user_id = Column(String(100), nullable=False, index=True)

    # Comment details
    comment_text = Column(Text, nullable=False)
    is_question = Column(Boolean, default=False)  # Is this a question?
    is_suggestion = Column(Boolean, default=False)  # Is this a suggestion?
    parent_comment_id = Column(Integer, ForeignKey("project_comments.id"), nullable=True)  # For replies

    # Moderation
    is_approved = Column(Boolean, default=True)
    is_flagged = Column(Boolean, default=False)
    flagged_reason = Column(String(100), nullable=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project", foreign_keys=[project_id])
    parent_comment = relationship("ProjectComment", remote_side=[id], backref="replies")

class ProjectBOMOrder(Base):
    """Track BOM item orders through MakrX Store"""
    __tablename__ = "project_bom_orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False)
    bom_item_id = Column(Integer, ForeignKey("project_bom.id"), nullable=False)

    # Order details
    makrx_order_id = Column(String(100), nullable=True)  # Reference to order in MakrX Store
    quantity_ordered = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=True)
    total_price = Column(Float, nullable=True)

    # Order status
    order_status = Column(String(50), default="pending")  # pending, confirmed, shipped, delivered, cancelled
    tracking_number = Column(String(100), nullable=True)
    estimated_delivery = Column(DateTime(timezone=True), nullable=True)
    actual_delivery = Column(DateTime(timezone=True), nullable=True)

    # Metadata
    ordered_by = Column(String(100), nullable=False)
    ordered_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project", foreign_keys=[project_id])
    bom_item = relationship("ProjectBOM", foreign_keys=[bom_item_id])

class ProjectResourceSharing(Base):
    """Share project resources with other projects"""
    __tablename__ = "project_resource_sharing"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False)
    target_project_id = Column(String(100), ForeignKey("projects.project_id"), nullable=False)

    # What's being shared
    resource_type = Column(String(50), nullable=False)  # bom_item, file, milestone_template, etc.
    resource_id = Column(String(100), nullable=False)  # ID of the specific resource

    # Sharing details
    shared_by = Column(String(100), nullable=False)
    sharing_notes = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=False)  # Does target project accept the shared resource?
    approved_by = Column(String(100), nullable=True)

    # Metadata
    shared_at = Column(DateTime(timezone=True), server_default=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    source_project = relationship("Project", foreign_keys=[source_project_id])
    target_project = relationship("Project", foreign_keys=[target_project_id])
