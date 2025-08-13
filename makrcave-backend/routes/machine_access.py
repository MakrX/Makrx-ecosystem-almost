from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import and_, or_, desc, asc, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

from ..database import get_db
from ..dependencies import get_current_user, get_current_user_optional
from ..models.machine_access import (
    MachineAccessRule, UserCertification, Badge, UserBadge, 
    MachineAccessAttempt, SafetyIncident, SkillAssessment,
    AccessLevel, BadgeType, BadgeRarity, AccessAttemptResult, CertificationStatus
)
from ..models.equipment import Equipment
from ..models.skill import Skill
from ..schemas.machine_access import (
    MachineAccessRuleCreate, MachineAccessRuleUpdate, MachineAccessRuleResponse,
    UserCertificationCreate, UserCertificationUpdate, UserCertificationResponse,
    BadgeCreate, BadgeUpdate, BadgeResponse, UserBadgeAward, UserBadgeResponse,
    MachineAccessRequest, MachineAccessResponse, MachineAccessAttemptResponse,
    SafetyIncidentCreate, SafetyIncidentUpdate, SafetyIncidentResponse,
    SkillAssessmentCreate, SkillAssessmentUpdate, SkillAssessmentResponse,
    UserAccessProfile, EquipmentAccessStats, MakerspaceAccessDashboard,
    BadgeProgress, CertificationRenewalAlert
)

router = APIRouter(prefix="/api/v1/machine-access", tags=["machine-access"])

