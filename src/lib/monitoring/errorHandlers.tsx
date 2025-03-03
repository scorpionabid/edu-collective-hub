
import React, { Component, ComponentType, ErrorInfo } from 'react';
import { logger } from './logger';
import { captureException } from './sentry';

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch and handle errors in the component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    logger.error('Component error caught by ErrorBoundary', {
      error: error.toString(),
      component: this.constructor.name,
      errorInfo: errorInfo.componentStack
    });

    // Send to Sentry
    captureException(error, {
      componentStack: errorInfo.componentStack
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render the fallback UI or a default error message
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-semibold text-red-700">Something went wrong</h2>
          <p className="text-red-600 mt-1">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface WithErrorTrackingOptions {
  componentName?: string;
  fallback?: React.ReactNode;
}

/**
 * Higher-order component that wraps a component with error tracking
 */
export function withErrorTracking<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithErrorTrackingOptions = {}
): ComponentType<P> {
  // Create the wrapper component
  const WithErrorTracking: React.FC<P> = (props) => {
    return (
      <ErrorBoundary fallback={options.fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  // Set display name for the HOC
  const displayName = options.componentName ||
    WrappedComponent.displayName ||
    WrappedComponent.name ||
    'Component';
    
  WithErrorTracking.displayName = `WithErrorTracking(${displayName})`;

  return WithErrorTracking;
}

/**
 * Log an error to the application logging system
 */
export const logError = (error: Error | string, context?: Record<string, any>): void => {
  if (typeof error === 'string') {
    error = new Error(error);
  }

  logger.error(error, context);
  captureException(error, context);
};

/**
 * Create an error handler function for async operations
 */
export const createErrorHandler = (
  componentName: string,
  actionName: string,
  onError?: (error: Error) => void
) => {
  return (error: any): void => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    logError(errorObj, {
      component: componentName,
      action: actionName
    });
    
    if (onError) {
      onError(errorObj);
    }
  };
};
