import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'inventory' | 'equipment' | 'project' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'inventory' | 'equipment' | 'projects' | 'system' | 'user' | 'security';
  userId?: string;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getNotificationsByCategory: (category: string) => Notification[];
  getUnreadByCategory: (category: string) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Generate mock notifications based on user role
  useEffect(() => {
    if (!user) return;

    const mockNotifications: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [];

    // Common notifications for all users
    mockNotifications.push(
      {
        type: 'info',
        title: 'Welcome to MakrCave',
        message: 'Your makerspace management portal is ready to use.',
        priority: 'medium',
        category: 'system'
      }
    );

    // Role-specific notifications
    if (user.role === 'super_admin') {
      mockNotifications.push(
        {
          type: 'system',
          title: 'System Maintenance Scheduled',
          message: 'Scheduled maintenance window: Tomorrow 2:00 AM - 4:00 AM EST',
          priority: 'high',
          category: 'system'
        },
        {
          type: 'warning',
          title: 'Multiple Makerspace Low Stock',
          message: '15 items across 3 makerspaces are running low on inventory',
          priority: 'medium',
          category: 'inventory',
          actionUrl: '/portal/inventory',
          actionLabel: 'View Inventory'
        }
      );
    }

    if (user.role === 'admin' || user.role === 'super_admin') {
      mockNotifications.push(
        {
          type: 'inventory',
          title: 'Inventory Alert',
          message: 'PLA Filament - Blue is running low (2 kg remaining)',
          priority: 'medium',
          category: 'inventory',
          actionUrl: '/portal/inventory',
          actionLabel: 'Reorder'
        }
      );
    }

    if (user.role === 'makerspace_admin') {
      mockNotifications.push(
        {
          type: 'equipment',
          title: 'Equipment Maintenance Due',
          message: 'Prusa i3 MK3S+ requires scheduled maintenance check',
          priority: 'high',
          category: 'equipment',
          actionUrl: '/portal/equipment',
          actionLabel: 'Schedule'
        },
        {
          type: 'inventory',
          title: 'Low Stock Alert',
          message: '3 items in your makerspace are below threshold',
          priority: 'medium',
          category: 'inventory'
        }
      );
    }

    if (user.role === 'maker') {
      mockNotifications.push(
        {
          type: 'project',
          title: 'Project Update',
          message: 'Your 3D printer reservation for tomorrow has been confirmed',
          priority: 'medium',
          category: 'projects',
          actionUrl: '/portal/reservations',
          actionLabel: 'View Details'
        },
        {
          type: 'info',
          title: 'New Equipment Available',
          message: 'Ultimaker S3 is now available for reservations',
          priority: 'low',
          category: 'equipment'
        }
      );
    }

    // Add notifications with proper IDs and timestamps
    const newNotifications = mockNotifications.map((notif, index) => ({
      ...notif,
      id: `${user.id}-${Date.now()}-${index}`,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time within last week
      read: Math.random() > 0.7 // 30% chance of being read
    }));

    setNotifications(newNotifications);
  }, [user]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationsByCategory = (category: string) => {
    return notifications.filter(notif => notif.category === category);
  };

  const getUnreadByCategory = (category: string) => {
    return notifications.filter(notif => notif.category === category && !notif.read);
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      getNotificationsByCategory,
      getUnreadByCategory
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
