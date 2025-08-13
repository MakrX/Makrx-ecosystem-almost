"""
Unified Authentication System
One Keycloak realm with precise JWT handling as specified
"""
import httpx
import jwt
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
import json

from app.core.config import settings

logger = logging.getLogger(__name__)
security = HTTPBearer()

# ==========================================
# Global Auth Rules Implementation
# ==========================================

class UnifiedAuth:
    """
    SSO: One Keycloak realm. Frontends attach Authorization: Bearer <JWT>
    audience = client id for each service
    """
    
    def __init__(self):
        self.keycloak_url = settings.KEYCLOAK_URL
        self.realm = settings.KEYCLOAK_REALM
        self.jwks_cache = {}
        self.jwks_cache_expiry = None
        
    async def get_jwks(self) -> Dict[str, Any]:
        """Get JWKS from Keycloak with caching"""
        if (self.jwks_cache_expiry and 
            datetime.utcnow() < self.jwks_cache_expiry and 
            self.jwks_cache):
            return self.jwks_cache
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.keycloak_url}/realms/{self.realm}/protocol/openid-connect/certs"
                )
                response.raise_for_status()
                
                self.jwks_cache = response.json()
                self.jwks_cache_expiry = datetime.utcnow() + timedelta(hours=1)
                return self.jwks_cache
                
        except Exception as e:
            logger.error(f"Failed to fetch JWKS: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service unavailable"
            )
    
    async def verify_jwt(self, token: str, expected_audience: str) -> Dict[str, Any]:
        """
        Verify JWT with exact rules:
        - Validate issuer/audience
        - Check expiration
        - Verify signature with JWKS
        """
        try:
            # Decode header to get key ID
            header = jwt.get_unverified_header(token)
            kid = header.get('kid')
            
            if not kid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: missing key ID"
                )
            
            # Get JWKS and find matching key
            jwks = await self.get_jwks()
            key = None
            
            for jwk in jwks.get('keys', []):
                if jwk.get('kid') == kid:
                    key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))
                    break
            
            if not key:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: key not found"
                )
            
            # Verify JWT with exact issuer/audience checks
            expected_issuer = f"{self.keycloak_url}/realms/{self.realm}"
            
            payload = jwt.decode(
                token,
                key,
                algorithms=['RS256'],
                issuer=expected_issuer,
                audience=expected_audience
            )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired"
            )
        except jwt.InvalidAudienceError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token not valid for audience: {expected_audience}"
            )
        except jwt.InvalidIssuerError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token from invalid issuer"
            )
        except Exception as e:
            logger.error(f"JWT verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

# Global auth instance
auth = UnifiedAuth()

# ==========================================
# Service-to-Service Authentication
# ==========================================

async def verify_service_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Service→Service auth: client-credentials JWT (KC) or mTLS for internal bridges
    Used for Store ↔ Cave communication
    """
    try:
        token = credentials.credentials
        
        # For service-to-service, use different audience
        payload = await auth.verify_jwt(token, settings.SERVICE_AUDIENCE)
        
        # Verify this is a service token (not user token)
        if payload.get('typ') != 'Bearer' or 'service-account' not in payload.get('sub', ''):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Service token required"
            )
        
        return payload
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid service token"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Frontend user authentication
    Frontends attach Authorization: Bearer <JWT> to their service (audience = client id)
    """
    try:
        token = credentials.credentials
        
        # Verify with Store client audience
        payload = await auth.verify_jwt(token, settings.KEYCLOAK_CLIENT_ID)
        
        # Extract user info with keycloak_id mapping
        user_info = {
            "keycloak_id": payload.get('sub'),  # user.keycloak_id (KC sub)
            "email": payload.get('email'),
            "username": payload.get('preferred_username'),
            "first_name": payload.get('given_name'),
            "last_name": payload.get('family_name'),
            "roles": payload.get('realm_access', {}).get('roles', []),
            "token_type": "user"
        }
        
        return user_info
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user token"
        )

# ==========================================
# Cross-Service Identity Mapping
# ==========================================

