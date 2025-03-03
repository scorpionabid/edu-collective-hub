export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  enableConsole?: boolean;
  enableSentry?: boolean;
  enableDatabase?: boolean;
  minLevel?: LogLevel;
}

export interface AuditLogEntry {
  action: string;
  tableName: string;
  recordId?: string;
  userId?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  component?: string;
  durationMs?: number;
  success: boolean;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface PerformanceMetric {
  pagePath: string;
  loadTimeMs: number;
  ttfbMs?: number;
  clsScore?: number;
  fidMs?: number;
  lcpMs?: number;
  userId?: string;
  deviceInfo?: Record<string, any>;
  networkInfo?: Record<string, any>;
  timestamp?: string;
}

export interface ApiMetric {
  endpoint: string;
  method: string;
  duration_ms: number;
  status_code?: number;
  request_size?: number;
  response_size?: number;
  user_id?: string;
  request_params?: Record<string, any>;
  response_summary?: Record<string, any>;
  timestamp?: string;
}

export interface ErrorLog {
  userId?: string;
  errorMessage: string;
  errorStack?: string;
  errorContext?: Record<string, any>;
  component?: string;
  pagePath?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  browserInfo: {
    userAgent: string;
    language: string;
    platform: string;
  };
  resolved: boolean;
  timestamp?: string;
  resolution_notes?: string;
}
