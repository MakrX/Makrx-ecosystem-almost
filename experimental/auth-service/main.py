#!/usr/bin/env python3
"""
MakrX Auth Service - Central Authentication & User Management
FastAPI service that orchestrates authentication across MakrX ecosystem
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
import httpx
import os
import jwt
from typing import Dict, Any, Optional
import logging
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import asyncio
from contextlib import asynccontextmanager

# Import security middleware
from security_middleware import (
    RateLimitMiddleware,
    SecurityHeadersMiddleware,
    InputValidationMiddleware
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://keycloak:8080")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "makrx")
KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "auth-service")
KEYCLOAK_CLIENT_SECRET = os.getenv("KEYCLOAK_CLIENT_SECRET")
if not KEYCLOAK_CLIENT_SECRET:
    raise ValueError("KEYCLOAK_CLIENT_SECRET environment variable is required")

# Services URLs
MAKRCAVE_API_URL = os.getenv("MAKRCAVE_API_URL", "http://makrcave-backend:8000")
STORE_API_URL = os.getenv("STORE_API_URL", "http://makrx-store-backend:8000")

# Security
security = HTTPBearer()

# Pydantic Models
class UserProfile(BaseModel):
    id: str
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    roles: list[str] = []
    makerspaces: list[str] = []
    preferences: Dict[str, Any] = {}
    created_at: datetime
    last_login: Optional[datetime] = None

class TokenExchange(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    expires_in: int
    token_type: str = "Bearer"

class CrossPortalAuth(BaseModel):
    portal: str = Field(..., description="Target portal (makrcave|store|gateway)")
    redirect_url: Optional[str] = None

class UserSyncRequest(BaseModel):
    user_id: str
    portal: str
    action: str = Field(..., description="create|update|delete")
    data: Optional[Dict[str, Any]] = None

# Global HTTP client
http_client: Optional[httpx.AsyncClient] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global http_client
    http_client = httpx.AsyncClient(timeout=30.0)
    logger.info("Auth Service started")
    yield
    await http_client.aclose()
    logger.info("Auth Service shutdown")

# FastAPI app
app = FastAPI(
    title="MakrX Auth Service",
    description="Central Authentication & User Management for MakrX Ecosystem",
    version="1.0.0",
    lifespan=lifespan
)

# Security middleware (order matters!)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(InputValidationMiddleware)
app.add_middleware(RateLimitMiddleware, calls=100, period=3600)  # 100 calls per hour

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Gateway
        "http://localhost:3001",  # MakrCave
        "http://localhost:3002",  # Store
        "http://localhost:3003",  # Store (current)
        "http://gateway-frontend:3000",
        "http://makrcave-frontend:3001",
        "http://makrx-store-frontend:3002"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global JWKS cache
jwks_cache = {}
jwks_cache_time = None
JWKS_CACHE_DURATION = 3600  # 1 hour

async def get_jwks_key(token: str) -> str:
    """Get the appropriate public key from Keycloak JWKS endpoint"""
    global jwks_cache, jwks_cache_time

    # Check cache validity
    if jwks_cache_time and (datetime.utcnow() - jwks_cache_time).seconds < JWKS_CACHE_DURATION:
        jwks = jwks_cache
    else:
        # Fetch JWKS from Keycloak
        keycloak_config_url = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/.well-known/openid_configuration"

        async with http_client.get(keycloak_config_url) as config_response:
            if config_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Cannot fetch Keycloak configuration")

            config = config_response.json()
            jwks_uri = config["jwks_uri"]

        async with http_client.get(jwks_uri) as jwks_response:
            if jwks_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Cannot fetch JWKS")

            jwks = jwks_response.json()
            jwks_cache = jwks
            jwks_cache_time = datetime.utcnow()

    # Decode token header to get key ID
    unverified_header = jwt.get_unverified_header(token)
    kid = unverified_header.get("kid")

    if not kid:
        raise HTTPException(status_code=401, detail="Token missing key ID")

    # Find matching key
    for key in jwks["keys"]:
        if key["kid"] == kid:
            # Convert JWK to PEM format
            from cryptography.hazmat.primitives import serialization
            from cryptography.hazmat.primitives.asymmetric import rsa
            import base64

            # Extract RSA components
            n = base64.urlsafe_b64decode(key["n"] + "====")
            e = base64.urlsafe_b64decode(key["e"] + "====")

            # Create RSA public key
            public_numbers = rsa.RSAPublicNumbers(
                int.from_bytes(e, 'big'),
                int.from_bytes(n, 'big')
            )
            public_key = public_numbers.public_key()

            # Convert to PEM
            pem = public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )
            return pem.decode('utf-8')

    raise HTTPException(status_code=401, detail="Unable to find appropriate key")

# Authentication Dependencies
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Verify JWT token with Keycloak using proper signature validation"""
    try:
        token = credentials.credentials

        # Get public key for verification
        public_key = await get_jwks_key(token)

        # Verify token with proper signature validation
        payload = jwt.decode(
            token,
            key=public_key,
            algorithms=["RS256"],
            audience=["account", KEYCLOAK_CLIENT_ID],
            issuer=f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}"
        )

        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidAudienceError:
        raise HTTPException(status_code=401, detail="Invalid token audience")
    except jwt.InvalidIssuerError:
        raise HTTPException(status_code=401, detail="Invalid token issuer")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(status_code=401, detail="Token verification failed")

