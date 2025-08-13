from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from uuid import UUID
import json

from ..database import get_db
from ..dependencies import get_current_user, get_current_admin_user
from ..models.user import User
from ..models.filament_tracking import (
    FilamentRoll, FilamentUsageLog, FilamentReorderRequest, FilamentCompatibility,
    FilamentMaterial, FilamentBrand, FilamentRollStatus, DeductionMethod
)

router = APIRouter(prefix="/api/v1/filament", tags=["Filament Tracking"])

# Pydantic models for requests/responses
from pydantic import BaseModel, Field
from typing import Optional

class FilamentRollCreate(BaseModel):
    brand: FilamentBrand
    material: FilamentMaterial
    color_name: str = Field(..., min_length=1, max_length=100)
    color_hex: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')
    diameter: float = Field(default=1.75, gt=0)
    original_weight_g: float = Field(..., gt=0)
    spool_weight_g: Optional[float] = Field(default=200.0, ge=0)
    cost_per_kg: Optional[float] = Field(None, ge=0)
    total_cost: Optional[float] = Field(None, ge=0)
    makrx_product_code: Optional[str] = None
    makrx_product_url: Optional[str] = None
    purchase_date: Optional[datetime] = None
    supplier: Optional[str] = None
    density_g_cm3: Optional[float] = Field(default=1.24, gt=0)
    print_temperature_range: Optional[Dict[str, int]] = None
    bed_temperature_range: Optional[Dict[str, int]] = None
    print_speed_range: Optional[Dict[str, int]] = None
    location: str = Field(..., min_length=1)
    storage_conditions: Optional[Dict[str, Any]] = None
    auto_deduction_enabled: bool = True
    deduction_method: DeductionMethod = DeductionMethod.SLICER_ESTIMATE
    low_weight_threshold_g: float = Field(default=100.0, ge=0)
    reorder_threshold_g: float = Field(default=200.0, ge=0)
    auto_reorder_enabled: bool = False
    reorder_quantity: int = Field(default=1, ge=1)
    batch_number: Optional[str] = None
    lot_number: Optional[str] = None
    expiry_date: Optional[datetime] = None

class FilamentRollUpdate(BaseModel):
    brand: Optional[FilamentBrand] = None
    material: Optional[FilamentMaterial] = None
    color_name: Optional[str] = Field(None, min_length=1, max_length=100)
    color_hex: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')
    current_weight_g: Optional[float] = Field(None, ge=0)
    location: Optional[str] = None
    status: Optional[FilamentRollStatus] = None
    moisture_level: Optional[float] = Field(None, ge=0, le=100)
    quality_notes: Optional[str] = None
    auto_deduction_enabled: Optional[bool] = None
    deduction_method: Optional[DeductionMethod] = None
    low_weight_threshold_g: Optional[float] = Field(None, ge=0)
    reorder_threshold_g: Optional[float] = Field(None, ge=0)
    auto_reorder_enabled: Optional[bool] = None
    assigned_printer_id: Optional[str] = None
    assigned_project_id: Optional[str] = None
    assigned_user_id: Optional[str] = None
    reserved_until: Optional[datetime] = None

class FilamentUsageCreate(BaseModel):
    weight_used_g: float = Field(..., gt=0)
    length_used_m: Optional[float] = Field(None, gt=0)
    deduction_method: DeductionMethod = DeductionMethod.MANUAL
    confidence_level: Optional[float] = Field(None, ge=0, le=100)
    job_id: Optional[str] = None
    project_id: Optional[str] = None
    print_name: Optional[str] = None
    gcode_filename: Optional[str] = None
    estimated_print_time_minutes: Optional[int] = Field(None, ge=0)
    actual_print_time_minutes: Optional[int] = Field(None, ge=0)
    printer_id: Optional[str] = None
    print_settings: Optional[Dict[str, Any]] = None
    print_quality: Optional[str] = None
    print_success: Optional[bool] = None
    failure_reason: Optional[str] = None
    notes: Optional[str] = None
    gcode_analysis: Optional[Dict[str, Any]] = None
    slicer_estimates: Optional[Dict[str, Any]] = None
    is_manual_entry: bool = True
    manual_reason: Optional[str] = None

