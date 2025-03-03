import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Download,
  RefreshCw,
  Server,
  Activity,
  AlertTriangle,
  Clock,
  FileText
} from "lucide-react";
import { format } from 'date-fns';
import { toast } from 'sonner';

import PerformanceMetricsChart from './PerformanceMetricsChart';
import ErrorLogsTable from './ErrorLogsTable';
import ApiMetricsChart from './ApiMetricsChart';
import SystemMetricsCard from './SystemMetricsCard';
import AuditLogTable from './AuditLogTable';
import { supabase } from '@/integrations/supabase/client';
import { ErrorLog, PerformanceMetric, ApiMetric, AuditLogEntry } from '@/lib/monitoring/types';

const mockSystemMetrics = [
  { name: 'CPU Usage', value: 42, max: 100, unit: '%', color: '#6366f1' },
  { name: 'Memory', value: 3.7, max: 8, unit: 'GB', color: '#8b5cf6' },
  { name: 'Disk Space', value: 74, max: 100, unit: '%', color: '#ec4899' },
  { name: 'Network', value: 1.8, max: 10, unit: 'Mbps', color: '#14b8a6' },
];

const MonitoringDashboardImpl = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [apiMetrics, setApiMetrics] = useState<ApiMetric[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '12h':
          startDate = new Date(now.getTime() - 12 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '24h':
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const { data: perfData, error: perfError } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (perfError) throw perfError;

      const mappedPerfData: PerformanceMetric[] = (perfData || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        pagePath: item.page_path,
        loadTimeMs: item.load_time_ms,
        ttfbMs: item.ttfb_ms,
        lcpMs: item.lcp_ms,
        fidMs: item.fid_ms,
        clsScore: item.cls_score,
        deviceInfo: item.device_info as Record<string, any>,
        networkInfo: item.network_info as Record<string, any>,
        timestamp: item.timestamp
      }));

      setPerformanceMetrics(mappedPerfData);

      const { data: errorData, error: errorError } = await supabase
        .from('error_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (errorError) throw errorError;

      const mappedErrorData: ErrorLog[] = (errorData || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        errorMessage: item.error_message,
        errorStack: item.error_stack,
        errorContext: item.error_context as Record<string, any>,
        component: item.component,
        pagePath: item.page_path,
        severity: item.severity as 'low' | 'medium' | 'high' | 'critical',
        browserInfo: item.browser_info as Record<string, any>,
        timestamp: item.timestamp,
        resolved: item.resolved,
        resolutionNotes: item.resolution_notes
      }));

      setErrorLogs(mappedErrorData);

      const { data: apiData, error: apiError } = await supabase
        .from('api_metrics')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (apiError) throw apiError;

      const mappedApiData: ApiMetric[] = (apiData || []).map(item => ({
        id: item.id,
        endpoint: item.endpoint,
        method: item.method,
        statusCode: item.status_code,
        durationMs: item.duration_ms,
        requestSize: item.request_size,
        responseSize: item.response_size,
        userId: item.user_id,
        timestamp: item.timestamp,
        requestParams: item.request_params as Record<string, any>,
        responseSummary: item.response_summary as Record<string, any>
      }));

      setApiMetrics(mappedApiData);

      const { data: auditData, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (auditError) throw auditError;

      const mappedAuditData: AuditLogEntry[] = (auditData || []).map(item => ({
        id: item.id,
        action: item.action,
        tableName: item.table_name,
        recordId: item.record_id,
        userId: item.user_id,
        oldData: item.old_data,
        newData: item.new_data,
        ipAddress: item.ip_address,
        userAgent: item.user_agent,
        component: item.component,
        durationMs: item.duration_ms,
        success: item.success,
        metadata: item.metadata as Record<string, any>,
        timestamp: item.created_at
      }));

      setAuditLogs(mappedAuditData);

    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      toast.error('Failed to load monitoring data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveError = async (id: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('error_logs')
        .update({ 
          resolved: true,
          resolution_notes: notes
        })
        .eq('id', id);

      if (error) throw error;
      
      setErrorLogs(prev => prev.map(log => 
        log.id === id 
          ? { ...log, resolved: true, resolutionNotes: notes } 
          : log
      ));
      
      toast.success('Error marked as resolved');
    } catch (error) {
      console.error('Error resolving error log:', error);
      toast.error('Failed to update error status');
    }
  };

  const exportData = async (type: string) => {
    setIsExporting(true);
    try {
      let dataToExport;
      let filename;
      
      switch (type) {
        case 'performance':
          dataToExport = performanceMetrics;
          filename = `performance_metrics_${format(new Date(), 'yyyy-MM-dd')}.json`;
          break;
        case 'errors':
          dataToExport = errorLogs;
          filename = `error_logs_${format(new Date(), 'yyyy-MM-dd')}.json`;
          break;
        case 'api':
          dataToExport = apiMetrics;
          filename = `api_metrics_${format(new Date(), 'yyyy-MM-dd')}.json`;
          break;
        case 'audit':
          dataToExport = auditLogs;
          filename = `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.json`;
          break;
        case 'all':
          dataToExport = {
            performanceMetrics,
            errorLogs,
            apiMetrics,
            auditLogs,
            exportDate: new Date().toISOString(),
            timeRange
          };
          filename = `monitoring_data_${format(new Date(), 'yyyy-MM-dd')}.json`;
          break;
        default:
          throw new Error('Invalid export type');
      }
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
      setExportDialogOpen(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and diagnostics for the application
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <Clock className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last hour</SelectItem>
              <SelectItem value="12h">Last 12 hours</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setExportDialogOpen(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="sm:inline hidden">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="sm:inline hidden">Performance</span>
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="sm:inline hidden">Errors</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span className="sm:inline hidden">API Metrics</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="sm:inline hidden">Audit Log</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current system resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <SystemMetricsCard 
                  metrics={mockSystemMetrics}
                  title=""
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Error Summary</CardTitle>
                <CardDescription>Recent application errors by severity</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-64">
                {errorLogs.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    <AlertTriangle className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>No errors recorded</p>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="border-dashed">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="bg-red-100 rounded-full p-3">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Critical & High</p>
                            <p className="text-2xl font-bold">
                              {errorLogs.filter(e => ['critical', 'high'].includes(e.severity)).length}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-dashed">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="bg-orange-100 rounded-full p-3">
                            <AlertTriangle className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Medium & Low</p>
                            <p className="text-2xl font-bold">
                              {errorLogs.filter(e => ['medium', 'low'].includes(e.severity)).length}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card className="mt-4 border-dashed">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-green-100 rounded-full p-3">
                          <Activity className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Resolved</p>
                          <p className="text-2xl font-bold">
                            {errorLogs.filter(e => e.resolved).length}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <PerformanceMetricsChart 
            data={performanceMetrics.slice(0, 100)}
            title="Performance Metrics Overview"
            description="Page load time and Core Web Vitals metrics"
          />
          
          <ApiMetricsChart 
            data={apiMetrics.slice(0, 100)}
            title="API Performance"
            description="Average API response time and success rate by endpoint"
          />
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <PerformanceMetricsChart 
            data={performanceMetrics}
            title="Page Load Performance"
            description="Page load time metrics over time"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <CardDescription>LCP, FID, and CLS metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceMetricsChart 
                  data={performanceMetrics}
                  title=""
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Page Performance by Route</CardTitle>
                <CardDescription>Average load time by page route</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Route performance chart would go here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="errors" className="space-y-6">
          <ErrorLogsTable 
            errors={errorLogs}
            onResolveError={handleResolveError}
          />
        </TabsContent>
        
        <TabsContent value="api" className="space-y-6">
          <ApiMetricsChart 
            data={apiMetrics}
            title="API Response Time"
            description="Average response time and success rate by endpoint"
          />
          
          <Card>
            <CardHeader>
              <CardTitle>API Request Volume</CardTitle>
              <CardDescription>Number of API requests over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                API request volume chart would go here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audit" className="space-y-6">
          <AuditLogTable logs={auditLogs} />
        </TabsContent>
      </Tabs>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Monitoring Data</DialogTitle>
            <DialogDescription>
              Select the type of data you want to export
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Button 
              variant="outline" 
              className="justify-start" 
              onClick={() => exportData('performance')}
              disabled={isExporting}
            >
              <Clock className="mr-2 h-4 w-4" />
              Performance Metrics
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start" 
              onClick={() => exportData('errors')}
              disabled={isExporting}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Error Logs
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start" 
              onClick={() => exportData('api')}
              disabled={isExporting}
            >
              <Server className="mr-2 h-4 w-4" />
              API Metrics
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start" 
              onClick={() => exportData('audit')}
              disabled={isExporting}
            >
              <FileText className="mr-2 h-4 w-4" />
              Audit Logs
            </Button>
            
            <Button 
              className="justify-start md:col-span-2" 
              onClick={() => exportData('all')}
              disabled={isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              Export All Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonitoringDashboardImpl;
