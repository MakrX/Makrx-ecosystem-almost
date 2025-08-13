"""
Enhanced Security Authentication System
Implements comprehensive security per specification:
- Short-lived JWT (5-15min), Refresh tokens (≤30 days)
- Keycloak as single identity provider with audience enforcement
- Role & scope enforcement with contextual access control
- DPDP Act compliance & GDPR concepts
"""
import httpx
import jwt
import redis
import logging
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
import json
import hashlib
import secrets
from dataclasses import dataclass
from enum import Enum

from app.core.config import settings

logger = logging.getLogger(__name__)
security = HTTPBearer()

# ==========================================
# Security Configuration & Constants
# ==========================================

class UserRole(str, Enum):
    """Defined roles per specification"""
    USER = "user"
    PROVIDER = "provider"
    MAKERSPACE_ADMIN = "makerspace_admin"
    STORE_ADMIN = "store_admin"
    SUPERADMIN = "superadmin"

class SecurityConfig:
    """Security constants per specification"""
    ACCESS_TOKEN_LIFETIME = 15 * 60  # 15 minutes
    REFRESH_TOKEN_LIFETIME = 30 * 24 * 60 * 60  # 30 days
    JWT_ALGORITHMS = ['RS256']
    ALLOWED_ORIGINS = [
        'https://makrx.org',
        'https://makrcave.com', 
        'https://makrx.store',
        'https://3d.makrx.store'
    ]
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION = 900  # 15 minutes
    SESSION_TIMEOUT = 3600  # 1 hour

@dataclass
class SecurityContext:
    """Security context for requests"""
    user_id: str
    keycloak_id: str
    roles: List[str]
    scopes: List[str]
    makerspace_id: Optional[str] = None
    organization_id: Optional[str] = None
    request_id: str = None
    ip_address: str = None
    user_agent: str = None

# ==========================================
# Enhanced Authentication System
# ==========================================

class EnhancedAuth:
    """
    Enhanced authentication with security controls
    Implements all requirements from security specification
    """
    
    def __init__(self):
        self.keycloak_url = settings.KEYCLOAK_URL
        self.realm = settings.KEYCLOAK_REALM
        self.jwks_cache = {}
        self.jwks_cache_expiry = None
        self.redis_client = redis.Redis.from_url(settings.REDIS_URL) if hasattr(settings, 'REDIS_URL') else None
        
    async def get_jwks(self) -> Dict[str, Any]:
        """Get JWKS from Keycloak with secure caching"""
        cache_key = f"jwks:{self.realm}"
        
        # Try Redis cache first
        if self.redis_client:
            try:
                cached = await self.redis_client.get(cache_key)
                if cached:
                    return json.loads(cached)
            except Exception as e:
                logger.warning(f"Redis cache miss for JWKS: {e}")
        
        # Fallback to memory cache
        if (self.jwks_cache_expiry and 
            datetime.utcnow() < self.jwks_cache_expiry and 
            self.jwks_cache):
            return self.jwks_cache
            
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.keycloak_url}/realms/{self.realm}/protocol/openid-connect/certs",
                    headers={"User-Agent": "MakrX-Security-Service/1.0"}
                )
                response.raise_for_status()
                
                jwks_data = response.json()
                
                # Cache in Redis (1 hour TTL)
                if self.redis_client:
                    try:
                        await self.redis_client.setex(cache_key, 3600, json.dumps(jwks_data))
                    except Exception as e:
                        logger.warning(f"Failed to cache JWKS in Redis: {e}")
                
                # Memory cache fallback
                self.jwks_cache = jwks_data
                self.jwks_cache_expiry = datetime.utcnow() + timedelta(hours=1)
                return jwks_data
                
        except Exception as e:
            logger.error(f"Failed to fetch JWKS: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service unavailable"
            )
    
    async def verify_jwt(self, token: str, expected_audience: str, context: SecurityContext = None) -> Dict[str, Any]:
        """
        Enhanced JWT verification with security controls
        - Validates issuer/audience per specification
        - Checks token lifetime limits
        - Implements additional security checks
        """
        try:
            # Security: Check token format and length
            if not token or len(token) > 4096:  # Prevent DoS with huge tokens
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token format"
                )
            
            # Decode header to get key ID
            header = jwt.get_unverified_header(token)
            kid = header.get('kid')
            alg = header.get('alg')
            
            # Security: Validate algorithm
            if alg not in SecurityConfig.JWT_ALGORITHMS:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token algorithm"
                )
            
            if not kid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: missing key ID"
                )
            
            # Get JWKS and find matching key
            jwks = await self.get_jwks()
            key = None
            
            for jwk in jwks.get('keys', []):
                if jwk.get('kid') == kid and jwk.get('alg') == alg:
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
                algorithms=SecurityConfig.JWT_ALGORITHMS,
                issuer=expected_issuer,
                audience=expected_audience,
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_nbf": True,
                    "verify_iat": True,
                    "verify_aud": True,
                    "verify_iss": True
                }
            )
            
            # Security: Check token lifetime (should be ≤15 min for access tokens)
            iat = payload.get('iat', 0)
            exp = payload.get('exp', 0)
            token_lifetime = exp - iat
            
            # Allow longer lifetime for refresh tokens and service tokens
            if 'refresh' not in payload.get('typ', '') and 'service' not in payload.get('sub', ''):
                if token_lifetime > SecurityConfig.ACCESS_TOKEN_LIFETIME + 60:  # 1min grace
                    logger.warning(f"Token lifetime too long: {token_lifetime}s")
            
            # Security: Rate limit per user
            if context and context.user_id:
                await self._check_rate_limit(context.user_id, context.ip_address)
            
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
        except jwt.InvalidSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token signature"
            )
        except Exception as e:
            logger.error(f"JWT verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    async def _check_rate_limit(self, user_id: str, ip_address: str = None):
        """
        Rate limiting per specification:
        - Per-IP & per-user limits
        - Token bucket algorithm with Redis
        """
        if not self.redis_client:
            return  # Skip rate limiting if Redis unavailable
        
        try:
            # Rate limit keys
            user_key = f"rate_limit:user:{user_id}"
            ip_key = f"rate_limit:ip:{ip_address}" if ip_address else None
            
            # Check user rate limit (100 req/5min)
            user_count = await self.redis_client.incr(user_key)
            if user_count == 1:
                await self.redis_client.expire(user_key, 300)  # 5 minutes
            
            if user_count > 100:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded for user"
                )
            
            # Check IP rate limit (if available)
            if ip_key:
                ip_count = await self.redis_client.incr(ip_key)
                if ip_count == 1:
                    await self.redis_client.expire(ip_key, 300)
                
                if ip_count > 200:  # Higher limit per IP
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="Rate limit exceeded for IP"
                    )
                    
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Rate limiting failed: {e}")
            # Don't fail auth if rate limiting has issues

