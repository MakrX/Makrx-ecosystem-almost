from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from .. import models
from ..database import get_db
from ..dependencies import get_current_user
from ..schemas.project import (
    ProjectForkCreate, ProjectForkResponse, ProjectCommentCreate, ProjectCommentResponse,
    BOMOrderCreate, BOMOrderResponse, ProjectTeamRoleCreate, ProjectTeamRoleResponse,
    ResourceSharingCreate, ResourceSharingResponse, PublicProjectsFilter,
    EnhancedProjectSummaryResponse
)

router = APIRouter()
security = HTTPBearer()

# Enhanced project discovery routes
@router.get("/public", response_model=List[EnhancedProjectSummaryResponse])
async def get_public_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    difficulty_level: Optional[str] = Query(None),
    required_skills: Optional[List[str]] = Query(None),
    required_equipment: Optional[List[str]] = Query(None),
    license_type: Optional[str] = Query(None),
    min_likes: Optional[int] = Query(None),
    featured_only: bool = Query(False),
    has_bom: Optional[bool] = Query(None),
    has_files: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("updated_at", regex="^(updated_at|created_at|like_count|view_count|name)$"),
    sort_direction: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """Get public projects with enhanced filtering for discovery"""
    query = db.query(models.Project).filter(
        models.Project.visibility == models.ProjectVisibility.PUBLIC,
        models.Project.is_approved == True
    )
    
    # Apply filters
    if difficulty_level:
        query = query.filter(models.Project.difficulty_level == difficulty_level)
    
    if required_skills:
        for skill in required_skills:
            query = query.filter(models.Project.required_skills.contains([skill]))
    
    if required_equipment:
        for equipment in required_equipment:
            query = query.filter(models.Project.required_equipment.contains([equipment]))
    
    if license_type:
        query = query.filter(models.Project.license_type == license_type)
    
    if min_likes is not None:
        query = query.filter(models.Project.like_count >= min_likes)
    
    if featured_only:
        query = query.filter(models.Project.is_featured == True)
    
    if has_bom is not None:
        if has_bom:
            query = query.filter(models.Project.bom_items.any())
        else:
            query = query.filter(~models.Project.bom_items.any())
    
    if has_files is not None:
        if has_files:
            query = query.filter(models.Project.files.any())
        else:
            query = query.filter(~models.Project.files.any())
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            models.Project.name.ilike(search_term) |
            models.Project.description.ilike(search_term) |
            models.Project.tags.astext.ilike(search_term)
        )
    
    # Apply sorting
    if sort_direction == "asc":
        query = query.order_by(getattr(models.Project, sort_by).asc())
    else:
        query = query.order_by(getattr(models.Project, sort_by).desc())
    
    projects = query.offset(skip).limit(limit).all()
    
    # Convert to enhanced response format
    enhanced_projects = []
    for project in projects:
        enhanced_project = EnhancedProjectSummaryResponse.from_orm(project)
        enhanced_project.collaborator_count = len(project.collaborators)
        enhanced_project.bom_items_count = len(project.bom_items)
        enhanced_project.files_count = len(project.files)
        enhanced_project.milestones_count = len(project.milestones)
        enhanced_project.completed_milestones_count = len([m for m in project.milestones if m.is_completed])
        enhanced_projects.append(enhanced_project)
    
    return enhanced_projects

