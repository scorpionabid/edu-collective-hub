
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

// Database to Type conversion functions
export const dbToPerformanceMetric = (dbRecord: any): PerformanceMetric => {
  return {
    pagePath: dbRecord.page_path,
    loadTimeMs: dbRecord.load_time_ms,
    ttfbMs: dbRecord.ttfb_ms,
    clsScore: dbRecord.cls_score,
    fidMs: dbRecord.fid_ms,
    lcpMs: dbRecord.lcp_ms,
    userId: dbRecord.user_id,
    deviceInfo: dbRecord.device_info,
    networkInfo: dbRecord.network_info,
    timestamp: dbRecord.timestamp
  };
};

export const dbToErrorLog = (dbRecord: any): ErrorLog => {
  return {
    userId: dbRecord.user_id,
    errorMessage: dbRecord.error_message,
    errorStack: dbRecord.error_stack,
    errorContext: dbRecord.error_context,
    component: dbRecord.component,
    pagePath: dbRecord.page_path,
    severity: dbRecord.severity || 'medium',
    browserInfo: dbRecord.browser_info || {
      userAgent: 'unknown',
      language: 'unknown',
      platform: 'unknown'
    },
    resolved: dbRecord.resolved || false,
    timestamp: dbRecord.timestamp,
    resolution_notes: dbRecord.resolution_notes
  };
};

export const dbToApiMetric = (dbRecord: any): ApiMetric => {
  return {
    endpoint: dbRecord.endpoint,
    method: dbRecord.method,
    duration_ms: dbRecord.duration_ms,
    status_code: dbRecord.status_code,
    request_size: dbRecord.request_size,
    response_size: dbRecord.response_size,
    user_id: dbRecord.user_id,
    request_params: dbRecord.request_params,
    response_summary: dbRecord.response_summary,
    timestamp: dbRecord.timestamp
  };
};

export const dbToAuditLogEntry = (dbRecord: any): AuditLogEntry => {
  return {
    action: dbRecord.action,
    tableName: dbRecord.table_name,
    recordId: dbRecord.record_id,
    userId: dbRecord.user_id,
    oldData: dbRecord.old_data,
    newData: dbRecord.new_data,
    ipAddress: dbRecord.ip_address,
    userAgent: dbRecord.user_agent,
    component: dbRecord.component,
    durationMs: dbRecord.duration_ms,
    success: dbRecord.success === undefined ? true : !!dbRecord.success,
    metadata: dbRecord.metadata || {},
    timestamp: dbRecord.created_at || dbRecord.timestamp
  };
};
