import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  Settings,
  Zap,
  Activity,
  Target,
  Gauge,
  Maximize2,
  Brain,
  Layers3,
  Timer,
  UserCheck,
  WifiOff,
  Wifi,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCw,
  Download,
  Filter,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMakerspace } from '../contexts/MakerspaceContext';
import RealTimeOccupancyMonitor from '../components/capacity/RealTimeOccupancyMonitor';
import SpaceUtilizationAnalytics from '../components/capacity/SpaceUtilizationAnalytics';
import ResourceOptimizationEngine from '../components/capacity/ResourceOptimizationEngine';
import CapacityForecastingWidget from '../components/capacity/CapacityForecastingWidget';
import ZoneManagementPanel from '../components/capacity/ZoneManagementPanel';
import PeakTimeAnalysis from '../components/capacity/PeakTimeAnalysis';
import CapacityAlerts from '../components/capacity/CapacityAlerts';

interface CapacityMetrics {
  current_occupancy: number;
  max_capacity: number;
  utilization_rate: number;
  average_session_duration: number;
  peak_hours: string[];
  bottleneck_resources: string[];
  efficiency_score: number;
  zones: Array<{
    id: string;
    name: string;
    current_occupancy: number;
    max_capacity: number;
    status: 'optimal' | 'high' | 'critical' | 'low';
    equipment_count: number;
    avg_session_time: number;
  }>;
  trends: {
    daily_pattern: Array<{ hour: number; occupancy: number; efficiency: number }>;
    weekly_pattern: Array<{ day: string; avg_occupancy: number; peak_time: string }>;
    monthly_growth: number;
  };
  recommendations: Array<{
    type: 'capacity' | 'scheduling' | 'equipment' | 'zone';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    effort: string;
  }>;
}

