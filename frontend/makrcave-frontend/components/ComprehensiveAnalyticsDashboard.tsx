import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePicker } from './ui/date-picker';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RechartsProps
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, Users, DollarSign, Settings,
  Zap, AlertTriangle, CheckCircle, Clock, Download, RefreshCw,
  Target, Award, Calendar, Filter, Eye, BarChart3, PieChart as PieChartIcon,
  LineChart as LineChartIcon, Calendar as CalendarIcon, Gauge, Brain,
  Lightbulb, Shield, Bell, FileText, Database, Cpu, Heart
} from 'lucide-react';

interface KPIMetric {
  name: string;
  value: number | string;
  previous_value?: number | string;
  change_percentage?: number;
  trend?: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  unit?: string;
  target?: number;
}

interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
  category?: string;
  metadata?: Record<string, any>;
}

interface AnalyticsChart {
  chart_id: string;
  title: string;
  chart_type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap';
  data: ChartDataPoint[];
  x_axis_label?: string;
  y_axis_label?: string;
  color_scheme?: string[];
  annotations?: any[];
}

interface DashboardSection {
  section_id: string;
  title: string;
  description?: string;
  kpi_metrics: KPIMetric[];
  charts: AnalyticsChart[];
  alerts?: AnalyticsAlert[];
  last_updated: string;
  refresh_interval?: number;
}

interface AnalyticsAlert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface ComprehensiveDashboard {
  makerspace_id: string;
  dashboard_title: string;
  overview_metrics: KPIMetric[];
  sections: DashboardSection[];
  generated_at: string;
  cache_expires_at: string;
  data_freshness: Record<string, string>;
  performance_score: number;
}

interface RealtimeMetrics {
  active_users: number;
  equipment_in_use: number;
  current_utilization: number;
  pending_jobs: number;
  alerts: number;
  timestamp: string;
}

interface PerformanceBenchmark {
  id: string;
  benchmark_name: string;
  current_value: number;
  target_value: number;
  performance_percentage: number;
  achievement_status: 'exceeded' | 'met' | 'below' | 'critical';
  trend_direction?: 'up' | 'down' | 'stable';
}

