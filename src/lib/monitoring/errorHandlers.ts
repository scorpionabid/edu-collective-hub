
import { logger } from './logger';
import { toast } from 'sonner';

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
}

// Default options
const defaultOptions: ErrorHandlerOptions = {
  showToast: true,
  severity: 'medium',
};

// Generic error handler function
export const handleError = (
  error: Error | unknown,
  options: ErrorHandlerOptions = {}
): void => {
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
      handleError(error, options);
      throw error;
    }
  };
};