class IdentityMapper:
    """
    IDs that travel across services:
    - user.keycloak_id (KC sub) → shadowed in makrx_auth.users.id
    - product_code/sku → single source of truth across Store, Cave inventory, BOM
    - service_order_id (Store) ↔ job_id (Cave) via bridge mapping
    """
    
    @staticmethod
    def map_keycloak_user(keycloak_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Map Keycloak JWT payload to internal user representation"""
        return {
            "id": keycloak_payload.get('sub'),  # This is the keycloak_id
            "email": keycloak_payload.get('email'),
            "username": keycloak_payload.get('preferred_username'),
            "first_name": keycloak_payload.get('given_name'),
            "last_name": keycloak_payload.get('family_name'),
            "roles": keycloak_payload.get('realm_access', {}).get('roles', []),
            "groups": keycloak_payload.get('groups', []),
            "verified": keycloak_payload.get('email_verified', False)
        }
    
    @staticmethod
    def create_service_order_mapping(service_order_id: int, job_id: int) -> Dict[str, Any]:
        """Create bidirectional mapping between Store service_order_id and Cave job_id"""
        return {
            "store_service_order_id": service_order_id,
            "cave_job_id": job_id,
            "created_at": datetime.utcnow().isoformat(),
            "mapping_type": "service_order_to_job"
        }
    
    @staticmethod
    def validate_sku_consistency(sku: str) -> bool:
        """
        Validate SKU format for consistency across Store, Cave inventory, BOM
        product_code/sku → single source of truth
        """
        # SKU format validation (implement your specific rules)
        if not sku or len(sku) < 3:
            return False
        
        # Example: MKX-PLA-LW-BLK-1KG format
        # Implement your SKU validation rules here
        return True

# ==========================================
# Request ID Propagation (Observability)
# ==========================================

import uuid
from fastapi import Request

def generate_request_id() -> str:
    """Generate unique request ID for tracing"""
    return str(uuid.uuid4())

def get_request_id(request: Request) -> str:
    """Get or create request ID for current request"""
    if hasattr(request.state, 'request_id'):
        return request.state.request_id
    
    # Try to get from header (propagated from other services)
    request_id = request.headers.get('X-Request-ID')
    if not request_id:
        request_id = generate_request_id()
    
    request.state.request_id = request_id
    return request_id

# ==========================================
# Role-Based Access Control
# ==========================================

class RoleChecker:
    """
    Role checks with resource scoping
    user (default), provider, makerspace_admin, admin, superadmin
    Resource scoping (e.g., makerspace_id) enforced server-side
    """
    
    def __init__(self, required_roles: list):
        self.required_roles = required_roles
    
    def __call__(self, current_user: Dict[str, Any] = Depends(get_current_user)):
        user_roles = current_user.get('roles', [])
        
        # Check if user has any of the required roles
        if not any(role in user_roles for role in self.required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {self.required_roles}"
            )
        
        return current_user

# Convenience role checkers
require_admin = RoleChecker(['admin', 'superadmin'])
require_provider = RoleChecker(['provider', 'admin', 'superadmin'])
require_makerspace_admin = RoleChecker(['makerspace_admin', 'admin', 'superadmin'])

# ==========================================
# Idempotency Key Handler
# ==========================================

from fastapi import Header

async def get_idempotency_key(
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key")
) -> Optional[str]:
    """
    Idempotency: All create/finalize endpoints accept Idempotency-Key
    Implementation for preventing duplicate operations
    """
    return idempotency_key

class IdempotencyChecker:
    """Check and store idempotency keys to prevent duplicate operations"""
    
    def __init__(self):
        # In production, use Redis for distributed idempotency
        self.cache = {}
    
    async def is_duplicate(self, key: str, operation: str) -> bool:
        """Check if this operation was already performed"""
        cache_key = f"{operation}:{key}"
        return cache_key in self.cache
    
    async def record_operation(self, key: str, operation: str, result: Any):
        """Record that this operation was completed"""
        cache_key = f"{operation}:{key}"
        self.cache[cache_key] = {
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def get_cached_result(self, key: str, operation: str) -> Optional[Any]:
        """Get cached result for duplicate request"""
        cache_key = f"{operation}:{key}"
        cached = self.cache.get(cache_key)
        return cached["result"] if cached else None

# Global idempotency checker
idempotency = IdempotencyChecker()
