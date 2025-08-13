import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Users, 
  MessageCircle, 
  Video, 
  Share2, 
  Eye, 
  Edit3, 
  Activity,
  MousePointer2,
  Cursor,
  Clock,
  Send,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  PhoneCall,
  PhoneOff,
  Pin,
  PinOff,
  Coffee,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface CollaborationMessage {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'system' | 'annotation';
  metadata?: any;
}

interface ActiveCollaborator {
  user_id: string;
  user_name: string;
  role: string;
  last_seen: Date;
  current_view: string;
  status: 'active' | 'idle' | 'away';
  cursor_position?: { x: number; y: number; element?: string };
  current_editing?: string;
}

interface ProjectCollaborationHubProps {
  projectId: string;
  isVisible: boolean;
  onToggle: () => void;
}

const ProjectCollaborationHub: React.FC<ProjectCollaborationHubProps> = ({
  projectId,
  isVisible,
  onToggle
}) => {
  const { user } = useAuth();
  const { addEventListener, isConnected } = useRealTimeUpdates();
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeCollaborators, setActiveCollaborators] = useState<ActiveCollaborator[]>([]);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserStatus, setCurrentUserStatus] = useState<'active' | 'idle' | 'away'>('active');

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time collaboration event listeners
  useEffect(() => {
    if (!isConnected) return;

    const removeListeners = [
      // Chat messages
      addEventListener('collaboration.message', (event) => {
        if (event.payload.project_id === projectId) {
          const newMessage: CollaborationMessage = {
            id: event.id,
            user_id: event.payload.user_id,
            user_name: event.payload.user_name,
            message: event.payload.message,
            timestamp: new Date(event.payload.timestamp),
            type: event.payload.type || 'message',
            metadata: event.payload.metadata
          };
          setMessages(prev => [...prev, newMessage]);
        }
      }),

      // User presence updates
      addEventListener('collaboration.presence', (event) => {
        if (event.payload.project_id === projectId) {
          setActiveCollaborators(prev => {
            const updated = prev.filter(c => c.user_id !== event.payload.user_id);
            if (event.payload.status !== 'offline') {
              updated.push({
                user_id: event.payload.user_id,
                user_name: event.payload.user_name,
                role: event.payload.role,
                last_seen: new Date(event.payload.timestamp),
                current_view: event.payload.current_view || 'overview',
                status: event.payload.status,
                cursor_position: event.payload.cursor_position,
                current_editing: event.payload.current_editing
              });
            }
            return updated;
          });
        }
      }),

      // Cursor tracking
      addEventListener('collaboration.cursor', (event) => {
        if (event.payload.project_id === projectId && event.payload.user_id !== user?.id) {
          setActiveCollaborators(prev => 
            prev.map(c => 
              c.user_id === event.payload.user_id 
                ? { ...c, cursor_position: event.payload.position }
                : c
            )
          );
        }
      }),

      // Editing indicators
      addEventListener('collaboration.editing', (event) => {
        if (event.payload.project_id === projectId) {
          setActiveCollaborators(prev => 
            prev.map(c => 
              c.user_id === event.payload.user_id 
                ? { ...c, current_editing: event.payload.element }
                : c
            )
          );
        }
      })
    ];

    return () => {
      removeListeners.forEach(remove => remove());
    };
  }, [isConnected, projectId, addEventListener, user?.id]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageData = {
      project_id: projectId,
      user_id: user.id,
      user_name: user.name || user.email,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'message'
    };

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      await fetch('/api/v1/collaboration/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Toggle video call
  const handleVideoCall = async () => {
    if (isVideoCallActive) {
      // End call
      setIsVideoCallActive(false);
      setIsMicMuted(false);
      setIsCameraOff(false);
    } else {
      // Start call
      setIsVideoCallActive(true);
      // In real implementation, this would initialize WebRTC
      
      // Send system message about call start
      const systemMessage = {
        project_id: projectId,
        user_id: user?.id || '',
        user_name: user?.name || user?.email || '',
        message: 'started a video call',
        timestamp: new Date().toISOString(),
        type: 'system'
      };

      try {
        const token = localStorage.getItem('auth_token') || 'mock-token';
        await fetch('/api/v1/collaboration/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(systemMessage)
        });
      } catch (error) {
        console.error('Failed to send system message:', error);
      }
    }
  };

  // Pin/unpin message
  const handlePinMessage = (messageId: string) => {
    setPinnedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Send quick reactions
  const sendQuickReaction = async (reaction: string) => {
    if (!user) return;

    const reactionMessage = {
      project_id: projectId,
      user_id: user.id,
      user_name: user.name || user.email,
      message: reaction,
      timestamp: new Date().toISOString(),
      type: 'system'
    };

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      await fetch('/api/v1/collaboration/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reactionMessage)
      });
    } catch (error) {
      console.error('Failed to send reaction:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-400';
      case 'idle': return 'bg-yellow-400';
      case 'away': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'system': return <Activity className="h-3 w-3 text-blue-500" />;
      case 'annotation': return <Pin className="h-3 w-3 text-purple-500" />;
      default: return <MessageCircle className="h-3 w-3 text-gray-500" />;
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 shadow-lg"
        size="sm"
      >
        <Users className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaboration
            {!isConnected && (
              <Badge variant="destructive" className="ml-2">
                Offline
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            ×
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Active Collaborators */}
        <div className="px-4 py-2 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Active Now ({activeCollaborators.length + 1})
            </span>
            <div className="flex space-x-1">
              <Button
                variant={isVideoCallActive ? "destructive" : "outline"}
                size="sm"
                onClick={handleVideoCall}
              >
                {isVideoCallActive ? <PhoneOff className="h-3 w-3" /> : <Video className="h-3 w-3" />}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {/* Current user */}
            <div className="relative">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${getStatusColor(currentUserStatus)}`} />
            </div>
            
            {/* Other collaborators */}
            {activeCollaborators.map((collaborator) => (
              <div key={collaborator.user_id} className="relative group">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {collaborator.user_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${getStatusColor(collaborator.status)}`} />
                
                {/* Editing indicator */}
                {collaborator.current_editing && (
                  <Edit3 className="absolute -top-1 -right-1 h-3 w-3 text-blue-500 bg-white rounded-full p-0.5" />
                )}
                
                {/* Tooltip */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {collaborator.user_name}
                  {collaborator.current_editing && (
                    <div className="text-blue-300">Editing {collaborator.current_editing}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Call Interface */}
        {isVideoCallActive && (
          <div className="px-4 py-3 bg-blue-50 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">Video Call Active</span>
              <div className="flex space-x-1">
                <Button
                  variant={isMicMuted ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setIsMicMuted(!isMicMuted)}
                >
                  {isMicMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                </Button>
                <Button
                  variant={isCameraOff ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setIsCameraOff(!isCameraOff)}
                >
                  {isCameraOff ? <CameraOff className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Reactions */}
        <div className="px-4 py-2 border-b">
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sendQuickReaction('👍 Great work!')}
              className="text-xs p-1"
            >
              👍
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sendQuickReaction('💡 has an idea')}
              className="text-xs p-1"
            >
              <Lightbulb className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sendQuickReaction('☕ taking a break')}
              className="text-xs p-1"
            >
              <Coffee className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sendQuickReaction('⚠️ needs attention')}
              className="text-xs p-1"
            >
              <AlertTriangle className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="space-y-2">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <div className={`flex items-start space-x-2 ${message.user_id === user?.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      {message.user_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 ${message.user_id === user?.id ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-1 mb-1">
                      {getMessageIcon(message.type)}
                      <span className="text-xs font-medium text-gray-600">
                        {message.user_name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePinMessage(message.id)}
                        className="opacity-0 group-hover:opacity-100 h-4 w-4 p-0"
                      >
                        {pinnedMessages.has(message.id) ? (
                          <PinOff className="h-3 w-3" />
                        ) : (
                          <Pin className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    
                    <div className={`text-sm bg-white border rounded-lg px-3 py-2 ${
                      message.user_id === user?.id 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : message.type === 'system'
                        ? 'bg-gray-100 text-gray-600 border-gray-200 italic'
                        : 'bg-white border-gray-200'
                    } ${pinnedMessages.has(message.id) ? 'border-yellow-400 bg-yellow-50' : ''}`}>
                      {message.message}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="px-4 py-3 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
              disabled={!isConnected}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!newMessage.trim() || !isConnected}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCollaborationHub;
