import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Users, Clock, Calendar, TrendingUp, Activity,
  LogIn, UserPlus, FolderPlus, RefreshCw
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface UsageStats {
  period: string;
  logins: number;
  new_members: number;
  project_creations: number;
  equipment_hours: number;
  peak_hour: string;
  most_active_day: string;
}

interface UsageEvent {
  id: string;
  event_type: string;
  timestamp: string;
  user_id?: string;
  resource_type?: string;
  duration_minutes?: number;
}

const UsageDashboard: React.FC = () => {
  const { toast } = useToast();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<UsageEvent[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    fetchUsageData();
  }, [selectedPeriod]);

  const fetchUsageData = async () => {
    setLoading(true);
    try {
      // Fetch usage statistics
      const statsResponse = await fetch(`/api/analytics/usage?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setUsageStats(stats);
      }

      // Fetch recent events
      const eventsResponse = await fetch('/api/analytics/events?limit=50', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (eventsResponse.ok) {
        const events = await eventsResponse.json();
        setRecentEvents(events);
        generateTimelineData(events);
        generateActivityData(events);
      }

    } catch (error) {
      console.error('Error fetching usage data:', error);
      toast({
        title: "Error",
        description: "Failed to load usage analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTimelineData = (events: UsageEvent[]) => {
    // Group events by hour over the last 24 hours
    const now = new Date();
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now);
      hour.setHours(now.getHours() - (23 - i), 0, 0, 0);
      return {
        time: hour.getHours().toString().padStart(2, '0') + ':00',
        logins: 0,
        projects: 0,
        equipment: 0,
        total: 0
      };
    });

    events.forEach(event => {
      const eventTime = new Date(event.timestamp);
      const hourIndex = Math.floor((now.getTime() - eventTime.getTime()) / (1000 * 60 * 60));
      
      if (hourIndex >= 0 && hourIndex < 24) {
        const dataPoint = hours[23 - hourIndex];
        dataPoint.total++;
        
        switch (event.event_type) {
          case 'login':
            dataPoint.logins++;
            break;
          case 'project_created':
            dataPoint.projects++;
            break;
          case 'equipment_reserved':
          case 'equipment_used':
            dataPoint.equipment++;
            break;
        }
      }
    });

    setTimelineData(hours);
  };

  const generateActivityData = (events: UsageEvent[]) => {
    // Count event types
    const eventCounts = events.reduce((acc, event) => {
      const type = event.event_type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activityTypes = [
      { name: 'Logins', value: eventCounts.login || 0, color: '#3B82F6' },
      { name: 'Projects', value: eventCounts.project_created || 0, color: '#10B981' },
      { name: 'Equipment', value: (eventCounts.equipment_reserved || 0) + (eventCounts.equipment_used || 0), color: '#F59E0B' },
      { name: 'Inventory', value: eventCounts.inventory_consumed || 0, color: '#EF4444' },
      { name: 'Other', value: Object.values(eventCounts).reduce((sum, count) => sum + count, 0) - 
        (eventCounts.login || 0) - (eventCounts.project_created || 0) - 
        ((eventCounts.equipment_reserved || 0) + (eventCounts.equipment_used || 0)) - 
        (eventCounts.inventory_consumed || 0), color: '#8B5CF6' }
    ].filter(item => item.value > 0);

    setActivityData(activityTypes);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'login':
        return <LogIn className="h-4 w-4" />;
      case 'member_registered':
        return <UserPlus className="h-4 w-4" />;
      case 'project_created':
        return <FolderPlus className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading usage analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Usage Analytics</h2>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Usage Stats Cards */}
      {usageStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Logins</p>
                  <p className="text-2xl font-bold text-blue-600">{usageStats.logins}</p>
                </div>
                <LogIn className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Members</p>
                  <p className="text-2xl font-bold text-green-600">{usageStats.new_members}</p>
                </div>
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Projects Created</p>
                  <p className="text-2xl font-bold text-purple-600">{usageStats.project_creations}</p>
                </div>
                <FolderPlus className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Equipment Hours</p>
                  <p className="text-2xl font-bold text-orange-600">{usageStats.equipment_hours.toFixed(1)}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights Cards */}
      {usageStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Peak Activity Hour</p>
                  <p className="text-lg font-bold text-gray-900">{usageStats.peak_hour}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Most Active Day</p>
                  <p className="text-lg font-bold text-gray-900">{usageStats.most_active_day}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>24-Hour Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="logins" stroke="#10B981" strokeWidth={1} />
                  <Line type="monotone" dataKey="projects" stroke="#F59E0B" strokeWidth={1} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentEvents.slice(0, 20).map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getEventIcon(event.event_type)}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-900">
                    {formatEventType(event.event_type)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                    {event.duration_minutes && (
                      <span className="ml-2">
                        • Duration: {event.duration_minutes} min
                      </span>
                    )}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {event.resource_type || 'System'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageDashboard;
