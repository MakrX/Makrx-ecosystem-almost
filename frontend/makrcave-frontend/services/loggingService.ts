// ========================================
// LOGGING SERVICE
// ========================================
// Comprehensive logging system for error tracking, performance monitoring,
// and process logging across the entire MakrCave application

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  category: 'auth' | 'api' | 'ui' | 'performance' | 'billing' | 'health' | 'system' | 'user';
  source: string;
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  userRole?: string;
  stackTrace?: string;
  url?: string;
  userAgent?: string;
  sessionId: string;
}

export interface LoggingConfig {
  maxLogEntries: number;
  enableConsoleOutput: boolean;
  enableRemoteLogging: boolean;
  logLevels: LogEntry['level'][];
  categories: LogEntry['category'][];
  persistLogs: boolean;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private sessionId: string;
  private config: LoggingConfig;
  private remoteEndpoint: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.config = this.getDefaultConfig();
    this.initializeRemoteLogging();
    this.loadPersistedLogs();
    this.setupGlobalErrorHandlers();
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  private getDefaultConfig(): LoggingConfig {
    return {
      maxLogEntries: 1000,
      enableConsoleOutput: process.env.NODE_ENV === 'development',
      enableRemoteLogging: process.env.NODE_ENV === 'production',
      logLevels: ['debug', 'info', 'warn', 'error', 'critical'],
      categories: ['auth', 'api', 'ui', 'performance', 'billing', 'health', 'system', 'user'],
      persistLogs: true
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeRemoteLogging(): void {
    // Check for cloud environment and set remote logging endpoint
    const isCloudEnvironment = window.location.hostname !== 'localhost';
    if (isCloudEnvironment && this.config.enableRemoteLogging) {
      this.remoteEndpoint = '/api/logging/submit';
    }
  }

  private loadPersistedLogs(): void {
    if (!this.config.persistLogs) return;
    
    try {
      const stored = localStorage.getItem('makrcave_logs');
      if (stored) {
        const parsedLogs = JSON.parse(stored);
        this.logs = parsedLogs.slice(-100); // Keep only last 100 logs on startup
      }
    } catch (error) {
      console.warn('Failed to load persisted logs:', error);
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Global error handler for unhandled errors
    window.addEventListener('error', (event) => {
      this.error('system', 'Global Error Handler', event.error?.message || 'Unknown error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.toString()
      }, event.error?.stack);
    });

    // Global handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('system', 'Unhandled Promise Rejection', event.reason?.message || 'Promise rejected', {
        reason: event.reason?.toString(),
        type: 'unhandledrejection'
      }, event.reason?.stack);
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.warn('system', 'Resource Load Error', `Failed to load resource: ${(event.target as any)?.src || 'unknown'}`, {
          resourceType: (event.target as any)?.tagName,
          source: (event.target as any)?.src
        });
      }
    }, true);
  }

  // ========================================
  // CONFIGURATION
  // ========================================

  updateConfig(newConfig: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): LoggingConfig {
    return { ...this.config };
  }

  // ========================================
  // CORE LOGGING METHODS
  // ========================================

  private createLogEntry(
    level: LogEntry['level'],
    category: LogEntry['category'],
    source: string,
    message: string,
    metadata?: Record<string, any>,
    stackTrace?: string
  ): LogEntry {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      source,
      message,
      metadata,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      stackTrace
    };

    // Add user context if available
    try {
      const authContext = JSON.parse(localStorage.getItem('auth_context') || '{}');
      if (authContext.user) {
        entry.userId = authContext.user.id;
        entry.userRole = authContext.user.role;
      }
    } catch (error) {
      // Ignore auth context errors
    }

    return entry;
  }

  private shouldLog(level: LogEntry['level'], category: LogEntry['category']): boolean {
    return this.config.logLevels.includes(level) && 
           this.config.categories.includes(category);
  }

  private addLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level, entry.category)) return;

    this.logs.unshift(entry);
    
    // Maintain max log entries
    if (this.logs.length > this.config.maxLogEntries) {
      this.logs = this.logs.slice(0, this.config.maxLogEntries);
    }

    // Console output
    if (this.config.enableConsoleOutput) {
      this.outputToConsole(entry);
    }

    // Persist logs
    if (this.config.persistLogs) {
      this.persistLogs();
    }

    // Remote logging
    if (this.config.enableRemoteLogging && this.remoteEndpoint) {
      this.sendToRemote(entry);
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const consoleMethod = entry.level === 'debug' ? 'debug' :
                         entry.level === 'info' ? 'info' :
                         entry.level === 'warn' ? 'warn' :
                         'error';

    const prefix = `[${entry.category.toUpperCase()}] ${entry.source}:`;
    
    if (entry.metadata || entry.stackTrace) {
      console[consoleMethod](prefix, entry.message, {
        metadata: entry.metadata,
        stack: entry.stackTrace,
        timestamp: entry.timestamp
      });
    } else {
      console[consoleMethod](prefix, entry.message);
    }
  }

  private persistLogs(): void {
    try {
      // Only persist error and critical logs to save space
      const criticalLogs = this.logs.filter(log => 
        ['error', 'critical'].includes(log.level)
      ).slice(0, 50);
      
      localStorage.setItem('makrcave_logs', JSON.stringify(criticalLogs));
    } catch (error) {
      console.warn('Failed to persist logs:', error);
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.remoteEndpoint) return;

    try {
      // Only send error and critical logs to remote to reduce noise
      if (!['error', 'critical'].includes(entry.level)) return;

      await fetch(this.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // Don't log remote logging failures to avoid infinite loops
      console.warn('Failed to send log to remote:', error);
    }
  }

  // ========================================
  // PUBLIC LOGGING METHODS
  // ========================================

  debug(category: LogEntry['category'], source: string, message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('debug', category, source, message, metadata);
    this.addLog(entry);
  }

  info(category: LogEntry['category'], source: string, message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('info', category, source, message, metadata);
    this.addLog(entry);
  }

  warn(category: LogEntry['category'], source: string, message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('warn', category, source, message, metadata);
    this.addLog(entry);
  }

  error(category: LogEntry['category'], source: string, message: string, metadata?: Record<string, any>, stackTrace?: string): void {
    const entry = this.createLogEntry('error', category, source, message, metadata, stackTrace);
    this.addLog(entry);
  }

  critical(category: LogEntry['category'], source: string, message: string, metadata?: Record<string, any>, stackTrace?: string): void {
    const entry = this.createLogEntry('critical', category, source, message, metadata, stackTrace);
    this.addLog(entry);
  }

  // ========================================
  // SPECIALIZED LOGGING METHODS
  // ========================================

  logAuthEvent(event: string, success: boolean, metadata?: Record<string, any>): void {
    const level = success ? 'info' : 'warn';
    this[level]('auth', 'Authentication', `${event}: ${success ? 'Success' : 'Failed'}`, metadata);
  }

  logAPICall(endpoint: string, method: string, statusCode: number, responseTime: number, error?: any): void {
    const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
    const message = `${method} ${endpoint} - ${statusCode} (${responseTime}ms)`;
    
    this[level]('api', 'API Service', message, {
      endpoint,
      method,
      statusCode,
      responseTime,
      error: error?.message
    }, error?.stack);
  }

  logPerformance(metric: string, value: number, metadata?: Record<string, any>): void {
    this.info('performance', 'Performance Monitor', `${metric}: ${value}ms`, {
      metric,
      value,
      ...metadata
    });
  }

  logUserAction(action: string, metadata?: Record<string, any>): void {
    this.info('user', 'User Activity', action, metadata);
  }

  logBillingEvent(event: string, amount?: number, metadata?: Record<string, any>): void {
    this.info('billing', 'Billing Service', event, {
      amount,
      ...metadata
    });
  }

  logUIError(component: string, error: Error, metadata?: Record<string, any>): void {
    this.error('ui', component, error.message, {
      componentStack: metadata?.componentStack,
      ...metadata
    }, error.stack);
  }

  // ========================================
  // LOG RETRIEVAL AND MANAGEMENT
  // ========================================

  getLogs(filters?: {
    level?: LogEntry['level'][];
    category?: LogEntry['category'][];
    source?: string;
    since?: string;
    limit?: number;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => filters.level!.includes(log.level));
      }
      
      if (filters.category) {
        filteredLogs = filteredLogs.filter(log => filters.category!.includes(log.category));
      }
      
      if (filters.source) {
        filteredLogs = filteredLogs.filter(log => 
          log.source.toLowerCase().includes(filters.source!.toLowerCase()));
      }
      
      if (filters.since) {
        const sinceDate = new Date(filters.since);
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) >= sinceDate);
      }
      
      if (filters.limit) {
        filteredLogs = filteredLogs.slice(0, filters.limit);
      }
    }

    return filteredLogs;
  }

  getErrorLogs(): LogEntry[] {
    return this.getLogs({ level: ['error', 'critical'] });
  }

  getLogStats(): {
    total: number;
    byLevel: Record<LogEntry['level'], number>;
    byCategory: Record<LogEntry['category'], number>;
    lastError?: LogEntry;
    errorCount24h: number;
  } {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<LogEntry['level'], number>,
      byCategory: {} as Record<LogEntry['category'], number>,
      lastError: undefined as LogEntry | undefined,
      errorCount24h: 0
    };

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    this.logs.forEach(log => {
      // Count by level
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      
      // Count by category
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      
      // Track last error
      if (['error', 'critical'].includes(log.level) && !stats.lastError) {
        stats.lastError = log;
      }
      
      // Count errors in last 24h
      if (['error', 'critical'].includes(log.level) && 
          new Date(log.timestamp) >= twentyFourHoursAgo) {
        stats.errorCount24h++;
      }
    });

    return stats;
  }

  clearLogs(): void {
    this.logs = [];
    if (this.config.persistLogs) {
      localStorage.removeItem('makrcave_logs');
    }
  }

  exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      exportTimestamp: new Date().toISOString(),
      config: this.config,
      logs: this.logs
    }, null, 2);
  }

  // ========================================
  // HEALTH CHECK INTEGRATION
  // ========================================

  getHealthMetrics(): {
    recentErrors: number;
    criticalErrors: number;
    averageErrorRate: number;
    systemStability: 'healthy' | 'degraded' | 'unhealthy';
  } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentLogs = this.logs.filter(log => 
      new Date(log.timestamp).getTime() >= oneHourAgo
    );

    const recentErrors = recentLogs.filter(log => 
      ['error', 'critical'].includes(log.level)
    ).length;

    const criticalErrors = recentLogs.filter(log => 
      log.level === 'critical'
    ).length;

    const totalRecentLogs = recentLogs.length;
    const averageErrorRate = totalRecentLogs > 0 ? 
      (recentErrors / totalRecentLogs) * 100 : 0;

    let systemStability: 'healthy' | 'degraded' | 'unhealthy';
    if (criticalErrors > 0 || averageErrorRate > 20) {
      systemStability = 'unhealthy';
    } else if (recentErrors > 5 || averageErrorRate > 10) {
      systemStability = 'degraded';
    } else {
      systemStability = 'healthy';
    }

    return {
      recentErrors,
      criticalErrors,
      averageErrorRate,
      systemStability
    };
  }
}

// Create and export singleton instance
const loggingService = new LoggingService();
export default loggingService;
