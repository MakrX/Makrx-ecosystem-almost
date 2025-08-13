from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, text
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from ..utils.github_service import GitHubService

from ..models.project import (
    Project, ProjectCollaborator, ProjectBOM, ProjectEquipmentReservation,
    ProjectFile, ProjectMilestone, ProjectActivityLog, ProjectStatus,
    ProjectVisibility, CollaboratorRole, ActivityType
)
from ..schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectFilter, ProjectSort,
    CollaboratorAdd, CollaboratorUpdate, BOMItemCreate, BOMItemUpdate,
    EquipmentReservationCreate, EquipmentReservationUpdate,
    MilestoneCreate, MilestoneUpdate, ActivityLogCreate
)

# Project CRUD operations
def create_project(db: Session, project: ProjectCreate, owner_id: str) -> Project:
    """Create a new project with initial milestones and collaborators"""
    db_project = Project(
        project_id=project.project_id,
        name=project.name,
        description=project.description,
        project_type=project.project_type,
        owner_id=owner_id,
        makerspace_id=project.makerspace_id,
        visibility=project.visibility,
        start_date=project.start_date,
        end_date=project.end_date,
        tags=project.tags or []
    )
    db.add(db_project)
    db.flush()

    # Add owner as collaborator with owner role
    owner_collaborator = ProjectCollaborator(
        project_id=project.project_id,
        user_id=owner_id,
        role=CollaboratorRole.OWNER,
        invited_by=owner_id,
        accepted_at=datetime.utcnow()
    )
    db.add(owner_collaborator)

    # Add initial collaborators
    if project.initial_collaborators:
        for collab in project.initial_collaborators:
            if collab.user_id != owner_id:  # Don't duplicate owner
                collaborator = ProjectCollaborator(
                    project_id=project.project_id,
                    user_id=collab.user_id,
                    role=collab.role,
                    invited_by=owner_id,
                    accepted_at=None  # Will need to be accepted
                )
                db.add(collaborator)

    # Add initial milestones
    if project.initial_milestones:
        for i, milestone_data in enumerate(project.initial_milestones):
            milestone = ProjectMilestone(
                project_id=project.project_id,
                title=milestone_data.title,
                description=milestone_data.description,
                target_date=milestone_data.target_date,
                priority=milestone_data.priority,
                order_index=i,
                created_by=owner_id
            )
            db.add(milestone)

    # Log project creation
    activity_log = ProjectActivityLog(
        project_id=project.project_id,
        activity_type=ActivityType.PROJECT_CREATED,
        title="Project created",
        description=f"Project '{project.name}' was created",
        user_id=owner_id,
        user_name="Project Owner"  # This should be fetched from user service
    )
    db.add(activity_log)

    # Log milestone creation if any
    if project.initial_milestones:
        milestone_activity = ProjectActivityLog(
            project_id=project.project_id,
            activity_type=ActivityType.MILESTONE_ADDED,
            title="Initial milestones added",
            description=f"{len(project.initial_milestones)} milestones added during project creation",
            user_id=owner_id,
            user_name="Project Owner"
        )
        db.add(milestone_activity)

    # Log collaborator invitations if any
    if project.initial_collaborators:
        collab_activity = ProjectActivityLog(
            project_id=project.project_id,
            activity_type=ActivityType.MEMBER_ADDED,
            title="Team members invited",
            description=f"{len(project.initial_collaborators)} team members invited during project creation",
            user_id=owner_id,
            user_name="Project Owner"
        )
        db.add(collab_activity)

    db.commit()
    db.refresh(db_project)
    return db_project

def get_project(db: Session, project_id: str, user_id: str = None) -> Optional[Project]:
    """Get project by ID with access control"""
    query = db.query(Project).options(
        joinedload(Project.collaborators),
        joinedload(Project.bom_items),
        joinedload(Project.equipment_reservations),
        joinedload(Project.files),
        joinedload(Project.milestones),
        joinedload(Project.activity_logs)
    ).filter(Project.project_id == project_id)
    
    project = query.first()
    if not project:
        return None
    
    # Check access permissions
    if user_id and not has_project_access(db, project_id, user_id):
        if project.visibility == ProjectVisibility.PRIVATE:
            return None
    
    return project

