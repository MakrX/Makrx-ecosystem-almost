from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime

from ..database import get_db
from ..dependencies import get_current_user, get_current_admin_user
from ..models.user import User
from ..schemas.makerspace_settings import (
    MakerspaceSettingsResponse,
    MakerspaceSettingsUpdate,
    MakerspaceSettingsPublic,
    FeatureToggleRequest,
    SettingsExportResponse,
    SettingsImportRequest,
    GeneralInformationUpdate,
    AccessControlUpdate,
    InventorySettingsUpdate,
    BillingConfigUpdate,
    ServiceModeUpdate,
    AppearanceUpdate
)
from ..crud.makerspace_settings import get_makerspace_settings_crud

router = APIRouter(prefix="/makerspace/settings", tags=["Makerspace Settings"])

@router.get("/", response_model=MakerspaceSettingsResponse)
async def get_makerspace_settings(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get current makerspace settings for the admin user.
    Only accessible by makerspace admins and super admins.
    """
    crud = get_makerspace_settings_crud(db)
    
    # For now, we'll assume one makerspace per admin
    # In a multi-makerspace setup, you'd need to determine which makerspace
    # the current user is admin of
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    
    if not makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No makerspace associated with current user"
        )
    
    settings = crud.get_by_makerspace_id(str(makerspace_id))
    
    if not settings:
        # Create default settings if none exist
        settings = crud.create_default_settings(
            makerspace_id=str(makerspace_id),
            makerspace_name=getattr(current_user, 'makerspace_name', 'My Makerspace'),
            created_by=str(current_user.id)
        )
    
    return settings

@router.post("/update", response_model=MakerspaceSettingsResponse)
async def update_makerspace_settings(
    settings_data: MakerspaceSettingsUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update makerspace settings.
    Only accessible by makerspace admins and super admins.
    """
    crud = get_makerspace_settings_crud(db)
    
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    
    if not makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No makerspace associated with current user"
        )
    
    settings = crud.update(
        makerspace_id=str(makerspace_id),
        settings_data=settings_data,
        updated_by=str(current_user.id)
    )
    
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Makerspace settings not found"
        )
    
    return settings

@router.post("/section/{section}", response_model=MakerspaceSettingsResponse)
async def update_settings_section(
    section: str,
    section_data: Dict[str, Any],
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update a specific section of settings.
    Sections: general, access, inventory, billing, service, appearance
    """
    crud = get_makerspace_settings_crud(db)
    
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    
    if not makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No makerspace associated with current user"
        )
    
    valid_sections = ["general", "access", "inventory", "billing", "service", "appearance"]
    if section not in valid_sections:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid section. Must be one of: {', '.join(valid_sections)}"
        )
    
    try:
        settings = crud.update_section(
            makerspace_id=str(makerspace_id),
            section=section,
            section_data=section_data,
            updated_by=str(current_user.id)
        )
        
        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Makerspace settings not found"
            )
        
        return settings
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.patch("/toggle-feature/{feature}", response_model=MakerspaceSettingsResponse)
async def toggle_feature(
    feature: str,
    toggle_data: FeatureToggleRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Toggle a specific feature on/off.
    Available features: membership_required, public_registration, skill_gated_access,
    enable_reservations, auto_approve_members, filament_deduction, stock_alerts,
    personal_consumables, store_sync, credit_system, job_estimates, membership_billing,
    service_mode, store_jobs, auto_assignment, chat_widget, help_widget,
    email_notifications, sms_notifications, push_notifications, safety_training,
    access_logging, visitor_registration, iot_monitoring, rfid_access, camera_monitoring
    """
    crud = get_makerspace_settings_crud(db)
    
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    
    if not makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No makerspace associated with current user"
        )
    
    try:
        settings = crud.toggle_feature(
            makerspace_id=str(makerspace_id),
            feature=feature,
            enabled=toggle_data.enabled,
            updated_by=str(current_user.id)
        )
        
        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Makerspace settings not found"
            )
        
        return settings
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/public/{makerspace_id}", response_model=MakerspaceSettingsPublic)
async def get_public_settings(
    makerspace_id: str,
    db: Session = Depends(get_db)
):
    """
    Get public-facing settings for a makerspace.
    This endpoint is publicly accessible and returns only non-sensitive information.
    """
    crud = get_makerspace_settings_crud(db)
    
    public_settings = crud.get_public_settings(makerspace_id)
    
    if not public_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Makerspace not found or settings not configured"
        )
    
    return public_settings

@router.get("/export", response_model=SettingsExportResponse)
async def export_settings(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Export current makerspace settings as JSON.
    Useful for backup and migration purposes.
    """
    crud = get_makerspace_settings_crud(db)
    
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    
    if not makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No makerspace associated with current user"
        )
    
    settings_data = crud.export_settings(str(makerspace_id))
    
    if not settings_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Makerspace settings not found"
        )
    
    return SettingsExportResponse(
        settings=settings_data,
        exported_at=datetime.now(),
        makerspace_id=str(makerspace_id),
        makerspace_name=settings_data.get('makerspace_name')
    )

@router.post("/import", response_model=MakerspaceSettingsResponse)
async def import_settings(
    import_data: SettingsImportRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Import makerspace settings from JSON.
    Useful for restoring from backup or migrating settings.
    """
    crud = get_makerspace_settings_crud(db)
    
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    
    if not makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No makerspace associated with current user"
        )
    
    try:
        settings = crud.import_settings(
            makerspace_id=str(makerspace_id),
            settings_data=import_data.settings,
            updated_by=str(current_user.id),
            overwrite=import_data.overwrite_existing
        )
        
        return settings
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# Specific section update endpoints for better organization
@router.post("/general", response_model=MakerspaceSettingsResponse)
async def update_general_information(
    general_data: GeneralInformationUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update general information section"""
    return await update_settings_section("general", general_data.dict(exclude_unset=True), current_user, db)

@router.post("/access", response_model=MakerspaceSettingsResponse)
async def update_access_control(
    access_data: AccessControlUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update access control section"""
    return await update_settings_section("access", access_data.dict(exclude_unset=True), current_user, db)

@router.post("/inventory", response_model=MakerspaceSettingsResponse)
async def update_inventory_settings(
    inventory_data: InventorySettingsUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update inventory settings section"""
    return await update_settings_section("inventory", inventory_data.dict(exclude_unset=True), current_user, db)

@router.post("/billing", response_model=MakerspaceSettingsResponse)
async def update_billing_config(
    billing_data: BillingConfigUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update billing configuration section"""
    return await update_settings_section("billing", billing_data.dict(exclude_unset=True), current_user, db)

@router.post("/service", response_model=MakerspaceSettingsResponse)
async def update_service_mode(
    service_data: ServiceModeUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update service mode section"""
    return await update_settings_section("service", service_data.dict(exclude_unset=True), current_user, db)

@router.post("/appearance", response_model=MakerspaceSettingsResponse)
async def update_appearance(
    appearance_data: AppearanceUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update appearance section"""
    return await update_settings_section("appearance", appearance_data.dict(exclude_unset=True), current_user, db)

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_settings(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete makerspace settings.
    This will reset settings to defaults.
    Only accessible by super admins.
    """
    # Additional permission check for deletion
    if not hasattr(current_user, 'role') or current_user.role != 'super_admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can delete settings"
        )
    
    crud = get_makerspace_settings_crud(db)
    
    makerspace_id = getattr(current_user, 'makerspace_id', None)
    
    if not makerspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No makerspace associated with current user"
        )
    
    deleted = crud.delete(str(makerspace_id))
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Makerspace settings not found"
        )
    
    return None
