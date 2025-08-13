import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Bell,
  X,
  Eye,
  Settings
} from 'lucide-react';

interface CapacityAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  zone?: string;
  metric: string;
  current_value: number;
  threshold_value: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  timestamp: string;
  action_required: boolean;
  suggested_actions: string[];
}

interface CapacityAlertsProps {
  metrics: any;
}

const CapacityAlerts: React.FC<CapacityAlertsProps> = ({ metrics }) => {
  // Generate dynamic alerts based on current metrics
  const generateAlerts = (): CapacityAlert[] => {
    const alerts: CapacityAlert[] = [];
    
    // Check overall utilization
    const overallUtilization = (metrics.current_occupancy / metrics.max_capacity) * 100;
    if (overallUtilization > 85) {
      alerts.push({
        id: 'overall-critical',
        type: 'critical',
        title: 'Critical Capacity Reached',
        description: 'Overall facility utilization has exceeded safe operating levels',
        metric: 'Overall Utilization',
        current_value: overallUtilization,
        threshold_value: 85,
        trend: 'increasing',
        timestamp: new Date().toISOString(),
        action_required: true,
        suggested_actions: [
          'Activate overflow protocols',
          'Consider temporary capacity restrictions',
          'Monitor safety compliance closely'
        ]
      });
    } else if (overallUtilization > 75) {
      alerts.push({
        id: 'overall-warning',
        type: 'warning',
        title: 'High Capacity Utilization',
        description: 'Facility approaching peak capacity levels',
        metric: 'Overall Utilization',
        current_value: overallUtilization,
        threshold_value: 75,
        trend: 'increasing',
        timestamp: new Date().toISOString(),
        action_required: false,
        suggested_actions: [
          'Monitor closely for further increases',
          'Prepare contingency plans',
          'Consider load balancing'
        ]
      });
    }

    // Check zone-specific alerts
    metrics.zones.forEach((zone: any) => {
      const zoneUtilization = (zone.current_occupancy / zone.max_capacity) * 100;
      
      if (zoneUtilization > 90) {
        alerts.push({
          id: `zone-${zone.id}-critical`,
          type: 'critical',
          title: `${zone.name} Over Capacity`,
          description: `${zone.name} has exceeded maximum safe occupancy`,
          zone: zone.name,
          metric: 'Zone Utilization',
          current_value: zoneUtilization,
          threshold_value: 90,
          trend: 'increasing',
          timestamp: new Date().toISOString(),
          action_required: true,
          suggested_actions: [
            'Implement immediate capacity controls',
            'Redirect new users to other zones',
            'Ensure safety protocols are followed'
          ]
        });
      } else if (zoneUtilization > 80) {
        alerts.push({
          id: `zone-${zone.id}-warning`,
          type: 'warning',
          title: `${zone.name} High Utilization`,
          description: `${zone.name} approaching capacity limits`,
          zone: zone.name,
          metric: 'Zone Utilization',
          current_value: zoneUtilization,
          threshold_value: 80,
          trend: 'stable',
          timestamp: new Date().toISOString(),
          action_required: false,
          suggested_actions: [
            'Monitor zone capacity closely',
            'Consider temporary equipment adjustments',
            'Prepare for potential overflow'
          ]
        });
      }
    });

    // Check efficiency alerts
    if (metrics.efficiency_score < 60) {
      alerts.push({
        id: 'efficiency-warning',
        type: 'warning',
        title: 'Low Efficiency Score',
        description: 'Overall space efficiency has dropped below optimal levels',
        metric: 'Efficiency Score',
        current_value: metrics.efficiency_score,
        threshold_value: 60,
        trend: 'decreasing',
        timestamp: new Date().toISOString(),
        action_required: false,
        suggested_actions: [
          'Review resource allocation',
          'Analyze usage patterns',
          'Consider layout optimization'
        ]
      });
    }

    // Check for bottlenecks
    if (metrics.bottleneck_resources && metrics.bottleneck_resources.length > 0) {
      alerts.push({
        id: 'bottleneck-info',
        type: 'info',
        title: 'Resource Bottlenecks Detected',
        description: `${metrics.bottleneck_resources.length} resources showing high demand`,
        metric: 'Resource Utilization',
        current_value: metrics.bottleneck_resources.length,
        threshold_value: 0,
        trend: 'stable',
        timestamp: new Date().toISOString(),
        action_required: false,
        suggested_actions: [
          'Review equipment scheduling',
          'Consider capacity expansion',
          'Implement queue management'
        ]
      });
    }

    // If no issues, add a positive alert
    if (alerts.length === 0) {
      alerts.push({
        id: 'all-good',
        type: 'info',
        title: 'All Systems Operating Normally',
        description: 'Capacity levels are within optimal ranges across all zones',
        metric: 'Overall Status',
        current_value: 100,
        threshold_value: 100,
        trend: 'stable',
        timestamp: new Date().toISOString(),
        action_required: false,
        suggested_actions: []
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'warning': return Clock;
      case 'info': return CheckCircle2;
      default: return Bell;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getAlertTextColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-800';
      case 'warning': return 'text-yellow-800';
      case 'info': return 'text-blue-800';
      default: return 'text-gray-800';
    }
  };

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'decreasing': return <TrendingUp className="h-3 w-3 text-green-500 transform rotate-180" />;
      case 'stable': return <Zap className="h-3 w-3 text-blue-500" />;
      default: return null;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const criticalAlerts = alerts.filter(alert => alert.type === 'critical');
  const warningAlerts = alerts.filter(alert => alert.type === 'warning');
  const infoAlerts = alerts.filter(alert => alert.type === 'info');

  return (
    <div className="space-y-4">
      {/* Alert Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">Capacity Alerts</h3>
          <div className="flex items-center space-x-2">
            {criticalAlerts.length > 0 && (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                {criticalAlerts.length} Critical
              </Badge>
            )}
            {warningAlerts.length > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                {warningAlerts.length} Warning
              </Badge>
            )}
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              {infoAlerts.length} Info
            </Badge>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Alert Settings
        </Button>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {alerts.map(alert => {
          const AlertIcon = getAlertIcon(alert.type);
          
          return (
            <Card key={alert.id} className={`border-2 ${getAlertColor(alert.type)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      alert.type === 'critical' ? 'bg-red-100' :
                      alert.type === 'warning' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      <AlertIcon className={`h-4 w-4 ${
                        alert.type === 'critical' ? 'text-red-600' :
                        alert.type === 'warning' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-semibold ${getAlertTextColor(alert.type)}`}>
                          {alert.title}
                        </h4>
                        <Badge className={getAlertBadgeColor(alert.type)}>
                          {alert.type}
                        </Badge>
                        {alert.action_required && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            Action Required
                          </Badge>
                        )}
                      </div>
                      
                      <p className={`text-sm ${getAlertTextColor(alert.type)} mb-2`}>
                        {alert.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{alert.metric}:</span>
                          <span>{alert.current_value.toFixed(1)}{alert.metric.includes('Utilization') || alert.metric.includes('Score') ? '%' : ''}</span>
                          {alert.threshold_value > 0 && (
                            <>
                              <span>/</span>
                              <span>{alert.threshold_value}{alert.metric.includes('Utilization') || alert.metric.includes('Score') ? '%' : ''}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(alert.trend)}
                          <span>{alert.trend}</span>
                        </div>
                        {alert.zone && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{alert.zone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(alert.timestamp)}</span>
                        </div>
                      </div>
                      
                      {alert.suggested_actions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h5 className="text-xs font-medium text-gray-700 mb-2">Suggested Actions:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {alert.suggested_actions.map((action, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-gray-400">•</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CapacityAlerts;
