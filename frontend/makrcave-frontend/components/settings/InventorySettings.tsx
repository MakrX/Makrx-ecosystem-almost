import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Package,
  AlertTriangle,
  RefreshCw,
  User,
  Bell,
  Save,
  Info,
  Gauge,
  ShoppingCart
} from 'lucide-react';

interface MakerspaceSettings {
  filament_deduction_enabled?: boolean;
  minimum_stock_alerts?: boolean;
  stock_threshold_notification?: boolean;
  allow_personal_consumables?: boolean;
  store_inventory_sync?: boolean;
  default_stock_threshold?: number;
}

interface InventorySettingsProps {
  settings: MakerspaceSettings;
  onUpdate: (data: Partial<MakerspaceSettings>) => void;
  onSave: (data: any) => void;
  saving: boolean;
}

const InventorySettings: React.FC<InventorySettingsProps> = ({
  settings,
  onUpdate,
  onSave,
  saving
}) => {
  const handleToggle = (field: string, value: boolean) => {
    onUpdate({ [field]: value });
  };

  const handleInputChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleSave = () => {
    const inventoryData = {
      filament_deduction_enabled: settings.filament_deduction_enabled,
      minimum_stock_alerts: settings.minimum_stock_alerts,
      stock_threshold_notification: settings.stock_threshold_notification,
      allow_personal_consumables: settings.allow_personal_consumables,
      store_inventory_sync: settings.store_inventory_sync,
      default_stock_threshold: settings.default_stock_threshold
    };
    onSave(inventoryData);
  };

  return (
    <div className="space-y-6">
      {/* Inventory Management Overview */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium">Inventory Management Configuration</p>
              <p className="text-green-700 mt-1">
                Configure how your makerspace tracks and manages inventory including consumables, 
                materials, and stock levels. These settings affect billing, notifications, and member access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Material Tracking Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Material Tracking Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filament Deduction */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="filament_deduction_enabled" className="font-medium">
                  Filament Deduction Enabled
                </Label>
                {settings.filament_deduction_enabled && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    <Gauge className="h-3 w-3 mr-1" />
                    Automatic
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Automatically deduct filament usage from inventory during 3D printing jobs
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tracks material consumption and updates stock levels in real-time
              </p>
            </div>
            <Switch
              id="filament_deduction_enabled"
              checked={settings.filament_deduction_enabled || false}
              onCheckedChange={(checked) => handleToggle('filament_deduction_enabled', checked)}
            />
          </div>

          {/* Personal Consumables */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="allow_personal_consumables" className="font-medium">
                  Allow Personal Consumables
                </Label>
                {settings.allow_personal_consumables && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800">
                    <User className="h-3 w-3 mr-1" />
                    Personal
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Allow members to bring and use their own materials and consumables
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Members can choose between makerspace inventory or personal materials
              </p>
            </div>
            <Switch
              id="allow_personal_consumables"
              checked={settings.allow_personal_consumables || false}
              onCheckedChange={(checked) => handleToggle('allow_personal_consumables', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock Monitoring Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Stock Monitoring Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Minimum Stock Alerts */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="minimum_stock_alerts" className="font-medium">
                  Minimum Stock Alerts
                </Label>
                {settings.minimum_stock_alerts && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Monitoring
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Enable alerts when inventory items fall below minimum stock levels
              </p>
            </div>
            <Switch
              id="minimum_stock_alerts"
              checked={settings.minimum_stock_alerts || false}
              onCheckedChange={(checked) => handleToggle('minimum_stock_alerts', checked)}
            />
          </div>

          {/* Stock Threshold Notifications */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="stock_threshold_notification" className="font-medium">
                  Auto-notify on Low Stock
                </Label>
                {settings.stock_threshold_notification && (
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    <Bell className="h-3 w-3 mr-1" />
                    Notifications
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Automatically send notifications to admins when stock falls below threshold
              </p>
            </div>
            <Switch
              id="stock_threshold_notification"
              checked={settings.stock_threshold_notification || false}
              onCheckedChange={(checked) => handleToggle('stock_threshold_notification', checked)}
            />
          </div>

          {/* Default Stock Threshold */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Label htmlFor="default_stock_threshold" className="font-medium">
                Default Stock Threshold
              </Label>
              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                Units
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Input
                id="default_stock_threshold"
                type="number"
                min="1"
                max="1000"
                value={settings.default_stock_threshold || 10}
                onChange={(e) => handleInputChange('default_stock_threshold', parseInt(e.target.value) || 10)}
                className="w-32"
              />
              <span className="text-sm text-gray-600">
                units (applies to new inventory items)
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This threshold is used as the default for new inventory items. Individual items can have custom thresholds.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Integration Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Store to Inventory Sync */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="store_inventory_sync" className="font-medium">
                  Store-to-Inventory Sync
                </Label>
                {settings.store_inventory_sync && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Synced
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Automatically sync inventory levels with the MakrX store
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Updates store availability based on current inventory levels
              </p>
            </div>
            <Switch
              id="store_inventory_sync"
              checked={settings.store_inventory_sync || false}
              onCheckedChange={(checked) => handleToggle('store_inventory_sync', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory Settings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Tracking & Deduction</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span>Filament Deduction:</span>
                  <Badge variant={settings.filament_deduction_enabled ? "default" : "outline"}>
                    {settings.filament_deduction_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Personal Materials:</span>
                  <Badge variant={settings.allow_personal_consumables ? "default" : "outline"}>
                    {settings.allow_personal_consumables ? 'Allowed' : 'Not Allowed'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Store Sync:</span>
                  <Badge variant={settings.store_inventory_sync ? "default" : "outline"}>
                    {settings.store_inventory_sync ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Alerts & Monitoring</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span>Stock Alerts:</span>
                  <Badge variant={settings.minimum_stock_alerts ? "default" : "outline"}>
                    {settings.minimum_stock_alerts ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Auto Notifications:</span>
                  <Badge variant={settings.stock_threshold_notification ? "default" : "outline"}>
                    {settings.stock_threshold_notification ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Default Threshold:</span>
                  <Badge variant="outline">
                    {settings.default_stock_threshold || 10} units
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Impact */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-sm mb-2">Configuration Impact</h5>
            <div className="text-xs text-gray-600 space-y-1">
              {settings.filament_deduction_enabled && (
                <p>• Material usage will be automatically tracked and deducted during jobs</p>
              )}
              {settings.minimum_stock_alerts && (
                <p>• Low stock alerts will appear in the dashboard when thresholds are reached</p>
              )}
              {settings.allow_personal_consumables && (
                <p>• Members can select personal materials option during job creation</p>
              )}
              {settings.store_inventory_sync && (
                <p>• Store product availability will reflect current inventory levels</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-32">
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Inventory Settings
        </Button>
      </div>
    </div>
  );
};

export default InventorySettings;
