from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..crud.equipment import EquipmentCRUD
from ..schemas.equipment import (
    EquipmentResponse, EquipmentCreate, EquipmentUpdate, EquipmentFilter,
    ReservationResponse, ReservationCreate, ReservationUpdate, ReservationApprovalRequest,
    MaintenanceLogResponse, MaintenanceLogCreate, MaintenanceLogUpdate,
    EquipmentRatingResponse, EquipmentRatingCreate, EquipmentRatingUpdate,
    UsageSessionResponse, UsageSessionCreate, UsageSessionUpdate,
    EquipmentStatsResponse, AvailabilityResponse, MaintenanceModeRequest,
    BulkOperationRequest, SuccessResponse
)
from ..models.equipment import Equipment, EquipmentReservation, EquipmentMaintenanceLog
from ..dependencies import get_db, get_current_user, check_permission

router = APIRouter(prefix="/equipment", tags=["equipment"])
equipment_crud = EquipmentCRUD()

@router.get("/", response_model=List[EquipmentResponse])
async def list_equipment(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    makerspace_id: Optional[str] = Query(None),
    requires_certification: Optional[bool] = Query(None),
    available_only: bool = Query(False),
    search: Optional[str] = Query(None),
    sort_by: str = Query("name"),
    sort_order: str = Query("asc")
):
    """List equipment with filtering and pagination"""
    try:
        filters = EquipmentFilter(
            category=category,
            status=status,
            location=location,
            makerspace_id=makerspace_id,
            requires_certification=requires_certification,
            available_only=available_only,
            search=search,
            skip=skip,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        equipment_list = equipment_crud.get_equipment_list(
            db=db,
            makerspace_id=current_user.makerspace_id,
            filters=filters,
            user_role=current_user.role
        )
        
        return equipment_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment(
    equipment_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get equipment details by ID"""
    equipment = equipment_crud.get_equipment_by_id(db=db, equipment_id=equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Check if user has access to this makerspace's equipment
    if equipment.linked_makerspace_id != current_user.makerspace_id and current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    return equipment

@router.post("/", response_model=EquipmentResponse)
async def create_equipment(
    equipment_data: EquipmentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create new equipment"""
    # Check permissions
    if not check_permission(current_user.role, "create_equipment"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        # Set the makerspace_id to current user's makerspace
        equipment_data.linked_makerspace_id = current_user.makerspace_id
        
        equipment = equipment_crud.create_equipment(
            db=db,
            equipment_data=equipment_data,
            created_by_user_id=current_user.id,
            created_by_user_name=current_user.name
        )
        
        return equipment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: str,
    equipment_data: EquipmentUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update equipment"""
    # Check permissions
    if not check_permission(current_user.role, "create_equipment"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Check if equipment exists and user has access
    existing_equipment = equipment_crud.get_equipment_by_id(db=db, equipment_id=equipment_id)
    if not existing_equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    if existing_equipment.linked_makerspace_id != current_user.makerspace_id and current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        equipment = equipment_crud.update_equipment(
            db=db,
            equipment_id=equipment_id,
            equipment_data=equipment_data,
            updated_by_user_id=current_user.id
        )
        
        return equipment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{equipment_id}")
async def delete_equipment(
    equipment_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete equipment"""
    # Check permissions
    if not check_permission(current_user.role, "delete_equipment"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Check if equipment exists and user has access
    existing_equipment = equipment_crud.get_equipment_by_id(db=db, equipment_id=equipment_id)
    if not existing_equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    if existing_equipment.linked_makerspace_id != current_user.makerspace_id and current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        success = equipment_crud.delete_equipment(db=db, equipment_id=equipment_id)
        if success:
            return {"message": "Equipment deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Equipment not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Reservation endpoints
@router.post("/{equipment_id}/reserve", response_model=ReservationResponse)
async def create_reservation(
    equipment_id: str,
    reservation_data: ReservationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create equipment reservation"""
    # Check permissions
    if not check_permission(current_user.role, "reserve"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        reservation_data.equipment_id = equipment_id
        
        reservation = equipment_crud.create_reservation(
            db=db,
            reservation_data=reservation_data,
            user_id=current_user.id,
            user_name=current_user.name,
            user_email=getattr(current_user, 'email', None)
        )
        
        return reservation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{equipment_id}/reservations", response_model=List[ReservationResponse])
async def get_equipment_reservations(
    equipment_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    status: Optional[str] = Query(None)
):
    """Get reservations for equipment"""
    # Check if equipment exists and user has access
    equipment = equipment_crud.get_equipment_by_id(db=db, equipment_id=equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    if equipment.linked_makerspace_id != current_user.makerspace_id and current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    reservations = equipment_crud.get_reservations(
        db=db,
        equipment_id=equipment_id,
        start_date=start_date,
        end_date=end_date,
        status=status
    )
    
    return reservations

@router.put("/reservations/{reservation_id}", response_model=ReservationResponse)
async def update_reservation(
    reservation_id: str,
    reservation_data: ReservationUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update reservation"""
    try:
        reservation = equipment_crud.update_reservation(
            db=db,
            reservation_id=reservation_id,
            reservation_data=reservation_data
        )
        
        return reservation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reservations/{reservation_id}/approve")
async def approve_reservation(
    reservation_id: str,
    approval_data: ReservationApprovalRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Approve or reject reservation"""
    # Check permissions
    if not check_permission(current_user.role, "maintenance_logs"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        if approval_data.approved:
            reservation = equipment_crud.approve_reservation(
                db=db,
                reservation_id=reservation_id,
                approved_by=current_user.name,
                admin_notes=approval_data.admin_notes
            )
            return {"message": "Reservation approved", "reservation": reservation}
        else:
            # For rejection, we update status
            from ..schemas.equipment import ReservationUpdate, ReservationStatus
            update_data = ReservationUpdate(
                status=ReservationStatus.CANCELLED,
                admin_notes=approval_data.admin_notes
            )
            reservation = equipment_crud.update_reservation(
                db=db,
                reservation_id=reservation_id,
                reservation_data=update_data
            )
            return {"message": "Reservation rejected", "reservation": reservation}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Maintenance endpoints
@router.post("/{equipment_id}/maintenance", response_model=MaintenanceLogResponse)
async def create_maintenance_log(
    equipment_id: str,
    maintenance_data: MaintenanceLogCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create maintenance log"""
    # Check permissions
    if not check_permission(current_user.role, "maintenance_logs"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        maintenance_data.equipment_id = equipment_id
        
        maintenance_log = equipment_crud.create_maintenance_log(
            db=db,
            maintenance_data=maintenance_data,
            performed_by_user_id=current_user.id,
            performed_by_name=current_user.name
        )
        
        return maintenance_log
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/maintenance/{maintenance_id}", response_model=MaintenanceLogResponse)
async def update_maintenance_log(
    maintenance_id: str,
    maintenance_data: MaintenanceLogUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update maintenance log"""
    # Check permissions
    if not check_permission(current_user.role, "maintenance_logs"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        maintenance_log = equipment_crud.update_maintenance_log(
            db=db,
            maintenance_id=maintenance_id,
            maintenance_data=maintenance_data
        )
        
        return maintenance_log
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{equipment_id}/maintenance-mode")
async def set_maintenance_mode(
    equipment_id: str,
    maintenance_request: MaintenanceModeRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Set equipment maintenance mode on/off"""
    # Check permissions
    if not check_permission(current_user.role, "maintenance_logs"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        equipment = equipment_crud.set_maintenance_mode(
            db=db,
            equipment_id=equipment_id,
            enable=maintenance_request.enable,
            reason=maintenance_request.reason
        )
        
        mode = "enabled" if maintenance_request.enable else "disabled"
        return {"message": f"Maintenance mode {mode}", "equipment": equipment}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Rating endpoints
@router.post("/{equipment_id}/rating", response_model=EquipmentRatingResponse)
async def create_equipment_rating(
    equipment_id: str,
    rating_data: EquipmentRatingCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create equipment rating and feedback"""
    try:
        rating_data.equipment_id = equipment_id
        
        rating = equipment_crud.create_rating(
            db=db,
            rating_data=rating_data,
            user_id=current_user.id,
            user_name=current_user.name
        )
        
        return rating
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{equipment_id}/ratings", response_model=List[EquipmentRatingResponse])
async def get_equipment_ratings(
    equipment_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200)
):
    """Get equipment ratings and feedback"""
    # Check if equipment exists
    equipment = equipment_crud.get_equipment_by_id(db=db, equipment_id=equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Get ratings
    ratings = db.query(EquipmentRating).filter(
        EquipmentRating.equipment_id == equipment_id,
        EquipmentRating.is_approved == True
    ).offset(skip).limit(limit).all()
    
    return ratings

# Analytics and stats
@router.get("/stats/overview", response_model=EquipmentStatsResponse)
async def get_equipment_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    makerspace_id: Optional[str] = Query(None)
):
    """Get equipment statistics"""
    # For non-super admins, use their makerspace
    if current_user.role != "super_admin":
        makerspace_id = current_user.makerspace_id
    
    stats = equipment_crud.get_equipment_stats(
        db=db,
        makerspace_id=makerspace_id
    )
    
    return stats

@router.get("/{equipment_id}/availability", response_model=AvailabilityResponse)
async def get_equipment_availability(
    equipment_id: str,
    date: datetime = Query(..., description="Date to check availability"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get equipment availability for a specific date"""
    try:
        availability = equipment_crud.get_equipment_availability(
            db=db,
            equipment_id=equipment_id,
            date=date
        )
        
        return availability
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Bulk operations
@router.post("/bulk/operation")
async def bulk_equipment_operation(
    operation_data: BulkOperationRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Perform bulk operations on equipment"""
    # Check permissions
    if not check_permission(current_user.role, "create_equipment"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        results = {"success": [], "failed": []}
        
        for equipment_id in operation_data.equipment_ids:
            try:
                equipment = equipment_crud.get_equipment_by_id(db=db, equipment_id=equipment_id)
                if not equipment:
                    results["failed"].append({"id": equipment_id, "error": "Equipment not found"})
                    continue
                
                # Check access
                if equipment.linked_makerspace_id != current_user.makerspace_id and current_user.role != "super_admin":
                    results["failed"].append({"id": equipment_id, "error": "Access denied"})
                    continue
                
                if operation_data.action == "maintenance":
                    equipment_crud.set_maintenance_mode(db=db, equipment_id=equipment_id, enable=True, reason=operation_data.reason)
                elif operation_data.action == "offline":
                    from ..schemas.equipment import EquipmentUpdate, EquipmentStatus
                    update_data = EquipmentUpdate(status=EquipmentStatus.OFFLINE, updated_by=current_user.id)
                    equipment_crud.update_equipment(db=db, equipment_id=equipment_id, equipment_data=update_data, updated_by_user_id=current_user.id)
                elif operation_data.action == "available":
                    from ..schemas.equipment import EquipmentUpdate, EquipmentStatus
                    update_data = EquipmentUpdate(status=EquipmentStatus.AVAILABLE, updated_by=current_user.id)
                    equipment_crud.update_equipment(db=db, equipment_id=equipment_id, equipment_data=update_data, updated_by_user_id=current_user.id)
                elif operation_data.action == "delete":
                    equipment_crud.delete_equipment(db=db, equipment_id=equipment_id)
                
                results["success"].append(equipment_id)
                
            except Exception as e:
                results["failed"].append({"id": equipment_id, "error": str(e)})
        
        return {
            "message": f"Bulk operation completed. Success: {len(results['success'])}, Failed: {len(results['failed'])}",
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# User reservations
@router.get("/reservations/my", response_model=List[ReservationResponse])
async def get_my_reservations(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    status: Optional[str] = Query(None)
):
    """Get current user's reservations"""
    reservations = equipment_crud.get_reservations(
        db=db,
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        status=status
    )
    
    return reservations
