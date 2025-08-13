import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Users,
  UserCheck,
  UserX,
  Activity,
  Clock,
  MapPin,
  Wifi,
  AlertTriangle,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Eye,
  RefreshCw,
  Radio,
  CheckCircle2
} from 'lucide-react';

interface OccupancyData {
  timestamp: string;
  total_occupancy: number;
  zone_occupancy: Array<{
    zone_id: string;
    zone_name: string;
    current_count: number;
    max_capacity: number;
    change_5min: number;
    active_sessions: Array<{
      user_id: string;
      user_name: string;
      check_in_time: string;
      zone: string;
      activity: string;
      duration: number;
    }>;
  }>;
  recent_activity: Array<{
    type: 'check_in' | 'check_out' | 'zone_change';
    user_name: string;
    zone: string;
    timestamp: string;
    duration?: number;
  }>;
  peak_prediction: {
    next_peak_time: string;
    predicted_occupancy: number;
    confidence: number;
  };
}

interface RealTimeOccupancyMonitorProps {
  metrics: any;
}

const RealTimeOccupancyMonitor: React.FC<RealTimeOccupancyMonitorProps> = ({ metrics }) => {
  const [occupancyData, setOccupancyData] = useState<OccupancyData | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Simulate real-time data updates
  useEffect(() => {
    const generateRealTimeData = (): OccupancyData => ({
      timestamp: new Date().toISOString(),
      total_occupancy: Math.floor(Math.random() * 10) + metrics.current_occupancy - 5,
      zone_occupancy: metrics.zones.map((zone: any) => ({
        zone_id: zone.id,
        zone_name: zone.name,
        current_count: Math.max(0, zone.current_occupancy + Math.floor(Math.random() * 6) - 3),
        max_capacity: zone.max_capacity,
        change_5min: Math.floor(Math.random() * 6) - 3,
        active_sessions: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
          user_id: `user_${i}`,
          user_name: ['Alex Chen', 'Sarah Kim', 'Mike Rodriguez', 'Emma Johnson', 'David Park'][i] || 'Unknown',
          check_in_time: new Date(Date.now() - Math.random() * 7200000).toISOString(),
          zone: zone.name,
          activity: ['3D Printing', 'Electronics', 'Woodworking', 'Laser Cutting', 'Assembly'][Math.floor(Math.random() * 5)],
          duration: Math.random() * 4 + 0.5
        }))
      })),
      recent_activity: Array.from({ length: 8 }, (_, i) => ({
        type: ['check_in', 'check_out', 'zone_change'][Math.floor(Math.random() * 3)] as 'check_in' | 'check_out' | 'zone_change',
        user_name: ['Alex Chen', 'Sarah Kim', 'Mike Rodriguez', 'Emma Johnson', 'David Park', 'Lisa Wong', 'James Smith'][i] || 'Member',
        zone: metrics.zones[Math.floor(Math.random() * metrics.zones.length)].name,
        timestamp: new Date(Date.now() - i * 300000).toISOString(),
        duration: Math.random() * 3 + 1
      })),
      peak_prediction: {
        next_peak_time: new Date(Date.now() + Math.random() * 14400000).toISOString(),
        predicted_occupancy: Math.floor(Math.random() * 15) + 35,
        confidence: Math.floor(Math.random() * 20) + 75
      }
    });

    setOccupancyData(generateRealTimeData());

    const interval = setInterval(() => {
      setOccupancyData(generateRealTimeData());
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [metrics]);

  const getUtilizationLevel = (current: number, max: number) => {
    const rate = (current / max) * 100;
    if (rate >= 90) return { level: 'critical', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (rate >= 75) return { level: 'high', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (rate >= 50) return { level: 'moderate', color: 'text-green-600', bgColor: 'bg-green-100' };
    return { level: 'low', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'check_in': return UserCheck;
      case 'check_out': return UserX;
      case 'zone_change': return ArrowUp;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'check_in': return 'text-green-600';
      case 'check_out': return 'text-red-600';
      case 'zone_change': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (!occupancyData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium">
            {isConnected ? 'Real-time monitoring active' : 'Connection lost'}
          </span>
          <Badge variant="outline" className="text-xs">
            Updated {formatTimeAgo(lastUpdate.toISOString())}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Radio className="h-4 w-4 text-green-500" />
          <span className="text-sm text-gray-600">Live data</span>
        </div>
      </div>

      {/* Overall Occupancy Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Current Occupancy</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              {occupancyData.total_occupancy}/{metrics.max_capacity} people
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Overall Utilization</span>
              <span className="text-2xl font-bold">
                {((occupancyData.total_occupancy / metrics.max_capacity) * 100).toFixed(1)}%
              </span>
            </div>
            
            <Progress value={(occupancyData.total_occupancy / metrics.max_capacity) * 100} className="h-3" />
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">{occupancyData.total_occupancy}</div>
                <div className="text-xs text-gray-600">Current</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">{metrics.max_capacity}</div>
                <div className="text-xs text-gray-600">Capacity</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-purple-600">
                  {metrics.max_capacity - occupancyData.total_occupancy}
                </div>
                <div className="text-xs text-gray-600">Available</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone Occupancy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Zone Occupancy</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {occupancyData.zone_occupancy.map(zone => {
                const utilization = getUtilizationLevel(zone.current_count, zone.max_capacity);
                const utilizationRate = (zone.current_count / zone.max_capacity) * 100;
                
                return (
                  <div 
                    key={zone.zone_id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedZone === zone.zone_id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedZone(selectedZone === zone.zone_id ? null : zone.zone_id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{zone.zone_name}</h4>
                      <div className="flex items-center space-x-2">
                        {zone.change_5min !== 0 && (
                          <div className={`flex items-center space-x-1 ${
                            zone.change_5min > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {zone.change_5min > 0 ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )}
                            <span className="text-xs">{Math.abs(zone.change_5min)}</span>
                          </div>
                        )}
                        <Badge className={`${utilization.color} ${utilization.bgColor} border-0`}>
                          {zone.current_count}/{zone.max_capacity}
                        </Badge>
                      </div>
                    </div>
                    
                    <Progress value={utilizationRate} className="h-2 mb-2" />
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{utilizationRate.toFixed(1)}% utilized</span>
                      <span>{zone.active_sessions.length} active sessions</span>
                    </div>

                    {/* Expandable session details */}
                    {selectedZone === zone.zone_id && zone.active_sessions.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h5 className="font-medium text-sm mb-3">Active Sessions</h5>
                        <div className="space-y-2">
                          {zone.active_sessions.map((session, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="font-medium">{session.user_name}</span>
                                <span className="text-gray-500">- {session.activity}</span>
                              </div>
                              <div className="text-gray-500">
                                {formatDuration(session.duration)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {occupancyData.recent_activity.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const color = getActivityColor(activity.type);
                
                return (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'check_in' ? 'bg-green-100' :
                      activity.type === 'check_out' ? 'bg-red-100' :
                      'bg-blue-100'
                    }`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.user_name}
                        <span className="font-normal text-gray-600 ml-1">
                          {activity.type === 'check_in' ? 'checked into' :
                           activity.type === 'check_out' ? 'checked out of' :
                           'moved to'} {activity.zone}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center space-x-2">
                        <span>{formatTimeAgo(activity.timestamp)}</span>
                        {activity.duration && (
                          <>
                            <span>•</span>
                            <span>Session: {formatDuration(activity.duration)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Prediction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Peak Time Prediction</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-900">Next Peak Expected</h4>
              <p className="text-gray-600">
                {new Date(occupancyData.peak_prediction.next_peak_time).toLocaleTimeString()} - 
                Expected {occupancyData.peak_prediction.predicted_occupancy} people
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  {occupancyData.peak_prediction.confidence}% confidence
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {occupancyData.peak_prediction.predicted_occupancy}
              </div>
              <div className="text-sm text-gray-600">predicted users</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeOccupancyMonitor;
