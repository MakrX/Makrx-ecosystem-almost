"""
Input Validation and Sanitization Module
Comprehensive security layer for preventing XSS, injection attacks, and data validation
"""

import re
import html
import bleach
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, validator
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)

class InputSanitizer:
    """Centralized input sanitization utilities"""
    
    # XSS prevention patterns
    XSS_PATTERNS = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'on\w+\s*=',
        r'<iframe[^>]*>.*?</iframe>',
        r'<object[^>]*>.*?</object>',
        r'<embed[^>]*>.*?</embed>',
        r'<applet[^>]*>.*?</applet>',
        r'<meta[^>]*>',
        r'<link[^>]*>',
        r'<style[^>]*>.*?</style>',
        r'expression\s*\(',
        r'url\s*\(',
        r'@import',
        r'vbscript:',
        r'data:text/html',
    ]
    
    # Path traversal patterns
    PATH_TRAVERSAL_PATTERNS = [
        r'\.\./\.\.',
        r'\.\.\\\.\.', 
        r'\.\./',
        r'\.\.\\',
        r'%2e%2e%2f',
        r'%2e%2e%5c',
        r'%252e%252e%252f',
        r'%c0%ae%c0%ae%c0%af',
        r'%c1%9c',
    ]
    
    # SQL injection patterns
    SQL_INJECTION_PATTERNS = [
        r'(\s|^)(union|select|insert|update|delete|drop|create|alter|exec|execute)(\s|$)',
        r'(\s|^)(or|and)\s+\d+\s*=\s*\d+',
        r'\'[^\']*\'(\s|$)',
        r'"[^"]*"(\s|$)',
        r'--',
        r'/\*.*\*/',
        r';',
        r'\|\|',
        r'&&',
    ]
    
    @classmethod
    def sanitize_html(cls, text: str, allowed_tags: List[str] = None) -> str:
        """Sanitize HTML content to prevent XSS"""
        if not text:
            return ""
        
        # Default allowed tags for basic formatting
        if allowed_tags is None:
            allowed_tags = ['b', 'i', 'u', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li']
        
        # Use bleach to clean HTML
        cleaned = bleach.clean(
            text,
            tags=allowed_tags,
            attributes={'*': ['class']},
            strip=True
        )
        
        return cleaned
    
    @classmethod
    def sanitize_text(cls, text: str) -> str:
        """Sanitize plain text input"""
        if not text:
            return ""
        
        # HTML escape
        sanitized = html.escape(text)
        
        # Remove potential XSS patterns
        for pattern in cls.XSS_PATTERNS:
            sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)
        
        return sanitized.strip()
    
    @classmethod
    def sanitize_filename(cls, filename: str) -> str:
        """Sanitize filename to prevent path traversal"""
        if not filename:
            return ""
        
        # Remove path traversal attempts
        sanitized = filename
        for pattern in cls.PATH_TRAVERSAL_PATTERNS:
            sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)
        
        # Remove dangerous characters
        sanitized = re.sub(r'[<>:"/\\|?*]', '', sanitized)
        
        # Remove leading/trailing dots and spaces
        sanitized = sanitized.strip('. ')
        
        # Limit length
        if len(sanitized) > 255:
            name, ext = sanitized.rsplit('.', 1) if '.' in sanitized else (sanitized, '')
            sanitized = name[:250] + ('.' + ext if ext else '')
        
        return sanitized
    
    @classmethod
    def detect_sql_injection(cls, text: str) -> bool:
        """Detect potential SQL injection attempts"""
        if not text:
            return False
        
        text_lower = text.lower()
        for pattern in cls.SQL_INJECTION_PATTERNS:
            if re.search(pattern, text_lower, flags=re.IGNORECASE):
                return True
        
        return False
    
    @classmethod
    def validate_email(cls, email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @classmethod
    def validate_phone(cls, phone: str) -> bool:
        """Validate phone number format"""
        # Remove all non-digit characters
        digits_only = re.sub(r'\D', '', phone)
        
        # Check if it's a valid length (10-15 digits)
        return len(digits_only) >= 10 and len(digits_only) <= 15
    
    @classmethod
    def validate_url(cls, url: str) -> bool:
        """Validate URL format"""
        pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        return bool(re.match(pattern, url))

class SecureBaseModel(BaseModel):
    """Base model with automatic input sanitization"""
    
    @validator('*', pre=True)
    def sanitize_strings(cls, v):
        """Automatically sanitize string inputs"""
        if isinstance(v, str):
            # Check for SQL injection attempts
            if InputSanitizer.detect_sql_injection(v):
                logger.warning(f"Potential SQL injection attempt detected: {v[:100]}...")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid input detected"
                )
            
            # Sanitize the input
            return InputSanitizer.sanitize_text(v)
        
        return v

