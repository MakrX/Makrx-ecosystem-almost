from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from ..models.project import ProjectStatus, ProjectVisibility, CollaboratorRole, ActivityType

# Project type enum
class ProjectType(str, enum.Enum):
    INTERNAL = "internal"
    OPEN_COLLAB = "open-collab"
    SPONSORED = "sponsored"

# Base schemas
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    project_type: ProjectType = ProjectType.INTERNAL
    visibility: ProjectVisibility = ProjectVisibility.PRIVATE
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    tags: Optional[List[str]] = []

    # Enhanced public project fields
    difficulty_level: str = Field("beginner", regex="^(beginner|intermediate|advanced|expert)$")
    estimated_duration: Optional[str] = None
    required_skills: Optional[List[str]] = []
    learning_objectives: Optional[List[str]] = []
    license_type: str = Field("cc-by-sa", regex="^(cc-by-sa|cc-by|cc-by-nc|mit|apache|proprietary)$")
    required_equipment: Optional[List[str]] = []
    space_requirements: Optional[str] = None
    safety_considerations: Optional[str] = None

# Initial milestone schema for project creation
class InitialMilestone(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    priority: str = Field("medium", regex="^(low|medium|high|critical)$")

# Enhanced collaborator schema for project creation
class InitialCollaborator(BaseModel):
    user_id: str = Field(..., min_length=1)
    email: Optional[str] = None
    role: CollaboratorRole = CollaboratorRole.VIEWER
    invitation_message: Optional[str] = None
    skills_contributed: Optional[List[str]] = []
    responsibilities: Optional[List[str]] = []
    is_external: bool = False

class ProjectCreate(ProjectBase):
    project_id: str = Field(..., min_length=1, max_length=100)
    makerspace_id: Optional[str] = None
    initial_milestones: Optional[List[InitialMilestone]] = []
    initial_collaborators: Optional[List[InitialCollaborator]] = []

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    project_type: Optional[ProjectType] = None
    visibility: Optional[ProjectVisibility] = None
    status: Optional[ProjectStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    github_repo_url: Optional[str] = None
    github_integration_enabled: Optional[bool] = None

# Response schemas
class ProjectCollaboratorResponse(BaseModel):
    id: int
    user_id: str
    role: CollaboratorRole
    invited_by: str
    invited_at: datetime
    accepted_at: Optional[datetime] = None

    # Enhanced collaboration fields
    invitation_message: Optional[str] = None
    email: Optional[str] = None
    skills_contributed: Optional[List[str]] = []
    responsibilities: Optional[List[str]] = []
    is_external: bool = False
    contribution_hours: Optional[float] = None
    last_activity_at: Optional[datetime] = None
    activity_score: int = 0

    class Config:
        from_attributes = True

class ProjectBOMResponse(BaseModel):
    id: int
    item_type: str
    item_id: str
    item_name: str
    part_code: Optional[str] = None
    quantity: int
    unit_cost: Optional[float] = None
    total_cost: Optional[float] = None
    usage_notes: Optional[str] = None
    alternatives: Optional[List[BOMAlternative]] = []
    is_critical: bool = False
    procurement_status: str = "needed"
    availability_status: str = "unknown"
    stock_level: Optional[int] = None
    reorder_point: Optional[int] = None
    added_by: str
    added_at: datetime

    class Config:
        from_attributes = True

class ProjectEquipmentReservationResponse(BaseModel):
    id: int
    equipment_id: str
    reservation_id: Optional[str] = None
    requested_start: datetime
    requested_end: datetime
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    status: str = "requested"
    usage_notes: Optional[str] = None
    requested_by: str
    requested_at: datetime

    class Config:
        from_attributes = True

class ProjectFileResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    file_url: str
    description: Optional[str] = None
    is_public: bool = False
    version: str = "1.0"
    uploaded_by: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

class ProjectMilestoneResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    is_completed: bool = False
    priority: str = "medium"
    order_index: int = 0
    created_by: str
    created_at: datetime
    completed_by: Optional[str] = None

    class Config:
        from_attributes = True

class ProjectActivityLogResponse(BaseModel):
    id: int
    activity_type: ActivityType
    title: str
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    user_id: str
    user_name: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectResponse(BaseModel):
    project_id: str
    name: str
    description: Optional[str] = None
    project_type: ProjectType = ProjectType.INTERNAL
    owner_id: str
    makerspace_id: Optional[str] = None
    visibility: ProjectVisibility
    status: ProjectStatus
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    tags: Optional[List[str]] = []
    is_featured: bool = False
    is_approved: bool = True
    created_at: datetime
    updated_at: datetime
    # GitHub Integration
    github_repo_url: Optional[str] = None
    github_repo_name: Optional[str] = None
    github_integration_enabled: bool = False
    github_default_branch: str = "main"
    
    # Related data
    collaborators: List[ProjectCollaboratorResponse] = []
    bom_items: List[ProjectBOMResponse] = []
    equipment_reservations: List[ProjectEquipmentReservationResponse] = []
    files: List[ProjectFileResponse] = []
    milestones: List[ProjectMilestoneResponse] = []
    activity_logs: List[ProjectActivityLogResponse] = []

    class Config:
        from_attributes = True

class ProjectSummaryResponse(BaseModel):
    project_id: str
    name: str
    description: Optional[str] = None
    project_type: ProjectType = ProjectType.INTERNAL
    owner_id: str
    visibility: ProjectVisibility
    status: ProjectStatus
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    tags: Optional[List[str]] = []
    is_featured: bool = False
    created_at: datetime
    updated_at: datetime
    
    # Summary counts
    collaborator_count: int = 0
    bom_items_count: int = 0
    files_count: int = 0
    milestones_count: int = 0
    completed_milestones_count: int = 0

    class Config:
        from_attributes = True

# Collaborator schemas
class CollaboratorAdd(BaseModel):
    user_id: str = Field(..., min_length=1)
    role: CollaboratorRole = CollaboratorRole.VIEWER

class CollaboratorUpdate(BaseModel):
    role: CollaboratorRole

# BOM schemas
class BOMAlternative(BaseModel):
    item_id: str = Field(..., min_length=1)
    item_name: str = Field(..., min_length=1, max_length=200)
    part_code: Optional[str] = None
    unit_cost: Optional[float] = Field(None, ge=0)
    availability_status: str = Field("unknown", regex="^(in-stock|low-stock|out-of-stock|unknown)$")
    compatibility_notes: Optional[str] = None

class BOMItemCreate(BaseModel):
    item_type: str = Field(..., regex="^(inventory|makrx_store)$")
    item_id: str = Field(..., min_length=1)
    item_name: str = Field(..., min_length=1, max_length=200)
    part_code: Optional[str] = None
    quantity: int = Field(..., gt=0)
    unit_cost: Optional[float] = Field(None, ge=0)
    usage_notes: Optional[str] = None
    alternatives: Optional[List[BOMAlternative]] = []
    is_critical: bool = False

    # Enhanced MakrX Store integration
    makrx_product_code: Optional[str] = None
    makrx_store_url: Optional[str] = None
    auto_reorder_enabled: bool = False
    auto_reorder_quantity: Optional[int] = None
    preferred_supplier: Optional[str] = None
    category: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    compatibility_notes: Optional[str] = None

class BOMItemUpdate(BaseModel):
    part_code: Optional[str] = None
    quantity: Optional[int] = Field(None, gt=0)
    unit_cost: Optional[float] = Field(None, ge=0)
    usage_notes: Optional[str] = None
    alternatives: Optional[List[BOMAlternative]] = None
    is_critical: Optional[bool] = None
    procurement_status: Optional[str] = None
    availability_status: Optional[str] = None
    stock_level: Optional[int] = None
    reorder_point: Optional[int] = None

# Equipment reservation schemas
class EquipmentReservationCreate(BaseModel):
    equipment_id: str = Field(..., min_length=1)
    requested_start: datetime
    requested_end: datetime
    usage_notes: Optional[str] = None

    @validator('requested_end')
    def end_after_start(cls, v, values):
        if 'requested_start' in values and v <= values['requested_start']:
            raise ValueError('End time must be after start time')
        return v

class EquipmentReservationUpdate(BaseModel):
    requested_start: Optional[datetime] = None
    requested_end: Optional[datetime] = None
    status: Optional[str] = None
    usage_notes: Optional[str] = None

# File schemas
class FileUpload(BaseModel):
    filename: str = Field(..., min_length=1, max_length=255)
    file_type: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    is_public: bool = False
    version: str = "1.0"

# Milestone schemas
class MilestoneCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    priority: str = Field("medium", regex="^(low|medium|high|critical)$")

class MilestoneUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    priority: Optional[str] = Field(None, regex="^(low|medium|high|critical)$")
    is_completed: Optional[bool] = None
    order_index: Optional[int] = None

# Activity log schemas
class ActivityLogCreate(BaseModel):
    activity_type: ActivityType
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# Search and filter schemas
class ProjectFilter(BaseModel):
    status: Optional[List[ProjectStatus]] = None
    visibility: Optional[List[ProjectVisibility]] = None
    owner_id: Optional[str] = None
    makerspace_id: Optional[str] = None
    tags: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    search: Optional[str] = None  # Search in name and description

class ProjectSort(BaseModel):
    field: str = Field("updated_at", regex="^(name|created_at|updated_at|start_date|end_date)$")
    direction: str = Field("desc", regex="^(asc|desc)$")

# Batch operation schemas
class ProjectStatusUpdate(BaseModel):
    status: ProjectStatus

class ProjectBulkDelete(BaseModel):
    project_ids: List[str] = Field(..., min_items=1)

# Analytics schemas
class ProjectStatistics(BaseModel):
    total_projects: int
    projects_by_status: Dict[str, int]
    projects_by_visibility: Dict[str, int]
    active_projects: int
    completed_projects: int
    average_project_duration: Optional[float] = None  # In days
    top_tags: List[Dict[str, Any]] = []

class UserProjectStatistics(BaseModel):
    owned_projects: int
    collaborated_projects: int
    completed_projects: int
    active_projects: int
    favorite_tags: List[str] = []

# GitHub Integration Schemas
class GitHubRepoConnect(BaseModel):
    repo_url: str = Field(..., regex=r"^https://github\.com/[\w\-\.]+/[\w\-\.]+/?$")
    access_token: Optional[str] = None  # For private repos
    default_branch: str = "main"

class GitHubRepoInfo(BaseModel):
    name: str
    full_name: str
    description: Optional[str] = None
    html_url: str
    clone_url: str
    ssh_url: str
    default_branch: str
    is_private: bool
    size: int
    language: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    pushed_at: datetime

class GitHubCommit(BaseModel):
    sha: str
    message: str
    author_name: str
    author_email: str
    author_date: datetime
    committer_name: str
    committer_email: str
    committer_date: datetime
    url: str
    added_files: List[str] = []
    modified_files: List[str] = []
    removed_files: List[str] = []

class GitHubFile(BaseModel):
    name: str
    path: str
    sha: str
    size: int
    url: str
    html_url: str
    download_url: Optional[str] = None
    type: str  # file or dir
    encoding: Optional[str] = None
    content: Optional[str] = None  # Base64 encoded for files

class GitHubActivity(BaseModel):
    type: str  # commit, pull_request, issue, release, etc.
    action: Optional[str] = None  # opened, closed, merged, etc.
    title: str
    description: Optional[str] = None
    author: str
    created_at: datetime
    url: str
    metadata: Optional[Dict[str, Any]] = None

# Enhanced project management schemas
class ProjectForkCreate(BaseModel):
    original_project_id: str = Field(..., min_length=1)
    new_project_name: str = Field(..., min_length=1, max_length=200)
    fork_reason: Optional[str] = None
    modifications_planned: Optional[str] = None

class ProjectForkResponse(BaseModel):
    id: int
    original_project_id: str
    forked_project_id: str
    forked_by: str
    fork_reason: Optional[str] = None
    modifications_planned: Optional[str] = None
    forked_at: datetime

    class Config:
        from_attributes = True

class ProjectLikeResponse(BaseModel):
    id: int
    project_id: str
    user_id: str
    liked_at: datetime

    class Config:
        from_attributes = True

class ProjectCommentCreate(BaseModel):
    comment_text: str = Field(..., min_length=1, max_length=1000)
    is_question: bool = False
    is_suggestion: bool = False
    parent_comment_id: Optional[int] = None

class ProjectCommentResponse(BaseModel):
    id: int
    project_id: str
    user_id: str
    comment_text: str
    is_question: bool = False
    is_suggestion: bool = False
    parent_comment_id: Optional[int] = None
    is_approved: bool = True
    is_flagged: bool = False
    flagged_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    replies: List['ProjectCommentResponse'] = []

    class Config:
        from_attributes = True

# Update to handle recursive comments
ProjectCommentResponse.model_rebuild()

class BOMOrderCreate(BaseModel):
    bom_item_id: int = Field(..., gt=0)
    quantity_ordered: int = Field(..., gt=0)
    notes: Optional[str] = None

class BOMOrderResponse(BaseModel):
    id: int
    project_id: str
    bom_item_id: int
    makrx_order_id: Optional[str] = None
    quantity_ordered: int
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    order_status: str = "pending"
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    ordered_by: str
    ordered_at: datetime

    class Config:
        from_attributes = True

class ProjectTeamRoleCreate(BaseModel):
    user_id: str = Field(..., min_length=1)
    role_name: str = Field(..., min_length=1, max_length=100)
    role_description: Optional[str] = None
    permissions: Optional[List[str]] = []

class ProjectTeamRoleResponse(BaseModel):
    id: int
    project_id: str
    user_id: str
    role_name: str
    role_description: Optional[str] = None
    permissions: Optional[List[str]] = []
    assigned_by: str
    assigned_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True

class ResourceSharingCreate(BaseModel):
    target_project_id: str = Field(..., min_length=1)
    resource_type: str = Field(..., regex="^(bom_item|file|milestone_template|equipment_config)$")
    resource_id: str = Field(..., min_length=1)
    sharing_notes: Optional[str] = None

class ResourceSharingResponse(BaseModel):
    id: int
    source_project_id: str
    target_project_id: str
    resource_type: str
    resource_id: str
    shared_by: str
    sharing_notes: Optional[str] = None
    is_approved: bool = False
    approved_by: Optional[str] = None
    shared_at: datetime
    approved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PublicProjectsFilter(BaseModel):
    difficulty_level: Optional[str] = None
    required_skills: Optional[List[str]] = None
    required_equipment: Optional[List[str]] = None
    license_type: Optional[str] = None
    min_likes: Optional[int] = None
    featured_only: bool = False
    has_bom: Optional[bool] = None
    has_files: Optional[bool] = None

class EnhancedProjectSummaryResponse(ProjectSummaryResponse):
    # Additional fields for public project discovery
    difficulty_level: str = "beginner"
    estimated_duration: Optional[str] = None
    required_skills: Optional[List[str]] = []
    learning_objectives: Optional[List[str]] = []
    license_type: str = "cc-by-sa"
    required_equipment: Optional[List[str]] = []

    # Engagement metrics
    view_count: int = 0
    fork_count: int = 0
    like_count: int = 0

    # Enhanced response includes owner information for public projects
    owner_name: Optional[str] = None
    owner_avatar: Optional[str] = None

    class Config:
        from_attributes = True
