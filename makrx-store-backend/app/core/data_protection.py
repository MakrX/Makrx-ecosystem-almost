"""
Data Protection & Privacy Compliance
Implements DPDP Act (India) and GDPR concepts per specification:
- Data minimization and retention policies
- User rights (export, deletion, consent management)
- Consent recording and management
- Breach notification procedures
- Privacy by design principles
"""
import json
import logging
import secrets
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, asdict
import hashlib
import asyncio
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)

# ==========================================
# DPDP Act & Privacy Configuration
# ==========================================

class ConsentType(str, Enum):
    """Types of consent per DPDP Act"""
    REQUIRED = "required"        # Essential for service operation
    MARKETING = "marketing"      # Marketing communications
    ANALYTICS = "analytics"      # Usage analytics and improvement
    SHARING = "sharing"         # Data sharing with partners
    PROFILING = "profiling"     # Automated decision making

class ConsentMethod(str, Enum):
    """Method of consent collection"""
    EXPLICIT_FORM = "explicit_form"
    REGISTRATION = "registration"
    API_REQUEST = "api_request"
    OPT_IN_CHECKBOX = "opt_in_checkbox"
    VERBAL = "verbal"

class DataCategory(str, Enum):
    """Categories of personal data"""
    IDENTITY = "identity"        # Name, email, phone
    PROFILE = "profile"         # Preferences, settings
    FINANCIAL = "financial"     # Payment info, billing
    BEHAVIORAL = "behavioral"   # Usage patterns, analytics
    TECHNICAL = "technical"     # IP address, device info
    LOCATION = "location"       # Geographic data
    BIOMETRIC = "biometric"     # Fingerprints, photos (if any)

class ProcessingPurpose(str, Enum):
    """Lawful purposes for data processing"""
    SERVICE_PROVISION = "service_provision"
    CONTRACT_FULFILLMENT = "contract_fulfillment"
    LEGAL_OBLIGATION = "legal_obligation"
    LEGITIMATE_INTEREST = "legitimate_interest"
    CONSENT = "consent"
    VITAL_INTERESTS = "vital_interests"

@dataclass
class RetentionPolicy:
    """Data retention policy configuration"""
    category: DataCategory
    retention_period_days: int
    legal_basis: str
    auto_delete: bool = True
    archive_before_delete: bool = True

class DataProtectionConfig:
    """DPDP Act compliance configuration"""
    
    # Retention policies per specification
    RETENTION_POLICIES = {
        DataCategory.IDENTITY: RetentionPolicy(
            category=DataCategory.IDENTITY,
            retention_period_days=7 * 365,  # 7 years (financial compliance)
            legal_basis="contract_fulfillment",
            auto_delete=False  # Manual review required
        ),
        DataCategory.FINANCIAL: RetentionPolicy(
            category=DataCategory.FINANCIAL,
            retention_period_days=7 * 365,  # 7 years (financial compliance)
            legal_basis="legal_obligation"
        ),
        DataCategory.BEHAVIORAL: RetentionPolicy(
            category=DataCategory.BEHAVIORAL,
            retention_period_days=90,  # 90 days per specification
            legal_basis="legitimate_interest"
        ),
        DataCategory.TECHNICAL: RetentionPolicy(
            category=DataCategory.TECHNICAL,
            retention_period_days=90,  # Logs: 90 days (prod)
            legal_basis="legitimate_interest"
        ),
        DataCategory.PROFILE: RetentionPolicy(
            category=DataCategory.PROFILE,
            retention_period_days=2 * 365,  # 2 years inactive
            legal_basis="contract_fulfillment"
        )
    }
    
    # Data minimization rules
    DATA_MINIMIZATION_RULES = {
        "registration": [DataCategory.IDENTITY],
        "order_processing": [DataCategory.IDENTITY, DataCategory.FINANCIAL],
        "analytics": [DataCategory.BEHAVIORAL, DataCategory.TECHNICAL],
        "marketing": [DataCategory.IDENTITY, DataCategory.PROFILE]
    }
    
    # Breach notification timeframes (DPDP Act)
    BREACH_NOTIFICATION_AUTHORITY_HOURS = 72  # Notify MeitY
    BREACH_NOTIFICATION_USER_HOURS = 72       # Notify affected users
    
    # User rights response timeframes
    DATA_EXPORT_RESPONSE_DAYS = 30
    DATA_DELETION_RESPONSE_DAYS = 30
    CONSENT_WITHDRAWAL_RESPONSE_HOURS = 24

