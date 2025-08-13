import { Bell, AlertTriangle, Package, Wrench, FolderOpen, Settings } from 'lucide-react';
import { useNotifications, NotificationType } from '../contexts/NotificationContext';

interface NotificationWidgetProps {
  category?: 'inventory' | 'equipment' | 'projects' | 'system' | 'user' | 'security';
  maxItems?: number;
  title?: string;
  showHeader?: boolean;
}

export default function NotificationWidget({ 
  category, 
  maxItems = 5, 
  title,
  showHeader = true 
}: NotificationWidgetProps) {
  const { notifications, getNotificationsByCategory, markAsRead } = useNotifications();

  const filteredNotifications = category 
    ? getNotificationsByCategory(category)
    : notifications;

  const displayNotifications = filteredNotifications
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxItems);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'warning':
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'inventory':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'equipment':
        return <Wrench className="w-4 h-4 text-purple-500" />;
      case 'project':
        return <FolderOpen className="w-4 h-4 text-makrx-teal" />;
      case 'system':
        return <Settings className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (displayNotifications.length === 0) {
    return (
      <div className="makrcave-card">
        {showHeader && (
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5" />
            <h3 className="font-semibold">{title || 'Recent Notifications'}</h3>
          </div>
        )}
        <div className="text-center py-8 text-muted-foreground">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recent notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="makrcave-card">
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h3 className="font-semibold">{title || 'Recent Notifications'}</h3>
          </div>
          {filteredNotifications.length > maxItems && (
            <span className="text-xs text-muted-foreground">
              +{filteredNotifications.length - maxItems} more
            </span>
          )}
        </div>
      )}
      
      <div className="space-y-3">
        {displayNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-accent/50 cursor-pointer ${
              !notification.read ? 'bg-blue-50 border-blue-200' : 'border-border'
            }`}
            onClick={() => !notification.read && markAsRead(notification.id)}
          >
            {getNotificationIcon(notification.type)}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {notification.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(notification.timestamp)}
                    </span>
                    {notification.priority === 'urgent' && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                        Urgent
                      </span>
                    )}
                    {notification.priority === 'high' && (
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                        High
                      </span>
                    )}
                  </div>
                </div>
                
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {category && filteredNotifications.length > maxItems && (
        <div className="mt-4 pt-3 border-t border-border">
          <button className="text-sm text-makrx-teal hover:underline">
            View all {category} notifications
          </button>
        </div>
      )}
    </div>
  );
}
