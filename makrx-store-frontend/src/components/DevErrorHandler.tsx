"use client";

import { useEffect } from 'react';

export default function DevErrorHandler() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    // Secondary layer of error suppression (global suppression is in HTML head)
    // This catches any errors that might slip through

    const isDevelopmentError = (message: string, stack?: string) => {
      const errorText = (message + ' ' + (stack || '')).toLowerCase();
      return (
        errorText.includes('failed to fetch') ||
        errorText.includes('rsc payload') ||
        errorText.includes('fetchserverresponse') ||
        errorText.includes('fastrefresh') ||
        errorText.includes('hot-reloader') ||
        errorText.includes('webpack') ||
        errorText.includes('fullstory') ||
        errorText.includes('fs.js') ||
        (errorText.includes('typeerror') && errorText.includes('fetch'))
      );
    };

    // Backup error handlers in case global ones don't catch everything
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (error && isDevelopmentError(error.message || '', error.stack || '')) {
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      const error = event.error;
      if (error && isDevelopmentError(error.message || '', error.stack || '')) {
        event.preventDefault();
        return false;
      }
    };

    // Add as low-priority listeners (will run after global ones)
    window.addEventListener('unhandledrejection', handleUnhandledRejection, false);
    window.addEventListener('error', handleError, false);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, false);
      window.removeEventListener('error', handleError, false);
    };
  }, []);

  return null;
}
