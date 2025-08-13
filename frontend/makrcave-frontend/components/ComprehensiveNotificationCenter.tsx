import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { 
  Bell, BellOff, Settings, Filter, Search, MoreVertical, Check, X,
  Mail, MessageSquare, Smartphone, Globe, Zap, AlertTriangle,
  Clock, User, Users, Wrench, Package, CreditCard, FileText,
  Eye, EyeOff, Trash2, RefreshCw, Send, TestTube, Download,
  Volume2, VolumeX, Moon, Sun, Calendar, Star, Archive,
  CheckCircle, XCircle, AlertCircle, Info, Megaphone
} from 'lucide-react';

interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  action_url?: string;
  action_text?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'critical';
  channels: string[];
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled';
  related_resource_type?: string;
  related_resource_id?: string;
  related_metadata?: Record<string, any>;
  scheduled_at?: string;
  expires_at?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  retry_count: number;
  created_at: string;
  updated_at?: string;
}

interface NotificationPreferences {
  id: string;
  global_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  email_enabled: boolean;
  email_address?: string;
  email_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  sms_enabled: boolean;
  sms_number?: string;
  push_enabled: boolean;
  in_app_enabled: boolean;
  in_app_sound: boolean;
  notification_type_preferences?: Record<string, any>;
  daily_digest_enabled: boolean;
  daily_digest_time: string;
  weekly_digest_enabled: boolean;
  weekly_digest_day: string;
}

