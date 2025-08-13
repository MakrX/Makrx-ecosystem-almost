from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

from ..models.equipment import (
    Equipment, EquipmentMaintenanceLog, EquipmentReservation, 
    EquipmentRating, EquipmentUsageSession, EquipmentStatus, ReservationStatus
)
from ..schemas.equipment import (
    EquipmentCreate, EquipmentUpdate, EquipmentFilter,
    ReservationCreate, ReservationUpdate,
    MaintenanceLogCreate, MaintenanceLogUpdate,
    EquipmentRatingCreate, EquipmentRatingUpdate,
    UsageSessionCreate, UsageSessionUpdate
)

class EquipmentCRUD:
    
    def get_equipment_list(
        self, 
        db: Session, 
        makerspace_id: str,
        filters: EquipmentFilter,
        user_role: str = "user"
    ) -> List[Equipment]:
        """Get filtered list of equipment"""
        query = db.query(Equipment)
        
        # Makerspace filtering (unless super admin)
        if user_role != "super_admin":
            query = query.filter(Equipment.linked_makerspace_id == makerspace_id)
        
        # Apply filters
        if filters.category:
            query = query.filter(Equipment.category == filters.category)
        
        if filters.status:
            query = query.filter(Equipment.status == filters.status)
        
        if filters.location:
            query = query.filter(Equipment.location.ilike(f"%{filters.location}%"))
        
        if filters.makerspace_id and user_role == "super_admin":
            query = query.filter(Equipment.linked_makerspace_id == filters.makerspace_id)
        
        if filters.requires_certification is not None:
            query = query.filter(Equipment.requires_certification == filters.requires_certification)
        
        if filters.available_only:
            query = query.filter(Equipment.status == EquipmentStatus.AVAILABLE)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Equipment.name.ilike(search_term),
                    Equipment.equipment_id.ilike(search_term),
                    Equipment.manufacturer.ilike(search_term),
                    Equipment.model.ilike(search_term),
                    Equipment.description.ilike(search_term)
                )
            )
        
        # Sorting
        if filters.sort_order == "desc":
            query = query.order_by(desc(getattr(Equipment, filters.sort_by, Equipment.name)))
        else:
            query = query.order_by(asc(getattr(Equipment, filters.sort_by, Equipment.name)))
        
        # Pagination
        return query.offset(filters.skip).limit(filters.limit).all()
    
    def get_equipment_by_id(self, db: Session, equipment_id: str) -> Optional[Equipment]:
        """Get equipment by ID with all relationships"""
        return db.query(Equipment).filter(Equipment.id == equipment_id).first()
    
    def get_equipment_by_equipment_id(self, db: Session, equipment_id: str) -> Optional[Equipment]:
        """Get equipment by equipment_id"""
        return db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    
    def create_equipment(
        self, 
        db: Session, 
        equipment_data: EquipmentCreate,
        created_by_user_id: str,
        created_by_user_name: str
    ) -> Equipment:
        """Create new equipment"""
        
        # Check for duplicate equipment_id
        existing = self.get_equipment_by_equipment_id(db, equipment_data.equipment_id)
        if existing:
            raise ValueError(f"Equipment with ID {equipment_data.equipment_id} already exists")
        
        # Calculate duration hours if start/end times provided
        duration_hours = 0
        if equipment_data.available_slots:
            # Calculate total weekly available hours
            for day_slots in equipment_data.available_slots.values():
                for slot in day_slots:
                    if 'start_time' in slot and 'end_time' in slot:
                        # Simple calculation - would need proper time parsing in production
                        duration_hours += 8  # Default 8 hours per slot
        
        db_equipment = Equipment(
            id=str(uuid.uuid4()),
            equipment_id=equipment_data.equipment_id,
            name=equipment_data.name,
            category=equipment_data.category,
            sub_category=equipment_data.sub_category,
            location=equipment_data.location,
            linked_makerspace_id=equipment_data.linked_makerspace_id,
            available_slots=equipment_data.available_slots,
            requires_certification=equipment_data.requires_certification,
            certification_required=equipment_data.certification_required,
            maintenance_interval_hours=equipment_data.maintenance_interval_hours,
            manufacturer=equipment_data.manufacturer,
            model=equipment_data.model,
            serial_number=equipment_data.serial_number,
            purchase_date=equipment_data.purchase_date,
            warranty_expiry=equipment_data.warranty_expiry,
            hourly_rate=equipment_data.hourly_rate,
            deposit_required=equipment_data.deposit_required,
            description=equipment_data.description,
            specifications=equipment_data.specifications,
            manual_url=equipment_data.manual_url,
            image_url=equipment_data.image_url,
            notes=equipment_data.notes,
            created_by=created_by_user_id
        )
        
        db.add(db_equipment)
        db.commit()
        db.refresh(db_equipment)
        return db_equipment
    
    def update_equipment(
        self, 
        db: Session, 
        equipment_id: str, 
        equipment_data: EquipmentUpdate,
        updated_by_user_id: str
    ) -> Equipment:
        """Update equipment"""
        db_equipment = self.get_equipment_by_id(db, equipment_id)
        if not db_equipment:
            raise ValueError("Equipment not found")
        
        # Update fields
        update_data = equipment_data.dict(exclude_unset=True)
        update_data['updated_by'] = updated_by_user_id
        update_data['updated_at'] = datetime.utcnow()
        
        for field, value in update_data.items():
            setattr(db_equipment, field, value)
        
        db.commit()
        db.refresh(db_equipment)
        return db_equipment
    
    def delete_equipment(self, db: Session, equipment_id: str) -> bool:
        """Delete equipment"""
        db_equipment = self.get_equipment_by_id(db, equipment_id)
        if not db_equipment:
            return False
        
        # Check for active reservations
        active_reservations = db.query(EquipmentReservation).filter(
            and_(
                EquipmentReservation.equipment_id == equipment_id,
                EquipmentReservation.status.in_([ReservationStatus.APPROVED, ReservationStatus.ACTIVE])
            )
        ).count()
        
        if active_reservations > 0:
            raise ValueError("Cannot delete equipment with active reservations")
        
        db.delete(db_equipment)
        db.commit()
        return True
    
    # Reservation methods
    def create_reservation(
        self, 
        db: Session, 
        reservation_data: ReservationCreate,
        user_id: str,
        user_name: str,
        user_email: str = None
    ) -> EquipmentReservation:
        """Create equipment reservation"""
        
        # Check equipment exists and is available
        equipment = self.get_equipment_by_id(db, reservation_data.equipment_id)
        if not equipment:
            raise ValueError("Equipment not found")
        
        if equipment.status not in [EquipmentStatus.AVAILABLE]:
            raise ValueError(f"Equipment is not available (status: {equipment.status})")
        
        # Check for conflicting reservations
        conflicts = db.query(EquipmentReservation).filter(
            and_(
                EquipmentReservation.equipment_id == reservation_data.equipment_id,
                EquipmentReservation.status.in_([ReservationStatus.APPROVED, ReservationStatus.ACTIVE]),
                or_(
                    and_(
                        EquipmentReservation.start_time <= reservation_data.start_time,
                        EquipmentReservation.end_time > reservation_data.start_time
                    ),
                    and_(
                        EquipmentReservation.start_time < reservation_data.end_time,
                        EquipmentReservation.end_time >= reservation_data.end_time
                    ),
                    and_(
                        EquipmentReservation.start_time >= reservation_data.start_time,
                        EquipmentReservation.end_time <= reservation_data.end_time
                    )
                )
            )
        ).count()
        
        if conflicts > 0:
            raise ValueError("Time slot conflicts with existing reservation")
        
        # Calculate duration
        duration = (reservation_data.end_time - reservation_data.start_time).total_seconds() / 3600
        
        # Check certification requirement
        certification_verified = True
        if equipment.requires_certification and equipment.certification_required:
            # In a real implementation, check against user's certifications
            # For now, assume verification is required
            certification_verified = False
        
        db_reservation = EquipmentReservation(
            id=str(uuid.uuid4()),
            equipment_id=reservation_data.equipment_id,
            user_id=user_id,
            user_name=user_name,
            user_email=user_email,
            start_time=reservation_data.start_time,
            end_time=reservation_data.end_time,
            duration_hours=duration,
            purpose=reservation_data.purpose,
            project_id=reservation_data.project_id,
            project_name=reservation_data.project_name,
            certification_verified=certification_verified,
            user_notes=reservation_data.user_notes,
            hourly_rate_charged=equipment.hourly_rate
        )
        
        # Calculate total cost
        if equipment.hourly_rate:
            db_reservation.total_cost = duration * equipment.hourly_rate
        
        db.add(db_reservation)
        db.commit()
        db.refresh(db_reservation)
        return db_reservation
    
    def update_reservation(
        self, 
        db: Session, 
        reservation_id: str, 
        reservation_data: ReservationUpdate
    ) -> EquipmentReservation:
        """Update reservation"""
        db_reservation = db.query(EquipmentReservation).filter(
            EquipmentReservation.id == reservation_id
        ).first()
        
        if not db_reservation:
            raise ValueError("Reservation not found")
        
        update_data = reservation_data.dict(exclude_unset=True)
        update_data['updated_at'] = datetime.utcnow()
        
        # Recalculate duration if times changed
        if 'start_time' in update_data or 'end_time' in update_data:
            start_time = update_data.get('start_time', db_reservation.start_time)
            end_time = update_data.get('end_time', db_reservation.end_time)
            duration = (end_time - start_time).total_seconds() / 3600
            update_data['duration_hours'] = duration
        
        for field, value in update_data.items():
            setattr(db_reservation, field, value)
        
        db.commit()
        db.refresh(db_reservation)
        return db_reservation
    
    def approve_reservation(
        self, 
        db: Session, 
        reservation_id: str, 
        approved_by: str,
        admin_notes: str = None
    ) -> EquipmentReservation:
        """Approve or reject reservation"""
        db_reservation = db.query(EquipmentReservation).filter(
            EquipmentReservation.id == reservation_id
        ).first()
        
        if not db_reservation:
            raise ValueError("Reservation not found")
        
        db_reservation.status = ReservationStatus.APPROVED
        db_reservation.approved_by = approved_by
        db_reservation.approved_at = datetime.utcnow()
        if admin_notes:
            db_reservation.admin_notes = admin_notes
        
        db.commit()
        db.refresh(db_reservation)
        return db_reservation
    
    def get_reservations(
        self, 
        db: Session, 
        equipment_id: str = None,
        user_id: str = None,
        start_date: datetime = None,
        end_date: datetime = None,
        status: ReservationStatus = None
    ) -> List[EquipmentReservation]:
        """Get reservations with filters"""
        query = db.query(EquipmentReservation)
        
        if equipment_id:
            query = query.filter(EquipmentReservation.equipment_id == equipment_id)
        
        if user_id:
            query = query.filter(EquipmentReservation.user_id == user_id)
        
        if start_date:
            query = query.filter(EquipmentReservation.start_time >= start_date)
        
        if end_date:
            query = query.filter(EquipmentReservation.end_time <= end_date)
        
        if status:
            query = query.filter(EquipmentReservation.status == status)
        
        return query.order_by(EquipmentReservation.start_time).all()
    
    # Maintenance methods
    def create_maintenance_log(
        self, 
        db: Session, 
        maintenance_data: MaintenanceLogCreate,
        performed_by_user_id: str,
        performed_by_name: str
    ) -> EquipmentMaintenanceLog:
        """Create maintenance log"""
        
        equipment = self.get_equipment_by_id(db, maintenance_data.equipment_id)
        if not equipment:
            raise ValueError("Equipment not found")
        
        # Calculate total cost
        total_cost = 0
        if maintenance_data.labor_cost:
            total_cost += maintenance_data.labor_cost
        if maintenance_data.parts_cost:
            total_cost += maintenance_data.parts_cost
        
        db_maintenance = EquipmentMaintenanceLog(
            id=str(uuid.uuid4()),
            equipment_id=maintenance_data.equipment_id,
            maintenance_type=maintenance_data.maintenance_type,
            title=maintenance_data.title,
            description=maintenance_data.description,
            scheduled_date=maintenance_data.scheduled_date,
            started_at=maintenance_data.started_at,
            duration_hours=maintenance_data.duration_hours,
            performed_by_user_id=performed_by_user_id,
            performed_by_name=performed_by_name,
            supervised_by=maintenance_data.supervised_by,
            parts_used=maintenance_data.parts_used,
            labor_cost=maintenance_data.labor_cost,
            parts_cost=maintenance_data.parts_cost,
            total_cost=total_cost,
            issues_found=maintenance_data.issues_found,
            actions_taken=maintenance_data.actions_taken,
            recommendations=maintenance_data.recommendations,
            next_maintenance_due=maintenance_data.next_maintenance_due,
            notes=maintenance_data.notes
        )
        
        db.add(db_maintenance)
        
        # Update equipment maintenance date if completed
        if db_maintenance.completed_at:
            equipment.last_maintenance_date = db_maintenance.completed_at
            if maintenance_data.next_maintenance_due:
                equipment.next_maintenance_date = maintenance_data.next_maintenance_due
        
        db.commit()
        db.refresh(db_maintenance)
        return db_maintenance
    
    def update_maintenance_log(
        self, 
        db: Session, 
        maintenance_id: str, 
        maintenance_data: MaintenanceLogUpdate
    ) -> EquipmentMaintenanceLog:
        """Update maintenance log"""
        db_maintenance = db.query(EquipmentMaintenanceLog).filter(
            EquipmentMaintenanceLog.id == maintenance_id
        ).first()
        
        if not db_maintenance:
            raise ValueError("Maintenance log not found")
        
        update_data = maintenance_data.dict(exclude_unset=True)
        
        # Recalculate total cost if needed
        if 'labor_cost' in update_data or 'parts_cost' in update_data:
            labor_cost = update_data.get('labor_cost', db_maintenance.labor_cost) or 0
            parts_cost = update_data.get('parts_cost', db_maintenance.parts_cost) or 0
            update_data['total_cost'] = labor_cost + parts_cost
        
        for field, value in update_data.items():
            setattr(db_maintenance, field, value)
        
        db.commit()
        db.refresh(db_maintenance)
        return db_maintenance
    
    def set_maintenance_mode(
        self, 
        db: Session, 
        equipment_id: str, 
        enable: bool,
        reason: str = None
    ) -> Equipment:
        """Set equipment maintenance mode"""
        equipment = self.get_equipment_by_id(db, equipment_id)
        if not equipment:
            raise ValueError("Equipment not found")
        
        if enable:
            equipment.status = EquipmentStatus.UNDER_MAINTENANCE
            if reason:
                equipment.notes = f"Maintenance mode: {reason}"
        else:
            equipment.status = EquipmentStatus.AVAILABLE
        
        db.commit()
        db.refresh(equipment)
        return equipment
    
    # Rating methods
    def create_rating(
        self, 
        db: Session, 
        rating_data: EquipmentRatingCreate,
        user_id: str,
        user_name: str
    ) -> EquipmentRating:
        """Create equipment rating"""
        
        # Check if user already rated this equipment
        existing_rating = db.query(EquipmentRating).filter(
            and_(
                EquipmentRating.equipment_id == rating_data.equipment_id,
                EquipmentRating.user_id == user_id
            )
        ).first()
        
        if existing_rating:
            raise ValueError("User has already rated this equipment")
        
        db_rating = EquipmentRating(
            id=str(uuid.uuid4()),
            equipment_id=rating_data.equipment_id,
            user_id=user_id,
            user_name=user_name,
            reservation_id=rating_data.reservation_id,
            overall_rating=rating_data.overall_rating,
            reliability_rating=rating_data.reliability_rating,
            ease_of_use_rating=rating_data.ease_of_use_rating,
            condition_rating=rating_data.condition_rating,
            feedback_text=rating_data.feedback_text,
            pros=rating_data.pros,
            cons=rating_data.cons,
            suggestions=rating_data.suggestions,
            issues_encountered=rating_data.issues_encountered,
            would_recommend=rating_data.would_recommend,
            difficulty_level=rating_data.difficulty_level
        )
        
        db.add(db_rating)
        
        # Update equipment average rating
        equipment = self.get_equipment_by_id(db, rating_data.equipment_id)
        if equipment:
            total_rating = (equipment.average_rating * equipment.total_ratings) + rating_data.overall_rating
            equipment.total_ratings += 1
            equipment.average_rating = total_rating / equipment.total_ratings
        
        db.commit()
        db.refresh(db_rating)
        return db_rating
    
    def get_equipment_stats(self, db: Session, makerspace_id: str = None) -> Dict[str, Any]:
        """Get equipment statistics"""
        query = db.query(Equipment)
        
        if makerspace_id:
            query = query.filter(Equipment.linked_makerspace_id == makerspace_id)
        
        total_equipment = query.count()
        available_equipment = query.filter(Equipment.status == EquipmentStatus.AVAILABLE).count()
        in_use_equipment = query.filter(Equipment.status == EquipmentStatus.IN_USE).count()
        maintenance_equipment = query.filter(Equipment.status == EquipmentStatus.UNDER_MAINTENANCE).count()
        offline_equipment = query.filter(Equipment.status == EquipmentStatus.OFFLINE).count()
        
        # Today's reservations
        today = datetime.now().date()
        reservations_today = db.query(EquipmentReservation).filter(
            func.date(EquipmentReservation.start_time) == today
        ).count()
        
        # Utilization rate (simplified calculation)
        utilization_rate = (in_use_equipment / total_equipment * 100) if total_equipment > 0 else 0
        
        # Average rating
        avg_rating = db.query(func.avg(Equipment.average_rating)).scalar() or 0
        
        # Category breakdown
        categories = db.query(
            Equipment.category, 
            func.count(Equipment.id)
        ).group_by(Equipment.category).all()
        
        # Location breakdown
        locations = db.query(
            Equipment.location, 
            func.count(Equipment.id)
        ).group_by(Equipment.location).all()
        
        return {
            "total_equipment": total_equipment,
            "available_equipment": available_equipment,
            "in_use_equipment": in_use_equipment,
            "maintenance_equipment": maintenance_equipment,
            "offline_equipment": offline_equipment,
            "total_reservations_today": reservations_today,
            "utilization_rate": round(utilization_rate, 2),
            "average_rating": round(avg_rating, 2),
            "categories": dict(categories),
            "locations": dict(locations)
        }
    
    def get_equipment_availability(
        self, 
        db: Session, 
        equipment_id: str, 
        date: datetime
    ) -> Dict[str, Any]:
        """Get equipment availability for a specific date"""
        equipment = self.get_equipment_by_id(db, equipment_id)
        if not equipment:
            raise ValueError("Equipment not found")
        
        # Get reservations for the date
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        reservations = db.query(EquipmentReservation).filter(
            and_(
                EquipmentReservation.equipment_id == equipment_id,
                EquipmentReservation.start_time >= start_of_day,
                EquipmentReservation.start_time < end_of_day,
                EquipmentReservation.status.in_([ReservationStatus.APPROVED, ReservationStatus.ACTIVE])
            )
        ).all()
        
        return {
            "equipment_id": equipment_id,
            "date": date,
            "available_slots": equipment.available_slots,
            "reservations": reservations,
            "equipment_status": equipment.status
        }
