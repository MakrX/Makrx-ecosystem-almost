import json
import logging
import secrets
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional

from .helpers import get_request_context

security_logger = logging.getLogger("security_events")


class SecurityEventType(str, Enum):
    """Supported security event types."""
    ADMIN_OVERRIDE = "admin_override"
    ROLE_GRANT = "role_grant"
    PERMISSION_DENIED = "permission_denied"


def log_security_event(
    event_type: SecurityEventType,
    user_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> None:
    """Log a structured security event."""
    context = get_request_context()
    event = {
        "event_id": secrets.token_urlsafe(8),
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type.value,
        "user_id": user_id or context.get("sub"),
        "request_id": context.get("request_id"),
    }
    if details:
        event["details"] = details
    security_logger.info(json.dumps(event))
