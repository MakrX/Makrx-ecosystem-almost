'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3, Users, Building2, Package, DollarSign, TrendingUp, 
  TrendingDown, Clock, Activity, AlertCircle, CheckCircle, 
  Download, Filter, Calendar, Cpu, Printer, Zap
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalMakerspaces: number;
    totalUsers: number;
    totalRevenue: number;
    activeEquipment: number;
    growthMetrics: {
      makerspaces: number;
      users: number;
      revenue: number;
      equipment: number;
    };
  };
  usage: {
    dailyActiveUsers: number[];
    equipmentUtilization: { name: string; usage: number; capacity: number }[];
    popularEquipment: { name: string; hours: number; bookings: number }[];
    peakHours: { hour: string; usage: number }[];
  };
  revenue: {
    monthlyRevenue: number[];
    revenueByMakerspace: { name: string; revenue: number; growth: number }[];
    subscriptionMetrics: { plan: string; count: number; revenue: number }[];
  };
  operational: {
    systemHealth: { service: string; status: 'healthy' | 'warning' | 'error'; uptime: number }[];
    maintenanceAlerts: { equipment: string; issue: string; priority: 'low' | 'medium' | 'high'; date: string }[];
    inventoryAlerts: { item: string; current: number; minimum: number; makerspace: string }[];
  };
}

const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalMakerspaces: 47,
    totalUsers: 1284,
    totalRevenue: 89650,
    activeEquipment: 312,
    growthMetrics: {
      makerspaces: 12.5,
      users: 23.8,
      revenue: 18.7,
      equipment: 8.3
    }
  },
  usage: {
    dailyActiveUsers: [120, 135, 158, 142, 167, 189, 156, 178, 165, 143, 192, 187, 201, 195, 168],
    equipmentUtilization: [
      { name: '3D Printers', usage: 78, capacity: 100 },
      { name: 'Laser Cutters', usage: 65, capacity: 80 },
      { name: 'CNC Machines', usage: 45, capacity: 60 },
      { name: 'Electronics Stations', usage: 82, capacity: 120 },
      { name: 'Workbenches', usage: 156, capacity: 200 }
    ],
    popularEquipment: [
      { name: 'Prusa i3 MK3S+', hours: 847, bookings: 156 },
      { name: 'Ultimaker S5', hours: 723, bookings: 134 },
      { name: 'Glowforge Pro', hours: 689, bookings: 198 },
      { name: 'Tormach PCNC 440', hours: 567, bookings: 89 },
      { name: 'Formlabs Form 3L', hours: 445, bookings: 76 }
    ],
    peakHours: [
      { hour: '9 AM', usage: 45 },
      { hour: '10 AM', usage: 67 },
      { hour: '11 AM', usage: 89 },
      { hour: '12 PM', usage: 95 },
      { hour: '1 PM', usage: 87 },
      { hour: '2 PM', usage: 92 },
      { hour: '3 PM', usage: 78 },
      { hour: '4 PM', usage: 65 },
      { hour: '5 PM', usage: 82 },
      { hour: '6 PM', usage: 74 },
      { hour: '7 PM', usage: 56 },
      { hour: '8 PM', usage: 34 }
    ]
  },
  revenue: {
    monthlyRevenue: [45680, 52340, 48920, 56780, 61450, 58930, 64200, 69780, 67240, 72560, 78940, 89650],
    revenueByMakerspace: [
      { name: 'TechHub Downtown', revenue: 12450, growth: 8.5 },
      { name: 'Innovation Lab NYC', revenue: 18650, growth: 15.2 },
      { name: 'MakerSpace Austin', revenue: 9870, growth: -2.1 },
      { name: 'Creative Factory LA', revenue: 14320, growth: 12.8 },
      { name: 'Seattle Maker Collective', revenue: 11280, growth: 6.7 }
    ],
    subscriptionMetrics: [
      { plan: 'Basic Maker', count: 456, revenue: 11400 },
      { plan: 'Professional', count: 234, revenue: 23400 },
      { plan: 'Service Provider', count: 89, revenue: 17800 },
      { plan: 'Enterprise', count: 23, revenue: 34500 }
    ]
  },
  operational: {
    systemHealth: [
      { service: 'Authentication Service', status: 'healthy', uptime: 99.9 },
      { service: 'Booking System', status: 'healthy', uptime: 99.7 },
      { service: 'Payment Processing', status: 'warning', uptime: 98.2 },
      { service: 'Equipment Monitoring', status: 'healthy', uptime: 99.5 },
      { service: 'Analytics Engine', status: 'healthy', uptime: 99.8 }
    ],
    maintenanceAlerts: [
      { equipment: 'Ultimaker S5 #3', issue: 'Nozzle replacement needed', priority: 'medium', date: '2024-01-22' },
      { equipment: 'Laser Cutter #2', issue: 'Mirror cleaning required', priority: 'low', date: '2024-01-21' },
      { equipment: 'CNC Mill #1', issue: 'Coolant system leak', priority: 'high', date: '2024-01-20' },
      { equipment: 'Prusa i3 #7', issue: 'Bed leveling required', priority: 'low', date: '2024-01-19' }
    ],
    inventoryAlerts: [
      { item: 'PLA Filament (Black)', current: 3, minimum: 5, makerspace: 'TechHub Downtown' },
      { item: 'Acrylic Sheets (3mm)', current: 2, minimum: 8, makerspace: 'Innovation Lab NYC' },
      { item: 'Aluminum Stock', current: 1, minimum: 3, makerspace: 'MakerSpace Austin' },
      { item: 'Electronics Components', current: 15, minimum: 20, makerspace: 'Creative Factory LA' }
    ]
  }
};

