
import { ReportHandler } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';
import { PerformanceMetric } from './types';

let vitalsReported = false;

/**
 * Initialize Web Vitals monitoring
 */
export const initWebVitals = (): void => {
  if (typeof window !== 'undefined') {
    // Setup performance observer for navigation timing
    setupPerformanceObserver();
    
    // Setup Core Web Vitals reporting
    setupWebVitalsReporting();
    
    // Report initial page load
    reportPageLoad();
    
    // Setup history change listener for SPA navigation
    setupHistoryChangeListener();
  }
};

/**
 * Setup Performance Observer for navigation timing
 */
const setupPerformanceObserver = (): void => {
  try {
    const performanceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          reportNavigationTiming(navEntry);
        }
      });
    });
    
    performanceObserver.observe({ entryTypes: ['navigation'] });
  } catch (error) {
    logger.warn('PerformanceObserver not supported', { error });
  }
};

/**
 * Setup Web Vitals reporting
 */
const setupWebVitalsReporting = (): void => {
  try {
    import('web-vitals').then(({ getCLS, getFID, getLCP, getTTFB, getFCP }) => {
      getCLS(reportWebVital);
      getFID(reportWebVital);
      getLCP(reportWebVital);
      getTTFB(reportWebVital);
      getFCP(reportWebVital);
    });
  } catch (error) {
    logger.error('Failed to load web-vitals', { error });
  }
};

/**
 * Setup history change listener for SPA navigation
 */
const setupHistoryChangeListener = (): void => {
  // Create a callback for handling route changes
  const handleRouteChange = () => {
    // Wait a bit to allow the new page to render
    setTimeout(() => {
      reportPageLoad();
    }, 300);
  };

  // Intercept history methods
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  window.history.pushState = function() {
    originalPushState.apply(this, arguments as any);
    handleRouteChange();
  };

  window.history.replaceState = function() {
    originalReplaceState.apply(this, arguments as any);
    handleRouteChange();
  };

  // Handle popstate events
  window.addEventListener('popstate', handleRouteChange);
};

/**
 * Report navigation timing
 */
const reportNavigationTiming = (entry: PerformanceNavigationTiming): void => {
  try {
    const loadTime = Math.round(entry.loadEventEnd - entry.startTime);
    const ttfb = Math.round(entry.responseStart - entry.requestStart);
    
    reportPerformanceMetric({
      pagePath: window.location.pathname,
      loadTimeMs: loadTime,
      ttfbMs: ttfb
    });
  } catch (error) {
    logger.warn('Error reporting navigation timing', { error });
  }
};

/**
 * Report page load metrics
 */
const reportPageLoad = (): void => {
  try {
    // Reset vitals reported flag for the new page
    vitalsReported = false;
    
    // Use the performance API to measure page load time
    if (window.performance && window.performance.timing) {
      const { navigationStart, loadEventEnd } = window.performance.timing;
      const loadTime = loadEventEnd - navigationStart;
      
      if (loadTime > 0) {
        reportPerformanceMetric({
          pagePath: window.location.pathname,
          loadTimeMs: loadTime
        });
      }
    }
  } catch (error) {
    logger.warn('Error reporting page load', { error });
  }
};

/**
 * Report Web Vitals metric
 */
const reportWebVital: ReportHandler = (metric): void => {
  try {
    const { name, value } = metric;
    
    // Only report core web vitals once per page load
    if (vitalsReported && (name === 'CLS' || name === 'LCP' || name === 'FID')) {
      return;
    }
    
    // Create the metric object
    const performanceMetric: Partial<PerformanceMetric> = {
      pagePath: window.location.pathname,
      loadTimeMs: 0 // Will be updated if we haven't reported load time yet
    };
    
    // Add the specific metric
    switch (name) {
      case 'CLS':
        performanceMetric.clsScore = value;
        vitalsReported = true;
        break;
      case 'FID':
        performanceMetric.fidMs = Math.round(value);
        vitalsReported = true;
        break;
      case 'LCP':
        performanceMetric.lcpMs = Math.round(value);
        vitalsReported = true;
        break;
      case 'TTFB':
        performanceMetric.ttfbMs = Math.round(value);
        break;
      default:
        // Skip other metrics
        return;
    }
    
    // Report the metric
    reportPerformanceMetric(performanceMetric);
  } catch (error) {
    logger.warn('Error reporting web vital', { error, metric });
  }
};

/**
 * Report performance metric to the backend
 */
const reportPerformanceMetric = async (metric: Partial<PerformanceMetric>): Promise<void> => {
  try {
    // Ensure we have a load time
    if (!metric.loadTimeMs || metric.loadTimeMs <= 0) {
      metric.loadTimeMs = getEstimatedLoadTime();
    }
    
    // Add device and network info
    metric.deviceInfo = getDeviceInfo();
    metric.networkInfo = getNetworkInfo();
    
    // Get the current user if logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      metric.userId = user.id;
    }
    
    // Store the metric
    const { error } = await supabase.from('performance_metrics').insert(metric);
    
    if (error) {
      logger.warn('Failed to store performance metric', { error, metric });
    }
  } catch (error) {
    // Don't let metrics tracking interrupt the application flow
    logger.warn('Error tracking performance metric', { error });
  }
};

/**
 * Get estimated load time if performance API not available
 */
const getEstimatedLoadTime = (): number => {
  // Default to a reasonable value
  return 2000;
};

/**
 * Get device information
 */
const getDeviceInfo = (): Record<string, any> => {
  return {
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio,
    platform: navigator.platform,
    vendor: navigator.vendor
  };
};

/**
 * Get network information
 */
const getNetworkInfo = (): Record<string, any> => {
  const result: Record<string, any> = {
    onLine: navigator.onLine
  };
  
  // Add Network Information API data if available
  const nav: any = navigator;
  if (nav.connection) {
    const conn = nav.connection;
    if (conn.effectiveType) result.effectiveType = conn.effectiveType;
    if (conn.rtt) result.rtt = conn.rtt;
    if (conn.downlink) result.downlink = conn.downlink;
    if (conn.saveData) result.saveData = conn.saveData;
  }
  
  return result;
};
