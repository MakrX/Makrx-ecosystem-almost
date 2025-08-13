from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from datetime import datetime

# Message schemas
class MessageBase(BaseModel):
    project_id: str
    message: str
    type: str = "message"
    metadata: Optional[Dict[str, Any]] = None

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Cursor and editing schemas
class CursorUpdate(BaseModel):
    project_id: str
    document_id: Optional[str] = None
    position: int
    selection_start: Optional[int] = None
    selection_end: Optional[int] = None

class EditingStatus(BaseModel):
    project_id: str
    element: Optional[str] = None
    is_editing: bool = True

# Document collaboration schemas
class DocumentChangeCreate(BaseModel):
    project_id: str
    document_id: str
    operation: str  # insert, delete, format
    position: int
    content: str

class DocumentVersionCreate(BaseModel):
    document_id: str
    project_id: str
    content: str
    comment: Optional[str] = None

class DocumentVersionResponse(BaseModel):
    id: str
    document_id: str
    project_id: str
    version_number: int
    content: str
    author_id: str
    author_name: str
    comment: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Whiteboard schemas
class WhiteboardActionCreate(BaseModel):
    project_id: str
    type: str  # draw, erase, shape, text, note
    data: Dict[str, Any]

class WhiteboardActionResponse(BaseModel):
    id: str
    project_id: str
    user_id: str
    action_type: str
    action_data: Dict[str, Any]
    created_at: datetime
    
    class Config:
        from_attributes = True

# User presence schemas
class UserPresenceUpdate(BaseModel):
    project_id: str
    status: str = "active"  # active, idle, away
    current_view: Optional[str] = None
    current_editing: Optional[str] = None
    cursor_position: Optional[Dict[str, Any]] = None

class UserPresenceResponse(BaseModel):
    id: str
    project_id: str
    user_id: str
    user_name: str
    status: str
    current_view: Optional[str] = None
    current_editing: Optional[str] = None
    cursor_position: Optional[Dict[str, Any]] = None
    last_seen: datetime
    
    class Config:
        from_attributes = True

# Collaboration session schemas
class CollaborationSessionCreate(BaseModel):
    project_id: str
    session_type: str  # video_call, screen_share, whiteboard_session
    session_data: Optional[Dict[str, Any]] = None

class CollaborationSessionResponse(BaseModel):
    id: str
    project_id: str
    session_type: str
    started_by: str
    started_by_name: str
    participants: List[str]
    session_data: Dict[str, Any]
    is_active: bool
    started_at: datetime
    ended_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Comment schemas
class ProjectCommentCreate(BaseModel):
    project_id: str
    parent_id: Optional[str] = None
    comment: str
    element_id: Optional[str] = None
    element_type: Optional[str] = None
    position: Optional[Dict[str, Any]] = None

class ProjectCommentResponse(BaseModel):
    id: str
    project_id: str
    parent_id: Optional[str] = None
    user_id: str
    user_name: str
    comment: str
    element_id: Optional[str] = None
    element_type: Optional[str] = None
    position: Optional[Dict[str, Any]] = None
    is_resolved: bool
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    child_comments: List["ProjectCommentResponse"] = []
    
    class Config:
        from_attributes = True

# File sharing schemas
class SharedFileCreate(BaseModel):
    project_id: str
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    file_url: str
    content_type: Optional[str] = None
    description: Optional[str] = None
    is_collaborative: bool = False
    is_public: bool = False
    access_level: str = "team"

class SharedFileResponse(BaseModel):
    id: str
    project_id: str
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    file_url: str
    content_type: Optional[str] = None
    description: Optional[str] = None
    is_collaborative: bool
    current_editor: Optional[str] = None
    edit_session_id: Optional[str] = None
    last_edited_at: Optional[datetime] = None
    is_public: bool
    access_level: str
    version: str
    uploaded_by: str
    uploaded_by_name: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Real-time editing schemas
class RealTimeEditCreate(BaseModel):
    project_id: str
    element_id: str
    element_type: str
    edit_type: str  # focus, blur, change
    edit_data: Optional[Dict[str, Any]] = None

class RealTimeEditResponse(BaseModel):
    id: str
    project_id: str
    element_id: str
    element_type: str
    user_id: str
    user_name: str
    edit_type: str
    edit_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# WebSocket message schemas
class WebSocketMessage(BaseModel):
    type: str
    payload: Dict[str, Any]
    timestamp: Optional[str] = None

class CursorBroadcast(BaseModel):
    type: str = "cursor_update"
    project_id: str
    user_id: str
    user_name: str
    x: float
    y: float
    element: Optional[str] = None

class EditingBroadcast(BaseModel):
    type: str = "editing_status"
    project_id: str
    user_id: str
    user_name: str
    element: Optional[str] = None
    is_editing: bool

class PresenceBroadcast(BaseModel):
    type: str = "presence_update"
    project_id: str
    user_id: str
    user_name: str
    status: str
    current_view: Optional[str] = None
    current_editing: Optional[str] = None

# Collaboration statistics schemas
class CollaborationStats(BaseModel):
    project_id: str
    active_users_count: int
    active_users: List[str]
    total_messages: int
    total_document_versions: int
    total_whiteboard_actions: int
    last_activity: Optional[datetime] = None

class ProjectCollaborationSummary(BaseModel):
    project_id: str
    collaboration_stats: CollaborationStats
    recent_messages: List[MessageResponse]
    active_sessions: List[CollaborationSessionResponse]
    recent_comments: List[ProjectCommentResponse]