const CapacityPlanning: React.FC = () => {
  const { user } = useAuth();
  const { currentMakerspace } = useMakerspace();
  const [metrics, setMetrics] = useState<CapacityMetrics | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadCapacityMetrics();
    
    // Auto-refresh every 2 minutes
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadCapacityMetrics();
        setLastUpdated(new Date());
      }, 120000);
      
      return () => clearInterval(interval);
    }
  }, [selectedTimeRange, autoRefresh]);

  const loadCapacityMetrics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/capacity/metrics?timeRange=${selectedTimeRange}&makerspaceId=${currentMakerspace?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        // Mock data for development
        setMetrics(generateMockCapacityMetrics());
      }
    } catch (error) {
      console.error('Error loading capacity metrics:', error);
      setMetrics(generateMockCapacityMetrics());
    } finally {
      setLoading(false);
    }
  };

  const generateMockCapacityMetrics = (): CapacityMetrics => ({
    current_occupancy: 28,
    max_capacity: 45,
    utilization_rate: 62.2,
    average_session_duration: 3.5,
    peak_hours: ['10:00', '14:00', '19:00'],
    bottleneck_resources: ['3D Printers', 'Laser Cutter', 'Electronics Lab'],
    efficiency_score: 78,
    zones: [
      {
        id: 'main-workshop',
        name: 'Main Workshop',
        current_occupancy: 12,
        max_capacity: 20,
        status: 'optimal',
        equipment_count: 8,
        avg_session_time: 2.5
      },
      {
        id: 'electronics-lab',
        name: 'Electronics Lab',
        current_occupancy: 8,
        max_capacity: 10,
        status: 'high',
        equipment_count: 12,
        avg_session_time: 4.2
      },
      {
        id: '3d-printing',
        name: '3D Printing Bay',
        current_occupancy: 6,
        max_capacity: 8,
        status: 'high',
        equipment_count: 6,
        avg_session_time: 5.8
      },
      {
        id: 'meeting-room',
        name: 'Collaboration Space',
        current_occupancy: 2,
        max_capacity: 12,
        status: 'low',
        equipment_count: 2,
        avg_session_time: 1.8
      }
    ],
    trends: {
      daily_pattern: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        occupancy: Math.round(Math.random() * 40 + 5),
        efficiency: Math.round(Math.random() * 30 + 60)
      })),
      weekly_pattern: [
        { day: 'Mon', avg_occupancy: 28, peak_time: '14:00' },
        { day: 'Tue', avg_occupancy: 32, peak_time: '10:00' },
        { day: 'Wed', avg_occupancy: 35, peak_time: '15:00' },
        { day: 'Thu', avg_occupancy: 31, peak_time: '11:00' },
        { day: 'Fri', avg_occupancy: 25, peak_time: '16:00' },
        { day: 'Sat', avg_occupancy: 22, peak_time: '13:00' },
        { day: 'Sun', avg_occupancy: 18, peak_time: '15:00' }
      ],
      monthly_growth: 12.5
    },
    recommendations: [
      {
        type: 'capacity',
        priority: 'high',
        title: 'Add 3D Printing Capacity',
        description: 'High demand for 3D printers during peak hours (85% utilization)',
        impact: '+15% capacity',
        effort: 'Medium'
      },
      {
        type: 'scheduling',
        priority: 'medium',
        title: 'Optimize Peak Hour Distribution',
        description: 'Implement dynamic pricing to distribute peak loads',
        impact: '+22% efficiency',
        effort: 'Low'
      },
      {
        type: 'zone',
        priority: 'medium',
        title: 'Redesign Electronics Lab Layout',
        description: 'Current layout limits concurrent users despite space availability',
        impact: '+3 users',
        effort: 'High'
      },
      {
        type: 'equipment',
        priority: 'low',
        title: 'Move Underutilized Equipment',
        description: 'Laser engraver in meeting room has 12% utilization',
        impact: '+8% space efficiency',
        effort: 'Low'
      }
    ]
  });

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600 bg-red-50 border-red-200';
    if (rate >= 75) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (rate >= 50) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getZoneStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'optimal': return 'bg-green-100 text-green-800 border-green-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getZoneStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return AlertTriangle;
      case 'high': return TrendingUp;
      case 'optimal': return CheckCircle2;
      case 'low': return ArrowDownRight;
      default: return Activity;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Capacity Data</h3>
            <p className="text-gray-600 mb-4">There was an error loading the capacity planning data.</p>
            <Button onClick={loadCapacityMetrics}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Capacity Planning & Optimization</h1>
          <p className="text-gray-600 mt-1">
            Monitor space utilization and optimize resource allocation for {currentMakerspace?.name || 'your makerspace'}
          </p>
          <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
            <Activity className="h-4 w-4" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <span className={`flex items-center space-x-1 ${autoRefresh ? 'text-green-600' : 'text-gray-400'}`}>
              {autoRefresh ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{autoRefresh ? 'Live' : 'Paused'}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Live' : 'Refresh'}
          </Button>

          <Button variant="outline" onClick={loadCapacityMetrics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Occupancy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.current_occupancy}/{metrics.max_capacity}
                </p>
                <p className="text-sm text-gray-600">
                  {((metrics.current_occupancy / metrics.max_capacity) * 100).toFixed(1)}% capacity
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.utilization_rate}%</p>
                <div className="flex items-center space-x-1 text-sm">
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">+{metrics.trends.monthly_growth}% vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Gauge className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Session Time</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.average_session_duration}h</p>
                <p className="text-sm text-gray-600">Per member visit</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency Score</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.efficiency_score}/100</p>
                <Badge className={getUtilizationColor(metrics.efficiency_score)}>
                  {metrics.efficiency_score >= 80 ? 'Excellent' : 
                   metrics.efficiency_score >= 60 ? 'Good' : 'Needs Attention'}
                </Badge>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Alerts */}
      <CapacityAlerts metrics={metrics} />

      {/* Zone Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Zone Status Overview</span>
            <Badge variant="outline">{metrics.zones.length} zones</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.zones.map(zone => {
              const StatusIcon = getZoneStatusIcon(zone.status);
              const utilizationRate = (zone.current_occupancy / zone.max_capacity) * 100;
              
              return (
                <Card key={zone.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{zone.name}</h4>
                      <StatusIcon className={`h-4 w-4 ${
                        zone.status === 'critical' ? 'text-red-500' :
                        zone.status === 'high' ? 'text-orange-500' :
                        zone.status === 'optimal' ? 'text-green-500' :
                        'text-blue-500'
                      }`} />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Occupancy:</span>
                        <span className="font-medium">{zone.current_occupancy}/{zone.max_capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Utilization:</span>
                        <span className="font-medium">{utilizationRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Equipment:</span>
                        <span className="font-medium">{zone.equipment_count} items</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Session:</span>
                        <span className="font-medium">{zone.avg_session_time}h</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Badge className={getZoneStatusColor(zone.status)}>
                        {zone.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="zones">Zone Management</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpaceUtilizationAnalytics metrics={metrics} />
            <PeakTimeAnalysis metrics={metrics} />
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <RealTimeOccupancyMonitor metrics={metrics} />
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <ResourceOptimizationEngine metrics={metrics} />
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <CapacityForecastingWidget metrics={metrics} />
        </TabsContent>

        <TabsContent value="zones" className="space-y-6">
          <ZoneManagementPanel metrics={metrics} />
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI-Powered Recommendations</span>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {metrics.recommendations.length} insights
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.recommendations.map((rec, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority} priority
                      </Badge>
                      <Badge variant="outline">{rec.type}</Badge>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Impact: <strong>{rec.impact}</strong></span>
                      <span>Effort: <strong>{rec.effort}</strong></span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CapacityPlanning;
