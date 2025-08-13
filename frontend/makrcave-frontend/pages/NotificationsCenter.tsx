import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Package,
  Wrench,
  Calendar,
  Users,
  DollarSign,
  Clock,
  X,
  Check,
  Archive,
  Settings,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

interface Notification {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  category: 'inventory' | 'equipment' | 'reservations' | 'members' | 'billing' | 'maintenance' | 'system';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  status: 'unread' | 'read' | 'archived' | 'resolved';
  createdAt: string;
  actionRequired: boolean;
  relatedEntity?: {
    type: string;
    id: string;
    name: string;
  };
}

const NotificationsCenter: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();

  // Check if user has notifications access
  if (!hasPermission('admin', 'globalDashboard') && user?.role !== 'makerspace_admin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">You don't have permission to view notifications</p>
          <p className="text-sm text-gray-500">Contact your administrator for access</p>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: 'notif-1',
      type: 'alert',
      category: 'inventory',
      title: 'Low Stock Alert',
      message: 'PLA Filament (White) is running low. Only 2 spools remaining.',
      priority: 'high',
      status: 'unread',
      createdAt: '2024-01-20T09:30:00Z',
      actionRequired: true,
      relatedEntity: {
        type: 'inventory_item',
        id: 'item-123',
        name: 'PLA Filament (White)'
      }
    },
    {
      id: 'notif-2',
      type: 'warning',
      category: 'equipment',
      title: 'Maintenance Due',
      message: 'Prusa i3 MK3S #2 requires scheduled maintenance within 7 days.',
      priority: 'medium',
      status: 'unread',
      createdAt: '2024-01-20T08:15:00Z',
      actionRequired: true,
      relatedEntity: {
        type: 'equipment',
        id: 'eq-456',
        name: 'Prusa i3 MK3S #2'
      }
    },
    {
      id: 'notif-3',
      type: 'info',
      category: 'reservations',
      title: 'New Reservation',
      message: 'John Smith has reserved the Laser Cutter for tomorrow 2:00 PM - 4:00 PM.',
      priority: 'low',
      status: 'read',
      createdAt: '2024-01-20T07:45:00Z',
      actionRequired: false,
      relatedEntity: {
        type: 'reservation',
        id: 'res-789',
        name: 'Laser Cutter Reservation'
      }
    },
    {
      id: 'notif-4',
      type: 'alert',
      category: 'members',
      title: 'Membership Expiring',
      message: 'Emily Davis\'s membership expires in 3 days. Renewal required.',
      priority: 'high',
      status: 'unread',
      createdAt: '2024-01-20T06:30:00Z',
      actionRequired: true,
      relatedEntity: {
        type: 'member',
        id: 'mem-321',
        name: 'Emily Davis'
      }
    },
    {
      id: 'notif-5',
      type: 'success',
      category: 'billing',
      title: 'Payment Received',
      message: 'Monthly membership payment of ₹6,225 received from Michael Chen.',
      priority: 'low',
      status: 'read',
      createdAt: '2024-01-19T16:20:00Z',
      actionRequired: false,
      relatedEntity: {
        type: 'payment',
        id: 'pay-654',
        name: 'Membership Payment'
      }
    },
    {
      id: 'notif-6',
      type: 'warning',
      category: 'equipment',
      title: 'Equipment Offline',
      message: 'CNC Router appears to be offline. Last ping: 2 hours ago.',
      priority: 'high',
      status: 'unread',
      createdAt: '2024-01-19T14:10:00Z',
      actionRequired: true,
      relatedEntity: {
        type: 'equipment',
        id: 'eq-987',
        name: 'CNC Router'
      }
    }
  ];

  useEffect(() => {
    // Initialize mock data
    setNotifications(mockNotifications);
    setLoading(false);
  }, []);

  const getNotificationIcon = (type: string, category: string) => {
    if (type === 'alert') return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (type === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    if (type === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
    
    // Category-based icons
    switch (category) {
      case 'inventory': return <Package className="h-5 w-5 text-blue-500" />;
      case 'equipment': return <Wrench className="h-5 w-5 text-orange-500" />;
      case 'reservations': return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'members': return <Users className="h-5 w-5 text-indigo-500" />;
      case 'billing': return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'maintenance': return <Settings className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, status: 'read' }
          : notif
      )
    );
    toast({
      title: "Notification marked as read",
    });
  };

  const handleMarkAsResolved = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, status: 'resolved' }
          : notif
      )
    );
    toast({
      title: "Notification resolved",
    });
  };

  const handleArchive = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, status: 'archived' }
          : notif
      )
    );
    toast({
      title: "Notification archived",
    });
  };

  const handleBulkAction = (action: 'read' | 'archive' | 'delete') => {
    setNotifications(prev => 
      prev.map(notif => 
        selectedNotifications.includes(notif.id)
          ? { ...notif, status: action === 'read' ? 'read' : 'archived' }
          : notif
      )
    );
    setSelectedNotifications([]);
    toast({
      title: `${selectedNotifications.length} notifications ${action === 'read' ? 'marked as read' : 'archived'}`,
    });
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => n.status === 'unread');
      case 'action-required':
        return notifications.filter(n => n.actionRequired && n.status !== 'resolved');
      case 'high-priority':
        return notifications.filter(n => n.priority === 'high' && n.status !== 'resolved');
      case 'archived':
        return notifications.filter(n => n.status === 'archived');
      default:
        return notifications.filter(n => n.status !== 'archived');
    }
  };

  const stats = {
    total: notifications.filter(n => n.status !== 'archived').length,
    unread: notifications.filter(n => n.status === 'unread').length,
    actionRequired: notifications.filter(n => n.actionRequired && n.status !== 'resolved').length,
    highPriority: notifications.filter(n => n.priority === 'high' && n.status !== 'resolved').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications Center
          </h1>
          <p className="text-gray-600">Monitor alerts and system notifications for your makerspace</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Notification Settings
          </Button>
          {selectedNotifications.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('read')}>
                Mark Read
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('archive')}>
                Archive
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Action Required</p>
                <p className="text-2xl font-bold text-red-600">{stats.actionRequired}</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-purple-600">{stats.highPriority}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({stats.unread})</TabsTrigger>
          <TabsTrigger value="action-required">Action Required ({stats.actionRequired})</TabsTrigger>
          <TabsTrigger value="high-priority">High Priority ({stats.highPriority})</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        {/* All tabs use the same content structure */}
        {['all', 'unread', 'action-required', 'high-priority', 'archived'].map(tabValue => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-4">
            {getFilteredNotifications().length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-600">
                    {tabValue === 'unread' && 'All caught up! No unread notifications.'}
                    {tabValue === 'action-required' && 'No actions required at the moment.'}
                    {tabValue === 'high-priority' && 'No high priority items to address.'}
                    {tabValue === 'archived' && 'No archived notifications.'}
                    {tabValue === 'all' && 'No notifications to display.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {getFilteredNotifications().map((notification) => (
                  <Card key={notification.id} className={`${notification.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedNotifications(prev => [...prev, notification.id]);
                              } else {
                                setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                              }
                            }}
                            className="rounded"
                          />
                          {getNotificationIcon(notification.type, notification.category)}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                                  {getPriorityBadge(notification.priority)}
                                  {notification.status === 'unread' && (
                                    <Badge variant="default" className="bg-blue-100 text-blue-800">New</Badge>
                                  )}
                                  {notification.actionRequired && (
                                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                      Action Required
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>{formatTimeAgo(notification.createdAt)}</span>
                                  <span className="capitalize">{notification.category}</span>
                                  {notification.relatedEntity && (
                                    <span>• {notification.relatedEntity.name}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                {notification.status === 'unread' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                {notification.actionRequired && notification.status !== 'resolved' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleMarkAsResolved(notification.id)}
                                  >
                                    Resolve
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleArchive(notification.id)}
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default NotificationsCenter;
