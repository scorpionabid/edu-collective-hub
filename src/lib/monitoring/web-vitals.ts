
import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';
import { Metric } from 'web-vitals';
import { PerformanceMetric } from './types';

/**
 * Tracks Core Web Vitals and other performance metrics
 */
export const trackWebVitals = async (metric: Metric): Promise<void> => {
  try {
    // Get user information if available
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Get the current page path
    const pagePath = window.location.pathname;
    
    // Create the performance metric
    const performanceMetric: { [key: string]: any } = {
      page_path: pagePath,
      user_id: userId,
    };
    
    // Get device and network information
    const deviceInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio
    };
    
    const networkInfo = {
      effectiveType: (navigator as any).connection?.effectiveType,
      downlink: (navigator as any).connection?.downlink,
      rtt: (navigator as any).connection?.rtt
    };
    
    performanceMetric.device_info = deviceInfo;
    performanceMetric.network_info = networkInfo;
    
    // Map the web-vitals metric to our database schema
    switch (metric.name) {
      case 'CLS':
        performanceMetric.cls_score = metric.value;
        break;
      case 'FID':
        performanceMetric.fid_ms = metric.value;
        break;
      case 'LCP':
        performanceMetric.lcp_ms = metric.value;
        break;
      case 'TTFB':
        performanceMetric.ttfb_ms = metric.value;
        break;
      case 'FCP':
        // FCP isn't directly stored but can be used as a general page load time
        performanceMetric.load_time_ms = metric.value;
        break;
      default:
        // For custom metrics
        performanceMetric.load_time_ms = metric.value;
    }
    
    // Ensure load_time_ms is always present (required field)
    if (!performanceMetric.load_time_ms) {
      performanceMetric.load_time_ms = performance.now();
    }
    
    // Store in the database
    const { error } = await supabase.from('performance_metrics').insert(performanceMetric);
    
    if (error) {
      logger.warn('Failed to store performance metrics', { error, metric: performanceMetric });
    }
  } catch (error) {
    // Don't let metrics tracking interrupt the application flow
    logger.warn('Error tracking web vitals', { error });
  }
};

/**
 * Measures and tracks page load time
 */
export const trackPageLoad = (): void => {
  try {
    // Use Performance API to get navigation timing data
    const performance = window.performance;
    if (!performance) {
      console.warn('Performance API not supported');
      return;
    }
    
    // Queue the measurement to happen after the page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(async () => {
        try {
          // Get user information if available
          const { data: { user } } = await supabase.auth.getUser();
          const userId = user?.id;
          
          // Get the current page path
          const pagePath = window.location.pathname;
          
          // Get performance timing data
          const timing = performance.timing;
          const loadTime = timing.loadEventEnd - timing.navigationStart;
          const ttfb = timing.responseStart - timing.navigationStart;
          
          // Create the performance metric
          const performanceMetric: { [key: string]: any } = {
            page_path: pagePath,
            load_time_ms: loadTime,
            ttfb_ms: ttfb,
            user_id: userId,
          };
          
          // Get device and network information
          const deviceInfo = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            devicePixelRatio: window.devicePixelRatio
          };
          
          const networkInfo = {
            effectiveType: (navigator as any).connection?.effectiveType,
            downlink: (navigator as any).connection?.downlink,
            rtt: (navigator as any).connection?.rtt
          };
          
          performanceMetric.device_info = deviceInfo;
          performanceMetric.network_info = networkInfo;
          
          // Store in the database
          const { error } = await supabase.from('performance_metrics').insert(performanceMetric);
          
          if (error) {
            logger.warn('Failed to store page load metrics', { error, metric: performanceMetric });
          }
        } catch (error) {
          logger.warn('Error tracking page load', { error });
        }
      }, 0);
    });
  } catch (error) {
    // Don't let metrics tracking interrupt the application flow
    logger.warn('Error setting up page load tracking', { error });
  }
};

/**
 * Measures and tracks component render time
 */
export const trackComponentRender = (componentName: string, renderTimeMs: number): void => {
  try {
    // Get the current page path
    const pagePath = window.location.pathname;
    
    // Log the component render time
    logger.debug('Component render time', {
      component: componentName,
      renderTimeMs,
      pagePath
    });
    
    // Store the render time in a custom performance mark
    performance.mark(`${componentName}-render-${Date.now()}`);
    
    // We might want to store this data for slow renders only
    if (renderTimeMs > 100) {
      (async () => {
        try {
          // Get user information if available
          const { data: { user } } = await supabase.auth.getUser();
          const userId = user?.id;
          
          // Create the performance metric
          const performanceMetric: { [key: string]: any } = {
            page_path: `${pagePath}#${componentName}`,
            load_time_ms: renderTimeMs,
            user_id: userId,
            device_info: {
              userAgent: navigator.userAgent,
              component: componentName
            }
          };
          
          // Store in the database
          const { error } = await supabase.from('performance_metrics').insert(performanceMetric);
          
          if (error) {
            logger.warn('Failed to store component render metrics', { error, metric: performanceMetric });
          }
        } catch (error) {
          logger.warn('Error tracking component render', { error });
        }
      })();
    }
  } catch (error) {
    // Don't let metrics tracking interrupt the application flow
    logger.warn('Error tracking component render', { error });
  }
};