export default function AdminAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>(mockAnalyticsData);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights across all makerspaces</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Makerspaces</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalMakerspaces}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{data.overview.growthMetrics.makerspaces}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.totalUsers)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{data.overview.growthMetrics.users}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{data.overview.growthMetrics.revenue}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Equipment</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.activeEquipment}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{data.overview.growthMetrics.equipment}% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="operational">System Health</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Usage Analytics */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equipment Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Equipment Utilization</CardTitle>
                <CardDescription>Current usage across equipment categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.usage.equipmentUtilization.map((equipment, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{equipment.name}</span>
                        <span>{equipment.usage}/{equipment.capacity}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            equipment.usage / equipment.capacity > 0.8 ? 'bg-red-500' :
                            equipment.usage / equipment.capacity > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(equipment.usage / equipment.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Equipment */}
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Equipment</CardTitle>
                <CardDescription>By usage hours this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.usage.popularEquipment.map((equipment, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-xs font-semibold text-blue-700">
                          {index + 1}
                        </div>
                        <span className="font-medium">{equipment.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{equipment.hours}h</div>
                        <div className="text-xs text-gray-500">{equipment.bookings} bookings</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Peak Hours Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Usage Hours</CardTitle>
              <CardDescription>Average daily usage pattern</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-40">
                {data.usage.peakHours.map((hour, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${(hour.usage / 100) * 100}%` }}
                    />
                    <span className="text-xs text-gray-600 mt-1">{hour.hour}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Analytics */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Makerspace */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Makerspace</CardTitle>
                <CardDescription>Monthly performance comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.revenue.revenueByMakerspace.map((space, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{space.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatCurrency(space.revenue)}</span>
                        <div className={`flex items-center text-xs ${
                          space.growth >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {space.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(space.growth)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Breakdown</CardTitle>
                <CardDescription>Revenue by membership plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.revenue.subscriptionMetrics.map((plan, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{plan.plan}</span>
                        <div className="text-xs text-gray-500">{plan.count} members</div>
                      </div>
                      <span className="font-semibold">{formatCurrency(plan.revenue)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
              <CardDescription>Revenue growth over the past year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-40">
                {data.revenue.monthlyRevenue.map((revenue, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${(revenue / Math.max(...data.revenue.monthlyRevenue)) * 100}%` }}
                    />
                    <span className="text-xs text-gray-600 mt-1">
                      {new Date(2024, index).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Health */}
        <TabsContent value="operational" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Service status and uptime</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.operational.systemHealth.map((service, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{service.service}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{service.uptime}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Alerts</CardTitle>
                <CardDescription>Equipment requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.operational.maintenanceAlerts.map((alert, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{alert.equipment}</span>
                        <Badge className={getPriorityColor(alert.priority)}>
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{alert.issue}</p>
                      <span className="text-xs text-gray-500">{alert.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
              <CardDescription>Items running low on stock</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.operational.inventoryAlerts.map((alert, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{alert.item}</span>
                      <Badge className="bg-orange-100 text-orange-800">
                        Low Stock
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Current: {alert.current} | Minimum: {alert.minimum}</p>
                      <p>{alert.makerspace}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Usage Report</h3>
                    <p className="text-sm text-gray-600">Equipment utilization data</p>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Financial Report</h3>
                    <p className="text-sm text-gray-600">Revenue and expenses</p>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">Member Report</h3>
                    <p className="text-sm text-gray-600">User activity and growth</p>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="w-8 h-8 text-orange-600" />
                  <div>
                    <h3 className="font-semibold">Inventory Report</h3>
                    <p className="text-sm text-gray-600">Stock levels and usage</p>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="w-8 h-8 text-red-600" />
                  <div>
                    <h3 className="font-semibold">Performance Report</h3>
                    <p className="text-sm text-gray-600">System and equipment performance</p>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-8 h-8 text-gray-600" />
                  <div>
                    <h3 className="font-semibold">Custom Report</h3>
                    <p className="text-sm text-gray-600">Build your own report</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Configure
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
