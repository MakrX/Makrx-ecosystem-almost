import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  BarChart3,
  TrendingUp,
  Clock,
  Calendar,
  Users,
  Activity,
  Zap,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  MoreHorizontal
} from 'lucide-react';

interface SpaceUtilizationAnalyticsProps {
  metrics: any;
}

const SpaceUtilizationAnalytics: React.FC<SpaceUtilizationAnalyticsProps> = ({ metrics }) => {
  const [selectedMetric, setSelectedMetric] = useState('occupancy');
  const [timeGranularity, setTimeGranularity] = useState('hourly');

  // Generate hourly utilization data based on daily pattern
  const hourlyData = metrics.trends.daily_pattern.map((hour: any) => ({
    time: `${hour.hour.toString().padStart(2, '0')}:00`,
    occupancy: hour.occupancy,
    efficiency: hour.efficiency,
    utilization: (hour.occupancy / metrics.max_capacity) * 100
  }));

  // Generate weekly utilization data
  const weeklyData = metrics.trends.weekly_pattern.map((day: any) => ({
    day: day.day,
    avg_occupancy: day.avg_occupancy,
    peak_time: day.peak_time,
    utilization: (day.avg_occupancy / metrics.max_capacity) * 100
  }));

  // Calculate zone efficiency scores
  const zoneEfficiency = metrics.zones.map((zone: any) => {
    const utilizationRate = (zone.current_occupancy / zone.max_capacity) * 100;
    const sessionEfficiency = Math.min(100, (zone.avg_session_time / 4) * 100); // 4 hours as optimal
    const equipmentRatio = zone.equipment_count / zone.max_capacity;
    
    return {
      ...zone,
      utilization_rate: utilizationRate,
      session_efficiency: sessionEfficiency,
      equipment_efficiency: Math.min(100, equipmentRatio * 50),
      overall_efficiency: (utilizationRate * 0.4 + sessionEfficiency * 0.4 + equipmentRatio * 50 * 0.2)
    };
  });

  const getUtilizationColor = (rate: number) => {
    if (rate >= 85) return 'text-red-600';
    if (rate >= 70) return 'text-orange-600';
    if (rate >= 40) return 'text-green-600';
    return 'text-blue-600';
  };

  const getEfficiencyBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-800 border-green-200' };
    if (score >= 60) return { label: 'Good', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (score >= 40) return { label: 'Fair', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { label: 'Poor', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  const getTrendIcon = (value: number) => {
    if (Math.abs(value) < 0.1) return <Minus className="h-3 w-3 text-gray-500" />;
    return value > 0 ? (
      <ArrowUp className="h-3 w-3 text-green-500" />
    ) : (
      <ArrowDown className="h-3 w-3 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Analytics Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Space Utilization Analytics</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="occupancy">Occupancy</SelectItem>
                  <SelectItem value="efficiency">Efficiency</SelectItem>
                  <SelectItem value="utilization">Utilization</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeGranularity} onValueChange={setTimeGranularity}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Chart Area - Using simple bar representation */}
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 rounded-lg p-4 flex items-end space-x-2">
              {(timeGranularity === 'weekly' ? weeklyData : hourlyData.slice(0, 12)).map((item: any, index: number) => {
                const value = selectedMetric === 'occupancy' 
                  ? (item.occupancy || item.avg_occupancy) 
                  : selectedMetric === 'efficiency'
                  ? item.efficiency || 70
                  : item.utilization;
                
                const height = `${Math.max(10, (value / 100) * 200)}px`;
                const isWeekly = timeGranularity === 'weekly';
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full rounded-t-md transition-all duration-300 hover:opacity-80 ${
                        value >= 85 ? 'bg-red-500' :
                        value >= 70 ? 'bg-orange-500' :
                        value >= 40 ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}
                      style={{ height }}
                      title={`${isWeekly ? item.day : item.time}: ${value.toFixed(1)}${selectedMetric === 'occupancy' ? ' people' : '%'}`}
                    />
                    <div className="text-xs text-gray-600 mt-1 text-center">
                      {isWeekly ? item.day : item.time}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Critical (&gt;85%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>High (70-85%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Optimal (40-70%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Low (&lt;40%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Efficiency Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Zone Efficiency Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {zoneEfficiency.map((zone: any) => {
              const efficiencyBadge = getEfficiencyBadge(zone.overall_efficiency);
              
              return (
                <div key={zone.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{zone.name}</h4>
                    <Badge className={efficiencyBadge.color}>
                      {efficiencyBadge.label} ({zone.overall_efficiency.toFixed(1)}%)
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {zone.utilization_rate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Space Utilization</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, zone.utilization_rate)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {zone.session_efficiency.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Session Efficiency</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, zone.session_efficiency)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {zone.equipment_efficiency.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Equipment Density</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, zone.equipment_efficiency)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {zone.current_occupancy}/{zone.max_capacity} people • 
                      {zone.equipment_count} equipment • 
                      {zone.avg_session_time}h avg session
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peak Utilization Hour</p>
                <p className="text-2xl font-bold text-gray-900">
                  {hourlyData.reduce((max: any, hour: any) => 
                    hour.utilization > max.utilization ? hour : max
                  ).time}
                </p>
                <p className="text-sm text-gray-600">
                  {hourlyData.reduce((max: any, hour: any) => 
                    hour.utilization > max.utilization ? hour : max
                  ).utilization.toFixed(1)}% capacity
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Most Efficient Zone</p>
                <p className="text-2xl font-bold text-gray-900">
                  {zoneEfficiency.reduce((max: any, zone: any) => 
                    zone.overall_efficiency > max.overall_efficiency ? zone : max
                  ).name}
                </p>
                <p className="text-sm text-gray-600">
                  {zoneEfficiency.reduce((max: any, zone: any) => 
                    zone.overall_efficiency > max.overall_efficiency ? zone : max
                  ).overall_efficiency.toFixed(1)}% efficiency
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weekly Growth</p>
                <p className="text-2xl font-bold text-gray-900">
                  +{metrics.trends.monthly_growth}%
                </p>
                <div className="flex items-center space-x-1 text-sm">
                  {getTrendIcon(metrics.trends.monthly_growth)}
                  <span className={metrics.trends.monthly_growth > 0 ? 'text-green-600' : 'text-red-600'}>
                    vs last month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilization Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Weekly Utilization Heatmap</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Hours header */}
            <div className="grid grid-cols-25 gap-1">
              <div className="text-xs text-gray-500 text-center py-1"></div>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="text-xs text-gray-500 text-center py-1">
                  {i}
                </div>
              ))}
            </div>
            
            {/* Heatmap rows */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="grid grid-cols-25 gap-1">
                <div className="text-xs text-gray-600 py-1 font-medium">{day}</div>
                {Array.from({ length: 24 }, (_, hour) => {
                  // Generate mock utilization data for heatmap
                  const baseUtilization = Math.random() * 80 + 10;
                  const isWeekend = day === 'Sat' || day === 'Sun';
                  const isPeakTime = hour >= 9 && hour <= 18;
                  const utilization = isWeekend 
                    ? baseUtilization * 0.6 
                    : isPeakTime 
                    ? baseUtilization * 1.2 
                    : baseUtilization * 0.8;
                  
                  return (
                    <div
                      key={hour}
                      className={`h-6 rounded ${
                        utilization >= 80 ? 'bg-red-500' :
                        utilization >= 60 ? 'bg-orange-400' :
                        utilization >= 40 ? 'bg-green-400' :
                        utilization >= 20 ? 'bg-blue-400' :
                        'bg-gray-200'
                      }`}
                      title={`${day} ${hour}:00 - ${utilization.toFixed(1)}% utilization`}
                    />
                  );
                })}
              </div>
            ))}
            
            {/* Legend */}
            <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-200 rounded"></div>
                <span>0-20%</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span>20-40%</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>40-60%</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <span>60-80%</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>80%+</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpaceUtilizationAnalytics;
