"""
Feature Flags API Routes
Comprehensive feature flag system for controlling store modules and features
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_, func
from typing import List, Optional, Dict, Any, Union
import logging
import json
from datetime import datetime, timedelta
from enum import Enum

from app.core.db import get_db
from app.core.security import get_current_user, require_admin
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/feature-flags", tags=["Feature Flags"])

# Enums
class FeatureFlagType(str, Enum):
    BOOLEAN = "boolean"
    STRING = "string"
    INTEGER = "integer"
    JSON = "json"
    PERCENTAGE = "percentage"

class FeatureFlagStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SCHEDULED = "scheduled"
    EXPIRED = "expired"

class TargetType(str, Enum):
    ALL_USERS = "all_users"
    USER_ID = "user_id"
    USER_ROLE = "user_role"
    MAKERSPACE_ID = "makerspace_id"
    REGION = "region"
    PERCENTAGE = "percentage"

# Pydantic Models
class FeatureFlagRule(BaseModel):
    target_type: TargetType
    target_value: str
    enabled: bool

class CreateFeatureFlagRequest(BaseModel):
    key: str = Field(..., min_length=1, max_length=100, regex="^[a-zA-Z0-9_-]+$")
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    flag_type: FeatureFlagType = FeatureFlagType.BOOLEAN
    default_value: Union[bool, str, int, dict] = False
    is_active: bool = True
    rules: List[FeatureFlagRule] = []
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    tags: List[str] = []

class UpdateFeatureFlagRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    default_value: Optional[Union[bool, str, int, dict]] = None
    is_active: Optional[bool] = None
    rules: Optional[List[FeatureFlagRule]] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    tags: Optional[List[str]] = None

class FeatureFlagResponse(BaseModel):
    key: str
    name: str
    description: Optional[str]
    flag_type: FeatureFlagType
    default_value: Union[bool, str, int, dict]
    is_active: bool
    status: FeatureFlagStatus
    rules: List[FeatureFlagRule]
    valid_from: Optional[datetime]
    valid_until: Optional[datetime]
    tags: List[str]
    created_at: datetime
    updated_at: Optional[datetime]
    usage_count: int

class FeatureFlagEvaluationRequest(BaseModel):
    user_id: Optional[str] = None
    user_role: Optional[str] = None
    makerspace_id: Optional[str] = None
    region: Optional[str] = None
    context: Dict[str, Any] = {}

class FeatureFlagEvaluationResponse(BaseModel):
    flags: Dict[str, Union[bool, str, int, dict]]
    metadata: Dict[str, Dict[str, Any]] = {}

# In-memory storage for feature flags (in production, use Redis/database)
feature_flags_store: Dict[str, Dict[str, Any]] = {
    # Core store features
    "stl_upload_service": {
        "key": "stl_upload_service",
        "name": "STL Upload Service",
        "description": "Enable 3D file upload and printing service",
        "flag_type": "boolean",
        "default_value": True,
        "is_active": True,
        "status": "active",
        "rules": [],
        "tags": ["core", "3d-printing"],
        "created_at": datetime.utcnow(),
        "usage_count": 0
    },
    "subscription_plans": {
        "key": "subscription_plans",
        "name": "Subscription Plans",
        "description": "Enable material subscription plans",
        "flag_type": "boolean",
        "default_value": True,
        "is_active": True,
        "status": "active",
        "rules": [],
        "tags": ["subscription", "recurring"],
        "created_at": datetime.utcnow(),
        "usage_count": 0
    },
    "bom_import": {
        "key": "bom_import",
        "name": "BOM Import",
        "description": "Enable BOM import from MakrCave",
        "flag_type": "boolean",
        "default_value": True,
        "is_active": True,
        "status": "active",
        "rules": [],
        "tags": ["integration", "makrcave"],
        "created_at": datetime.utcnow(),
        "usage_count": 0
    },
    "quick_reorder": {
        "key": "quick_reorder",
        "name": "Quick Reorder",
        "description": "Enable quick reorder functionality for makerspaces",
        "flag_type": "boolean",
        "default_value": True,
        "is_active": True,
        "status": "active",
        "rules": [],
        "tags": ["convenience", "makerspaces"],
        "created_at": datetime.utcnow(),
        "usage_count": 0
    },
    "reviews_system": {
        "key": "reviews_system",
        "name": "Reviews & Ratings",
        "description": "Enable product and service reviews",
        "flag_type": "boolean",
        "default_value": True,
        "is_active": True,
        "status": "active",
        "rules": [],
        "tags": ["social", "feedback"],
        "created_at": datetime.utcnow(),
        "usage_count": 0
    },
    "credit_wallet": {
        "key": "credit_wallet",
        "name": "Credit Wallet System",
        "description": "Enable prepaid credits for quick payments",
        "flag_type": "boolean",
        "default_value": True,
        "is_active": True,
        "status": "active",
        "rules": [],
        "tags": ["payments", "credits"],
        "created_at": datetime.utcnow(),
        "usage_count": 0
    },
    "advanced_search": {
        "key": "advanced_search",
        "name": "Advanced Search & Filtering",
        "description": "Enable advanced product search capabilities",
        "flag_type": "boolean",
        "default_value": True,
        "is_active": True,
        "status": "active",
        "rules": [],
        "tags": ["search", "ux"],
        "created_at": datetime.utcnow(),
        "usage_count": 0
    },
    # Regional/conditional features
    "beta_features": {
        "key": "beta_features",
        "name": "Beta Features",
        "description": "Enable access to beta functionality",
        "flag_type": "boolean",
        "default_value": False,
        "is_active": True,
        "status": "active",
        "rules": [
            {
                "target_type": "user_role",
                "target_value": "beta_tester",
                "enabled": True
            }
        ],
        "tags": ["beta", "testing"],
        "created_at": datetime.utcnow(),
        "usage_count": 0
    },
    "regional_shipping": {
        "key": "regional_shipping",
        "name": "Regional Shipping Options",
        "description": "Enable region-specific shipping methods",
        "flag_type": "json",
        "default_value": {"international": False, "express": True},
        "is_active": True,
        "status": "active",
        "rules": [
            {
                "target_type": "region",
                "target_value": "IN",
                "enabled": True
            }
        ],
        "tags": ["shipping", "regional"],
        "created_at": datetime.utcnow(),
        "usage_count": 0
    },
    "max_file_size": {
        "key": "max_file_size",
        "name": "Maximum Upload File Size",
        "description": "Maximum file size for STL uploads (MB)",
        "flag_type": "integer",
        "default_value": 100,
        "is_active": True,
        "status": "active",
        "rules": [
            {
                "target_type": "user_role",
                "target_value": "premium",
                "enabled": True
            }
        ],
        "tags": ["limits", "uploads"],
        "created_at": datetime.utcnow(),
        "usage_count": 0
    },
    "promotional_banner": {
        "key": "promotional_banner",
        "name": "Promotional Banner",
        "description": "Show promotional banner on homepage",
        "flag_type": "string",
        "default_value": "New Year Sale - 20% Off All Materials!",
        "is_active": True,
        "status": "active",
        "valid_until": datetime.utcnow() + timedelta(days=30),
        "rules": [],
        "tags": ["marketing", "promotions"],
        "created_at": datetime.utcnow(),
        "usage_count": 0
    }
}

@router.get("/", response_model=List[FeatureFlagResponse])
async def list_feature_flags(
    active_only: bool = False,
    tags: Optional[List[str]] = None,
    admin_user: str = Depends(require_admin)
):
    """
    List all feature flags (admin only)
    """
    try:
        flags = []
        
        for flag_data in feature_flags_store.values():
            # Filter by active status
            if active_only and not flag_data.get("is_active", False):
                continue
            
            # Filter by tags
            if tags:
                flag_tags = flag_data.get("tags", [])
                if not any(tag in flag_tags for tag in tags):
                    continue
            
            # Determine status
            status = determine_flag_status(flag_data)
            
            flags.append(FeatureFlagResponse(
                key=flag_data["key"],
                name=flag_data["name"],
                description=flag_data.get("description"),
                flag_type=flag_data["flag_type"],
                default_value=flag_data["default_value"],
                is_active=flag_data["is_active"],
                status=status,
                rules=flag_data.get("rules", []),
                valid_from=flag_data.get("valid_from"),
                valid_until=flag_data.get("valid_until"),
                tags=flag_data.get("tags", []),
                created_at=flag_data["created_at"],
                updated_at=flag_data.get("updated_at"),
                usage_count=flag_data.get("usage_count", 0)
            ))
        
        return sorted(flags, key=lambda x: x.key)
        
    except Exception as e:
        logger.error(f"List feature flags error: {e}")
        raise HTTPException(status_code=500, detail="Failed to list feature flags")

@router.post("/", response_model=FeatureFlagResponse)
async def create_feature_flag(
    request: CreateFeatureFlagRequest,
    admin_user: str = Depends(require_admin)
):
    """
    Create a new feature flag (admin only)
    """
    try:
        if request.key in feature_flags_store:
            raise HTTPException(status_code=409, detail="Feature flag already exists")
        
        # Validate value type
        if not validate_flag_value(request.default_value, request.flag_type):
            raise HTTPException(status_code=400, detail="Invalid default value for flag type")
        
        now = datetime.utcnow()
        flag_data = {
            "key": request.key,
            "name": request.name,
            "description": request.description,
            "flag_type": request.flag_type.value,
            "default_value": request.default_value,
            "is_active": request.is_active,
            "rules": [rule.dict() for rule in request.rules],
            "valid_from": request.valid_from,
            "valid_until": request.valid_until,
            "tags": request.tags,
            "created_at": now,
            "usage_count": 0
        }
        
        feature_flags_store[request.key] = flag_data
        
        status = determine_flag_status(flag_data)
        
        return FeatureFlagResponse(
            key=flag_data["key"],
            name=flag_data["name"],
            description=flag_data.get("description"),
            flag_type=flag_data["flag_type"],
            default_value=flag_data["default_value"],
            is_active=flag_data["is_active"],
            status=status,
            rules=request.rules,
            valid_from=flag_data.get("valid_from"),
            valid_until=flag_data.get("valid_until"),
            tags=flag_data.get("tags", []),
            created_at=flag_data["created_at"],
            updated_at=flag_data.get("updated_at"),
            usage_count=flag_data.get("usage_count", 0)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create feature flag error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create feature flag")

@router.get("/{flag_key}", response_model=FeatureFlagResponse)
async def get_feature_flag(
    flag_key: str,
    admin_user: str = Depends(require_admin)
):
    """
    Get specific feature flag (admin only)
    """
    try:
        if flag_key not in feature_flags_store:
            raise HTTPException(status_code=404, detail="Feature flag not found")
        
        flag_data = feature_flags_store[flag_key]
        status = determine_flag_status(flag_data)
        
        return FeatureFlagResponse(
            key=flag_data["key"],
            name=flag_data["name"],
            description=flag_data.get("description"),
            flag_type=flag_data["flag_type"],
            default_value=flag_data["default_value"],
            is_active=flag_data["is_active"],
            status=status,
            rules=[FeatureFlagRule(**rule) for rule in flag_data.get("rules", [])],
            valid_from=flag_data.get("valid_from"),
            valid_until=flag_data.get("valid_until"),
            tags=flag_data.get("tags", []),
            created_at=flag_data["created_at"],
            updated_at=flag_data.get("updated_at"),
            usage_count=flag_data.get("usage_count", 0)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get feature flag error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get feature flag")

@router.put("/{flag_key}", response_model=FeatureFlagResponse)
async def update_feature_flag(
    flag_key: str,
    request: UpdateFeatureFlagRequest,
    admin_user: str = Depends(require_admin)
):
    """
    Update feature flag (admin only)
    """
    try:
        if flag_key not in feature_flags_store:
            raise HTTPException(status_code=404, detail="Feature flag not found")
        
        flag_data = feature_flags_store[flag_key]
        
        # Update fields
        if request.name is not None:
            flag_data["name"] = request.name
        if request.description is not None:
            flag_data["description"] = request.description
        if request.default_value is not None:
            if not validate_flag_value(request.default_value, flag_data["flag_type"]):
                raise HTTPException(status_code=400, detail="Invalid default value for flag type")
            flag_data["default_value"] = request.default_value
        if request.is_active is not None:
            flag_data["is_active"] = request.is_active
        if request.rules is not None:
            flag_data["rules"] = [rule.dict() for rule in request.rules]
        if request.valid_from is not None:
            flag_data["valid_from"] = request.valid_from
        if request.valid_until is not None:
            flag_data["valid_until"] = request.valid_until
        if request.tags is not None:
            flag_data["tags"] = request.tags
        
        flag_data["updated_at"] = datetime.utcnow()
        
        status = determine_flag_status(flag_data)
        
        return FeatureFlagResponse(
            key=flag_data["key"],
            name=flag_data["name"],
            description=flag_data.get("description"),
            flag_type=flag_data["flag_type"],
            default_value=flag_data["default_value"],
            is_active=flag_data["is_active"],
            status=status,
            rules=[FeatureFlagRule(**rule) for rule in flag_data.get("rules", [])],
            valid_from=flag_data.get("valid_from"),
            valid_until=flag_data.get("valid_until"),
            tags=flag_data.get("tags", []),
            created_at=flag_data["created_at"],
            updated_at=flag_data.get("updated_at"),
            usage_count=flag_data.get("usage_count", 0)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update feature flag error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update feature flag")

@router.delete("/{flag_key}")
async def delete_feature_flag(
    flag_key: str,
    admin_user: str = Depends(require_admin)
):
    """
    Delete feature flag (admin only)
    """
    try:
        if flag_key not in feature_flags_store:
            raise HTTPException(status_code=404, detail="Feature flag not found")
        
        del feature_flags_store[flag_key]
        
        return {"success": True, "message": "Feature flag deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete feature flag error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete feature flag")

@router.post("/evaluate", response_model=FeatureFlagEvaluationResponse)
async def evaluate_feature_flags(
    request: FeatureFlagEvaluationRequest,
    flag_keys: Optional[List[str]] = None,
    user_id: Optional[str] = Depends(get_current_user)
):
    """
    Evaluate feature flags for given context
    """
    try:
        # Use user_id from auth if not provided in request
        if not request.user_id and user_id:
            request.user_id = user_id
        
        flags_to_evaluate = flag_keys or list(feature_flags_store.keys())
        evaluated_flags = {}
        metadata = {}
        
        for flag_key in flags_to_evaluate:
            if flag_key not in feature_flags_store:
                continue
            
            flag_data = feature_flags_store[flag_key]
            
            # Update usage count
            flag_data["usage_count"] = flag_data.get("usage_count", 0) + 1
            
            # Evaluate flag
            value, flag_metadata = evaluate_single_flag(flag_data, request)
            evaluated_flags[flag_key] = value
            metadata[flag_key] = flag_metadata
        
        return FeatureFlagEvaluationResponse(
            flags=evaluated_flags,
            metadata=metadata
        )
        
    except Exception as e:
        logger.error(f"Evaluate feature flags error: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate feature flags")

@router.get("/evaluate/{flag_key}")
async def evaluate_single_feature_flag(
    flag_key: str,
    user_id: Optional[str] = None,
    user_role: Optional[str] = None,
    makerspace_id: Optional[str] = None,
    region: Optional[str] = None,
    current_user: Optional[str] = Depends(get_current_user)
):
    """
    Evaluate a single feature flag
    """
    try:
        if flag_key not in feature_flags_store:
            raise HTTPException(status_code=404, detail="Feature flag not found")
        
        flag_data = feature_flags_store[flag_key]
        
        # Update usage count
        flag_data["usage_count"] = flag_data.get("usage_count", 0) + 1
        
        # Build evaluation context
        request = FeatureFlagEvaluationRequest(
            user_id=user_id or current_user,
            user_role=user_role,
            makerspace_id=makerspace_id,
            region=region
        )
        
        value, metadata = evaluate_single_flag(flag_data, request)
        
        return {
            "flag_key": flag_key,
            "value": value,
            "metadata": metadata
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Evaluate single feature flag error: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate feature flag")

@router.post("/{flag_key}/toggle")
async def toggle_feature_flag(
    flag_key: str,
    admin_user: str = Depends(require_admin)
):
    """
    Quick toggle feature flag active status (admin only)
    """
    try:
        if flag_key not in feature_flags_store:
            raise HTTPException(status_code=404, detail="Feature flag not found")
        
        flag_data = feature_flags_store[flag_key]
        flag_data["is_active"] = not flag_data["is_active"]
        flag_data["updated_at"] = datetime.utcnow()
        
        return {
            "flag_key": flag_key,
            "is_active": flag_data["is_active"],
            "message": f"Feature flag {'enabled' if flag_data['is_active'] else 'disabled'}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Toggle feature flag error: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle feature flag")

@router.get("/analytics/usage")
async def get_feature_flag_analytics(
    admin_user: str = Depends(require_admin)
):
    """
    Get feature flag usage analytics (admin only)
    """
    try:
        analytics = {
            "total_flags": len(feature_flags_store),
            "active_flags": sum(1 for flag in feature_flags_store.values() if flag["is_active"]),
            "inactive_flags": sum(1 for flag in feature_flags_store.values() if not flag["is_active"]),
            "usage_stats": [],
            "flag_types": {},
            "tag_distribution": {}
        }
        
        # Usage statistics
        for flag_key, flag_data in feature_flags_store.items():
            analytics["usage_stats"].append({
                "flag_key": flag_key,
                "name": flag_data["name"],
                "usage_count": flag_data.get("usage_count", 0),
                "is_active": flag_data["is_active"]
            })
        
        # Flag type distribution
        for flag_data in feature_flags_store.values():
            flag_type = flag_data["flag_type"]
            analytics["flag_types"][flag_type] = analytics["flag_types"].get(flag_type, 0) + 1
        
        # Tag distribution
        for flag_data in feature_flags_store.values():
            for tag in flag_data.get("tags", []):
                analytics["tag_distribution"][tag] = analytics["tag_distribution"].get(tag, 0) + 1
        
        # Sort usage stats by usage count
        analytics["usage_stats"].sort(key=lambda x: x["usage_count"], reverse=True)
        
        return analytics
        
    except Exception as e:
        logger.error(f"Get feature flag analytics error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get analytics")

# Helper Functions

def determine_flag_status(flag_data: Dict[str, Any]) -> FeatureFlagStatus:
    """Determine the current status of a feature flag"""
    now = datetime.utcnow()
    
    if not flag_data["is_active"]:
        return FeatureFlagStatus.INACTIVE
    
    valid_from = flag_data.get("valid_from")
    valid_until = flag_data.get("valid_until")
    
    if valid_from and now < valid_from:
        return FeatureFlagStatus.SCHEDULED
    
    if valid_until and now > valid_until:
        return FeatureFlagStatus.EXPIRED
    
    return FeatureFlagStatus.ACTIVE

def validate_flag_value(value: Any, flag_type: str) -> bool:
    """Validate that a value matches the expected flag type"""
    if flag_type == FeatureFlagType.BOOLEAN:
        return isinstance(value, bool)
    elif flag_type == FeatureFlagType.STRING:
        return isinstance(value, str)
    elif flag_type == FeatureFlagType.INTEGER:
        return isinstance(value, int)
    elif flag_type == FeatureFlagType.JSON:
        return isinstance(value, (dict, list))
    elif flag_type == FeatureFlagType.PERCENTAGE:
        return isinstance(value, (int, float)) and 0 <= value <= 100
    
    return False

def evaluate_single_flag(
    flag_data: Dict[str, Any], 
    context: FeatureFlagEvaluationRequest
) -> tuple[Any, Dict[str, Any]]:
    """Evaluate a single feature flag against the given context"""
    
    metadata = {
        "matched_rule": None,
        "evaluation_reason": "default_value",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Check if flag is active and within valid time range
    status = determine_flag_status(flag_data)
    if status not in [FeatureFlagStatus.ACTIVE]:
        metadata["evaluation_reason"] = f"flag_status_{status.value}"
        return flag_data["default_value"], metadata
    
    # Evaluate rules
    for i, rule in enumerate(flag_data.get("rules", [])):
        if evaluate_rule(rule, context):
            metadata["matched_rule"] = i
            metadata["evaluation_reason"] = "rule_match"
            
            if rule["enabled"]:
                # For special value rules (like premium users getting higher limits)
                if flag_data["flag_type"] == "integer" and rule["target_type"] == "user_role":
                    if rule["target_value"] == "premium":
                        return int(flag_data["default_value"]) * 2, metadata  # Premium users get 2x limit
                
                return get_rule_value(flag_data, rule), metadata
            else:
                return get_disabled_value(flag_data["flag_type"]), metadata
    
    # No rules matched, return default value
    return flag_data["default_value"], metadata

def evaluate_rule(rule: Dict[str, Any], context: FeatureFlagEvaluationRequest) -> bool:
    """Evaluate if a rule matches the given context"""
    target_type = rule["target_type"]
    target_value = rule["target_value"]
    
    if target_type == "all_users":
        return True
    elif target_type == "user_id":
        return context.user_id == target_value
    elif target_type == "user_role":
        return context.user_role == target_value
    elif target_type == "makerspace_id":
        return context.makerspace_id == target_value
    elif target_type == "region":
        return context.region == target_value
    elif target_type == "percentage":
        # Simple percentage rollout (would use proper hashing in production)
        import hashlib
        if context.user_id:
            hash_value = int(hashlib.md5(context.user_id.encode()).hexdigest(), 16)
            return (hash_value % 100) < int(target_value)
    
    return False

def get_rule_value(flag_data: Dict[str, Any], rule: Dict[str, Any]) -> Any:
    """Get the value for a matched rule"""
    # For most cases, return default value when rule matches and is enabled
    # Could be extended to have rule-specific values
    return flag_data["default_value"]

def get_disabled_value(flag_type: str) -> Any:
    """Get the disabled value for a flag type"""
    if flag_type == FeatureFlagType.BOOLEAN:
        return False
    elif flag_type == FeatureFlagType.STRING:
        return ""
    elif flag_type == FeatureFlagType.INTEGER:
        return 0
    elif flag_type == FeatureFlagType.JSON:
        return {}
    elif flag_type == FeatureFlagType.PERCENTAGE:
        return 0
    
    return None
