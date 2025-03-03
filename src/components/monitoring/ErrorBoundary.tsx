
import React, { ErrorInfo, ReactNode } from 'react';
import { SentryErrorBoundary } from '@/lib/monitoring/sentry';
import { logger } from '@/lib/monitoring/logger';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface FallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  component?: string;
}

// Custom fallback component to display when an error occurs
const ErrorFallback = ({ error, resetError }: FallbackProps) => {
  return (
    <Alert variant="destructive" className="my-4 mx-auto max-w-3xl">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>
        <p className="mb-4">
          An unexpected error has occurred and has been reported to our team.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs font-mono bg-gray-100 p-3 rounded overflow-auto max-h-32 mb-4">
            {error.message}
          </div>
        )}
        <div className="flex justify-end">
          <Button onClick={resetError} size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Global error boundary that wraps the application
export class GlobalErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to our monitoring system
    logger.error(error, {
      component: this.props.component || 'GlobalErrorBoundary',
      errorInfo: errorInfo.componentStack,
      severity: 'high',
    });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return (
      <SentryErrorBoundary
        fallback={({ error, resetError }) => (
          <ErrorFallback error={error} resetError={resetError} />
        )}
      >
        {this.props.children}
      </SentryErrorBoundary>
    );
  }
}

// Component-level error boundary for isolating errors
export const ComponentErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  component,
}) => {
  return (
    <GlobalErrorBoundary component={component}>
      {children}
    </GlobalErrorBoundary>
  );
};
