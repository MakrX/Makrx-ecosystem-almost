"""
Security Middleware for MakrCave Backend
Rate limiting, security headers, and request validation
"""

import time
from collections import defaultdict
from typing import Dict, Any
from fastapi import Request, Response, HTTPException, status
from fastapi.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware with endpoint-specific limits"""
    
    def __init__(self, app):
        super().__init__(app)
        self.clients = defaultdict(lambda: defaultdict(list))
        
        # Endpoint-specific rate limits (calls per hour)
        self.limits = {
            "/api/v1/auth/": {"calls": 20, "period": 3600},  # Auth endpoints
            "/api/v1/inventory/": {"calls": 200, "period": 3600},  # Inventory
            "/api/v1/equipment/": {"calls": 100, "period": 3600},  # Equipment
            "/api/v1/projects/": {"calls": 150, "period": 3600},  # Projects
            "/api/v1/members/": {"calls": 100, "period": 3600},  # Members
            "/api/v1/billing/": {"calls": 50, "period": 3600},   # Billing
            "default": {"calls": 300, "period": 3600}  # Default limit
        }
    
    def get_endpoint_category(self, path: str) -> str:
        """Get the rate limit category for a path"""
        for prefix in self.limits:
            if prefix != "default" and path.startswith(prefix):
                return prefix
        return "default"
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        endpoint_category = self.get_endpoint_category(request.url.path)
        
        # Get limits for this endpoint category
        limit_config = self.limits[endpoint_category]
        calls_limit = limit_config["calls"]
        period = limit_config["period"]
        
        # Clean old entries
        now = time.time()
        self.clients[client_ip][endpoint_category] = [
            call_time for call_time in self.clients[client_ip][endpoint_category]
            if now - call_time < period
        ]
        
        # Check rate limit
        if len(self.clients[client_ip][endpoint_category]) >= calls_limit:
            logger.warning(
                f"Rate limit exceeded for IP {client_ip} on {endpoint_category}: "
                f"{len(self.clients[client_ip][endpoint_category])}/{calls_limit}"
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded for {endpoint_category}. Try again later.",
                headers={"Retry-After": str(period)}
            )
        
        # Record this call
        self.clients[client_ip][endpoint_category].append(now)
        
        # Add rate limit headers
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(calls_limit)
        response.headers["X-RateLimit-Remaining"] = str(
            calls_limit - len(self.clients[client_ip][endpoint_category])
        )
        response.headers["X-RateLimit-Reset"] = str(int(now + period))
        
        return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add comprehensive security headers"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers.update({
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY", 
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
            "Content-Security-Policy": (
                "default-src 'self'; "
                "script-src 'self'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "connect-src 'self' wss: https:; "
                "font-src 'self'; "
                "object-src 'none'; "
                "base-uri 'self'; "
                "form-action 'self'; "
                "frame-ancestors 'none'"
            ),
            "Permissions-Policy": (
                "accelerometer=(), "
                "camera=(), "
                "geolocation=(), "
                "gyroscope=(), "
                "magnetometer=(), "
                "microphone=(), "
                "payment=(), "
                "usb=()"
            )
        })
        
        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log security-relevant requests"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request details
        client_ip = request.client.host
        method = request.method
        path = request.url.path
        user_agent = request.headers.get("user-agent", "")
        
        logger.info(
            f"Request: {method} {path} from {client_ip} "
            f"UA: {user_agent[:50]}..."
        )
        
        # Check for suspicious patterns
        suspicious_patterns = [
            "../", "..\\", "%2e%2e", "union select", "drop table",
            "<script", "javascript:", "onclick=", "onerror=",
            "/etc/passwd", "/proc/", "cmd.exe", "powershell"
        ]
        
        path_lower = path.lower()
        query_lower = str(request.query_params).lower()
        
        for pattern in suspicious_patterns:
            if pattern in path_lower or pattern in query_lower:
                logger.warning(
                    f"Suspicious request pattern detected: {pattern} "
                    f"from {client_ip} - {method} {path}"
                )
                break
        
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(
            f"Response: {response.status_code} for {method} {path} "
            f"in {process_time:.3f}s"
        )
        
        # Log failed auth attempts
        if response.status_code == 401:
            logger.warning(f"Authentication failure from {client_ip} - {method} {path}")
        elif response.status_code == 403:
            logger.warning(f"Authorization failure from {client_ip} - {method} {path}")
        
        return response

def add_security_middleware(app):
    """Add all security middleware to the FastAPI app"""
    # Order is important - headers should be last to ensure they're added
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(RateLimitMiddleware)
