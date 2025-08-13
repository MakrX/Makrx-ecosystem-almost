import React, { useState, useEffect } from 'react';
import { 
  Users, Settings, BarChart3, Shield, Activity, AlertTriangle,
  Building2, Globe, Database, Server, Monitor, Wifi, Clock,
  CheckCircle, XCircle, Eye, Edit, Trash2, Plus, Search,
  Filter, Download, RefreshCw, Bell, UserCheck, UserX,
  Package, Tool, Calendar, DollarSign, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Alert, AlertContent } from '../ui/alert';

interface MakerspaceMetrics {
  total_members: number;
  active_members: number;
  equipment_count: number;
  utilization_rate: number;
  revenue_monthly: number;
  pending_certifications: number;
  safety_incidents: number;
  space_occupancy: number;
}

interface EquipmentStatus {
  id: string;
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'offline' | 'reserved';
  utilization: number;
  last_maintenance: string;
  next_maintenance: string;
  current_user?: string;
}

interface AdminActivity {
  id: string;
  admin_email: string;
  action: string;
  target: string;
  timestamp: string;
  success: boolean;
  details?: string;
}

interface SafetyAlert {
  id: string;
  type: 'incident' | 'maintenance_due' | 'certification_expired' | 'capacity_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  assigned_to?: string;
}

interface EnhancedAdminDashboardProps {
  userRole: 'super_admin' | 'makerspace_admin' | 'admin';
  makerspaceId?: string;
}

