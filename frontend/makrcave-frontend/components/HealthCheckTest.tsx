import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { healthCheckService, type SystemHealthStatus } from '../services/healthCheckService';

const HealthCheckTest: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runHealthCheck = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const status = await healthCheckService.runAllChecks();
      setHealthStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Health check failed');
      console.error('Health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default' as const,
      degraded: 'secondary' as const,
      unhealthy: 'destructive' as const,
      unknown: 'outline' as const
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              System Health Check
              {healthStatus && getStatusIcon(healthStatus.overall)}
            </CardTitle>
            <Button 
              onClick={runHealthCheck} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-600">Running health checks...</p>
            </div>
          )}

          {healthStatus && !loading && (
            <div className="space-y-6">
              {/* Overall Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Overall System Health</h3>
                  <p className="text-sm text-gray-600">
                    Last updated: {new Date(healthStatus.lastUpdated).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Environment: {healthStatus.environment}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(healthStatus.overall)}
                  {getStatusBadge(healthStatus.overall)}
                </div>
              </div>

              {/* Individual Services */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Service Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {healthStatus.services.map((service, index) => (
                    <div 
                      key={`${service.service}-${index}`}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{service.service}</span>
                        {getStatusIcon(service.status)}
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        {getStatusBadge(service.status)}
                        <span className="text-xs text-gray-500">
                          {Math.round(service.responseTime)}ms
                        </span>
                      </div>
                      
                      {service.details && (
                        <p className="text-xs text-gray-600 mb-2">{service.details}</p>
                      )}
                      
                      {service.error && (
                        <p className="text-xs text-red-600">Error: {service.error}</p>
                      )}
                      
                      {service.metadata && (
                        <div className="mt-2 text-xs text-gray-500">
                          {service.metadata.environment && (
                            <div>Env: {service.metadata.environment}</div>
                          )}
                          {service.metadata.usingFallback && (
                            <div className="text-blue-600">Using fallback data</div>
                          )}
                          {service.metadata.skippedInCloud && (
                            <div className="text-blue-600">Skipped in cloud</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {healthStatus.services.filter(s => s.status === 'healthy').length}
                  </div>
                  <div className="text-sm text-gray-600">Healthy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {healthStatus.services.filter(s => s.status === 'degraded').length}
                  </div>
                  <div className="text-sm text-gray-600">Degraded</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {healthStatus.services.filter(s => s.status === 'unhealthy').length}
                  </div>
                  <div className="text-sm text-gray-600">Unhealthy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {healthStatus.services.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Services</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthCheckTest;
