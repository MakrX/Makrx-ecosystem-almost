"use client";

import React from 'react';
import Link from 'next/link';

interface ProductPageErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ProductPageErrorBoundaryProps {
  children: React.ReactNode;
}

export default class ProductPageErrorBoundary extends React.Component<
  ProductPageErrorBoundaryProps, 
  ProductPageErrorBoundaryState
> {
  constructor(props: ProductPageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ProductPageErrorBoundaryState {
    // Check if this is a development RSC error that we can ignore
    if (process.env.NODE_ENV === 'development' && 
        (error.message?.includes('Failed to fetch') ||
         error.message?.includes('RSC payload') ||
         error.message?.includes('fetchServerResponse') ||
         error.stack?.includes('router-reducer'))) {
      console.warn('Product page: Caught RSC-related error, attempting to recover', error);
      return { hasError: false }; // Don't show error UI for RSC issues in dev
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.error('ProductPageErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI for product pages
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Product Page Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We're having trouble loading this product page. This might be a temporary issue.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
              <Link
                href="/catalog"
                className="block w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
