"""
Backend Feature Flag System
Implements API guards and decorators per specification:
- return 404 (pretend it doesn't exist) for public
- 403 for authenticated-but-not-allowed
- never partial succeed
- fail safe defaults
"""

import json
import logging
from typing import Optional, Dict, Any, List, Callable
from functools import wraps
from fastapi import HTTPException, status, Depends, Request
from fastapi.responses import JSONResponse
import hashlib
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# ==========================================
# Flag Context and Evaluation
# ==========================================

class FlagContext:
    """Backend flag context"""
    def __init__(
        self,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        roles: Optional[List[str]] = None,
        makerspace_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        country: Optional[str] = None,
        pincode: Optional[str] = None,
        environment: str = "production",
        user_agent: Optional[str] = None,
        completed_jobs: Optional[int] = None,
        ip_address: Optional[str] = None
    ):
        self.user_id = user_id
        self.session_id = session_id
        self.roles = roles or []
        self.makerspace_id = makerspace_id
        self.organization_id = organization_id
        self.country = country
        self.pincode = pincode
        self.environment = environment
        self.user_agent = user_agent
        self.completed_jobs = completed_jobs
        self.ip_address = ip_address

class FlagDefinition:
    """Backend flag definition (simplified)"""
    def __init__(
        self,
        key: str,
        flag_type: str,
        scope: str,
        default_value: Any,
        rollout_state: str,
        enabled_for_roles: Optional[List[str]] = None,
        enabled_for_users: Optional[List[str]] = None,
        enabled_for_spaces: Optional[List[str]] = None,
        enabled_for_countries: Optional[List[str]] = None,
        enabled_for_pincodes: Optional[List[str]] = None,
        percentage_rollout: Optional[int] = None,
        config_value: Any = None
    ):
        self.key = key
        self.flag_type = flag_type
        self.scope = scope
        self.default_value = default_value
        self.rollout_state = rollout_state
        self.enabled_for_roles = enabled_for_roles or []
        self.enabled_for_users = enabled_for_users or []
        self.enabled_for_spaces = enabled_for_spaces or []
        self.enabled_for_countries = enabled_for_countries or []
        self.enabled_for_pincodes = enabled_for_pincodes or []
        self.percentage_rollout = percentage_rollout
        self.config_value = config_value

