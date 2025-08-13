import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import {
  Store,
  Truck,
  MapPin,
  Percent,
  Zap,
  Save,
  RefreshCw,
  Info,
  ShoppingCart,
  Factory,
  Globe
} from 'lucide-react';

interface MakerspaceSettings {
  service_mode_enabled?: boolean;
  accept_jobs_from_store?: boolean;
  allowed_print_technologies?: string[];
  delivery_radius_km?: number;
  default_service_fee_percent?: number;
  auto_job_assignment?: boolean;
}

interface ServiceModeToggleProps {
  settings: MakerspaceSettings;
  onUpdate: (data: Partial<MakerspaceSettings>) => void;
  onSave: (data: any) => void;
  saving: boolean;
}

const printTechnologies = [
  { value: 'fdm', label: 'FDM (Fused Deposition Modeling)', description: 'Most common 3D printing technology' },
  { value: 'sla', label: 'SLA (Stereolithography)', description: 'High precision resin printing' },
  { value: 'sls', label: 'SLS (Selective Laser Sintering)', description: 'Powder-based printing' },
  { value: 'polyjet', label: 'PolyJet', description: 'Multi-material jetting' },
  { value: 'carbon_fiber', label: 'Carbon Fiber', description: 'Reinforced composite printing' }
];

const ServiceModeToggle: React.FC<ServiceModeToggleProps> = ({
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

  const handleTechnologyToggle = (tech: string, checked: boolean) => {
    const currentTechs = settings.allowed_print_technologies || ['fdm'];
    let newTechs;
    
    if (checked) {
      newTechs = [...currentTechs, tech];
    } else {
      newTechs = currentTechs.filter(t => t !== tech);
    }
    
    // Ensure at least one technology is selected
    if (newTechs.length === 0) {
      newTechs = ['fdm'];
    }
    
    onUpdate({ allowed_print_technologies: newTechs });
  };

  const handleSave = () => {
    const serviceData = {
      service_mode_enabled: settings.service_mode_enabled,
      accept_jobs_from_store: settings.accept_jobs_from_store,
      allowed_print_technologies: settings.allowed_print_technologies,
      delivery_radius_km: settings.delivery_radius_km,
      default_service_fee_percent: settings.default_service_fee_percent,
      auto_job_assignment: settings.auto_job_assignment
    };
    onSave(serviceData);
  };

  const currentTechs = settings.allowed_print_technologies || ['fdm'];

  return (
    <div className="space-y-6">
      {/* Service Provider Mode Overview */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div className="text-sm text-indigo-800">
              <p className="font-medium">Service Provider Mode</p>
              <p className="text-indigo-700 mt-1">
                Transform your makerspace into a service provider by accepting external jobs and orders. 
                This enables revenue generation from non-members and integration with MakrX.Store.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Mode Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Service Provider Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Mode Enabled */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="service_mode_enabled" className="font-medium">
                  Service Mode Enabled
                </Label>
                {settings.service_mode_enabled && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <Factory className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Enable your makerspace to operate as a service provider
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Allows accepting external jobs and orders from non-members
              </p>
            </div>
            <Switch
              id="service_mode_enabled"
              checked={settings.service_mode_enabled || false}
              onCheckedChange={(checked) => handleToggle('service_mode_enabled', checked)}
            />
          </div>

          {settings.service_mode_enabled && (
            <>
              {/* Accept Jobs from Store */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="accept_jobs_from_store" className="font-medium">
                      Accept Jobs from MakrX.Store
                    </Label>
                    {settings.accept_jobs_from_store && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        <Globe className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Automatically receive and process jobs from the MakrX marketplace
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Jobs are assigned based on capabilities, location, and availability
                  </p>
                </div>
                <Switch
                  id="accept_jobs_from_store"
                  checked={settings.accept_jobs_from_store || false}
                  onCheckedChange={(checked) => handleToggle('accept_jobs_from_store', checked)}
                />
              </div>

              {/* Auto Job Assignment */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="auto_job_assignment" className="font-medium">
                      Auto Job Assignment
                    </Label>
                    {settings.auto_job_assignment && (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        <Zap className="h-3 w-3 mr-1" />
                        Automated
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Automatically accept jobs that match your capabilities and availability
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Reduces manual intervention for job acceptance
                  </p>
                </div>
                <Switch
                  id="auto_job_assignment"
                  checked={settings.auto_job_assignment || false}
                  onCheckedChange={(checked) => handleToggle('auto_job_assignment', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Service Capabilities */}
      {settings.service_mode_enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Service Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Allowed Print Technologies */}
            <div className="space-y-3">
              <Label className="font-medium">Allowed Print Technologies</Label>
              <p className="text-sm text-gray-600">Select the 3D printing technologies your makerspace supports</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {printTechnologies.map((tech) => (
                  <div key={tech.value} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={`tech-${tech.value}`}
                      checked={currentTechs.includes(tech.value)}
                      onCheckedChange={(checked) => handleTechnologyToggle(tech.value, checked as boolean)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label htmlFor={`tech-${tech.value}`} className="font-medium text-sm">
                        {tech.label}
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">{tech.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {currentTechs.map((tech) => {
                  const techInfo = printTechnologies.find(t => t.value === tech);
                  return (
                    <Badge key={tech} variant="outline" className="bg-blue-100 text-blue-800">
                      {techInfo ? techInfo.label.split(' ')[0] : tech.toUpperCase()}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Configuration */}
      {settings.service_mode_enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Service Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Delivery Radius */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_radius_km" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Delivery Radius (km)
                </Label>
                <Input
                  id="delivery_radius_km"
                  type="number"
                  min="1"
                  max="1000"
                  value={settings.delivery_radius_km || 10}
                  onChange={(e) => handleInputChange('delivery_radius_km', parseInt(e.target.value) || 10)}
                />
                <p className="text-xs text-gray-500">
                  Maximum distance for job auto-assignment and delivery services
                </p>
              </div>

              {/* Default Service Fee */}
              <div className="space-y-2">
                <Label htmlFor="default_service_fee_percent" className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Default Service Fee (%)
                </Label>
                <Input
                  id="default_service_fee_percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.default_service_fee_percent || 5}
                  onChange={(e) => handleInputChange('default_service_fee_percent', parseFloat(e.target.value) || 5)}
                />
                <p className="text-xs text-gray-500">
                  Additional fee percentage added to material costs for services
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Mode Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Service Provider Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {!settings.service_mode_enabled ? (
            <div className="text-center py-6 text-gray-500">
              <Store className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Service provider mode is disabled</p>
              <p className="text-sm">Enable service mode to start accepting external jobs</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Service Status</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Service Mode:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Store Integration:</span>
                    <Badge variant={settings.accept_jobs_from_store ? "default" : "outline"}>
                      {settings.accept_jobs_from_store ? 'Connected' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auto Assignment:</span>
                    <Badge variant={settings.auto_job_assignment ? "default" : "outline"}>
                      {settings.auto_job_assignment ? 'Enabled' : 'Manual'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Service Configuration</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Delivery Radius:</span>
                    <Badge variant="outline">
                      {settings.delivery_radius_km || 10} km
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Service Fee:</span>
                    <Badge variant="outline">
                      {settings.default_service_fee_percent || 5}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Technologies:</span>
                    <Badge variant="outline">
                      {currentTechs.length} types
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Service Impact */}
          {settings.service_mode_enabled && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-sm mb-2">Service Mode Impact</h5>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Your makerspace will be visible as a service provider</p>
                {settings.accept_jobs_from_store && (
                  <p>• Jobs from MakrX.Store will be automatically routed within {settings.delivery_radius_km}km radius</p>
                )}
                {settings.auto_job_assignment && (
                  <p>• Compatible jobs will be automatically accepted without manual intervention</p>
                )}
                <p>• Service fee of {settings.default_service_fee_percent}% will be added to all external jobs</p>
                <p>• Supported technologies: {currentTechs.map(tech => tech.toUpperCase()).join(', ')}</p>
              </div>
            </div>
          )}
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
          Save Service Settings
        </Button>
      </div>
    </div>
  );
};

export default ServiceModeToggle;
