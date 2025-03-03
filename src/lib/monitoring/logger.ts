
import * as Sentry from '@sentry/react';
import { supabase } from '@/integrations/supabase/client';
import { LogLevel, LoggerOptions, AuditLogEntry, ErrorLog } from './types';

// Default options for the logger
const defaultOptions: LoggerOptions = {
  enableConsole: true,
  enableSentry: process.env.NODE_ENV === 'production',
  enableDatabase: true,
  minLevel: 'info',
};

// Logger class for centralized logging
export class Logger {
  private static instance: Logger;
  private options: LoggerOptions;
  private userId?: string;

  private constructor(options: LoggerOptions = {}) {
    this.options = { ...defaultOptions, ...options };
  }

  // Get singleton instance
  public static getInstance(options?: LoggerOptions): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(options);
    }
    return Logger.instance;
  }

  // Set the current user ID
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  // Clear the current user ID
  public clearUserId(): void {
    this.userId = undefined;
  }

  // Update logger options
  public updateOptions(options: Partial<LoggerOptions>): void {
    this.options = { ...this.options, ...options };
  }

  // Log debug message
  public debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  // Log info message
  public info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  // Log warning message
  public warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  // Log error message
  public error(error: Error | string, context?: Record<string, any>): void {
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;
    
    this.log('error', message, { ...context, stack });
    
    if (this.options.enableDatabase) {
      this.saveErrorToDatabase(error, context);
    }
  }

  // Log audit event
  public async audit(entry: AuditLogEntry): Promise<void> {
    try {
      if (!this.options.enableDatabase) return;
      
      // Add userId if not provided but available in logger
      if (!entry.userId && this.userId) {
        entry.userId = this.userId;
      }
      
      // Format data for Supabase
      const auditData = {
        action: entry.action,
        table_name: entry.tableName,
        record_id: entry.recordId,
        user_id: entry.userId,
        old_data: entry.oldData,
        new_data: entry.newData,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        component: entry.component,
        duration_ms: entry.durationMs,
        success: entry.success,
        metadata: entry.metadata,
      };
      
      const { error } = await supabase.from('audit_logs').insert([auditData]);
      
      if (error && this.options.enableConsole) {
        console.error('Failed to save audit log:', error);
      }
    } catch (err) {
      if (this.options.enableConsole) {
        console.error('Error in audit logging:', err);
      }
    }
  }

  // Log API metrics
  public async logApiCall(
    endpoint: string,
    method: string,
    startTime: number,
    statusCode?: number,
    requestParams?: Record<string, any>,
    responseSummary?: Record<string, any>,
    requestSize?: number,
    responseSize?: number
  ): Promise<void> {
    try {
      if (!this.options.enableDatabase) return;
      
      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);
      
      const apiMetricData = {
        endpoint,
        method,
        status_code: statusCode,
        duration_ms: durationMs,
        request_size: requestSize,
        response_size: responseSize,
        user_id: this.userId,
        request_params: requestParams,
        response_summary: responseSummary,
      };
      
      const { error } = await supabase.from('api_metrics').insert([apiMetricData]);
      
      if (error && this.options.enableConsole) {
        console.error('Failed to save API metric:', error);
      }
      
      // Log slow API calls (> 1000ms)
      if (durationMs > 1000) {
        this.warn(`Slow API call to ${endpoint}: ${durationMs}ms`, { 
          endpoint, method, statusCode, durationMs 
        });
      }
    } catch (err) {
      if (this.options.enableConsole) {
        console.error('Error logging API call:', err);
      }
    }
  }

  // Private method to handle logging based on level
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      level,
      message,
      context: context || {},
      timestamp,
      userId: this.userId,
    };
    
    // Console logging
    if (this.options.enableConsole) {
      this.logToConsole(level, message, context);
    }
    
    // Sentry logging for production
    if (this.options.enableSentry && level === 'error') {
      this.logToSentry(message, context);
    }
  }
  
  // Determine if we should log based on minimum level
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    
    return levels[level] >= levels[this.options.minLevel || 'info'];
  }
  
  // Log to console with appropriate styling
  private logToConsole(level: LogLevel, message: string, context?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    
    switch (level) {
      case 'debug':
        console.debug(`[${timestamp}] [DEBUG] ${message}`, context || '');
        break;
      case 'info':
        console.info(`[${timestamp}] [INFO] ${message}`, context || '');
        break;
      case 'warn':
        console.warn(`[${timestamp}] [WARN] ${message}`, context || '');
        break;
      case 'error':
        console.error(`[${timestamp}] [ERROR] ${message}`, context || '');
        break;
    }
  }
  
  // Log to Sentry for production monitoring
  private logToSentry(message: string, context?: Record<string, any>): void {
    if (process.env.NODE_ENV !== 'production') return;
    
    Sentry.captureMessage(message, {
      level: Sentry.Severity.Error,
      extra: context,
    });
  }
  
  // Save error to database for better tracking
  private async saveErrorToDatabase(error: Error | string, context?: Record<string, any>): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error.message : error;
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Get browser information
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
      };
      
      // Determine severity based on context or default to medium
      const severity = context?.severity || 'medium';
      
      // Create error log entry
      const errorLog: ErrorLog = {
        userId: this.userId,
        errorMessage,
        errorStack,
        errorContext: context,
        component: context?.component,
        pagePath: window.location.pathname,
        severity: severity as 'low' | 'medium' | 'high' | 'critical',
        browserInfo,
        resolved: false,
      };
      
      // Format data for Supabase
      const errorData = {
        user_id: errorLog.userId,
        error_message: errorLog.errorMessage,
        error_stack: errorLog.errorStack,
        error_context: errorLog.errorContext,
        component: errorLog.component,
        page_path: errorLog.pagePath,
        severity: errorLog.severity,
        browser_info: errorLog.browserInfo,
        resolved: errorLog.resolved,
      };
      
      const { error: dbError } = await supabase.from('error_logs').insert([errorData]);
      
      if (dbError && this.options.enableConsole) {
        console.error('Failed to save error log:', dbError);
      }
    } catch (err) {
      if (this.options.enableConsole) {
        console.error('Error saving error to database:', err);
      }
    }
  }
}

// Export a default logger instance
export const logger = Logger.getInstance();

// Create a higher-order component to wrap API calls with performance tracking
export const withApiMetrics = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  endpoint: string,
  method: string
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const startTime = performance.now();
    
    try {
      const result = await fn(...args);
      
      // Extract status code and response summary if available
      const statusCode = result?.status || 200;
      const responseSummary = result?.data ? { dataSize: JSON.stringify(result.data).length } : undefined;
      
      // Log the successful API call
      logger.logApiCall(
        endpoint,
        method,
        startTime,
        statusCode,
        args.length > 0 ? { argsSize: JSON.stringify(args).length } : undefined,
        responseSummary
      );
      
      return result;
    } catch (error) {
      // Log the failed API call
      const errorObj = error as any;
      logger.logApiCall(
        endpoint,
        method,
        startTime,
        errorObj.status || 500,
        args.length > 0 ? { argsSize: JSON.stringify(args).length } : undefined,
        { error: errorObj.message }
      );
      
      // Also log as an error
      logger.error(errorObj.message || 'API call failed', {
        endpoint,
        method,
        args: args.length > 0 ? JSON.stringify(args) : undefined,
      });
      
      throw error;
    }
  };
};