# Machine Access Rules
@router.post("/rules", response_model=MachineAccessRuleResponse)
async def create_access_rule(
    rule: MachineAccessRuleCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new machine access rule"""
    user_role = current_user.get("role", "user")
    
    if user_role not in ["super_admin", "makerspace_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create access rules"
        )
    
    # Verify equipment and skill exist
    equipment = db.query(Equipment).filter(Equipment.id == rule.equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    skill = db.query(Skill).filter(Skill.id == rule.required_skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    try:
        rule_id = f"rule_{uuid.uuid4().hex[:12]}"
        
        db_rule = MachineAccessRule(
            id=rule_id,
            equipment_id=rule.equipment_id,
            required_skill_id=rule.required_skill_id,
            minimum_skill_level=rule.minimum_skill_level,
            requires_supervisor=rule.requires_supervisor,
            supervisor_skill_level=rule.supervisor_skill_level,
            max_session_hours=rule.max_session_hours,
            cooldown_hours=rule.cooldown_hours,
            safety_briefing_required=rule.safety_briefing_required,
            safety_quiz_required=rule.safety_quiz_required,
            safety_quiz_passing_score=rule.safety_quiz_passing_score,
            allowed_hours_start=rule.allowed_hours_start,
            allowed_hours_end=rule.allowed_hours_end,
            allowed_days=rule.allowed_days,
            advance_booking_required=rule.advance_booking_required,
            min_advance_hours=rule.min_advance_hours,
            max_advance_days=rule.max_advance_days,
            rule_name=rule.rule_name,
            description=rule.description,
            priority=rule.priority,
            created_by=current_user.get("user_id")
        )
        
        db.add(db_rule)
        db.commit()
        db.refresh(db_rule)
        
        return db_rule
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create access rule: {str(e)}"
        )

@router.get("/rules", response_model=List[MachineAccessRuleResponse])
async def list_access_rules(
    equipment_id: Optional[str] = Query(None),
    skill_id: Optional[str] = Query(None),
    is_active: bool = Query(True),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List machine access rules"""
    query = db.query(MachineAccessRule).filter(MachineAccessRule.is_active == is_active)
    
    if equipment_id:
        query = query.filter(MachineAccessRule.equipment_id == equipment_id)
    
    if skill_id:
        query = query.filter(MachineAccessRule.required_skill_id == skill_id)
    
    rules = query.order_by(asc(MachineAccessRule.priority)).all()
    return rules

# User Certifications
@router.post("/certifications", response_model=UserCertificationResponse)
async def create_certification(
    certification: UserCertificationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new user certification"""
    user_role = current_user.get("role", "user")
    
    if user_role not in ["super_admin", "makerspace_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create certifications"
        )
    
    try:
        cert_id = f"cert_{uuid.uuid4().hex[:12]}"
        
        db_cert = UserCertification(
            id=cert_id,
            user_id=certification.user_id,
            skill_id=certification.skill_id,
            equipment_id=certification.equipment_id,
            certification_level=certification.certification_level,
            issued_at=datetime.utcnow(),
            expires_at=certification.expires_at,
            certified_by=current_user.get("user_id"),
            certification_method=certification.certification_method,
            theory_score=certification.theory_score,
            practical_score=certification.practical_score,
            safety_score=certification.safety_score,
            certification_notes=certification.certification_notes
        )
        
        db.add(db_cert)
        db.commit()
        db.refresh(db_cert)
        
        return db_cert
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create certification: {str(e)}"
        )

@router.get("/certifications", response_model=List[UserCertificationResponse])
async def list_certifications(
    user_id: Optional[str] = Query(None),
    skill_id: Optional[str] = Query(None),
    equipment_id: Optional[str] = Query(None),
    status: Optional[CertificationStatus] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user certifications"""
    user_role = current_user.get("role", "user")
    current_user_id = current_user.get("user_id")
    
    query = db.query(UserCertification)
    
    # Apply user-based filtering for non-admin users
    if user_role not in ["super_admin", "makerspace_admin"]:
        if user_id and user_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot view other users' certifications"
            )
        query = query.filter(UserCertification.user_id == current_user_id)
    elif user_id:
        query = query.filter(UserCertification.user_id == user_id)
    
    if skill_id:
        query = query.filter(UserCertification.skill_id == skill_id)
    
    if equipment_id:
        query = query.filter(UserCertification.equipment_id == equipment_id)
    
    if status:
        query = query.filter(UserCertification.status == status)
    
    certifications = query.order_by(desc(UserCertification.issued_at)).all()
    return certifications

# Machine Access
@router.post("/access", response_model=MachineAccessResponse)
async def request_machine_access(
    access_request: MachineAccessRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Request access to a machine"""
    user_id = current_user.get("user_id")
    
    # Get equipment
    equipment = db.query(Equipment).filter(Equipment.id == access_request.equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    # Check equipment status
    if equipment.status.value != "available":
        return MachineAccessResponse(
            success=False,
            result=AccessAttemptResult.DENIED_EQUIPMENT_OFFLINE,
            message="Equipment is not available",
            denial_reason=f"Equipment status: {equipment.status.value}"
        )
    
    # Get access rules for this equipment
    access_rules = db.query(MachineAccessRule).filter(
        and_(
            MachineAccessRule.equipment_id == access_request.equipment_id,
            MachineAccessRule.is_active == True
        )
    ).order_by(asc(MachineAccessRule.priority)).all()
    
    if not access_rules:
        # No specific rules, grant access
        attempt_id = f"attempt_{uuid.uuid4().hex[:12]}"
        session_id = f"session_{uuid.uuid4().hex[:12]}"
        
        # Log attempt
        access_attempt = MachineAccessAttempt(
            id=attempt_id,
            user_id=user_id,
            equipment_id=access_request.equipment_id,
            result=AccessAttemptResult.GRANTED,
            access_method=access_request.access_method,
            session_id=session_id,
            session_start=datetime.utcnow()
        )
        db.add(access_attempt)
        db.commit()
        
        return MachineAccessResponse(
            success=True,
            result=AccessAttemptResult.GRANTED,
            message="Access granted",
            session_id=session_id,
            access_expires_at=datetime.utcnow() + timedelta(hours=access_request.session_duration_hours or 4)
        )
    
    # Check each access rule
    for rule in access_rules:
        # Check if user has required certification
        certification = db.query(UserCertification).filter(
            and_(
                UserCertification.user_id == user_id,
                UserCertification.skill_id == rule.required_skill_id,
                UserCertification.status == CertificationStatus.ACTIVE
            )
        ).first()
        
        if not certification:
            attempt_id = f"attempt_{uuid.uuid4().hex[:12]}"
            access_attempt = MachineAccessAttempt(
                id=attempt_id,
                user_id=user_id,
                equipment_id=access_request.equipment_id,
                result=AccessAttemptResult.DENIED_NO_SKILL,
                access_method=access_request.access_method,
                denial_reason=f"Missing required skill: {rule.required_skill_id}"
            )
            db.add(access_attempt)
            db.commit()
            
            return MachineAccessResponse(
                success=False,
                result=AccessAttemptResult.DENIED_NO_SKILL,
                message="Required certification not found",
                denial_reason=f"Missing certification for skill: {rule.required_skill_id}",
                required_certifications=[rule.required_skill_id]
            )
        
        # Check certification level
        if certification.certification_level.value < rule.minimum_skill_level.value:
            attempt_id = f"attempt_{uuid.uuid4().hex[:12]}"
            access_attempt = MachineAccessAttempt(
                id=attempt_id,
                user_id=user_id,
                equipment_id=access_request.equipment_id,
                certification_id=certification.id,
                result=AccessAttemptResult.DENIED_NO_SKILL,
                access_method=access_request.access_method,
                denial_reason=f"Insufficient skill level. Required: {rule.minimum_skill_level.value}, Current: {certification.certification_level.value}"
            )
            db.add(access_attempt)
            db.commit()
            
            return MachineAccessResponse(
                success=False,
                result=AccessAttemptResult.DENIED_NO_SKILL,
                message="Insufficient certification level",
                denial_reason=f"Required level: {rule.minimum_skill_level.value}, Current: {certification.certification_level.value}"
            )
        
        # Check expiry
        if certification.expires_at and certification.expires_at < datetime.utcnow():
            attempt_id = f"attempt_{uuid.uuid4().hex[:12]}"
            access_attempt = MachineAccessAttempt(
                id=attempt_id,
                user_id=user_id,
                equipment_id=access_request.equipment_id,
                certification_id=certification.id,
                result=AccessAttemptResult.DENIED_EXPIRED,
                access_method=access_request.access_method,
                denial_reason="Certification has expired"
            )
            db.add(access_attempt)
            db.commit()
            
            return MachineAccessResponse(
                success=False,
                result=AccessAttemptResult.DENIED_EXPIRED,
                message="Certification has expired",
                denial_reason="Please renew your certification"
            )
        
        # Check time restrictions
        if rule.allowed_hours_start and rule.allowed_hours_end:
            current_time = datetime.utcnow().time().strftime("%H:%M")
            if not (rule.allowed_hours_start <= current_time <= rule.allowed_hours_end):
                return MachineAccessResponse(
                    success=False,
                    result=AccessAttemptResult.DENIED_TIME_LIMIT,
                    message="Access not allowed at this time",
                    denial_reason=f"Allowed hours: {rule.allowed_hours_start} - {rule.allowed_hours_end}"
                )
        
        # Check day restrictions
        if rule.allowed_days:
            current_day = datetime.utcnow().strftime("%A").lower()
            if current_day not in [day.lower() for day in rule.allowed_days]:
                return MachineAccessResponse(
                    success=False,
                    result=AccessAttemptResult.DENIED_TIME_LIMIT,
                    message="Access not allowed on this day",
                    denial_reason=f"Allowed days: {', '.join(rule.allowed_days)}"
                )
    
    # All checks passed, grant access
    attempt_id = f"attempt_{uuid.uuid4().hex[:12]}"
    session_id = f"session_{uuid.uuid4().hex[:12]}"
    
    # Determine session duration
    max_duration = access_request.session_duration_hours or 4
    for rule in access_rules:
        if rule.max_session_hours and rule.max_session_hours < max_duration:
            max_duration = rule.max_session_hours
    
    access_attempt = MachineAccessAttempt(
        id=attempt_id,
        user_id=user_id,
        equipment_id=access_request.equipment_id,
        certification_id=certification.id if certification else None,
        result=AccessAttemptResult.GRANTED,
        access_method=access_request.access_method,
        session_id=session_id,
        session_start=datetime.utcnow()
    )
    db.add(access_attempt)
    db.commit()
    
    return MachineAccessResponse(
        success=True,
        result=AccessAttemptResult.GRANTED,
        message="Access granted",
        session_id=session_id,
        access_expires_at=datetime.utcnow() + timedelta(hours=max_duration),
        max_session_duration=max_duration
    )

@router.post("/access/{session_id}/end")
async def end_machine_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """End a machine access session"""
    user_id = current_user.get("user_id")
    
    # Find the active session
    access_attempt = db.query(MachineAccessAttempt).filter(
        and_(
            MachineAccessAttempt.session_id == session_id,
            MachineAccessAttempt.user_id == user_id,
            MachineAccessAttempt.session_end.is_(None)
        )
    ).first()
    
    if not access_attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active session not found"
        )
    
    # End the session
    access_attempt.session_end = datetime.utcnow()
    if access_attempt.session_start:
        duration = (access_attempt.session_end - access_attempt.session_start).total_seconds() / 60
        access_attempt.session_duration_minutes = int(duration)
    
    # Update certification usage statistics
    if access_attempt.certification_id:
        certification = db.query(UserCertification).filter(
            UserCertification.id == access_attempt.certification_id
        ).first()
        if certification:
            certification.successful_sessions += 1
            if access_attempt.session_duration_minutes:
                certification.total_usage_hours += access_attempt.session_duration_minutes / 60
    
    db.commit()
    
    return {"message": "Session ended successfully", "duration_minutes": access_attempt.session_duration_minutes}

# Badges
@router.post("/badges", response_model=BadgeResponse)
async def create_badge(
    badge: BadgeCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new badge"""
    user_role = current_user.get("role", "user")
    
    if user_role not in ["super_admin", "makerspace_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create badges"
        )
    
    try:
        badge_id = f"badge_{uuid.uuid4().hex[:12]}"
        
        db_badge = Badge(
            id=badge_id,
            name=badge.name,
            description=badge.description,
            badge_type=badge.badge_type,
            rarity=badge.rarity,
            category=badge.category,
            icon_url=badge.icon_url,
            color_hex=badge.color_hex,
            criteria=badge.criteria,
            points_value=badge.points_value,
            skill_requirements=badge.skill_requirements,
            prerequisite_badges=badge.prerequisite_badges,
            equipment_usage_required=badge.equipment_usage_required,
            project_completions_required=badge.project_completions_required,
            auto_award=badge.auto_award,
            is_public=badge.is_public,
            created_by=current_user.get("user_id"),
            makerspace_id=badge.makerspace_id
        )
        
        db.add(db_badge)
        db.commit()
        db.refresh(db_badge)
        
        return db_badge
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create badge: {str(e)}"
        )

@router.get("/badges", response_model=List[BadgeResponse])
async def list_badges(
    badge_type: Optional[BadgeType] = Query(None),
    category: Optional[str] = Query(None),
    rarity: Optional[BadgeRarity] = Query(None),
    is_public: bool = Query(True),
    current_user: dict = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """List available badges"""
    query = db.query(Badge).filter(Badge.is_active == True)
    
    if is_public:
        query = query.filter(Badge.is_public == True)
    
    if badge_type:
        query = query.filter(Badge.badge_type == badge_type)
    
    if category:
        query = query.filter(Badge.category == category)
    
    if rarity:
        query = query.filter(Badge.rarity == rarity)
    
    badges = query.order_by(desc(Badge.created_at)).all()
    return badges

@router.post("/badges/{badge_id}/award", response_model=UserBadgeResponse)
async def award_badge(
    badge_id: str,
    award: UserBadgeAward,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Award a badge to a user"""
    user_role = current_user.get("role", "user")
    
    if user_role not in ["super_admin", "makerspace_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can award badges"
        )
    
    # Check if badge exists
    badge = db.query(Badge).filter(Badge.id == badge_id).first()
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Badge not found"
        )
    
    # Check if user already has this badge
    existing_badge = db.query(UserBadge).filter(
        and_(
            UserBadge.user_id == award.user_id,
            UserBadge.badge_id == badge_id
        )
    ).first()
    
    if existing_badge:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has this badge"
        )
    
    try:
        user_badge_id = f"userbadge_{uuid.uuid4().hex[:12]}"
        
        db_user_badge = UserBadge(
            id=user_badge_id,
            user_id=award.user_id,
            badge_id=badge_id,
            awarded_by=current_user.get("user_id"),
            earned_through=award.earned_through,
            related_entity_id=award.related_entity_id,
            achievement_notes=award.achievement_notes,
            progress_value=award.progress_value,
            progress_data=award.progress_data
        )
        
        db.add(db_user_badge)
        
        # Update badge total awarded count
        badge.total_awarded += 1
        
        db.commit()
        db.refresh(db_user_badge)
        
        return db_user_badge
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to award badge: {str(e)}"
        )

@router.get("/users/{user_id}/badges", response_model=List[UserBadgeResponse])
async def get_user_badges(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get badges for a user"""
    user_role = current_user.get("role", "user")
    current_user_id = current_user.get("user_id")
    
    # Users can only view their own badges unless they're admin
    if user_role not in ["super_admin", "makerspace_admin"] and user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view other users' badges"
        )
    
    user_badges = db.query(UserBadge).options(
        selectinload(UserBadge.badge)
    ).filter(
        and_(
            UserBadge.user_id == user_id,
            UserBadge.is_public == True
        )
    ).order_by(desc(UserBadge.awarded_at)).all()
    
    return user_badges

# Safety Incidents
@router.post("/safety-incidents", response_model=SafetyIncidentResponse)
async def report_safety_incident(
    incident: SafetyIncidentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Report a safety incident"""
    try:
        incident_id = f"incident_{uuid.uuid4().hex[:12]}"
        
        db_incident = SafetyIncident(
            id=incident_id,
            user_id=current_user.get("user_id"),
            equipment_id=incident.equipment_id,
            session_id=incident.session_id,
            incident_type=incident.incident_type,
            severity=incident.severity,
            title=incident.title,
            description=incident.description,
            immediate_actions=incident.immediate_actions,
            location=incident.location,
            occurred_at=incident.occurred_at,
            reported_by=current_user.get("user_id"),
            witnesses=incident.witnesses,
            supervisor_notified=incident.supervisor_notified
        )
        
        db.add(db_incident)
        db.commit()
        db.refresh(db_incident)
        
        return db_incident
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to report safety incident: {str(e)}"
        )

# Dashboard and Analytics
@router.get("/dashboard/user-profile", response_model=UserAccessProfile)
async def get_user_access_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive user access profile"""
    user_id = current_user.get("user_id")
    
    # Get certifications
    certifications = db.query(UserCertification).filter(
        UserCertification.user_id == user_id
    ).all()
    
    # Get badges
    user_badges = db.query(UserBadge).options(
        selectinload(UserBadge.badge)
    ).filter(UserBadge.user_id == user_id).all()
    
    # Get recent access attempts
    recent_attempts = db.query(MachineAccessAttempt).filter(
        MachineAccessAttempt.user_id == user_id
    ).order_by(desc(MachineAccessAttempt.attempted_at)).limit(10).all()
    
    # Calculate total equipment hours
    total_hours = sum([cert.total_usage_hours for cert in certifications])
    
    # Safety record
    safety_incidents = db.query(SafetyIncident).filter(
        SafetyIncident.user_id == user_id
    ).count()
    
    safety_record = {
        "total_incidents": safety_incidents,
        "safety_score": max(0, 100 - (safety_incidents * 10)),  # Simplified scoring
        "last_incident": None  # Could be enhanced with actual date
    }
    
    # Certification progress (simplified)
    certification_progress = {}
    for cert in certifications:
        progress = 100.0 if cert.status == CertificationStatus.ACTIVE else 0.0
        certification_progress[cert.skill_id] = progress
    
    return UserAccessProfile(
        user_id=user_id,
        certifications=certifications,
        badges=user_badges,
        recent_access_attempts=recent_attempts,
        safety_record=safety_record,
        total_equipment_hours=total_hours,
        certification_progress=certification_progress
    )

@router.get("/dashboard/equipment/{equipment_id}/stats", response_model=EquipmentAccessStats)
async def get_equipment_access_stats(
    equipment_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get access statistics for specific equipment"""
    user_role = current_user.get("role", "user")
    
    if user_role not in ["super_admin", "makerspace_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view equipment statistics"
        )
    
    # Get access attempts
    attempts = db.query(MachineAccessAttempt).filter(
        MachineAccessAttempt.equipment_id == equipment_id
    ).all()
    
    total_attempts = len(attempts)
    successful_attempts = len([a for a in attempts if a.result == AccessAttemptResult.GRANTED])
    denied_attempts = total_attempts - successful_attempts
    
    # Calculate average session duration
    session_durations = [a.session_duration_minutes for a in attempts if a.session_duration_minutes]
    avg_duration = sum(session_durations) / len(session_durations) if session_durations else 0
    
    # Total usage hours
    total_hours = sum([d for d in session_durations]) / 60 if session_durations else 0
    
    # Unique users
    unique_users = len(set([a.user_id for a in attempts]))
    
    # Get certification requirements
    access_rules = db.query(MachineAccessRule).filter(
        MachineAccessRule.equipment_id == equipment_id
    ).all()
    cert_requirements = [rule.required_skill_id for rule in access_rules]
    
    # Safety incidents
    incidents = db.query(SafetyIncident).filter(
        SafetyIncident.equipment_id == equipment_id
    ).count()
    
    return EquipmentAccessStats(
        equipment_id=equipment_id,
        total_access_attempts=total_attempts,
        successful_accesses=successful_attempts,
        denied_accesses=denied_attempts,
        average_session_duration=avg_duration,
        total_usage_hours=total_hours,
        unique_users=unique_users,
        certification_requirements=cert_requirements,
        safety_incidents=incidents
    )

@router.get("/dashboard/makerspace", response_model=MakerspaceAccessDashboard)
async def get_makerspace_access_dashboard(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get makerspace-wide access dashboard"""
    user_role = current_user.get("role", "user")
    
    if user_role not in ["super_admin", "makerspace_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view makerspace dashboard"
        )
    
    # Certification statistics
    total_certified = db.query(UserCertification).filter(
        UserCertification.status == CertificationStatus.ACTIVE
    ).count()
    
    active_certs = db.query(UserCertification).filter(
        UserCertification.status == CertificationStatus.ACTIVE
    ).count()
    
    expired_certs = db.query(UserCertification).filter(
        UserCertification.status == CertificationStatus.EXPIRED
    ).count()
    
    pending_renewals = db.query(UserCertification).filter(
        and_(
            UserCertification.status == CertificationStatus.ACTIVE,
            UserCertification.expires_at <= datetime.utcnow() + timedelta(days=30)
        )
    ).count()
    
    # Equipment utilization (simplified)
    equipment_utilization = {}  # Could be enhanced with actual calculations
    
    # Badge distribution
    badge_counts = db.query(
        Badge.badge_type, 
        func.count(UserBadge.id)
    ).join(UserBadge).group_by(Badge.badge_type).all()
    
    badge_distribution = {badge_type.value: count for badge_type, count in badge_counts}
    
    # Safety metrics
    total_incidents = db.query(SafetyIncident).count()
    total_sessions = db.query(MachineAccessAttempt).filter(
        MachineAccessAttempt.result == AccessAttemptResult.GRANTED
    ).count()
    
    incident_rate = (total_incidents / total_sessions * 100) if total_sessions > 0 else 0
    
    # Certification success rate (simplified)
    total_assessments = db.query(SkillAssessment).count()
    passed_assessments = db.query(SkillAssessment).filter(
        SkillAssessment.passed == True
    ).count()
    
    success_rate = (passed_assessments / total_assessments * 100) if total_assessments > 0 else 0
    
    return MakerspaceAccessDashboard(
        total_certified_users=total_certified,
        active_certifications=active_certs,
        expired_certifications=expired_certs,
        pending_renewals=pending_renewals,
        equipment_utilization=equipment_utilization,
        badge_distribution=badge_distribution,
        safety_incident_rate=incident_rate,
        certification_success_rate=success_rate
    )
