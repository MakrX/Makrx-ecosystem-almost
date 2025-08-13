from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

from models.skill import Skill, UserSkill, SkillRequest, SkillAuditLog, SkillStatus, RequestStatus
from schemas.skill import (
    SkillCreate, SkillUpdate, UserSkillCreate, UserSkillUpdate,
    SkillRequestCreate, SkillRequestUpdate, EquipmentAccessCheck
)

# Skill CRUD Operations
def create_skill(db: Session, skill: SkillCreate) -> Skill:
    skill_id = str(uuid.uuid4())
    
    db_skill = Skill(
        id=skill_id,
        name=skill.name,
        category=skill.category,
        level=skill.level,
        description=skill.description,
        status=skill.status,
        makerspace_id=skill.makerspace_id
    )
    
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    
    # Add prerequisites if provided
    if skill.prerequisite_ids:
        prerequisites = db.query(Skill).filter(Skill.id.in_(skill.prerequisite_ids)).all()
        db_skill.prerequisites.extend(prerequisites)
        db.commit()
    
    return db_skill

def get_skill(db: Session, skill_id: str) -> Optional[Skill]:
    return db.query(Skill).options(
        joinedload(Skill.prerequisites),
        joinedload(Skill.equipment)
    ).filter(Skill.id == skill_id).first()

def get_skills(
    db: Session, 
    makerspace_id: Optional[str] = None,
    category: Optional[str] = None,
    level: Optional[str] = None,
    status: str = "active",
    skip: int = 0, 
    limit: int = 100
) -> List[Skill]:
    query = db.query(Skill).options(joinedload(Skill.prerequisites))
    
    if makerspace_id:
        query = query.filter(Skill.makerspace_id == makerspace_id)
    if category:
        query = query.filter(Skill.category == category)
    if level:
        query = query.filter(Skill.level == level)
    if status:
        query = query.filter(Skill.status == status)
    
    return query.offset(skip).limit(limit).all()

def update_skill(db: Session, skill_id: str, skill_update: SkillUpdate) -> Optional[Skill]:
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not db_skill:
        return None
    
    update_data = skill_update.dict(exclude_unset=True)
    
    # Handle prerequisites separately
    if "prerequisite_ids" in update_data:
        prerequisite_ids = update_data.pop("prerequisite_ids")
        if prerequisite_ids is not None:
            prerequisites = db.query(Skill).filter(Skill.id.in_(prerequisite_ids)).all()
            db_skill.prerequisites = prerequisites
    
    # Update other fields
    for field, value in update_data.items():
        setattr(db_skill, field, value)
    
    db.commit()
    db.refresh(db_skill)
    return db_skill

def delete_skill(db: Session, skill_id: str) -> bool:
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not db_skill:
        return False
    
    # Check if skill is being used
    user_skills_count = db.query(UserSkill).filter(UserSkill.skill_id == skill_id).count()
    if user_skills_count > 0:
        # Soft delete by marking as disabled
        db_skill.status = "disabled"
        db.commit()
        return True
    
    db.delete(db_skill)
    db.commit()
    return True

# User Skill CRUD Operations
def create_user_skill(db: Session, user_skill: UserSkillCreate, certified_by: Optional[str] = None) -> UserSkill:
    user_skill_id = str(uuid.uuid4())
    
    db_user_skill = UserSkill(
        id=user_skill_id,
        user_id=user_skill.user_id,
        skill_id=user_skill.skill_id,
        status=user_skill.status,
        notes=user_skill.notes,
        quiz_score=user_skill.quiz_score,
        certified_by=certified_by or user_skill.certified_by
    )
    
    if user_skill.status == SkillStatus.CERTIFIED:
        db_user_skill.certified_at = datetime.utcnow()
    
    db.add(db_user_skill)
    db.commit()
    db.refresh(db_user_skill)
    
    # Create audit log
    create_skill_audit_log(
        db, 
        action="granted" if user_skill.status == SkillStatus.CERTIFIED else "pending",
        user_id=user_skill.user_id,
        skill_id=user_skill.skill_id,
        performed_by=certified_by
    )
    
    return db_user_skill

def get_user_skills(
    db: Session, 
    user_id: Optional[str] = None,
    skill_id: Optional[str] = None,
    status: Optional[SkillStatus] = None,
    makerspace_id: Optional[str] = None
) -> List[UserSkill]:
    query = db.query(UserSkill).join(Skill)
    
    if user_id:
        query = query.filter(UserSkill.user_id == user_id)
    if skill_id:
        query = query.filter(UserSkill.skill_id == skill_id)
    if status:
        query = query.filter(UserSkill.status == status)
    if makerspace_id:
        query = query.filter(Skill.makerspace_id == makerspace_id)
    
    return query.all()