class GCodeAnalysisRequest(BaseModel):
    gcode_content: str
    filament_roll_id: str
    job_id: Optional[str] = None
    print_name: Optional[str] = None

class FilamentReorderCreate(BaseModel):
    quantity: int = Field(..., ge=1)
    urgent: bool = False
    notes: Optional[str] = None
    priority_level: int = Field(default=1, ge=1, le=5)

class FilamentCompatibilityCreate(BaseModel):
    printer_id: str
    material: FilamentMaterial
    is_compatible: bool = True
    requires_enclosure: bool = False
    requires_heated_bed: bool = False
    max_temperature: Optional[int] = Field(None, ge=0)
    recommended_settings: Optional[Dict[str, Any]] = None
    compatibility_notes: Optional[str] = None
    safety_warnings: Optional[str] = None

# Routes

@router.get("/rolls", response_model=List[Dict[str, Any]])
async def get_filament_rolls(
    status: Optional[FilamentRollStatus] = Query(None, description="Filter by status"),
    material: Optional[FilamentMaterial] = Query(None, description="Filter by material"),
    brand: Optional[FilamentBrand] = Query(None, description="Filter by brand"),
    location: Optional[str] = Query(None, description="Filter by location"),
    low_stock_only: bool = Query(False, description="Show only low stock items"),
    available_only: bool = Query(False, description="Show only available rolls"),
    assigned_printer: Optional[str] = Query(None, description="Filter by assigned printer"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get filament rolls with filtering options"""
    
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if not makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No makerspace associated with current user"
        )
    
    query = db.query(FilamentRoll).filter(FilamentRoll.makerspace_id == makerspace_id)
    
    if status:
        query = query.filter(FilamentRoll.status == status)
    
    if material:
        query = query.filter(FilamentRoll.material == material)
    
    if brand:
        query = query.filter(FilamentRoll.brand == brand)
    
    if location:
        query = query.filter(FilamentRoll.location.ilike(f"%{location}%"))
    
    if low_stock_only:
        query = query.filter(FilamentRoll.remaining_weight_g <= FilamentRoll.low_weight_threshold_g)
    
    if available_only:
        query = query.filter(
            and_(
                FilamentRoll.status == FilamentRollStatus.IN_USE,
                or_(
                    FilamentRoll.reserved_until.is_(None),
                    FilamentRoll.reserved_until <= datetime.utcnow()
                )
            )
        )
    
    if assigned_printer:
        query = query.filter(FilamentRoll.assigned_printer_id == assigned_printer)
    
    # Order by status (new first), then by remaining weight (low stock first)
    query = query.order_by(FilamentRoll.status, FilamentRoll.remaining_weight_g)
    
    rolls = query.offset(offset).limit(limit).all()
    
    # Calculate remaining weight for each roll and prepare response
    response_rolls = []
    for roll in rolls:
        roll.calculate_remaining_weight()
        roll_dict = roll.to_dict()
        roll_dict['is_low_stock'] = roll.is_low_stock()
        roll_dict['needs_reorder'] = roll.needs_reorder()
        roll_dict['usage_percentage'] = roll.calculate_usage_percentage()
        roll_dict['estimated_remaining_prints'] = roll.estimate_remaining_prints()
        response_rolls.append(roll_dict)
    
    return response_rolls

@router.get("/rolls/{roll_id}", response_model=Dict[str, Any])
async def get_filament_roll(
    roll_id: str,
    include_usage_history: bool = Query(False, description="Include usage history"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific filament roll details"""
    
    roll = db.query(FilamentRoll).filter(FilamentRoll.id == roll_id).first()
    if not roll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Filament roll not found"
        )
    
    # Check access permissions
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if str(roll.makerspace_id) != str(makerspace_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this filament roll"
        )
    
    roll.calculate_remaining_weight()
    roll_dict = roll.to_dict()
    roll_dict['is_low_stock'] = roll.is_low_stock()
    roll_dict['needs_reorder'] = roll.needs_reorder()
    roll_dict['usage_percentage'] = roll.calculate_usage_percentage()
    roll_dict['estimated_remaining_prints'] = roll.estimate_remaining_prints()
    
    if include_usage_history:
        usage_logs = db.query(FilamentUsageLog).filter(
            FilamentUsageLog.filament_roll_id == roll_id
        ).order_by(desc(FilamentUsageLog.timestamp)).limit(20).all()
        
        roll_dict['usage_history'] = [log.to_dict() for log in usage_logs]
    
    return roll_dict

@router.post("/rolls", response_model=Dict[str, Any])
async def create_filament_roll(
    roll_data: FilamentRollCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new filament roll"""
    
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if not makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No makerspace associated with current user"
        )
    
    # Create filament roll
    roll = FilamentRoll(
        makerspace_id=makerspace_id,
        created_by=current_user.id,
        current_weight_g=roll_data.original_weight_g,  # Initially full
        **roll_data.dict()
    )
    
    # Calculate remaining weight
    roll.calculate_remaining_weight()
    
    db.add(roll)
    db.commit()
    db.refresh(roll)
    
    roll_dict = roll.to_dict()
    roll_dict['is_low_stock'] = roll.is_low_stock()
    roll_dict['needs_reorder'] = roll.needs_reorder()
    roll_dict['usage_percentage'] = roll.calculate_usage_percentage()
    
    return roll_dict

@router.put("/rolls/{roll_id}", response_model=Dict[str, Any])
async def update_filament_roll(
    roll_id: str,
    roll_data: FilamentRollUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update an existing filament roll"""
    
    roll = db.query(FilamentRoll).filter(FilamentRoll.id == roll_id).first()
    if not roll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Filament roll not found"
        )
    
    # Check access permissions
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if str(roll.makerspace_id) != str(makerspace_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this filament roll"
        )
    
    # Update roll fields
    update_data = roll_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(roll, field, value)
    
    roll.updated_by = current_user.id
    roll.updated_at = datetime.utcnow()
    
    # Recalculate remaining weight if current weight was updated
    roll.calculate_remaining_weight()
    
    db.commit()
    db.refresh(roll)
    
    roll_dict = roll.to_dict()
    roll_dict['is_low_stock'] = roll.is_low_stock()
    roll_dict['needs_reorder'] = roll.needs_reorder()
    roll_dict['usage_percentage'] = roll.calculate_usage_percentage()
    
    return roll_dict

@router.post("/rolls/{roll_id}/usage", response_model=Dict[str, Any])
async def record_filament_usage(
    roll_id: str,
    usage_data: FilamentUsageCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record filament usage and update roll weight"""
    
    roll = db.query(FilamentRoll).filter(FilamentRoll.id == roll_id).first()
    if not roll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Filament roll not found"
        )
    
    # Check access permissions
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if str(roll.makerspace_id) != str(makerspace_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this filament roll"
        )
    
    # Validate usage amount
    if usage_data.weight_used_g > roll.remaining_weight_g:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot use {usage_data.weight_used_g}g - only {roll.remaining_weight_g}g remaining"
        )
    
    # Record current state before usage
    weight_before = roll.current_weight_g
    
    # Update roll weight
    roll.current_weight_g -= usage_data.weight_used_g
    roll.used_weight_g += usage_data.weight_used_g
    roll.calculate_remaining_weight()
    
    # Create usage log
    usage_log = FilamentUsageLog(
        filament_roll_id=roll.id,
        weight_before_g=weight_before,
        weight_after_g=roll.current_weight_g,
        user_id=current_user.id,
        user_name=getattr(current_user, 'name', current_user.email),
        **usage_data.dict()
    )
    
    db.add(usage_log)
    
    # Update roll status based on remaining weight
    if roll.remaining_weight_g <= 0:
        roll.status = FilamentRollStatus.EMPTY
    elif roll.is_low_stock():
        roll.status = FilamentRollStatus.LOW
    
    roll.updated_by = current_user.id
    roll.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(roll)
    db.refresh(usage_log)
    
    # Check if auto-reorder should be triggered
    if roll.auto_reorder_enabled and roll.needs_reorder():
        background_tasks.add_task(
            trigger_auto_reorder,
            db,
            roll.id,
            current_user.id
        )
    
    return {
        "message": "Filament usage recorded successfully",
        "remaining_weight_g": roll.remaining_weight_g,
        "status": roll.status.value,
        "is_low_stock": roll.is_low_stock(),
        "needs_reorder": roll.needs_reorder(),
        "usage_log_id": str(usage_log.id)
    }

@router.post("/analyze-gcode", response_model=Dict[str, Any])
async def analyze_gcode_for_filament_usage(
    gcode_request: GCodeAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyze G-code to estimate filament usage"""
    
    roll = db.query(FilamentRoll).filter(FilamentRoll.id == gcode_request.filament_roll_id).first()
    if not roll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Filament roll not found"
        )
    
    # Check access permissions
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if str(roll.makerspace_id) != str(makerspace_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this filament roll"
        )
    
    try:
        # Analyze G-code (simplified implementation)
        analysis_result = analyze_gcode_content(
            gcode_request.gcode_content,
            roll.density_g_cm3 or 1.24,
            roll.diameter
        )
        
        # Check if roll can fulfill this print
        can_fulfill = roll.can_fulfill_print(analysis_result['estimated_weight_g'])
        
        return {
            "filament_roll_id": gcode_request.filament_roll_id,
            "print_name": gcode_request.print_name,
            "analysis": analysis_result,
            "can_fulfill_print": can_fulfill,
            "remaining_after_print": max(0, roll.remaining_weight_g - analysis_result['estimated_weight_g']),
            "confidence_level": analysis_result.get('confidence_level', 85.0)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"G-code analysis failed: {str(e)}"
        )

@router.post("/rolls/{roll_id}/reorder", response_model=Dict[str, Any])
async def create_reorder_request(
    roll_id: str,
    reorder_data: FilamentReorderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a reorder request for filament"""
    
    roll = db.query(FilamentRoll).filter(FilamentRoll.id == roll_id).first()
    if not roll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Filament roll not found"
        )
    
    # Check access permissions
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if str(roll.makerspace_id) != str(makerspace_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this filament roll"
        )
    
    # Create reorder request
    reorder_request = FilamentReorderRequest(
        filament_roll_id=roll.id,
        makerspace_id=roll.makerspace_id,
        requested_by=current_user.id,
        makrx_product_code=roll.makrx_product_code,
        makrx_order_url=generate_makrx_order_url(roll),
        estimated_cost=calculate_estimated_cost(roll, reorder_data.quantity),
        **reorder_data.dict()
    )
    
    db.add(reorder_request)
    db.commit()
    db.refresh(reorder_request)
    
    return {
        "message": "Reorder request created successfully",
        "reorder_request": reorder_request.to_dict(),
        "makrx_order_url": reorder_request.makrx_order_url
    }

@router.get("/usage/logs", response_model=List[Dict[str, Any]])
async def get_filament_usage_logs(
    roll_id: Optional[str] = Query(None, description="Filter by specific roll"),
    start_date: Optional[datetime] = Query(None, description="Filter from date"),
    end_date: Optional[datetime] = Query(None, description="Filter to date"),
    user_id: Optional[str] = Query(None, description="Filter by user"),
    printer_id: Optional[str] = Query(None, description="Filter by printer"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get filament usage logs with filtering"""
    
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if not makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No makerspace associated with current user"
        )
    
    # Join with filament rolls to filter by makerspace
    query = db.query(FilamentUsageLog).join(FilamentRoll).filter(
        FilamentRoll.makerspace_id == makerspace_id
    )
    
    if roll_id:
        query = query.filter(FilamentUsageLog.filament_roll_id == roll_id)
    
    if start_date:
        query = query.filter(FilamentUsageLog.timestamp >= start_date)
    
    if end_date:
        query = query.filter(FilamentUsageLog.timestamp <= end_date)
    
    if user_id:
        query = query.filter(FilamentUsageLog.user_id == user_id)
    
    if printer_id:
        query = query.filter(FilamentUsageLog.printer_id == printer_id)
    
    query = query.order_by(desc(FilamentUsageLog.timestamp))
    
    logs = query.offset(offset).limit(limit).all()
    
    return [log.to_dict() for log in logs]

@router.get("/stats", response_model=Dict[str, Any])
async def get_filament_statistics(
    days: int = Query(30, ge=1, le=365, description="Number of days for statistics"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get filament usage statistics"""
    
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    if not makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No makerspace associated with current user"
        )
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get all rolls for the makerspace
    rolls = db.query(FilamentRoll).filter(FilamentRoll.makerspace_id == makerspace_id).all()
    
    # Get usage logs for the period
    usage_logs = db.query(FilamentUsageLog).join(FilamentRoll).filter(
        and_(
            FilamentRoll.makerspace_id == makerspace_id,
            FilamentUsageLog.timestamp >= start_date
        )
    ).all()
    
    # Calculate statistics
    stats = {
        "total_rolls": len(rolls),
        "active_rolls": len([r for r in rolls if r.status in [FilamentRollStatus.NEW, FilamentRollStatus.IN_USE]]),
        "low_stock_rolls": len([r for r in rolls if r.is_low_stock()]),
        "empty_rolls": len([r for r in rolls if r.status == FilamentRollStatus.EMPTY]),
        "total_weight_remaining_g": sum(r.remaining_weight_g for r in rolls),
        "total_usage_period_g": sum(log.weight_used_g for log in usage_logs),
        "average_daily_usage_g": sum(log.weight_used_g for log in usage_logs) / days if usage_logs else 0,
        "total_prints": len([log for log in usage_logs if log.print_name]),
        "successful_prints": len([log for log in usage_logs if log.print_success is True]),
        "failed_prints": len([log for log in usage_logs if log.print_success is False]),
        "material_breakdown": {},
        "brand_breakdown": {},
        "usage_by_day": []
    }
    
    # Material and brand breakdown
    for roll in rolls:
        material = roll.material.value if roll.material else "unknown"
        brand = roll.brand.value if roll.brand else "unknown"
        
        if material not in stats["material_breakdown"]:
            stats["material_breakdown"][material] = {"count": 0, "total_weight_g": 0}
        stats["material_breakdown"][material]["count"] += 1
        stats["material_breakdown"][material]["total_weight_g"] += roll.remaining_weight_g
        
        if brand not in stats["brand_breakdown"]:
            stats["brand_breakdown"][brand] = {"count": 0, "total_weight_g": 0}
        stats["brand_breakdown"][brand]["count"] += 1
        stats["brand_breakdown"][brand]["total_weight_g"] += roll.remaining_weight_g
    
    return stats

# Helper functions

def analyze_gcode_content(gcode_content: str, density_g_cm3: float, diameter_mm: float) -> Dict[str, Any]:
    """Analyze G-code content to estimate filament usage"""
    lines = gcode_content.split('\n')
    
    # Extract filament usage from G-code comments (most slicers include this)
    estimated_length_mm = 0
    estimated_weight_g = 0
    layer_count = 0
    print_time_estimate = 0
    
    for line in lines:
        line = line.strip()
        
        # Look for slicer comments with filament usage
        if '; filament used [mm]' in line.lower():
            try:
                estimated_length_mm = float(line.split('=')[-1].strip().replace('mm', ''))
            except (ValueError, IndexError):
                pass
        
        elif '; filament used [g]' in line.lower():
            try:
                estimated_weight_g = float(line.split('=')[-1].strip().replace('g', ''))
            except (ValueError, IndexError):
                pass
        
        elif '; layer count:' in line.lower() or '; total layers:' in line.lower():
            try:
                layer_count = int(line.split(':')[-1].strip())
            except (ValueError, IndexError):
                pass
        
        elif '; estimated printing time' in line.lower():
            # Parse time estimate
            pass
    
    # If weight not found, calculate from length
    if estimated_weight_g == 0 and estimated_length_mm > 0:
        # Calculate volume: π * r² * length
        radius_mm = diameter_mm / 2
        volume_mm3 = 3.14159 * (radius_mm ** 2) * estimated_length_mm
        volume_cm3 = volume_mm3 / 1000
        estimated_weight_g = volume_cm3 * density_g_cm3
    
    # If no estimates found, use basic heuristics
    if estimated_weight_g == 0:
        # Count extrusion commands as a fallback
        extrusion_commands = len([line for line in lines if line.startswith('G1') and 'E' in line])
        estimated_weight_g = max(10, extrusion_commands * 0.1)  # Very rough estimate
    
    return {
        "estimated_weight_g": round(estimated_weight_g, 2),
        "estimated_length_mm": round(estimated_length_mm, 2),
        "layer_count": layer_count,
        "print_time_estimate_minutes": print_time_estimate,
        "confidence_level": 90.0 if estimated_weight_g > 0 else 30.0,
        "analysis_method": "gcode_comments" if estimated_weight_g > 0 else "heuristic"
    }

def generate_makrx_order_url(roll: FilamentRoll) -> str:
    """Generate MakrX Store order URL for reordering"""
    if roll.makrx_product_code:
        return f"https://store.makrx.org/product/{roll.makrx_product_code}?utm_source=makrcave&utm_medium=reorder"
    else:
        # Search URL based on material and brand
        search_query = f"{roll.brand.value}+{roll.material.value}+{roll.color_name}".replace(' ', '+')
        return f"https://store.makrx.org/search?q={search_query}&utm_source=makrcave&utm_medium=reorder"

def calculate_estimated_cost(roll: FilamentRoll, quantity: int) -> float:
    """Calculate estimated cost for reordering"""
    if roll.cost_per_kg and roll.original_weight_g:
        weight_kg = roll.original_weight_g / 1000
        return roll.cost_per_kg * weight_kg * quantity
    elif roll.total_cost:
        return roll.total_cost * quantity
    else:
        # Default estimate based on material type
        default_costs = {
            FilamentMaterial.PLA: 25.0,
            FilamentMaterial.ABS: 30.0,
            FilamentMaterial.PETG: 35.0,
            FilamentMaterial.TPU: 45.0,
            FilamentMaterial.WOOD_PLA: 40.0,
            FilamentMaterial.CARBON_FIBER: 80.0,
        }
        return default_costs.get(roll.material, 30.0) * quantity

async def trigger_auto_reorder(db: Session, roll_id: str, user_id: str):
    """Background task to trigger auto-reorder"""
    try:
        roll = db.query(FilamentRoll).filter(FilamentRoll.id == roll_id).first()
        if not roll:
            return
        
        # Check if there's already a pending reorder
        existing_request = db.query(FilamentReorderRequest).filter(
            and_(
                FilamentReorderRequest.filament_roll_id == roll_id,
                FilamentReorderRequest.status == "pending"
            )
        ).first()
        
        if existing_request:
            return  # Already has pending reorder
        
        # Create auto-reorder request
        auto_reorder = FilamentReorderRequest(
            filament_roll_id=roll.id,
            makerspace_id=roll.makerspace_id,
            requested_by=user_id,
            quantity=roll.reorder_quantity,
            urgent=roll.remaining_weight_g <= (roll.low_weight_threshold_g / 2),  # Urgent if very low
            is_auto_generated=True,
            trigger_weight_g=roll.remaining_weight_g,
            makrx_product_code=roll.makrx_product_code,
            makrx_order_url=generate_makrx_order_url(roll),
            estimated_cost=calculate_estimated_cost(roll, roll.reorder_quantity),
            notes="Auto-generated reorder due to low stock"
        )
        
        db.add(auto_reorder)
        db.commit()
        
    except Exception as e:
        print(f"Auto-reorder failed for roll {roll_id}: {str(e)}")
