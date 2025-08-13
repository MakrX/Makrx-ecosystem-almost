import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Edit3, Users, Eye } from 'lucide-react';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import { useAuth } from '../../contexts/AuthContext';

interface EditingUser {
  user_id: string;
  user_name: string;
  element: string;
  timestamp: Date;
}

interface ViewingUser {
  user_id: string;
  user_name: string;
  view_location: string;
  timestamp: Date;
}

interface RealTimeEditingIndicatorsProps {
  projectId: string;
  elementId?: string;
  showViewers?: boolean;
  className?: string;
}

const RealTimeEditingIndicators: React.FC<RealTimeEditingIndicatorsProps> = ({
  projectId,
  elementId,
  showViewers = false,
  className = ''
}) => {
  const { user } = useAuth();
  const { addEventListener, isConnected } = useRealTimeUpdates();
  const [editingUsers, setEditingUsers] = useState<EditingUser[]>([]);
  const [viewingUsers, setViewingUsers] = useState<ViewingUser[]>([]);
  const broadcastTimer = useRef<NodeJS.Timeout | null>(null);
  const lastBroadcast = useRef<string>('');

  // Broadcast editing status
  const broadcastEditingStatus = (element: string, isEditing: boolean) => {
    if (!user || !isConnected) return;

    const eventData = {
      type: 'collaboration.editing',
      project_id: projectId,
      user_id: user.id,
      user_name: user.name || user.email,
      element: isEditing ? element : null,
      timestamp: new Date().toISOString()
    };

    // Debounce broadcasts to avoid spam
    if (broadcastTimer.current) {
      clearTimeout(broadcastTimer.current);
    }

    broadcastTimer.current = setTimeout(async () => {
      const eventString = JSON.stringify(eventData);
      if (lastBroadcast.current === eventString) return;
      
      lastBroadcast.current = eventString;
      
      try {
        const token = localStorage.getItem('auth_token') || 'mock-token';
        await fetch('/api/v1/collaboration/editing', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: eventString
        });
      } catch (error) {
        console.error('Failed to broadcast editing status:', error);
      }
    }, 300);
  };

  // Broadcast viewing status
  const broadcastViewingStatus = (viewLocation: string) => {
    if (!user || !isConnected) return;

    const eventData = {
      type: 'collaboration.viewing',
      project_id: projectId,
      user_id: user.id,
      user_name: user.name || user.email,
      view_location: viewLocation,
      timestamp: new Date().toISOString()
    };

    fetch('/api/v1/collaboration/viewing', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'mock-token'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    }).catch(error => {
      console.error('Failed to broadcast viewing status:', error);
    });
  };

  // Listen for real-time editing events
  useEffect(() => {
    if (!isConnected) return;

    const removeListeners = [
      addEventListener('collaboration.editing', (event) => {
        if (event.payload.project_id === projectId && event.payload.user_id !== user?.id) {
          setEditingUsers(prev => {
            const filtered = prev.filter(u => u.user_id !== event.payload.user_id);
            if (event.payload.element) {
              filtered.push({
                user_id: event.payload.user_id,
                user_name: event.payload.user_name,
                element: event.payload.element,
                timestamp: new Date(event.payload.timestamp)
              });
            }
            return filtered;
          });
        }
      }),

      addEventListener('collaboration.viewing', (event) => {
        if (event.payload.project_id === projectId && event.payload.user_id !== user?.id && showViewers) {
          setViewingUsers(prev => {
            const filtered = prev.filter(u => u.user_id !== event.payload.user_id);
            filtered.push({
              user_id: event.payload.user_id,
              user_name: event.payload.user_name,
              view_location: event.payload.view_location,
              timestamp: new Date(event.payload.timestamp)
            });
            return filtered;
          });
        }
      })
    ];

    return () => {
      removeListeners.forEach(remove => remove());
    };
  }, [isConnected, projectId, addEventListener, user?.id, showViewers]);

  // Clean up old entries
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = new Date();
      const timeout = 30000; // 30 seconds

      setEditingUsers(prev => 
        prev.filter(u => now.getTime() - u.timestamp.getTime() < timeout)
      );

      setViewingUsers(prev => 
        prev.filter(u => now.getTime() - u.timestamp.getTime() < timeout)
      );
    }, 5000);

    return () => clearInterval(cleanup);
  }, []);

  // Hook for components to use
  useEffect(() => {
    if (elementId) {
      broadcastViewingStatus(elementId);
    }
  }, [elementId]);

  // Get users editing specific element
  const getUsersEditingElement = (element: string) => {
    return editingUsers.filter(u => u.element === element);
  };

  // Get users viewing current location
  const getUsersViewingLocation = (location: string) => {
    return viewingUsers.filter(u => u.view_location === location);
  };

  // Render editing indicators for a specific element
  const renderEditingIndicators = (element: string) => {
    const users = getUsersEditingElement(element);
    if (users.length === 0) return null;

    return (
      <div className="flex items-center space-x-1">
        {users.slice(0, 3).map((user) => (
          <div key={user.user_id} className="relative group">
            <Avatar className="h-5 w-5 border border-blue-500">
              <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                {user.user_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Edit3 className="absolute -top-1 -right-1 h-3 w-3 text-blue-500 bg-white rounded-full p-0.5" />
            
            {/* Tooltip */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {user.user_name} is editing
            </div>
          </div>
        ))}
        
        {users.length > 3 && (
          <Badge variant="outline" className="h-5 text-xs px-1">
            +{users.length - 3}
          </Badge>
        )}
      </div>
    );
  };

  // Render viewing indicators for current location
  const renderViewingIndicators = (location: string) => {
    if (!showViewers) return null;
    
    const users = getUsersViewingLocation(location);
    if (users.length === 0) return null;

    return (
      <div className="flex items-center space-x-1">
        <Eye className="h-3 w-3 text-gray-400" />
        {users.slice(0, 3).map((user) => (
          <div key={user.user_id} className="relative group">
            <Avatar className="h-4 w-4 border border-gray-300">
              <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                {user.user_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            {/* Tooltip */}
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {user.user_name} is viewing
            </div>
          </div>
        ))}
        
        {users.length > 3 && (
          <Badge variant="outline" className="h-4 text-xs px-1">
            +{users.length - 3}
          </Badge>
        )}
      </div>
    );
  };

  // Hook for form elements to broadcast editing status
  const useEditingBroadcast = (elementId: string) => {
    return {
      onFocus: () => broadcastEditingStatus(elementId, true),
      onBlur: () => broadcastEditingStatus(elementId, false),
      onMouseEnter: () => broadcastViewingStatus(elementId)
    };
  };

  // Main render method
  if (!elementId) {
    // Return hooks for programmatic use
    return null;
  }

  const editingIndicators = renderEditingIndicators(elementId);
  const viewingIndicators = renderViewingIndicators(elementId);

  if (!editingIndicators && !viewingIndicators) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {editingIndicators}
      {viewingIndicators}
    </div>
  );
};

// Export helper hook
export const useEditingBroadcast = (projectId: string, elementId: string) => {
  const { user } = useAuth();
  const { isConnected } = useRealTimeUpdates();
  const broadcastTimer = useRef<NodeJS.Timeout | null>(null);

  const broadcastEditingStatus = (isEditing: boolean) => {
    if (!user || !isConnected) return;

    if (broadcastTimer.current) {
      clearTimeout(broadcastTimer.current);
    }

    broadcastTimer.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem('auth_token') || 'mock-token';
        await fetch('/api/v1/collaboration/editing', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'collaboration.editing',
            project_id: projectId,
            user_id: user.id,
            user_name: user.name || user.email,
            element: isEditing ? elementId : null,
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Failed to broadcast editing status:', error);
      }
    }, 300);
  };

  return {
    onFocus: () => broadcastEditingStatus(true),
    onBlur: () => broadcastEditingStatus(false),
  };
};

export default RealTimeEditingIndicators;
