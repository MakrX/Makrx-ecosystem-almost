// ========================================
// HEALTH CHECK MIDDLEWARE
// ========================================
// Middleware to monitor API calls and track service health
// Integrates with health check service to provide real-time monitoring

interface APIHealthMetrics {
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  timestamp: string;
  success: boolean;
  error?: string;
}

class HealthMiddleware {
  private metrics: APIHealthMetrics[] = [];
  private maxMetrics = 100; // Keep last 100 API calls
  private healthCallbacks: Array<(metrics: APIHealthMetrics) => void> = [];

  // ========================================
  // FETCH INTERCEPTOR
  // ========================================

  // Wrap the native fetch to monitor all API calls
  interceptFetch() {
    if (typeof window === 'undefined' || (window.fetch as any)._healthWrapped) {
      return; // Already wrapped or not in browser environment
    }

    const originalFetch = window.fetch;
    const self = this;

    window.fetch = async function(...args: Parameters<typeof fetch>): Promise<Response> {
      const startTime = performance.now();
      let url: string;
      let method: string;

      try {
        url = args[0] instanceof Request ? args[0].url : args[0].toString();
        method = args[1]?.method || (args[0] instanceof Request ? args[0].method : 'GET');
      } catch (error) {
        // If we can't extract URL/method, just proceed with original fetch
        return originalFetch.apply(this, args);
      }

      try {
        const response = await originalFetch.apply(this, args);
        const endTime = performance.now();

        // Record metrics for API calls only (not assets, etc.)
        if (self.isAPICall(url)) {
          const metrics: APIHealthMetrics = {
            endpoint: self.extractEndpoint(url),
            method,
            status: response.status,
            responseTime: endTime - startTime,
            timestamp: new Date().toISOString(),
            success: response.ok
          };

          self.recordMetrics(metrics);
        }

        return response;
      } catch (error) {
        const endTime = performance.now();

        // Only record metrics if we successfully extracted URL and this is an API call
        if (url && self.isAPICall(url)) {
          const metrics: APIHealthMetrics = {
            endpoint: self.extractEndpoint(url),
            method,
            status: 0, // Network error
            responseTime: endTime - startTime,
            timestamp: new Date().toISOString(),
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
          };

          self.recordMetrics(metrics);
        }

        // Re-throw the original error
        throw error;
      }
    };

    // Mark as wrapped to prevent double wrapping
    (window.fetch as any)._healthWrapped = true;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  private isAPICall(url: string): boolean {
    // Check if this is an API call we want to monitor
    return url.includes('/api/') || 
           url.includes('/v1/') || 
           url.includes('localhost:8000') ||
           url.includes('makrcave-backend');
  }

  private extractEndpoint(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Remove API base path and extract meaningful endpoint
      return pathname.replace(/^\/api\//, '/').replace(/^\/v1\//, '/');
    } catch {
      return url;
    }
  }

  private recordMetrics(metrics: APIHealthMetrics) {
    // Add to metrics array
    this.metrics.unshift(metrics);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(0, this.maxMetrics);
    }
    
    // Notify callbacks
    this.healthCallbacks.forEach(callback => {
      try {
        callback(metrics);
      } catch (error) {
        console.error('Health callback error:', error);
      }
    });
    
    // Log issues for immediate visibility
    if (!metrics.success) {
      console.warn(`API health issue: ${metrics.method} ${metrics.endpoint} - ${metrics.error || `Status ${metrics.status}`}`);
    }
  }

  // ========================================
  // PUBLIC API
  // ========================================

  // Get recent API metrics
  getMetrics(count = 50): APIHealthMetrics[] {
    return this.metrics.slice(0, count);
  }

  // Get metrics for a specific endpoint
  getEndpointMetrics(endpoint: string, count = 20): APIHealthMetrics[] {
    return this.metrics
      .filter(m => m.endpoint.includes(endpoint))
      .slice(0, count);
  }

