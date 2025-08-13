from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from .. import models
from ..database import get_db
from ..dependencies import get_current_user
from ..schemas.equipment_reservations import (
    EnhancedReservationCreate, EnhancedReservationUpdate, EnhancedReservationResponse,
    CostRuleCreate, CostRuleUpdate, CostRuleResponse,
    SkillGateCreate, SkillGateUpdate, SkillGateResponse,
    ReservationApprovalRequest, SkillVerificationRequest,
    CostEstimateRequest, CostEstimateResponse,
    AvailabilityCheckRequest, AvailabilityResponse,
    BulkReservationAction, BulkReservationResult,
    ReservationAnalytics, EquipmentReservationSummary
)

router = APIRouter(prefix="/equipment-reservations", tags=["equipment-reservations"])

# Enhanced Reservation Management
@router.post("/", response_model=EnhancedReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_enhanced_reservation(
    reservation_data: EnhancedReservationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None
):
    """Create enhanced equipment reservation with cost calculation and skill verification"""
    try:
        # Check if equipment exists
        equipment = db.query(models.Equipment).filter(
            models.Equipment.id == reservation_data.equipment_id
        ).first()
        
        if not equipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Equipment not found"
            )
        
        # Check availability
        availability_conflicts = await check_equipment_availability(
            db, reservation_data.equipment_id, 
            reservation_data.requested_start, 
            reservation_data.requested_end
        )
        
        if availability_conflicts and not reservation_data.is_emergency:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Equipment not available: {availability_conflicts}"
            )
        
        # Check skill gates
        skill_gate_results = await verify_skill_gates(
            db, reservation_data.equipment_id, current_user["user_id"]
        )
        
        blocking_gates = [gate for gate in skill_gate_results if not gate["passed"] and gate["enforcement_level"] == "block"]
        
        if blocking_gates and not reservation_data.is_emergency:
            gate_names = [gate["gate_name"] for gate in blocking_gates]
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Skill requirements not met: {', '.join(gate_names)}"
            )
        
        # Calculate duration
        duration = (reservation_data.requested_end - reservation_data.requested_start).total_seconds() / 3600
        
        # Create reservation
        reservation_id = str(uuid.uuid4())
        db_reservation = models.EnhancedEquipmentReservation(
            id=reservation_id,
            equipment_id=reservation_data.equipment_id,
            user_id=current_user["user_id"],
            user_name=current_user.get("name", "Unknown User"),
            user_email=current_user.get("email"),
            user_membership_tier=current_user.get("membership_tier"),
            requested_start=reservation_data.requested_start,
            requested_end=reservation_data.requested_end,
            duration_hours=duration,
            purpose=reservation_data.purpose,
            project_id=reservation_data.project_id,
            project_name=reservation_data.project_name,
            user_notes=reservation_data.user_notes,
            is_emergency=reservation_data.is_emergency,
            emergency_justification=reservation_data.emergency_justification,
            is_recurring=reservation_data.is_recurring,
            recurring_pattern=reservation_data.recurring_pattern,
            required_skills_verified=len(blocking_gates) == 0,
            priority_level=3 if reservation_data.is_emergency else 0
        )
        
        db.add(db_reservation)
        db.flush()
        
        # Calculate cost
        cost_breakdown = await calculate_reservation_cost(
            db, equipment, db_reservation, current_user
        )
        
        # Add cost breakdown items
        total_cost = 0
        for cost_item in cost_breakdown["items"]:
            cost_record = models.ReservationCostBreakdown(
                reservation_id=reservation_id,
                cost_type=cost_item["cost_type"],
                description=cost_item["description"],
                rule_applied=cost_item.get("rule_applied"),
                base_amount=cost_item["base_amount"],
                quantity=cost_item["quantity"],
                rate=cost_item.get("rate"),
                percentage=cost_item.get("percentage"),
                calculated_amount=cost_item["calculated_amount"],
                is_refundable=cost_item.get("is_refundable", True),
                is_taxable=cost_item.get("is_taxable", False)
            )
            db.add(cost_record)
            total_cost += cost_item["calculated_amount"]
        
        # Update reservation with cost
        db_reservation.estimated_cost = total_cost
        db_reservation.total_cost = total_cost
        db_reservation.base_cost = cost_breakdown.get("base_cost", 0)
        
        # Set payment status based on cost
        if total_cost > 0:
            db_reservation.payment_status = models.PaymentStatus.PENDING
            if cost_breakdown.get("deposit_required"):
                db_reservation.deposit_amount = cost_breakdown.get("deposit_amount", 0)
        else:
            db_reservation.payment_status = models.PaymentStatus.NOT_REQUIRED
        
        # Add skill verification records
        for gate_result in skill_gate_results:
            verification = models.ReservationSkillVerification(
                reservation_id=reservation_id,
                skill_gate_id=gate_result["skill_gate_id"],
                skill_verified=gate_result["passed"],
                verification_method="auto",
                verified_by="system",
                verified_at=datetime.utcnow() if gate_result["passed"] else None,
                verification_notes=gate_result.get("notes")
            )
            db.add(verification)
        
        # Determine if supervisor is required
        supervisor_gates = [gate for gate in skill_gate_results if gate.get("requires_supervisor")]
        if supervisor_gates:
            db_reservation.supervisor_required = True
        
        # Set auto-approval for simple cases
        if (not blocking_gates and 
            not supervisor_gates and 
            not reservation_data.is_emergency and 
            total_cost < 100):  # Auto-approve low-cost reservations
            db_reservation.status = models.ReservationStatus.APPROVED
            db_reservation.approved_by = "system"
            db_reservation.approved_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_reservation)
        
        # Send notifications
        if background_tasks:
            background_tasks.add_task(
                send_reservation_notifications,
                db_reservation,
                "created"
            )
        
        return db_reservation
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create reservation: {str(e)}"
        )

