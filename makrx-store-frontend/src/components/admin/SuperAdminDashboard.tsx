"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, Activity, AlertTriangle, Globe, Database,
  Settings, FileText, Search, Filter, Download, RefreshCw,
  Eye, Edit, Trash2, Plus, Clock, CheckCircle, XCircle,
  BarChart3, PieChart, TrendingUp, Bell, Lock, Key,
  Monitor, Server, HardDrive, Wifi, UserCheck, UserX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertContent } from '@/components/ui/alert';

interface SystemHealth {
  api_status: 'healthy' | 'degraded' | 'unhealthy';
  database_status: 'healthy' | 'degraded' | 'unhealthy';
  redis_status: 'healthy' | 'degraded' | 'unhealthy';
  storage_status: 'healthy' | 'degraded' | 'unhealthy';
  response_time_ms: number;
  uptime_hours: number;
  active_users: number;
  error_rate: number;
}

interface SecurityAlert {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  user_id?: string;
  ip_address?: string;
  resolved: boolean;
}

interface UserActivity {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
}

interface SuperAdminDashboardProps {
  userRole: 'super_admin' | 'admin';
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API calls for super admin data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSystemHealth({
        api_status: 'healthy',
        database_status: 'healthy',
        redis_status: 'degraded',
        storage_status: 'healthy',
        response_time_ms: 145,
        uptime_hours: 168,
        active_users: 1247,
        error_rate: 0.02
      });

      setSecurityAlerts([
        {
          id: 'alert_1',
          type: 'failed_login',
          severity: 'medium',
          message: 'Multiple failed login attempts from IP 192.168.1.100',
          timestamp: '2024-01-07T10:30:00Z',
          ip_address: '192.168.1.100',
          resolved: false
        },
        {
          id: 'alert_2',
          type: 'suspicious_activity',
          severity: 'high',
          message: 'Unusual data access pattern detected for user admin@makrx.store',
          timestamp: '2024-01-07T09:15:00Z',
          user_id: 'user_123',
          resolved: false
        }
      ]);

      setUserActivities([
        {
          id: 'activity_1',
          user_id: 'user_123',
          user_email: 'admin@makrx.store',
          action: 'DELETE_PRODUCT',
          resource: 'Product ID: 456',
          timestamp: '2024-01-07T11:00:00Z',
          ip_address: '10.0.0.1',
          user_agent: 'Mozilla/5.0...',
          success: true
        }
      ]);
    } catch (error) {
      console.error('Failed to load super admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, type: 'health' | 'severity' = 'health') => {
    if (type === 'health') {
      const healthConfig = {
        healthy: { variant: 'default' as const, label: 'Healthy', color: 'text-green-600' },
        degraded: { variant: 'secondary' as const, label: 'Degraded', color: 'text-yellow-600' },
        unhealthy: { variant: 'destructive' as const, label: 'Unhealthy', color: 'text-red-600' }
      };
      const config = healthConfig[status as keyof typeof healthConfig];
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
              {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
            </h1>
            <p className="text-gray-600">
              {isSuperAdmin ? 'System-wide monitoring and administration' : 'Administrative tools and analytics'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={loadDashboardData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {isSuperAdmin && (
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export System Report
              </Button>
            )}
          </div>
        </div>

        {/* System Health Overview - Super Admin Only */}
        {isSuperAdmin && systemHealth && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">API Status</p>
                    {getStatusBadge(systemHealth.api_status)}
                    <p className="text-sm text-gray-500 mt-1">{systemHealth.response_time_ms}ms avg</p>
                  </div>
                  <Server className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Database</p>
                    {getStatusBadge(systemHealth.database_status)}
                    <p className="text-sm text-gray-500 mt-1">Primary + 2 replicas</p>
                  </div>
                  <Database className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{systemHealth.active_users}</p>
                    <p className="text-sm text-green-600">+5.2% from yesterday</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Uptime</p>
                    <p className="text-2xl font-bold text-gray-900">{systemHealth.uptime_hours}h</p>
                    <p className="text-sm text-blue-600">99.8% availability</p>
                  </div>
                  <Monitor className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isSuperAdmin ? 'grid-cols-6' : 'grid-cols-4'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            {isSuperAdmin && (
              <>
                <TabsTrigger value="system">System</TabsTrigger>
                <TabsTrigger value="audit">Audit</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Security Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Security Alerts
                  <Badge variant="destructive">{securityAlerts.filter(a => !a.resolved).length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(alert.severity, 'severity')}
                          <span className="text-sm text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900">{alert.message}</p>
                        {alert.ip_address && (
                          <p className="text-sm text-gray-600">IP: {alert.ip_address}</p>
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

            {/* Recent Admin Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Admin Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{activity.user_email}</span>
                          <Badge variant={activity.success ? 'default' : 'destructive'}>
                            {activity.action}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{activity.resource}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()} • {activity.ip_address}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
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
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* User Management */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
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
                Add User
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Comprehensive User Management</h3>
                  <p className="text-gray-500">Advanced user search, role management, and activity monitoring coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            {/* Security Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Failed Login Rate</span>
                        <span className="text-sm text-gray-600">0.8%</span>
                      </div>
                      <Progress value={0.8} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">2FA Adoption</span>
                        <span className="text-sm text-gray-600">67%</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Session Security</span>
                        <span className="text-sm text-gray-600">98%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <UserCheck className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Active Sessions</p>
                          <p className="text-sm text-gray-600">1,247 users online</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">View All</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <UserX className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">Suspended Accounts</p>
                          <p className="text-sm text-gray-600">3 accounts under review</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Security Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>All Security Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(alert.severity, 'severity')}
                          <span className="text-sm font-medium capitalize">{alert.type.replace('_', ' ')}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-900 mb-1">{alert.message}</p>
                        {alert.ip_address && (
                          <p className="text-sm text-gray-600">Source IP: {alert.ip_address}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          Investigate
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

          <TabsContent value="content" className="space-y-6">
            {/* Content Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Content Management System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Content Management</h3>
                  <p className="text-gray-500">Site-wide content management, announcements, and policy updates...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isSuperAdmin && (
            <>
              <TabsContent value="system" className="space-y-6">
                {/* System Monitoring */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">CPU Usage</span>
                            <span className="text-sm text-gray-600">45%</span>
                          </div>
                          <Progress value={45} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Memory Usage</span>
                            <span className="text-sm text-gray-600">67%</span>
                          </div>
                          <Progress value={67} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Disk Usage</span>
                            <span className="text-sm text-gray-600">23%</span>
                          </div>
                          <Progress value={23} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Service Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {systemHealth && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">API Gateway</span>
                            {getStatusBadge(systemHealth.api_status)}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Database</span>
                            {getStatusBadge(systemHealth.database_status)}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Redis Cache</span>
                            {getStatusBadge(systemHealth.redis_status)}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">File Storage</span>
                            {getStatusBadge(systemHealth.storage_status)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="audit" className="space-y-6">
                {/* Audit Logs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Audit Log Viewer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={activity.success ? 'default' : 'destructive'}>
                                {activity.action}
                              </Badge>
                              <span className="text-sm font-medium">{activity.user_email}</span>
                              <span className="text-sm text-gray-500">
                                {new Date(activity.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-900 mb-1">{activity.resource}</p>
                            <p className="text-sm text-gray-600">
                              IP: {activity.ip_address} • {activity.user_agent.substring(0, 50)}...
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {activity.success ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
