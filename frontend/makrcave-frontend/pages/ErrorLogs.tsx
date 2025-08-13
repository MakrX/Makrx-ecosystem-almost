// ========================================
// ERROR LOGS DASHBOARD PAGE
// ========================================
// Administrative dashboard for viewing and managing system error logs

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  AlertTriangle, 
  Bug, 
  Activity, 
  Filter, 
  Download, 
  Trash2, 
  RefreshCw,
  Clock,
  User,
  Globe,
  Server,
  Smartphone,
  Eye
} from 'lucide-react';
import loggingService, { LogEntry } from '../services/loggingService';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { PageErrorBoundary } from '../components/ErrorBoundary';

export default function ErrorLogs() {
  return (
    <ProtectedRoute adminFeature="systemLogs" allowedRoles={['super_admin', 'admin']}>
      <PageErrorBoundary pageName="Error Logs">
        <ErrorLogsContent />
      </PageErrorBoundary>
    </ProtectedRoute>
  );
}

function ErrorLogsContent() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof loggingService.getLogStats> | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ========================================
  // DATA LOADING
  // ========================================

  const loadLogs = async () => {
    setIsLoading(true);
    
    try {
      loggingService.info('ui', 'ErrorLogsPage.loadLogs', 'Loading error logs for admin dashboard', {
        userId: user?.id,
        userRole: user?.role
      });

      const allLogs = loggingService.getLogs();
      const logStats = loggingService.getLogStats();
      
      setLogs(allLogs);
      setStats(logStats);
      
      // Apply current filters
      applyFilters(allLogs, selectedLevel, selectedCategory);
      
      loggingService.info('ui', 'ErrorLogsPage.loadLogs', 'Error logs loaded successfully', {
        totalLogs: allLogs.length,
        errorCount: logStats.errorCount24h
      });
      
    } catch (error) {
      loggingService.error('ui', 'ErrorLogsPage.loadLogs', 'Failed to load error logs', {
        error: (error as Error).message
      }, (error as Error).stack);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (logList: LogEntry[], level: string, category: string) => {
    let filtered = [...logList];

    if (level !== 'all') {
      filtered = filtered.filter(log => log.level === level);
    }

    if (category !== 'all') {
      filtered = filtered.filter(log => log.category === category);
    }

    setFilteredLogs(filtered);
    
    loggingService.debug('ui', 'ErrorLogsPage.applyFilters', 'Applied log filters', {
      level,
      category,
      originalCount: logList.length,
      filteredCount: filtered.length
    });
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters(logs, selectedLevel, selectedCategory);
  }, [logs, selectedLevel, selectedCategory]);

  // ========================================
  // ACTION HANDLERS
  // ========================================

  const handleClearLogs = () => {
    loggingService.info('ui', 'ErrorLogsPage.handleClearLogs', 'Admin cleared all logs', {
      userId: user?.id,
      logsCleared: logs.length
    });
    
    loggingService.clearLogs();
    loadLogs();
  };

  const handleExportLogs = () => {
    const exportData = loggingService.exportLogs();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `makrcave-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    loggingService.info('ui', 'ErrorLogsPage.handleExportLogs', 'Admin exported logs', {
      userId: user?.id,
      logsExported: logs.length
    });
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'error': return <Bug className="w-4 h-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'debug': return <Eye className="w-4 h-4 text-gray-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getLevelBadgeVariant = (level: LogEntry['level']) => {
    switch (level) {
      case 'critical': return 'destructive' as const;
      case 'error': return 'destructive' as const;
      case 'warn': return 'secondary' as const;
      case 'info': return 'default' as const;
      case 'debug': return 'outline' as const;
      default: return 'outline' as const;
    }
  };

  const getCategoryIcon = (category: LogEntry['category']) => {
    switch (category) {
      case 'auth': return <User className="w-4 h-4" />;
      case 'api': return <Server className="w-4 h-4" />;
      case 'ui': return <Smartphone className="w-4 h-4" />;
      case 'system': return <Globe className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Logs</p>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Errors (24h)</p>
              <p className="text-2xl font-bold text-red-600">{stats?.errorCount24h || 0}</p>
            </div>
            <Bug className="w-8 h-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Critical Issues</p>
              <p className="text-2xl font-bold text-red-700">
                {stats?.byLevel?.critical || 0}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Last Error</p>
              <p className="text-sm font-medium">
                {stats?.lastError ? 
                  new Date(stats.lastError.timestamp).toLocaleTimeString() : 
                  'None'
                }
              </p>
            </div>
            <Clock className="w-8 h-8 text-gray-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFilters = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm font-medium">Level</label>
            <select 
              value={selectedLevel} 
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="ml-2 px-3 py-1 border rounded-md"
            >
              <option value="all">All Levels</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="ml-2 px-3 py-1 border rounded-md"
            >
              <option value="all">All Categories</option>
              <option value="auth">Authentication</option>
              <option value="api">API</option>
              <option value="ui">UI Components</option>
              <option value="system">System</option>
              <option value="performance">Performance</option>
              <option value="billing">Billing</option>
              <option value="health">Health</option>
            </select>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button onClick={loadLogs} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExportLogs} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleClearLogs} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderLogsList = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          Error Logs ({filteredLogs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No logs match the current filters
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getLevelIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getLevelBadgeVariant(log.level)}>
                          {log.level}
                        </Badge>
                        <Badge variant="outline">
                          {getCategoryIcon(log.category)}
                          <span className="ml-1">{log.category}</span>
                        </Badge>
                      </div>
                      <p className="text-sm font-medium truncate">{log.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.source} • {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderLogDetail = () => (
    selectedLog && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Log Details
            <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Level</label>
                <div className="flex items-center gap-2 mt-1">
                  {getLevelIcon(selectedLog.level)}
                  <Badge variant={getLevelBadgeVariant(selectedLog.level)}>
                    {selectedLog.level}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <div className="flex items-center gap-2 mt-1">
                  {getCategoryIcon(selectedLog.category)}
                  <span className="text-sm">{selectedLog.category}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Source</label>
                <p className="text-sm mt-1">{selectedLog.source}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Timestamp</label>
                <p className="text-sm mt-1">{new Date(selectedLog.timestamp).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Message</label>
              <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedLog.message}</p>
            </div>

            {selectedLog.metadata && (
              <div>
                <label className="text-sm font-medium">Metadata</label>
                <pre className="text-xs mt-1 p-2 bg-muted rounded max-h-40 overflow-y-auto">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.stackTrace && (
              <div>
                <label className="text-sm font-medium">Stack Trace</label>
                <pre className="text-xs mt-1 p-2 bg-muted rounded max-h-60 overflow-y-auto">
                  {selectedLog.stackTrace}
                </pre>
              </div>
            )}

            {selectedLog.userId && (
              <div>
                <label className="text-sm font-medium">User Context</label>
                <div className="text-sm mt-1 space-y-1">
                  <div>User ID: {selectedLog.userId}</div>
                  {selectedLog.userRole && <div>Role: {selectedLog.userRole}</div>}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Error Logs</h1>
          <p className="text-muted-foreground">
            Monitor and analyze system errors and logs
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Filters */}
      {renderFilters()}

      {/* Content Tabs */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Error Logs</TabsTrigger>
          <TabsTrigger value="details">Log Details</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {renderLogsList()}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedLog ? renderLogDetail() : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Select a log entry to view details
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