@router.get("/", response_model=List[EnhancedReservationResponse])
async def list_reservations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    equipment_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    include_recurring: bool = Query(True),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List enhanced reservations with filtering"""
    query = db.query(models.EnhancedEquipmentReservation)
    
    # Apply access control
    if current_user["role"] not in ["super_admin", "makerspace_admin"]:
        # Regular users can only see their own reservations
        query = query.filter(models.EnhancedEquipmentReservation.user_id == current_user["user_id"])
    
    # Apply filters
    if equipment_id:
        query = query.filter(models.EnhancedEquipmentReservation.equipment_id == equipment_id)
    
    if user_id and current_user["role"] in ["super_admin", "makerspace_admin"]:
        query = query.filter(models.EnhancedEquipmentReservation.user_id == user_id)
    
    if status:
        query = query.filter(models.EnhancedEquipmentReservation.status == status)
    
    if start_date:
        query = query.filter(models.EnhancedEquipmentReservation.requested_start >= start_date)
    
    if end_date:
        query = query.filter(models.EnhancedEquipmentReservation.requested_end <= end_date)
    
    if not include_recurring:
        query = query.filter(models.EnhancedEquipmentReservation.is_recurring == False)
    
    # Order by creation date (newest first)
    query = query.order_by(models.EnhancedEquipmentReservation.created_at.desc())
    
    reservations = query.offset(skip).limit(limit).all()
    return reservations

@router.get("/{reservation_id}", response_model=EnhancedReservationResponse)
async def get_reservation(
    reservation_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get reservation details"""
    reservation = db.query(models.EnhancedEquipmentReservation).filter(
        models.EnhancedEquipmentReservation.id == reservation_id
    ).first()
    
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    # Check access
    if (current_user["role"] not in ["super_admin", "makerspace_admin"] and 
        reservation.user_id != current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return reservation

@router.put("/{reservation_id}", response_model=EnhancedReservationResponse)
async def update_reservation(
    reservation_id: str,
    update_data: EnhancedReservationUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update reservation"""
    reservation = db.query(models.EnhancedEquipmentReservation).filter(
        models.EnhancedEquipmentReservation.id == reservation_id
    ).first()
    
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    # Check permissions
    can_edit = (
        current_user["role"] in ["super_admin", "makerspace_admin"] or
        (reservation.user_id == current_user["user_id"] and 
         reservation.status in [models.ReservationStatus.PENDING, models.ReservationStatus.APPROVED])
    )
    
    if not can_edit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot edit this reservation"
        )
    
    # Apply updates
    update_fields = update_data.dict(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(reservation, field, value)
    
    # Recalculate cost if timing changed
    if any(field in update_fields for field in ["requested_start", "requested_end"]):
        duration = (reservation.requested_end - reservation.requested_start).total_seconds() / 3600
        reservation.duration_hours = duration
        
        # Recalculate cost (simplified)
        equipment = db.query(models.Equipment).filter(
            models.Equipment.id == reservation.equipment_id
        ).first()
        
        if equipment and equipment.hourly_rate:
            reservation.estimated_cost = duration * equipment.hourly_rate
            reservation.total_cost = reservation.estimated_cost
    
    db.commit()
    db.refresh(reservation)
    return reservation

@router.post("/{reservation_id}/approve")
async def approve_reservation(
    reservation_id: str,
    approval_data: ReservationApprovalRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve or reject reservation"""
    if current_user["role"] not in ["super_admin", "makerspace_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    reservation = db.query(models.EnhancedEquipmentReservation).filter(
        models.EnhancedEquipmentReservation.id == reservation_id
    ).first()
    
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    if approval_data.approved:
        reservation.status = models.ReservationStatus.APPROVED
        reservation.approved_by = current_user["name"]
        reservation.approved_at = datetime.utcnow()
        
        if approval_data.require_deposit and approval_data.deposit_amount:
            reservation.deposit_amount = approval_data.deposit_amount
            reservation.payment_status = models.PaymentStatus.PENDING
        
        if approval_data.assign_supervisor:
            reservation.supervisor_assigned = approval_data.assign_supervisor
            reservation.supervisor_required = True
            
    else:
        reservation.status = models.ReservationStatus.REJECTED
        reservation.rejection_reason = approval_data.rejection_reason
    
    if approval_data.admin_notes:
        reservation.admin_notes = approval_data.admin_notes
    
    db.commit()
    
    action = "approved" if approval_data.approved else "rejected"
    return {"message": f"Reservation {action} successfully"}

# Cost Management
@router.post("/cost-rules/", response_model=CostRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_cost_rule(
    rule_data: CostRuleCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create equipment cost rule"""
    if current_user["role"] not in ["super_admin", "makerspace_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Check if equipment exists
    equipment = db.query(models.Equipment).filter(
        models.Equipment.id == rule_data.equipment_id
    ).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    # Create cost rule
    cost_rule = models.EquipmentCostRule(
        equipment_id=rule_data.equipment_id,
        rule_name=rule_data.rule_name,
        rule_type=rule_data.rule_type,
        description=rule_data.description,
        base_amount=rule_data.base_amount,
        rate_per_hour=rule_data.rate_per_hour,
        minimum_charge=rule_data.minimum_charge,
        maximum_charge=rule_data.maximum_charge,
        tier_config=rule_data.tier_config,
        time_conditions=rule_data.time_conditions,
        membership_discounts=rule_data.membership_discounts,
        skill_premiums=rule_data.skill_premiums,
        is_active=rule_data.is_active,
        effective_from=rule_data.effective_from,
        effective_until=rule_data.effective_until,
        priority=rule_data.priority,
        applies_to_users=rule_data.applies_to_users,
        applies_to_projects=rule_data.applies_to_projects,
        minimum_duration=rule_data.minimum_duration,
        maximum_duration=rule_data.maximum_duration,
        created_by=current_user["name"]
    )
    
    db.add(cost_rule)
    db.commit()
    db.refresh(cost_rule)
    
    return cost_rule

@router.get("/cost-rules/", response_model=List[CostRuleResponse])
async def list_cost_rules(
    equipment_id: Optional[str] = Query(None),
    active_only: bool = Query(True),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List cost rules"""
    query = db.query(models.EquipmentCostRule)
    
    if equipment_id:
        query = query.filter(models.EquipmentCostRule.equipment_id == equipment_id)
    
    if active_only:
        query = query.filter(models.EquipmentCostRule.is_active == True)
    
    query = query.order_by(models.EquipmentCostRule.priority.desc())
    
    return query.all()

# Skill Gate Management
@router.post("/skill-gates/", response_model=SkillGateResponse, status_code=status.HTTP_201_CREATED)
async def create_skill_gate(
    gate_data: SkillGateCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create equipment skill gate"""
    if current_user["role"] not in ["super_admin", "makerspace_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Check if equipment exists
    equipment = db.query(models.Equipment).filter(
        models.Equipment.id == gate_data.equipment_id
    ).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    # Create skill gate
    skill_gate = models.EquipmentSkillGate(
        equipment_id=gate_data.equipment_id,
        gate_name=gate_data.gate_name,
        gate_type=gate_data.gate_type,
        description=gate_data.description,
        required_skill_id=gate_data.required_skill_id,
        required_skill_level=gate_data.required_skill_level,
        required_certification=gate_data.required_certification,
        required_training_modules=gate_data.required_training_modules,
        minimum_experience_hours=gate_data.minimum_experience_hours,
        minimum_project_count=gate_data.minimum_project_count,
        requires_supervisor=gate_data.requires_supervisor,
        supervisor_skill_level=gate_data.supervisor_skill_level,
        supervisor_roles=gate_data.supervisor_roles,
        allowed_hours=gate_data.allowed_hours,
        restricted_hours=gate_data.restricted_hours,
        grace_period_days=gate_data.grace_period_days,
        allow_admin_override=gate_data.allow_admin_override,
        emergency_bypass_allowed=gate_data.emergency_bypass_allowed,
        auto_verify_from_system=gate_data.auto_verify_from_system,
        manual_verification_required=gate_data.manual_verification_required,
        enforcement_level=gate_data.enforcement_level,
        warning_message=gate_data.warning_message,
        is_active=gate_data.is_active,
        effective_from=gate_data.effective_from,
        effective_until=gate_data.effective_until,
        created_by=current_user["name"]
    )
    
    db.add(skill_gate)
    db.commit()
    db.refresh(skill_gate)
    
    return skill_gate

@router.get("/skill-gates/", response_model=List[SkillGateResponse])
async def list_skill_gates(
    equipment_id: Optional[str] = Query(None),
    active_only: bool = Query(True),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List skill gates"""
    query = db.query(models.EquipmentSkillGate)
    
    if equipment_id:
        query = query.filter(models.EquipmentSkillGate.equipment_id == equipment_id)
    
    if active_only:
        query = query.filter(models.EquipmentSkillGate.is_active == True)
    
    return query.all()

# Cost Estimation
@router.post("/cost-estimate/", response_model=CostEstimateResponse)
async def estimate_reservation_cost(
    estimate_request: CostEstimateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Estimate cost for a potential reservation"""
    equipment = db.query(models.Equipment).filter(
        models.Equipment.id == estimate_request.equipment_id
    ).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    # Create temporary reservation for cost calculation
    duration = (estimate_request.requested_end - estimate_request.requested_start).total_seconds() / 3600
    
    temp_reservation = models.EnhancedEquipmentReservation(
        equipment_id=estimate_request.equipment_id,
        user_id=estimate_request.user_id,
        user_membership_tier=estimate_request.membership_tier,
        requested_start=estimate_request.requested_start,
        requested_end=estimate_request.requested_end,
        duration_hours=duration,
        project_id=estimate_request.project_id
    )
    
    # Calculate cost
    user_data = {"user_id": estimate_request.user_id, "membership_tier": estimate_request.membership_tier}
    cost_breakdown = await calculate_reservation_cost(db, equipment, temp_reservation, user_data)
    
    # Build response
    estimate = CostEstimateResponse(
        equipment_id=estimate_request.equipment_id,
        duration_hours=duration,
        base_cost=cost_breakdown.get("base_cost", 0),
        additional_fees=[],
        discounts=[],
        total_cost=cost_breakdown.get("total_cost", 0),
        deposit_required=cost_breakdown.get("deposit_required", False),
        deposit_amount=cost_breakdown.get("deposit_amount"),
        estimated_by=current_user["name"],
        estimated_at=datetime.utcnow(),
        valid_until=datetime.utcnow() + timedelta(hours=24),
        rules_applied=cost_breakdown.get("rules_applied", []),
        warnings=cost_breakdown.get("warnings", [])
    )
    
    return estimate

# Availability Check
@router.post("/availability/", response_model=AvailabilityResponse)
async def check_availability(
    availability_request: AvailabilityCheckRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check equipment availability for a time period"""
    equipment = db.query(models.Equipment).filter(
        models.Equipment.id == availability_request.equipment_id
    ).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    # Get existing reservations
    existing_reservations = db.query(models.EnhancedEquipmentReservation).filter(
        models.EnhancedEquipmentReservation.equipment_id == availability_request.equipment_id,
        models.EnhancedEquipmentReservation.status.in_([
            models.ReservationStatus.APPROVED,
            models.ReservationStatus.ACTIVE
        ]),
        models.EnhancedEquipmentReservation.requested_start < availability_request.end_date,
        models.EnhancedEquipmentReservation.requested_end > availability_request.start_date
    ).all()
    
    # Check skill gates if user specified
    skill_gate_blocking = []
    if availability_request.user_id:
        skill_gates = await verify_skill_gates(db, availability_request.equipment_id, availability_request.user_id)
        skill_gate_blocking = [gate["gate_name"] for gate in skill_gates if not gate["passed"]]
    
    # Generate availability slots (simplified)
    available_slots = []
    current_time = availability_request.start_date
    
    while current_time < availability_request.end_date:
        slot_end = min(current_time + timedelta(hours=1), availability_request.end_date)
        
        # Check for conflicts
        has_conflict = any(
            res.requested_start < slot_end and res.requested_end > current_time
            for res in existing_reservations
        )
        
        if not has_conflict:
            available_slots.append({
                "start_time": current_time,
                "end_time": slot_end,
                "duration_hours": (slot_end - current_time).total_seconds() / 3600,
                "is_available": True,
                "requires_skill_verification": len(skill_gate_blocking) > 0,
                "skill_gates_blocking": skill_gate_blocking
            })
        
        current_time = slot_end
    
    response = AvailabilityResponse(
        equipment_id=availability_request.equipment_id,
        check_period_start=availability_request.start_date,
        check_period_end=availability_request.end_date,
        total_slots_checked=len(available_slots),
        available_slots=available_slots,
        next_available_slot=available_slots[0] if available_slots else None
    )
    
    return response

# Helper functions
async def check_equipment_availability(db: Session, equipment_id: str, start_time: datetime, end_time: datetime) -> Optional[str]:
    """Check if equipment is available for the requested time"""
    conflicts = db.query(models.EnhancedEquipmentReservation).filter(
        models.EnhancedEquipmentReservation.equipment_id == equipment_id,
        models.EnhancedEquipmentReservation.status.in_([
            models.ReservationStatus.APPROVED,
            models.ReservationStatus.ACTIVE
        ]),
        models.EnhancedEquipmentReservation.requested_start < end_time,
        models.EnhancedEquipmentReservation.requested_end > start_time
    ).first()
    
    if conflicts:
        return f"Conflicting reservation from {conflicts.requested_start} to {conflicts.requested_end}"
    
    return None

async def verify_skill_gates(db: Session, equipment_id: str, user_id: str) -> List[dict]:
    """Verify user against equipment skill gates"""
    skill_gates = db.query(models.EquipmentSkillGate).filter(
        models.EquipmentSkillGate.equipment_id == equipment_id,
        models.EquipmentSkillGate.is_active == True
    ).all()
    
    results = []
    for gate in skill_gates:
        # Simplified skill verification - in production this would check against actual skill system
        passed = True  # Default to pass for mock
        notes = "Auto-verified"
        
        # Mock some skill gate logic
        if gate.gate_type == models.SkillGateType.REQUIRED_SKILL:
            # Check if user has required skill
            passed = True  # Mock: assume user has skills
        elif gate.gate_type == models.SkillGateType.CERTIFICATION:
            # Check certification
            passed = True  # Mock: assume user is certified
        elif gate.gate_type == models.SkillGateType.EXPERIENCE_LEVEL:
            # Check experience level
            passed = True  # Mock: assume user has experience
        
        results.append({
            "skill_gate_id": gate.id,
            "gate_name": gate.gate_name,
            "gate_type": gate.gate_type,
            "passed": passed,
            "enforcement_level": gate.enforcement_level,
            "requires_supervisor": gate.requires_supervisor,
            "notes": notes
        })
    
    return results

async def calculate_reservation_cost(db: Session, equipment: models.Equipment, reservation: models.EnhancedEquipmentReservation, user_data: dict) -> dict:
    """Calculate comprehensive cost for reservation"""
    # Get applicable cost rules
    cost_rules = db.query(models.EquipmentCostRule).filter(
        models.EquipmentCostRule.equipment_id == equipment.id,
        models.EquipmentCostRule.is_active == True
    ).order_by(models.EquipmentCostRule.priority.desc()).all()
    
    base_cost = 0
    additional_fees = []
    discounts = []
    rules_applied = []
    
    # Apply cost rules
    for rule in cost_rules:
        if rule.rule_type == models.CostRuleType.HOURLY_RATE:
            if rule.rate_per_hour:
                base_cost = rule.rate_per_hour * reservation.duration_hours
                rules_applied.append(rule.rule_name)
        
        elif rule.rule_type == models.CostRuleType.FLAT_RATE:
            if rule.base_amount:
                base_cost = rule.base_amount
                rules_applied.append(rule.rule_name)
        
        elif rule.rule_type == models.CostRuleType.MEMBERSHIP_DISCOUNT:
            if (rule.membership_discounts and 
                user_data.get("membership_tier") in rule.membership_discounts):
                discount_percent = rule.membership_discounts[user_data["membership_tier"]]
                discount_amount = base_cost * (discount_percent / 100)
                discounts.append({
                    "cost_type": "discount",
                    "description": f"Membership discount ({discount_percent}%)",
                    "calculated_amount": -discount_amount,
                    "rule_applied": rule.rule_name
                })
                rules_applied.append(rule.rule_name)
    
    # Fallback to equipment hourly rate
    if base_cost == 0 and equipment.hourly_rate:
        base_cost = equipment.hourly_rate * reservation.duration_hours
    
    # Calculate total
    total_additional = sum(fee.get("calculated_amount", 0) for fee in additional_fees)
    total_discounts = sum(discount.get("calculated_amount", 0) for discount in discounts)
    total_cost = base_cost + total_additional + total_discounts
    
    # Determine if deposit required
    deposit_required = equipment.deposit_required and equipment.deposit_required > 0
    deposit_amount = equipment.deposit_required if deposit_required else None
    
    return {
        "base_cost": base_cost,
        "total_cost": max(0, total_cost),  # Ensure non-negative
        "items": [
            {
                "cost_type": "base_rate",
                "description": f"Equipment usage ({reservation.duration_hours:.1f} hours)",
                "base_amount": base_cost,
                "quantity": 1,
                "calculated_amount": base_cost
            }
        ] + additional_fees + discounts,
        "deposit_required": deposit_required,
        "deposit_amount": deposit_amount,
        "rules_applied": rules_applied,
        "warnings": []
    }

async def send_reservation_notifications(reservation: models.EnhancedEquipmentReservation, action: str):
    """Send notifications for reservation events"""
    # This would integrate with the notification system
    # For now, just log the event
    print(f"Notification: Reservation {reservation.id} was {action}")
