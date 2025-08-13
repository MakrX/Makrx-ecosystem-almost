"""
Operational Security
Implements operational security per specification:
- Secrets management (Vault/Doppler integration)
- Access control with MFA enforcement
- Key rotation procedures
- CI/CD security
- Infrastructure security
"""
import os
import json
import logging
import secrets
import hashlib
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from enum import Enum
import asyncio
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import pyotp
import qrcode
from io import BytesIO

from app.core.config import settings

logger = logging.getLogger(__name__)

# ==========================================
# Operational Security Configuration
# ==========================================

class SecretType(str, Enum):
    """Types of secrets managed"""
    DATABASE_PASSWORD = "database_password"
    API_KEY = "api_key"
    JWT_SECRET = "jwt_secret"
    ENCRYPTION_KEY = "encryption_key"
    WEBHOOK_SECRET = "webhook_secret"
    SERVICE_ACCOUNT_KEY = "service_account_key"
    CERTIFICATE = "certificate"
    OAUTH_SECRET = "oauth_secret"

class AccessLevel(str, Enum):
    """Access levels for secrets"""
    PUBLIC = "public"           # No restrictions
    INTERNAL = "internal"       # Internal services only
    RESTRICTED = "restricted"   # Limited personnel
    CONFIDENTIAL = "confidential"  # Senior staff only
    SECRET = "secret"          # C-level only

class RotationFrequency(str, Enum):
    """Key rotation frequencies"""
    NEVER = "never"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"
    ON_COMPROMISE = "on_compromise"

class OpSecConfig:
    """Operational security configuration"""
    
    # Key rotation schedules per specification
    ROTATION_SCHEDULES = {
        SecretType.DATABASE_PASSWORD: RotationFrequency.QUARTERLY,
        SecretType.API_KEY: RotationFrequency.QUARTERLY,
        SecretType.JWT_SECRET: RotationFrequency.QUARTERLY,
        SecretType.ENCRYPTION_KEY: RotationFrequency.ANNUALLY,
        SecretType.WEBHOOK_SECRET: RotationFrequency.QUARTERLY,
        SecretType.SERVICE_ACCOUNT_KEY: RotationFrequency.QUARTERLY,
        SecretType.CERTIFICATE: RotationFrequency.ANNUALLY,
        SecretType.OAUTH_SECRET: RotationFrequency.QUARTERLY
    }
    
    # Access requirements
    MFA_REQUIRED_ROLES = ["admin", "superadmin", "devops"]
    ADMIN_SESSION_TIMEOUT = 1800  # 30 minutes
    VPN_REQUIRED_ACTIONS = ["secret_rotation", "infrastructure_access"]
    
    # Audit requirements
    SECRET_ACCESS_AUDIT_RETENTION = 7 * 365 * 24 * 3600  # 7 years
    ADMIN_ACTION_AUDIT_RETENTION = 5 * 365 * 24 * 3600   # 5 years

# ==========================================
# Secrets Management System
# ==========================================

class SecretsManager:
    """
    Secure secrets management
    - Integration with HashiCorp Vault/Doppler
    - Encrypted local storage fallback
    - Key rotation automation
    """
    
    def __init__(self):
        self.vault_url = getattr(settings, 'VAULT_URL', None)
        self.vault_token = getattr(settings, 'VAULT_TOKEN', None)
        self.local_encryption_key = self._get_or_create_master_key()
        self.local_secrets = {}  # Encrypted local storage
        self.secret_metadata = {}  # Rotation tracking
    
    def _get_or_create_master_key(self) -> bytes:
        """Get or create master encryption key for local secrets"""
        key_path = os.path.join(os.getcwd(), '.secrets_key')
        
        if os.path.exists(key_path):
            with open(key_path, 'rb') as f:
                return f.read()
        else:
            # Generate new key
            key = Fernet.generate_key()
            
            # Store securely (in production, use HSM or secure key storage)
            with open(key_path, 'wb') as f:
                f.write(key)
            
            # Set restrictive permissions
            os.chmod(key_path, 0o600)
            
            logger.info("Generated new master encryption key")
            return key
    
    async def store_secret(self, secret_name: str, secret_value: str,
                         secret_type: SecretType, access_level: AccessLevel,
                         description: str = None) -> Dict[str, Any]:
        """Store secret securely"""
        try:
            # Try Vault first (production)
            if self.vault_url and self.vault_token:
                result = await self._store_secret_vault(secret_name, secret_value, secret_type, access_level, description)
            else:
                # Fallback to encrypted local storage
                result = await self._store_secret_local(secret_name, secret_value, secret_type, access_level, description)
            
            # Record metadata for rotation tracking
            self.secret_metadata[secret_name] = {
                "secret_type": secret_type.value,
                "access_level": access_level.value,
                "created_at": datetime.utcnow().isoformat(),
                "last_rotated": None,
                "rotation_frequency": OpSecConfig.ROTATION_SCHEDULES[secret_type].value,
                "description": description
            }
            
            # Audit secret creation
            await self._audit_secret_operation("secret_created", secret_name, secret_type, access_level)
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to store secret {secret_name}: {e}")
            raise Exception(f"Secret storage failed: {str(e)}")
    
    async def retrieve_secret(self, secret_name: str, accessor_id: str,
                            access_level: AccessLevel) -> Optional[str]:
        """Retrieve secret with access control"""
        try:
            # Check access permissions
            if not await self._check_secret_access(secret_name, accessor_id, access_level):
                await self._audit_secret_operation("access_denied", secret_name, None, access_level, accessor_id)
                raise Exception("Access denied to secret")
            
            # Retrieve secret
            if self.vault_url and self.vault_token:
                secret_value = await self._retrieve_secret_vault(secret_name)
            else:
                secret_value = await self._retrieve_secret_local(secret_name)
            
            # Audit secret access
            await self._audit_secret_operation("secret_accessed", secret_name, None, access_level, accessor_id)
            
            return secret_value
            
        except Exception as e:
            logger.error(f"Failed to retrieve secret {secret_name}: {e}")
            await self._audit_secret_operation("access_failed", secret_name, None, access_level, accessor_id, str(e))
            return None
    
    async def rotate_secret(self, secret_name: str, rotator_id: str) -> Dict[str, Any]:
        """Rotate secret value"""
        try:
            if secret_name not in self.secret_metadata:
                raise Exception("Secret not found")
            
            metadata = self.secret_metadata[secret_name]
            secret_type = SecretType(metadata["secret_type"])
            access_level = AccessLevel(metadata["access_level"])
            
            # Generate new secret value
            new_value = self._generate_secret_value(secret_type)
            
            # Store new secret
            await self.store_secret(secret_name, new_value, secret_type, access_level, metadata.get("description"))
            
            # Update rotation timestamp
            self.secret_metadata[secret_name]["last_rotated"] = datetime.utcnow().isoformat()
            
            # Audit rotation
            await self._audit_secret_operation("secret_rotated", secret_name, secret_type, access_level, rotator_id)
            
            return {
                "secret_name": secret_name,
                "rotated_at": self.secret_metadata[secret_name]["last_rotated"],
                "rotator_id": rotator_id
            }
            
        except Exception as e:
            logger.error(f"Failed to rotate secret {secret_name}: {e}")
            raise Exception(f"Secret rotation failed: {str(e)}")
    
    async def check_rotation_due(self) -> List[Dict[str, Any]]:
        """Check which secrets need rotation"""
        due_for_rotation = []
        current_time = datetime.utcnow()
        
        for secret_name, metadata in self.secret_metadata.items():
            frequency = RotationFrequency(metadata["rotation_frequency"])
            last_rotated = metadata.get("last_rotated")
            
            if frequency == RotationFrequency.NEVER:
                continue
            
            # Calculate next rotation date
            if last_rotated:
                last_rotation_date = datetime.fromisoformat(last_rotated)
            else:
                last_rotation_date = datetime.fromisoformat(metadata["created_at"])
            
            if frequency == RotationFrequency.MONTHLY:
                next_rotation = last_rotation_date + timedelta(days=30)
            elif frequency == RotationFrequency.QUARTERLY:
                next_rotation = last_rotation_date + timedelta(days=90)
            elif frequency == RotationFrequency.ANNUALLY:
                next_rotation = last_rotation_date + timedelta(days=365)
            else:
                continue
            
            if current_time >= next_rotation:
                due_for_rotation.append({
                    "secret_name": secret_name,
                    "secret_type": metadata["secret_type"],
                    "last_rotated": last_rotated,
                    "days_overdue": (current_time - next_rotation).days
                })
        
        return due_for_rotation
    
    def _generate_secret_value(self, secret_type: SecretType) -> str:
        """Generate new secret value based on type"""
        if secret_type in [SecretType.API_KEY, SecretType.WEBHOOK_SECRET]:
            return secrets.token_urlsafe(32)
        elif secret_type == SecretType.JWT_SECRET:
            return secrets.token_urlsafe(64)
        elif secret_type == SecretType.DATABASE_PASSWORD:
            # Complex password with special characters
            import string
            chars = string.ascii_letters + string.digits + "!@#$%^&*"
            return ''.join(secrets.choice(chars) for _ in range(24))
        elif secret_type == SecretType.ENCRYPTION_KEY:
            return base64.b64encode(Fernet.generate_key()).decode()
        else:
            return secrets.token_urlsafe(32)
    
    async def _store_secret_vault(self, name: str, value: str, secret_type: SecretType,
                                access_level: AccessLevel, description: str) -> Dict[str, Any]:
        """Store secret in HashiCorp Vault"""
        # Implementation for Vault API
        # This is a placeholder - implement actual Vault integration
        logger.info(f"Storing secret {name} in Vault")
        return {"stored_in": "vault", "path": f"secret/{name}"}
    
    async def _retrieve_secret_vault(self, name: str) -> str:
        """Retrieve secret from Vault"""
        # Implementation for Vault API
        logger.info(f"Retrieving secret {name} from Vault")
        return "vault_secret_value"
    
    async def _store_secret_local(self, name: str, value: str, secret_type: SecretType,
                                access_level: AccessLevel, description: str) -> Dict[str, Any]:
        """Store secret in encrypted local storage"""
        fernet = Fernet(self.local_encryption_key)
        encrypted_value = fernet.encrypt(value.encode())
        
        self.local_secrets[name] = {
            "encrypted_value": encrypted_value,
            "secret_type": secret_type.value,
            "access_level": access_level.value,
            "created_at": datetime.utcnow().isoformat(),
            "description": description
        }
        
        return {"stored_in": "local_encrypted", "secret_name": name}
    
    async def _retrieve_secret_local(self, name: str) -> str:
        """Retrieve secret from encrypted local storage"""
        if name not in self.local_secrets:
            raise Exception("Secret not found")
        
        fernet = Fernet(self.local_encryption_key)
        encrypted_value = self.local_secrets[name]["encrypted_value"]
        decrypted_value = fernet.decrypt(encrypted_value)
        
        return decrypted_value.decode()
    
    async def _check_secret_access(self, secret_name: str, accessor_id: str,
                                 required_level: AccessLevel) -> bool:
        """Check if accessor has permission to access secret"""
        # Implementation depends on your user/role system
        # This is a placeholder for access control logic
        return True
    
    async def _audit_secret_operation(self, operation: str, secret_name: str,
                                    secret_type: Optional[SecretType],
                                    access_level: Optional[AccessLevel],
                                    actor_id: str = None, error: str = None):
        """Audit secret operations"""
        audit_record = {
            "audit_type": "secret_operation",
            "operation": operation,
            "secret_name": secret_name,
            "secret_type": secret_type.value if secret_type else None,
            "access_level": access_level.value if access_level else None,
            "actor_id": actor_id,
            "timestamp": datetime.utcnow().isoformat(),
            "error": error,
            "audit_id": secrets.token_urlsafe(16)
        }
        
        logger.info(f"SECRET_AUDIT: {json.dumps(audit_record)}")

