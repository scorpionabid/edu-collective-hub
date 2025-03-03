
import { getCLS, getFID, getLCP, getTTFB, type Metric } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';
import { captureException } from './sentry';
import { logger } from './logger';

/**
 * Initialize web vitals tracking
 */
export const initWebVitals = () => {
  if (typeof window === 'undefined') return;

  try {
    // Core Web Vitals
    getCLS(trackMetric);
    getFID(trackMetric);
    getLCP(trackMetric);
    getTTFB(trackMetric);

    // Custom page load timing
    trackPageLoad();

    logger.info('Web vitals tracking initialized');
  } catch (error) {
    captureException(error as Error);
    logger.error('Failed to initialize web vitals tracking', { error });
  }
};

/**
 * Track a web vitals metric
 */
const trackMetric = (metric: Metric) => {
  try {
    const { name, value, delta, id } = metric;
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Web Vital: ${name}`, { value, delta, id });
    }

    // Save to database
    saveMetricToDatabase({
      metricName: name,
      value,
      id
    });
  } catch (error) {
    logger.error('Error tracking web vital metric', { error });
  }
};

/**
 * Track custom page load metric
 */
const trackPageLoad = () => {
  try {
    // Wait for the load event to ensure all resources are loaded
    window.addEventListener('load', () => {
      // Get the navigation timing data
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const ttfb = perfData.responseStart - perfData.navigationStart;
      
      if (pageLoadTime > 0) {
        // Log to console in development
        if (process.env.NODE_ENV !== 'production') {
          console.log('Page Load Time', { pageLoadTime, ttfb });
        }
  
        // Save to database
        saveMetricToDatabase({
          metricName: 'LOAD',
          value: pageLoadTime,
          ttfb
        });
      }
    });
  } catch (error) {
    logger.error('Error tracking page load', { error });
  }
};

/**
 * Save metric data to the database
 */
const saveMetricToDatabase = async ({ 
  metricName, 
  value, 
  id, 
  ttfb 
}: { 
  metricName: string, 
  value: number, 
  id?: string, 
  ttfb?: number 
}) => {
  try {
    // Get user ID if available
    let userId = undefined;
    try {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id;
    } catch (error) {
      // Ignore error, just continue without user ID
    }

    // Gather device and network info
    const deviceInfo = getDeviceInfo();
    const networkInfo = getNetworkInfo();

    // Map the metric name to the database column name
    let metricData: Record<string, any> = {
      page_path: window.location.pathname,
      load_time_ms: 0, // Default value will be overridden based on the metric
      user_id: userId,
      device_info: deviceInfo,
      network_info: networkInfo
    };

    // Set the appropriate metric value based on the metric name
    switch (metricName) {
      case 'CLS':
        metricData.cls_score = value;
        metricData.load_time_ms = 0; // Use a default value since CLS doesn't have a direct time equivalent
        break;
      case 'FID':
        metricData.fid_ms = Math.round(value);
        metricData.load_time_ms = Math.round(value);
        break;
      case 'LCP':
        metricData.lcp_ms = Math.round(value);
        metricData.load_time_ms = Math.round(value);
        break;
      case 'TTFB':
        metricData.ttfb_ms = Math.round(value);
        metricData.load_time_ms = Math.round(value);
        break;
      case 'LOAD':
        metricData.load_time_ms = Math.round(value);
        if (ttfb) metricData.ttfb_ms = Math.round(ttfb);
        break;
      default:
        metricData.load_time_ms = Math.round(value);
    }

    // Insert into database
    const { error } = await supabase.from('performance_metrics').insert(metricData);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    logger.error('Failed to save metric to database', { error, metricName, value });
  }
};

/**
 * Get device information for context
 */
const getDeviceInfo = (): Record<string, any> => {
  try {
    return {
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio,
      platform: navigator.platform,
      vendor: navigator.vendor,
      memory: navigator.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency
    };
  } catch (error) {
    return { error: 'Failed to get device info' };
  }
};

/**
 * Get network information for context
 */
const getNetworkInfo = (): Record<string, any> => {
  try {
    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    
    return { info: 'Network info not available' };
  } catch (error) {
    return { error: 'Failed to get network info' };
  }
};