class FileUploadValidator:
    """File upload security validation"""
    
    ALLOWED_EXTENSIONS = {
        'image': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
        'document': ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
        'model': ['.stl', '.obj', '.3mf', '.ply', '.gcode'],
        'archive': ['.zip', '.rar', '.7z', '.tar', '.gz'],
        'spreadsheet': ['.xls', '.xlsx', '.csv', '.ods']
    }
    
    DANGEROUS_EXTENSIONS = [
        '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
        '.msi', '.dll', '.scf', '.lnk', '.inf', '.reg', '.ps1', '.sh', '.php',
        '.asp', '.jsp', '.py', '.rb', '.pl'
    ]
    
    MAX_FILE_SIZES = {
        'image': 10 * 1024 * 1024,      # 10MB
        'document': 25 * 1024 * 1024,   # 25MB
        'model': 100 * 1024 * 1024,     # 100MB
        'archive': 50 * 1024 * 1024,    # 50MB
        'spreadsheet': 10 * 1024 * 1024  # 10MB
    }
    
    @classmethod
    def validate_file(cls, filename: str, content_type: str, file_size: int, file_category: str = 'document') -> Dict[str, Any]:
        """Comprehensive file validation"""
        errors = []
        
        # Sanitize filename
        safe_filename = InputSanitizer.sanitize_filename(filename)
        
        # Check file extension
        if '.' not in safe_filename:
            errors.append("File must have an extension")
        else:
            ext = safe_filename.lower().split('.')[-1]
            
            # Check for dangerous extensions
            if f'.{ext}' in cls.DANGEROUS_EXTENSIONS:
                errors.append("File type not allowed for security reasons")
            
            # Check against allowed extensions for category
            allowed = cls.ALLOWED_EXTENSIONS.get(file_category, [])
            if allowed and f'.{ext}' not in allowed:
                errors.append(f"File type .{ext} not allowed for {file_category} category")
        
        # Check file size
        max_size = cls.MAX_FILE_SIZES.get(file_category, 10 * 1024 * 1024)
        if file_size > max_size:
            errors.append(f"File size {file_size} exceeds maximum {max_size} bytes")
        
        # Validate content type
        if content_type and content_type.startswith('application/x-'):
            errors.append("Executable content type not allowed")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'safe_filename': safe_filename,
            'sanitized': safe_filename != filename
        }

# Common validation patterns
class ValidationPatterns:
    """Common validation patterns and rules"""
    
    USERNAME = r'^[a-zA-Z0-9_-]{3,30}$'
    PASSWORD = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
    ALPHANUMERIC = r'^[a-zA-Z0-9]+$'
    SLUG = r'^[a-z0-9-]+$'
    HEX_COLOR = r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
    UUID = r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    IP_ADDRESS = r'^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
    
    @classmethod
    def validate_pattern(cls, value: str, pattern: str, field_name: str = "field") -> bool:
        """Validate value against a regex pattern"""
        if not re.match(pattern, value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid {field_name} format"
            )
        return True

def validate_input_security(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Comprehensive input validation middleware
    Can be used as a dependency in FastAPI routes
    """
    sanitized_data = {}
    
    for key, value in data.items():
        if isinstance(value, str):
            # Check for malicious patterns
            if InputSanitizer.detect_sql_injection(value):
                logger.warning(f"SQL injection attempt in field {key}: {value[:100]}...")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid input in field {key}"
                )
            
            # Sanitize string values
            sanitized_data[key] = InputSanitizer.sanitize_text(value)
        
        elif isinstance(value, dict):
            # Recursively validate nested dictionaries
            sanitized_data[key] = validate_input_security(value)
        
        elif isinstance(value, list):
            # Validate list items
            sanitized_data[key] = [
                InputSanitizer.sanitize_text(item) if isinstance(item, str) 
                else validate_input_security(item) if isinstance(item, dict)
                else item
                for item in value
            ]
        
        else:
            # Keep non-string values as-is
            sanitized_data[key] = value
    
    return sanitized_data

# FastAPI dependency for automatic input validation
async def validate_request_input(data: Dict[str, Any]) -> Dict[str, Any]:
    """FastAPI dependency for input validation"""
    return validate_input_security(data)
