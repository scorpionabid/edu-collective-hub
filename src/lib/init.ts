
// Initialize API mock tables
import './api/mock/importExportTables';

// Initialize monitoring systems
import { initSentry } from './monitoring/sentry';
import { initWebVitals } from './monitoring/web-vitals';
import { logger } from './monitoring/logger';

// This file can be imported at the application root to ensure all initialization happens
export const initializeApplication = () => {
  // Initialize Sentry (will only be active in production)
  initSentry();
  
  // Initialize web vitals monitoring
  initWebVitals();
  
  // Log application start
  logger.info('Application initialized', {
    environment: process.env.NODE_ENV,
    version: process.env.REACT_APP_VERSION || '1.0.0',
    timestamp: new Date().toISOString()
  });
  
  console.log('Application initialized with monitoring');
};
