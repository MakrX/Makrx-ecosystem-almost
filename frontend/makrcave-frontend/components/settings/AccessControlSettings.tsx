import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Users,
  UserPlus,
  Shield,
  Calendar,
  CheckCircle,
  Save,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';

interface MakerspaceSettings {
  membership_required?: boolean;
  public_registration?: boolean;
  skill_gated_access?: boolean;
  enable_reservations?: boolean;
  auto_approve_members?: boolean;
  require_safety_training?: boolean;
  equipment_access_logging?: boolean;
  visitor_registration_required?: boolean;
}

interface AccessControlSettingsProps {
  settings: MakerspaceSettings;
  onUpdate: (data: Partial<MakerspaceSettings>) => void;
  onSave: (data: any) => void;
  saving: boolean;
}

const AccessControlSettings: React.FC<AccessControlSettingsProps> = ({
  settings,
  onUpdate,
  onSave,
  saving
}) => {
  const handleToggle = (field: string, value: boolean) => {
    onUpdate({ [field]: value });
  };

  const handleSave = () => {
    const accessData = {
      membership_required: settings.membership_required,
      public_registration: settings.public_registration,
      skill_gated_access: settings.skill_gated_access,
      enable_reservations: settings.enable_reservations,
      auto_approve_members: settings.auto_approve_members,
      require_safety_training: settings.require_safety_training,
      equipment_access_logging: settings.equipment_access_logging,
      visitor_registration_required: settings.visitor_registration_required
    };
    onSave(accessData);
  };

  return (
    <div className="space-y-6">
      {/* Access Control Overview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Access Control Configuration</p>
              <p className="text-blue-700 mt-1">
                Configure how members and visitors can access your makerspace and its equipment. 
                These settings affect registration, equipment access, and safety requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Access Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Member Access Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Membership Required */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="membership_required" className="font-medium">
                  Membership Required
                </Label>
                {settings.membership_required && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Secure
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Require users to become members before accessing the makerspace
              </p>
            </div>
            <Switch
              id="membership_required"
              checked={settings.membership_required || false}
              onCheckedChange={(checked) => handleToggle('membership_required', checked)}
            />
          </div>

          {/* Public Registration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="public_registration" className="font-medium">
                  Public Registration
                </Label>
                {!settings.public_registration && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Invite Only
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Allow anyone to register as a member. If disabled, members must be invited.
              </p>
            </div>
            <Switch
              id="public_registration"
              checked={settings.public_registration || false}
              onCheckedChange={(checked) => handleToggle('public_registration', checked)}
            />
          </div>

          {/* Auto-approve Members */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="auto_approve_members" className="font-medium">
                  Auto-approve Member Requests
                </Label>
                {settings.auto_approve_members && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Automatic
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Automatically approve new member registrations without manual review
              </p>
            </div>
            <Switch
              id="auto_approve_members"
              checked={settings.auto_approve_members || false}
              onCheckedChange={(checked) => handleToggle('auto_approve_members', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Equipment Access Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Equipment Access Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Skill-gated Access */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="skill_gated_access" className="font-medium">
                  Skill-gated Machine Access
                </Label>
                {settings.skill_gated_access && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Protected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Require members to complete training or demonstrate skills before accessing equipment
              </p>
            </div>
            <Switch
              id="skill_gated_access"
              checked={settings.skill_gated_access || false}
              onCheckedChange={(checked) => handleToggle('skill_gated_access', checked)}
            />
          </div>

          {/* Equipment Reservations */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="enable_reservations" className="font-medium">
                  Enable Equipment Reservations
                </Label>
                {settings.enable_reservations && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <Calendar className="h-3 w-3 mr-1" />
                    Scheduling
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Allow members to reserve equipment time slots in advance
              </p>
            </div>
            <Switch
              id="enable_reservations"
              checked={settings.enable_reservations || false}
              onCheckedChange={(checked) => handleToggle('enable_reservations', checked)}
            />
          </div>

          {/* Equipment Access Logging */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="equipment_access_logging" className="font-medium">
                  Equipment Access Logging
                </Label>
                {settings.equipment_access_logging && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-800">
                    <Info className="h-3 w-3 mr-1" />
                    Tracking
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Log all equipment access for safety, maintenance, and usage tracking
              </p>
            </div>
            <Switch
              id="equipment_access_logging"
              checked={settings.equipment_access_logging || false}
              onCheckedChange={(checked) => handleToggle('equipment_access_logging', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Safety & Compliance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Safety & Compliance Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Safety Training Requirement */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="require_safety_training" className="font-medium">
                  Require Safety Training
                </Label>
                {settings.require_safety_training && (
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Mandatory
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Require all members to complete safety training before equipment access
              </p>
            </div>
            <Switch
              id="require_safety_training"
              checked={settings.require_safety_training || false}
              onCheckedChange={(checked) => handleToggle('require_safety_training', checked)}
            />
          </div>

          {/* Visitor Registration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="visitor_registration_required" className="font-medium">
                  Visitor Registration Required
                </Label>
                {settings.visitor_registration_required && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    <UserPlus className="h-3 w-3 mr-1" />
                    Registration
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Require visitors to register before entering the makerspace
              </p>
            </div>
            <Switch
              id="visitor_registration_required"
              checked={settings.visitor_registration_required || false}
              onCheckedChange={(checked) => handleToggle('visitor_registration_required', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Access Control Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Access Control Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Member Access</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span>Membership Required:</span>
                  <Badge variant={settings.membership_required ? "default" : "outline"}>
                    {settings.membership_required ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Public Registration:</span>
                  <Badge variant={settings.public_registration ? "default" : "outline"}>
                    {settings.public_registration ? 'Allowed' : 'Invite Only'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Auto-approve:</span>
                  <Badge variant={settings.auto_approve_members ? "default" : "outline"}>
                    {settings.auto_approve_members ? 'Yes' : 'Manual'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Equipment & Safety</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span>Skill-gated Access:</span>
                  <Badge variant={settings.skill_gated_access ? "default" : "outline"}>
                    {settings.skill_gated_access ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reservations:</span>
                  <Badge variant={settings.enable_reservations ? "default" : "outline"}>
                    {settings.enable_reservations ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Safety Training:</span>
                  <Badge variant={settings.require_safety_training ? "default" : "outline"}>
                    {settings.require_safety_training ? 'Required' : 'Optional'}
                  </Badge>
                </div>
              </div>
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
          Save Access Settings
        </Button>
      </div>
    </div>
  );
};

export default AccessControlSettings;