# Health Check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "makrx-auth-service",
        "timestamp": datetime.utcnow().isoformat(),
        "keycloak_url": KEYCLOAK_URL
    }

# Core Authentication Endpoints
@app.post("/auth/token/exchange", response_model=TokenExchange)
async def exchange_token(portal_auth: CrossPortalAuth, user_data: Dict[str, Any] = Depends(verify_token)):
    """Exchange token for cross-portal authentication"""
    try:
        user_id = user_data.get("sub")
        
        # Generate portal-specific token
        portal_token = await generate_portal_token(user_id, portal_auth.portal)
        
        return TokenExchange(
            access_token=portal_token,
            expires_in=3600,
            token_type="Bearer"
        )
        
    except Exception as e:
        logger.error(f"Token exchange error: {e}")
        raise HTTPException(status_code=500, detail="Token exchange failed")

@app.get("/auth/profile", response_model=UserProfile)
async def get_user_profile(user_data: Dict[str, Any] = Depends(verify_token)):
    """Get unified user profile across all portals"""
    try:
        user_id = user_data.get("sub")
        email = user_data.get("email", "")
        username = user_data.get("preferred_username", email)
        
        # Aggregate data from all services
        makrcave_data = await get_user_from_service("makrcave", user_id)
        store_data = await get_user_from_service("store", user_id)
        
        # Extract roles from token and services
        realm_roles = user_data.get("realm_access", {}).get("roles", [])
        resource_roles = []
        
        if "resource_access" in user_data:
            for client, access in user_data["resource_access"].items():
                resource_roles.extend(access.get("roles", []))
        
        all_roles = list(set(realm_roles + resource_roles))
        
        return UserProfile(
            id=user_id,
            username=username,
            email=email,
            first_name=user_data.get("given_name"),
            last_name=user_data.get("family_name"),
            roles=all_roles,
            makerspaces=makrcave_data.get("makerspaces", []) if makrcave_data else [],
            preferences={
                "theme": "system",
                "notifications": True,
                **store_data.get("preferences", {}) if store_data else {}
            },
            created_at=datetime.utcnow(),
            last_login=datetime.utcnow()
        )
        
    except Exception as e:
        logger.error(f"Profile fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch user profile")

@app.post("/auth/sync/user")
async def sync_user_across_services(sync_request: UserSyncRequest, user_data: Dict[str, Any] = Depends(verify_token)):
    """Sync user data across all MakrX services"""
    try:
        # Verify admin permissions for user sync
        roles = user_data.get("realm_access", {}).get("roles", [])
        if "admin" not in roles and "super-admin" not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions for user sync")
        
        results = {}
        
        # Sync to MakrCave
        if sync_request.portal in ["all", "makrcave"]:
            results["makrcave"] = await sync_user_to_service("makrcave", sync_request)
            
        # Sync to Store  
        if sync_request.portal in ["all", "store"]:
            results["store"] = await sync_user_to_service("store", sync_request)
        
        return {
            "message": "User sync completed",
            "user_id": sync_request.user_id,
            "results": results
        }
        
    except Exception as e:
        logger.error(f"User sync error: {e}")
        raise HTTPException(status_code=500, detail="User sync failed")

# Cross-Service Communication
async def generate_portal_token(user_id: str, portal: str) -> str:
    """Generate portal-specific access token"""
    # In production, this would generate proper service-to-service tokens
    # For now, return a simple signed token
    payload = {
        "sub": user_id,
        "portal": portal,
        "iss": "makrx-auth-service",
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow()
    }
    
    # Use a service secret for signing
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise ValueError("JWT_SECRET environment variable is required")
    return jwt.encode(payload, secret, algorithm="HS256")

async def get_user_from_service(service: str, user_id: str) -> Optional[Dict[str, Any]]:
    """Fetch user data from specific service"""
    try:
        service_urls = {
            "makrcave": f"{MAKRCAVE_API_URL}/api/v1/users/{user_id}",
            "store": f"{STORE_API_URL}/users/{user_id}"
        }
        
        if service not in service_urls:
            return None
            
        url = service_urls[service]
        async with http_client.get(url) as response:
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                return None
            else:
                logger.warning(f"Failed to fetch user from {service}: {response.status_code}")
                return None
                
    except Exception as e:
        logger.error(f"Error fetching user from {service}: {e}")
        return None

async def sync_user_to_service(service: str, sync_request: UserSyncRequest) -> Dict[str, Any]:
    """Sync user data to specific service"""
    try:
        service_urls = {
            "makrcave": f"{MAKRCAVE_API_URL}/api/v1/users/sync",
            "store": f"{STORE_API_URL}/users/sync"
        }
        
        if service not in service_urls:
            return {"success": False, "error": f"Unknown service: {service}"}
            
        url = service_urls[service]
        async with http_client.post(url, json=sync_request.dict()) as response:
            if response.status_code in [200, 201]:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
                
    except Exception as e:
        logger.error(f"Error syncing user to {service}: {e}")
        return {"success": False, "error": str(e)}

# Portal Navigation Endpoints
@app.get("/portals/makrcave/url")
async def get_makrcave_url(user_data: Dict[str, Any] = Depends(verify_token)):
    """Get MakrCave portal URL with authentication"""
    token = await generate_portal_token(user_data.get("sub"), "makrcave")
    return {
        "url": "http://localhost:3001",
        "token": token,
        "portal": "makrcave"
    }

@app.get("/portals/store/url") 
async def get_store_url(user_data: Dict[str, Any] = Depends(verify_token)):
    """Get Store portal URL with authentication"""
    token = await generate_portal_token(user_data.get("sub"), "store")
    return {
        "url": "http://localhost:3003",
        "token": token,
        "portal": "store"
    }

# Admin Endpoints
@app.get("/admin/users")
async def list_all_users(user_data: Dict[str, Any] = Depends(verify_token)):
    """List all users across the ecosystem (admin only)"""
    roles = user_data.get("realm_access", {}).get("roles", [])
    if "admin" not in roles and "super-admin" not in roles:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Fetch users from Keycloak
        keycloak_admin_url = f"{KEYCLOAK_URL}/admin/realms/{KEYCLOAK_REALM}/users"
        
        # Note: In production, implement proper Keycloak admin token management
        return {
            "message": "User listing requires Keycloak admin integration",
            "keycloak_url": keycloak_admin_url
        }
        
    except Exception as e:
        logger.error(f"Admin user listing error: {e}")
        raise HTTPException(status_code=500, detail="Failed to list users")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