# ==========================================
# Consent Management System
# ==========================================

@dataclass
class ConsentRecord:
    """Individual consent record per DPDP Act requirements"""
    consent_id: str
    user_id: str
    consent_type: ConsentType
    method: ConsentMethod
    scope: List[str]
    granted: bool
    timestamp: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    expiry_date: Optional[str] = None
    withdrawn_at: Optional[str] = None
    withdrawal_reason: Optional[str] = None

class ConsentManager:
    """
    Consent management per DPDP Act requirements
    - Record consent with timestamp, method, and scope
    - Handle consent withdrawal
    - Maintain audit trail
    """
    
    def __init__(self):
        self.consent_storage = {}  # In production, use database
    
    async def record_consent(self, user_id: str, consent_type: ConsentType,
                           method: ConsentMethod, scope: List[str],
                           granted: bool = True, context: Dict[str, Any] = None) -> ConsentRecord:
        """
        Record user consent per DPDP Act requirements
        """
        try:
            consent_record = ConsentRecord(
                consent_id=secrets.token_urlsafe(32),
                user_id=user_id,
                consent_type=consent_type,
                method=method,
                scope=scope,
                granted=granted,
                timestamp=datetime.utcnow().isoformat(),
                ip_address=context.get("ip_address") if context else None,
                user_agent=context.get("user_agent") if context else None,
                expiry_date=self._calculate_expiry(consent_type)
            )
            
            # Store consent record
            storage_key = f"{user_id}:{consent_type.value}:{consent_record.consent_id}"
            self.consent_storage[storage_key] = consent_record
            
            # Log for audit
            logger.info(f"CONSENT_RECORDED: {json.dumps(asdict(consent_record))}")
            
            return consent_record
            
        except Exception as e:
            logger.error(f"Consent recording failed: {e}")
            raise Exception(f"Failed to record consent: {str(e)}")
    
    async def withdraw_consent(self, user_id: str, consent_type: ConsentType,
                             reason: str = "user_request") -> Dict[str, Any]:
        """
        Handle consent withdrawal per DPDP Act
        Must process within 24 hours per specification
        """
        try:
            # Find active consent records
            active_consents = await self.get_user_consents(user_id, consent_type, active_only=True)
            
            if not active_consents:
                return {"status": "no_active_consent", "message": "No active consent found"}
            
            withdrawal_timestamp = datetime.utcnow().isoformat()
            withdrawn_consents = []
            
            for consent in active_consents:
                # Mark as withdrawn
                consent.withdrawn_at = withdrawal_timestamp
                consent.withdrawal_reason = reason
                consent.granted = False
                
                # Update storage
                storage_key = f"{user_id}:{consent_type.value}:{consent.consent_id}"
                self.consent_storage[storage_key] = consent
                
                withdrawn_consents.append(consent.consent_id)
            
            # Log withdrawal
            withdrawal_record = {
                "event_type": "consent_withdrawal",
                "user_id": user_id,
                "consent_type": consent_type.value,
                "withdrawn_consents": withdrawn_consents,
                "reason": reason,
                "timestamp": withdrawal_timestamp
            }
            
            logger.info(f"CONSENT_WITHDRAWN: {json.dumps(withdrawal_record)}")
            
            # Trigger data processing changes based on withdrawn consent
            await self._process_consent_withdrawal(user_id, consent_type)
            
            return {
                "status": "consent_withdrawn",
                "withdrawn_consents": withdrawn_consents,
                "processed_at": withdrawal_timestamp
            }
            
        except Exception as e:
            logger.error(f"Consent withdrawal failed: {e}")
            raise Exception(f"Failed to withdraw consent: {str(e)}")
    
    async def get_user_consents(self, user_id: str, consent_type: Optional[ConsentType] = None,
                              active_only: bool = False) -> List[ConsentRecord]:
        """Get user's consent records"""
        consents = []
        
        for key, consent in self.consent_storage.items():
            if consent.user_id == user_id:
                if consent_type and consent.consent_type != consent_type:
                    continue
                if active_only and (not consent.granted or consent.withdrawn_at):
                    continue
                consents.append(consent)
        
        return consents
    
    def _calculate_expiry(self, consent_type: ConsentType) -> Optional[str]:
        """Calculate consent expiry based on type"""
        if consent_type == ConsentType.MARKETING:
            # Marketing consent expires after 2 years
            expiry = datetime.utcnow() + timedelta(days=2*365)
            return expiry.isoformat()
        
        # Other consents don't expire automatically
        return None
    
    async def _process_consent_withdrawal(self, user_id: str, consent_type: ConsentType):
        """Process changes when consent is withdrawn"""
        if consent_type == ConsentType.MARKETING:
            # Remove from marketing lists
            await self._remove_from_marketing(user_id)
        elif consent_type == ConsentType.ANALYTICS:
            # Stop analytics collection
            await self._disable_analytics(user_id)
        elif consent_type == ConsentType.SHARING:
            # Revoke data sharing permissions
            await self._revoke_data_sharing(user_id)
    
    async def _remove_from_marketing(self, user_id: str):
        """Remove user from marketing communications"""
        logger.info(f"Removing user {user_id} from marketing lists")
        # Implementation: update user preferences, unsubscribe from email lists
    
    async def _disable_analytics(self, user_id: str):
        """Disable analytics collection for user"""
        logger.info(f"Disabling analytics collection for user {user_id}")
        # Implementation: update user settings, exclude from analytics
    
    async def _revoke_data_sharing(self, user_id: str):
        """Revoke data sharing permissions"""
        logger.info(f"Revoking data sharing permissions for user {user_id}")
        # Implementation: remove from partner data feeds

