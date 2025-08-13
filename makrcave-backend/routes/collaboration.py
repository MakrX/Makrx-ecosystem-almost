from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
import json
from datetime import datetime, timedelta
import asyncio
from collections import defaultdict

from ..database import get_db
from ..models.projects import Project
from ..models.collaboration import (
    CollaborationMessage, 
    DocumentVersion, 
    WhiteboardAction,
    UserPresence
)
from ..schemas.collaboration import (
    MessageCreate,
    MessageResponse,
    CursorUpdate,
    EditingStatus,
    WhiteboardActionCreate,
    DocumentChangeCreate,
    DocumentVersionCreate
)
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/v1/collaboration", tags=["collaboration"])

# WebSocket connection manager for real-time collaboration
class CollaborationManager:
    def __init__(self):
        # Store active connections by project_id
        self.active_connections: Dict[str, List[WebSocket]] = defaultdict(list)
        self.user_presence: Dict[str, Dict] = {}  # user_id -> presence_data
        
    async def connect(self, websocket: WebSocket, project_id: str, user_id: str):
        await websocket.accept()
        self.active_connections[project_id].append(websocket)
        
        # Update user presence
        self.user_presence[user_id] = {
            'project_id': project_id,
            'websocket': websocket,
            'last_seen': datetime.utcnow(),
            'status': 'active'
        }
        
        # Notify others of user joining
        await self.broadcast_to_project(project_id, {
            'type': 'user_joined',
            'user_id': user_id,
            'timestamp': datetime.utcnow().isoformat()
        }, exclude_ws=websocket)
        
    def disconnect(self, websocket: WebSocket, project_id: str, user_id: str):
        if websocket in self.active_connections[project_id]:
            self.active_connections[project_id].remove(websocket)
            
        # Remove user presence
        if user_id in self.user_presence:
            del self.user_presence[user_id]
            
        # Notify others of user leaving
        asyncio.create_task(self.broadcast_to_project(project_id, {
            'type': 'user_left',
            'user_id': user_id,
            'timestamp': datetime.utcnow().isoformat()
        }))
        
    async def broadcast_to_project(self, project_id: str, message: dict, exclude_ws: Optional[WebSocket] = None):
        """Broadcast message to all users in a project"""
        connections = self.active_connections[project_id]
        message_str = json.dumps(message)
        
        disconnected = []
        for websocket in connections:
            if websocket == exclude_ws:
                continue
                
            try:
                await websocket.send_text(message_str)
            except:
                disconnected.append(websocket)
                
        # Clean up disconnected websockets
        for ws in disconnected:
            if ws in connections:
                connections.remove(ws)
                
    async def broadcast_to_user(self, user_id: str, message: dict):
        """Send message to specific user"""
        if user_id in self.user_presence:
            websocket = self.user_presence[user_id]['websocket']
            try:
                await websocket.send_text(json.dumps(message))
            except:
                # Clean up disconnected user
                del self.user_presence[user_id]

# Global collaboration manager instance
collaboration_manager = CollaborationManager()

