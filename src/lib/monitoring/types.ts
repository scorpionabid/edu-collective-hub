
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
  // Add DB column mappings
  page_path?: string;
  load_time_ms?: number;
  ttfb_ms?: number;
  lcp_ms?: number;
  fid_ms?: number;
  cls_score?: number;
  user_id?: string;
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
  // DB column mappings
  user_id?: string;
  error_message?: string;
  error_stack?: string;
  error_context?: Json;
  page_path?: string;
  browser_info?: Json;
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
  // DB column mappings
  status_code?: number;
  duration_ms?: number;
  request_size?: number;
  response_size?: number;
  user_id?: string;
  request_params?: Json;
  response_summary?: Json;
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
  timestamp?: string;
  // DB column mappings
  table_name?: string;
  record_id?: string;
  user_id?: string;
  old_data?: Json;
  new_data?: Json;
  ip_address?: string;
  user_agent?: string;
  duration_ms?: number;
  created_at?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  enableConsole?: boolean;
  enableSentry?: boolean;
  enableDatabase?: boolean;
  minLevel?: LogLevel;
}