# Global consent manager
consent_manager = ConsentManager()

# ==========================================
# Data Minimization & Retention Manager
# ==========================================

class DataRetentionManager:
    """
    Data retention and minimization per specification
    - Purge expired data automatically
    - Data minimization enforcement
    - Archive before deletion
    """
    
    def __init__(self):
        self.retention_policies = DataProtectionConfig.RETENTION_POLICIES
    
    async def enforce_retention_policies(self) -> Dict[str, Any]:
        """
        Enforce data retention policies
        Should be run as scheduled job (daily)
        """
        try:
            enforcement_results = {
                "executed_at": datetime.utcnow().isoformat(),
                "policies_checked": len(self.retention_policies),
                "actions_taken": []
            }
            
            for category, policy in self.retention_policies.items():
                result = await self._enforce_category_retention(category, policy)
                enforcement_results["actions_taken"].extend(result)
            
            logger.info(f"RETENTION_ENFORCEMENT: {json.dumps(enforcement_results)}")
            return enforcement_results
            
        except Exception as e:
            logger.error(f"Retention enforcement failed: {e}")
            raise Exception(f"Retention enforcement failed: {str(e)}")
    
    async def _enforce_category_retention(self, category: DataCategory, 
                                        policy: RetentionPolicy) -> List[Dict[str, Any]]:
        """Enforce retention policy for specific data category"""
        actions = []
        cutoff_date = datetime.utcnow() - timedelta(days=policy.retention_period_days)
        
        # Find expired data (implementation depends on your data structure)
        expired_data = await self._find_expired_data(category, cutoff_date)
        
        for data_item in expired_data:
            try:
                # Archive before deletion if required
                if policy.archive_before_delete:
                    await self._archive_data(data_item, category)
                
                # Delete or anonymize based on policy
                if policy.auto_delete:
                    await self._delete_data(data_item, category)
                    action_type = "deleted"
                else:
                    await self._anonymize_data(data_item, category)
                    action_type = "anonymized"
                
                actions.append({
                    "action": action_type,
                    "category": category.value,
                    "data_id": data_item.get("id"),
                    "retention_period": policy.retention_period_days,
                    "legal_basis": policy.legal_basis
                })
                
            except Exception as e:
                logger.error(f"Failed to process expired data {data_item}: {e}")
                actions.append({
                    "action": "failed",
                    "category": category.value,
                    "data_id": data_item.get("id"),
                    "error": str(e)
                })
        
        return actions
    
    async def _find_expired_data(self, category: DataCategory, 
                               cutoff_date: datetime) -> List[Dict[str, Any]]:
        """Find data that has exceeded retention period"""
        # Implementation depends on your database structure
        # This is a placeholder that would query your actual data stores
        return []
    
    async def _archive_data(self, data_item: Dict[str, Any], category: DataCategory):
        """Archive data before deletion"""
        archive_record = {
            "original_id": data_item.get("id"),
            "category": category.value,
            "archived_at": datetime.utcnow().isoformat(),
            "data": data_item
        }
        
        # Store in archive (cold storage, encrypted)
        logger.info(f"ARCHIVED_DATA: {json.dumps({k: v for k, v in archive_record.items() if k != 'data'})}")
    
    async def _delete_data(self, data_item: Dict[str, Any], category: DataCategory):
        """Delete data permanently"""
        logger.info(f"DELETED_DATA: category={category.value}, id={data_item.get('id')}")
    
    async def _anonymize_data(self, data_item: Dict[str, Any], category: DataCategory):
        """Anonymize data instead of deletion"""
        logger.info(f"ANONYMIZED_DATA: category={category.value}, id={data_item.get('id')}")
    
    async def enforce_data_minimization(self, operation: str, requested_data: List[DataCategory]) -> bool:
        """
        Enforce data minimization principles
        Only collect data necessary for specified operation
        """
        allowed_categories = DataProtectionConfig.DATA_MINIMIZATION_RULES.get(operation, [])
        
        for category in requested_data:
            if category not in allowed_categories:
                logger.warning(f"Data minimization violation: {category} not allowed for {operation}")
                return False
        
        return True

