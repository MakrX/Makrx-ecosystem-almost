import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Wrench,
  CreditCard,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import UsageDashboard from '../components/analytics/UsageDashboard';
import InventoryInsights from '../components/analytics/InventoryInsights';
import EquipmentMetrics from '../components/analytics/EquipmentMetrics';
import ProjectAnalytics from '../components/analytics/ProjectAnalytics';
import RevenueCharts from '../components/analytics/RevenueCharts';

import DataExports from '../components/analytics/DataExports';

interface AnalyticsOverview {
  total_users: number;
  active_users_today: number;
  active_users_week: number;
  total_projects: number;
  active_projects: number;
  total_equipment: number;
  equipment_in_use: number;
  total_inventory_items: number;
  low_stock_items: number;
  total_revenue: number;
  revenue_this_month: number;
}

interface DashboardSection {
  section_id: string;
  title: string;
  charts: Array<{
    title: string;
    data: Array<{
      label: string;
      value: number;
      date?: string;
      metadata?: any;
    }>;
    chart_type: string;
    x_axis_label?: string;
    y_axis_label?: string;
  }>;
  summary_stats?: any;
  last_updated: string;
}

interface AnalyticsDashboard {
  overview: AnalyticsOverview;
  sections: DashboardSection[];
  generated_at: string;
  cache_expires_at: string;
}

const Analytics: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();

  // Check if user has analytics access
  const context = {
    isAssignedMakerspace: user?.assignedMakerspaces && user.assignedMakerspaces.length > 0,
    isOwnResource: false,
    isCertified: false
  };

  if (!hasPermission('analytics', 'view', context)) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">You don't have permission to view analytics data</p>
          <p className="text-sm text-gray-500">Contact your administrator for access</p>
        </div>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        setLastRefresh(new Date());
      } else if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view analytics",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
      toast({
        title: "Success",
        description: "Analytics data refreshed",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Unavailable</h3>
          <p className="text-gray-600 mb-4">Unable to load analytics data</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  const { overview } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics & Reports
          </h1>
          <p className="text-gray-600">Monitor usage, performance, and insights across your makerspace</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Updated {lastRefresh.toLocaleTimeString()}
            </Badge>
          )}

          <Button 
            onClick={refreshData} 
            disabled={refreshing}
            variant="outline"
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{overview.total_users}</p>
                <p className="text-xs text-gray-500">
                  {overview.active_users_today} active today
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
                <p className="text-sm font-medium text-gray-600">Projects</p>
                <p className="text-2xl font-bold text-gray-900">{overview.total_projects}</p>
                <p className="text-xs text-green-600">
                  {overview.active_projects} active
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Equipment</p>
                <p className="text-2xl font-bold text-gray-900">{overview.total_equipment}</p>
                <p className="text-xs text-orange-600">
                  {overview.equipment_in_use} in use
                </p>
              </div>
              <Wrench className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(overview.total_revenue)}
                </p>
                <p className="text-xs text-green-600">
                  {formatCurrency(overview.revenue_this_month)} this month
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Bar */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-blue-600">Weekly Active Users</p>
              <p className="text-lg font-bold text-blue-900">{overview.active_users_week}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Inventory Items</p>
              <p className="text-lg font-bold text-blue-900">{overview.total_inventory_items}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Low Stock Alerts</p>
              <p className="text-lg font-bold text-red-600">{overview.low_stock_items}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Equipment Utilization</p>
              <p className="text-lg font-bold text-blue-900">
                {formatPercentage(overview.equipment_in_use, overview.total_equipment)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Equipment
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="exports" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Data Exports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData.sections.map((section) => (
              <Card key={section.section_id}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {section.charts[0] && (
                    <div className="h-64">
                      {/* Chart component would go here */}
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Chart: {section.charts[0].title}
                      </div>
                    </div>
                  )}
                  {section.summary_stats && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        {Object.entries(section.summary_stats).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <p className="text-gray-600 capitalize">{key.replace('_', ' ')}</p>
                            <p className="font-semibold">
                              {typeof value === 'number' ? 
                                (key.includes('revenue') || key.includes('cost') ? 
                                  formatCurrency(value) : 
                                  value.toLocaleString()
                                ) : 
                                String(value)
                              }
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Usage Dashboard Tab */}
        <TabsContent value="usage" className="space-y-6">
          <UsageDashboard />
        </TabsContent>

        {/* Inventory Insights Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <InventoryInsights />
        </TabsContent>

        {/* Equipment Metrics Tab */}
        <TabsContent value="equipment" className="space-y-6">
          <EquipmentMetrics />
        </TabsContent>

        {/* Revenue Charts Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <RevenueCharts />
        </TabsContent>

        {/* Data Exports Tab */}
        <TabsContent value="exports" className="space-y-6">
          <DataExports />
        </TabsContent>
      </Tabs>


    </div>
  );
};

export default Analytics;