  // Get health summary for an endpoint
  getEndpointHealth(endpoint: string) {
    const metrics = this.getEndpointMetrics(endpoint, 10);
    
    if (metrics.length === 0) {
      return {
        status: 'unknown',
        successRate: 0,
        averageResponseTime: 0,
        lastCall: null,
        recentErrors: []
      };
    }

    const successful = metrics.filter(m => m.success).length;
    const successRate = (successful / metrics.length) * 100;
    const averageResponseTime = metrics.reduce((acc, m) => acc + m.responseTime, 0) / metrics.length;
    const recentErrors = metrics.filter(m => !m.success).slice(0, 3);

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (successRate >= 95) {
      status = 'healthy';
    } else if (successRate >= 80) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      successRate: Math.round(successRate),
      averageResponseTime: Math.round(averageResponseTime),
      lastCall: metrics[0]?.timestamp,
      recentErrors: recentErrors.map(e => ({
        timestamp: e.timestamp,
        error: e.error || `HTTP ${e.status}`,
        responseTime: e.responseTime
      }))
    };
  }

  // Get overall API health summary
  getOverallHealth() {
    const recentMetrics = this.getMetrics(50);
    
    if (recentMetrics.length === 0) {
      return {
        status: 'unknown',
        totalCalls: 0,
        successRate: 0,
        averageResponseTime: 0,
        endpointSummary: {}
      };
    }

    const successful = recentMetrics.filter(m => m.success).length;
    const successRate = (successful / recentMetrics.length) * 100;
    const averageResponseTime = recentMetrics.reduce((acc, m) => acc + m.responseTime, 0) / recentMetrics.length;

    // Group by endpoint
    const endpointSummary: Record<string, any> = {};
    const endpoints = [...new Set(recentMetrics.map(m => m.endpoint))];
    
    endpoints.forEach(endpoint => {
      endpointSummary[endpoint] = this.getEndpointHealth(endpoint);
    });

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (successRate >= 95) {
      status = 'healthy';
    } else if (successRate >= 80) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      totalCalls: recentMetrics.length,
      successRate: Math.round(successRate),
      averageResponseTime: Math.round(averageResponseTime),
      endpointSummary
    };
  }

  // Subscribe to health events
  onHealthChange(callback: (metrics: APIHealthMetrics) => void) {
    this.healthCallbacks.push(callback);
    return () => {
      const index = this.healthCallbacks.indexOf(callback);
      if (index > -1) {
        this.healthCallbacks.splice(index, 1);
      }
    };
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics = [];
  }

  // Get error rate for the last N minutes
  getErrorRate(minutes = 10): number {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => new Date(m.timestamp) > cutoff);
    
    if (recentMetrics.length === 0) return 0;
    
    const errors = recentMetrics.filter(m => !m.success).length;
    return (errors / recentMetrics.length) * 100;
  }

  // Get slow requests (above threshold)
  getSlowRequests(thresholdMs = 5000): APIHealthMetrics[] {
    return this.metrics.filter(m => m.responseTime > thresholdMs);
  }

  // Export metrics as JSON
  exportMetrics() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: this.getOverallHealth()
    };
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================

export const healthMiddleware = new HealthMiddleware();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  healthMiddleware.interceptFetch();
}

export default healthMiddleware;

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Check if a service is healthy based on recent metrics
export function isServiceHealthy(serviceName: string): boolean {
  const health = healthMiddleware.getEndpointHealth(serviceName);
  return health.status === 'healthy';
}

// Get quick health status for dashboard
export function getQuickAPIHealth(): { status: string; message: string } {
  const health = healthMiddleware.getOverallHealth();
  
  if (health.totalCalls === 0) {
    return { status: 'unknown', message: 'No recent API activity' };
  }
  
  if (health.status === 'healthy') {
    return { status: 'healthy', message: `API healthy (${health.successRate}% success rate)` };
  } else if (health.status === 'degraded') {
    return { status: 'degraded', message: `API issues detected (${health.successRate}% success rate)` };
  } else {
    return { status: 'unhealthy', message: `API critical issues (${health.successRate}% success rate)` };
  }
}

// Integration with health check service
export function integrateWithHealthService() {
  // This can be called to enhance the health check service with real API metrics
  return {
    getAPIMetrics: () => healthMiddleware.getOverallHealth(),
    getEndpointHealth: (endpoint: string) => healthMiddleware.getEndpointHealth(endpoint),
    onAPIHealthChange: (callback: (metrics: APIHealthMetrics) => void) => 
      healthMiddleware.onHealthChange(callback)
  };
}
