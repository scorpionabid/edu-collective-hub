
import { logger } from './logger';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ErrorLog } from './types';

// Define error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorHandlerOptions {
  // If true, show a toast notification for the error
  showToast?: boolean;
  // Custom toast message (defaults to error.message)
  toastMessage?: string;
  // Error severity for logging
  severity?: ErrorSeverity;
  // Additional context to log with the error
  context?: Record<string, any>;
  // Component where the error occurred
  component?: string;
  // Path where the error occurred
  pagePath?: string;
}

// Default options
const defaultOptions: ErrorHandlerOptions = {
  showToast: true,
  severity: 'medium',
};

// Generic error handler function
export const handleError = async (
  error: Error | unknown,
  options: ErrorHandlerOptions = {}
): Promise<void> => {
  const opts = { ...defaultOptions, ...options };
  
  // Make sure we have an Error object
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  // Log the error with proper context
  logger.error(errorObj, {
    severity: opts.severity,
    component: opts.component,
    ...opts.context,
  });
  
  // Show a toast notification if requested
  if (opts.showToast) {
    toast.error(opts.toastMessage || errorObj.message, {
      description: 'An error occurred. Our team has been notified.',
    });
  }
  
  // Store error in the database for monitoring
  await storeErrorLog(errorObj, opts);
};

// Store error in the database
const storeErrorLog = async (error: Error, options: ErrorHandlerOptions): Promise<void> => {
  try {
    // Get browser information
    const browserInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      vendor: navigator.vendor,
      url: window.location.href,
    };
    
    // Get the current user if logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    // Create the error log entry
    const errorLog: Omit<ErrorLog, 'id' | 'timestamp'> = {
      errorMessage: error.message,
      errorStack: error.stack,
      errorContext: options.context || {},
      component: options.component,
      pagePath: options.pagePath || window.location.pathname,
      severity: options.severity || 'medium',
      browserInfo,
      resolved: false,
      userId: user?.id,
    };
    
    // Store the error log
    const { error: dbError } = await supabase.from('error_logs').insert(errorLog);
    
    if (dbError) {
      console.error('Failed to store error log:', dbError);
    }
  } catch (storeError) {
    // Don't let error logging fail the application
    console.error('Error storing error log:', storeError);
  }
};

// Higher-order function to wrap async functions with error handling
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: ErrorHandlerOptions = {}
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      await handleError(error, options);
      throw error;
    }
  };
};

// Function to wrap API fetch calls with error handling
export const fetchWithErrorHandling = async <T>(
  url: string,
  options?: RequestInit,
  errorOptions?: ErrorHandlerOptions
): Promise<T> => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    await handleError(error, {
      component: 'API Fetch',
      pagePath: window.location.pathname,
      context: { url, options },
      ...errorOptions,
    });
    throw error;
  }
};
