
import * as Sentry from '@sentry/react';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { ErrorBoundary } from './errorHandlers';
import React from 'react';

/**
 * Initialize Sentry for error tracking
 */
export const initSentry = (): void => {
  if (process.env.NODE_ENV === 'production') {
    const dsn = process.env.REACT_APP_SENTRY_DSN;
    
    if (!dsn) {
      console.warn('Sentry DSN not configured. Error tracking will not be enabled.');
      return;
    }
    
    Sentry.init({
      dsn,
      integrations: [
        new ProfilingIntegration(),
        new Sentry.BrowserTracing(),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.1, // Sample 10% of transactions
      // Profiling
      profilesSampleRate: 0.1, // Sample 10% of transactions
      // Set allowed domains for error tracking
      allowUrls: [window.location.origin],
      // Adjust this as needed for your environment
      environment: process.env.NODE_ENV,
      // Only include errors from your app
      beforeSend(event) {
        if (event.exception) {
          // Add additional context or modify events here
          Sentry.configureScope((scope) => {
            scope.setTag('custom-tag', 'custom-value');
          });
        }
        return event;
      },
    });
    
    // Set user information if available
    if (typeof window !== 'undefined' && window.localStorage) {
      const userString = window.localStorage.getItem('supabase.auth.token');
      if (userString) {
        try {
          const userData = JSON.parse(userString);
          const user = userData?.currentSession?.user;
          
          if (user) {
            Sentry.setUser({
              id: user.id,
              email: user.email,
            });
          }
        } catch (error) {
          console.error('Failed to parse user data for Sentry:', error);
        }
      }
    }
  }
};

/**
 * Wrap the application with Sentry's error boundary
 */
export const SentryErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallback: React.ComponentType<{ error: Error; resetError: () => void }>;
}> = ({ children, fallback }) => {
  return (
    <Sentry.ErrorBoundary 
      fallback={({ error, resetError }) => {
        // Send error to Sentry with additional context
        Sentry.captureException(error, {
          level: 'error',
          tags: {
            handler: 'ErrorBoundary',
          },
        });
        
        // Render fallback component
        const FallbackComponent = fallback;
        return <FallbackComponent error={error} resetError={resetError} />;
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};
