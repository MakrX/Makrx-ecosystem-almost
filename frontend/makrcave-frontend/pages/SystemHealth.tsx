// ========================================
// SYSTEM HEALTH PAGE
// ========================================
// Comprehensive health monitoring dashboard for MakrCave
// Displays real-time status of all system components

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import HealthStatusDashboard from '../components/HealthStatusDashboard';
import { 
  Activity, 
  BarChart3, 
  Clock, 
  Download, 
  Settings, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import healthCheckService, { SystemHealthStatus } from '../services/healthCheckService';

export default function SystemHealth() {
  const [healthHistory, setHealthHistory] = useState<SystemHealthStatus[]>([]);
  const [quickStatus, setQuickStatus] = useState<{ status: string; message: string } | null>(null);

  // ========================================
  // HEALTH MONITORING
  // ========================================

  useEffect(() => {
    // Get initial quick status
    const updateQuickStatus = async () => {
      const status = await healthCheckService.getQuickStatus();
      setQuickStatus(status);
    };

    updateQuickStatus();
    const interval = setInterval(updateQuickStatus, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const handleExportHealthReport = () => {
    if (healthHistory.length === 0) return;
    
    const latestHealth = healthHistory[0];
    const report = {
      timestamp: new Date().toISOString(),
      systemHealth: latestHealth,
      summary: {
        totalServices: latestHealth.services.length,
        healthyServices: latestHealth.services.filter(s => s.status === 'healthy').length,
        degradedServices: latestHealth.services.filter(s => s.status === 'degraded').length,
        unhealthyServices: latestHealth.services.filter(s => s.status === 'unhealthy').length,
        averageResponseTime: latestHealth.services.reduce((acc, s) => acc + s.responseTime, 0) / latestHealth.services.length
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `makrcave-health-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearHealthCache = () => {
    healthCheckService.clearCache();
    window.location.reload();
  };

  // ========================================
  // COMPONENT RENDERS
  // ========================================

  const renderQuickStatusCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Quick Status
          </CardTitle>
          <Badge 
            variant={quickStatus?.status === 'healthy' ? 'default' : 
                    quickStatus?.status === 'degraded' ? 'secondary' : 'destructive'}
          >
            {quickStatus?.status || 'Unknown'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {quickStatus?.message || 'Checking system status...'}
        </p>
      </CardContent>
    </Card>
  );

  const renderSystemInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          System Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Browser:</span>
            <div className="font-medium">{navigator.userAgent.split(' ')[0] || 'Unknown'}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Platform:</span>
            <div className="font-medium">{navigator.platform || 'Unknown'}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Language:</span>
            <div className="font-medium">{navigator.language || 'Unknown'}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Online:</span>
            <div className="font-medium">{navigator.onLine ? 'Yes' : 'No'}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Screen:</span>
            <div className="font-medium">{screen.width}x{screen.height}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Timezone:</span>
            <div className="font-medium">{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Memory:</span>
            <div className="font-medium">
              {(performance as any)?.memory?.usedJSHeapSize ? 
                `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB` : 
                'Unknown'}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Connection:</span>
            <div className="font-medium">
              {(navigator as any)?.connection?.effectiveType || 'Unknown'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderHealthTips = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Health Tips & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-300">Optimal Performance</h4>
              <p className="text-sm text-green-700 dark:text-green-400">
                Keep your browser updated and clear cache regularly for best performance.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-300">Network Optimization</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Use a stable internet connection for real-time features and WebSocket connections.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800 dark:text-orange-300">Troubleshooting</h4>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                If you experience issues, try refreshing the page or clearing your browser cache.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderActionButtons = () => (
    <div className="flex flex-wrap gap-3">
      <Button onClick={handleExportHealthReport} variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Export Health Report
      </Button>
      <Button onClick={clearHealthCache} variant="outline">
        <Settings className="w-4 h-4 mr-2" />
        Clear Cache & Refresh
      </Button>
    </div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">
            Monitor the health and performance of all MakrCave services
          </p>
        </div>
        {renderActionButtons()}
      </div>

      {/* Quick Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          {renderQuickStatusCard()}
        </div>
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {new Date().toLocaleTimeString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Auto-refreshes every 30 seconds
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
          <TabsTrigger value="tips">Health Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <HealthStatusDashboard compact={true} />
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <HealthStatusDashboard compact={false} />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          {renderSystemInfo()}
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          {renderHealthTips()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