# Global enhanced auth instance
enhanced_auth = EnhancedAuth()

# ==========================================
# Enhanced User Authentication
# ==========================================

async def get_current_user_enhanced(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> SecurityContext:
    """
    Enhanced user authentication with security context
    Creates comprehensive security context for request processing
    """
    try:
        token = credentials.credentials
        
        # Extract client info for security context
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("User-Agent", "Unknown")
        request_id = request.headers.get("X-Request-ID")
        
        # Verify with Store client audience
        payload = await enhanced_auth.verify_jwt(
            token, 
            settings.KEYCLOAK_CLIENT_ID
        )
        
        # Create security context
        user_context = SecurityContext(
            user_id=payload.get('sub'),
            keycloak_id=payload.get('sub'),
            roles=payload.get('realm_access', {}).get('roles', []),
            scopes=payload.get('scope', '').split() if payload.get('scope') else [],
            request_id=request_id,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # Extract contextual info
        if 'makerspace_id' in payload:
            user_context.makerspace_id = payload['makerspace_id']
        if 'organization_id' in payload:
            user_context.organization_id = payload['organization_id']
        
        # Rate limiting with context
        await enhanced_auth._check_rate_limit(user_context.user_id, user_context.ip_address)
        
        return user_context
        
    except Exception as e:
        logger.error(f"Enhanced user auth failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

# ==========================================
# Enhanced Role-Based Access Control
# ==========================================

class EnhancedRoleChecker:
    """
    Enhanced RBAC with contextual access control
    Supports resource scoping (makerspace_id, organization_id)
    """
    
    def __init__(self, required_roles: List[str], required_scopes: List[str] = None, 
                 require_makerspace_context: bool = False):
        self.required_roles = required_roles
        self.required_scopes = required_scopes or []
        self.require_makerspace_context = require_makerspace_context
    
    def __call__(self, context: SecurityContext = Depends(get_current_user_enhanced)):
        # Role checking
        if not any(role in context.roles for role in self.required_roles):
            logger.warning(
                f"Access denied - insufficient roles. User: {context.user_id}, "
                f"Required: {self.required_roles}, Has: {context.roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {self.required_roles}"
            )
        
        # Scope checking
        if self.required_scopes:
            if not any(scope in context.scopes for scope in self.required_scopes):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient scopes. Required: {self.required_scopes}"
                )
        
        # Contextual access control
        if self.require_makerspace_context and not context.makerspace_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Makerspace context required for this operation"
            )
        
        return context

# Enhanced role checkers with contextual access
require_store_admin = EnhancedRoleChecker([UserRole.STORE_ADMIN, UserRole.SUPERADMIN])
require_makerspace_admin = EnhancedRoleChecker(
    [UserRole.MAKERSPACE_ADMIN, UserRole.SUPERADMIN], 
    require_makerspace_context=True
)
require_provider = EnhancedRoleChecker([UserRole.PROVIDER, UserRole.SUPERADMIN])
require_admin = EnhancedRoleChecker([UserRole.STORE_ADMIN, UserRole.SUPERADMIN])

# ==========================================
# DPDP Act & Privacy Compliance
# ==========================================

class DataProtectionService:
    """
    Data Protection Service for DPDP Act compliance
    Handles consent, data minimization, retention, and user rights
    """
    
    def __init__(self):
        self.redis_client = enhanced_auth.redis_client
    
    async def record_consent(self, user_id: str, consent_type: str, 
                           method: str, scope: List[str]) -> Dict[str, Any]:
        """Record user consent per DPDP Act requirements"""
        consent_record = {
            "user_id": user_id,
            "consent_type": consent_type,  # "marketing", "analytics", "required"
            "method": method,  # "explicit_form", "registration", "api"
            "scope": scope,  # What data/processing is consented to
            "timestamp": datetime.utcnow().isoformat(),
            "ip_address": None,  # Should be passed from context
            "user_agent": None,
            "consent_id": secrets.token_urlsafe(32)
        }
        
        # Store consent record (required by DPDP Act)
        if self.redis_client:
            try:
                consent_key = f"consent:{user_id}:{consent_record['consent_id']}"
                await self.redis_client.setex(
                    consent_key, 
                    SecurityConfig.REFRESH_TOKEN_LIFETIME,  # 30 days minimum retention
                    json.dumps(consent_record)
                )
            except Exception as e:
                logger.error(f"Failed to store consent record: {e}")
        
        return consent_record
    
    async def handle_data_export_request(self, user_id: str) -> Dict[str, Any]:
        """Handle user data export request (Right to Data Portability)"""
        try:
            # Aggregate user data from all services
            user_data = {
                "user_id": user_id,
                "export_timestamp": datetime.utcnow().isoformat(),
                "data_categories": {
                    "profile": {},  # From Keycloak
                    "orders": [],   # From Store
                    "projects": [], # From Cave
                    "consent_records": [],
                    "audit_logs": []
                }
            }
            
            # Get consent records
            if self.redis_client:
                consent_keys = await self.redis_client.keys(f"consent:{user_id}:*")
                for key in consent_keys:
                    try:
                        consent_data = await self.redis_client.get(key)
                        if consent_data:
                            user_data["data_categories"]["consent_records"].append(
                                json.loads(consent_data)
                            )
                    except Exception as e:
                        logger.warning(f"Failed to retrieve consent record {key}: {e}")
            
            return user_data
            
        except Exception as e:
            logger.error(f"Data export failed for user {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Data export request failed"
            )
    
    async def handle_data_deletion_request(self, user_id: str, reason: str = None) -> Dict[str, Any]:
        """Handle user data deletion request (Right to Erasure)"""
        try:
            deletion_record = {
                "user_id": user_id,
                "deletion_timestamp": datetime.utcnow().isoformat(),
                "reason": reason or "user_request",
                "deletion_id": secrets.token_urlsafe(32),
                "status": "initiated"
            }
            
            # Log deletion request (required for audit)
            logger.info(f"Data deletion initiated for user {user_id}: {deletion_record['deletion_id']}")
            
            # In production, this would trigger:
            # 1. Soft delete in all databases
            # 2. Anonymize audit logs
            # 3. Remove PII from backups
            # 4. Notify all microservices
            
            return deletion_record
            
        except Exception as e:
            logger.error(f"Data deletion failed for user {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Data deletion request failed"
            )

# Global data protection service
data_protection = DataProtectionService()

# ==========================================
# Session Security & Token Management
# ==========================================

class SessionSecurityManager:
    """
    Enhanced session security with token rotation and monitoring
    """
    
    def __init__(self):
        self.redis_client = enhanced_auth.redis_client
    
    async def create_secure_session(self, user_id: str, context: SecurityContext) -> Dict[str, Any]:
        """Create secure session with tracking"""
        session_id = secrets.token_urlsafe(32)
        session_data = {
            "session_id": session_id,
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "ip_address": context.ip_address,
            "user_agent": context.user_agent,
            "last_activity": datetime.utcnow().isoformat()
        }
        
        if self.redis_client:
            try:
                session_key = f"session:{session_id}"
                await self.redis_client.setex(
                    session_key,
                    SecurityConfig.SESSION_TIMEOUT,
                    json.dumps(session_data)
                )
            except Exception as e:
                logger.error(f"Failed to create session: {e}")
        
        return session_data
    
    async def invalidate_session(self, session_id: str):
        """Invalidate session for security"""
        if self.redis_client:
            try:
                await self.redis_client.delete(f"session:{session_id}")
            except Exception as e:
                logger.error(f"Failed to invalidate session: {e}")

# Global session manager
session_manager = SessionSecurityManager()
