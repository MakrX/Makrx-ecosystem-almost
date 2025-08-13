from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from .. import models

from ..database import get_db
from ..dependencies import get_current_user
from ..schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectResponse, ProjectSummaryResponse,
    CollaboratorAdd, CollaboratorUpdate, BOMItemCreate, BOMItemUpdate,
    EquipmentReservationCreate, EquipmentReservationUpdate,
    MilestoneCreate, MilestoneUpdate, ProjectFilter, ProjectSort,
    ProjectStatistics, UserProjectStatistics, FileUpload,
    GitHubRepoConnect, GitHubRepoInfo, GitHubFile, GitHubCommit
)
from ..crud import project as crud_project

router = APIRouter()
security = HTTPBearer()

# Project management routes
@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project: ProjectCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new project"""
    try:
        # Generate unique project ID if not provided
        if not project.project_id:
            project.project_id = str(uuid.uuid4())
        
        # Check if project ID already exists
        existing = crud_project.get_project(db, project.project_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Project ID already exists"
            )
        
        # Create project
        db_project = crud_project.create_project(db, project, current_user["user_id"])
        return db_project
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}"
        )

@router.get("/", response_model=List[ProjectSummaryResponse])
async def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[List[str]] = Query(None),
    visibility_filter: Optional[List[str]] = Query(None),
    owner_id: Optional[str] = Query(None),
    makerspace_id: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
    is_featured: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    sort_field: str = Query("updated_at"),
    sort_direction: str = Query("desc"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get projects with filtering and pagination"""
    try:
        # Build filters
        filters = ProjectFilter(
            status=status_filter,
            visibility=visibility_filter,
            owner_id=owner_id,
            makerspace_id=makerspace_id,
            tags=tags,
            is_featured=is_featured,
            search=search
        )
        
        sort = ProjectSort(field=sort_field, direction=sort_direction)
        
        projects = crud_project.get_projects(
            db, current_user["user_id"], skip, limit, filters, sort
        )
        
        # Convert to summary response with counts
        summary_projects = []
        for project in projects:
            summary = ProjectSummaryResponse.from_orm(project)
            summary.collaborator_count = len(project.collaborators)
            summary.bom_items_count = len(project.bom_items)
            summary.files_count = len(project.files)
            summary.milestones_count = len(project.milestones)
            summary.completed_milestones_count = len([m for m in project.milestones if m.is_completed])
            summary_projects.append(summary)
        
        return summary_projects
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch projects: {str(e)}"
        )

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get project by ID"""
    project = crud_project.get_project(db, project_id, current_user["user_id"])
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied"
        )
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update project"""
    project = crud_project.update_project(db, project_id, project_update, current_user["user_id"])
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or insufficient permissions"
        )
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete project"""
    success = crud_project.delete_project(db, project_id, current_user["user_id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or insufficient permissions"
        )

# Team management routes
@router.post("/{project_id}/collaborators", status_code=status.HTTP_201_CREATED)
async def add_collaborator(
    project_id: str,
    collaborator: CollaboratorAdd,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add collaborator to project"""
    result = crud_project.add_collaborator(db, project_id, collaborator, current_user["user_id"])
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to add collaborator - insufficient permissions or user already exists"
        )
    return {"message": "Collaborator added successfully"}

@router.put("/{project_id}/collaborators/{user_id}")
async def update_collaborator_role(
    project_id: str,
    user_id: str,
    role_update: CollaboratorUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update collaborator role"""
    result = crud_project.update_collaborator_role(
        db, project_id, user_id, role_update, current_user["user_id"]
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collaborator not found or insufficient permissions"
        )
    return {"message": "Collaborator role updated successfully"}

@router.delete("/{project_id}/collaborators/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_collaborator(
    project_id: str,
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove collaborator from project"""
    success = crud_project.remove_collaborator(db, project_id, user_id, current_user["user_id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collaborator not found or insufficient permissions"
        )

# BOM management routes
@router.post("/{project_id}/bom", status_code=status.HTTP_201_CREATED)
async def add_bom_item(
    project_id: str,
    bom_item: BOMItemCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add item to project BOM"""
    result = crud_project.add_bom_item(db, project_id, bom_item, current_user["user_id"])
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to add BOM item - insufficient permissions"
        )
    return result

@router.put("/{project_id}/bom/{bom_item_id}")
async def update_bom_item(
    project_id: str,
    bom_item_id: int,
    bom_update: BOMItemUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update BOM item"""
    result = crud_project.update_bom_item(db, bom_item_id, bom_update, current_user["user_id"])
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM item not found or insufficient permissions"
        )
    return result

@router.delete("/{project_id}/bom/{bom_item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_bom_item(
    project_id: str,
    bom_item_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove item from project BOM"""
    success = crud_project.remove_bom_item(db, bom_item_id, current_user["user_id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM item not found or insufficient permissions"
        )

@router.post("/{project_id}/bom/{bom_item_id}/reorder", status_code=status.HTTP_201_CREATED)
async def reorder_bom_item(
    project_id: str,
    bom_item_id: int,
    reorder_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create reorder request for BOM item"""
    if not crud_project.has_project_edit_access(db, project_id, current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create reorder requests"
        )

    # Get BOM item
    bom_item = db.query(models.ProjectBOM).filter(models.ProjectBOM.id == bom_item_id).first()
    if not bom_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM item not found"
        )

    # Create reorder request (this would integrate with inventory/procurement system)
    reorder_request = {
        "project_id": project_id,
        "item_id": bom_item.item_id,
        "item_name": bom_item.item_name,
        "quantity": reorder_data.get("quantity", bom_item.quantity),
        "urgent": reorder_data.get("urgent", bom_item.is_critical),
        "requested_by": current_user["user_id"],
        "requested_at": datetime.utcnow(),
        "status": "pending"
    }

    # Log the reorder activity
    activity_log = models.ProjectActivityLog(
        project_id=project_id,
        activity_type=models.ActivityType.BOM_ITEM_UPDATED,
        title="Reorder requested",
        description=f"Reorder requested for {bom_item.item_name} (qty: {reorder_request['quantity']})",
        user_id=current_user["user_id"],
        user_name="User",
        metadata=reorder_request
    )
    db.add(activity_log)

    # Update BOM item status
    bom_item.procurement_status = "ordered"

    db.commit()

    return {
        "message": "Reorder request created successfully",
        "reorder_id": f"ro-{int(datetime.utcnow().timestamp())}",
        "estimated_delivery": "3-5 business days"
    }

# Equipment reservation routes
@router.post("/{project_id}/equipment", status_code=status.HTTP_201_CREATED)
async def add_equipment_reservation(
    project_id: str,
    reservation: EquipmentReservationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add equipment reservation to project"""
    result = crud_project.add_equipment_reservation(
        db, project_id, reservation, current_user["user_id"]
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to add equipment reservation - insufficient permissions"
        )
    return result

@router.put("/{project_id}/equipment/{reservation_id}")
async def update_equipment_reservation(
    project_id: str,
    reservation_id: int,
    reservation_update: EquipmentReservationUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update equipment reservation"""
    # Implementation would go here - similar pattern to other updates
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Equipment reservation update not yet implemented"
    )

@router.delete("/{project_id}/equipment/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_equipment_reservation(
    project_id: str,
    reservation_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove equipment reservation from project"""
    # Implementation would go here - similar pattern to other deletions
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Equipment reservation removal not yet implemented"
    )

# Milestone management routes
@router.post("/{project_id}/milestones", status_code=status.HTTP_201_CREATED)
async def add_milestone(
    project_id: str,
    milestone: MilestoneCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add milestone to project"""
    result = crud_project.add_milestone(db, project_id, milestone, current_user["user_id"])
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to add milestone - insufficient permissions"
        )
    return result

@router.put("/{project_id}/milestones/{milestone_id}")
async def update_milestone(
    project_id: str,
    milestone_id: int,
    milestone_update: MilestoneUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update milestone"""
    # Implementation would follow similar pattern
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Milestone update not yet implemented"
    )

@router.post("/{project_id}/milestones/{milestone_id}/complete")
async def complete_milestone(
    project_id: str,
    milestone_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark milestone as completed"""
    result = crud_project.complete_milestone(db, milestone_id, current_user["user_id"])
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found or insufficient permissions"
        )
    return {"message": "Milestone marked as completed"}

@router.delete("/{project_id}/milestones/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_milestone(
    project_id: str,
    milestone_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete milestone"""
    # Implementation would go here
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Milestone deletion not yet implemented"
    )

# File management routes
@router.post("/{project_id}/files", status_code=status.HTTP_201_CREATED)
async def upload_file(
    project_id: str,
    file: UploadFile = File(...),
    description: Optional[str] = None,
    is_public: bool = False,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload file to project"""
    # Check permissions
    if not crud_project.has_project_edit_access(db, project_id, current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to upload files"
        )
    
    # This would need file storage implementation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="File upload not yet implemented - requires file storage setup"
    )

@router.get("/{project_id}/files")
async def get_project_files(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get project files"""
    project = crud_project.get_project(db, project_id, current_user["user_id"])
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied"
        )
    return project.files

@router.delete("/{project_id}/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    project_id: str,
    file_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete project file"""
    # Implementation would go here
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="File deletion not yet implemented"
    )

# Analytics and statistics routes
@router.get("/analytics/user-stats", response_model=UserProjectStatistics)
async def get_user_project_statistics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's project statistics"""
    stats = crud_project.get_user_projects_summary(db, current_user["user_id"])
    return UserProjectStatistics(**stats)

@router.get("/analytics/global-stats", response_model=ProjectStatistics)
async def get_global_project_statistics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get global project statistics (admin only)"""
    # Check if user is admin
    if current_user.get("role") not in ["super_admin", "makerspace_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Implementation would calculate global stats
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Global statistics not yet implemented"
    )

# Admin management routes
@router.put("/{project_id}/admin/approve")
async def approve_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve project (admin only)"""
    if current_user.get("role") not in ["super_admin", "makerspace_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    project = crud_project.get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Update approval status
    update_data = ProjectUpdate(is_approved=True)
    updated_project = crud_project.update_project(db, project_id, update_data, current_user["user_id"])
    
    return {"message": "Project approved successfully"}

@router.put("/{project_id}/admin/feature")
async def feature_project(
    project_id: str,
    featured: bool = True,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Feature/unfeature project (admin only)"""
    if current_user.get("role") not in ["super_admin", "makerspace_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    project = crud_project.get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Update featured status
    update_data = ProjectUpdate(is_featured=featured)
    updated_project = crud_project.update_project(db, project_id, update_data, current_user["user_id"])
    
    action = "featured" if featured else "unfeatured"
    return {"message": f"Project {action} successfully"}

# GitHub Integration Routes
@router.post("/{project_id}/github/connect")
async def connect_github_repository(
    project_id: str,
    github_data: GitHubRepoConnect,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Connect a GitHub repository to the project"""
    # Check permissions
    if not crud_project.has_project_edit_access(db, project_id, current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to connect GitHub repository"
        )

    result = crud_project.connect_github_repo(
        db, project_id, github_data.repo_url, github_data.access_token, current_user["user_id"]
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to connect GitHub repository. Check repository URL and access permissions."
        )

    return {"message": "GitHub repository connected successfully"}

@router.delete("/{project_id}/github/disconnect")
async def disconnect_github_repository(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disconnect GitHub repository from the project"""
    # Check permissions
    if not crud_project.has_project_edit_access(db, project_id, current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to disconnect GitHub repository"
        )

    result = crud_project.disconnect_github_repo(db, project_id, current_user["user_id"])

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return {"message": "GitHub repository disconnected successfully"}

@router.post("/{project_id}/github/sync")
async def sync_github_activity(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sync recent GitHub activity for the project"""
    # Check permissions
    if not crud_project.has_project_access(db, project_id, current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    new_activities = crud_project.sync_github_activity(db, project_id)

    return {
        "message": f"Synced {len(new_activities)} new GitHub activities",
        "activities_count": len(new_activities)
    }

@router.get("/{project_id}/github/files", response_model=List[GitHubFile])
async def get_github_files(
    project_id: str,
    path: str = Query("", description="Directory path in repository"),
    branch: str = Query(None, description="Branch name (defaults to repository default)"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get files from connected GitHub repository"""
    # Check permissions
    if not crud_project.has_project_access(db, project_id, current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    files = crud_project.get_github_files(db, project_id, path, branch)
    return files

@router.get("/{project_id}/github/files/content")
async def get_github_file_content(
    project_id: str,
    file_path: str = Query(..., description="File path in repository"),
    branch: str = Query(None, description="Branch name (defaults to repository default)"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get content of a specific file from GitHub repository"""
    # Check permissions
    if not crud_project.has_project_access(db, project_id, current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    content = crud_project.get_github_file_content(db, project_id, file_path, branch)

    if content is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or GitHub integration not enabled"
        )

    return {"file_path": file_path, "content": content}

@router.get("/{project_id}/github/commits", response_model=List[GitHubCommit])
async def get_github_commits(
    project_id: str,
    branch: str = Query(None, description="Branch name (defaults to repository default)"),
    per_page: int = Query(30, ge=1, le=100),
    page: int = Query(1, ge=1),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get commit history from connected GitHub repository"""
    # Check permissions
    if not crud_project.has_project_access(db, project_id, current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    project = crud_project.get_project(db, project_id, current_user["user_id"])
    if not project or not project.github_integration_enabled:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or GitHub integration not enabled"
        )

    from ..utils.github_service import GitHubService
    github_service = GitHubService(project.github_access_token)
    branch = branch or project.github_default_branch

    commits = github_service.get_commits(project.github_repo_url, branch, per_page, page)
    return commits

@router.post("/{project_id}/github/readme/generate")
async def generate_project_readme(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate and commit README.md file to connected GitHub repository"""
    # Check permissions
    if not crud_project.has_project_edit_access(db, project_id, current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to generate README"
        )

    from ..utils.readme_generator import create_github_readme, generate_project_readme

    project = crud_project.get_project(db, project_id, current_user["user_id"])
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    if project.github_integration_enabled:
        # Create README in GitHub repository
        success = create_github_readme(db, project_id, current_user["user_id"])
        if success:
            return {"message": "README.md generated and committed to GitHub repository"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create README in GitHub repository"
            )
    else:
        # Generate README content for preview/download
        readme_content = generate_project_readme(project)
        return {
            "message": "README content generated",
            "content": readme_content,
            "suggestion": "Connect a GitHub repository to automatically commit README files"
        }
