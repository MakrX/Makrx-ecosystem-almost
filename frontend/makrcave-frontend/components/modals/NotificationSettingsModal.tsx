import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { 
  Bell, 
  BellOff, 
  Mail, 
  MessageSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Users,
  Wrench,
  Calendar,
  TrendingUp,
  Shield,
  DollarSign,
  Package
} from 'lucide-react';

interface NotificationSettings {
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  categories: {
    equipment_maintenance: boolean;
    reservations: boolean;
    inventory_alerts: boolean;
    billing_updates: boolean;
    member_activities: boolean;
    system_updates: boolean;
    safety_alerts: boolean;
    project_updates: boolean;
  };
  priorities: {
    critical: boolean;
    high: boolean;
    medium: boolean;
    low: boolean;
  };
}

interface NotificationSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    quiet_hours_enabled: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    frequency: 'instant',
    categories: {
      equipment_maintenance: true,
      reservations: true,
      inventory_alerts: true,
      billing_updates: true,
      member_activities: false,
      system_updates: true,
      safety_alerts: true,
      project_updates: false,
    },
    priorities: {
      critical: true,
      high: true,
      medium: true,
      low: false,
    }
  });

  const notificationCategories = [
    {
      key: 'equipment_maintenance',
      label: 'Equipment & Maintenance',
      description: 'Maintenance schedules, equipment status, and repair notifications',
      icon: Wrench,
      color: 'text-orange-600'
    },
    {
      key: 'reservations',
      label: 'Reservations',
      description: 'Booking confirmations, reminders, and cancellations',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      key: 'inventory_alerts',
      label: 'Inventory Alerts',
      description: 'Low stock warnings, reorder notifications, and supply updates',
      icon: Package,
      color: 'text-green-600'
    },
    {
      key: 'billing_updates',
      label: 'Billing & Payments',
      description: 'Invoice updates, payment confirmations, and billing alerts',
      icon: DollarSign,
      color: 'text-purple-600'
    },
    {
      key: 'member_activities',
      label: 'Member Activities',
      description: 'Member check-ins, skill certifications, and community updates',
      icon: Users,
      color: 'text-indigo-600'
    },
    {
      key: 'system_updates',
      label: 'System Updates',
      description: 'Platform updates, feature announcements, and system maintenance',
      icon: Settings,
      color: 'text-gray-600'
    },
    {
      key: 'safety_alerts',
      label: 'Safety Alerts',
      description: 'Emergency notifications, safety reminders, and incident reports',
      icon: Shield,
      color: 'text-red-600'
    },
    {
      key: 'project_updates',
      label: 'Project Updates',
      description: 'Project milestones, collaboration requests, and file sharing',
      icon: TrendingUp,
      color: 'text-teal-600'
    }
  ];

  const handleCategoryToggle = (category: keyof NotificationSettings['categories']) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category]
      }
    }));
  };

  const handlePriorityToggle = (priority: keyof NotificationSettings['priorities']) => {
    setSettings(prev => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [priority]: !prev.priorities[priority]
      }
    }));
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated successfully.",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEnabledCategoriesCount = () => {
    return Object.values(settings.categories).filter(Boolean).length;
  };

  const getEnabledPrioritiesCount = () => {
    return Object.values(settings.priorities).filter(Boolean).length;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-8 p-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Active Categories</p>
                    <p className="text-2xl font-bold text-blue-900">{getEnabledCategoriesCount()}</p>
                  </div>
                  <Bell className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Priority Levels</p>
                    <p className="text-2xl font-bold text-green-900">{getEnabledPrioritiesCount()}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Delivery Method</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {[settings.email_enabled, settings.push_enabled, settings.sms_enabled].filter(Boolean).length}
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Delivery Methods */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Methods</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.email_enabled}
                    onCheckedChange={(checked) => handleSettingChange('email_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-600">Browser and mobile push notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.push_enabled}
                    onCheckedChange={(checked) => handleSettingChange('push_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Critical alerts via text message</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.sms_enabled}
                    onCheckedChange={(checked) => handleSettingChange('sms_enabled', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Frequency & Timing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Frequency</h3>
                <Select value={settings.frequency} onValueChange={(value) => handleSettingChange('frequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Summary</SelectItem>
                    <SelectItem value="weekly">Weekly Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Quiet Hours</h3>
                  <Switch
                    checked={settings.quiet_hours_enabled}
                    onCheckedChange={(checked) => handleSettingChange('quiet_hours_enabled', checked)}
                  />
                </div>
                {settings.quiet_hours_enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                      <input
                        type="time"
                        value={settings.quiet_hours_start}
                        onChange={(e) => handleSettingChange('quiet_hours_start', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                      <input
                        type="time"
                        value={settings.quiet_hours_end}
                        onChange={(e) => handleSettingChange('quiet_hours_end', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Priority Levels */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Levels</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(settings.priorities).map(([priority, enabled]) => (
                  <div
                    key={priority}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      enabled
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    onClick={() => handlePriorityToggle(priority as keyof NotificationSettings['priorities'])}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium capitalize ${
                        priority === 'critical' ? 'text-red-600' :
                        priority === 'high' ? 'text-orange-600' :
                        priority === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {priority}
                      </span>
                      {enabled && <CheckCircle className="h-4 w-4 text-blue-600" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Categories */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Categories</h3>
              <div className="space-y-4">
                {notificationCategories.map((category) => {
                  const Icon = category.icon;
                  const isEnabled = settings.categories[category.key as keyof NotificationSettings['categories']];
                  
                  return (
                    <div
                      key={category.key}
                      className={`p-4 border-2 rounded-lg transition-colors ${
                        isEnabled
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Icon className={`h-5 w-5 mt-0.5 ${category.color}`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900">{category.label}</h4>
                            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => handleCategoryToggle(category.key as keyof NotificationSettings['categories'])}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSettingsModal;