def get_projects(
    db: Session, 
    user_id: str,
    skip: int = 0, 
    limit: int = 100,
    filters: Optional[ProjectFilter] = None,
    sort: Optional[ProjectSort] = None
) -> List[Project]:
    """Get projects with filtering and sorting"""
    query = db.query(Project)
    
    # Apply user access control
    if user_id:
        # User can see: owned projects, collaborated projects, and public projects
        accessible_projects = db.query(ProjectCollaborator.project_id).filter(
            ProjectCollaborator.user_id == user_id
        ).subquery()
        
        query = query.filter(
            or_(
                Project.project_id.in_(accessible_projects),
                Project.visibility == ProjectVisibility.PUBLIC
            )
        )
    else:
        # Public access only
        query = query.filter(Project.visibility == ProjectVisibility.PUBLIC)
    
    # Apply filters
    if filters:
        if filters.status:
            query = query.filter(Project.status.in_(filters.status))
        if filters.visibility:
            query = query.filter(Project.visibility.in_(filters.visibility))
        if filters.owner_id:
            query = query.filter(Project.owner_id == filters.owner_id)
        if filters.makerspace_id:
            query = query.filter(Project.makerspace_id == filters.makerspace_id)
        if filters.is_featured is not None:
            query = query.filter(Project.is_featured == filters.is_featured)
        if filters.tags:
            # Search for projects that have any of the specified tags
            tag_conditions = [Project.tags.contains([tag]) for tag in filters.tags]
            query = query.filter(or_(*tag_conditions))
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Project.name.ilike(search_term),
                    Project.description.ilike(search_term)
                )
            )
    
    # Apply sorting
    if sort:
        if sort.direction == "asc":
            query = query.order_by(getattr(Project, sort.field).asc())
        else:
            query = query.order_by(getattr(Project, sort.field).desc())
    else:
        query = query.order_by(Project.updated_at.desc())
    
    return query.offset(skip).limit(limit).all()

def update_project(
    db: Session, 
    project_id: str, 
    project_update: ProjectUpdate, 
    user_id: str
) -> Optional[Project]:
    """Update project with permission check"""
    if not has_project_edit_access(db, project_id, user_id):
        return None
    
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        return None
    
    # Track changes for activity log
    changes = []
    update_data = project_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(project, field) and getattr(project, field) != value:
            old_value = getattr(project, field)
            setattr(project, field, value)
            changes.append(f"{field}: {old_value} → {value}")
    
    if changes:
        # Log the update
        activity_log = ProjectActivityLog(
            project_id=project_id,
            activity_type=ActivityType.PROJECT_UPDATED,
            title="Project updated",
            description=f"Updated: {', '.join(changes)}",
            user_id=user_id,
            user_name="User"  # Should be fetched from user service
        )
        db.add(activity_log)
    
    db.commit()
    db.refresh(project)
    return project

def delete_project(db: Session, project_id: str, user_id: str) -> bool:
    """Delete project with permission check"""
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        return False
    
    # Only owner or admin can delete
    if project.owner_id != user_id:
        return False
    
    db.delete(project)
    db.commit()
    return True

# Collaborator CRUD operations
def add_collaborator(
    db: Session, 
    project_id: str, 
    collaborator_data: CollaboratorAdd, 
    invited_by: str
) -> Optional[ProjectCollaborator]:
    """Add collaborator to project"""
    if not has_project_edit_access(db, project_id, invited_by):
        return None
    
    # Check if user is already a collaborator
    existing = db.query(ProjectCollaborator).filter(
        and_(
            ProjectCollaborator.project_id == project_id,
            ProjectCollaborator.user_id == collaborator_data.user_id
        )
    ).first()
    
    if existing:
        return None
    
    collaborator = ProjectCollaborator(
        project_id=project_id,
        user_id=collaborator_data.user_id,
        role=collaborator_data.role,
        invited_by=invited_by
    )
    db.add(collaborator)
    
    # Log the addition
    activity_log = ProjectActivityLog(
        project_id=project_id,
        activity_type=ActivityType.MEMBER_ADDED,
        title="Team member added",
        description=f"Added {collaborator_data.user_id} as {collaborator_data.role}",
        user_id=invited_by,
        user_name="User"
    )
    db.add(activity_log)
    
    db.commit()
    db.refresh(collaborator)
    return collaborator

