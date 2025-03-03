
import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';
import * as Sentry from '@sentry/react';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorLog } from './types';

interface TrackErrorOptions {
  errorMessage: string;
  errorStack?: string;
  component?: string;
  pagePath?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  userId?: string;
}

/**
 * Tracks an error in the monitoring system
 */
export const trackError = async (options: TrackErrorOptions): Promise<void> => {
  try {
    // Log the error using the logger
    logger.error(options.errorMessage, {
      component: options.component,
      stack: options.errorStack,
      severity: options.severity || 'medium',
      ...options.context
    });
    
    // Get browser information
    const browserInfo = typeof window !== 'undefined' ? {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
    } : {
      userAgent: 'server',
      language: 'server',
      platform: 'server',
    };
    
    // Determine page path
    const pagePath = options.pagePath || (typeof window !== 'undefined' ? window.location.pathname : '');
    
    // Create error log entry
    const errorLog: ErrorLog = {
      userId: options.userId,
      errorMessage: options.errorMessage,
      errorStack: options.errorStack,
      errorContext: options.context,
      component: options.component,
      pagePath,
      severity: options.severity || 'medium',
      browserInfo,
      resolved: false,
    };
    
    // Format data for Supabase
    const errorData = {
      user_id: errorLog.userId,
      error_message: errorLog.errorMessage,
      error_stack: errorLog.errorStack,
      error_context: errorLog.errorContext,
      component: errorLog.component,
      page_path: errorLog.pagePath,
      severity: errorLog.severity,
      browser_info: errorLog.browserInfo,
      resolved: errorLog.resolved,
    };
    
    // Store in the database
    const { error } = await supabase.from('error_logs').insert([errorData]);
    
    if (error) {
      console.error('Failed to save error log:', error);
    }
    
    // Report to Sentry if in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(new Error(options.errorMessage), {
        extra: {
          ...options.context,
          component: options.component,
          pagePath,
          severity: options.severity,
        },
      });
    }
  } catch (err) {
    // Don't let error tracking fail silently
    console.error('Error in trackError:', err);
  }
};

interface WithErrorTrackingProps {
  componentName: string;
}

/**
 * Higher-order component to track errors in React components
 */
export function withErrorTracking<P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorTrackingProps
): React.ComponentType<P> {
  const displayName = options.componentName || Component.displayName || Component.name || 'Component';
  
  class WithErrorTracking extends React.Component<P, { hasError: boolean }> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
    }
    
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      trackError({
        errorMessage: error.message,
        errorStack: error.stack,
        component: displayName,
        context: { errorInfo: errorInfo.componentStack }
      });
    }
    
    render() {
      if (this.state.hasError) {
        return <div>Something went wrong.</div>;
      }
      
      return <Component {...this.props} />;
    }
  }
  
  WithErrorTracking.displayName = `WithErrorTracking(${displayName})`;
  
  return WithErrorTracking;
}

/**
 * Custom error handler for global unhandled exceptions
 */
export const setupGlobalErrorHandlers = (): void => {
  if (typeof window !== 'undefined') {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      trackError({
        errorMessage: event.error?.message || 'Uncaught error',
        errorStack: event.error?.stack,
        component: 'GlobalErrorHandler',
        severity: 'high',
        context: {
          fileName: event.filename,
          lineNumber: event.lineno,
          columnNumber: event.colno,
        }
      });
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      trackError({
        errorMessage: error?.message || 'Unhandled promise rejection',
        errorStack: error?.stack,
        component: 'GlobalErrorHandler',
        severity: 'high',
        context: { reason: error }
      });
    });
  }
};

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Error boundary component for React applications
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Track the error
    trackError({
      errorMessage: error.message,
      errorStack: error.stack,
      component: this.props.componentName || 'ErrorBoundary',
      context: { errorInfo: errorInfo.componentStack }
    });
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary-fallback">
          <h2>Something went wrong.</h2>
          <p>The error has been logged and we'll fix it as soon as possible.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