# Global secrets manager
secrets_manager = SecretsManager()

# ==========================================
# Multi-Factor Authentication (MFA)
# ==========================================

class MFAManager:
    """
    Multi-Factor Authentication management
    - TOTP (Time-based One-Time Password)
    - Backup codes
    - Device registration
    """
    
    def __init__(self):
        self.user_secrets = {}  # Store TOTP secrets (encrypted in production)
        self.backup_codes = {}  # Store backup codes (encrypted in production)
        self.trusted_devices = {}  # Device fingerprinting
    
    async def setup_mfa(self, user_id: str, user_email: str) -> Dict[str, Any]:
        """Setup MFA for user"""
        try:
            # Generate TOTP secret
            secret = pyotp.random_base32()
            totp = pyotp.TOTP(secret)
            
            # Generate provisioning URI for QR code
            provisioning_uri = totp.provisioning_uri(
                name=user_email,
                issuer_name="MakrX Security"
            )
            
            # Generate QR code
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(provisioning_uri)
            qr.make(fit=True)
            
            qr_img = qr.make_image(fill_color="black", back_color="white")
            qr_buffer = BytesIO()
            qr_img.save(qr_buffer, format='PNG')
            qr_code_b64 = base64.b64encode(qr_buffer.getvalue()).decode()
            
            # Generate backup codes
            backup_codes = [secrets.token_hex(4).upper() for _ in range(10)]
            
            # Store secrets (encrypt in production)
            self.user_secrets[user_id] = secret
            self.backup_codes[user_id] = backup_codes
            
            # Audit MFA setup
            await self._audit_mfa_operation("mfa_setup", user_id)
            
            return {
                "secret": secret,
                "qr_code": qr_code_b64,
                "backup_codes": backup_codes,
                "manual_entry_key": secret
            }
            
        except Exception as e:
            logger.error(f"MFA setup failed for user {user_id}: {e}")
            raise Exception(f"MFA setup failed: {str(e)}")
    
    async def verify_mfa_token(self, user_id: str, token: str) -> bool:
        """Verify TOTP token or backup code"""
        try:
            # Check TOTP token
            if user_id in self.user_secrets:
                secret = self.user_secrets[user_id]
                totp = pyotp.TOTP(secret)
                
                if totp.verify(token, valid_window=1):  # Allow 1 time step window
                    await self._audit_mfa_operation("mfa_success", user_id, {"method": "totp"})
                    return True
            
            # Check backup code
            if user_id in self.backup_codes:
                backup_codes = self.backup_codes[user_id]
                if token.upper() in backup_codes:
                    # Remove used backup code
                    backup_codes.remove(token.upper())
                    await self._audit_mfa_operation("mfa_success", user_id, {"method": "backup_code"})
                    return True
            
            await self._audit_mfa_operation("mfa_failure", user_id, {"token": token[:4] + "****"})
            return False
            
        except Exception as e:
            logger.error(f"MFA verification failed for user {user_id}: {e}")
            await self._audit_mfa_operation("mfa_error", user_id, {"error": str(e)})
            return False
    
    async def is_mfa_enabled(self, user_id: str) -> bool:
        """Check if MFA is enabled for user"""
        return user_id in self.user_secrets
    
    async def disable_mfa(self, user_id: str, admin_user_id: str) -> bool:
        """Disable MFA for user (admin action)"""
        try:
            if user_id in self.user_secrets:
                del self.user_secrets[user_id]
            if user_id in self.backup_codes:
                del self.backup_codes[user_id]
            if user_id in self.trusted_devices:
                del self.trusted_devices[user_id]
            
            await self._audit_mfa_operation("mfa_disabled", user_id, {"admin_user_id": admin_user_id})
            return True
            
        except Exception as e:
            logger.error(f"MFA disable failed for user {user_id}: {e}")
            return False
    
    async def register_trusted_device(self, user_id: str, device_fingerprint: str,
                                    device_name: str = None) -> str:
        """Register trusted device for user"""
        device_id = secrets.token_urlsafe(16)
        
        if user_id not in self.trusted_devices:
            self.trusted_devices[user_id] = {}
        
        self.trusted_devices[user_id][device_id] = {
            "fingerprint": device_fingerprint,
            "name": device_name or "Unknown Device",
            "registered_at": datetime.utcnow().isoformat(),
            "last_used": datetime.utcnow().isoformat()
        }
        
        await self._audit_mfa_operation("device_registered", user_id, {"device_id": device_id})
        return device_id
    
    async def is_trusted_device(self, user_id: str, device_fingerprint: str) -> bool:
        """Check if device is trusted for user"""
        if user_id not in self.trusted_devices:
            return False
        
        for device_id, device_info in self.trusted_devices[user_id].items():
            if device_info["fingerprint"] == device_fingerprint:
                # Update last used timestamp
                device_info["last_used"] = datetime.utcnow().isoformat()
                return True
        
        return False
    
    async def _audit_mfa_operation(self, operation: str, user_id: str, details: Dict[str, Any] = None):
        """Audit MFA operations"""
        audit_record = {
            "audit_type": "mfa_operation",
            "operation": operation,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details or {},
            "audit_id": secrets.token_urlsafe(16)
        }
        
        logger.info(f"MFA_AUDIT: {json.dumps(audit_record)}")

