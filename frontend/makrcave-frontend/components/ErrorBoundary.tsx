// ========================================
// ERROR BOUNDARY COMPONENT
// ========================================
// React error boundary with comprehensive logging and fallback UI

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  FileText, 
  Copy,
  Home,
  ArrowLeft
} from 'lucide-react';
import loggingService from '../services/loggingService';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  componentName?: string;
  maxRetries?: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate unique error ID
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      errorInfo,
      errorId
    });

    // Log error with comprehensive details
    loggingService.logUIError(
      this.props.componentName || 'Unknown Component',
      error,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        errorId,
        retryCount: this.state.retryCount,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    );

    loggingService.critical('ui', 'ErrorBoundary', `React component error caught`, {
      componentName: this.props.componentName,
      errorName: error.name,
      errorMessage: error.message,
      errorId,
      retryCount: this.state.retryCount,
      componentStack: errorInfo.componentStack?.split('\n').slice(0, 5).join('\n') // First 5 lines
    }, error.stack);

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        loggingService.error('ui', 'ErrorBoundary', 'Error in custom error handler', {
          originalError: error.message,
          handlerError: (handlerError as Error).message
        });
      }
    }

    // Track error metrics
    loggingService.logPerformance('error_boundary_triggered', 1, {
      componentName: this.props.componentName,
      errorType: error.name,
      retryCount: this.state.retryCount
    });
  }

  componentWillUnmount() {
    // Clean up any retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  handleRetry = () => {
    const maxRetries = this.props.maxRetries || 3;
    
    if (this.state.retryCount >= maxRetries) {
      loggingService.warn('ui', 'ErrorBoundary', 'Max retries exceeded', {
        componentName: this.props.componentName,
        maxRetries,
        currentRetryCount: this.state.retryCount,
        errorId: this.state.errorId
      });
      return;
    }

    loggingService.info('ui', 'ErrorBoundary', 'Retrying component render', {
      componentName: this.props.componentName,
      retryAttempt: this.state.retryCount + 1,
      errorId: this.state.errorId
    });

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleRefreshPage = () => {
    loggingService.info('ui', 'ErrorBoundary', 'User triggered page refresh from error boundary', {
      componentName: this.props.componentName,
      errorId: this.state.errorId,
      retryCount: this.state.retryCount
    });
    
    window.location.reload();
  };

  handleGoHome = () => {
    loggingService.info('ui', 'ErrorBoundary', 'User navigated to home from error boundary', {
      componentName: this.props.componentName,
      errorId: this.state.errorId
    });
    
    window.location.href = '/portal/dashboard';
  };

  handleGoBack = () => {
    loggingService.info('ui', 'ErrorBoundary', 'User navigated back from error boundary', {
      componentName: this.props.componentName,
      errorId: this.state.errorId
    });
    
    window.history.back();
  };

  copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      component: this.props.componentName || 'Unknown',
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        loggingService.info('ui', 'ErrorBoundary', 'Error details copied to clipboard', {
          errorId: this.state.errorId
        });
      })
      .catch(err => {
        loggingService.warn('ui', 'ErrorBoundary', 'Failed to copy error details', {
          error: err.message
        });
      });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const maxRetries = this.props.maxRetries || 3;
      const canRetry = this.state.retryCount < maxRetries;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-red-600 dark:text-red-400">
                    Something went wrong
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {this.props.componentName ? `Error in ${this.props.componentName}` : 'An unexpected error occurred'}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {this.state.errorId?.slice(-8)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error Message */}
              <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <div className="flex items-start gap-2">
                  <Bug className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      {this.state.error?.name || 'Error'}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-400 break-words">
                      {this.state.error?.message || 'An unknown error occurred'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Retry Info */}
              {this.state.retryCount > 0 && (
                <div className="text-sm text-muted-foreground">
                  Retry attempts: {this.state.retryCount} / {maxRetries}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {canRetry && (
                  <Button onClick={this.handleRetry} size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                <Button onClick={this.handleRefreshPage} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                
                <Button onClick={this.handleGoBack} variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                
                <Button onClick={this.handleGoHome} variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </div>

              {/* Error Details (if enabled) */}
              {this.props.showDetails && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono space-y-2">
                    <div>
                      <strong>Error ID:</strong> {this.state.errorId}
                    </div>
                    <div>
                      <strong>Component:</strong> {this.props.componentName || 'Unknown'}
                    </div>
                    <div>
                      <strong>Timestamp:</strong> {new Date().toISOString()}
                    </div>
                    {this.state.error?.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs max-h-40 overflow-y-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs max-h-32 overflow-y-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    <Button 
                      onClick={this.copyErrorDetails} 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Details
                    </Button>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Specialized error boundaries for different contexts
export function PageErrorBoundary({ children, pageName }: { children: ReactNode; pageName: string }) {
  return (
    <ErrorBoundary
      componentName={`Page: ${pageName}`}
      showDetails={true}
      maxRetries={2}
    >
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ 
  children, 
  componentName 
}: { 
  children: ReactNode; 
  componentName: string;
}) {
  return (
    <ErrorBoundary
      componentName={componentName}
      showDetails={false}
      maxRetries={3}
      fallback={
        <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Component Error</span>
          </div>
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">
            {componentName} failed to render
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
