
import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';
import * as Sentry from '@sentry/react';
import React from 'react';
import { ErrorLog } from './types';

interface TrackErrorOptions {
  errorMessage: string;
  errorStack?: string;
  errorContext?: Record<string, any>;
  component?: string;
  pagePath?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  browserInfo?: Record<string, any>;
}

/**
 * Tracks application errors
 */
export const trackError = async ({
  errorMessage,
  errorStack,
  errorContext,
  component,
  pagePath,
  severity,
  browserInfo
}: TrackErrorOptions): Promise<void> => {
  try {
    // Get user information if available
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Report to Sentry if it's a critical or high severity error
    if (severity === 'critical' || severity === 'high') {
      if (errorStack) {
        Sentry.captureException(new Error(errorMessage), {
          extra: {
            errorContext,
            component,
            pagePath,
            browserInfo
          }
        });
      } else {
        Sentry.captureMessage(errorMessage, {
          level: Sentry.Severity.Error,
          extra: {
            errorContext,
            component,
            pagePath,
            browserInfo
          }
        });
      }
    }
    
    // Create the DB fields using snake_case for direct insertion
    const log = {
      error_message: errorMessage,
      error_stack: errorStack,
      error_context: errorContext,
      component,
      page_path: pagePath,
      severity,
      browser_info: browserInfo,
      user_id: userId,
      resolved: false
    };
    
    // Store in the database
    const { error } = await supabase.from('error_logs').insert(log);
    
    if (error) {
      logger.warn('Failed to store error log', { error, log });
    }
  } catch (error) {
    // Just log to console as a fallback
    console.error('Error tracking error', error);
  }
};

/**
 * Creates an error boundary component with tracking
 */
export const withErrorTracking = (Component: React.ComponentType<any>, options: { componentName: string }) => {
  return (props: any) => {
    try {
      return <Component {...props} />;
    } catch (error) {
      // Track the error
      trackError({
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        errorContext: { props },
        component: options.componentName,
        pagePath: window.location.pathname,
        severity: 'high',
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform
        }
      });
      
      // Return a fallback UI
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      );
    }
  };
};

/**
 * Higher-order function to track errors in async functions
 */
export const trackAsyncErrors = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: { componentName: string; severity?: 'low' | 'medium' | 'high' | 'critical' }
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      // Track the error
      trackError({
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        errorContext: { args },
        component: options.componentName,
        pagePath: window.location.pathname,
        severity: options.severity || 'medium',
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform
        }
      });
      
      // Re-throw the error to allow proper error handling
      throw error;
    }
  };
};

/**
 * Global error handler for uncaught errors
 */
export const setupGlobalErrorHandlers = (): void => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    trackError({
      errorMessage: `Unhandled Promise Rejection: ${event.reason}`,
      errorStack: event.reason?.stack,
      errorContext: { reason: event.reason },
      pagePath: window.location.pathname,
      severity: 'high',
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform
      }
    });
  });
  
  // Handle global errors
  window.addEventListener('error', (event) => {
    trackError({
      errorMessage: event.message,
      errorStack: event.error?.stack,
      errorContext: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      },
      pagePath: window.location.pathname,
      severity: 'high',
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform
      }
    });
  });
};