class FeatureFlagEngine:
    """Backend feature flag engine"""
    
    def __init__(self):
        self.flags: Dict[str, FlagDefinition] = {}
        self._load_default_flags()
    
    def _load_default_flags(self):
        """Load default flags from configuration"""
        # Key flags for API protection
        default_flags = [
            # Store flags
            FlagDefinition(
                key="store.upload.enabled",
                flag_type="boolean",
                scope="global",
                default_value=True,
                rollout_state="on"
            ),
            FlagDefinition(
                key="store.payments.enabled",
                flag_type="boolean",
                scope="global",
                default_value=True,
                rollout_state="on"
            ),
            FlagDefinition(
                key="store.catalog.enabled",
                flag_type="boolean",
                scope="global",
                default_value=True,
                rollout_state="on"
            ),
            FlagDefinition(
                key="store.cart.enabled",
                flag_type="boolean",
                scope="global",
                default_value=True,
                rollout_state="on"
            ),
            FlagDefinition(
                key="store.service_orders.enabled",
                flag_type="boolean",
                scope="global",
                default_value=True,
                rollout_state="on"
            ),
            FlagDefinition(
                key="store.admin.products",
                flag_type="boolean",
                scope="role",
                default_value=True,
                rollout_state="on",
                enabled_for_roles=["store_admin", "superadmin"]
            ),
            FlagDefinition(
                key="store.admin.orders",
                flag_type="boolean",
                scope="role",
                default_value=True,
                rollout_state="on",
                enabled_for_roles=["store_admin", "superadmin"]
            ),
            FlagDefinition(
                key="store.checkout.cod",
                flag_type="boolean",
                scope="audience",
                default_value=False,
                rollout_state="off",
                enabled_for_countries=["IN"],
                enabled_for_pincodes=[]  # Add specific pincodes
            ),
            
            # Cave flags
            FlagDefinition(
                key="cave.equipment.enabled",
                flag_type="boolean",
                scope="space",
                default_value=True,
                rollout_state="on"
            ),
            FlagDefinition(
                key="cave.reservations.enabled",
                flag_type="boolean",
                scope="space",
                default_value=True,
                rollout_state="on"
            ),
            FlagDefinition(
                key="cave.inventory.enabled",
                flag_type="boolean",
                scope="space",
                default_value=True,
                rollout_state="on"
            ),
            FlagDefinition(
                key="cave.projects.enabled",
                flag_type="boolean",
                scope="space",
                default_value=True,
                rollout_state="on"
            ),
            FlagDefinition(
                key="cave.jobs.publish_enabled",
                flag_type="boolean",
                scope="global",
                default_value=True,
                rollout_state="on"
            ),
            
            # Org flags
            FlagDefinition(
                key="org.profile.edit",
                flag_type="boolean",
                scope="role",
                default_value=True,
                rollout_state="on",
                enabled_for_roles=["user", "provider", "makerspace_admin", "store_admin", "superadmin"]
            ),
            FlagDefinition(
                key="org.docs.public",
                flag_type="boolean",
                scope="global",
                default_value=True,
                rollout_state="on"
            ),
            FlagDefinition(
                key="org.status.enabled",
                flag_type="boolean",
                scope="global",
                default_value=False,
                rollout_state="off"
            ),
            
            # Global flags
            FlagDefinition(
                key="global.auth.invite_only",
                flag_type="boolean",
                scope="global",
                default_value=False,
                rollout_state="off"
            )
        ]
        
        for flag in default_flags:
            self.flags[flag.key] = flag
    
    def evaluate(self, flag_key: str, context: FlagContext, default_value: Any = None) -> Dict[str, Any]:
        """Evaluate a feature flag"""
        flag = self.flags.get(flag_key)
        
        if not flag:
            return {
                "enabled": False,
                "value": default_value or False,
                "reason": "flag_not_found"
            }
        
        # Check rollout state
        if flag.rollout_state == "off":
            return {
                "enabled": False,
                "value": flag.default_value,
                "reason": "rollout_off"
            }
        
        # Internal rollout - only for admins
        if flag.rollout_state == "internal":
            is_internal = any(role in ["superadmin", "store_admin", "makerspace_admin"] 
                            for role in context.roles)
            if not is_internal:
                return {
                    "enabled": False,
                    "value": flag.default_value,
                    "reason": "internal_only"
                }
        
        # Evaluate targeting
        if not self._evaluate_targeting(flag, context):
            return {
                "enabled": False,
                "value": flag.default_value,
                "reason": "targeting_failed"
            }
        
        # Evaluate flag type
        if flag.flag_type == "boolean":
            return {
                "enabled": True,
                "value": True,
                "reason": "enabled"
            }
        elif flag.flag_type == "percentage":
            enabled = self._evaluate_percentage(flag, context)
            return {
                "enabled": enabled,
                "value": enabled,
                "reason": "percentage_rollout"
            }
        elif flag.flag_type == "config":
            return {
                "enabled": True,
                "value": flag.config_value or flag.default_value,
                "reason": "config_value"
            }
        
        return {
            "enabled": False,
            "value": flag.default_value,
            "reason": "unknown_type"
        }
    
    def _evaluate_targeting(self, flag: FlagDefinition, context: FlagContext) -> bool:
        """Evaluate targeting rules"""
        if flag.scope == "global":
            return True
        
        if flag.scope == "role" and flag.enabled_for_roles:
            return any(role in flag.enabled_for_roles for role in context.roles)
        
        if flag.scope == "user" and flag.enabled_for_users:
            return context.user_id in flag.enabled_for_users
        
        if flag.scope == "space" and flag.enabled_for_spaces:
            if not context.makerspace_id:
                return False
            return context.makerspace_id in flag.enabled_for_spaces
        
        if flag.scope == "audience":
            # Country targeting
            if flag.enabled_for_countries and context.country:
                if context.country not in flag.enabled_for_countries:
                    return False
            
            # Pincode targeting
            if flag.enabled_for_pincodes and context.pincode:
                if context.pincode not in flag.enabled_for_pincodes:
                    return False
            
            return True
        
        return False
    
    def _evaluate_percentage(self, flag: FlagDefinition, context: FlagContext) -> bool:
        """Evaluate percentage rollout"""
        if not flag.percentage_rollout:
            return False
        
        identifier = context.user_id or context.session_id or "anonymous"
        hash_val = int(hashlib.md5(f"{flag.key}:{identifier}".encode()).hexdigest(), 16)
        percentage = hash_val % 100
        
        return percentage < flag.percentage_rollout

# Global flag engine instance
flag_engine = FeatureFlagEngine()

# ==========================================
# Context Builders
# ==========================================

def build_flag_context(request: Request, user_info: Optional[Dict[str, Any]] = None) -> FlagContext:
    """Build flag context from request and user info"""
    return FlagContext(
        user_id=user_info.get("user_id") if user_info else None,
        session_id=request.headers.get("X-Session-ID"),
        roles=user_info.get("roles", []) if user_info else [],
        makerspace_id=user_info.get("makerspace_id") if user_info else None,
        country=request.headers.get("X-Country"),
        pincode=request.headers.get("X-Pincode"),
        environment=getattr(settings, "ENVIRONMENT", "production"),
        user_agent=request.headers.get("User-Agent"),
        ip_address=request.client.host if request.client else None
    )

async def get_flag_context(request: Request) -> FlagContext:
    """Dependency to get flag context"""
    return build_flag_context(request)

# ==========================================
# Decorators and Guards
# ==========================================

def require_flag(flag_key: str, default_value: Any = False, for_authenticated: bool = False):
    """
    Decorator to require a feature flag for endpoint access
    
    Args:
        flag_key: The feature flag to check
        default_value: Default value if flag not found
        for_authenticated: If True, return 403 for auth users, 404 for public
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract request and user context from kwargs
            request = None
            user_info = None
            
            # Find request object in kwargs
            for arg in args:
                if hasattr(arg, 'url') and hasattr(arg, 'method'):
                    request = arg
                    break
            
            if not request:
                for key, value in kwargs.items():
                    if hasattr(value, 'url') and hasattr(value, 'method'):
                        request = value
                        break
            
            if not request:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Request object not found"
                )
            
            # Try to get user info from token/session
            auth_header = request.headers.get("Authorization")
            if auth_header:
                # In a real implementation, you'd decode the JWT token here
                # For now, we'll simulate based on auth presence
                user_info = {"user_id": "user_123", "roles": ["user"]}
            
            # Build flag context
            context = build_flag_context(request, user_info)
            
            # Evaluate flag
            result = flag_engine.evaluate(flag_key, context, default_value)
            
            if not result["enabled"] or not result["value"]:
                # Determine response based on authentication and flag type
                if user_info and for_authenticated:
                    # Authenticated user but not allowed
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Feature not available for your account"
                    )
                else:
                    # Public user or kill switch - pretend endpoint doesn't exist
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Not found"
                    )
            
            # Flag is enabled, proceed with the function
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator

def check_flag(flag_key: str, context: FlagContext, default_value: Any = False) -> bool:
    """Simple flag check function"""
    result = flag_engine.evaluate(flag_key, context, default_value)
    return result["enabled"] and bool(result["value"])

def get_flag_value(flag_key: str, context: FlagContext, default_value: Any = None) -> Any:
    """Get flag value (for config flags)"""
    result = flag_engine.evaluate(flag_key, context, default_value)
    return result["value"] if result["enabled"] else default_value

# ==========================================
# Kill Switch Helpers
# ==========================================

class KillSwitch:
    """Kill switch pattern for critical operations"""
    
    @staticmethod
    def check_upload_enabled(context: FlagContext) -> bool:
        """Check if uploads are enabled"""
        return check_flag("store.upload.enabled", context, True)
    
    @staticmethod
    def check_payments_enabled(context: FlagContext) -> bool:
        """Check if payments are enabled"""
        return check_flag("store.payments.enabled", context, True)
    
    @staticmethod
    def check_publish_enabled(context: FlagContext) -> bool:
        """Check if job publishing is enabled"""
        return check_flag("cave.jobs.publish_enabled", context, True)

# ==========================================
# Response Helpers
# ==========================================

def feature_disabled_response(feature_name: str, maintenance: bool = False) -> JSONResponse:
    """Standard response for disabled features"""
    if maintenance:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "error": "Service Temporarily Unavailable",
                "message": f"{feature_name} is temporarily disabled for maintenance",
                "retry_after": 3600  # 1 hour
            }
        )
    else:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Not Found"}
        )

def feature_not_available_response(feature_name: str) -> JSONResponse:
    """Response for features not available to authenticated users"""
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={
            "error": "Feature Not Available",
            "message": f"{feature_name} is not available for your account",
            "contact_support": True
        }
    )

# ==========================================
# Space-specific helpers
# ==========================================

def require_space_flag(flag_key: str, makerspace_id: str):
    """Decorator for space-specific feature flags"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Build context with makerspace ID
            request = None
            for arg in args:
                if hasattr(arg, 'url'):
                    request = arg
                    break
            
            if not request:
                raise HTTPException(status_code=500, detail="Request not found")
            
            context = build_flag_context(request)
            context.makerspace_id = makerspace_id
            
            if not check_flag(flag_key, context):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Not found"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# ==========================================
# Logging and Analytics
# ==========================================

def log_flag_evaluation(flag_key: str, result: Dict[str, Any], context: FlagContext):
    """Log flag evaluation for analytics"""
    log_data = {
        "flag_key": flag_key,
        "enabled": result["enabled"],
        "reason": result["reason"],
        "user_id": context.user_id,
        "session_id": context.session_id,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    logger.info(f"FEATURE_FLAG_EVALUATION: {json.dumps(log_data)}")

# ==========================================
# Configuration Helpers
# ==========================================

def get_config_flag(flag_key: str, context: FlagContext, default_value: Any) -> Any:
    """Get configuration flag value"""
    return get_flag_value(flag_key, context, default_value)

def get_percentage_flag(flag_key: str, context: FlagContext) -> bool:
    """Check percentage rollout flag"""
    return check_flag(flag_key, context, False)

# Example usage decorators for common patterns
def store_feature_required(flag_key: str):
    """Decorator for store features"""
    return require_flag(flag_key, default_value=False, for_authenticated=True)

def cave_feature_required(flag_key: str):
    """Decorator for cave features"""
    return require_flag(flag_key, default_value=False, for_authenticated=True)

def admin_feature_required(flag_key: str):
    """Decorator for admin features"""
    return require_flag(flag_key, default_value=False, for_authenticated=True)

# Export main components
__all__ = [
    "require_flag",
    "check_flag", 
    "get_flag_value",
    "build_flag_context",
    "get_flag_context",
    "KillSwitch",
    "feature_disabled_response",
    "feature_not_available_response",
    "require_space_flag",
    "store_feature_required",
    "cave_feature_required", 
    "admin_feature_required",
    "flag_engine"
]
