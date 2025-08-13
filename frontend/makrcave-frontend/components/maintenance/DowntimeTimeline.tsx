import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Wrench, 
  Calendar,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { format, differenceInHours, differenceInDays, parseISO } from 'date-fns';

interface DowntimeTimelineProps {
  logs: any[];
}

interface DowntimeEvent {
  id: string;
  equipment_name: string;
  type: string;
  status: string;
  priority: string;
  start_time: Date;
  end_time?: Date;
  duration_hours?: number;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  cost?: number;
}

const DowntimeTimeline: React.FC<DowntimeTimelineProps> = ({ logs }) => {
  // Process logs into downtime events
  const downtimeEvents: DowntimeEvent[] = logs
    .filter(log => log.type === 'breakdown' || log.status === 'in_progress' || log.status === 'overdue')
    .map(log => {
      const startTime = parseISO(log.created_at);
      const endTime = log.resolved_at ? parseISO(log.resolved_at) : null;
      const duration = endTime ? differenceInHours(endTime, startTime) : null;
      
      // Determine impact level based on priority and type
      let impactLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      if (log.priority === 'critical') impactLevel = 'critical';
      else if (log.priority === 'high') impactLevel = 'high';
      else if (log.priority === 'low') impactLevel = 'low';

      return {
        id: log.id,
        equipment_name: log.equipment_name,
        type: log.type,
        status: log.status,
        priority: log.priority,
        start_time: startTime,
        end_time: endTime,
        duration_hours: duration,
        impact_level: impactLevel,
        description: log.description,
        cost: log.cost
      };
    })
    .sort((a, b) => b.start_time.getTime() - a.start_time.getTime());

  // Calculate statistics
  const totalDowntimeHours = downtimeEvents
    .filter(event => event.duration_hours)
    .reduce((sum, event) => sum + (event.duration_hours || 0), 0);

  const avgDowntimeHours = downtimeEvents.length > 0 
    ? Math.round(totalDowntimeHours / downtimeEvents.filter(e => e.duration_hours).length) 
    : 0;

  const activeDowntime = downtimeEvents.filter(event => !event.end_time).length;
  const resolvedDowntime = downtimeEvents.filter(event => event.end_time).length;

  const impactDistribution = downtimeEvents.reduce((acc, event) => {
    acc[event.impact_level] = (acc[event.impact_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <TrendingUp className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days}d ${remainingHours}h`;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Equipment Downtime Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-700">{totalDowntimeHours}h</div>
            <div className="text-sm text-blue-600">Total Downtime</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-700">{avgDowntimeHours}h</div>
            <div className="text-sm text-purple-600">Avg Duration</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-700">{activeDowntime}</div>
            <div className="text-sm text-red-600">Active Issues</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-700">{resolvedDowntime}</div>
            <div className="text-sm text-green-600">Resolved</div>
          </div>
        </div>

        {/* Impact Distribution */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Impact Distribution</h4>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(impactDistribution).map(([impact, count]) => (
              <Badge key={impact} variant="outline" className="flex items-center gap-1">
                {getImpactIcon(impact)}
                <span className="capitalize">{impact}</span>
                <span className="ml-1 bg-gray-100 text-gray-800 px-1 rounded">{count}</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {downtimeEvents.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Downtime</h3>
              <p className="text-gray-600">All equipment is operational</p>
            </div>
          ) : (
            downtimeEvents.map((event, index) => (
              <div
                key={event.id}
                className={`border-l-4 p-4 rounded-r-lg ${getImpactColor(event.impact_level)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{event.equipment_name}</h4>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {event.type}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{event.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Started:</span>
                        <div className="font-medium">
                          {format(event.start_time, 'MMM dd, HH:mm')}
                        </div>
                      </div>
                      
                      {event.end_time ? (
                        <div>
                          <span className="text-gray-500">Resolved:</span>
                          <div className="font-medium">
                            {format(event.end_time, 'MMM dd, HH:mm')}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <div className="font-medium text-red-600">
                            {formatDuration(differenceInHours(new Date(), event.start_time))} (ongoing)
                          </div>
                        </div>
                      )}
                      
                      {event.duration_hours && (
                        <div>
                          <span className="text-gray-500">Total Duration:</span>
                          <div className="font-medium">
                            {formatDuration(event.duration_hours)}
                          </div>
                        </div>
                      )}
                      
                      {event.cost && (
                        <div>
                          <span className="text-gray-500">Cost:</span>
                          <div className="font-medium">
                            ${event.cost}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center gap-2">
                    {getImpactIcon(event.impact_level)}
                    {!event.end_time && (
                      <div className="flex items-center gap-1 text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium">ACTIVE</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress indicator for ongoing issues */}
                {!event.end_time && (
                  <div className="mt-3 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, (differenceInHours(new Date(), event.start_time) / 24) * 100)}%` 
                      }}
                    ></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {downtimeEvents.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {downtimeEvents.length} downtime event{downtimeEvents.length !== 1 ? 's' : ''}
              </span>
              <span>
                Total impact: {totalDowntimeHours} hours
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DowntimeTimeline;
