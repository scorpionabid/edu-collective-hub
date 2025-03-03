
import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

// Type for API response
type ApiResponse<T> = {
  data: T;
  status: number;
  error: any | null;
};

// Function to track API calls and their performance
export const trackApiCall = async <T>(
  endpoint: string,
  method: string,
  apiCall: () => Promise<T>,
  requestParams?: any
): Promise<T> => {
  const startTime = performance.now();
  let response: T;
  let error: any = null;
  let statusCode = 200;
  
  try {
    response = await apiCall();
    
    // Try to extract status code if response has it
    if (response && typeof response === 'object' && 'status' in response) {
      statusCode = (response as any).status;
    }
  } catch (e) {
    error = e;
    statusCode = (e as any)?.status || 500;
    throw e;
  } finally {
    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);
    
    // Get the response size if possible
    let responseSize: number | undefined;
    if (response && typeof response === 'object') {
      try {
        responseSize = new Blob([JSON.stringify(response)]).size;
      } catch (e) {
        // Ignore errors in measuring response size
      }
    }
    
    // Get the request size if possible
    let requestSize: number | undefined;
    if (requestParams) {
      try {
        requestSize = new Blob([JSON.stringify(requestParams)]).size;
      } catch (e) {
        // Ignore errors in measuring request size
      }
    }
    
    // Prepare response summary
    let responseSummary: Record<string, any> | undefined;
    if (response && typeof response === 'object') {
      responseSummary = { 
        hasData: 'data' in response && (response as any).data !== null,
        hasError: 'error' in response && (response as any).error !== null,
        statusCode
      };
    }
    
    // Log the API call
    logger.logApiCall(
      endpoint,
      method,
      startTime,
      statusCode,
      requestParams,
      responseSummary,
      requestSize,
      responseSize
    );
    
    // If this is a slow API call (> 1000ms), log a warning
    if (durationMs > 1000) {
      logger.warn(`Slow API call: ${method} ${endpoint} took ${durationMs}ms`, {
        durationMs,
        endpoint,
        method,
        statusCode
      });
    }
  }
  
  return response;
};

// Wrapper for Supabase API calls
export const trackedSupabaseCall = async <T>(
  endpoint: string,
  method: string,
  queryBuilder: Promise<any>,
  requestParams?: any
): Promise<ApiResponse<T>> => {
  return trackApiCall(
    endpoint,
    method,
    async () => {
      const response = await queryBuilder;
      return {
        data: response.data as T,
        status: response.error ? 400 : 200,
        error: response.error
      };
    },
    requestParams
  );
};
