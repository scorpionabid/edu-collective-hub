
import { Json } from '@/integrations/supabase/types';

export interface PerformanceMetric {
  id?: string;
  userId?: string;
  pagePath: string;
  loadTimeMs: number;
  ttfbMs?: number;
  lcpMs?: number;
  fidMs?: number;
  clsScore?: number;
  deviceInfo?: Record<string, any>;
  networkInfo?: Record<string, any>;
  timestamp?: string;
}

export interface ErrorLog {
  id?: string;
  userId?: string;
  errorMessage: string;
  errorStack?: string;
  errorContext?: Record<string, any>;
  component?: string;
  pagePath?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  browserInfo?: Record<string, any>;
  timestamp?: string;
  resolved?: boolean;
  resolutionNotes?: string;
}

export interface ApiMetric {
  id?: string;
  endpoint: string;
  method: string;
  statusCode?: number;
  durationMs: number;
  requestSize?: number;
  responseSize?: number;
  userId?: string;
  timestamp?: string;
  requestParams?: Record<string, any>;
  responseSummary?: Record<string, any>;
}

export interface MonitoringMetric {
  id?: string;
  metricName: string;
  metricValue: number;
  metricType: 'counter' | 'gauge' | 'histogram' | 'summary';
  component?: string;
  timestamp?: string;
  tags?: Record<string, any>;
}

export interface AuditLogEntry {
  action: string;
  tableName: string;
  recordId?: string;
  userId?: string;
  oldData?: Json;
  newData?: Json;
  ipAddress?: string;
  userAgent?: string;
  component?: string;
  durationMs?: number;
  success?: boolean;
  metadata?: Record<string, any>;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  enableConsole?: boolean;
  enableSentry?: boolean;
  enableDatabase?: boolean;
  minLevel?: LogLevel;
}
