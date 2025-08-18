from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AuthError(BaseModel):
    """Standard authentication error response envelope."""

    error: str
    message: str
    code: str
    request_id: Optional[str] = None
    ts: datetime = Field(default_factory=datetime.utcnow)