interface NotificationTemplate {
  id: string;
  template_name: string;
  notification_type: string;
  channel: string;
  title_template: string;
  message_template: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

interface NotificationRule {
  id: string;
  rule_name: string;
  description?: string;
  notification_type: string;
  trigger_event: string;
  trigger_conditions: Record<string, any>;
  is_active: boolean;
  priority: string;
  channels: string[];
  recipient_type: string;
  created_at: string;
}

interface NotificationStats {
  total_notifications: number;
  unread_count: number;
  pending_count: number;
  failed_count: number;
  notifications_by_type: Record<string, number>;
  notifications_by_priority: Record<string, number>;
  recent_activity: any[];
}

const ComprehensiveNotificationCenter: React.FC = () => {
  // State management
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  
  // Modal states
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showCreateNotificationModal, setShowCreateNotificationModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  
  // Real-time connection
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Load data functions
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (showUnreadOnly) params.append('read_status', 'false');
      if (filterType !== 'all') params.append('notification_types', filterType);
      if (filterStatus !== 'all') params.append('statuses', filterStatus);
      if (filterPriority !== 'all') params.append('priorities', filterPriority);
      
      const response = await fetch(`/api/notifications/?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        
        // Update unread count
        const unread = data.filter((n: Notification) => !n.read_at).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [showUnreadOnly, filterType, filterStatus, filterPriority]);

  const loadPreferences = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/preferences/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/templates/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }, []);

  const loadRules = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/rules/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error('Failed to load rules:', error);
    }
  }, []);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    const userId = 'current_user_id'; // Get from auth context
    
    if (!token || !userId) return;

    const wsUrl = `ws://localhost:8000/api/notifications/ws/${userId}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'notification') {
        // Add new notification to the list
        setNotifications(prev => [data.notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if enabled
        if (preferences?.push_enabled && 'Notification' in window) {
          new Notification(data.notification.title, {
            body: data.notification.message,
            icon: '/notification-icon.png'
          });
        }
      } else if (data.type === 'notification_read') {
        // Update notification status
        setNotifications(prev => 
          prev.map(n => 
            n.id === data.notification_id 
              ? { ...n, read_at: new Date().toISOString(), status: 'read' }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
      
      // Reconnect after a delay
      setTimeout(connectWebSocket, 5000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [preferences?.push_enabled]);

  // Initial load
  useEffect(() => {
    loadNotifications();
    loadPreferences();
    loadStats();
    loadTemplates();
    loadRules();
  }, [loadNotifications, loadPreferences, loadStats, loadTemplates, loadRules]);

  // Connect WebSocket
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  // Action handlers
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId
              ? { ...n, read_at: new Date().toISOString(), status: 'read' }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read_at: new Date().toISOString(), status: 'read' }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleUpdatePreferences = async (updates: Partial<NotificationPreferences>) => {
    try {
      const response = await fetch('/api/notifications/preferences/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  // Utility functions
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_created':
      case 'job_completed':
      case 'job_failed':
        return <FileText className="w-4 h-4" />;
      case 'inventory_low_stock':
      case 'inventory_out_of_stock':
        return <Package className="w-4 h-4" />;
      case 'equipment_maintenance_due':
      case 'equipment_failure':
        return <Wrench className="w-4 h-4" />;
      case 'membership_expiring':
      case 'membership_expired':
        return <CreditCard className="w-4 h-4" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'high': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'delivered': return <Check className="w-4 h-4 text-blue-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Render notification card
  const renderNotificationCard = (notification: Notification) => (
    <Card key={notification.id} className={`mb-3 ${!notification.read_at ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getNotificationIcon(notification.notification_type)}
              <h4 className="font-medium">{notification.title}</h4>
              <Badge className={getPriorityColor(notification.priority)}>
                {notification.priority}
              </Badge>
              {getStatusIcon(notification.status)}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{new Date(notification.created_at).toLocaleString()}</span>
              <span>•</span>
              <span className="capitalize">{notification.notification_type.replace(/_/g, ' ')}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                {notification.channels.map(channel => (
                  <Badge key={channel} variant="outline" className="text-xs">
                    {channel === 'email' && <Mail className="w-3 h-3 mr-1" />}
                    {channel === 'sms' && <MessageSquare className="w-3 h-3 mr-1" />}
                    {channel === 'push' && <Smartphone className="w-3 h-3 mr-1" />}
                    {channel === 'in_app' && <Bell className="w-3 h-3 mr-1" />}
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>
            
            {notification.action_url && notification.action_text && (
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(notification.action_url, '_blank')}
                >
                  {notification.action_text}
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {!notification.read_at && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteNotification(notification.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="w-8 h-8" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[20px] h-5 flex items-center justify-center text-xs rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">Notification Center</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              {stats && (
                <>
                  <span>•</span>
                  <span>{stats.total_notifications} total</span>
                  <span>•</span>
                  <span>{stats.unread_count} unread</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreferencesModal(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Preferences
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowTestModal(true)}
          >
            <TestTube className="w-4 h-4 mr-2" />
            Test
          </Button>
          
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
          
          <Button onClick={loadNotifications} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="job_created">Jobs</SelectItem>
                    <SelectItem value="inventory_low_stock">Inventory</SelectItem>
                    <SelectItem value="equipment_maintenance_due">Equipment</SelectItem>
                    <SelectItem value="membership_expiring">Membership</SelectItem>
                    <SelectItem value="announcement">Announcements</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={showUnreadOnly}
                    onCheckedChange={setShowUnreadOnly}
                  />
                  <label className="text-sm">Unread only</label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading notifications...</div>
            ) : filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No notifications found</p>
                  {(filterType !== 'all' || filterStatus !== 'all' || showUnreadOnly) && (
                    <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map(renderNotificationCard)
            )}
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {preferences ? (
                <>
                  {/* Global Settings */}
                  <div>
                    <h3 className="font-medium mb-4">Global Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Enable Notifications</label>
                          <p className="text-sm text-gray-600">Receive all notifications</p>
                        </div>
                        <Switch
                          checked={preferences.global_enabled}
                          onCheckedChange={(enabled) => handleUpdatePreferences({ global_enabled: enabled })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Quiet Hours</label>
                          <p className="text-sm text-gray-600">Suppress notifications during specified hours</p>
                        </div>
                        <Switch
                          checked={preferences.quiet_hours_enabled}
                          onCheckedChange={(enabled) => handleUpdatePreferences({ quiet_hours_enabled: enabled })}
                        />
                      </div>
                      
                      {preferences.quiet_hours_enabled && (
                        <div className="grid grid-cols-2 gap-4 ml-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Start Time</label>
                            <Input
                              type="time"
                              value={preferences.quiet_hours_start}
                              onChange={(e) => handleUpdatePreferences({ quiet_hours_start: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">End Time</label>
                            <Input
                              type="time"
                              value={preferences.quiet_hours_end}
                              onChange={(e) => handleUpdatePreferences({ quiet_hours_end: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Channel Preferences */}
                  <div>
                    <h3 className="font-medium mb-4">Delivery Channels</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <div>
                            <label className="font-medium">Email Notifications</label>
                            <p className="text-sm text-gray-600">Receive notifications via email</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.email_enabled}
                          onCheckedChange={(enabled) => handleUpdatePreferences({ email_enabled: enabled })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <div>
                            <label className="font-medium">SMS Notifications</label>
                            <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.sms_enabled}
                          onCheckedChange={(enabled) => handleUpdatePreferences({ sms_enabled: enabled })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          <div>
                            <label className="font-medium">Push Notifications</label>
                            <p className="text-sm text-gray-600">Receive browser push notifications</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.push_enabled}
                          onCheckedChange={(enabled) => handleUpdatePreferences({ push_enabled: enabled })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4" />
                          <div>
                            <label className="font-medium">In-App Notifications</label>
                            <p className="text-sm text-gray-600">Show notifications in the application</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.in_app_enabled}
                          onCheckedChange={(enabled) => handleUpdatePreferences({ in_app_enabled: enabled })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Digest Settings */}
                  <div>
                    <h3 className="font-medium mb-4">Digest Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Daily Digest</label>
                          <p className="text-sm text-gray-600">Receive a daily summary of notifications</p>
                        </div>
                        <Switch
                          checked={preferences.daily_digest_enabled}
                          onCheckedChange={(enabled) => handleUpdatePreferences({ daily_digest_enabled: enabled })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Weekly Digest</label>
                          <p className="text-sm text-gray-600">Receive a weekly summary of notifications</p>
                        </div>
                        <Switch
                          checked={preferences.weekly_digest_enabled}
                          onCheckedChange={(enabled) => handleUpdatePreferences({ weekly_digest_enabled: enabled })}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">Loading preferences...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Notification Templates
                <Button onClick={() => setShowTemplateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map(template => (
                  <Card key={template.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{template.template_name}</h4>
                        <p className="text-sm text-gray-600">{template.title_template}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{template.notification_type}</Badge>
                          <Badge variant="outline">{template.channel}</Badge>
                          {template.is_default && <Badge>Default</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Notification Rules
                <Button onClick={() => setShowRuleModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rule
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map(rule => (
                  <Card key={rule.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{rule.rule_name}</h4>
                        <p className="text-sm text-gray-600">{rule.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{rule.notification_type}</Badge>
                          <Badge variant="outline">{rule.trigger_event}</Badge>
                          {rule.is_active ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.total_notifications}</div>
                    <div className="text-sm text-gray-600">Total Notifications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.unread_count}</div>
                    <div className="text-sm text-gray-600">Unread</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending_count}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.failed_count}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">Loading analytics...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals would be implemented here */}
      {showPreferencesModal && (
        <Dialog open={showPreferencesModal} onOpenChange={setShowPreferencesModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Notification Preferences</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <div className="text-center py-8 text-gray-500">
                Detailed preferences panel will be implemented here
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ComprehensiveNotificationCenter;
