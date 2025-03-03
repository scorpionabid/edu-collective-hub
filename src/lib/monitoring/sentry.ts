
import * as Sentry from '@sentry/react';
import { Span } from '@sentry/tracing';
import { RewriteFrames } from '@sentry/integrations';

/**
 * Initialize Sentry for error tracking
 */
export const initSentry = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Sentry not initialized in development mode');
    return;
  }

  const dsn = process.env.REACT_APP_SENTRY_DSN;
  if (!dsn) {
    console.warn('No Sentry DSN provided, error tracking will not be enabled');
    return;
  }

  try {
    Sentry.init({
      dsn,
      integrations: [
        new RewriteFrames({
          iteratee: (frame) => {
            if (frame.filename) {
              // Strip the domain from the URL
              frame.filename = frame.filename.replace(/^.*\/\/[^/]+/, '');
              // Strip webpack:// prefix
              frame.filename = frame.filename.replace(/webpack:\/\//g, '');
              // Append src/ prefix for source mapping
              if (!frame.filename.startsWith('src/')) {
                frame.filename = `src/${frame.filename}`;
              }
            }
            return frame;
          },
        }),
        new Sentry.BrowserTracing({
          tracingOrigins: ['localhost', 'yourapp.com', /^\//],
        }),
      ],
      
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
      tracesSampleRate: 0.2,
      
      // Filter sensitive data
      beforeSend: (event) => {
        // Don't send events in development mode
        if (process.env.NODE_ENV !== 'production') {
          return null;
        }
        
        // Filter out sensitive data from the event payload
        if (event.request && event.request.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
        }
        
        return event;
      },
      
      // Environment configuration
      environment: process.env.NODE_ENV || 'development',
    });
    
    console.log('Sentry initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
};

/**
 * Set user information in Sentry context
 */
export const setSentryUser = (user: { id: string; email?: string; role?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
};

/**
 * Clear user information from Sentry context
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

/**
 * Set extra context information for Sentry events
 */
export const setSentryContext = (name: string, context: Record<string, any>) => {
  Sentry.setContext(name, context);
};

/**
 * Set tag for Sentry events
 */
export const setSentryTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

/**
 * Capture exception with Sentry
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, { contexts: { additional: context } });
};

/**
 * Capture message with Sentry
 */
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) => {
  Sentry.captureMessage(message, { 
    level, 
    contexts: { additional: context } 
  });
};

/**
 * Start a Sentry transaction
 */
export const startTransaction = (name: string, op: string): Span => {
  const transaction = Sentry.startTransaction({ name, op });
  Sentry.configureScope(scope => scope.setSpan(transaction));
  return transaction;
};
