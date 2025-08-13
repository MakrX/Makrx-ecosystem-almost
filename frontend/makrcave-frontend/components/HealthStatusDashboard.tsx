// ========================================
// HEALTH STATUS DASHBOARD COMPONENT
// ========================================
// Displays comprehensive system health information
// Real-time monitoring of all services and features

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Heart, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Shield,
  Database,
  Globe,
  Smartphone,
  Zap,
  Settings
} from 'lucide-react';
import healthCheckService, { SystemHealthStatus, HealthCheckResult } from '../services/healthCheckService';
import loggingService from '../services/loggingService';
import { useAuth } from '../contexts/AuthContext';
import { AdminOnly } from './ProtectedRoute';

interface HealthStatusDashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  compact?: boolean;
}

export default function HealthStatusDashboard({
  autoRefresh = true,
  refreshInterval = 30000,
  compact = false
}: HealthStatusDashboardProps) {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // ========================================
  // HEALTH CHECK MANAGEMENT
  // ========================================

  const runHealthChecks = async () => {
    setIsLoading(true);

    loggingService.info('health', 'HealthStatusDashboard.runHealthChecks', 'Running health checks', {
      userId: user?.id,
      userRole: user?.role,
      compact,
      autoRefresh
    });

    try {
      const status = await healthCheckService.runAllChecks();
      setHealthStatus(status);
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh health checks
  useEffect(() => {
    runHealthChecks();

    if (autoRefresh) {
      const interval = setInterval(runHealthChecks, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'unhealthy': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'unhealthy': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.includes('auth')) return <Shield className="w-4 h-4" />;
    if (serviceName.includes('api')) return <Database className="w-4 h-4" />;
    if (serviceName.includes('network')) return <Globe className="w-4 h-4" />;
    if (serviceName.includes('browser')) return <Smartphone className="w-4 h-4" />;
    if (serviceName.includes('theme')) return <Settings className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getOverallStatusMessage = (status: string) => {
    switch (status) {
      case 'healthy': return 'All systems operational';
      case 'degraded': return 'Some services experiencing issues';
      case 'unhealthy': return 'Critical system failures detected';
      default: return 'System status unknown';
    }
  };

  // ========================================
  // RENDER METHODS
  // ========================================

  const renderOverallStatus = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className={`w-6 h-6 ${getStatusColor(healthStatus?.overall || 'unknown')}`} />
            <div>
              <CardTitle className="text-lg">System Health</CardTitle>
              <p className="text-sm text-muted-foreground">
                {getOverallStatusMessage(healthStatus?.overall || 'unknown')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={healthStatus?.overall === 'healthy' ? 'default' : 
                      healthStatus?.overall === 'degraded' ? 'secondary' : 'destructive'}
              className="uppercase font-semibold"
            >
              {healthStatus?.overall || 'Unknown'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={runHealthChecks}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      {!compact && (
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Environment:</span>
              <div className="font-medium">{healthStatus?.environment || 'Unknown'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <div className="font-medium">
                {lastRefreshTime ? lastRefreshTime.toLocaleTimeString() : 'Never'}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Services Checked:</span>
              <div className="font-medium">{healthStatus?.services.length || 0}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Healthy Services:</span>
              <div className="font-medium text-green-600">
                {healthStatus?.services.filter(s => s.status === 'healthy').length || 0}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );

  const renderServiceGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {healthStatus?.services.map((service) => (
        <Card key={service.service} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getServiceIcon(service.service)}
                <CardTitle className="text-sm font-medium">
                  {service.service.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </CardTitle>
              </div>
              <div className={`flex items-center gap-1 ${getStatusColor(service.status)}`}>
                {getStatusIcon(service.status)}
                <span className="text-xs font-medium uppercase">{service.status}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Response Time:</span>
                <span className="font-medium">{formatResponseTime(service.responseTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Check:</span>
                <span className="font-medium">
                  {new Date(service.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {service.details && (
                <div>
                  <span className="text-muted-foreground">Details:</span>
                  <div className="font-medium text-xs mt-1 p-2 bg-muted rounded text-muted-foreground">
                    {service.details}
                  </div>
                </div>
              )}
              {service.error && (
                <div>
                  <span className="text-red-500">Error:</span>
                  <div className="font-medium text-xs mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-600 dark:text-red-400">
                    {service.error}
                  </div>
                </div>
              )}
              {service.metadata && Object.keys(service.metadata).length > 0 && !compact && (
                <div>
                  <span className="text-muted-foreground">Metadata:</span>
                  <div className="mt-1 text-xs">
                    {Object.entries(service.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderCompactView = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <CardTitle className="text-base">System Status</CardTitle>
          </div>
          <Badge 
            variant={healthStatus?.overall === 'healthy' ? 'default' : 
                    healthStatus?.overall === 'degraded' ? 'secondary' : 'destructive'}
          >
            {healthStatus?.overall || 'Unknown'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {healthStatus?.services.map((service) => (
            <div 
              key={service.service}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs"
            >
              <div className={getStatusColor(service.status)}>
                {getStatusIcon(service.service)}
              </div>
              <span>{service.service}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Last updated: {lastRefreshTime ? lastRefreshTime.toLocaleString() : 'Never'}
        </div>
      </CardContent>
    </Card>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  if (isLoading && !healthStatus) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Running health checks...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!healthStatus) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p>Unable to load health status</p>
            <Button onClick={runHealthChecks} variant="outline" size="sm" className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return renderCompactView();
  }

  return (
    <div className="space-y-6">
      {renderOverallStatus()}
      {renderServiceGrid()}
    </div>
  );
}
