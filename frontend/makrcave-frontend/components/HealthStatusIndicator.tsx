// ========================================
// HEALTH STATUS INDICATOR COMPONENT
// ========================================
// Compact health status indicator for header/navigation
// Shows overall system health with quick access to details

import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from './ui/popover';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  XCircle 
} from 'lucide-react';
import { useHealth, useHealthStatus, useHealthMetrics } from '../contexts/HealthContext';
import { useNavigate } from 'react-router-dom';

interface HealthStatusIndicatorProps {
  showLabel?: boolean;
  variant?: 'compact' | 'detailed';
  position?: 'header' | 'sidebar' | 'floating';
}

export default function HealthStatusIndicator({ 
  showLabel = false, 
  variant = 'compact',
  position = 'header' 
}: HealthStatusIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { runHealthChecks, isLoading, lastUpdate } = useHealth();
  const healthStatus = useHealthStatus();
  const metrics = useHealthMetrics();
  const navigate = useNavigate();

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'degraded': return 'secondary';
      case 'unhealthy': return 'destructive';
      default: return 'outline';
    }
  };

  const handleViewDetails = () => {
    setIsOpen(false);
    navigate('/portal/system-health');
  };

  const formatLastUpdate = (date: string | undefined) => {
    if (!date) return 'Never';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'Over 24h ago';
  };

  // ========================================
  // RENDER VARIANTS
  // ========================================

  const renderCompactIndicator = () => (
    <div className="flex items-center gap-2">
      <div className={`${getStatusColor(healthStatus.overall)} animate-pulse`}>
        {getStatusIcon(healthStatus.overall)}
      </div>
      {showLabel && (
        <span className="text-sm font-medium">
          {healthStatus.overall === 'healthy' ? 'Healthy' : 
           healthStatus.overall === 'degraded' ? 'Issues' : 
           healthStatus.overall === 'unhealthy' ? 'Critical' : 'Unknown'}
        </span>
      )}
    </div>
  );

  const renderDetailedPopover = () => (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            System Health
          </CardTitle>
          <Badge variant={getStatusBadgeVariant(healthStatus.overall)}>
            {healthStatus.overall}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="text-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className={getStatusColor(healthStatus.overall)}>
              {getStatusIcon(healthStatus.overall)}
            </div>
            <span className="font-medium">{healthStatus.message}</span>
          </div>
          <p className="text-muted-foreground text-xs">
            Environment: {healthStatus.environment || 'Unknown'}
          </p>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="text-center p-2 bg-muted rounded">
            <div className="font-semibold text-lg text-green-600">
              {metrics.healthyServices}
            </div>
            <div className="text-muted-foreground">Healthy</div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="font-semibold text-lg text-yellow-600">
              {metrics.degradedServices + metrics.unhealthyServices}
            </div>
            <div className="text-muted-foreground">Issues</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Services:</span>
            <span className="font-medium">{metrics.totalServices}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Health Score:</span>
            <span className="font-medium">{metrics.healthPercentage}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg Response:</span>
            <span className="font-medium">{metrics.averageResponseTime}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Update:</span>
            <span className="font-medium">{formatLastUpdate(healthStatus.lastUpdate)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={runHealthChecks}
            disabled={isLoading}
            className="flex-1"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="flex-1"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderFloatingIndicator = () => (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className={getStatusColor(healthStatus.overall)}>
              {getStatusIcon(healthStatus.overall)}
            </div>
            <div className="text-sm">
              <div className="font-medium">System Health</div>
              <div className="text-xs text-muted-foreground">
                {metrics.healthyServices}/{metrics.totalServices} services healthy
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewDetails}
              className="ml-2"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  if (position === 'floating') {
    return renderFloatingIndicator();
  }

  if (variant === 'compact') {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 hover:bg-muted/50"
            title="System Health Status"
          >
            {renderCompactIndicator()}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-auto" 
          align="end"
          side={position === 'header' ? 'bottom' : 'right'}
        >
          {renderDetailedPopover()}
        </PopoverContent>
      </Popover>
    );
  }

  // Detailed variant (for sidebar or dedicated space)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">System Health</span>
        <Badge variant={getStatusBadgeVariant(healthStatus.overall)} className="text-xs">
          {healthStatus.overall}
        </Badge>
      </div>
      
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Healthy:</span>
          <span className="text-green-600">{metrics.healthyServices}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Issues:</span>
          <span className="text-orange-600">{metrics.degradedServices + metrics.unhealthyServices}</span>
        </div>
      </div>

      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={runHealthChecks}
          disabled={isLoading}
          className="flex-1 h-7 text-xs"
        >
          {isLoading ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            'Refresh'
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetails}
          className="h-7 px-2"
        >
          <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