# Global retention manager
retention_manager = DataRetentionManager()

# ==========================================
# User Rights Management (DPDP Act)
# ==========================================

class UserRightsManager:
    """
    User rights management per DPDP Act
    - Right to data export (data portability)
    - Right to erasure (right to be forgotten)
    - Right to rectification
    - Right to restriction of processing
    """
    
    async def handle_data_export_request(self, user_id: str, 
                                       requested_categories: Optional[List[DataCategory]] = None) -> Dict[str, Any]:
        """
        Handle user data export request per DPDP Act
        Must respond within 30 days per specification
        """
        try:
            export_id = secrets.token_urlsafe(16)
            export_timestamp = datetime.utcnow().isoformat()
            
            # Default to all categories if none specified
            if not requested_categories:
                requested_categories = list(DataCategory)
            
            # Collect user data from all systems
            exported_data = {
                "export_id": export_id,
                "user_id": user_id,
                "export_timestamp": export_timestamp,
                "requested_categories": [cat.value for cat in requested_categories],
                "data": {}
            }
            
            for category in requested_categories:
                category_data = await self._collect_category_data(user_id, category)
                exported_data["data"][category.value] = category_data
            
            # Include consent records
            user_consents = await consent_manager.get_user_consents(user_id)
            exported_data["consent_records"] = [asdict(consent) for consent in user_consents]
            
            # Log export request
            logger.info(f"DATA_EXPORT_REQUEST: user_id={user_id}, export_id={export_id}")
            
            return {
                "export_id": export_id,
                "status": "completed",
                "data": exported_data,
                "generated_at": export_timestamp
            }
            
        except Exception as e:
            logger.error(f"Data export failed for user {user_id}: {e}")
            raise Exception(f"Data export failed: {str(e)}")
    
    async def handle_data_deletion_request(self, user_id: str, reason: str = "user_request",
                                         categories: Optional[List[DataCategory]] = None) -> Dict[str, Any]:
        """
        Handle user data deletion request per DPDP Act (Right to Erasure)
        Must respond within 30 days per specification
        """
        try:
            deletion_id = secrets.token_urlsafe(16)
            deletion_timestamp = datetime.utcnow().isoformat()
            
            # Default to all categories except legally required
            if not categories:
                categories = [cat for cat in DataCategory 
                            if cat not in [DataCategory.FINANCIAL]]  # Keep financial for compliance
            
            deletion_results = []
            
            for category in categories:
                try:
                    # Check if deletion is allowed
                    policy = DataProtectionConfig.RETENTION_POLICIES.get(category)
                    if policy and policy.legal_basis == "legal_obligation":
                        deletion_results.append({
                            "category": category.value,
                            "status": "retained",
                            "reason": "legal_obligation"
                        })
                        continue
                    
                    # Perform deletion
                    await self._delete_category_data(user_id, category)
                    deletion_results.append({
                        "category": category.value,
                        "status": "deleted"
                    })
                    
                except Exception as e:
                    deletion_results.append({
                        "category": category.value,
                        "status": "failed",
                        "error": str(e)
                    })
            
            # Withdraw all consents
            for consent_type in ConsentType:
                try:
                    await consent_manager.withdraw_consent(user_id, consent_type, "account_deletion")
                except Exception as e:
                    logger.warning(f"Failed to withdraw consent {consent_type}: {e}")
            
            # Log deletion request
            deletion_record = {
                "deletion_id": deletion_id,
                "user_id": user_id,
                "reason": reason,
                "categories": [cat.value for cat in categories],
                "results": deletion_results,
                "timestamp": deletion_timestamp
            }
            
            logger.info(f"DATA_DELETION_REQUEST: {json.dumps(deletion_record)}")
            
            return {
                "deletion_id": deletion_id,
                "status": "completed",
                "results": deletion_results,
                "processed_at": deletion_timestamp
            }
            
        except Exception as e:
            logger.error(f"Data deletion failed for user {user_id}: {e}")
            raise Exception(f"Data deletion failed: {str(e)}")
    
    async def _collect_category_data(self, user_id: str, category: DataCategory) -> Dict[str, Any]:
        """Collect all user data for specific category"""
        # Implementation depends on your data architecture
        # This would query relevant databases/services for user data
        
        data_sources = {
            DataCategory.IDENTITY: ["users", "profiles"],
            DataCategory.FINANCIAL: ["orders", "payments", "invoices"],
            DataCategory.BEHAVIORAL: ["analytics", "usage_logs"],
            DataCategory.TECHNICAL: ["sessions", "audit_logs"],
            DataCategory.PROFILE: ["preferences", "settings"]
        }
        
        category_data = {}
        sources = data_sources.get(category, [])
        
        for source in sources:
            try:
                # Query data source
                source_data = await self._query_data_source(source, user_id)
                category_data[source] = source_data
            except Exception as e:
                logger.error(f"Failed to collect data from {source}: {e}")
                category_data[source] = {"error": str(e)}
        
        return category_data
    
    async def _query_data_source(self, source: str, user_id: str) -> List[Dict[str, Any]]:
        """Query specific data source for user data"""
        # Placeholder - implement actual data source queries
        return []
    
    async def _delete_category_data(self, user_id: str, category: DataCategory):
        """Delete all user data for specific category"""
        logger.info(f"Deleting {category.value} data for user {user_id}")
        # Implementation: delete from relevant databases/services

