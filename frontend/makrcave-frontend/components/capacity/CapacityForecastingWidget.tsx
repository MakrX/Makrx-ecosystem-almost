import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  TrendingUp,
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Target,
  Activity,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  Brain,
  Eye,
  Download,
  Settings
} from 'lucide-react';

interface ForecastData {
  period: string;
  predicted_occupancy: number;
  confidence_level: number;
  capacity_utilization: number;
  peak_times: string[];
  bottlenecks: string[];
  recommendations: string[];
}

interface CapacityForecastingWidgetProps {
  metrics: any;
}

const CapacityForecastingWidget: React.FC<CapacityForecastingWidgetProps> = ({ metrics }) => {
  const [forecastPeriod, setForecastPeriod] = useState('week');
  const [forecastType, setForecastType] = useState('occupancy');

  // Generate forecast data based on current metrics and trends
  const generateForecastData = (): ForecastData[] => {
    const periods = forecastPeriod === 'week' ? 7 : 
                   forecastPeriod === 'month' ? 30 : 90;
    
    return Array.from({ length: periods }, (_, index) => {
      const baseOccupancy = metrics.current_occupancy;
      const growthRate = metrics.trends.monthly_growth / 100;
      const seasonalFactor = Math.sin((index / periods) * Math.PI * 2) * 0.2 + 1;
      const randomVariation = (Math.random() - 0.5) * 0.3;
      
      const predictedOccupancy = Math.max(0, Math.min(metrics.max_capacity,
        baseOccupancy * (1 + growthRate * (index / 30)) * seasonalFactor * (1 + randomVariation)
      ));
      
      const utilization = (predictedOccupancy / metrics.max_capacity) * 100;
      const confidence = Math.max(60, 95 - (index * 2)); // Confidence decreases over time
      
      return {
        period: forecastPeriod === 'week' ? 
          ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] || `Day ${index + 1}` :
          forecastPeriod === 'month' ?
          `Day ${index + 1}` :
          `Week ${Math.floor(index / 7) + 1}`,
        predicted_occupancy: Math.round(predictedOccupancy),
        confidence_level: Math.round(confidence),
        capacity_utilization: Math.round(utilization),
        peak_times: ['10:00', '14:00', '16:00'].slice(0, Math.floor(Math.random() * 3) + 1),
        bottlenecks: ['3D Printers', 'Electronics Lab', 'Laser Cutter'].slice(0, Math.floor(Math.random() * 2) + 1),
        recommendations: [
          'Consider extended hours',
          'Add equipment in high-demand areas',
          'Implement dynamic pricing'
        ].slice(0, Math.floor(Math.random() * 2) + 1)
      };
    });
  };

  const forecastData = generateForecastData();
  
  // Calculate forecast insights
  const averageUtilization = forecastData.reduce((sum, day) => sum + day.capacity_utilization, 0) / forecastData.length;
  const peakUtilization = Math.max(...forecastData.map(day => day.capacity_utilization));
  const averageConfidence = forecastData.reduce((sum, day) => sum + day.confidence_level, 0) / forecastData.length;
  const criticalDays = forecastData.filter(day => day.capacity_utilization > 85).length;

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-orange-600';
    if (utilization >= 50) return 'text-green-600';
    return 'text-blue-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (current: number, previous: number) => {
    const diff = current - previous;
    if (Math.abs(diff) < 1) return <Minus className="h-3 w-3 text-gray-500" />;
    return diff > 0 ? (
      <ArrowUp className="h-3 w-3 text-green-500" />
    ) : (
      <ArrowDown className="h-3 w-3 text-red-500" />
    );
  };

  const getAlertLevel = (utilization: number) => {
    if (utilization >= 90) return { level: 'critical', color: 'bg-red-100 border-red-200 text-red-800', icon: AlertTriangle };
    if (utilization >= 75) return { level: 'warning', color: 'bg-yellow-100 border-yellow-200 text-yellow-800', icon: AlertTriangle };
    return { level: 'normal', color: 'bg-green-100 border-green-200 text-green-800', icon: CheckCircle2 };
  };

  return (
    <div className="space-y-6">
      {/* Forecasting Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span>Capacity Forecasting</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Next Week</SelectItem>
                  <SelectItem value="month">Next Month</SelectItem>
                  <SelectItem value="quarter">Next Quarter</SelectItem>
                </SelectContent>
              </Select>
              <Select value={forecastType} onValueChange={setForecastType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="occupancy">Occupancy</SelectItem>
                  <SelectItem value="utilization">Utilization</SelectItem>
                  <SelectItem value="demand">Demand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
                <p className={`text-2xl font-bold ${getUtilizationColor(averageUtilization)}`}>
                  {averageUtilization.toFixed(1)}%
                </p>
                <div className="flex items-center space-x-1 text-sm">
                  {getTrendIcon(averageUtilization, metrics.utilization_rate)}
                  <span className="text-gray-600">vs current</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peak Utilization</p>
                <p className={`text-2xl font-bold ${getUtilizationColor(peakUtilization)}`}>
                  {peakUtilization.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Highest predicted</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Forecast Confidence</p>
                <p className={`text-2xl font-bold ${getConfidenceColor(averageConfidence)}`}>
                  {averageConfidence.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Avg accuracy</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Days</p>
                <p className="text-2xl font-bold text-red-600">{criticalDays}</p>
                <p className="text-sm text-gray-600">&gt;85% utilization</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Capacity Forecast - {forecastPeriod}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart visualization */}
            <div className="h-64 bg-gray-50 rounded-lg p-4 flex items-end space-x-1">
              {forecastData.slice(0, 14).map((day, index) => {
                const height = `${Math.max(10, (day.capacity_utilization / 100) * 200)}px`;
                const alert = getAlertLevel(day.capacity_utilization);
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div 
                      className={`w-full rounded-t-md transition-all duration-300 hover:opacity-80 ${
                        day.capacity_utilization >= 90 ? 'bg-red-500' :
                        day.capacity_utilization >= 75 ? 'bg-orange-500' :
                        day.capacity_utilization >= 50 ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}
                      style={{ height }}
                      title={`${day.period}: ${day.capacity_utilization}% utilization (${day.confidence_level}% confidence)`}
                    />
                    <div className="text-xs text-gray-600 mt-1 text-center">
                      {day.period}
                    </div>
                    {/* Confidence indicator */}
                    <div className={`w-2 h-1 mt-1 rounded ${
                      day.confidence_level >= 80 ? 'bg-green-400' :
                      day.confidence_level >= 60 ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`} />
                  </div>
                );
              })}
            </div>
            
            {/* Chart legend */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Critical (&gt;90%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>High (75-90%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Optimal (50-75%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Low (&lt;50%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Forecast Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Detailed Forecast Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Period</th>
                  <th className="text-center py-2">Predicted Occupancy</th>
                  <th className="text-center py-2">Utilization</th>
                  <th className="text-center py-2">Confidence</th>
                  <th className="text-left py-2">Peak Times</th>
                  <th className="text-left py-2">Potential Bottlenecks</th>
                  <th className="text-center py-2">Alert</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.slice(0, 10).map((day, index) => {
                  const alert = getAlertLevel(day.capacity_utilization);
                  const AlertIcon = alert.icon;
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">{day.period}</td>
                      <td className="text-center py-3">
                        {day.predicted_occupancy}/{metrics.max_capacity}
                      </td>
                      <td className={`text-center py-3 font-medium ${getUtilizationColor(day.capacity_utilization)}`}>
                        {day.capacity_utilization}%
                      </td>
                      <td className={`text-center py-3 ${getConfidenceColor(day.confidence_level)}`}>
                        {day.confidence_level}%
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {day.peak_times.map((time, timeIndex) => (
                            <Badge key={timeIndex} variant="outline" className="text-xs">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {day.bottlenecks.map((bottleneck, bottleneckIndex) => (
                            <Badge key={bottleneckIndex} variant="secondary" className="text-xs">
                              {bottleneck}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="text-center py-3">
                        <AlertIcon className={`h-4 w-4 mx-auto ${
                          alert.level === 'critical' ? 'text-red-500' :
                          alert.level === 'warning' ? 'text-yellow-500' :
                          'text-green-500'
                        }`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Key Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">Capacity Trend</h4>
                <p className="text-sm text-blue-800">
                  Expected {averageUtilization > metrics.utilization_rate ? 'increase' : 'decrease'} in average utilization 
                  of {Math.abs(averageUtilization - metrics.utilization_rate).toFixed(1)}% 
                  compared to current levels.
                </p>
              </div>
              
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-1">Peak Demand</h4>
                <p className="text-sm text-orange-800">
                  Peak utilization of {peakUtilization.toFixed(1)}% expected. 
                  {peakUtilization > 85 ? 'Consider capacity expansion or load balancing.' : 'Within acceptable limits.'}
                </p>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">Forecast Accuracy</h4>
                <p className="text-sm text-green-800">
                  Average confidence of {averageConfidence.toFixed(1)}% indicates 
                  {averageConfidence > 80 ? 'high reliability' : 'moderate reliability'} in predictions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalDays > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900">Critical Capacity Alert</h4>
                      <p className="text-sm text-red-800">
                        {criticalDays} days with &gt;85% utilization expected. Consider:
                      </p>
                      <ul className="text-sm text-red-800 list-disc list-inside mt-1">
                        <li>Extended operating hours</li>
                        <li>Dynamic pricing during peak times</li>
                        <li>Equipment capacity expansion</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Users className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Optimize Scheduling</h4>
                    <p className="text-sm text-blue-800">
                      Implement smart scheduling to distribute load more evenly across peak hours.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Activity className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900">Resource Monitoring</h4>
                    <p className="text-sm text-purple-800">
                      Monitor bottleneck resources closely during high-demand periods.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button className="flex-1">
          <Settings className="h-4 w-4 mr-2" />
          Configure Forecasting
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Forecast
        </Button>
        <Button variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          View Historical
        </Button>
      </div>
    </div>
  );
};

export default CapacityForecastingWidget;