# Project forking routes
@router.post("/{project_id}/fork", response_model=ProjectForkResponse, status_code=status.HTTP_201_CREATED)
async def fork_project(
    project_id: str,
    fork_data: ProjectForkCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fork a public project"""
    # Get original project
    original_project = db.query(models.Project).filter(
        models.Project.project_id == project_id,
        models.Project.visibility == models.ProjectVisibility.PUBLIC
    ).first()
    
    if not original_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not public"
        )
    
    # Create new project as fork
    new_project_id = str(uuid.uuid4())
    forked_project = models.Project(
        project_id=new_project_id,
        name=fork_data.new_project_name,
        description=f"Forked from: {original_project.name}\n\n{original_project.description or ''}",
        project_type=original_project.project_type,
        owner_id=current_user["user_id"],
        visibility=models.ProjectVisibility.PRIVATE,  # Forks start as private
        tags=original_project.tags.copy() if original_project.tags else [],
        difficulty_level=original_project.difficulty_level,
        estimated_duration=original_project.estimated_duration,
        required_skills=original_project.required_skills.copy() if original_project.required_skills else [],
        learning_objectives=original_project.learning_objectives.copy() if original_project.learning_objectives else [],
        license_type=original_project.license_type,
        required_equipment=original_project.required_equipment.copy() if original_project.required_equipment else [],
        space_requirements=original_project.space_requirements,
        safety_considerations=original_project.safety_considerations
    )
    db.add(forked_project)
    db.flush()
    
    # Copy BOM items
    for bom_item in original_project.bom_items:
        new_bom_item = models.ProjectBOM(
            project_id=new_project_id,
            item_type=bom_item.item_type,
            item_id=bom_item.item_id,
            item_name=bom_item.item_name,
            part_code=bom_item.part_code,
            quantity=bom_item.quantity,
            unit_cost=bom_item.unit_cost,
            total_cost=bom_item.total_cost,
            usage_notes=bom_item.usage_notes,
            alternatives=bom_item.alternatives,
            is_critical=bom_item.is_critical,
            makrx_product_code=bom_item.makrx_product_code,
            makrx_store_url=bom_item.makrx_store_url,
            category=bom_item.category,
            specifications=bom_item.specifications,
            compatibility_notes=bom_item.compatibility_notes,
            added_by=current_user["user_id"]
        )
        db.add(new_bom_item)
    
    # Copy milestones
    for milestone in original_project.milestones:
        new_milestone = models.ProjectMilestone(
            project_id=new_project_id,
            title=milestone.title,
            description=milestone.description,
            target_date=milestone.target_date,
            priority=milestone.priority,
            order_index=milestone.order_index,
            created_by=current_user["user_id"]
        )
        db.add(new_milestone)
    
    # Add owner as collaborator
    owner_collaborator = models.ProjectCollaborator(
        project_id=new_project_id,
        user_id=current_user["user_id"],
        role=models.CollaboratorRole.OWNER,
        invited_by=current_user["user_id"],
        accepted_at=datetime.utcnow()
    )
    db.add(owner_collaborator)
    
    # Create fork record
    fork_record = models.ProjectFork(
        original_project_id=project_id,
        forked_project_id=new_project_id,
        forked_by=current_user["user_id"],
        fork_reason=fork_data.fork_reason,
        modifications_planned=fork_data.modifications_planned
    )
    db.add(fork_record)
    
    # Update fork count on original project
    original_project.fork_count += 1
    
    # Log activity
    activity_log = models.ProjectActivityLog(
        project_id=project_id,
        activity_type=models.ActivityType.PROJECT_UPDATED,
        title="Project forked",
        description=f"Project forked by {current_user.get('user_name', 'Unknown User')} as '{fork_data.new_project_name}'",
        user_id=current_user["user_id"],
        user_name=current_user.get("user_name", "Unknown User"),
        metadata={"forked_project_id": new_project_id}
    )
    db.add(activity_log)
    
    db.commit()
    db.refresh(fork_record)
    return fork_record

# Project likes routes
@router.post("/{project_id}/like", status_code=status.HTTP_201_CREATED)
async def like_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like a public project"""
    # Check if project exists and is public
    project = db.query(models.Project).filter(
        models.Project.project_id == project_id,
        models.Project.visibility == models.ProjectVisibility.PUBLIC
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not public"
        )
    
    # Check if already liked
    existing_like = db.query(models.ProjectLike).filter(
        models.ProjectLike.project_id == project_id,
        models.ProjectLike.user_id == current_user["user_id"]
    ).first()
    
    if existing_like:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Project already liked"
        )
    
    # Create like
    like = models.ProjectLike(
        project_id=project_id,
        user_id=current_user["user_id"]
    )
    db.add(like)
    
    # Update like count
    project.like_count += 1
    
    db.commit()
    return {"message": "Project liked successfully"}

