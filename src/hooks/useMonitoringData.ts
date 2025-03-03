
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  PerformanceMetric, 
  ErrorLog, 
  ApiMetric, 
  AuditLogEntry, 
  dbToPerformanceMetric, 
  dbToErrorLog, 
  dbToApiMetric, 
  dbToAuditLogEntry 
} from '@/lib/monitoring/types';

interface UseMonitoringDataProps {
  limitPerformanceMetrics?: number;
  limitErrorLogs?: number;
  limitApiMetrics?: number;
  limitAuditLogs?: number;
}

interface MonitoringData {
  performanceMetrics: PerformanceMetric[];
  errorLogs: ErrorLog[];
  apiMetrics: ApiMetric[];
  auditLogs: AuditLogEntry[];
  loading: boolean;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeUsers: number;
  criticalErrors: number;
  slowRequests: number;
  performanceIssues: number;
}

export function useMonitoringData({
  limitPerformanceMetrics = 100,
  limitErrorLogs = 100,
  limitApiMetrics = 100,
  limitAuditLogs = 100
}: UseMonitoringDataProps = {}): MonitoringData {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [apiMetrics, setApiMetrics] = useState<ApiMetric[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // System metrics
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [diskUsage, setDiskUsage] = useState<number>(0);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch performance metrics
        const { data: performanceData, error: performanceError } = await supabase
          .from('performance_metrics')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(limitPerformanceMetrics);
          
        if (performanceError) throw performanceError;
        
        // Convert snake_case DB fields to camelCase TypeScript objects
        const typedPerformanceMetrics = performanceData.map(dbToPerformanceMetric);
        setPerformanceMetrics(typedPerformanceMetrics);
        
        // Fetch error logs
        const { data: errorData, error: errorError } = await supabase
          .from('error_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(limitErrorLogs);
          
        if (errorError) throw errorError;
        
        const typedErrorLogs = errorData.map(dbToErrorLog);
        setErrorLogs(typedErrorLogs);
        
        // Fetch API metrics
        const { data: apiData, error: apiError } = await supabase
          .from('api_metrics')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(limitApiMetrics);
          
        if (apiError) throw apiError;
        
        const typedApiMetrics = apiData.map(dbToApiMetric);
        setApiMetrics(typedApiMetrics);
        
        // Fetch audit logs
        const { data: auditData, error: auditError } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limitAuditLogs);
          
        if (auditError) throw auditError;
        
        const typedAuditLogs = auditData.map(dbToAuditLogEntry);
        setAuditLogs(typedAuditLogs);
        
        // Mock system metrics for demo purposes
        setCpuUsage(Math.random() * 70 + 10);
        setMemoryUsage(Math.random() * 60 + 20);
        setDiskUsage(Math.random() * 50 + 30);
        setActiveUsers(Math.floor(Math.random() * 100) + 50);
        
      } catch (error) {
        console.error('Error fetching monitoring data:', error);
        toast({
          title: "Error fetching data",
          description: "Could not load monitoring data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    
    // Set up polling every 5 minutes
    const intervalId = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [limitPerformanceMetrics, limitErrorLogs, limitApiMetrics, limitAuditLogs, toast]);

  // Calculate summary statistics
  const criticalErrors = errorLogs.filter(log => log.severity === 'critical').length;
  const slowRequests = apiMetrics.filter(metric => metric.duration_ms > 1000).length;
  const performanceIssues = performanceMetrics.filter(metric => metric.loadTimeMs > 3000).length;

  return {
    performanceMetrics,
    errorLogs,
    apiMetrics,
    auditLogs,
    loading,
    cpuUsage,
    memoryUsage,
    diskUsage,
    activeUsers,
    criticalErrors,
    slowRequests,
    performanceIssues
  };
}
