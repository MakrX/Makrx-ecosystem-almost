import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import {
  Wrench, Clock, Activity, AlertTriangle, CheckCircle, Calendar,
  Zap, TrendingUp, Settings, RefreshCw, Gauge
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface EquipmentMetric {
  equipment_id: string;
  equipment_name: string;
  total_usage_hours: number;
  reservation_count: number;
  uptime_percentage: number;
  maintenance_overdue: boolean;
  peak_usage_times: string[];
  usage_trend: Array<{
    date: string;
    hours: number;
  }>;
}

const EquipmentMetrics: React.FC = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<EquipmentMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<any[]>([]);
  const [uptimeData, setUptimeData] = useState<any[]>([]);
  const [maintenanceData, setMaintenanceData] = useState<any[]>([]);

  useEffect(() => {
    fetchEquipmentMetrics();
  }, []);

  const fetchEquipmentMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/equipment', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        processChartData(data);
        if (data.length > 0) {
          setSelectedEquipment(data[0].equipment_id);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load equipment metrics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching equipment metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load equipment metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data: EquipmentMetric[]) => {
    // Usage hours chart data
    const usageChart = data.map(equipment => ({
      name: equipment.equipment_name,
      hours: equipment.total_usage_hours,
      reservations: equipment.reservation_count,
      equipment_id: equipment.equipment_id
    }));
    setUsageData(usageChart);

    // Uptime percentage chart data
    const uptimeChart = data.map(equipment => ({
      name: equipment.equipment_name,
      uptime: equipment.uptime_percentage,
      fill: equipment.uptime_percentage >= 90 ? '#10B981' : 
            equipment.uptime_percentage >= 70 ? '#F59E0B' : '#EF4444'
    }));
    setUptimeData(uptimeChart);

    // Maintenance status
    const maintenanceChart = [
      {
        name: 'Up to Date',
        value: data.filter(eq => !eq.maintenance_overdue).length,
        fill: '#10B981'
      },
      {
        name: 'Overdue',
        value: data.filter(eq => eq.maintenance_overdue).length,
        fill: '#EF4444'
      }
    ];
    setMaintenanceData(maintenanceChart);
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 90) return 'text-green-600';
    if (uptime >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUptimeBadge = (uptime: number) => {
    if (uptime >= 90) return { label: 'Excellent', variant: 'default' as const };
    if (uptime >= 70) return { label: 'Good', variant: 'secondary' as const };
    return { label: 'Poor', variant: 'destructive' as const };
  };

  const selectedEquipmentData = selectedEquipment ? 
    metrics.find(m => m.equipment_id === selectedEquipment) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading equipment metrics...</span>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <Alert>
        <Wrench className="h-4 w-4" />
        <AlertDescription>
          No equipment data available. Equipment metrics will appear once usage data is recorded.
        </AlertDescription>
      </Alert>
    );
  }

  const totalHours = metrics.reduce((sum, m) => sum + m.total_usage_hours, 0);
  const averageUptime = metrics.reduce((sum, m) => sum + m.uptime_percentage, 0) / metrics.length;
  const overdueCount = metrics.filter(m => m.maintenance_overdue).length;
  const totalReservations = metrics.reduce((sum, m) => sum + m.reservation_count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Equipment Metrics</h2>
        <Badge variant={getUptimeBadge(averageUptime).variant} className="text-sm">
          <Gauge className="h-3 w-3 mr-1" />
          Avg Uptime: {averageUptime.toFixed(1)}%
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.length}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usage Hours</p>
                <p className="text-2xl font-bold text-green-600">{totalHours.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reservations</p>
                <p className="text-2xl font-bold text-purple-600">{totalReservations}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Alerts */}
      {overdueCount > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <span className="font-medium">{overdueCount} equipment(s)</span> require maintenance. 
            Schedule maintenance to prevent downtime and ensure optimal performance.
          </AlertDescription>
        </Alert>
      )}

      {/* Equipment Selector */}
      {metrics.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Equipment Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {metrics.map((equipment) => (
                <Button
                  key={equipment.equipment_id}
                  variant={selectedEquipment === equipment.equipment_id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedEquipment(equipment.equipment_id)}
                  className="flex items-center gap-2"
                >
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      equipment.maintenance_overdue ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  />
                  {equipment.equipment_name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Hours by Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Hours by Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${Number(value).toFixed(1)} ${name === 'hours' ? 'hours' : 'reservations'}`,
                      name === 'hours' ? 'Usage Hours' : 'Reservations'
                    ]}
                  />
                  <Bar dataKey="hours" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Uptime Percentage */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={uptimeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Uptime']} />
                  <Bar dataKey="uptime" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Status */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={maintenanceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value, percent }) => 
                      value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : ''
                    }
                  >
                    {maintenanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Usage Trend for Selected Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>
              Usage Trend {selectedEquipmentData ? `- ${selectedEquipmentData.equipment_name}` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {selectedEquipmentData && selectedEquipmentData.usage_trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedEquipmentData.usage_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} hours`, 'Usage']} />
                    <Line type="monotone" dataKey="hours" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No trend data available</p>
                    <p className="text-sm">Usage trends will appear over time</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((equipment) => (
          <Card key={equipment.equipment_id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{equipment.equipment_name}</CardTitle>
                <div className="flex items-center gap-2">
                  {equipment.maintenance_overdue ? (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Overdue
                    </Badge>
                  ) : (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      OK
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Usage Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Usage Hours</p>
                  <p className="text-lg font-bold text-blue-600">
                    {equipment.total_usage_hours.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reservations</p>
                  <p className="text-lg font-bold text-green-600">
                    {equipment.reservation_count}
                  </p>
                </div>
              </div>

              {/* Uptime */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className={`text-sm font-medium ${getUptimeColor(equipment.uptime_percentage)}`}>
                    {equipment.uptime_percentage.toFixed(1)}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      equipment.uptime_percentage >= 90 ? 'bg-green-500' :
                      equipment.uptime_percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${equipment.uptime_percentage}%` }}
                  />
                </div>
              </div>

              {/* Peak Usage Times */}
              {equipment.peak_usage_times.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Peak Usage Times</p>
                  <div className="flex flex-wrap gap-1">
                    {equipment.peak_usage_times.map((time, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Schedule Maintenance</h4>
              </div>
              <p className="text-sm text-blue-800">
                Proactive maintenance scheduling based on usage patterns can improve uptime and extend equipment life.
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">Optimize Usage</h4>
              </div>
              <p className="text-sm text-green-800">
                Distribute reservations across peak and off-peak hours to maximize equipment utilization.
              </p>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium text-orange-900">Monitor Performance</h4>
              </div>
              <p className="text-sm text-orange-800">
                Set up alerts for equipment downtime and unusual usage patterns to prevent issues.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentMetrics;
