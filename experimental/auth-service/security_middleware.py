"""
Security Middleware for Auth Service
Rate limiting, input validation, and security headers
"""

import asyncio
import time
from collections import defaultdict
from typing import Dict, Any
from fastapi import Request, Response, HTTPException, status
from fastapi.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware to prevent brute force attacks"""
    
    def __init__(self, app, calls: int = 100, period: int = 3600):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.clients = defaultdict(list)
        
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host
        
        # Clean old entries
        now = time.time()
        self.clients[client_ip] = [
            call_time for call_time in self.clients[client_ip]
            if now - call_time < self.period
        ]
        
        # Check rate limit
        if len(self.clients[client_ip]) >= self.calls:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later."
            )
        
        # Record this call
        self.clients[client_ip].append(now)
        
        # Process request
        response = await call_next(request)
        return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https:; "
            "font-src 'self'; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
        
        return response

def sanitize_input(data: Any) -> Any:
    """Sanitize input data to prevent XSS"""
    if isinstance(data, str):
        import html
        return html.escape(data.strip())
    elif isinstance(data, dict):
        return {key: sanitize_input(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    return data

class InputValidationMiddleware(BaseHTTPMiddleware):
    """Validate and sanitize all input data"""
    
    async def dispatch(self, request: Request, call_next):
        # Skip validation for GET requests and health checks
        if request.method == "GET" or request.url.path == "/health":
            return await call_next(request)
        
        # Read and validate request body if present
        if hasattr(request, "json"):
            try:
                body = await request.body()
                if body:
                    import json
                    try:
                        data = json.loads(body)
                        sanitized_data = sanitize_input(data)
                        
                        # Replace request body with sanitized data
                        request._body = json.dumps(sanitized_data).encode()
                    except (json.JSONDecodeError, UnicodeDecodeError):
                        # If JSON parsing fails, leave as-is
                        pass
            except Exception as e:
                logger.error(f"Input validation error: {e}")
        
        response = await call_next(request)
        return response
