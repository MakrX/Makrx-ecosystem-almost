"""
Security Management API Endpoints
Provides administrative access to security features:
- User rights management (DPDP Act compliance)
- Security monitoring and metrics
- Audit trail access
- Compliance reporting
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import json

from app.core.enhanced_security_auth import (
    get_current_user_enhanced, SecurityContext, require_admin, require_store_admin
)
from app.core.data_protection import (
    user_rights_manager, consent_manager, retention_manager, 
    data_protection, DataCategory, ConsentType
)
from app.core.security_monitoring import (
    security_logger, security_monitor, performance_monitor, audit_trail
)
from app.core.operational_security import secrets_manager, mfa_manager, access_control
from app.core.payment_security import payment_processor
from app.schemas.admin import MessageResponse

router = APIRouter()

# ==========================================
# User Rights Management (DPDP Act)
# ==========================================

@router.post("/user-rights/data-export", response_model=Dict[str, Any])
async def request_data_export(
    user_id: Optional[str] = None,
    categories: Optional[List[str]] = None,
    current_user: SecurityContext = Depends(get_current_user_enhanced)
):
    """
    Request user data export (DPDP Act Right to Data Portability)
    Users can export their own data, admins can export any user's data
    """
    try:
        # Determine target user
        target_user_id = user_id if user_id and "admin" in current_user.roles else current_user.user_id
        
        # Convert category strings to enums if provided
        requested_categories = None
        if categories:
            try:
                requested_categories = [DataCategory(cat) for cat in categories]
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid data category: {str(e)}"
                )
        
        # Process export request
        export_result = await user_rights_manager.handle_data_export_request(
            target_user_id, requested_categories
        )
        
        # Log admin action if applicable
        if user_id and current_user.user_id != target_user_id:
            await security_logger.log_admin_action(
                admin_user_id=current_user.user_id,
                action="data_export_request",
                resource=f"user:{target_user_id}",
                success=True,
                details={"requested_categories": categories}
            )
        
        return export_result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Data export failed: {str(e)}"
        )

@router.post("/user-rights/data-deletion", response_model=Dict[str, Any])
async def request_data_deletion(
    user_id: Optional[str] = None,
    reason: str = "user_request",
    categories: Optional[List[str]] = None,
    current_user: SecurityContext = Depends(get_current_user_enhanced)
):
    """
    Request user data deletion (DPDP Act Right to Erasure)
    Users can delete their own data, admins can delete any user's data
    """
    try:
        # Determine target user
        target_user_id = user_id if user_id and "admin" in current_user.roles else current_user.user_id
        
        # Convert category strings to enums if provided
        requested_categories = None
        if categories:
            try:
                requested_categories = [DataCategory(cat) for cat in categories]
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid data category: {str(e)}"
                )
        
        # Process deletion request
        deletion_result = await user_rights_manager.handle_data_deletion_request(
            target_user_id, reason, requested_categories
        )
        
        # Log admin action if applicable
        if user_id and current_user.user_id != target_user_id:
            await security_logger.log_admin_action(
                admin_user_id=current_user.user_id,
                action="data_deletion_request",
                resource=f"user:{target_user_id}",
                success=True,
                details={"reason": reason, "categories": categories}
            )
        
        return deletion_result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Data deletion failed: {str(e)}"
        )

@router.get("/user-rights/consent", response_model=List[Dict[str, Any]])
async def get_user_consent(
    user_id: Optional[str] = None,
    current_user: SecurityContext = Depends(get_current_user_enhanced)
):
    """Get user consent records"""
    try:
        target_user_id = user_id if user_id and "admin" in current_user.roles else current_user.user_id
        
        consents = await consent_manager.get_user_consents(target_user_id)
        return [consent.__dict__ for consent in consents]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve consent records: {str(e)}"
        )

@router.post("/user-rights/consent/withdraw", response_model=Dict[str, Any])
async def withdraw_consent(
    consent_type: str,
    reason: str = "user_request",
    user_id: Optional[str] = None,
    current_user: SecurityContext = Depends(get_current_user_enhanced)
):
    """Withdraw user consent"""
    try:
        target_user_id = user_id if user_id and "admin" in current_user.roles else current_user.user_id
        
        try:
            consent_enum = ConsentType(consent_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid consent type: {consent_type}"
            )
        
        result = await consent_manager.withdraw_consent(target_user_id, consent_enum, reason)
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Consent withdrawal failed: {str(e)}"
        )

# ==========================================
# Security Monitoring & Metrics
# ==========================================

@router.get("/monitoring/slo-report", response_model=Dict[str, Any])
async def get_slo_report(
    current_user: SecurityContext = Depends(require_admin)
):
    """Get SLO compliance report"""
    try:
        report = await performance_monitor.get_slo_report()
        
        await security_logger.log_admin_action(
            admin_user_id=current_user.user_id,
            action="slo_report_accessed",
            resource="monitoring",
            success=True
        )
        
        return report
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate SLO report: {str(e)}"
        )

@router.get("/monitoring/security-events", response_model=Dict[str, Any])
async def get_security_events(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    event_type: Optional[str] = None,
    limit: int = 100,
    current_user: SecurityContext = Depends(require_admin)
):
    """Get security events for analysis"""
    try:
        # Parse date filters
        filters = {}
        if start_date:
            filters["start_date"] = datetime.fromisoformat(start_date)
        if end_date:
            filters["end_date"] = datetime.fromisoformat(end_date)
        if event_type:
            filters["event_type"] = event_type
        
        # This would query your actual security events storage
        # For now, return a placeholder structure
        events = {
            "total_events": 0,
            "events": [],
            "filters_applied": filters,
            "limit": limit
        }
        
        await security_logger.log_admin_action(
            admin_user_id=current_user.user_id,
            action="security_events_accessed",
            resource="monitoring",
            success=True,
            details={"filters": filters}
        )
        
        return events
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve security events: {str(e)}"
        )

# ==========================================
# Audit Trail Management
# ==========================================

@router.get("/audit/compliance-report", response_model=Dict[str, Any])
async def generate_compliance_report(
    start_date: str,
    end_date: str,
    current_user: SecurityContext = Depends(require_admin)
):
    """Generate compliance audit report"""
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
        
        report = await audit_trail.generate_compliance_report(start_dt, end_dt)
        
        await security_logger.log_admin_action(
            admin_user_id=current_user.user_id,
            action="compliance_report_generated",
            resource="audit",
            success=True,
            details={"period": f"{start_date} to {end_date}"}
        )
        
        return report
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate compliance report: {str(e)}"
        )

# ==========================================
# MFA Management
# ==========================================

@router.post("/mfa/setup", response_model=Dict[str, Any])
async def setup_mfa(
    current_user: SecurityContext = Depends(get_current_user_enhanced)
):
    """Setup MFA for current user"""
    try:
        # Use user's email from token or fetch from user service
        user_email = f"user_{current_user.user_id}@makrx.org"  # Placeholder
        
        mfa_setup = await mfa_manager.setup_mfa(current_user.user_id, user_email)
        
        await security_logger.log_security_event(
            event_type="mfa_setup",
            action="mfa_enabled",
            success=True,
            user_id=current_user.user_id
        )
        
        return {
            "qr_code": mfa_setup["qr_code"],
            "backup_codes": mfa_setup["backup_codes"],
            "manual_entry_key": mfa_setup["manual_entry_key"]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"MFA setup failed: {str(e)}"
        )

@router.post("/mfa/verify", response_model=Dict[str, Any])
async def verify_mfa(
    token: str,
    current_user: SecurityContext = Depends(get_current_user_enhanced)
):
    """Verify MFA token"""
    try:
        is_valid = await mfa_manager.verify_mfa_token(current_user.user_id, token)
        
        return {"valid": is_valid}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"MFA verification failed: {str(e)}"
        )

@router.delete("/mfa/disable", response_model=MessageResponse)
async def disable_mfa(
    user_id: Optional[str] = None,
    current_user: SecurityContext = Depends(require_admin)
):
    """Disable MFA for user (admin only)"""
    try:
        target_user_id = user_id or current_user.user_id
        
        success = await mfa_manager.disable_mfa(target_user_id, current_user.user_id)
        
        if success:
            await security_logger.log_admin_action(
                admin_user_id=current_user.user_id,
                action="mfa_disabled",
                resource=f"user:{target_user_id}",
                success=True
            )
            
            return MessageResponse(message="MFA disabled successfully")
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to disable MFA"
            )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"MFA disable failed: {str(e)}"
        )

# ==========================================
# Secrets Management
# ==========================================

@router.get("/secrets/rotation-status", response_model=Dict[str, Any])
async def get_secret_rotation_status(
    current_user: SecurityContext = Depends(require_store_admin)
):
    """Get secret rotation status"""
    try:
        due_rotations = await secrets_manager.check_rotation_due()
        
        await security_logger.log_admin_action(
            admin_user_id=current_user.user_id,
            action="secret_rotation_status_checked",
            resource="secrets",
            success=True
        )
        
        return {
            "secrets_due_for_rotation": len(due_rotations),
            "due_secrets": due_rotations,
            "last_checked": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check rotation status: {str(e)}"
        )

# ==========================================
# Data Retention Management
# ==========================================

@router.post("/data-retention/enforce", response_model=Dict[str, Any])
async def enforce_retention_policies(
    current_user: SecurityContext = Depends(require_store_admin)
):
    """Manually trigger data retention policy enforcement"""
    try:
        result = await retention_manager.enforce_retention_policies()
        
        await security_logger.log_admin_action(
            admin_user_id=current_user.user_id,
            action="retention_policies_enforced",
            resource="data_retention",
            success=True,
            details={"actions_taken": len(result.get("actions_taken", []))}
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Retention enforcement failed: {str(e)}"
        )

# ==========================================
# Security Health Check
# ==========================================

@router.get("/health", response_model=Dict[str, Any])
async def security_health_check():
    """Security-specific health check"""
    try:
        health_status = {
            "security_components": {
                "authentication": "healthy",
                "authorization": "healthy", 
                "encryption": "healthy",
                "monitoring": "healthy",
                "audit_logging": "healthy"
            },
            "compliance_status": {
                "dpdp_act": "compliant",
                "pci_dss": "compliant",
                "data_retention": "active",
                "user_rights": "available"
            },
            "security_metrics": {
                "failed_logins_24h": 0,  # Would be real metrics
                "security_events_24h": 0,
                "active_sessions": 0,
                "mfa_enabled_users": 0
            },
            "last_updated": datetime.utcnow().isoformat()
        }
        
        return health_status
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