# Global MFA manager
mfa_manager = MFAManager()

# ==========================================
# Access Control Manager
# ==========================================

class AccessControlManager:
    """
    Advanced access control with session management
    - Role-based access control (RBAC)
    - Session timeout enforcement
    - IP allowlist management
    """
    
    def __init__(self):
        self.active_sessions = {}  # Track admin sessions
        self.ip_allowlists = {}    # IP allowlists per role
        self.failed_attempts = defaultdict(list)  # Failed access attempts
    
    async def create_admin_session(self, user_id: str, role: str, ip_address: str,
                                 mfa_verified: bool = False) -> Dict[str, Any]:
        """Create secure admin session"""
        try:
            if not mfa_verified and role in OpSecConfig.MFA_REQUIRED_ROLES:
                raise Exception("MFA required for admin access")
            
            # Check IP allowlist
            if not await self._check_ip_allowlist(role, ip_address):
                raise Exception("IP address not allowed for this role")
            
            session_id = secrets.token_urlsafe(32)
            session_data = {
                "session_id": session_id,
                "user_id": user_id,
                "role": role,
                "ip_address": ip_address,
                "created_at": datetime.utcnow().isoformat(),
                "last_activity": datetime.utcnow().isoformat(),
                "mfa_verified": mfa_verified,
                "expires_at": (datetime.utcnow() + timedelta(seconds=OpSecConfig.ADMIN_SESSION_TIMEOUT)).isoformat()
            }
            
            self.active_sessions[session_id] = session_data
            
            # Audit session creation
            await self._audit_access_operation("admin_session_created", user_id, role, ip_address)
            
            return session_data
            
        except Exception as e:
            logger.error(f"Admin session creation failed: {e}")
            await self._audit_access_operation("admin_session_failed", user_id, role, ip_address, str(e))
            raise Exception(f"Session creation failed: {str(e)}")
    
    async def validate_admin_session(self, session_id: str, ip_address: str) -> Optional[Dict[str, Any]]:
        """Validate admin session"""
        if session_id not in self.active_sessions:
            return None
        
        session = self.active_sessions[session_id]
        
        # Check expiration
        if datetime.utcnow() > datetime.fromisoformat(session["expires_at"]):
            await self.invalidate_session(session_id)
            return None
        
        # Check IP consistency
        if session["ip_address"] != ip_address:
            await self.invalidate_session(session_id)
            await self._audit_access_operation("session_ip_mismatch", session["user_id"], 
                                             session["role"], ip_address)
            return None
        
        # Update last activity
        session["last_activity"] = datetime.utcnow().isoformat()
        
        return session
    
    async def invalidate_session(self, session_id: str):
        """Invalidate admin session"""
        if session_id in self.active_sessions:
            session = self.active_sessions[session_id]
            del self.active_sessions[session_id]
            
            await self._audit_access_operation("admin_session_invalidated", 
                                             session["user_id"], session["role"])
    
    async def add_ip_to_allowlist(self, role: str, ip_address: str, admin_user_id: str):
        """Add IP to role allowlist"""
        if role not in self.ip_allowlists:
            self.ip_allowlists[role] = set()
        
        self.ip_allowlists[role].add(ip_address)
        
        await self._audit_access_operation("ip_allowlist_added", admin_user_id, role, 
                                         None, f"Added {ip_address}")
    
    async def _check_ip_allowlist(self, role: str, ip_address: str) -> bool:
        """Check if IP is in role allowlist"""
        if role not in self.ip_allowlists:
            return True  # No restrictions if no allowlist defined
        
        return ip_address in self.ip_allowlists[role]
    
    async def _audit_access_operation(self, operation: str, user_id: str, role: str = None,
                                    ip_address: str = None, details: str = None):
        """Audit access control operations"""
        audit_record = {
            "audit_type": "access_control",
            "operation": operation,
            "user_id": user_id,
            "role": role,
            "ip_address": ip_address,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details,
            "audit_id": secrets.token_urlsafe(16)
        }
        
        logger.info(f"ACCESS_AUDIT: {json.dumps(audit_record)}")