def update_collaborator_role(
    db: Session, 
    project_id: str, 
    user_id: str, 
    role_update: CollaboratorUpdate, 
    updated_by: str
) -> Optional[ProjectCollaborator]:
    """Update collaborator role"""
    if not has_project_edit_access(db, project_id, updated_by):
        return None
    
    collaborator = db.query(ProjectCollaborator).filter(
        and_(
            ProjectCollaborator.project_id == project_id,
            ProjectCollaborator.user_id == user_id
        )
    ).first()
    
    if not collaborator:
        return None
    
    old_role = collaborator.role
    collaborator.role = role_update.role
    
    # Log the change
    activity_log = ProjectActivityLog(
        project_id=project_id,
        activity_type=ActivityType.MEMBER_ROLE_CHANGED,
        title="Role changed",
        description=f"Changed {user_id} role from {old_role} to {role_update.role}",
        user_id=updated_by,
        user_name="User"
    )
    db.add(activity_log)
    
    db.commit()
    db.refresh(collaborator)
    return collaborator

def remove_collaborator(
    db: Session, 
    project_id: str, 
    user_id: str, 
    removed_by: str
) -> bool:
    """Remove collaborator from project"""
    if not has_project_edit_access(db, project_id, removed_by):
        return False
    
    collaborator = db.query(ProjectCollaborator).filter(
        and_(
            ProjectCollaborator.project_id == project_id,
            ProjectCollaborator.user_id == user_id
        )
    ).first()
    
    if not collaborator:
        return False
    
    # Cannot remove project owner
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if project and project.owner_id == user_id:
        return False
    
    db.delete(collaborator)
    
    # Log the removal
    activity_log = ProjectActivityLog(
        project_id=project_id,
        activity_type=ActivityType.MEMBER_REMOVED,
        title="Team member removed",
        description=f"Removed {user_id} from project",
        user_id=removed_by,
        user_name="User"
    )
    db.add(activity_log)
    
    db.commit()
    return True

# BOM CRUD operations
def add_bom_item(
    db: Session, 
    project_id: str, 
    bom_item: BOMItemCreate, 
    added_by: str
) -> Optional[ProjectBOM]:
    """Add item to project BOM"""
    if not has_project_edit_access(db, project_id, added_by):
        return None
    
    # Calculate total cost
    total_cost = None
    if bom_item.unit_cost:
        total_cost = bom_item.unit_cost * bom_item.quantity
    
    db_bom_item = ProjectBOM(
        project_id=project_id,
        item_type=bom_item.item_type,
        item_id=bom_item.item_id,
        item_name=bom_item.item_name,
        part_code=bom_item.part_code,
        quantity=bom_item.quantity,
        unit_cost=bom_item.unit_cost,
        total_cost=total_cost,
        usage_notes=bom_item.usage_notes,
        alternatives=[alt.dict() for alt in bom_item.alternatives] if bom_item.alternatives else [],
        is_critical=bom_item.is_critical,
        added_by=added_by
    )
    db.add(db_bom_item)
    
    # Log the addition
    activity_log = ProjectActivityLog(
        project_id=project_id,
        activity_type=ActivityType.BOM_ITEM_ADDED,
        title="BOM item added",
        description=f"Added {bom_item.item_name} (qty: {bom_item.quantity})",
        user_id=added_by,
        user_name="User"
    )
    db.add(activity_log)
    
    db.commit()
    db.refresh(db_bom_item)
    return db_bom_item

def update_bom_item(
    db: Session, 
    bom_item_id: int, 
    bom_update: BOMItemUpdate, 
    updated_by: str
) -> Optional[ProjectBOM]:
    """Update BOM item"""
    bom_item = db.query(ProjectBOM).filter(ProjectBOM.id == bom_item_id).first()
    if not bom_item:
        return None
    
    if not has_project_edit_access(db, bom_item.project_id, updated_by):
        return None
    
    update_data = bom_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bom_item, field, value)
    
    # Recalculate total cost if quantity or unit cost changed
    if 'quantity' in update_data or 'unit_cost' in update_data:
        if bom_item.unit_cost and bom_item.quantity:
            bom_item.total_cost = bom_item.unit_cost * bom_item.quantity
    
    db.commit()
    db.refresh(bom_item)
    return bom_item

