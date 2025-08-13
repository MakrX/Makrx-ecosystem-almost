from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, Dict, Any, List
from uuid import UUID
import json

from ..models.makerspace_settings import MakerspaceSettings, ThemeMode, PrintTechnology
from ..schemas.makerspace_settings import (
    MakerspaceSettingsCreate, 
    MakerspaceSettingsUpdate,
    GeneralInformationUpdate,
    AccessControlUpdate,
    InventorySettingsUpdate,
    BillingConfigUpdate,
    ServiceModeUpdate,
    AppearanceUpdate
)

class MakerspaceSettingsCRUD:
    def __init__(self, db: Session):
        self.db = db

    def get_by_makerspace_id(self, makerspace_id: str) -> Optional[MakerspaceSettings]:
        """Get settings for a specific makerspace"""
        return self.db.query(MakerspaceSettings).filter(
            MakerspaceSettings.makerspace_id == makerspace_id
        ).first()

    def get_by_id(self, settings_id: str) -> Optional[MakerspaceSettings]:
        """Get settings by ID"""
        return self.db.query(MakerspaceSettings).filter(
            MakerspaceSettings.id == settings_id
        ).first()

    def create(self, settings_data: MakerspaceSettingsCreate, created_by: str) -> MakerspaceSettings:
        """Create new makerspace settings"""
        settings_dict = settings_data.dict()
        
        # Handle operating_hours conversion
        if settings_dict.get('operating_hours'):
            settings_dict['operating_hours'] = self._convert_operating_hours_to_json(
                settings_dict['operating_hours']
            )
        
        # Handle allowed_print_technologies conversion
        if settings_dict.get('allowed_print_technologies'):
            settings_dict['allowed_print_technologies'] = [
                tech.value if hasattr(tech, 'value') else tech 
                for tech in settings_dict['allowed_print_technologies']
            ]
        
        # Handle custom_theme_colors conversion
        if settings_dict.get('custom_theme_colors'):
            settings_dict['custom_theme_colors'] = settings_dict['custom_theme_colors']
        
        settings_dict['updated_by'] = created_by
        
        db_settings = MakerspaceSettings(**settings_dict)
        self.db.add(db_settings)
        self.db.commit()
        self.db.refresh(db_settings)
        return db_settings

    def create_default_settings(self, makerspace_id: str, makerspace_name: str, created_by: str) -> MakerspaceSettings:
        """Create default settings for a new makerspace"""
        default_data = MakerspaceSettings.get_default_settings(makerspace_id, makerspace_name)
        default_data['updated_by'] = created_by
        
        db_settings = MakerspaceSettings(**default_data)
        self.db.add(db_settings)
        self.db.commit()
        self.db.refresh(db_settings)
        return db_settings

    def update(self, makerspace_id: str, settings_data: MakerspaceSettingsUpdate, updated_by: str) -> Optional[MakerspaceSettings]:
        """Update makerspace settings"""
        db_settings = self.get_by_makerspace_id(makerspace_id)
        if not db_settings:
            return None

        update_dict = settings_data.dict(exclude_unset=True)
        
        # Handle operating_hours conversion
        if 'operating_hours' in update_dict and update_dict['operating_hours']:
            update_dict['operating_hours'] = self._convert_operating_hours_to_json(
                update_dict['operating_hours']
            )
        
        # Handle allowed_print_technologies conversion
        if 'allowed_print_technologies' in update_dict and update_dict['allowed_print_technologies']:
            update_dict['allowed_print_technologies'] = [
                tech.value if hasattr(tech, 'value') else tech 
                for tech in update_dict['allowed_print_technologies']
            ]
        
        # Handle theme_mode conversion
        if 'theme_mode' in update_dict and update_dict['theme_mode']:
            if isinstance(update_dict['theme_mode'], str):
                update_dict['theme_mode'] = ThemeMode(update_dict['theme_mode'])
        
        update_dict['updated_by'] = updated_by
        
        for field, value in update_dict.items():
            setattr(db_settings, field, value)
        
        self.db.commit()
        self.db.refresh(db_settings)
        return db_settings

    def update_section(self, makerspace_id: str, section: str, section_data: Dict[str, Any], updated_by: str) -> Optional[MakerspaceSettings]:
        """Update a specific section of settings"""
        db_settings = self.get_by_makerspace_id(makerspace_id)
        if not db_settings:
            return None

        # Route to specific section update methods
        if section == "general":
            return self._update_general_information(db_settings, section_data, updated_by)
        elif section == "access":
            return self._update_access_control(db_settings, section_data, updated_by)
        elif section == "inventory":
            return self._update_inventory_settings(db_settings, section_data, updated_by)
        elif section == "billing":
            return self._update_billing_config(db_settings, section_data, updated_by)
        elif section == "service":
            return self._update_service_mode(db_settings, section_data, updated_by)
        elif section == "appearance":
            return self._update_appearance(db_settings, section_data, updated_by)
        else:
            raise ValueError(f"Unknown settings section: {section}")

    def toggle_feature(self, makerspace_id: str, feature: str, enabled: bool, updated_by: str) -> Optional[MakerspaceSettings]:
        """Toggle a specific feature on/off"""
        db_settings = self.get_by_makerspace_id(makerspace_id)
        if not db_settings:
            return None

        # Map feature names to model attributes
        feature_mapping = {
            "membership_required": "membership_required",
            "public_registration": "public_registration",
            "skill_gated_access": "skill_gated_access",
            "enable_reservations": "enable_reservations",
            "auto_approve_members": "auto_approve_members",
            "filament_deduction": "filament_deduction_enabled",
            "stock_alerts": "minimum_stock_alerts",
            "personal_consumables": "allow_personal_consumables",
            "store_sync": "store_inventory_sync",
            "credit_system": "credit_system_enabled",
            "job_estimates": "show_job_cost_estimates",
            "membership_billing": "enable_membership_billing",
            "service_mode": "service_mode_enabled",
            "store_jobs": "accept_jobs_from_store",
            "auto_assignment": "auto_job_assignment",
            "chat_widget": "enable_chat_widget",
            "help_widget": "enable_help_widget",
            "email_notifications": "email_notifications_enabled",
            "sms_notifications": "sms_notifications_enabled",
            "push_notifications": "push_notifications_enabled",
            "safety_training": "require_safety_training",
            "access_logging": "equipment_access_logging",
            "visitor_registration": "visitor_registration_required",
            "iot_monitoring": "enable_iot_monitoring",
            "rfid_access": "enable_rfid_access",
            "camera_monitoring": "enable_camera_monitoring"
        }

        if feature not in feature_mapping:
            raise ValueError(f"Unknown feature: {feature}")

        setattr(db_settings, feature_mapping[feature], enabled)
        db_settings.updated_by = updated_by
        
        self.db.commit()
        self.db.refresh(db_settings)
        return db_settings

    def delete(self, makerspace_id: str) -> bool:
        """Delete makerspace settings"""
        db_settings = self.get_by_makerspace_id(makerspace_id)
        if not db_settings:
            return False
        
        self.db.delete(db_settings)
        self.db.commit()
        return True

    def export_settings(self, makerspace_id: str) -> Optional[Dict[str, Any]]:
        """Export settings as JSON"""
        db_settings = self.get_by_makerspace_id(makerspace_id)
        if not db_settings:
            return None
        
        return db_settings.to_dict()

    def import_settings(self, makerspace_id: str, settings_data: Dict[str, Any], updated_by: str, overwrite: bool = False) -> Optional[MakerspaceSettings]:
        """Import settings from JSON"""
        db_settings = self.get_by_makerspace_id(makerspace_id)
        
        if db_settings and not overwrite:
            raise ValueError("Settings already exist. Use overwrite=True to replace them.")
        
        if not db_settings:
            # Create new settings
            settings_data['makerspace_id'] = makerspace_id
            settings_data['updated_by'] = updated_by
            db_settings = MakerspaceSettings(**settings_data)
            self.db.add(db_settings)
        else:
            # Update existing settings
            for field, value in settings_data.items():
                if hasattr(db_settings, field):
                    setattr(db_settings, field, value)
            db_settings.updated_by = updated_by
        
        self.db.commit()
        self.db.refresh(db_settings)
        return db_settings

    def get_public_settings(self, makerspace_id: str) -> Optional[Dict[str, Any]]:
        """Get public-facing settings (non-sensitive information only)"""
        db_settings = self.get_by_makerspace_id(makerspace_id)
        if not db_settings:
            return None

        public_fields = [
            'makerspace_name', 'logo_url', 'description', 'address', 
            'contact_email', 'contact_phone', 'timezone', 'operating_hours',
            'membership_required', 'public_registration', 'enable_reservations',
            'service_mode_enabled', 'accept_jobs_from_store', 'allowed_print_technologies',
            'delivery_radius_km', 'theme_mode', 'custom_theme_colors',
            'landing_page_cta', 'welcome_message'
        ]

        return {field: getattr(db_settings, field) for field in public_fields}

    # Private helper methods
    def _convert_operating_hours_to_json(self, operating_hours) -> Dict[str, Any]:
        """Convert operating hours to JSON format"""
        if hasattr(operating_hours, 'dict'):
            return operating_hours.dict()
        return operating_hours

    def _update_general_information(self, db_settings: MakerspaceSettings, data: Dict[str, Any], updated_by: str) -> MakerspaceSettings:
        """Update general information section"""
        general_fields = [
            'makerspace_name', 'logo_url', 'description', 'address',
            'contact_email', 'contact_phone', 'timezone', 'latitude',
            'longitude', 'operating_hours'
        ]
        
        for field in general_fields:
            if field in data:
                if field == 'operating_hours' and data[field]:
                    data[field] = self._convert_operating_hours_to_json(data[field])
                setattr(db_settings, field, data[field])
        
        db_settings.updated_by = updated_by
        self.db.commit()
        self.db.refresh(db_settings)
        return db_settings

    def _update_access_control(self, db_settings: MakerspaceSettings, data: Dict[str, Any], updated_by: str) -> MakerspaceSettings:
        """Update access control section"""
        access_fields = [
            'membership_required', 'public_registration', 'skill_gated_access',
            'enable_reservations', 'auto_approve_members'
        ]
        
        for field in access_fields:
            if field in data:
                setattr(db_settings, field, data[field])
        
        db_settings.updated_by = updated_by
        self.db.commit()
        self.db.refresh(db_settings)
        return db_settings

    def _update_inventory_settings(self, db_settings: MakerspaceSettings, data: Dict[str, Any], updated_by: str) -> MakerspaceSettings:
        """Update inventory settings section"""
        inventory_fields = [
            'filament_deduction_enabled', 'minimum_stock_alerts', 'stock_threshold_notification',
            'allow_personal_consumables', 'store_inventory_sync', 'default_stock_threshold'
        ]
        
        for field in inventory_fields:
            if field in data:
                setattr(db_settings, field, data[field])
        
        db_settings.updated_by = updated_by
        self.db.commit()
        self.db.refresh(db_settings)
        return db_settings

    def _update_billing_config(self, db_settings: MakerspaceSettings, data: Dict[str, Any], updated_by: str) -> MakerspaceSettings:
        """Update billing configuration section"""
        billing_fields = [
            'credit_system_enabled', 'show_job_cost_estimates', 'default_tax_percent',
            'default_currency', 'razorpay_key_override', 'stripe_key_override',
            'enable_membership_billing'
        ]
        
        for field in billing_fields:
            if field in data:
                setattr(db_settings, field, data[field])
        
        db_settings.updated_by = updated_by
        self.db.commit()
        self.db.refresh(db_settings)
        return db_settings

    def _update_service_mode(self, db_settings: MakerspaceSettings, data: Dict[str, Any], updated_by: str) -> MakerspaceSettings:
        """Update service mode section"""
        service_fields = [
            'service_mode_enabled', 'accept_jobs_from_store', 'allowed_print_technologies',
            'delivery_radius_km', 'default_service_fee_percent', 'auto_job_assignment'
        ]
        
        for field in service_fields:
            if field in data:
                if field == 'allowed_print_technologies' and data[field]:
                    data[field] = [
                        tech.value if hasattr(tech, 'value') else tech 
                        for tech in data[field]
                    ]
                setattr(db_settings, field, data[field])
        
        db_settings.updated_by = updated_by
        self.db.commit()
        self.db.refresh(db_settings)
        return db_settings

    def _update_appearance(self, db_settings: MakerspaceSettings, data: Dict[str, Any], updated_by: str) -> MakerspaceSettings:
        """Update appearance section"""
        appearance_fields = [
            'theme_mode', 'custom_theme_colors', 'landing_page_cta',
            'welcome_message', 'enable_chat_widget', 'enable_help_widget', 'custom_css'
        ]
        
        for field in appearance_fields:
            if field in data:
                if field == 'theme_mode' and isinstance(data[field], str):
                    data[field] = ThemeMode(data[field])
                setattr(db_settings, field, data[field])
        
        db_settings.updated_by = updated_by
        self.db.commit()
        self.db.refresh(db_settings)
        return db_settings

def get_makerspace_settings_crud(db: Session) -> MakerspaceSettingsCRUD:
    return MakerspaceSettingsCRUD(db)
