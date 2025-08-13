from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class SkillLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"
    expert = "expert"

class SkillStatus(str, Enum):
    pending = "pending"
    certified = "certified"
    expired = "expired"
    revoked = "revoked"

class RequestStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

# Base Skill Schemas
class SkillBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=50)
    level: SkillLevel
    description: Optional[str] = None
    status: str = "active"

class SkillCreate(SkillBase):
    makerspace_id: str
    prerequisite_ids: List[str] = []
    equipment_ids: List[str] = []

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    level: Optional[SkillLevel] = None
    description: Optional[str] = None
    status: Optional[str] = None
    prerequisite_ids: Optional[List[str]] = None
    equipment_ids: Optional[List[str]] = None

class Skill(SkillBase):
    id: str
    makerspace_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SkillWithRelations(Skill):
    prerequisites: List[Skill] = []
    equipment_ids: List[str] = []
    user_count: int = 0  # Number of users with this skill

# User Skill Schemas
class UserSkillBase(BaseModel):
    status: SkillStatus = SkillStatus.pending
    notes: Optional[str] = None
    quiz_score: Optional[str] = None

class UserSkillCreate(UserSkillBase):
    user_id: str
    skill_id: str
    certified_by: Optional[str] = None

class UserSkillUpdate(BaseModel):
    status: Optional[SkillStatus] = None
    notes: Optional[str] = None
    quiz_score: Optional[str] = None
    certified_by: Optional[str] = None
    expires_at: Optional[datetime] = None

class UserSkill(UserSkillBase):
    id: str
    user_id: str
    skill_id: str
    certified_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    certified_by: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserSkillWithDetails(UserSkill):
    skill_name: str
    skill_category: str
    skill_level: SkillLevel
    user_name: str
    user_email: str
    certifier_name: Optional[str] = None

# Skill Request Schemas
class SkillRequestBase(BaseModel):
    reason: Optional[str] = None
    notes: Optional[str] = None

class SkillRequestCreate(SkillRequestBase):
    skill_id: str

class SkillRequestUpdate(BaseModel):
    status: Optional[RequestStatus] = None
    notes: Optional[str] = None
    reviewed_by: Optional[str] = None

class SkillRequest(SkillRequestBase):
    id: str
    user_id: str
    skill_id: str
    status: RequestStatus
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SkillRequestWithDetails(SkillRequest):
    skill_name: str
    skill_category: str
    skill_level: SkillLevel
    user_name: str
    user_email: str
    reviewer_name: Optional[str] = None

# Equipment Skill Requirements
class EquipmentSkillRequirement(BaseModel):
    skill_id: str
    skill_name: str
    skill_level: SkillLevel
    required_level: SkillLevel
    category: str
    is_required: bool = True

class EquipmentSkillRequirements(BaseModel):
    equipment_id: str
    equipment_name: str
    required_skills: List[EquipmentSkillRequirement]

# User Skill Summary
class UserSkillSummary(BaseModel):
    user_id: str
    user_name: str
    user_email: str
    total_skills: int
    certified_skills: int
    pending_skills: int
    expired_skills: int
    accessible_equipment_count: int
    skills: List[UserSkillWithDetails] = []

# Skill Analytics
class SkillAnalytics(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    level: SkillLevel
    total_requests: int
    pending_requests: int
    certified_users: int
    success_rate: float
    avg_approval_time_days: Optional[float] = None

class MakerspaceSkillOverview(BaseModel):
    makerspace_id: str
    makerspace_name: str
    total_skills: int
    total_certified_users: int
    total_pending_requests: int
    skill_distribution: Dict[str, int]  # category -> count
    level_distribution: Dict[str, int]  # level -> count
    skills: List[SkillAnalytics] = []

# Access Control
class EquipmentAccessCheck(BaseModel):
    equipment_id: str
    equipment_name: str
    can_access: bool
    missing_skills: List[str] = []
    reason: Optional[str] = None
    user_skills: List[str] = []  # Skills the user has for this equipment

class BulkAccessCheck(BaseModel):
    user_id: str
    equipment_access: List[EquipmentAccessCheck]
    summary: Dict[str, Any]  # Total accessible, total equipment, etc.

# Audit Log
class SkillAuditLog(BaseModel):
    id: str
    action: str
    user_id: str
    skill_id: str
    performed_by: Optional[str] = None
    reason: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class SkillAuditLogWithDetails(SkillAuditLog):
    user_name: str
    skill_name: str
    performer_name: Optional[str] = None