def remove_bom_item(db: Session, bom_item_id: int, removed_by: str) -> bool:
    """Remove BOM item"""
    bom_item = db.query(ProjectBOM).filter(ProjectBOM.id == bom_item_id).first()
    if not bom_item:
        return False
    
    if not has_project_edit_access(db, bom_item.project_id, removed_by):
        return False
    
    project_id = bom_item.project_id
    item_name = bom_item.item_name
    
    db.delete(bom_item)
    
    # Log the removal
    activity_log = ProjectActivityLog(
        project_id=project_id,
        activity_type=ActivityType.BOM_ITEM_REMOVED,
        title="BOM item removed",
        description=f"Removed {item_name} from BOM",
        user_id=removed_by,
        user_name="User"
    )
    db.add(activity_log)
    
    db.commit()
    return True

# Equipment reservation operations
def add_equipment_reservation(
    db: Session, 
    project_id: str, 
    reservation: EquipmentReservationCreate, 
    requested_by: str
) -> Optional[ProjectEquipmentReservation]:
    """Add equipment reservation to project"""
    if not has_project_edit_access(db, project_id, requested_by):
        return None
    
    db_reservation = ProjectEquipmentReservation(
        project_id=project_id,
        equipment_id=reservation.equipment_id,
        requested_start=reservation.requested_start,
        requested_end=reservation.requested_end,
        usage_notes=reservation.usage_notes,
        requested_by=requested_by
    )
    db.add(db_reservation)
    
    # Log the reservation
    activity_log = ProjectActivityLog(
        project_id=project_id,
        activity_type=ActivityType.EQUIPMENT_RESERVED,
        title="Equipment reserved",
        description=f"Reserved equipment {reservation.equipment_id}",
        user_id=requested_by,
        user_name="User"
    )
    db.add(activity_log)
    
    db.commit()
    db.refresh(db_reservation)
    return db_reservation

# Milestone operations
def add_milestone(
    db: Session, 
    project_id: str, 
    milestone: MilestoneCreate, 
    created_by: str
) -> Optional[ProjectMilestone]:
    """Add milestone to project"""
    if not has_project_edit_access(db, project_id, created_by):
        return None
    
    # Get next order index
    max_order = db.query(func.max(ProjectMilestone.order_index)).filter(
        ProjectMilestone.project_id == project_id
    ).scalar() or 0
    
    db_milestone = ProjectMilestone(
        project_id=project_id,
        title=milestone.title,
        description=milestone.description,
        target_date=milestone.target_date,
        priority=milestone.priority,
        order_index=max_order + 1,
        created_by=created_by
    )
    db.add(db_milestone)
    
    # Log milestone addition
    activity_log = ProjectActivityLog(
        project_id=project_id,
        activity_type=ActivityType.MILESTONE_ADDED,
        title="Milestone added",
        description=f"Added milestone: {milestone.title}",
        user_id=created_by,
        user_name="User"
    )
    db.add(activity_log)
    
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

def complete_milestone(
    db: Session, 
    milestone_id: int, 
    completed_by: str
) -> Optional[ProjectMilestone]:
    """Mark milestone as completed"""
    milestone = db.query(ProjectMilestone).filter(ProjectMilestone.id == milestone_id).first()
    if not milestone:
        return None
    
    if not has_project_edit_access(db, milestone.project_id, completed_by):
        return None
    
    milestone.is_completed = True
    milestone.completion_date = datetime.utcnow()
    milestone.completed_by = completed_by
    
    # Log completion
    activity_log = ProjectActivityLog(
        project_id=milestone.project_id,
        activity_type=ActivityType.MILESTONE_COMPLETED,
        title="Milestone completed",
        description=f"Completed milestone: {milestone.title}",
        user_id=completed_by,
        user_name="User"
    )
    db.add(activity_log)
    
    db.commit()
    db.refresh(milestone)
    return milestone

# Utility functions
def has_project_access(db: Session, project_id: str, user_id: str) -> bool:
    """Check if user has access to project"""
    collaborator = db.query(ProjectCollaborator).filter(
        and_(
            ProjectCollaborator.project_id == project_id,
            ProjectCollaborator.user_id == user_id
        )
    ).first()
    return collaborator is not None