const ComprehensiveAnalyticsDashboard: React.FC = () => {
  // State management
  const [dashboard, setDashboard] = useState<ComprehensiveDashboard | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null);
  const [benchmarks, setBenchmarks] = useState<PerformanceBenchmark[]>([]);
  const [alerts, setAlerts] = useState<AnalyticsAlert[]>([]);
  
  // UI state
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('last_30_days');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  
  // Modal states
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);

  // Load dashboard data
  const loadDashboard = useCallback(async (refreshCache: boolean = false) => {
    setLoading(!dashboard || refreshCache);
    setRefreshing(refreshCache);
    
    try {
      const response = await fetch(`/api/enhanced-analytics/dashboard/comprehensive?refresh_cache=${refreshCache}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboard(data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dashboard]);

  const loadRealtimeMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/enhanced-analytics/realtime/metrics', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRealtimeMetrics(data);
      }
    } catch (error) {
      console.error('Failed to load realtime metrics:', error);
    }
  }, []);

  const loadBenchmarks = useCallback(async () => {
    try {
      const response = await fetch('/api/enhanced-analytics/benchmarks/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBenchmarks(data);
      }
    } catch (error) {
      console.error('Failed to load benchmarks:', error);
    }
  }, []);

  const loadAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/enhanced-analytics/alerts/?is_active=true', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDashboard();
    loadRealtimeMetrics();
    loadBenchmarks();
    loadAlerts();
  }, [loadDashboard, loadRealtimeMetrics, loadBenchmarks, loadAlerts]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadRealtimeMetrics();
      if (refreshInterval <= 60) { // Only refresh dashboard every minute at most
        loadDashboard(true);
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadDashboard, loadRealtimeMetrics]);

  // Utility functions
  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatValue = (value: number | string, unit?: string) => {
    if (typeof value === 'number') {
      if (unit === 'USD' || unit === '$') {
        return `$${value.toLocaleString()}`;
      }
      if (unit === '%') {
        return `${value.toFixed(1)}%`;
      }
      return value.toLocaleString();
    }
    return value;
  };

  // Chart rendering functions
  const renderChart = (chart: AnalyticsChart) => {
    const colors = chart.color_scheme || ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    const commonProps = {
      data: chart.data,
      width: '100%',
      height: 300
    };

    switch (chart.chart_type) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]} 
                strokeWidth={2}
                dot={{ fill: colors[0] }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={colors[0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ label, percent }: any) => `${label} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chart.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]} 
                fill={colors[0]} 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div className="text-center py-8 text-gray-500">Chart type not supported</div>;
    }
  };

  // Render KPI card
  const renderKPICard = (metric: KPIMetric) => (
    <Card key={metric.name} className={`border-l-4 ${getStatusColor(metric.status)}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{metric.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">
                {formatValue(metric.value, metric.unit)}
              </p>
              {metric.change_percentage !== undefined && (
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.change_percentage > 0 ? '+' : ''}{metric.change_percentage.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            {metric.target && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Target: {formatValue(metric.target, metric.unit)}</span>
                  <span>
                    {((Number(metric.value) / metric.target) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (Number(metric.value) / metric.target) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render realtime metrics bar
  const renderRealtimeMetrics = () => (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-green-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Data</span>
            </div>
            {realtimeMetrics && (
              <>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">{realtimeMetrics.active_users} Active Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{realtimeMetrics.equipment_in_use} Equipment in Use</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">{realtimeMetrics.current_utilization}% Utilization</span>
                </div>
                {realtimeMetrics.alerts > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">{realtimeMetrics.alerts} Alerts</span>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAutoRefresh(!autoRefresh);
              }}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
            >
              {refreshing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render alerts summary
  const renderAlertsBar = () => {
    if (alerts.length === 0) return null;

    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const highAlerts = alerts.filter(a => a.severity === 'high').length;
    
    return (
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <span className="font-medium text-red-800">Active Alerts</span>
                <div className="text-sm text-red-600">
                  {criticalAlerts > 0 && `${criticalAlerts} Critical`}
                  {criticalAlerts > 0 && highAlerts > 0 && ', '}
                  {highAlerts > 0 && `${highAlerts} High Priority`}
                  {criticalAlerts === 0 && highAlerts === 0 && `${alerts.length} Total`}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAlertsModal(true)}
            >
              View All Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render performance benchmarks
  const renderBenchmarks = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Performance Benchmarks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {benchmarks.slice(0, 4).map(benchmark => (
            <div key={benchmark.id} className="text-center">
              <div className="mb-2">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  benchmark.achievement_status === 'exceeded' ? 'bg-green-100 text-green-800' :
                  benchmark.achievement_status === 'met' ? 'bg-blue-100 text-blue-800' :
                  benchmark.achievement_status === 'below' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {benchmark.achievement_status}
                </div>
              </div>
              <div className="text-lg font-bold">{benchmark.performance_percentage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">{benchmark.benchmark_name}</div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      benchmark.achievement_status === 'exceeded' ? 'bg-green-500' :
                      benchmark.achievement_status === 'met' ? 'bg-blue-500' :
                      benchmark.achievement_status === 'below' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, benchmark.performance_percentage)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (loading && !dashboard) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading comprehensive analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Failed to load analytics dashboard</p>
          <Button onClick={() => loadDashboard()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{dashboard.dashboard_title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>Performance Score: {dashboard.performance_score.toFixed(1)}/100</span>
            <span>•</span>
            <span>Last Updated: {new Date(dashboard.generated_at).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFiltersModal(true)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowExportModal(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => loadDashboard(true)} disabled={refreshing}>
            {refreshing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* Realtime Metrics Bar */}
      {renderRealtimeMetrics()}

      {/* Alerts Bar */}
      {renderAlertsBar()}

      {/* Performance Benchmarks */}
      {renderBenchmarks()}

      {/* Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {dashboard.overview_metrics.map(renderKPICard)}
      </div>

      {/* Dashboard Sections */}
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        {dashboard.sections.map(section => (
          <TabsContent key={section.section_id} value={section.section_id} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{section.title}</h2>
                {section.description && (
                  <p className="text-gray-600">{section.description}</p>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date(section.last_updated).toLocaleString()}
              </div>
            </div>

            {/* Section KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {section.kpi_metrics.map(renderKPICard)}
            </div>

            {/* Section Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {section.charts.map(chart => (
                <Card key={chart.chart_id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {chart.chart_type === 'line' && <LineChartIcon className="w-5 h-5" />}
                      {chart.chart_type === 'bar' && <BarChart3 className="w-5 h-5" />}
                      {chart.chart_type === 'pie' && <PieChartIcon className="w-5 h-5" />}
                      {chart.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderChart(chart)}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Section Alerts */}
            {section.alerts && section.alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Section Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.alerts.map(alert => (
                      <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="text-sm mt-1">{alert.description}</p>
                          </div>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Modals */}
      {showFiltersModal && (
        <Dialog open={showFiltersModal} onOpenChange={setShowFiltersModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Dashboard Filters</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Time Range</label>
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Auto-refresh Interval</label>
                <Select value={refreshInterval.toString()} onValueChange={(v) => setRefreshInterval(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showExportModal && (
        <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Export Analytics Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2" />
                Export functionality will be implemented here
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showAlertsModal && (
        <Dialog open={showAlertsModal} onOpenChange={setShowAlertsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Active Alerts</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {alerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm mt-1">{alert.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {alert.alert_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ComprehensiveAnalyticsDashboard;
