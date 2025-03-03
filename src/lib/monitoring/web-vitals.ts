
import { onCLS, onFID, onLCP, onTTFB, Metric } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';
import * as Sentry from '@sentry/react';

// Report web vitals metrics to Supabase
export const reportWebVitalsToSupabase = (metric: Metric, userId?: string) => {
  const { name, value, delta, id, navigationType } = metric;
  
  // Get the current page path
  const pagePath = window.location.pathname;
  
  // Get device and browser information
  const deviceInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio,
  };
  
  // Get network information if available
  const networkInfo = {
    effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
    downlink: (navigator as any).connection?.downlink,
    rtt: (navigator as any).connection?.rtt,
  };
  
  let metricData: Record<string, any> = {
    user_id: userId,
    page_path: pagePath,
    device_info: deviceInfo,
    network_info: networkInfo,
  };
  
  // Map the specific metric to the correct database field
  switch (name) {
    case 'CLS':
      metricData.cls_score = value;
      break;
    case 'FID':
      metricData.fid_ms = Math.round(value);
      break;
    case 'LCP':
      metricData.lcp_ms = Math.round(value);
      metricData.load_time_ms = Math.round(value); // As a proxy if we don't have more specific load time
      break;
    case 'TTFB':
      metricData.ttfb_ms = Math.round(value);
      break;
    default:
      // For other metrics
      metricData.load_time_ms = Math.round(value);
      metricData[`${name.toLowerCase()}_ms`] = Math.round(value);
  }
  
  // Also report to Sentry for performance monitoring
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(`Web Vital: ${name}`, {
      level: 'info',
      tags: { metric: name },
      extra: {
        value,
        delta,
        id,
        navigationType,
        ...metricData,
      },
    });
  }
  
  // Only save to database if we have an actual load time (required field)
  if (metricData.load_time_ms) {
    supabase.from('performance_metrics').insert([metricData])
      .then(({ error }) => {
        if (error && process.env.NODE_ENV === 'development') {
          console.error('Error saving performance metric:', error);
        }
      });
  }
};

// Initialize web vitals monitoring
export const initWebVitals = (userId?: string) => {
  onCLS(metric => reportWebVitalsToSupabase(metric, userId));
  onFID(metric => reportWebVitalsToSupabase(metric, userId));
  onLCP(metric => reportWebVitalsToSupabase(metric, userId));
  onTTFB(metric => reportWebVitalsToSupabase(metric, userId));
};