def has_project_edit_access(db: Session, project_id: str, user_id: str) -> bool:
    """Check if user has edit access to project"""
    collaborator = db.query(ProjectCollaborator).filter(
        and_(
            ProjectCollaborator.project_id == project_id,
            ProjectCollaborator.user_id == user_id
        )
    ).first()
    
    if not collaborator:
        return False
    
    return collaborator.role in [CollaboratorRole.EDITOR, CollaboratorRole.OWNER]

def get_user_projects_summary(db: Session, user_id: str) -> Dict[str, int]:
    """Get summary statistics for user's projects"""
    owned_count = db.query(Project).filter(Project.owner_id == user_id).count()
    
    collaborated_count = db.query(ProjectCollaborator).filter(
        and_(
            ProjectCollaborator.user_id == user_id,
            ProjectCollaborator.role != CollaboratorRole.OWNER
        )
    ).count()
    
    active_count = db.query(Project).join(ProjectCollaborator).filter(
        and_(
            ProjectCollaborator.user_id == user_id,
            Project.status.in_([ProjectStatus.DRAFT, ProjectStatus.IN_PROGRESS])
        )
    ).count()
    
    completed_count = db.query(Project).join(ProjectCollaborator).filter(
        and_(
            ProjectCollaborator.user_id == user_id,
            Project.status == ProjectStatus.COMPLETE
        )
    ).count()
    
    return {
        "owned_projects": owned_count,
        "collaborated_projects": collaborated_count,
        "active_projects": active_count,
        "completed_projects": completed_count
    }

# GitHub Integration Functions
def connect_github_repo(db: Session, project_id: str, repo_url: str, access_token: str = None, user_id: str = None) -> Optional[Project]:
    """Connect a GitHub repository to a project"""
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        return None

    # Initialize GitHub service
    github_service = GitHubService(access_token)

    # Validate repository access
    if not github_service.validate_access(repo_url):
        return None

    # Get repository information
    repo_info = github_service.get_repository_info(repo_url)
    if not repo_info:
        return None

    # Update project with GitHub information
    project.github_repo_url = repo_url
    project.github_repo_name = repo_info.full_name
    project.github_access_token = access_token  # Should be encrypted in production
    project.github_integration_enabled = True
    project.github_default_branch = repo_info.default_branch

    # Log the connection
    if user_id:
        activity_log = ProjectActivityLog(
            project_id=project_id,
            activity_type=ActivityType.GITHUB_REPO_CONNECTED,
            title="GitHub repository connected",
            description=f"Connected repository: {repo_info.full_name}",
            user_id=user_id,
            user_name="User",
            metadata={
                "repo_name": repo_info.full_name,
                "repo_url": repo_url,
                "default_branch": repo_info.default_branch,
                "is_private": repo_info.is_private
            }
        )
        db.add(activity_log)

    db.commit()
    db.refresh(project)
    return project

def disconnect_github_repo(db: Session, project_id: str, user_id: str = None) -> Optional[Project]:
    """Disconnect GitHub repository from a project"""
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        return None

    old_repo_name = project.github_repo_name

    # Clear GitHub integration fields
    project.github_repo_url = None
    project.github_repo_name = None
    project.github_access_token = None
    project.github_integration_enabled = False
    project.github_webhook_secret = None

    # Log the disconnection
    if user_id:
        activity_log = ProjectActivityLog(
            project_id=project_id,
            activity_type=ActivityType.GITHUB_REPO_DISCONNECTED,
            title="GitHub repository disconnected",
            description=f"Disconnected repository: {old_repo_name}",
            user_id=user_id,
            user_name="User",
            metadata={
                "repo_name": old_repo_name
            }
        )
        db.add(activity_log)

    db.commit()
    db.refresh(project)
    return project