@router.delete("/{project_id}/like", status_code=status.HTTP_204_NO_CONTENT)
async def unlike_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlike a project"""
    like = db.query(models.ProjectLike).filter(
        models.ProjectLike.project_id == project_id,
        models.ProjectLike.user_id == current_user["user_id"]
    ).first()
    
    if not like:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Like not found"
        )
    
    # Remove like and update count
    project = db.query(models.Project).filter(models.Project.project_id == project_id).first()
    if project:
        project.like_count = max(0, project.like_count - 1)
    
    db.delete(like)
    db.commit()

# Project comments routes
@router.post("/{project_id}/comments", response_model=ProjectCommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    project_id: str,
    comment_data: ProjectCommentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add comment to a public project"""
    # Check if project exists and is public
    project = db.query(models.Project).filter(
        models.Project.project_id == project_id,
        models.Project.visibility == models.ProjectVisibility.PUBLIC
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not public"
        )
    
    comment = models.ProjectComment(
        project_id=project_id,
        user_id=current_user["user_id"],
        comment_text=comment_data.comment_text,
        is_question=comment_data.is_question,
        is_suggestion=comment_data.is_suggestion,
        parent_comment_id=comment_data.parent_comment_id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

@router.get("/{project_id}/comments", response_model=List[ProjectCommentResponse])
async def get_comments(
    project_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get comments for a public project"""
    # Check if project exists and is public
    project = db.query(models.Project).filter(
        models.Project.project_id == project_id,
        models.Project.visibility == models.ProjectVisibility.PUBLIC
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not public"
        )
    
    comments = db.query(models.ProjectComment).filter(
        models.ProjectComment.project_id == project_id,
        models.ProjectComment.is_approved == True,
        models.ProjectComment.parent_comment_id.is_(None)  # Top-level comments only
    ).order_by(models.ProjectComment.created_at.desc()).offset(skip).limit(limit).all()
    
    return comments

# BOM ordering through MakrX Store
@router.post("/{project_id}/bom/order", response_model=BOMOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_bom_order(
    project_id: str,
    order_data: BOMOrderCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create order for BOM item through MakrX Store"""
    # Check project access
    from ..crud.project import has_project_edit_access
    if not has_project_edit_access(db, project_id, current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Get BOM item
    bom_item = db.query(models.ProjectBOM).filter(
        models.ProjectBOM.id == order_data.bom_item_id,
        models.ProjectBOM.project_id == project_id
    ).first()
    
    if not bom_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM item not found"
        )
    
    # Create order record
    order = models.ProjectBOMOrder(
        project_id=project_id,
        bom_item_id=order_data.bom_item_id,
        quantity_ordered=order_data.quantity_ordered,
        ordered_by=current_user["user_id"]
    )
    
    # If it's a MakrX Store item, integrate with store API
    if bom_item.item_type == "makrx_store" and bom_item.makrx_product_code:
        try:
            # This would integrate with the actual MakrX Store API
            # For now, we'll simulate the order creation
            order.makrx_order_id = f"MAKRX-{int(datetime.utcnow().timestamp())}"
            order.unit_price = bom_item.unit_cost
            order.total_price = bom_item.unit_cost * order_data.quantity_ordered if bom_item.unit_cost else None
            order.order_status = "confirmed"
            
            # Update BOM item procurement status
            bom_item.procurement_status = "ordered"
            
        except Exception as e:
            order.order_status = "failed"
    
    db.add(order)
    
    # Log activity
    activity_log = models.ProjectActivityLog(
        project_id=project_id,
        activity_type=models.ActivityType.BOM_ITEM_UPDATED,
        title="BOM item ordered",
        description=f"Ordered {order_data.quantity_ordered}x {bom_item.item_name}",
        user_id=current_user["user_id"],
        user_name=current_user.get("user_name", "Unknown User"),
        metadata={"order_id": order.id, "quantity": order_data.quantity_ordered}
    )
    db.add(activity_log)
    
    db.commit()
    db.refresh(order)
    return order

# Team role management
@router.post("/{project_id}/team-roles", response_model=ProjectTeamRoleResponse, status_code=status.HTTP_201_CREATED)
async def assign_team_role(
    project_id: str,
    role_data: ProjectTeamRoleCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assign custom team role to project collaborator"""
    from ..crud.project import has_project_edit_access
    if not has_project_edit_access(db, project_id, current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Check if user is a collaborator
    collaborator = db.query(models.ProjectCollaborator).filter(
        models.ProjectCollaborator.project_id == project_id,
        models.ProjectCollaborator.user_id == role_data.user_id
    ).first()
    
    if not collaborator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not a collaborator on this project"
        )
    
    # Create team role
    team_role = models.ProjectTeamRole(
        project_id=project_id,
        user_id=role_data.user_id,
        role_name=role_data.role_name,
        role_description=role_data.role_description,
        permissions=role_data.permissions,
        assigned_by=current_user["user_id"]
    )
    db.add(team_role)
    
    # Log activity
    activity_log = models.ProjectActivityLog(
        project_id=project_id,
        activity_type=models.ActivityType.MEMBER_ROLE_CHANGED,
        title="Team role assigned",
        description=f"Assigned '{role_data.role_name}' role to {role_data.user_id}",
        user_id=current_user["user_id"],
        user_name=current_user.get("user_name", "Unknown User")
    )
    db.add(activity_log)
    
    db.commit()
    db.refresh(team_role)
    return team_role

# Resource sharing between projects
@router.post("/{project_id}/share-resource", response_model=ResourceSharingResponse, status_code=status.HTTP_201_CREATED)
async def share_resource(
    project_id: str,
    sharing_data: ResourceSharingCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Share project resource with another project"""
    from ..crud.project import has_project_edit_access
    if not has_project_edit_access(db, project_id, current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Check if target project exists
    target_project = db.query(models.Project).filter(
        models.Project.project_id == sharing_data.target_project_id
    ).first()
    
    if not target_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target project not found"
        )
    
    # Create sharing record
    sharing = models.ProjectResourceSharing(
        source_project_id=project_id,
        target_project_id=sharing_data.target_project_id,
        resource_type=sharing_data.resource_type,
        resource_id=sharing_data.resource_id,
        shared_by=current_user["user_id"],
        sharing_notes=sharing_data.sharing_notes
    )
    db.add(sharing)
    db.commit()
    db.refresh(sharing)
    return sharing