@router.websocket("/ws/{project_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, project_id: str, user_id: str):
    """WebSocket endpoint for real-time collaboration"""
    await collaboration_manager.connect(websocket, project_id, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            message_type = message.get('type')
            
            if message_type == 'cursor_update':
                await collaboration_manager.broadcast_to_project(project_id, {
                    'type': 'collaboration.cursor',
                    'payload': {
                        'project_id': project_id,
                        'user_id': user_id,
                        'x': message.get('x'),
                        'y': message.get('y'),
                        'element': message.get('element'),
                        'timestamp': datetime.utcnow().isoformat()
                    }
                }, exclude_ws=websocket)
                
            elif message_type == 'editing_status':
                await collaboration_manager.broadcast_to_project(project_id, {
                    'type': 'collaboration.editing',
                    'payload': {
                        'project_id': project_id,
                        'user_id': user_id,
                        'element': message.get('element'),
                        'is_editing': message.get('is_editing'),
                        'timestamp': datetime.utcnow().isoformat()
                    }
                }, exclude_ws=websocket)
                
            elif message_type == 'presence_update':
                await collaboration_manager.broadcast_to_project(project_id, {
                    'type': 'collaboration.presence',
                    'payload': {
                        'project_id': project_id,
                        'user_id': user_id,
                        'status': message.get('status'),
                        'current_view': message.get('current_view'),
                        'timestamp': datetime.utcnow().isoformat()
                    }
                }, exclude_ws=websocket)
                
    except WebSocketDisconnect:
        collaboration_manager.disconnect(websocket, project_id, user_id)

# Chat and messaging endpoints
@router.post("/messages", response_model=MessageResponse)
async def send_message(
    message: MessageCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a collaboration message"""
    
    # Verify user has access to project
    project = db.query(Project).filter(Project.project_id == message.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Create message record
    db_message = CollaborationMessage(
        project_id=message.project_id,
        user_id=current_user.id,
        message=message.message,
        message_type=message.type,
        metadata=message.metadata or {}
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Broadcast to all project members
    await collaboration_manager.broadcast_to_project(message.project_id, {
        'type': 'collaboration.message',
        'payload': {
            'project_id': message.project_id,
            'user_id': current_user.id,
            'user_name': current_user.name or current_user.email,
            'message': message.message,
            'type': message.type,
            'metadata': message.metadata,
            'timestamp': db_message.created_at.isoformat()
        }
    })
    
    return MessageResponse(
        id=db_message.id,
        project_id=db_message.project_id,
        user_id=db_message.user_id,
        message=db_message.message,
        type=db_message.message_type,
        metadata=db_message.metadata,
        created_at=db_message.created_at
    )

@router.get("/messages/{project_id}", response_model=List[MessageResponse])
async def get_messages(
    project_id: str,
    limit: int = 50,
    offset: int = 0,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get collaboration messages for a project"""
    
    # Verify user has access to project
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    messages = db.query(CollaborationMessage)\
        .filter(CollaborationMessage.project_id == project_id)\
        .order_by(CollaborationMessage.created_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()
    
    return messages

# Document collaboration endpoints
@router.post("/document/change")
async def broadcast_document_change(
    change: DocumentChangeCreate,
    current_user = Depends(get_current_user)
):
    """Broadcast document change to collaborators"""
    
    await collaboration_manager.broadcast_to_project(change.project_id, {
        'type': 'document.change',
        'payload': {
            'document_id': change.document_id,
            'project_id': change.project_id,
            'user_id': current_user.id,
            'user_name': current_user.name or current_user.email,
            'operation': change.operation,
            'position': change.position,
            'content': change.content,
            'timestamp': datetime.utcnow().isoformat()
        }
    })
    
    return {"status": "success"}

@router.post("/document/cursor")
async def broadcast_cursor_position(
    cursor: CursorUpdate,
    current_user = Depends(get_current_user)
):
    """Broadcast cursor position to collaborators"""
    
    await collaboration_manager.broadcast_to_project(cursor.project_id, {
        'type': 'document.cursor',
        'payload': {
            'document_id': cursor.document_id,
            'project_id': cursor.project_id,
            'user_id': current_user.id,
            'user_name': current_user.name or current_user.email,
            'position': cursor.position,
            'selection_start': cursor.selection_start,
            'selection_end': cursor.selection_end,
            'timestamp': datetime.utcnow().isoformat()
        }
    })
    
    return {"status": "success"}

# Whiteboard collaboration endpoints
@router.post("/whiteboard/action")
async def broadcast_whiteboard_action(
    action: WhiteboardActionCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Broadcast whiteboard action to collaborators"""
    
    # Save action to database
    db_action = WhiteboardAction(
        project_id=action.project_id,
        user_id=current_user.id,
        action_type=action.type,
        action_data=action.data
    )
    db.add(db_action)
    db.commit()
    
    # Broadcast to collaborators
    await collaboration_manager.broadcast_to_project(action.project_id, {
        'type': 'whiteboard.action',
        'payload': {
            'project_id': action.project_id,
            'user_id': current_user.id,
            'user_name': current_user.name or current_user.email,
            'type': action.type,
            'data': action.data,
            'timestamp': datetime.utcnow().isoformat()
        }
    })
    
    return {"status": "success"}

@router.post("/whiteboard/cursor")
async def broadcast_whiteboard_cursor(
    cursor_data: dict,
    current_user = Depends(get_current_user)
):
    """Broadcast whiteboard cursor position"""
    
    await collaboration_manager.broadcast_to_project(cursor_data['project_id'], {
        'type': 'whiteboard.cursor',
        'payload': {
            'project_id': cursor_data['project_id'],
            'user_id': current_user.id,
            'user_name': current_user.name or current_user.email,
            'x': cursor_data['x'],
            'y': cursor_data['y'],
            'tool': cursor_data.get('tool', 'pen'),
            'timestamp': datetime.utcnow().isoformat()
        }
    })
    
    return {"status": "success"}

# Editing status endpoints
@router.post("/editing")
async def broadcast_editing_status(
    editing: EditingStatus,
    current_user = Depends(get_current_user)
):
    """Broadcast editing status to collaborators"""
    
    await collaboration_manager.broadcast_to_project(editing.project_id, {
        'type': 'collaboration.editing',
        'payload': {
            'project_id': editing.project_id,
            'user_id': current_user.id,
            'user_name': current_user.name or current_user.email,
            'element': editing.element,
            'timestamp': datetime.utcnow().isoformat()
        }
    })
    
    return {"status": "success"}

@router.post("/viewing")
async def broadcast_viewing_status(
    viewing_data: dict,
    current_user = Depends(get_current_user)
):
    """Broadcast viewing status to collaborators"""
    
    await collaboration_manager.broadcast_to_project(viewing_data['project_id'], {
        'type': 'collaboration.viewing',
        'payload': {
            'project_id': viewing_data['project_id'],
            'user_id': current_user.id,
            'user_name': current_user.name or current_user.email,
            'view_location': viewing_data['view_location'],
            'timestamp': datetime.utcnow().isoformat()
        }
    })
    
    return {"status": "success"}

# Active users endpoint
@router.get("/active-users/{project_id}")
async def get_active_users(
    project_id: str,
    current_user = Depends(get_current_user)
):
    """Get list of currently active users in project"""
    
    active_users = []
    for user_id, presence in collaboration_manager.user_presence.items():
        if presence['project_id'] == project_id:
            # Check if user is still active (within last 30 seconds)
            if datetime.utcnow() - presence['last_seen'] < timedelta(seconds=30):
                active_users.append({
                    'user_id': user_id,
                    'status': presence['status'],
                    'last_seen': presence['last_seen'].isoformat()
                })
    
    return {"active_users": active_users, "total": len(active_users)}

# Clean up inactive users periodically
async def cleanup_inactive_users():
    """Background task to clean up inactive users"""
    while True:
        try:
            current_time = datetime.utcnow()
            inactive_users = []
            
            for user_id, presence in collaboration_manager.user_presence.items():
                if current_time - presence['last_seen'] > timedelta(minutes=5):
                    inactive_users.append(user_id)
            
            # Remove inactive users
            for user_id in inactive_users:
                if user_id in collaboration_manager.user_presence:
                    project_id = collaboration_manager.user_presence[user_id]['project_id']
                    del collaboration_manager.user_presence[user_id]
                    
                    # Notify others
                    await collaboration_manager.broadcast_to_project(project_id, {
                        'type': 'user_left',
                        'user_id': user_id,
                        'timestamp': current_time.isoformat()
                    })
            
        except Exception as e:
            print(f"Error in cleanup task: {e}")
            
        await asyncio.sleep(60)  # Run every minute

# Start cleanup task when module loads
import atexit
cleanup_task = asyncio.create_task(cleanup_inactive_users())
atexit.register(lambda: cleanup_task.cancel())