def sync_github_activity(db: Session, project_id: str, limit: int = 50) -> List[ProjectActivityLog]:
    """Sync recent GitHub activity for a project"""
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project or not project.github_integration_enabled:
        return []

    github_service = GitHubService(project.github_access_token)
    new_activities = []

    try:
        # Get recent commits
        commits = github_service.get_commits(
            project.github_repo_url,
            project.github_default_branch,
            per_page=min(limit // 3, 20)
        )

        for commit in commits:
            # Check if activity already exists
            existing = db.query(ProjectActivityLog).filter(
                and_(
                    ProjectActivityLog.project_id == project_id,
                    ProjectActivityLog.activity_type == ActivityType.GITHUB_COMMIT_PUSHED,
                    ProjectActivityLog.metadata["commit_sha"].astext == commit.sha
                )
            ).first()

            if not existing:
                activity_log = ProjectActivityLog(
                    project_id=project_id,
                    activity_type=ActivityType.GITHUB_COMMIT_PUSHED,
                    title=f"Commit: {commit.message[:50]}{'...' if len(commit.message) > 50 else ''}",
                    description=commit.message,
                    user_id=commit.author_email,
                    user_name=commit.author_name,
                    created_at=commit.author_date,
                    metadata={
                        "commit_sha": commit.sha,
                        "commit_url": commit.url,
                        "added_files": commit.added_files,
                        "modified_files": commit.modified_files,
                        "removed_files": commit.removed_files
                    }
                )
                db.add(activity_log)
                new_activities.append(activity_log)

        # Get recent pull requests
        pull_requests = github_service.get_pull_requests(
            project.github_repo_url,
            per_page=min(limit // 3, 10)
        )

        for pr in pull_requests:
            activity_type = ActivityType.GITHUB_PULL_REQUEST_OPENED
            if pr.metadata.get("merged"):
                activity_type = ActivityType.GITHUB_PULL_REQUEST_MERGED

            # Check if activity already exists
            existing = db.query(ProjectActivityLog).filter(
                and_(
                    ProjectActivityLog.project_id == project_id,
                    ProjectActivityLog.activity_type == activity_type,
                    ProjectActivityLog.metadata["pr_number"].astext == str(pr.metadata["number"])
                )
            ).first()

            if not existing:
                activity_log = ProjectActivityLog(
                    project_id=project_id,
                    activity_type=activity_type,
                    title=pr.title,
                    description=pr.description,
                    user_id=pr.author,
                    user_name=pr.author,
                    created_at=pr.created_at,
                    metadata={
                        "pr_number": pr.metadata["number"],
                        "pr_url": pr.url,
                        "head_branch": pr.metadata["head_branch"],
                        "base_branch": pr.metadata["base_branch"]
                    }
                )
                db.add(activity_log)
                new_activities.append(activity_log)

        # Get recent issues
        issues = github_service.get_issues(
            project.github_repo_url,
            per_page=min(limit // 3, 10)
        )

        for issue in issues:
            activity_type = ActivityType.GITHUB_ISSUE_CREATED if issue.action == "open" else ActivityType.GITHUB_ISSUE_CLOSED

            # Check if activity already exists
            existing = db.query(ProjectActivityLog).filter(
                and_(
                    ProjectActivityLog.project_id == project_id,
                    ProjectActivityLog.activity_type == activity_type,
                    ProjectActivityLog.metadata["issue_number"].astext == str(issue.metadata["number"])
                )
            ).first()

            if not existing:
                activity_log = ProjectActivityLog(
                    project_id=project_id,
                    activity_type=activity_type,
                    title=issue.title,
                    description=issue.description,
                    user_id=issue.author,
                    user_name=issue.author,
                    created_at=issue.created_at,
                    metadata={
                        "issue_number": issue.metadata["number"],
                        "issue_url": issue.url,
                        "labels": issue.metadata.get("labels", [])
                    }
                )
                db.add(activity_log)
                new_activities.append(activity_log)

        db.commit()
        return new_activities

    except Exception as e:
        print(f"Error syncing GitHub activity: {e}")
        db.rollback()
        return []

def get_github_files(db: Session, project_id: str, path: str = "", branch: str = None):
    """Get files from connected GitHub repository"""
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project or not project.github_integration_enabled:
        return []

    github_service = GitHubService(project.github_access_token)
    branch = branch or project.github_default_branch

    return github_service.get_repository_files(project.github_repo_url, path, branch)

def get_github_file_content(db: Session, project_id: str, file_path: str, branch: str = None):
    """Get content of a specific file from GitHub repository"""
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project or not project.github_integration_enabled:
        return None

    github_service = GitHubService(project.github_access_token)
    branch = branch or project.github_default_branch

    return github_service.get_file_content(project.github_repo_url, file_path, branch)
