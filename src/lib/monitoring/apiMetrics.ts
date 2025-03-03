
import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';
import { ApiMetric } from './types';

interface TrackApiCallOptions {
  endpoint: string;
  method: string;
  startTime: number;
  statusCode?: number;
  requestParams?: any;
  responseData?: any;
  requestSize?: number;
  responseSize?: number;
  userId?: string;
}

/**
 * Tracks API call performance metrics
 */
export const trackApiCall = async ({
  endpoint,
  method,
  startTime,
  statusCode,
  requestParams,
  responseData,
  requestSize,
  responseSize,
  userId
}: TrackApiCallOptions): Promise<void> => {
  try {
    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);
    
    // Prepare a safe version of the response data (limit size and remove sensitive info)
    const responseSummary = responseData ? prepareResponseSummary(responseData) : undefined;
    
    // Create the metric object with required fields explicitly mapped
    const metric = {
      endpoint,
      method,
      duration_ms: durationMs,  // Use snake_case for direct DB insertion
      status_code: statusCode,
      request_size: requestSize,
      response_size: responseSize,
      user_id: userId,
      request_params: safeJsonify(requestParams),
      response_summary: responseSummary
    };
    
    // Store in the database with the proper column names
    const { error } = await supabase.from('api_metrics').insert(metric);
    
    if (error) {
      logger.warn('Failed to store API metrics', { error, metric });
    }
  } catch (error) {
    // Don't let metrics tracking interrupt the application flow
    logger.warn('Error tracking API metrics', { error });
  }
};

/**
 * Middleware/wrapper to track API call metrics
 */
export const withApiMetrics = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: { endpoint: string; method: string }
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const startTime = performance.now();
    let statusCode: number | undefined;
    let responseData: any;
    let userId: string | undefined;
    
    try {
      // Get the user ID if available
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
      
      // Call the original function
      const result = await fn(...args);
      
      // Extract status code and response if possible
      if (result && typeof result === 'object') {
        if ('status' in result) {
          statusCode = typeof result.status === 'number' ? result.status : undefined;
        }
        responseData = result;
      }
      
      return result;
    } catch (error) {
      // If it's an error with a status code, extract it
      if (error && typeof error === 'object' && 'status' in error) {
        statusCode = typeof error.status === 'number' ? error.status : 500;
      } else {
        statusCode = 500;
      }
      
      throw error;
    } finally {
      // Track the API call
      trackApiCall({
        endpoint: options.endpoint,
        method: options.method,
        startTime,
        statusCode,
        requestParams: args.length > 0 ? args[0] : undefined,
        responseData,
        userId
      });
    }
  };
};

/**
 * Safely converts data to JSON, handling circular references and limiting size
 */
const safeJsonify = (data: any, maxLength = 5000): any => {
  if (!data) return undefined;
  
  try {
    // Create a safe copy without circular references
    const cache = new Set();
    const safeData = JSON.stringify(data, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) return '[Circular Reference]';
        cache.add(value);
      }
      
      // Don't include sensitive information
      if (
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('auth') ||
        key.toLowerCase().includes('secret')
      ) {
        return '[REDACTED]';
      }
      
      return value;
    });
    
    // Truncate if too long
    if (safeData.length > maxLength) {
      return JSON.parse(safeData.substring(0, maxLength) + '..."');
    }
    
    return JSON.parse(safeData);
  } catch (error) {
    return { error: 'Could not serialize data' };
  }
};

/**
 * Prepares a summary of the response data for storage
 */
const prepareResponseSummary = (data: any, maxLength = 2000): any => {
  if (!data) return undefined;
  
  try {
    // If it's an array, just store the count and type
    if (Array.isArray(data)) {
      return {
        type: 'array',
        length: data.length,
        sample: data.length > 0 ? safeJsonify(data[0], 500) : null
      };
    }
    
    // For objects, store a truncated version
    return safeJsonify(data, maxLength);
  } catch (error) {
    return { error: 'Could not summarize response data' };
  }
};
