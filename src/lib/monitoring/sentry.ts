
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initSentry = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: "https://examplePublicKey@o0.ingest.sentry.io/0", // Replace with your actual Sentry DSN
      integrations: [new BrowserTracing()],
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
      tracesSampleRate: 0.5,
      // Set to true in production
      enabled: process.env.NODE_ENV === 'production',
      // Session tracking for user behavior analysis
      autoSessionTracking: true,
      // We recommend adjusting this value in production
      maxBreadcrumbs: 50,
      environment: process.env.NODE_ENV,
      
      // Before sending an event to Sentry, you can enhance the data
      beforeSend(event) {
        // You can modify the event here
        // For example, scrub sensitive data
        if (event.request && event.request.headers) {
          delete event.request.headers['Authorization'];
        }
        
        return event;
      },
    });

    // Add global error handler for uncaught errors
    window.addEventListener('error', (event) => {
      Sentry.captureException(event.error);
    });

    // Add global error handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      Sentry.captureException(event.reason);
    });
  }
};

// Log user identity to Sentry once they are authenticated
export const setSentryUser = (user: { id: string; email?: string; role?: string }) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
};

// Clear user identity from Sentry on logout
export const clearSentryUser = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser(null);
  }
};

// Custom error boundary component that reports to Sentry
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Create a custom profile for performance monitoring
export const startSentryTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({
    name,
    op,
  });
};

// Add breadcrumb to track user actions or important events
export const addSentryBreadcrumb = (
  category: string, 
  message: string, 
  level: Sentry.Severity = Sentry.Severity.Info,
  data?: Record<string, any>
) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.addBreadcrumb({
      category,
      message,
      level,
      data,
    });
  }
};
