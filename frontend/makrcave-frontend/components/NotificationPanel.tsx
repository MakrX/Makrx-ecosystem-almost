import { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle, XCircle, Package, Wrench, FolderOpen, Settings, ExternalLink } from 'lucide-react';
import { useNotifications, NotificationType } from '../contexts/NotificationContext';

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const panelRef = useRef<HTMLDivElement>(null);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll 
  } = useNotifications();

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'inventory': return <Package className="w-5 h-5 text-blue-500" />;
      case 'equipment': return <Wrench className="w-5 h-5 text-purple-500" />;
      case 'project': return <FolderOpen className="w-5 h-5 text-makrx-teal" />;
      case 'system': return <Settings className="w-5 h-5 text-gray-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-amber-500 bg-amber-50';
      case 'medium': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Notification Bell */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-accent rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-lg shadow-lg z-50 max-h-[70vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Notifications</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Filter and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-sm rounded ${
                    filter === 'all' ? 'bg-makrx-teal text-white' : 'hover:bg-accent'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 text-sm rounded ${
                    filter === 'unread' ? 'bg-makrx-teal text-white' : 'hover:bg-accent'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-makrx-teal hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No {filter === 'unread' ? 'unread ' : ''}notifications</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-colors hover:bg-accent/50 ${
                      !notification.read ? getPriorityColor(notification.priority) : 'border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                notification.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                notification.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                                notification.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {notification.priority}
                              </span>
                            </div>
                            
                            {notification.actionUrl && (
                              <div className="mt-2">
                                <button className="text-xs text-makrx-teal hover:underline flex items-center gap-1">
                                  {notification.actionLabel || 'View'}
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 hover:bg-accent rounded"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="p-1 hover:bg-accent rounded"
                              title="Remove"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border">
              <button
                onClick={clearAll}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
