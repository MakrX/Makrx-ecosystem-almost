from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class SkillLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class SkillStatus(str, enum.Enum):
    PENDING = "pending"
    CERTIFIED = "certified"
    EXPIRED = "expired"
    REVOKED = "revoked"

class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

# Association table for skill prerequisites
skill_prerequisites = Table(
    'skill_prerequisites',
    Base.metadata,
    Column('skill_id', String, ForeignKey('skills.id'), primary_key=True),
    Column('prerequisite_id', String, ForeignKey('skills.id'), primary_key=True)
)

# Association table for skill-equipment relationships
skill_equipment = Table(
    'skill_equipment',
    Base.metadata,
    Column('skill_id', String, ForeignKey('skills.id'), primary_key=True),
    Column('equipment_id', String, ForeignKey('equipment.id'), primary_key=True)
)

class Skill(Base):
    __tablename__ = "skills"

    id = Column(String, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    level = Column(Enum(SkillLevel), nullable=False)
    description = Column(Text)
    status = Column(String(20), default="active")  # active, disabled
    
    # Makerspace relationship
    makerspace_id = Column(String, ForeignKey("makerspaces.id"), nullable=False)
    makerspace = relationship("Makerspace", back_populates="skills")
    
    # Self-referential relationship for prerequisites
    prerequisites = relationship(
        "Skill",
        secondary=skill_prerequisites,
        primaryjoin=id == skill_prerequisites.c.skill_id,
        secondaryjoin=id == skill_prerequisites.c.prerequisite_id,
        back_populates="dependents"
    )
    
    dependents = relationship(
        "Skill",
        secondary=skill_prerequisites,
        primaryjoin=id == skill_prerequisites.c.prerequisite_id,
        secondaryjoin=id == skill_prerequisites.c.skill_id,
        back_populates="prerequisites"
    )
    
    # Equipment relationships
    equipment = relationship("Equipment", secondary=skill_equipment, back_populates="required_skills")
    
    # User skill relationships
    user_skills = relationship("UserSkill", back_populates="skill")
    
    # Skill requests
    skill_requests = relationship("SkillRequest", back_populates="skill")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(String, primary_key=True, index=True)
    
    # User relationship
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="skills")
    
    # Skill relationship
    skill_id = Column(String, ForeignKey("skills.id"), nullable=False)
    skill = relationship("Skill", back_populates="user_skills")
    
    # Certification details
    status = Column(Enum(SkillStatus), nullable=False, default=SkillStatus.PENDING)
    certified_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    
    # Who certified this skill
    certified_by = Column(String, ForeignKey("users.id"))
    certifier = relationship("User", foreign_keys=[certified_by])
    
    # Additional information
    notes = Column(Text)
    quiz_score = Column(String(10))  # Store as "85%" or "PASS"
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class SkillRequest(Base):
    __tablename__ = "skill_requests"

    id = Column(String, primary_key=True, index=True)
    
    # User requesting the skill
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="skill_requests")
    
    # Skill being requested
    skill_id = Column(String, ForeignKey("skills.id"), nullable=False)
    skill = relationship("Skill", back_populates="skill_requests")
    
    # Request details
    status = Column(Enum(RequestStatus), nullable=False, default=RequestStatus.PENDING)
    reason = Column(Text)  # Why they want this skill
    notes = Column(Text)   # User notes or admin feedback
    
    # Admin who processed the request
    reviewed_by = Column(String, ForeignKey("users.id"))
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    reviewed_at = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class SkillAuditLog(Base):
    __tablename__ = "skill_audit_logs"

    id = Column(String, primary_key=True, index=True)
    
    # What happened
    action = Column(String(50), nullable=False)  # granted, revoked, expired, requested
    
    # Who was affected
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    user = relationship("User")
    
    # Which skill
    skill_id = Column(String, ForeignKey("skills.id"), nullable=False)
    skill = relationship("Skill")
    
    # Who performed the action
    performed_by = Column(String, ForeignKey("users.id"))
    performer = relationship("User", foreign_keys=[performed_by])
    
    # Additional context
    reason = Column(Text)
    metadata = Column(Text)  # JSON string for additional data
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