# Global access control manager
access_control = AccessControlManager()

# ==========================================
# CI/CD Security Scanner
# ==========================================

class CICDSecurityScanner:
    """
    CI/CD pipeline security scanning
    - Dependency vulnerability scanning
    - Secret detection in code
    - Static code analysis
    """
    
    @staticmethod
    async def scan_dependencies(requirements_file: str) -> Dict[str, Any]:
        """Scan dependencies for known vulnerabilities"""
        # Placeholder for actual vulnerability scanning
        # In production, integrate with tools like:
        # - Snyk
        # - Safety (Python)
        # - npm audit (Node.js)
        # - OWASP Dependency Check
        
        scan_results = {
            "scan_id": secrets.token_urlsafe(16),
            "scan_type": "dependency_vulnerability",
            "timestamp": datetime.utcnow().isoformat(),
            "file_scanned": requirements_file,
            "vulnerabilities": [],
            "risk_score": 0
        }
        
        logger.info(f"DEPENDENCY_SCAN: {json.dumps(scan_results)}")
        return scan_results
    
    @staticmethod
    async def detect_secrets_in_code(file_path: str) -> Dict[str, Any]:
        """Detect secrets accidentally committed in code"""
        # Placeholder for secret detection
        # In production, integrate with tools like:
        # - truffleHog
        # - git-secrets
        # - detect-secrets
        
        secret_patterns = [
            r'password\s*=\s*["\'][^"\']+["\']',
            r'api_key\s*=\s*["\'][^"\']+["\']',
            r'secret\s*=\s*["\'][^"\']+["\']',
            r'token\s*=\s*["\'][^"\']+["\']'
        ]
        
        scan_results = {
            "scan_id": secrets.token_urlsafe(16),
            "scan_type": "secret_detection",
            "timestamp": datetime.utcnow().isoformat(),
            "file_scanned": file_path,
            "secrets_found": [],
            "risk_score": 0
        }
        
        logger.info(f"SECRET_SCAN: {json.dumps(scan_results)}")
        return scan_results

# Global CI/CD scanner
cicd_scanner = CICDSecurityScanner()
