import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Calendar,
  Mail,
  Phone,
  Clock,
  Settings,
  Edit,
  Power,
  PowerOff,
  Package,
  FolderOpen,
  CreditCard,
  BarChart3,
  Wrench,
  GraduationCap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Makerspace {
  id: string;
  name: string;
  slug: string;
  location: string;
  address: string;
  subdomain?: string;
  createdAt: string;
  updatedAt: string;
  adminIds: string[];
  modules: string[];
  maxUsers?: number;
  maxEquipment?: number;
  timezone: string;
  country: string;
  status: 'active' | 'suspended' | 'pending';
  description?: string;
  contactEmail?: string;
  phone?: string;
  admins?: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    assignedAt: string;
  }>;
  stats?: {
    totalUsers: number;
    activeUsers: number;
    totalEquipment: number;
    activeReservations: number;
    inventoryValue: number;
    monthlyUsageHours: number;
    monthlyRevenue: number;
    projectCount: number;
    completedProjects: number;
  };
}

interface MakerspaceDetailProps {
  makerspace: Makerspace;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onStatusChange: (makerspaceId: string, newStatus: string) => void;
}

const MODULE_ICONS = {
  inventory: Package,
  projects: FolderOpen,
  reservations: Calendar,
  billing: CreditCard,
  analytics: BarChart3,
  maintenance: Wrench,
  skill_management: GraduationCap
};

const MODULE_NAMES = {
  inventory: 'Inventory Management',
  projects: 'Project Management', 
  reservations: 'Equipment Reservations',
  billing: 'Billing & Payments',
  analytics: 'Analytics & Reports',
  maintenance: 'Maintenance Tracking',
  skill_management: 'Skill Management'
};

const MakerspaceDetail: React.FC<MakerspaceDetailProps> = ({
  makerspace,
  isOpen,
  onClose,
  onEdit,
  onStatusChange
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            <PowerOff className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending Approval
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {makerspace.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge(makerspace.status)}
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">Location</div>
                      <div className="text-gray-600">{makerspace.location}</div>
                      <div className="text-sm text-gray-500 mt-1">{makerspace.address}</div>
                    </div>
                  </div>

                  {makerspace.subdomain && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">Subdomain</div>
                        <div className="text-gray-600">{makerspace.subdomain}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">Timezone</div>
                      <div className="text-gray-600">{makerspace.timezone}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {makerspace.contactEmail && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">Contact Email</div>
                        <div className="text-gray-600">{makerspace.contactEmail}</div>
                      </div>
                    </div>
                  )}

                  {makerspace.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">Phone</div>
                        <div className="text-gray-600">{makerspace.phone}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">Created</div>
                      <div className="text-gray-600">{formatDate(makerspace.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {makerspace.description && (
                <div className="mt-6 pt-6 border-t">
                  <div className="font-medium mb-2">Description</div>
                  <p className="text-gray-600">{makerspace.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          {makerspace.stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statistics & Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{makerspace.stats.totalUsers}</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                    <div className="text-xs text-gray-500">{makerspace.stats.activeUsers} active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{makerspace.stats.projectCount}</div>
                    <div className="text-sm text-gray-600">Projects</div>
                    <div className="text-xs text-gray-500">{makerspace.stats.completedProjects} completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{makerspace.stats.totalEquipment}</div>
                    <div className="text-sm text-gray-600">Equipment</div>
                    <div className="text-xs text-gray-500">{makerspace.stats.activeReservations} reserved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${makerspace.stats.monthlyRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                    <div className="text-xs text-gray-500">{makerspace.stats.monthlyUsageHours}h usage</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Administrators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Administrators
              </CardTitle>
            </CardHeader>
            <CardContent>
              {makerspace.admins && makerspace.admins.length > 0 ? (
                <div className="space-y-3">
                  {makerspace.admins.map((admin, index) => (
                    <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{admin.firstName} {admin.lastName}</div>
                        <div className="text-sm text-gray-600">{admin.email}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Assigned {formatDate(admin.assignedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p>No administrators assigned</p>
                  <p className="text-sm">This makerspace needs an administrator</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enabled Modules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Enabled Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {makerspace.modules.map((moduleKey) => {
                  const Icon = MODULE_ICONS[moduleKey as keyof typeof MODULE_ICONS] || Settings;
                  const name = MODULE_NAMES[moduleKey as keyof typeof MODULE_NAMES] || moduleKey;
                  
                  return (
                    <div key={moduleKey} className="flex items-center gap-3 p-3 border rounded-lg bg-green-50">
                      <Icon className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">{name}</span>
                    </div>
                  );
                })}
              </div>
              {makerspace.modules.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Settings className="h-8 w-8 mx-auto mb-2" />
                  <p>No modules enabled</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration & Limits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="font-medium">Max Users</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {makerspace.maxUsers || 'Unlimited'}
                  </div>
                  {makerspace.stats && (
                    <div className="text-sm text-gray-500">
                      {((makerspace.stats.totalUsers / (makerspace.maxUsers || 1)) * 100).toFixed(1)}% capacity
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium">Max Equipment</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {makerspace.maxEquipment || 'Unlimited'}
                  </div>
                  {makerspace.stats && (
                    <div className="text-sm text-gray-500">
                      {((makerspace.stats.totalEquipment / (makerspace.maxEquipment || 1)) * 100).toFixed(1)}% capacity
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium">URL Slug</div>
                  <div className="text-lg font-mono text-gray-800">
                    /{makerspace.slug}
                  </div>
                  <div className="text-sm text-gray-500">
                    Used in URLs and routing
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Makerspace
                </Button>
                
                {makerspace.status === 'active' && (
                  <Button 
                    variant="outline" 
                    onClick={() => onStatusChange(makerspace.id, 'suspended')}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <PowerOff className="h-4 w-4 mr-2" />
                    Suspend
                  </Button>
                )}
                
                {makerspace.status === 'suspended' && (
                  <Button 
                    variant="outline" 
                    onClick={() => onStatusChange(makerspace.id, 'active')}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <Power className="h-4 w-4 mr-2" />
                    Activate
                  </Button>
                )}
                
                {makerspace.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => onStatusChange(makerspace.id, 'active')}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => onStatusChange(makerspace.id, 'suspended')}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <PowerOff className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MakerspaceDetail;
