
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceMetricsChart } from './PerformanceMetricsChart';
import { ApiMetricsChart } from './ApiMetricsChart';
import { ErrorLogsTable } from './ErrorLogsTable';
import { AuditLogTable } from './AuditLogTable';
import { SystemMetricsCard } from './SystemMetricsCard';
import { supabase } from '@/integrations/supabase/client';
import { PerformanceMetric, ErrorLog, ApiMetric, AuditLogEntry, dbToPerformanceMetric, dbToErrorLog, dbToApiMetric, dbToAuditLogEntry } from '@/lib/monitoring/types';
import { useToast } from '@/hooks/use-toast';

interface MonitoringDashboardProps {
  limitPerformanceMetrics?: number;
  limitErrorLogs?: number;
  limitApiMetrics?: number;
  limitAuditLogs?: number;
}

export const MonitoringDashboardImpl: React.FC<MonitoringDashboardProps> = ({
  limitPerformanceMetrics = 100,
  limitErrorLogs = 100,
  limitApiMetrics = 100,
  limitAuditLogs = 100
}) => {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [apiMetrics, setApiMetrics] = useState<ApiMetric[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // System metrics
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [diskUsage, setDiskUsage] = useState<number>(0);
  const [activeUsers, setActiveUsers] = useState<number>(0);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-500">Loading monitoring data...</div>
      </div>
    );
  }

  // Calculate summary statistics
  const criticalErrors = errorLogs.filter(log => log.severity === 'critical').length;
  const slowRequests = apiMetrics.filter(metric => metric.durationMs > 1000).length;
  const performanceIssues = performanceMetrics.filter(metric => metric.loadTimeMs > 3000).length;
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Monitoring</h1>
        <Badge variant="outline">Last updated: {new Date().toLocaleString()}</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SystemMetricsCard 
          title="CPU Usage" 
          value={cpuUsage} 
          unit="%" 
          description="Current CPU utilization" 
          icon="Cpu"
        />
        <SystemMetricsCard 
          title="Memory Usage" 
          value={memoryUsage} 
          unit="%" 
          description="Current memory utilization" 
          icon="Memory"
        />
        <SystemMetricsCard 
          title="Disk Usage" 
          value={diskUsage} 
          unit="%" 
          description="Current disk utilization" 
          icon="HardDrive"
        />
        <SystemMetricsCard 
          title="Active Users" 
          value={activeUsers} 
          unit="" 
          description="Currently active users" 
          icon="Users"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Current system health issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Critical Errors</span>
                <Badge variant={criticalErrors > 0 ? "destructive" : "outline"}>{criticalErrors}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Slow API Requests</span>
                <Badge variant={slowRequests > 10 ? "destructive" : slowRequests > 5 ? "default" : "outline"}>{slowRequests}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Performance Issues</span>
                <Badge variant={performanceIssues > 10 ? "destructive" : performanceIssues > 5 ? "default" : "outline"}>{performanceIssues}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Page load times over time</CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceMetricsChart data={performanceMetrics} />
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="performance">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="api">API Metrics</TabsTrigger>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-4">
          <PerformanceMetricsChart data={performanceMetrics} />
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4">
          <ApiMetricsChart data={apiMetrics} />
        </TabsContent>
        
        <TabsContent value="errors" className="space-y-4">
          <ErrorLogsTable data={errorLogs} />
        </TabsContent>
        
        <TabsContent value="audit" className="space-y-4">
          <AuditLogTable data={auditLogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
