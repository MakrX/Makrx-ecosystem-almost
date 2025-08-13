from sqlalchemy import Column, String, DateTime, JSON, Text, Boolean, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..database import Base

class CollaborationMessage(Base):
    __tablename__ = "collaboration_messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    message = Column(Text, nullable=False)
    message_type = Column(String, default="message")  # message, system, annotation
    metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="collaboration_messages")

class DocumentVersion(Base):
    __tablename__ = "document_versions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, nullable=False, index=True)
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(String, nullable=False)
    author_name = Column(String, nullable=False)
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    project = relationship("Project")

class WhiteboardAction(Base):
    __tablename__ = "whiteboard_actions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    action_type = Column(String, nullable=False)  # draw, erase, shape, text, note
    action_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    project = relationship("Project")

class UserPresence(Base):
    __tablename__ = "user_presence"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    user_name = Column(String, nullable=False)
    status = Column(String, default="active")  # active, idle, away
    current_view = Column(String)  # overview, team, bom, equipment, files, activity, whiteboard, documents
    current_editing = Column(String)  # element being edited
    cursor_position = Column(JSON)  # {x: number, y: number, element?: string}
    last_seen = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project")

class DocumentLock(Base):
    __tablename__ = "document_locks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, nullable=False, index=True)
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=False, index=True)
    locked_by = Column(String, nullable=False)
    locked_by_name = Column(String, nullable=False)
    locked_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)  # Auto-unlock after certain time
    
    # Relationships
    project = relationship("Project")

class CollaborationSession(Base):
    __tablename__ = "collaboration_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=False, index=True)
    session_type = Column(String, nullable=False)  # video_call, screen_share, whiteboard_session
    started_by = Column(String, nullable=False)
    started_by_name = Column(String, nullable=False)
    participants = Column(JSON, default=list)  # List of participant user_ids
    session_data = Column(JSON, default=dict)  # Session-specific data
    is_active = Column(Boolean, default=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime)
    
    # Relationships
    project = relationship("Project")

class ProjectComment(Base):
    __tablename__ = "project_comments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=False, index=True)
    parent_id = Column(String, ForeignKey("project_comments.id"))  # For nested comments
    user_id = Column(String, nullable=False, index=True)
    user_name = Column(String, nullable=False)
    comment = Column(Text, nullable=False)
    element_id = Column(String)  # ID of element being commented on
    element_type = Column(String)  # bom_item, milestone, file, etc.
    position = Column(JSON)  # Position on whiteboard/document
    is_resolved = Column(Boolean, default=False)
    resolved_by = Column(String)
    resolved_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project")
    parent_comment = relationship("ProjectComment", remote_side=[id])
    child_comments = relationship("ProjectComment", back_populates="parent_comment")

class RealTimeEdit(Base):
    __tablename__ = "realtime_edits"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=False, index=True)
    element_id = Column(String, nullable=False, index=True)  # ID of element being edited
    element_type = Column(String, nullable=False)  # bom, milestone, document, etc.
    user_id = Column(String, nullable=False, index=True)
    user_name = Column(String, nullable=False)
    edit_type = Column(String, nullable=False)  # focus, blur, change
    edit_data = Column(JSON)  # Additional edit data
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    project = relationship("Project")

class SharedFile(Base):
    __tablename__ = "shared_files"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=False, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_url = Column(String, nullable=False)
    content_type = Column(String)
    description = Column(Text)
    
    # Collaboration features
    is_collaborative = Column(Boolean, default=False)  # Can be edited collaboratively
    current_editor = Column(String)  # User currently editing
    edit_session_id = Column(String)  # Session ID for collaborative editing
    last_edited_at = Column(DateTime)
    
    # Access control
    is_public = Column(Boolean, default=False)
    access_level = Column(String, default="team")  # team, project, public
    
    # Versioning
    version = Column(String, default="1.0")
    previous_version_id = Column(String, ForeignKey("shared_files.id"))
    
    # Metadata
    uploaded_by = Column(String, nullable=False)
    uploaded_by_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project")
    previous_version = relationship("SharedFile", remote_side=[id])

# Add collaboration relationships to Project model
def add_collaboration_relationships():
    """Add collaboration relationships to existing Project model"""
    from .projects import Project
    
    if not hasattr(Project, 'collaboration_messages'):
        Project.collaboration_messages = relationship("CollaborationMessage", back_populates="project")
    
    if not hasattr(Project, 'whiteboard_actions'):
        Project.whiteboard_actions = relationship("WhiteboardAction", back_populates="project")
    
    if not hasattr(Project, 'document_versions'):
        Project.document_versions = relationship("DocumentVersion", back_populates="project")
    
    if not hasattr(Project, 'user_presence'):
        Project.user_presence = relationship("UserPresence", back_populates="project")
    
    if not hasattr(Project, 'collaboration_sessions'):
        Project.collaboration_sessions = relationship("CollaborationSession", back_populates="project")
    
    if not hasattr(Project, 'project_comments'):
        Project.project_comments = relationship("ProjectComment", back_populates="project")
