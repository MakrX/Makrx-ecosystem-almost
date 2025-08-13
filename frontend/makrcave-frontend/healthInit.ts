// ========================================
// HEALTH CHECK INITIALIZATION
// ========================================
// Initialize health monitoring system for MakrCave
// Sets up monitoring, middleware, and global health tracking

import healthCheckService from './services/healthCheckService';
import { healthMiddleware } from './middleware/healthMiddleware';

// ========================================
// GLOBAL HEALTH INITIALIZATION
// ========================================

export function initializeHealthChecks() {
  console.log('🏥 Initializing MakrCave Health Monitoring System...');

  // Initialize middleware for API monitoring
  healthMiddleware.interceptFetch();

  // Set up global error handlers
  setupGlobalErrorHandlers();

  // Set up performance monitoring
  setupPerformanceMonitoring();

  // Register service worker for background health checks (if supported)
  registerHealthServiceWorker();

  // Initial health check
  performInitialHealthCheck();

  console.log('✅ Health monitoring system initialized');
}

// ========================================
// GLOBAL ERROR HANDLING
// ========================================

function setupGlobalErrorHandlers() {
  // Catch unhandled JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error detected:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });

    // Track application stability
    trackApplicationError('javascript_error', {
      message: event.message,
      source: event.filename
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    trackApplicationError('promise_rejection', {
      reason: event.reason?.toString()
    });
  });

  // Monitor network status
  window.addEventListener('online', () => {
    console.log('🌐 Network connection restored');
    healthCheckService.runAllChecks();
  });

  window.addEventListener('offline', () => {
    console.warn('📴 Network connection lost');
  });
}

// ========================================
// PERFORMANCE MONITORING
// ========================================

function setupPerformanceMonitoring() {
  // Monitor page load performance
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (perfData) {
        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
        const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
        
        console.log('📊 Page performance metrics:', {
          loadTime: `${loadTime}ms`,
          domContentLoaded: `${domContentLoaded}ms`,
          transferSize: perfData.transferSize
        });

        // Track slow page loads
        if (loadTime > 5000) {
          console.warn('⚠️ Slow page load detected:', loadTime + 'ms');
        }
      }
    }, 0);
  });

  // Monitor memory usage (if available)
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      
      // Warn if memory usage is high
      if (usedMB > limitMB * 0.8) {
        console.warn('🧠 High memory usage detected:', {
          used: `${usedMB}MB`,
          limit: `${limitMB}MB`,
          percentage: Math.round((usedMB / limitMB) * 100) + '%'
        });
      }
    }, 60000); // Check every minute
  }
}

// ========================================
// SERVICE WORKER REGISTRATION
// ========================================

function registerHealthServiceWorker() {
  if ('serviceWorker' in navigator) {
    // We'll register a simple service worker for background health checks
    const swCode = `
      self.addEventListener('message', (event) => {
        if (event.data === 'HEALTH_CHECK') {
          // Perform background health check
          self.postMessage({ type: 'HEALTH_STATUS', status: 'healthy' });
        }
      });
    `;

    const blob = new Blob([swCode], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(blob);

    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log('🔧 Health service worker registered');
      })
      .catch((error) => {
        console.warn('⚠️ Service worker registration failed:', error);
      });
  }
}

// ========================================
// INITIAL HEALTH CHECK
// ========================================

async function performInitialHealthCheck() {
  try {
    console.log('🔍 Running initial system health check...');
    
    const quickStatus = await healthCheckService.getQuickStatus();
    console.log('📋 Initial health status:', quickStatus);

    // Run full health check in background
    healthCheckService.runAllChecks().then((status) => {
      console.log('✅ Complete health check finished:', {
        overall: status.overall,
        services: status.services.length,
        healthy: status.services.filter(s => s.status === 'healthy').length
      });
    });

  } catch (error) {
    console.error('❌ Initial health check failed:', error);
  }
}

// ========================================
// ERROR TRACKING
// ========================================

function trackApplicationError(type: string, details: any) {
  // Store error for health reporting
  const errorData = {
    type,
    details,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // Store in session storage for debugging
  const errors = JSON.parse(sessionStorage.getItem('health_errors') || '[]');
  errors.unshift(errorData);
  
  // Keep only last 10 errors
  if (errors.length > 10) {
    errors.splice(10);
  }
  
  sessionStorage.setItem('health_errors', JSON.stringify(errors));
}

// ========================================
// HEALTH MONITORING UTILITIES
// ========================================

export function getApplicationErrors() {
  return JSON.parse(sessionStorage.getItem('health_errors') || '[]');
}

export function clearApplicationErrors() {
  sessionStorage.removeItem('health_errors');
}

export function getHealthSummary() {
  return {
    apiHealth: healthMiddleware.getOverallHealth(),
    errors: getApplicationErrors(),
    performance: {
      memory: (performance as any).memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
        limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
      } : null,
      timing: performance.timing ? {
        loadTime: performance.timing.loadEventEnd - performance.timing.loadEventStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.domContentLoadedEventStart
      } : null
    },
    connection: {
      online: navigator.onLine,
      type: (navigator as any).connection?.effectiveType || 'unknown'
    }
  };
}

// ========================================
// HEALTH DASHBOARD INTEGRATION
// ========================================

// Global health status for easy access
declare global {
  interface Window {
    MakrCaveHealth: {
      getStatus: () => any;
      runChecks: () => Promise<any>;
      getErrors: () => any[];
      clearErrors: () => void;
      getSummary: () => any;
    };
  }
}

// Expose health utilities globally for debugging
window.MakrCaveHealth = {
  getStatus: () => healthCheckService.getQuickStatus(),
  runChecks: () => healthCheckService.runAllChecks(),
  getErrors: getApplicationErrors,
  clearErrors: clearApplicationErrors,
  getSummary: getHealthSummary
};

// ========================================
// AUTO-INITIALIZATION
// ========================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeHealthChecks);
} else {
  initializeHealthChecks();
}

export default {
  initialize: initializeHealthChecks,
  getErrors: getApplicationErrors,
  clearErrors: clearApplicationErrors,
  getSummary: getHealthSummary
};
