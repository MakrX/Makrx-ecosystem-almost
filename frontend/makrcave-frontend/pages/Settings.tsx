import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  Settings as SettingsIcon,
  Building2,
  Users,
  Package,
  CreditCard,
  Store,
  Save,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GeneralSettingsForm from '../components/settings/GeneralSettingsForm';
import AccessControlSettings from '../components/settings/AccessControlSettings';
import InventorySettings from '../components/settings/InventorySettings';
import BillingConfig from '../components/settings/BillingConfig';
import ServiceModeToggle from '../components/settings/ServiceModeToggle';
import { useToast } from '../hooks/use-toast';

interface MakerspaceSettings {
  id?: string;
  makerspace_id?: string;
  makerspace_name?: string;
  logo_url?: string;
  description?: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  operating_hours?: any;
  membership_required?: boolean;
  public_registration?: boolean;
  skill_gated_access?: boolean;
  enable_reservations?: boolean;
  auto_approve_members?: boolean;
  filament_deduction_enabled?: boolean;
  minimum_stock_alerts?: boolean;
  stock_threshold_notification?: boolean;
  allow_personal_consumables?: boolean;
  store_inventory_sync?: boolean;
  default_stock_threshold?: number;
  credit_system_enabled?: boolean;
  show_job_cost_estimates?: boolean;
  default_tax_percent?: number;
  default_currency?: string;
  enable_membership_billing?: boolean;
  service_mode_enabled?: boolean;
  accept_jobs_from_store?: boolean;
  allowed_print_technologies?: string[];
  delivery_radius_km?: number;
  default_service_fee_percent?: number;
  auto_job_assignment?: boolean;
  theme_mode?: string;
  custom_theme_colors?: any;
  landing_page_cta?: string;
  welcome_message?: string;
  enable_chat_widget?: boolean;
  enable_help_widget?: boolean;
  email_notifications_enabled?: boolean;
  sms_notifications_enabled?: boolean;
  push_notifications_enabled?: boolean;
  maintenance_reminder_days?: number;
  require_safety_training?: boolean;
  equipment_access_logging?: boolean;
  visitor_registration_required?: boolean;
  enable_iot_monitoring?: boolean;
  enable_rfid_access?: boolean;
  enable_camera_monitoring?: boolean;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<MakerspaceSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/makerspace/settings/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (section: string, newData: Partial<MakerspaceSettings>) => {
    setSettings(prev => ({ ...prev, ...newData }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/makerspace/settings/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        toast({
          title: "Success",
          description: "Settings saved successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to save settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveSectionSettings = async (section: string, sectionData: any) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/makerspace/settings/section/${section}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionData),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        toast({
          title: "Success",
          description: `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to save settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving section settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const exportSettings = async () => {
    try {
      const response = await fetch('/api/makerspace/settings/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `makerspace-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Success",
          description: "Settings exported successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to export settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error exporting settings:', error);
      toast({
        title: "Error",
        description: "Failed to export settings",
        variant: "destructive",
      });
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      // First delete existing settings, then fetch defaults
      await fetch('/api/makerspace/settings/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      // Fetch new default settings
      await fetchSettings();
      
      toast({
        title: "Success",
        description: "Settings reset to defaults",
      });
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast({
        title: "Error",
        description: "Failed to reset settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            Makerspace Settings
          </h1>
          <p className="text-gray-600">Configure and customize your makerspace operations</p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          {lastSaved && (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Saved {lastSaved.toLocaleTimeString()}
            </Badge>
          )}
          <Button variant="outline" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={saveSettings} 
            disabled={saving || !hasUnsavedChanges}
            className="min-w-24"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Settings Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Settings Management</p>
              <p className="text-blue-700 mt-1">
                Configure your makerspace operations including access control, billing, inventory management, and appearance. 
                Changes are automatically validated and will take effect immediately after saving.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Access
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="service" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Service
          </TabsTrigger>
        </TabsList>

        {/* General Information Tab */}
        <TabsContent value="general" className="space-y-6">
          <GeneralSettingsForm
            settings={settings}
            onUpdate={(data) => updateSettings('general', data)}
            onSave={(data) => saveSectionSettings('general', data)}
            saving={saving}
          />
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access" className="space-y-6">
          <AccessControlSettings
            settings={settings}
            onUpdate={(data) => updateSettings('access', data)}
            onSave={(data) => saveSectionSettings('access', data)}
            saving={saving}
          />
        </TabsContent>

        {/* Inventory Settings Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <InventorySettings
            settings={settings}
            onUpdate={(data) => updateSettings('inventory', data)}
            onSave={(data) => saveSectionSettings('inventory', data)}
            saving={saving}
          />
        </TabsContent>

        {/* Billing Configuration Tab */}
        <TabsContent value="billing" className="space-y-6">
          <BillingConfig
            settings={settings}
            onUpdate={(data) => updateSettings('billing', data)}
            onSave={(data) => saveSectionSettings('billing', data)}
            saving={saving}
          />
        </TabsContent>

        {/* Service Provider Mode Tab */}
        <TabsContent value="service" className="space-y-6">
          <ServiceModeToggle
            settings={settings}
            onUpdate={(data) => updateSettings('service', data)}
            onSave={(data) => saveSectionSettings('service', data)}
            saving={saving}
          />
        </TabsContent>


      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => fetchSettings()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Settings
            </Button>
            <Button variant="outline" onClick={exportSettings}>
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
            <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={resetToDefaults}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
