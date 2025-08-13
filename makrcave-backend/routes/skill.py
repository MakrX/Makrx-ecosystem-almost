from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from database import get_db
from dependencies import get_current_user, require_role
from models.skill import SkillStatus, RequestStatus
from schemas.skill import (
    Skill, SkillCreate, SkillUpdate, SkillWithRelations,
    UserSkill, UserSkillCreate, UserSkillUpdate, UserSkillWithDetails,
    SkillRequest, SkillRequestCreate, SkillRequestUpdate, SkillRequestWithDetails,
    EquipmentSkillRequirements, UserSkillSummary, EquipmentAccessCheck,
    BulkAccessCheck, SkillAnalytics, MakerspaceSkillOverview
)
from crud import skill as skill_crud

router = APIRouter(prefix="/api/v1/skills", tags=["skills"])

# Skill Management Routes

@router.post("/", response_model=Skill)
async def create_skill(
    skill: SkillCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["super_admin", "makerspace_admin"]))
):
    """Create a new skill (Admin only)"""
    return skill_crud.create_skill(db=db, skill=skill)

@router.get("/", response_model=List[SkillWithRelations])
async def get_skills(
    makerspace_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    status: str = Query("active"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all skills with optional filtering"""
    skills = skill_crud.get_skills(
        db=db, 
        makerspace_id=makerspace_id,
        category=category,
        level=level,
        status=status,
        skip=skip, 
        limit=limit
    )
    
    # Add user count for each skill
    result = []
    for skill in skills:
        user_count = len(skill_crud.get_user_skills(db=db, skill_id=skill.id, status=SkillStatus.CERTIFIED))
        skill_dict = skill.__dict__.copy()
        skill_dict['user_count'] = user_count
        skill_dict['equipment_ids'] = [eq.id for eq in skill.equipment]
        result.append(SkillWithRelations(**skill_dict))
    
    return result

@router.get("/{skill_id}", response_model=SkillWithRelations)
async def get_skill(
    skill_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific skill by ID"""
    skill = skill_crud.get_skill(db=db, skill_id=skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    user_count = len(skill_crud.get_user_skills(db=db, skill_id=skill.id, status=SkillStatus.CERTIFIED))
    skill_dict = skill.__dict__.copy()
    skill_dict['user_count'] = user_count
    skill_dict['equipment_ids'] = [eq.id for eq in skill.equipment]
    
    return SkillWithRelations(**skill_dict)

@router.put("/{skill_id}", response_model=Skill)
async def update_skill(
    skill_id: str,
    skill_update: SkillUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["super_admin", "makerspace_admin"]))
):
    """Update a skill (Admin only)"""
    skill = skill_crud.update_skill(db=db, skill_id=skill_id, skill_update=skill_update)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill

@router.delete("/{skill_id}")
async def delete_skill(
    skill_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["super_admin", "makerspace_admin"]))
):
    """Delete or disable a skill (Admin only)"""
    success = skill_crud.delete_skill(db=db, skill_id=skill_id)
    if not success:
        raise HTTPException(status_code=404, detail="Skill not found")
    return {"message": "Skill deleted or disabled successfully"}

# User Skill Management Routes

@router.post("/user-skills", response_model=UserSkill)
async def grant_user_skill(
    user_skill: UserSkillCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["super_admin", "makerspace_admin"]))
):
    """Grant a skill to a user (Admin only)"""
    return skill_crud.create_user_skill(
        db=db, 
        user_skill=user_skill, 
        certified_by=current_user.id
    )

@router.get("/user-skills", response_model=List[UserSkillWithDetails])
async def get_user_skills(
    user_id: Optional[str] = Query(None),
    skill_id: Optional[str] = Query(None),
    status: Optional[SkillStatus] = Query(None),
    makerspace_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get user skills with optional filtering"""
    # If no user_id specified and not admin, show only current user's skills
    if not user_id and current_user.role not in ["super_admin", "makerspace_admin"]:
        user_id = current_user.id
    
    user_skills = skill_crud.get_user_skills(
        db=db,
        user_id=user_id,
        skill_id=skill_id,
        status=status,
        makerspace_id=makerspace_id
    )
    
    # Enhance with additional details
    result = []
    for us in user_skills:
        # Get skill details
        skill = skill_crud.get_skill(db=db, skill_id=us.skill_id)
        # Get user details (would need user CRUD)
        # Get certifier details (would need user CRUD)
        
        us_dict = us.__dict__.copy()
        us_dict['skill_name'] = skill.name if skill else "Unknown"
        us_dict['skill_category'] = skill.category if skill else "Unknown"
        us_dict['skill_level'] = skill.level if skill else "beginner"
        us_dict['user_name'] = "User Name"  # Would get from user service
        us_dict['user_email'] = "user@example.com"  # Would get from user service
        us_dict['certifier_name'] = "Certifier Name" if us.certified_by else None
        
        result.append(UserSkillWithDetails(**us_dict))
    
    return result

@router.put("/user-skills/{user_skill_id}", response_model=UserSkill)
async def update_user_skill(
    user_skill_id: str,
    user_skill_update: UserSkillUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["super_admin", "makerspace_admin"]))
):
    """Update a user's skill status (Admin only)"""
    user_skill = skill_crud.update_user_skill(
        db=db, 
        user_skill_id=user_skill_id, 
        user_skill_update=user_skill_update,
        updated_by=current_user.id
    )
    if not user_skill:
        raise HTTPException(status_code=404, detail="User skill not found")
    return user_skill

@router.post("/user-skills/{user_skill_id}/revoke", response_model=UserSkill)
async def revoke_user_skill(
    user_skill_id: str,
    reason: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["super_admin", "makerspace_admin"]))
):
    """Revoke a user's skill (Admin only)"""
    user_skill = skill_crud.revoke_user_skill(
        db=db,
        user_skill_id=user_skill_id,
        reason=reason,
        revoked_by=current_user.id
    )
    if not user_skill:
        raise HTTPException(status_code=404, detail="User skill not found")
    return user_skill

# Skill Request Routes

@router.post("/requests", response_model=SkillRequest)
async def create_skill_request(
    skill_request: SkillRequestCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Request a skill certification"""
    return skill_crud.create_skill_request(
        db=db, 
        skill_request=skill_request, 
        user_id=current_user.id
    )

@router.get("/requests", response_model=List[SkillRequestWithDetails])
async def get_skill_requests(
    makerspace_id: Optional[str] = Query(None),
    status: Optional[RequestStatus] = Query(None),
    user_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get skill requests with optional filtering"""
    # If not admin and no user_id specified, show only current user's requests
    if current_user.role not in ["super_admin", "makerspace_admin"] and not user_id:
        user_id = current_user.id
    
    requests = skill_crud.get_skill_requests(
        db=db,
        makerspace_id=makerspace_id,
        status=status,
        user_id=user_id,
        skip=skip,
        limit=limit
    )
    
    # Enhance with additional details
    result = []
    for req in requests:
        skill = skill_crud.get_skill(db=db, skill_id=req.skill_id)
        
        req_dict = req.__dict__.copy()
        req_dict['skill_name'] = skill.name if skill else "Unknown"
        req_dict['skill_category'] = skill.category if skill else "Unknown"
        req_dict['skill_level'] = skill.level if skill else "beginner"
        req_dict['user_name'] = "User Name"  # Would get from user service
        req_dict['user_email'] = "user@example.com"  # Would get from user service
        req_dict['reviewer_name'] = "Reviewer Name" if req.reviewed_by else None
        
        result.append(SkillRequestWithDetails(**req_dict))
    
    return result

@router.put("/requests/{request_id}", response_model=SkillRequest)
async def update_skill_request(
    request_id: str,
    request_update: SkillRequestUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["super_admin", "makerspace_admin"]))
):
    """Approve or reject a skill request (Admin only)"""
    request = skill_crud.update_skill_request(
        db=db, 
        request_id=request_id, 
        request_update=request_update, 
        reviewed_by=current_user.id
    )
    if not request:
        raise HTTPException(status_code=404, detail="Skill request not found")
    return request

# Equipment Access Control Routes

