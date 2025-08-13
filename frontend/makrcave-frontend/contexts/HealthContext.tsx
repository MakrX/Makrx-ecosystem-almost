// ========================================
// HEALTH CHECK CONTEXT
// ========================================
// Provides app-wide health monitoring and status management
// Tracks system health and provides notifications for issues

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import healthCheckService, { SystemHealthStatus, HealthCheckResult } from '../services/healthCheckService';

interface HealthContextType {
  // Health status
  systemHealth: SystemHealthStatus | null;
  quickStatus: { status: string; message: string } | null;
  isHealthy: boolean;
  isLoading: boolean;
  lastUpdate: Date | null;

  // Actions
  runHealthChecks: () => Promise<void>;
  getServiceStatus: (serviceName: string) => HealthCheckResult | null;
  clearCache: () => void;

  // Configuration
  autoRefresh: boolean;
  setAutoRefresh: (enabled: boolean) => void;
  refreshInterval: number;
  setRefreshInterval: (interval: number) => void;

  // Health events
  onHealthChange?: (status: SystemHealthStatus) => void;
  onCriticalIssue?: (issues: HealthCheckResult[]) => void;
}

interface HealthProviderProps {
  children: ReactNode;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableNotifications?: boolean;
  onHealthChange?: (status: SystemHealthStatus) => void;
  onCriticalIssue?: (issues: HealthCheckResult[]) => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ 
  children, 
  autoRefresh = true,
  refreshInterval = 60000, // 1 minute default
  enableNotifications = true,
  onHealthChange,
  onCriticalIssue
}: HealthProviderProps) {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus | null>(null);
  const [quickStatus, setQuickStatus] = useState<{ status: string; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh);
  const [currentRefreshInterval, setCurrentRefreshInterval] = useState(refreshInterval);

  // ========================================
  // HEALTH CHECK FUNCTIONS
  // ========================================

  const runHealthChecks = useCallback(async () => {
    if (isLoading) return; // Prevent concurrent health checks
    
    setIsLoading(true);
    try {
      // Get comprehensive health status
      const [fullHealth, quick] = await Promise.all([
        healthCheckService.runAllChecks(),
        healthCheckService.getQuickStatus()
      ]);

      // Update state
      const previousHealth = systemHealth;
      setSystemHealth(fullHealth);
      setQuickStatus(quick);
      setLastUpdate(new Date());

      // Trigger health change callback
      if (onHealthChange) {
        onHealthChange(fullHealth);
      }

      // Check for critical issues
      const criticalIssues = fullHealth.services.filter(service => service.status === 'unhealthy');
      if (criticalIssues.length > 0 && onCriticalIssue) {
        onCriticalIssue(criticalIssues);
      }

      // Show notifications for health changes
      if (enableNotifications && previousHealth) {
        handleHealthChangeNotifications(previousHealth, fullHealth);
      }

    } catch (error) {
      console.error('Health check failed:', error);
      setQuickStatus({ 
        status: 'unknown', 
        message: 'Health check system error' 
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, systemHealth, onHealthChange, onCriticalIssue, enableNotifications]);

  // ========================================
  // NOTIFICATION HANDLING
  // ========================================

  const handleHealthChangeNotifications = (
    previousHealth: SystemHealthStatus, 
    currentHealth: SystemHealthStatus
  ) => {
    // Overall health status change
    if (previousHealth.overall !== currentHealth.overall) {
      const message = getHealthChangeMessage(previousHealth.overall, currentHealth.overall);
      showNotification(message, currentHealth.overall);
    }

    // Service-specific issues
    const newlyUnhealthyServices = currentHealth.services.filter(service => {
      const previousService = previousHealth.services.find(s => s.service === service.service);
      return service.status === 'unhealthy' && 
             previousService && 
             previousService.status !== 'unhealthy';
    });

    newlyUnhealthyServices.forEach(service => {
      showNotification(
        `${service.service} service is experiencing issues`,
        'unhealthy'
      );
    });
  };

  const getHealthChangeMessage = (previous: string, current: string): string => {
    if (previous === 'unhealthy' && current === 'healthy') {
      return 'System health has been restored - all services operational';
    }
    if (previous === 'healthy' && current === 'degraded') {
      return 'System health degraded - some services experiencing issues';
    }
    if (previous === 'healthy' && current === 'unhealthy') {
      return 'Critical system issues detected - multiple services failing';
    }
    if (previous === 'degraded' && current === 'healthy') {
      return 'System health improved - issues resolved';
    }
    if (previous === 'degraded' && current === 'unhealthy') {
      return 'System health deteriorated - critical issues detected';
    }
    return `System health changed from ${previous} to ${current}`;
  };

  const showNotification = (message: string, severity: string) => {
    // Use browser notifications if available and permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      const icon = severity === 'healthy' ? '✅' : 
                   severity === 'degraded' ? '⚠️' : '❌';
      
      new Notification(`${icon} MakrCave Health Alert`, {
        body: message,
        icon: '/favicon.ico',
        tag: 'health-status'
      });
    }

    // Also log to console for debugging
    console.log(`Health Alert: ${message}`);
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const getServiceStatus = useCallback((serviceName: string): HealthCheckResult | null => {
    if (!systemHealth) return null;
    return systemHealth.services.find(service => service.service === serviceName) || null;
  }, [systemHealth]);

  const clearCache = useCallback(() => {
    healthCheckService.clearCache();
    setSystemHealth(null);
    setQuickStatus(null);
    setLastUpdate(null);
  }, []);

  const isHealthy = systemHealth?.overall === 'healthy';

  // ========================================
  // AUTO-REFRESH EFFECT
  // ========================================

  useEffect(() => {
    // Initial health check
    runHealthChecks();

    // Request notification permission
    if (enableNotifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Set up auto-refresh interval
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefreshEnabled && currentRefreshInterval > 0) {
      intervalId = setInterval(runHealthChecks, currentRefreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefreshEnabled, currentRefreshInterval, runHealthChecks, enableNotifications]);

  // ========================================
  // PAGE VISIBILITY HANDLING
  // ========================================

  useEffect(() => {
    const handleVisibilityChange = () => {
      // Run health check when page becomes visible
      if (!document.hidden && autoRefreshEnabled) {
        runHealthChecks();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [runHealthChecks, autoRefreshEnabled]);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value: HealthContextType = {
    // Health status
    systemHealth,
    quickStatus,
    isHealthy,
    isLoading,
    lastUpdate,

    // Actions
    runHealthChecks,
    getServiceStatus,
    clearCache,

    // Configuration
    autoRefresh: autoRefreshEnabled,
    setAutoRefresh: setAutoRefreshEnabled,
    refreshInterval: currentRefreshInterval,
    setRefreshInterval: setCurrentRefreshInterval,

    // Health events
    onHealthChange,
    onCriticalIssue
  };

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
}

// ========================================
// HOOK FOR USING HEALTH CONTEXT
// ========================================

export function useHealth(): HealthContextType {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}

// ========================================
// HEALTH STATUS HOOK
// ========================================

export function useHealthStatus(serviceName?: string) {
  const { systemHealth, quickStatus, isHealthy, getServiceStatus } = useHealth();
  
  if (serviceName) {
    const serviceStatus = getServiceStatus(serviceName);
    return {
      status: serviceStatus?.status || 'unknown',
      isHealthy: serviceStatus?.status === 'healthy',
      details: serviceStatus?.details,
      error: serviceStatus?.error,
      responseTime: serviceStatus?.responseTime,
      lastCheck: serviceStatus?.timestamp
    };
  }

  return {
    overall: systemHealth?.overall || 'unknown',
    isHealthy,
    message: quickStatus?.message || 'Unknown',
    lastUpdate: systemHealth?.lastUpdated,
    environment: systemHealth?.environment
  };
}

// ========================================
// HEALTH METRICS HOOK
// ========================================

export function useHealthMetrics() {
  const { systemHealth } = useHealth();
  
  if (!systemHealth) {
    return {
      totalServices: 0,
      healthyServices: 0,
      degradedServices: 0,
      unhealthyServices: 0,
      averageResponseTime: 0,
      healthPercentage: 0
    };
  }

  const services = systemHealth.services;
  const healthy = services.filter(s => s.status === 'healthy').length;
  const degraded = services.filter(s => s.status === 'degraded').length;
  const unhealthy = services.filter(s => s.status === 'unhealthy').length;
  const avgResponseTime = services.reduce((acc, s) => acc + s.responseTime, 0) / services.length;

  return {
    totalServices: services.length,
    healthyServices: healthy,
    degradedServices: degraded,
    unhealthyServices: unhealthy,
    averageResponseTime: Math.round(avgResponseTime),
    healthPercentage: Math.round((healthy / services.length) * 100)
  };
}

export default HealthContext;
