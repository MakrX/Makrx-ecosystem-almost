from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
from datetime import datetime, timedelta

from ..database import get_db
from ..models.projects import Project, ProjectCollaborator
from ..models.member import Member
from ..schemas.project_showcase import (
    ShowcaseProjectResponse,
    FeaturedMakerResponse,
    ProjectStatsResponse,
    ShowcaseFiltersResponse
)
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/v1/projects", tags=["project-showcase"])

@router.get("/showcase", response_model=List[ShowcaseProjectResponse])
async def get_showcase_projects(
    category: Optional[str] = Query(None, description="Filter by category"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty level"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    sort_by: str = Query("trending", description="Sort by: trending, newest, popular, most_liked, most_forked"),
    limit: int = Query(50, ge=1, le=100, description="Number of projects to return"),
    offset: int = Query(0, ge=0, description="Number of projects to skip"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get showcase projects with filtering and sorting options"""
    
    # Build base query for public projects
    query = db.query(Project).filter(
        Project.visibility == 'public',
        Project.is_approved == True
    )
    
    # Apply filters
    if category:
        query = query.filter(Project.category == category)
    
    if difficulty:
        query = query.filter(Project.difficulty_level == difficulty)
    
    if tags:
        tag_list = [tag.strip() for tag in tags.split(',')]
        for tag in tag_list:
            query = query.filter(Project.tags.contains([tag]))
    
    # Apply sorting
    if sort_by == "newest":
        query = query.order_by(Project.created_at.desc())
    elif sort_by == "popular":
        query = query.order_by(Project.view_count.desc())
    elif sort_by == "most_liked":
        query = query.order_by(Project.like_count.desc())
    elif sort_by == "most_forked":
        query = query.order_by(Project.fork_count.desc())
    elif sort_by == "recently_updated":
        query = query.order_by(Project.updated_at.desc())
    else:  # trending
        # Calculate trending score based on recent activity
        query = query.order_by(
            (Project.like_count + Project.view_count + Project.fork_count).desc(),
            Project.updated_at.desc()
        )
    
    # Apply pagination
    projects = query.offset(offset).limit(limit).all()
    
    # Convert to showcase format with additional data
    showcase_projects = []
    for project in projects:
        # Get project owner info
        owner = db.query(Member).filter(Member.user_id == project.owner_id).first()
        
        # Get collaborator count
        collaborator_count = db.query(ProjectCollaborator).filter(
            ProjectCollaborator.project_id == project.project_id
        ).count()
        
        # Calculate completion rate (mock calculation)
        completion_rate = min(95, max(10, 50 + (project.like_count * 2)))
        
        # Generate mock BOM data
        bom_items = [
            {
                "name": f"Component {i+1}",
                "quantity": i + 1,
                "estimated_cost": (i + 1) * 5,
                "supplier": "MakrX Store" if i % 2 == 0 else "Local Supplier"
            }
            for i in range(min(5, project.bom_items_count or 0))
        ]
        
        # Generate mock skills and equipment
        skills_required = project.required_skills or ["3D Printing", "Electronics", "Programming"][:3]
        equipment_used = ["3D Printer", "Soldering Station", "Multimeter"][:3]
        
        # Generate mock awards
        awards = []
        if project.is_featured:
            awards.append({
                "type": "featured",
                "name": "Featured Project",
                "icon": "⭐",
                "awarded_at": project.featured_at.isoformat() if project.featured_at else datetime.utcnow().isoformat()
            })
        
        showcase_project = ShowcaseProjectResponse(
            project_id=project.project_id,
            name=project.name,
            description=project.description,
            owner_id=project.owner_id,
            owner_name=owner.name if owner else "Unknown Maker",
            owner_avatar=getattr(owner, 'avatar_url', None) if owner else None,
            makerspace_name=getattr(owner, 'makerspace_name', None) if owner else None,
            makerspace_id=project.makerspace_id,
            visibility="public",
            status=project.status,
            difficulty_level=project.difficulty_level or "intermediate",
            estimated_time=project.estimated_time or "2-4 hours",
            category=project.category or "Electronics",
            subcategories=project.subcategories or [],
            tags=project.tags or [],
            skills_required=skills_required,
            equipment_used=equipment_used,
            view_count=project.view_count or 0,
            like_count=project.like_count or 0,
            fork_count=project.fork_count or 0,
            comment_count=project.comment_count or 0,
            download_count=project.download_count or 0,
            completion_rate=completion_rate,
            thumbnail_url=project.thumbnail_url,
            gallery_images=project.gallery_images or [],
            demo_video_url=project.demo_video_url,
            bill_of_materials=bom_items,
            total_estimated_cost=sum(item["estimated_cost"] * item["quantity"] for item in bom_items),
            is_featured=project.is_featured or False,
            is_staff_pick=project.is_staff_pick or False,
            is_trending=project.is_trending or False,
            awards=awards,
            created_at=project.created_at.isoformat(),
            updated_at=project.updated_at.isoformat(),
            featured_at=project.featured_at.isoformat() if project.featured_at else None,
            is_liked=False,  # TODO: Check if current user liked this project
            is_bookmarked=False,  # TODO: Check if current user bookmarked this project
            is_following_owner=False  # TODO: Check if current user follows the owner
        )
        
        showcase_projects.append(showcase_project)
    
    return showcase_projects

@router.get("/showcase/filters", response_model=ShowcaseFiltersResponse)
async def get_showcase_filters(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get available filter options for showcase"""
    
    # Get distinct categories
    categories = db.query(Project.category).filter(
        Project.visibility == 'public',
        Project.category.isnot(None)
    ).distinct().all()
    categories = [cat[0] for cat in categories if cat[0]]
    
    # Get all tags from public projects
    all_tags = []
    projects_with_tags = db.query(Project.tags).filter(
        Project.visibility == 'public',
        Project.tags.isnot(None)
    ).all()
    
    for project_tags in projects_with_tags:
        if project_tags[0]:
            all_tags.extend(project_tags[0])
    
    unique_tags = list(set(all_tags))
    
    # Get skills
    all_skills = []
    projects_with_skills = db.query(Project.required_skills).filter(
        Project.visibility == 'public',
        Project.required_skills.isnot(None)
    ).all()
    
    for project_skills in projects_with_skills:
        if project_skills[0]:
            all_skills.extend(project_skills[0])
    
    unique_skills = list(set(all_skills))
    
    # Fallback to mock data if no data available
    if not categories:
        categories = ['3D Printing', 'Electronics', 'Woodworking', 'Robotics', 'IoT', 'Art & Design', 'Automation', 'Tools']
    
    if not unique_tags:
        unique_tags = ['Arduino', 'Raspberry Pi', 'CAD', 'LED', 'Sensors', 'Motors', 'WiFi', 'Bluetooth', '3D Printed', 'Open Source']
    
    if not unique_skills:
        unique_skills = ['Soldering', '3D Modeling', 'Programming', 'Circuit Design', 'Woodworking', 'CAD Design', 'Electronics']
    
    return ShowcaseFiltersResponse(
        categories=sorted(categories),
        tags=sorted(unique_tags),
        skills=sorted(unique_skills),
        difficulty_levels=['beginner', 'intermediate', 'advanced', 'expert']
    )

@router.get("/showcase/featured", response_model=List[ShowcaseProjectResponse])
async def get_featured_projects(
    limit: int = Query(10, ge=1, le=20),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get featured projects for carousel"""
    
    featured_projects = db.query(Project).filter(
        Project.visibility == 'public',
        Project.is_featured == True,
        Project.is_approved == True
    ).order_by(Project.featured_at.desc()).limit(limit).all()
    
    # Convert to showcase format (similar to main showcase endpoint)
    showcase_projects = []
    for project in featured_projects:
        owner = db.query(Member).filter(Member.user_id == project.owner_id).first()
        
        showcase_project = ShowcaseProjectResponse(
            project_id=project.project_id,
            name=project.name,
            description=project.description,
            owner_id=project.owner_id,
            owner_name=owner.name if owner else "Unknown Maker",
            owner_avatar=getattr(owner, 'avatar_url', None) if owner else None,
            makerspace_name=getattr(owner, 'makerspace_name', None) if owner else None,
            makerspace_id=project.makerspace_id,
            visibility="public",
            status=project.status,
            difficulty_level=project.difficulty_level or "intermediate",
            estimated_time=project.estimated_time or "2-4 hours",
            category=project.category or "Electronics",
            subcategories=project.subcategories or [],
            tags=project.tags or [],
            skills_required=project.required_skills or ["3D Printing", "Electronics"],
            equipment_used=["3D Printer", "Soldering Station"],
            view_count=project.view_count or 0,
            like_count=project.like_count or 0,
            fork_count=project.fork_count or 0,
            comment_count=project.comment_count or 0,
            download_count=project.download_count or 0,
            completion_rate=75,  # Mock completion rate
            thumbnail_url=project.thumbnail_url,
            gallery_images=project.gallery_images or [],
            demo_video_url=project.demo_video_url,
            bill_of_materials=[],
            total_estimated_cost=project.estimated_cost or 50,
            is_featured=True,
            is_staff_pick=project.is_staff_pick or False,
            is_trending=project.is_trending or False,
            awards=[{
                "type": "featured",
                "name": "Featured Project",
                "icon": "⭐",
                "awarded_at": project.featured_at.isoformat() if project.featured_at else datetime.utcnow().isoformat()
            }],
            created_at=project.created_at.isoformat(),
            updated_at=project.updated_at.isoformat(),
            featured_at=project.featured_at.isoformat() if project.featured_at else None,
            is_liked=False,
            is_bookmarked=False,
            is_following_owner=False
        )
        
        showcase_projects.append(showcase_project)
    
    return showcase_projects

@router.get("/showcase/trending", response_model=List[ShowcaseProjectResponse])
async def get_trending_projects(
    limit: int = Query(10, ge=1, le=20),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get trending projects for widget"""
    
    # Get projects with high recent activity
    recent_date = datetime.utcnow() - timedelta(days=7)
    
    trending_projects = db.query(Project).filter(
        Project.visibility == 'public',
        Project.updated_at >= recent_date,
        Project.is_approved == True
    ).order_by(
        (Project.like_count + Project.view_count + Project.fork_count).desc()
    ).limit(limit).all()
    
    # Convert to showcase format
    showcase_projects = []
    for project in trending_projects:
        owner = db.query(Member).filter(Member.user_id == project.owner_id).first()
        
        showcase_project = ShowcaseProjectResponse(
            project_id=project.project_id,
            name=project.name,
            description=project.description,
            owner_id=project.owner_id,
            owner_name=owner.name if owner else "Unknown Maker",
            owner_avatar=getattr(owner, 'avatar_url', None) if owner else None,
            makerspace_name=getattr(owner, 'makerspace_name', None) if owner else None,
            makerspace_id=project.makerspace_id,
            visibility="public",
            status=project.status,
            difficulty_level=project.difficulty_level or "intermediate",
            estimated_time=project.estimated_time or "2-4 hours",
            category=project.category or "Electronics",
            subcategories=project.subcategories or [],
            tags=project.tags or [],
            skills_required=project.required_skills or ["3D Printing", "Electronics"],
            equipment_used=["3D Printer", "Soldering Station"],
            view_count=project.view_count or 0,
            like_count=project.like_count or 0,
            fork_count=project.fork_count or 0,
            comment_count=project.comment_count or 0,
            download_count=project.download_count or 0,
            completion_rate=75,
            thumbnail_url=project.thumbnail_url,
            gallery_images=project.gallery_images or [],
            demo_video_url=project.demo_video_url,
            bill_of_materials=[],
            total_estimated_cost=project.estimated_cost or 50,
            is_featured=project.is_featured or False,
            is_staff_pick=project.is_staff_pick or False,
            is_trending=True,
            awards=[],
            created_at=project.created_at.isoformat(),
            updated_at=project.updated_at.isoformat(),
            featured_at=project.featured_at.isoformat() if project.featured_at else None,
            is_liked=False,
            is_bookmarked=False,
            is_following_owner=False
        )
        
        showcase_projects.append(showcase_project)
    
    return showcase_projects

@router.get("/showcase/stats", response_model=ProjectStatsResponse)
async def get_showcase_stats(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get showcase statistics"""
    
    total_projects = db.query(Project).filter(
        Project.visibility == 'public',
        Project.is_approved == True
    ).count()
    
    featured_projects = db.query(Project).filter(
        Project.visibility == 'public',
        Project.is_featured == True
    ).count()
    
    trending_projects = db.query(Project).filter(
        Project.visibility == 'public',
        Project.is_trending == True
    ).count()
    
    total_makers = db.query(Member).count()
    
    return ProjectStatsResponse(
        total_projects=total_projects,
        featured_projects=featured_projects,
        trending_projects=trending_projects,
        total_makers=total_makers,
        total_likes=sum(p.like_count or 0 for p in db.query(Project.like_count).all()),
        total_views=sum(p.view_count or 0 for p in db.query(Project.view_count).all())
    )

@router.post("/{project_id}/like")
async def like_project(
    project_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like a project"""
    
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # TODO: Implement actual like tracking in database
    # For now, just increment the like count
    project.like_count = (project.like_count or 0) + 1
    db.commit()
    
    return {"status": "liked", "like_count": project.like_count}

@router.delete("/{project_id}/like")
async def unlike_project(
    project_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlike a project"""
    
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # TODO: Implement actual like tracking in database
    # For now, just decrement the like count
    project.like_count = max(0, (project.like_count or 0) - 1)
    db.commit()
    
    return {"status": "unliked", "like_count": project.like_count}

@router.post("/{project_id}/bookmark")
async def bookmark_project(
    project_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bookmark a project"""
    
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # TODO: Implement actual bookmark tracking in database
    return {"status": "bookmarked"}

@router.delete("/{project_id}/bookmark")
async def unbookmark_project(
    project_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove bookmark from a project"""
    
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # TODO: Implement actual bookmark tracking in database
    return {"status": "unbookmarked"}
