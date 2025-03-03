import * as Sentry from '@sentry/react';
import { LogLevel, LoggerOptions } from './types';
import { supabase } from '@/integrations/supabase/client';

class Logger {
  private options: LoggerOptions = {
    enableConsole: true,
    enableSentry: process.env.NODE_ENV === 'production',
    enableDatabase: process.env.NODE_ENV === 'production',
    minLevel: 'info'
  };

  private levelToNumber: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  /**
   * Initialize the logger with options
   */
  init(options: LoggerOptions): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Log an error message
   */
  error(message: string | Error, context?: Record<string, any>): void {
    if (message instanceof Error) {
      context = {
        ...context,
        stack: message.stack,
        name: message.name
      };
      message = message.message;
    }
    this.log('error', message, context);
  }

  /**
   * Log a message with the specified level
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    // Skip if the level is below the minimum level
    if (this.levelToNumber[level] < this.levelToNumber[this.options.minLevel || 'info']) {
      return;
    }

    // Get timestamp
    const timestamp = new Date().toISOString();

    // Prepare log entry
    const logEntry = {
      level,
      message,
      timestamp,
      context: this.sanitizeContext(context || {})
    };

    // Log to console if enabled
    if (this.options.enableConsole) {
      this.logToConsole(level, message, logEntry.context);
    }

    // Log to Sentry if enabled
    if (this.options.enableSentry) {
      this.logToSentry(level, message, logEntry.context);
    }

    // Log to database if enabled
    if (this.options.enableDatabase) {
      this.logToDatabase(level, message, logEntry.context);
    }
  }

  /**
   * Sanitize context to remove sensitive information
   */
  private sanitizeContext(context: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'auth'];
    const sanitized = { ...context };

    // Recursively sanitize objects
    const sanitizeObj = (obj: Record<string, any>): Record<string, any> => {
      const result: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(obj)) {
        // Check if key contains sensitive information
        const isKeySensitive = sensitiveKeys.some(sensitiveKey => 
          key.toLowerCase().includes(sensitiveKey)
        );

        if (isKeySensitive) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          result[key] = sanitizeObj(value);
        } else {
          result[key] = value;
        }
      }

      return result;
    };

    return sanitizeObj(sanitized);
  }

  /**
   * Log to console
   */
  private logToConsole(level: LogLevel, message: string, context: Record<string, any>): void {
    const contextStr = Object.keys(context).length ? `\n${JSON.stringify(context, null, 2)}` : '';
    
    switch (level) {
      case 'debug':
        console.debug(`🔍 DEBUG: ${message}${contextStr}`);
        break;
      case 'info':
        console.info(`ℹ️ INFO: ${message}${contextStr}`);
        break;
      case 'warn':
        console.warn(`⚠️ WARNING: ${message}${contextStr}`);
        break;
      case 'error':
        console.error(`❌ ERROR: ${message}${contextStr}`);
        break;
    }
  }

  /**
   * Log to Sentry
   */
  private logToSentry(level: LogLevel, message: string, context: Record<string, any>): void {
    // Map log level to Sentry level
    let sentryLevel: Sentry.SeverityLevel;
    switch (level) {
      case 'debug':
        sentryLevel = 'debug';
        break;
      case 'info':
        sentryLevel = 'info';
        break;
      case 'warn':
        sentryLevel = 'warning';
        break;
      case 'error':
        sentryLevel = 'error';
        break;
      default:
        sentryLevel = 'info';
    }

    // Send to Sentry
    if (level === 'error') {
      Sentry.captureException(new Error(message), {
        level: sentryLevel,
        contexts: {
          custom: context
        }
      });
    } else {
      Sentry.captureMessage(message, {
        level: sentryLevel,
        contexts: {
          custom: context
        }
      });
    }
  }

  /**
   * Log to database
   */
  private async logToDatabase(level: LogLevel, message: string, context: Record<string, any>): Promise<void> {
    try {
      // Get user ID if available
      let userId: string | undefined;
      if (typeof window !== 'undefined') {
        const { data } = await supabase.auth.getUser();
        userId = data.user?.id;
      }

      // Insert log into database
      await supabase.from('monitoring_metrics').insert({
        metric_type: 'log',
        metric_name: level,
        metric_value: 1,
        component: context.component || 'app',
        tags: {
          message,
          context,
          userId
        }
      });
    } catch (error) {
      // Don't let database logging failures affect the application
      console.error('Failed to log to database:', error);
    }
  }
}

export const logger = new Logger();