def update_user_skill(db: Session, user_skill_id: str, user_skill_update: UserSkillUpdate, updated_by: Optional[str] = None) -> Optional[UserSkill]:
    db_user_skill = db.query(UserSkill).filter(UserSkill.id == user_skill_id).first()
    if not db_user_skill:
        return None
    
    old_status = db_user_skill.status
    update_data = user_skill_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_user_skill, field, value)
    
    # Update certification timestamp if status changed to certified
    if user_skill_update.status == SkillStatus.CERTIFIED and old_status != SkillStatus.CERTIFIED:
        db_user_skill.certified_at = datetime.utcnow()
        db_user_skill.certified_by = updated_by or db_user_skill.certified_by
    
    db.commit()
    db.refresh(db_user_skill)
    
    # Create audit log for status changes
    if user_skill_update.status and user_skill_update.status != old_status:
        create_skill_audit_log(
            db,
            action=user_skill_update.status.value,
            user_id=db_user_skill.user_id,
            skill_id=db_user_skill.skill_id,
            performed_by=updated_by
        )
    
    return db_user_skill

def revoke_user_skill(db: Session, user_skill_id: str, reason: Optional[str] = None, revoked_by: Optional[str] = None) -> Optional[UserSkill]:
    db_user_skill = db.query(UserSkill).filter(UserSkill.id == user_skill_id).first()
    if not db_user_skill:
        return None
    
    db_user_skill.status = SkillStatus.REVOKED
    db_user_skill.notes = f"Revoked: {reason}" if reason else "Revoked"
    
    db.commit()
    db.refresh(db_user_skill)
    
    # Create audit log
    create_skill_audit_log(
        db,
        action="revoked",
        user_id=db_user_skill.user_id,
        skill_id=db_user_skill.skill_id,
        performed_by=revoked_by,
        reason=reason
    )
    
    return db_user_skill

# Skill Request CRUD Operations
def create_skill_request(db: Session, skill_request: SkillRequestCreate, user_id: str) -> SkillRequest:
    # Check if there's already a pending request for this skill
    existing_request = db.query(SkillRequest).filter(
        and_(
            SkillRequest.user_id == user_id,
            SkillRequest.skill_id == skill_request.skill_id,
            SkillRequest.status == RequestStatus.PENDING
        )
    ).first()
    
    if existing_request:
        return existing_request
    
    request_id = str(uuid.uuid4())
    
    db_request = SkillRequest(
        id=request_id,
        user_id=user_id,
        skill_id=skill_request.skill_id,
        reason=skill_request.reason,
        notes=skill_request.notes,
        status=RequestStatus.PENDING
    )
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    # Create audit log
    create_skill_audit_log(
        db,
        action="requested",
        user_id=user_id,
        skill_id=skill_request.skill_id,
        performed_by=user_id,
        reason=skill_request.reason
    )
    
    return db_request

def get_skill_requests(
    db: Session,
    makerspace_id: Optional[str] = None,
    status: Optional[RequestStatus] = None,
    user_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[SkillRequest]:
    query = db.query(SkillRequest).join(Skill)
    
    if makerspace_id:
        query = query.filter(Skill.makerspace_id == makerspace_id)
    if status:
        query = query.filter(SkillRequest.status == status)
    if user_id:
        query = query.filter(SkillRequest.user_id == user_id)
    
    return query.order_by(desc(SkillRequest.created_at)).offset(skip).limit(limit).all()

def update_skill_request(db: Session, request_id: str, request_update: SkillRequestUpdate, reviewed_by: str) -> Optional[SkillRequest]:
    db_request = db.query(SkillRequest).filter(SkillRequest.id == request_id).first()
    if not db_request:
        return None
    
    old_status = db_request.status
    update_data = request_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_request, field, value)
    
    db_request.reviewed_by = reviewed_by
    db_request.reviewed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_request)
    
    # If approved, create the user skill
    if request_update.status == RequestStatus.APPROVED and old_status != RequestStatus.APPROVED:
        user_skill_create = UserSkillCreate(
            user_id=db_request.user_id,
            skill_id=db_request.skill_id,
            status=SkillStatus.CERTIFIED,
            notes=f"Approved from request: {db_request.reason}"
        )
        create_user_skill(db, user_skill_create, certified_by=reviewed_by)
    
    return db_request

