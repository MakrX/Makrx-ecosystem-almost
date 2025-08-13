import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Clock,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface PeakTimeAnalysisProps {
  metrics: any;
}

const PeakTimeAnalysis: React.FC<PeakTimeAnalysisProps> = ({ metrics }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  // Mock peak time data
  const peakTimeData = {
    dailyPeaks: [
      { day: 'Monday', peak: '10:00 AM', occupancy: 85, sessions: 12 },
      { day: 'Tuesday', peak: '2:00 PM', occupancy: 92, sessions: 15 },
      { day: 'Wednesday', peak: '11:00 AM', occupancy: 88, sessions: 13 },
      { day: 'Thursday', peak: '3:00 PM', occupancy: 95, sessions: 16 },
      { day: 'Friday', peak: '1:00 PM', occupancy: 78, sessions: 11 },
      { day: 'Saturday', peak: '10:00 AM', occupancy: 65, sessions: 8 },
      { day: 'Sunday', peak: '2:00 PM', occupancy: 45, sessions: 6 }
    ],
    hourlyDistribution: [
      { hour: '8:00', occupancy: 25, trend: 'up' },
      { hour: '9:00', occupancy: 45, trend: 'up' },
      { hour: '10:00', occupancy: 75, trend: 'up' },
      { hour: '11:00', occupancy: 85, trend: 'up' },
      { hour: '12:00', occupancy: 65, trend: 'down' },
      { hour: '1:00', occupancy: 90, trend: 'up' },
      { hour: '2:00', occupancy: 95, trend: 'up' },
      { hour: '3:00', occupancy: 88, trend: 'down' },
      { hour: '4:00', occupancy: 70, trend: 'down' },
      { hour: '5:00', occupancy: 55, trend: 'down' },
      { hour: '6:00', occupancy: 35, trend: 'down' },
      { hour: '7:00', occupancy: 20, trend: 'down' }
    ],
    insights: [
      {
        type: 'peak',
        title: 'Highest Peak',
        description: 'Thursday 3:00 PM consistently shows highest occupancy',
        value: '95%',
        trend: 'stable'
      },
      {
        type: 'opportunity',
        title: 'Underutilized Hours',
        description: 'Early morning (8-9 AM) and evening (6-8 PM) show low usage',
        value: '30%',
        trend: 'opportunity'
      },
      {
        type: 'efficiency',
        title: 'Optimal Window',
        description: 'Tuesday-Thursday 1-4 PM shows consistent high utilization',
        value: '90%',
        trend: 'optimal'
      }
    ]
  };

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 90) return 'text-red-600 bg-red-50';
    if (occupancy >= 75) return 'text-orange-600 bg-orange-50';
    if (occupancy >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'optimal': return <Target className="h-4 w-4 text-green-500" />;
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Peak Time Analysis</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <select 
                value={selectedTimeframe} 
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Peak Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Daily Peak Times</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {peakTimeData.dailyPeaks.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 text-sm font-medium">{day.day}</div>
                    <div className="text-sm text-gray-600">{day.peak}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getOccupancyColor(day.occupancy)}`}>
                      {day.occupancy}%
                    </div>
                    <div className="text-sm text-gray-500">{day.sessions} sessions</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Hourly Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {peakTimeData.hourlyDistribution.map((hour, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-12 text-sm">{hour.hour}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            hour.occupancy >= 90 ? 'bg-red-500' :
                            hour.occupancy >= 75 ? 'bg-orange-500' :
                            hour.occupancy >= 50 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${hour.occupancy}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-gray-600">{hour.occupancy}%</div>
                      {getTrendIcon(hour.trend)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Key Insights & Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {peakTimeData.insights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start space-x-3 mb-3">
                  {getTrendIcon(insight.trend)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                  </div>
                </div>
                
                <div className="text-2xl font-bold text-blue-600 mb-2">{insight.value}</div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={
                      insight.type === 'peak' ? 'border-red-200 text-red-700' :
                      insight.type === 'opportunity' ? 'border-blue-200 text-blue-700' :
                      'border-green-200 text-green-700'
                    }
                  >
                    {insight.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Peak Time Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <span>Weekly Usage Heatmap</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 gap-1 min-w-full">
              {/* Header row */}
              <div className="text-xs text-gray-500 p-2"></div>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-xs text-gray-500 p-2 text-center">{day}</div>
              ))}
              
              {/* Time rows */}
              {Array.from({ length: 12 }, (_, i) => {
                const hour = 8 + i;
                const hourStr = `${hour}:00`;
                return (
                  <React.Fragment key={hour}>
                    <div className="text-xs text-gray-500 p-2">{hourStr}</div>
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const occupancy = Math.random() * 100; // Mock data
                      return (
                        <div 
                          key={dayIndex}
                          className={`w-full h-8 rounded text-xs flex items-center justify-center text-white font-medium ${
                            occupancy >= 90 ? 'bg-red-500' :
                            occupancy >= 75 ? 'bg-orange-500' :
                            occupancy >= 50 ? 'bg-yellow-500' :
                            occupancy >= 25 ? 'bg-blue-500' :
                            'bg-gray-300'
                          }`}
                          title={`${hourStr} - ${Math.round(occupancy)}% occupancy`}
                        >
                          {Math.round(occupancy)}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span>0-25%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>25-50%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>50-75%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>75-90%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>90-100%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeakTimeAnalysis;