const EnhancedAdminDashboard: React.FC<EnhancedAdminDashboardProps> = ({ 
  userRole, 
  makerspaceId 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<MakerspaceMetrics | null>(null);
  const [equipmentStatus, setEquipmentStatus] = useState<EquipmentStatus[]>([]);
  const [adminActivities, setAdminActivities] = useState<AdminActivity[]>([]);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [makerspaceId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        total_members: 342,
        active_members: 267,
        equipment_count: 45,
        utilization_rate: 78,
        revenue_monthly: 125000,
        pending_certifications: 23,
        safety_incidents: 2,
        space_occupancy: 65
      });

      setEquipmentStatus([
        {
          id: 'eq_1',
          name: 'Bambu Lab X1 Carbon #1',
          type: '3D Printer',
          status: 'operational',
          utilization: 85,
          last_maintenance: '2024-01-01',
          next_maintenance: '2024-02-01',
          current_user: 'john@example.com'
        },
        {
          id: 'eq_2',
          name: 'Laser Cutter Pro',
          type: 'Laser Cutter',
          status: 'maintenance',
          utilization: 0,
          last_maintenance: '2024-01-05',
          next_maintenance: '2024-01-15'
        }
      ]);

      setAdminActivities([
        {
          id: 'act_1',
          admin_email: 'admin@makrx.cave',
          action: 'EQUIPMENT_MAINTENANCE',
          target: 'Bambu Lab X1 Carbon #2',
          timestamp: '2024-01-07T10:30:00Z',
          success: true,
          details: 'Scheduled maintenance completed'
        }
      ]);

      setSafetyAlerts([
        {
          id: 'alert_1',
          type: 'maintenance_due',
          severity: 'medium',
          message: 'CNC Machine requires scheduled maintenance within 48 hours',
          timestamp: '2024-01-07T09:00:00Z',
          resolved: false,
          assigned_to: 'tech@makrx.cave'
        },
        {
          id: 'alert_2',
          type: 'certification_expired',
          severity: 'high',
          message: 'Safety certification expired for laser cutter operations',
          timestamp: '2024-01-06T14:30:00Z',
          resolved: false
        }
      ]);
    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, type: 'equipment' | 'severity' = 'equipment') => {
    if (type === 'equipment') {
      const equipmentConfig = {
        operational: { variant: 'default' as const, label: 'Operational', color: 'text-green-600' },
        maintenance: { variant: 'secondary' as const, label: 'Maintenance', color: 'text-yellow-600' },
        offline: { variant: 'destructive' as const, label: 'Offline', color: 'text-red-600' },
        reserved: { variant: 'secondary' as const, label: 'Reserved', color: 'text-blue-600' }
      };
      const config = equipmentConfig[status as keyof typeof equipmentConfig];
      return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
    } else {
      const severityConfig = {
        low: { variant: 'secondary' as const, label: 'Low' },
        medium: { variant: 'secondary' as const, label: 'Medium' },
        high: { variant: 'destructive' as const, label: 'High' },
        critical: { variant: 'destructive' as const, label: 'Critical' }
      };
      const config = severityConfig[status as keyof typeof severityConfig];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    }
  };

  const isSuperAdmin = userRole === 'super_admin';
  const isMakerspaceAdmin = userRole === 'makerspace_admin' || userRole === 'super_admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isSuperAdmin ? 'Super Admin Dashboard' : 'Makerspace Admin Dashboard'}
            </h1>
            <p className="text-gray-600">
              {isSuperAdmin ? 'Global makerspace management and monitoring' : 'Manage members, equipment, and operations'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={loadDashboardData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Members</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.active_members}/{metrics.total_members}
                    </p>
                    <p className="text-sm text-green-600">
                      {Math.round((metrics.active_members / metrics.total_members) * 100)}% active
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Equipment Status</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.equipment_count}</p>
                    <p className="text-sm text-green-600">{metrics.utilization_rate}% utilization</p>
                  </div>
                  <Package className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{metrics.revenue_monthly.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">+12% from last month</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Space Occupancy</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.space_occupancy}%</p>
                    <p className="text-sm text-blue-600">Real-time monitoring</p>
                  </div>
                  <Building2 className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isSuperAdmin ? 'grid-cols-7' : 'grid-cols-6'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="global">Global</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Safety Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Safety Alerts
                  <Badge variant="destructive">{safetyAlerts.filter(a => !a.resolved).length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safetyAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(alert.severity, 'severity')}
                          <span className="text-sm font-medium capitalize">{alert.type.replace('_', ' ')}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900">{alert.message}</p>
                        {alert.assigned_to && (
                          <p className="text-sm text-gray-600">Assigned to: {alert.assigned_to}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Equipment Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Equipment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {equipmentStatus.slice(0, 5).map((equipment) => (
                      <div key={equipment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{equipment.name}</span>
                            {getStatusBadge(equipment.status)}
                          </div>
                          <p className="text-sm text-gray-600">{equipment.type}</p>
                          {equipment.current_user && (
                            <p className="text-xs text-blue-600">In use by: {equipment.current_user}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{equipment.utilization}%</p>
                          <Progress value={equipment.utilization} className="w-16 h-2 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Admin Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {adminActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={activity.success ? 'default' : 'destructive'}>
                              {activity.action}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(activity.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900">{activity.target}</p>
                          <p className="text-sm text-gray-600">{activity.admin_email}</p>
                          {activity.details && (
                            <p className="text-xs text-gray-500">{activity.details}</p>
                          )}
                        </div>
                        <div className="flex items-center">
                          {activity.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            {/* Member Management */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Member Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Enhanced Member Management</h3>
                  <p className="text-gray-500">Advanced member search, certification tracking, and activity monitoring...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            {/* Equipment Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tool className="h-5 w-5" />
                  Equipment Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipmentStatus.map((equipment) => (
                    <div key={equipment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-lg">{equipment.name}</span>
                          {getStatusBadge(equipment.status)}
                        </div>
                        <p className="text-gray-600 mb-1">{equipment.type}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">Last Maintenance:</span> {equipment.last_maintenance}
                          </div>
                          <div>
                            <span className="font-medium">Next Maintenance:</span> {equipment.next_maintenance}
                          </div>
                        </div>
                        {equipment.current_user && (
                          <p className="text-sm text-blue-600 mt-1">
                            Currently in use by: {equipment.current_user}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">Utilization</p>
                          <p className="text-2xl font-bold text-blue-600">{equipment.utilization}%</p>
                          <Progress value={equipment.utilization} className="w-20 h-2 mt-1" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety" className="space-y-6">
            {/* Safety Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Safety Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safetyAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(alert.severity, 'severity')}
                          <span className="font-medium capitalize">{alert.type.replace('_', ' ')}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-900 mb-1">{alert.message}</p>
                        {alert.assigned_to && (
                          <p className="text-sm text-gray-600">Assigned to: {alert.assigned_to}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          Assign
                        </Button>
                        {!alert.resolved && (
                          <Button size="sm">
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Peak Usage Hours</span>
                        <span className="text-sm text-gray-600">2-6 PM</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Member Satisfaction</span>
                        <span className="text-sm text-gray-600">4.6/5.0</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Equipment Efficiency</span>
                        <span className="text-sm text-gray-600">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Monthly Growth</p>
                          <p className="text-sm text-gray-600">+12% vs last month</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-green-600">₹15,000</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">New Members</p>
                          <p className="text-sm text-gray-600">This month</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-blue-600">23</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Makerspace Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Settings</h3>
                  <p className="text-gray-500">Operating hours, pricing policies, safety protocols, and module management...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="global" className="space-y-6">
              {/* Global Management - Super Admin Only */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Global Makerspace Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Global Operations</h3>
                    <p className="text-gray-500">Cross-makerspace analytics, global user management, and system administration...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
