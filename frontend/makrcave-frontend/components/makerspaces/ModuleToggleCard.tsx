import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { useToast } from '../../hooks/use-toast';
import {
  Building2,
  Package,
  FolderOpen,
  Calendar,
  CreditCard,
  BarChart3,
  Wrench,
  GraduationCap,
  MapPin,
  Users,
  Settings
} from 'lucide-react';

interface Makerspace {
  id: string;
  name: string;
  location: string;
  modules: string[];
  stats?: {
    totalUsers: number;
    monthlyRevenue: number;
  };
}

interface ModuleToggleCardProps {
  makerspace: Makerspace;
  onUpdate: () => void;
}

const MODULE_CONFIG = {
  inventory: {
    name: 'Inventory Management',
    description: 'Track materials, supplies, and stock levels',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  projects: {
    name: 'Project Management',
    description: 'Create and manage member projects',
    icon: FolderOpen,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  reservations: {
    name: 'Equipment Reservations',
    description: 'Book and schedule equipment usage',
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  billing: {
    name: 'Billing & Payments',
    description: 'Handle memberships and payment processing',
    icon: CreditCard,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  analytics: {
    name: 'Analytics & Reports',
    description: 'Usage statistics and business insights',
    icon: BarChart3,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  },
  maintenance: {
    name: 'Maintenance Tracking',
    description: 'Equipment maintenance and schedules',
    icon: Wrench,
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  skill_management: {
    name: 'Skill Management',
    description: 'Member certifications and training',
    icon: GraduationCap,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100'
  }
};

const ModuleToggleCard: React.FC<ModuleToggleCardProps> = ({
  makerspace,
  onUpdate
}) => {
  const { toast } = useToast();
  const [updatingModules, setUpdatingModules] = useState<Set<string>>(new Set());

  const handleModuleToggle = async (moduleKey: string, enabled: boolean) => {
    setUpdatingModules(prev => new Set([...prev, moduleKey]));
    
    try {
      const response = await fetch(`/api/v1/makerspaces/${makerspace.id}/toggle-module`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleKey,
          enabled
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `${MODULE_CONFIG[moduleKey as keyof typeof MODULE_CONFIG]?.name} ${enabled ? 'enabled' : 'disabled'}`,
        });
        onUpdate();
      } else {
        toast({
          title: "Error",
          description: "Failed to update module",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update module",
        variant: "destructive",
      });
    } finally {
      setUpdatingModules(prev => {
        const newSet = new Set(prev);
        newSet.delete(moduleKey);
        return newSet;
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {makerspace.name}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <MapPin className="h-3 w-3" />
              {makerspace.location}
              {makerspace.stats && (
                <>
                  <span className="mx-2">•</span>
                  <Users className="h-3 w-3" />
                  {makerspace.stats.totalUsers} users
                </>
              )}
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50">
            {makerspace.modules.length} modules
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Module Configuration
          </h4>
          
          <div className="space-y-3">
            {Object.entries(MODULE_CONFIG).map(([moduleKey, config]) => {
              const isEnabled = makerspace.modules.includes(moduleKey);
              const isUpdating = updatingModules.has(moduleKey);
              const Icon = config.icon;

              return (
                <div 
                  key={moduleKey}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{config.name}</div>
                      <div className="text-sm text-gray-600">{config.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEnabled && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                        Active
                      </Badge>
                    )}
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleModuleToggle(moduleKey, checked)}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          {makerspace.stats && (
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Monthly Revenue:</span>
                  <div className="font-medium text-green-600">
                    ${makerspace.stats.monthlyRevenue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Active Users:</span>
                  <div className="font-medium text-blue-600">
                    {makerspace.stats.totalUsers}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleToggleCard;
