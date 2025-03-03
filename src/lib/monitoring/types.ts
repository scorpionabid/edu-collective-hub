
import { Json } from '@/integrations/supabase/types';

export interface PerformanceMetric {
  id?: string;
  userId?: string;
  // Frontend camelCase fields
  pagePath: string;
  loadTimeMs: number;
  ttfbMs?: number;
  lcpMs?: number;
  fidMs?: number;
  clsScore?: number;
  deviceInfo?: Record<string, any>;
  networkInfo?: Record<string, any>;
  timestamp?: string;
  
  // DB column mappings (snake_case)
  page_path?: string;
  load_time_ms?: number;
  ttfb_ms?: number;
  lcp_ms?: number;
  fid_ms?: number;
  cls_score?: number;
  user_id?: string;
  device_info?: Json;
  network_info?: Json;
}

export interface ErrorLog {
  id?: string;
  userId?: string;
  // Frontend camelCase fields
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
  
  // DB column mappings (snake_case)
  user_id?: string;
  error_message?: string;
  error_stack?: string;
  error_context?: Json;
  page_path?: string;
  browser_info?: Json;
  resolution_notes?: string;
}

export interface ApiMetric {
  id?: string;
  // Frontend camelCase fields
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
  
  // DB column mappings (snake_case)
  status_code?: number;
  duration_ms?: number;
  request_size?: number;
  response_size?: number;
  user_id?: string;
  request_params?: Json;
  response_summary?: Json;
}

export interface AuditLogEntry {
  id?: string;
  // Frontend camelCase fields
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
  
  // DB column mappings (snake_case)
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

// Add these type converters
export function dbToPerformanceMetric(data: any): PerformanceMetric {
  return {
    id: data.id,
    userId: data.user_id,
    pagePath: data.page_path,
    loadTimeMs: data.load_time_ms,
    ttfbMs: data.ttfb_ms,
    lcpMs: data.lcp_ms,
    fidMs: data.fid_ms,
    clsScore: data.cls_score,
    deviceInfo: data.device_info,
    networkInfo: data.network_info,
    timestamp: data.timestamp,
    // Include DB field mappings for completeness
    page_path: data.page_path,
    load_time_ms: data.load_time_ms,
    ttfb_ms: data.ttfb_ms,
    lcp_ms: data.lcp_ms,
    fid_ms: data.fid_ms,
    cls_score: data.cls_score,
    user_id: data.user_id,
    device_info: data.device_info,
    network_info: data.network_info
  };
}

export function dbToErrorLog(data: any): ErrorLog {
  return {
    id: data.id,
    userId: data.user_id,
    errorMessage: data.error_message,
    errorStack: data.error_stack,
    errorContext: data.error_context,
    component: data.component,
    pagePath: data.page_path,
    severity: data.severity,
    browserInfo: data.browser_info,
    timestamp: data.timestamp,
    resolved: data.resolved,
    resolutionNotes: data.resolution_notes,
    // Include DB field mappings
    user_id: data.user_id,
    error_message: data.error_message,
    error_stack: data.error_stack,
    error_context: data.error_context,
    page_path: data.page_path,
    browser_info: data.browser_info,
    resolution_notes: data.resolution_notes
  };
}

export function dbToApiMetric(data: any): ApiMetric {
  return {
    id: data.id,
    endpoint: data.endpoint,
    method: data.method,
    statusCode: data.status_code,
    durationMs: data.duration_ms,
    requestSize: data.request_size,
    responseSize: data.response_size,
    userId: data.user_id,
    timestamp: data.timestamp,
    requestParams: data.request_params,
    responseSummary: data.response_summary,
    // Include DB field mappings
    status_code: data.status_code,
    duration_ms: data.duration_ms,
    request_size: data.request_size,
    response_size: data.response_size,
    user_id: data.user_id,
    request_params: data.request_params,
    response_summary: data.response_summary
  };
}

export function dbToAuditLogEntry(data: any): AuditLogEntry {
  return {
    id: data.id,
    action: data.action,
    tableName: data.table_name,
    recordId: data.record_id,
    userId: data.user_id,
    oldData: data.old_data,
    newData: data.new_data,
    ipAddress: data.ip_address,
    userAgent: data.user_agent,
    component: data.component,
    durationMs: data.duration_ms,
    success: data.success,
    metadata: data.metadata,
    timestamp: data.created_at || data.timestamp,
    // Include DB field mappings
    table_name: data.table_name,
    record_id: data.record_id,
    user_id: data.user_id,
    old_data: data.old_data,
    new_data: data.new_data,
    ip_address: data.ip_address,
    user_agent: data.user_agent,
    duration_ms: data.duration_ms,
    created_at: data.created_at
  };
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  enableConsole?: boolean;
  enableSentry?: boolean;
  enableDatabase?: boolean;
  minLevel?: LogLevel;
}

// Add ImportJob and ExportJob types for compatibility with import/export tables
export interface ImportJob {
  id: string;
  status: 'waiting' | 'processing' | 'complete' | 'error';
  progress: number;
  total_rows: number;
  processed_rows: number;
  file_name: string;
  table_name: string;
  with_upsert: boolean;
  key_field?: string;
  errors: Array<{ row: number; message: string }>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ExportJob {
  id: string;
  status: 'waiting' | 'processing' | 'complete' | 'error';
  progress: number;
  total_rows: number;
  processed_rows: number;
  file_name: string;
  query_params: any;
  created_by: string;
  created_at: string;
  updated_at: string;
  file_url?: string;
  error_message?: string;
}