# Global user rights manager
user_rights_manager = UserRightsManager()

# ==========================================
# Data Breach Management
# ==========================================

class DataBreachManager:
    """
    Data breach management per DPDP Act
    - 72-hour notification to MeitY and affected users
    - Breach assessment and containment
    - Impact assessment
    """
    
    async def report_data_breach(self, breach_details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Report data breach per DPDP Act requirements
        Must notify within 72 hours
        """
        try:
            breach_id = secrets.token_urlsafe(16)
            breach_timestamp = datetime.utcnow().isoformat()
            
            breach_record = {
                "breach_id": breach_id,
                "reported_at": breach_timestamp,
                "details": breach_details,
                "affected_users": [],
                "notification_status": {
                    "authority_notified": False,
                    "users_notified": False
                },
                "containment_actions": [],
                "impact_assessment": {}
            }
            
            # Assess breach impact
            impact = await self._assess_breach_impact(breach_details)
            breach_record["impact_assessment"] = impact
            
            # Determine affected users
            affected_users = await self._identify_affected_users(breach_details)
            breach_record["affected_users"] = affected_users
            
            # Immediate containment
            containment_actions = await self._contain_breach(breach_details)
            breach_record["containment_actions"] = containment_actions
            
            # Schedule notifications (must be within 72 hours)
            await self._schedule_breach_notifications(breach_record)
            
            # Log breach
            logger.critical(f"DATA_BREACH_REPORTED: {json.dumps({k: v for k, v in breach_record.items() if k != 'details'})}")
            
            return breach_record
            
        except Exception as e:
            logger.error(f"Breach reporting failed: {e}")
            raise Exception(f"Breach reporting failed: {str(e)}")
    
    async def _assess_breach_impact(self, breach_details: Dict[str, Any]) -> Dict[str, Any]:
        """Assess the impact of data breach"""
        return {
            "severity": "high",  # Determine based on data types and scope
            "data_categories_affected": [],
            "estimated_affected_count": 0,
            "risk_to_users": "high"
        }
    
    async def _identify_affected_users(self, breach_details: Dict[str, Any]) -> List[str]:
        """Identify users affected by breach"""
        # Implementation: query affected data to identify users
        return []
    
    async def _contain_breach(self, breach_details: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Immediate breach containment actions"""
        containment_actions = [
            {"action": "disable_affected_systems", "timestamp": datetime.utcnow().isoformat()},
            {"action": "revoke_compromised_credentials", "timestamp": datetime.utcnow().isoformat()},
            {"action": "enable_additional_monitoring", "timestamp": datetime.utcnow().isoformat()}
        ]
        
        for action in containment_actions:
            logger.info(f"BREACH_CONTAINMENT: {json.dumps(action)}")
        
        return containment_actions
    
    async def _schedule_breach_notifications(self, breach_record: Dict[str, Any]):
        """Schedule breach notifications per DPDP Act timeframes"""
        # In production, schedule actual notifications
        logger.info(f"Scheduling breach notifications for breach {breach_record['breach_id']}")

# Global breach manager
breach_manager = DataBreachManager()

# ==========================================
# Privacy Impact Assessment
# ==========================================

class PrivacyImpactAssessment:
    """
    Privacy Impact Assessment (PIA) for new features/processing
    Required for high-risk processing under DPDP Act
    """
    
    @staticmethod
    async def conduct_pia(feature_description: str, data_processing: Dict[str, Any]) -> Dict[str, Any]:
        """Conduct privacy impact assessment for new feature"""
        
        pia_record = {
            "pia_id": secrets.token_urlsafe(16),
            "feature_description": feature_description,
            "conducted_at": datetime.utcnow().isoformat(),
            "data_processing": data_processing,
            "risk_assessment": {},
            "mitigation_measures": [],
            "approval_required": False
        }
        
        # Assess privacy risks
        risk_score = 0
        
        # Check for high-risk indicators
        if "automated_decision_making" in data_processing:
            risk_score += 3
        if "sensitive_data" in data_processing:
            risk_score += 2
        if "large_scale_processing" in data_processing:
            risk_score += 2
        if "data_sharing" in data_processing:
            risk_score += 1
        
        pia_record["risk_assessment"] = {
            "risk_score": risk_score,
            "risk_level": "high" if risk_score >= 4 else "medium" if risk_score >= 2 else "low"
        }
        
        # Require approval for high-risk processing
        if risk_score >= 4:
            pia_record["approval_required"] = True
        
        logger.info(f"PIA_CONDUCTED: {json.dumps({k: v for k, v in pia_record.items() if k != 'data_processing'})}")
        
        return pia_record

# Global PIA service
pia_service = PrivacyImpactAssessment()