# Equipment Access Control
def check_equipment_access(db: Session, user_id: str, equipment_id: str) -> EquipmentAccessCheck:
    # Get equipment's required skills
    from models.equipment import Equipment
    equipment = db.query(Equipment).options(joinedload(Equipment.required_skills)).filter(Equipment.id == equipment_id).first()
    
    if not equipment:
        return EquipmentAccessCheck(
            equipment_id=equipment_id,
            equipment_name="Unknown Equipment",
            can_access=False,
            reason="Equipment not found"
        )
    
    # If no skills required, access is granted
    if not equipment.required_skills:
        return EquipmentAccessCheck(
            equipment_id=equipment_id,
            equipment_name=equipment.name,
            can_access=True
        )
    
    # Get user's certified skills
    user_skills = db.query(UserSkill).join(Skill).filter(
        and_(
            UserSkill.user_id == user_id,
            UserSkill.status == SkillStatus.CERTIFIED,
            or_(UserSkill.expires_at.is_(None), UserSkill.expires_at > datetime.utcnow())
        )
    ).all()
    
    user_skill_ids = {us.skill_id for us in user_skills}
    required_skill_ids = {skill.id for skill in equipment.required_skills}
    missing_skill_ids = required_skill_ids - user_skill_ids
    
    if missing_skill_ids:
        missing_skills = db.query(Skill).filter(Skill.id.in_(missing_skill_ids)).all()
        return EquipmentAccessCheck(
            equipment_id=equipment_id,
            equipment_name=equipment.name,
            can_access=False,
            missing_skills=[skill.name for skill in missing_skills],
            reason=f"Missing required skills: {', '.join([skill.name for skill in missing_skills])}"
        )
    
    return EquipmentAccessCheck(
        equipment_id=equipment_id,
        equipment_name=equipment.name,
        can_access=True,
        user_skills=[skill.name for skill in equipment.required_skills]
    )

def get_user_accessible_equipment(db: Session, user_id: str, makerspace_id: Optional[str] = None) -> List[str]:
    from models.equipment import Equipment
    
    query = db.query(Equipment)
    if makerspace_id:
        query = query.filter(Equipment.linked_makerspace_id == makerspace_id)
    
    equipment_list = query.all()
    accessible_equipment = []
    
    for equipment in equipment_list:
        access_check = check_equipment_access(db, user_id, equipment.id)
        if access_check.can_access:
            accessible_equipment.append(equipment.id)
    
    return accessible_equipment

# Audit Log
def create_skill_audit_log(
    db: Session,
    action: str,
    user_id: str,
    skill_id: str,
    performed_by: Optional[str] = None,
    reason: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> SkillAuditLog:
    log_id = str(uuid.uuid4())
    
    audit_log = SkillAuditLog(
        id=log_id,
        action=action,
        user_id=user_id,
        skill_id=skill_id,
        performed_by=performed_by,
        reason=reason,
        metadata=str(metadata) if metadata else None
    )
    
    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)
    
    return audit_log

def get_skill_audit_logs(
    db: Session,
    user_id: Optional[str] = None,
    skill_id: Optional[str] = None,
    action: Optional[str] = None,
    days_back: int = 30,
    skip: int = 0,
    limit: int = 100
) -> List[SkillAuditLog]:
    query = db.query(SkillAuditLog)
    
    if user_id:
        query = query.filter(SkillAuditLog.user_id == user_id)
    if skill_id:
        query = query.filter(SkillAuditLog.skill_id == skill_id)
    if action:
        query = query.filter(SkillAuditLog.action == action)
    
    # Filter by date
    cutoff_date = datetime.utcnow() - timedelta(days=days_back)
    query = query.filter(SkillAuditLog.created_at >= cutoff_date)
    
    return query.order_by(desc(SkillAuditLog.created_at)).offset(skip).limit(limit).all()

# Analytics and Statistics
def get_skill_analytics(db: Session, makerspace_id: str) -> Dict[str, Any]:
    # Get skill statistics
    total_skills = db.query(Skill).filter(Skill.makerspace_id == makerspace_id).count()
    active_skills = db.query(Skill).filter(
        and_(Skill.makerspace_id == makerspace_id, Skill.status == "active")
    ).count()
    
    # Get user skill statistics
    total_user_skills = db.query(UserSkill).join(Skill).filter(
        Skill.makerspace_id == makerspace_id
    ).count()
    
    certified_user_skills = db.query(UserSkill).join(Skill).filter(
        and_(
            Skill.makerspace_id == makerspace_id,
            UserSkill.status == SkillStatus.CERTIFIED
        )
    ).count()
    
    pending_requests = db.query(SkillRequest).join(Skill).filter(
        and_(
            Skill.makerspace_id == makerspace_id,
            SkillRequest.status == RequestStatus.PENDING
        )
    ).count()
    
    return {
        "total_skills": total_skills,
        "active_skills": active_skills,
        "total_user_skills": total_user_skills,
        "certified_user_skills": certified_user_skills,
        "pending_requests": pending_requests,
        "certification_rate": certified_user_skills / total_user_skills if total_user_skills > 0 else 0
    }