@router.get("/access/equipment/{equipment_id}", response_model=EquipmentAccessCheck)
async def check_equipment_access(
    equipment_id: str,
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Check if a user can access specific equipment"""
    check_user_id = user_id if user_id and current_user.role in ["super_admin", "makerspace_admin"] else current_user.id
    
    return skill_crud.check_equipment_access(
        db=db, 
        user_id=check_user_id, 
        equipment_id=equipment_id
    )

@router.get("/access/equipment", response_model=BulkAccessCheck)
async def check_bulk_equipment_access(
    user_id: Optional[str] = Query(None),
    makerspace_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Check user's access to all equipment"""
    check_user_id = user_id if user_id and current_user.role in ["super_admin", "makerspace_admin"] else current_user.id
    
    # Get all equipment in makerspace
    from crud.equipment import get_equipment
    equipment_list = get_equipment(db=db, makerspace_id=makerspace_id)
    
    access_checks = []
    accessible_count = 0
    
    for equipment in equipment_list:
        access_check = skill_crud.check_equipment_access(
            db=db, 
            user_id=check_user_id, 
            equipment_id=equipment.id
        )
        access_checks.append(access_check)
        if access_check.can_access:
            accessible_count += 1
    
    return BulkAccessCheck(
        user_id=check_user_id,
        equipment_access=access_checks,
        summary={
            "total_equipment": len(equipment_list),
            "accessible_equipment": accessible_count,
            "access_percentage": (accessible_count / len(equipment_list) * 100) if equipment_list else 0
        }
    )

@router.get("/equipment-requirements", response_model=List[EquipmentSkillRequirements])
async def get_equipment_skill_requirements(
    makerspace_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get skill requirements for all equipment"""
    from crud.equipment import get_equipment
    equipment_list = get_equipment(db=db, makerspace_id=makerspace_id)
    
    result = []
    for equipment in equipment_list:
        if hasattr(equipment, 'required_skills') and equipment.required_skills:
            skill_requirements = []
            for skill in equipment.required_skills:
                skill_requirements.append({
                    "skill_id": skill.id,
                    "skill_name": skill.name,
                    "skill_level": skill.level,
                    "required_level": skill.level,  # Could be different if equipment requires higher level
                    "category": skill.category,
                    "is_required": True
                })
            
            result.append(EquipmentSkillRequirements(
                equipment_id=equipment.id,
                equipment_name=equipment.name,
                required_skills=skill_requirements
            ))
    
    return result

# User Skill Summary Routes

@router.get("/users/{user_id}/summary", response_model=UserSkillSummary)
async def get_user_skill_summary(
    user_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get comprehensive skill summary for a user"""
    # Check permission
    if user_id != current_user.id and current_user.role not in ["super_admin", "makerspace_admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    user_skills = skill_crud.get_user_skills(db=db, user_id=user_id)
    
    total_skills = len(user_skills)
    certified_skills = len([us for us in user_skills if us.status == SkillStatus.CERTIFIED])
    pending_skills = len([us for us in user_skills if us.status == SkillStatus.PENDING])
    expired_skills = len([us for us in user_skills if us.status == SkillStatus.EXPIRED])
    
    # Get accessible equipment count
    accessible_equipment = skill_crud.get_user_accessible_equipment(db=db, user_id=user_id)
    
    # Enhance user skills with details (similar to get_user_skills)
    detailed_skills = []
    for us in user_skills:
        skill = skill_crud.get_skill(db=db, skill_id=us.skill_id)
        us_dict = us.__dict__.copy()
        us_dict['skill_name'] = skill.name if skill else "Unknown"
        us_dict['skill_category'] = skill.category if skill else "Unknown"
        us_dict['skill_level'] = skill.level if skill else "beginner"
        us_dict['user_name'] = "User Name"
        us_dict['user_email'] = "user@example.com"
        us_dict['certifier_name'] = "Certifier Name" if us.certified_by else None
        detailed_skills.append(UserSkillWithDetails(**us_dict))
    
    return UserSkillSummary(
        user_id=user_id,
        user_name="User Name",  # Would get from user service
        user_email="user@example.com",  # Would get from user service
        total_skills=total_skills,
        certified_skills=certified_skills,
        pending_skills=pending_skills,
        expired_skills=expired_skills,
        accessible_equipment_count=len(accessible_equipment),
        skills=detailed_skills
    )

# Analytics Routes

@router.get("/analytics/makerspace/{makerspace_id}", response_model=MakerspaceSkillOverview)
async def get_makerspace_skill_analytics(
    makerspace_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["super_admin", "makerspace_admin"]))
):
    """Get skill analytics for a makerspace (Admin only)"""
    analytics = skill_crud.get_skill_analytics(db=db, makerspace_id=makerspace_id)
    
    # Get skill distribution by category and level
    skills = skill_crud.get_skills(db=db, makerspace_id=makerspace_id, limit=1000)
    
    skill_distribution = {}
    level_distribution = {}
    skill_analytics = []
    
    for skill in skills:
        # Category distribution
        skill_distribution[skill.category] = skill_distribution.get(skill.category, 0) + 1
        
        # Level distribution
        level_distribution[skill.level.value] = level_distribution.get(skill.level.value, 0) + 1
        
        # Individual skill analytics
        user_skills = skill_crud.get_user_skills(db=db, skill_id=skill.id)
        requests = skill_crud.get_skill_requests(db=db, skill_id=skill.id)
        
        total_requests = len(requests)
        pending_requests = len([r for r in requests if r.status == RequestStatus.PENDING])
        certified_users = len([us for us in user_skills if us.status == SkillStatus.CERTIFIED])
        approved_requests = len([r for r in requests if r.status == RequestStatus.APPROVED])
        
        success_rate = (approved_requests / total_requests * 100) if total_requests > 0 else 0
        
        skill_analytics.append(SkillAnalytics(
            skill_id=skill.id,
            skill_name=skill.name,
            category=skill.category,
            level=skill.level,
            total_requests=total_requests,
            pending_requests=pending_requests,
            certified_users=certified_users,
            success_rate=success_rate
        ))
    
    return MakerspaceSkillOverview(
        makerspace_id=makerspace_id,
        makerspace_name="Makerspace Name",  # Would get from makerspace service
        total_skills=analytics["total_skills"],
        total_certified_users=analytics["certified_user_skills"],
        total_pending_requests=analytics["pending_requests"],
        skill_distribution=skill_distribution,
        level_distribution=level_distribution,
        skills=skill_analytics
    )

# Audit Log Routes

@router.get("/audit-logs")
async def get_skill_audit_logs(
    user_id: Optional[str] = Query(None),
    skill_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    days_back: int = Query(30, ge=1, le=365),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["super_admin", "makerspace_admin"]))
):
    """Get skill audit logs (Admin only)"""
    return skill_crud.get_skill_audit_logs(
        db=db,
        user_id=user_id,
        skill_id=skill_id,
        action=action,
        days_back=days_back,
        skip=skip,
        limit=limit
    )
