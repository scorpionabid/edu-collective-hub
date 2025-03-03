
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { saveAs } from 'file-saver';
import { ComponentErrorBoundary } from './ErrorBoundary';
import { format } from 'date-fns';

// Helper function to format date
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
  } catch (e) {
    return dateString;
  }
};

// Helper function to export data as CSV
const exportToCsv = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;

  // Convert data to CSV format
  const replacer = (_key: string, value: any) => (value === null ? '' : value);
  const header = Object.keys(data[0]);
  let csv = data.map(row => 
    header.map(fieldName => 
      JSON.stringify(row[fieldName], replacer)
    ).join(',')
  );
  csv.unshift(header.join(','));
  const csvArray = csv.join('\r\n');

  // Create blob and download
  const blob = new Blob([csvArray], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
};

// Performance metrics section
const PerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Core web vitals and page load times</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => exportToCsv(metrics, 'performance_metrics')}
            disabled={metrics.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Load Time (ms)</TableHead>
                  <TableHead>LCP (ms)</TableHead>
                  <TableHead>FID (ms)</TableHead>
                  <TableHead>CLS Score</TableHead>
                  <TableHead>TTFB (ms)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No performance metrics data available
                    </TableCell>
                  </TableRow>
                ) : (
                  metrics.map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell>{formatDate(metric.timestamp)}</TableCell>
                      <TableCell className="font-mono text-xs">{metric.page_path}</TableCell>
                      <TableCell>{metric.load_time_ms}</TableCell>
                      <TableCell>{metric.lcp_ms || '-'}</TableCell>
                      <TableCell>{metric.fid_ms || '-'}</TableCell>
                      <TableCell>{metric.cls_score?.toFixed(3) || '-'}</TableCell>
                      <TableCell>{metric.ttfb_ms || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Error logs section
const ErrorLogs = () => {
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setErrors(data || []);
    } catch (error) {
      console.error('Error fetching error logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, []);

  const resolveError = async (id: string) => {
    try {
      const { error } = await supabase
        .from('error_logs')
        .update({ resolved: true })
        .eq('id', id);

      if (error) throw error;
      // Refresh the list after updating
      fetchErrors();
    } catch (error) {
      console.error('Error resolving error:', error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Error Logs</CardTitle>
          <CardDescription>Application errors and exceptions</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchErrors}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => exportToCsv(errors, 'error_logs')}
            disabled={errors.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Resolved</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No error logs available
                    </TableCell>
                  </TableRow>
                ) : (
                  errors.map((error) => (
                    <TableRow key={error.id}>
                      <TableCell>{formatDate(error.timestamp)}</TableCell>
                      <TableCell className="max-w-md truncate" title={error.error_message}>
                        {error.error_message}
                      </TableCell>
                      <TableCell>{error.component || '-'}</TableCell>
                      <TableCell className="font-mono text-xs">{error.page_path || '-'}</TableCell>
                      <TableCell>
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            error.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            error.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            error.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {error.severity}
                        </span>
                      </TableCell>
                      <TableCell>
                        {error.resolved ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-red-600">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {!error.resolved && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => resolveError(error.id)}
                          >
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// API metrics section
const ApiMetrics = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error fetching API metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>API Performance</CardTitle>
          <CardDescription>Response times and status codes</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => exportToCsv(metrics, 'api_metrics')}
            disabled={metrics.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration (ms)</TableHead>
                  <TableHead>Size (B)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No API metrics data available
                    </TableCell>
                  </TableRow>
                ) : (
                  metrics.map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell>{formatDate(metric.timestamp)}</TableCell>
                      <TableCell className="font-mono text-xs">{metric.endpoint}</TableCell>
                      <TableCell className="uppercase font-medium">{metric.method}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${
                            (metric.status_code >= 200 && metric.status_code < 300)
                              ? 'bg-green-100 text-green-800'
                              : (metric.status_code >= 400 && metric.status_code < 500)
                                ? 'bg-yellow-100 text-yellow-800'
                                : (metric.status_code >= 500)
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {metric.status_code || 'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center ${
                            metric.duration_ms > 1000
                              ? 'text-red-600'
                              : metric.duration_ms > 500
                                ? 'text-yellow-600'
                                : 'text-green-600'
                          }`}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {metric.duration_ms}
                        </span>
                      </TableCell>
                      <TableCell>
                        {metric.response_size ? `${Math.round(metric.response_size / 1024)}KB` : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Audit logs section
const AuditLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>User actions and data changes</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => exportToCsv(logs, 'audit_logs')}
            disabled={logs.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Duration (ms)</TableHead>
                  <TableHead>Success</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No audit logs available
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.created_at)}</TableCell>
                      <TableCell className="font-medium">
                        {log.action}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.table_name}</TableCell>
                      <TableCell className="font-mono text-xs truncate max-w-[10rem]">
                        {log.user_id || '-'}
                      </TableCell>
                      <TableCell>{log.component || '-'}</TableCell>
                      <TableCell>{log.duration_ms || '-'}</TableCell>
                      <TableCell>
                        {log.success === true ? (
                          <span className="text-green-600">Success</span>
                        ) : log.success === false ? (
                          <span className="text-red-600">Failed</span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main monitoring dashboard component
const MonitoringDashboard = () => {
  const { user } = useAuth();
  
  // Verify the user has admin access
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You need administrator privileges to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">System Monitoring</h1>
      </div>

      <Tabs defaultValue="performance">
        <TabsList className="mb-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="api">API Metrics</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <ComponentErrorBoundary component="PerformanceMetrics">
            <PerformanceMetrics />
          </ComponentErrorBoundary>
        </TabsContent>
        
        <TabsContent value="errors">
          <ComponentErrorBoundary component="ErrorLogs">
            <ErrorLogs />
          </ComponentErrorBoundary>
        </TabsContent>
        
        <TabsContent value="api">
          <ComponentErrorBoundary component="ApiMetrics">
            <ApiMetrics />
          </ComponentErrorBoundary>
        </TabsContent>
        
        <TabsContent value="audit">
          <ComponentErrorBoundary component="AuditLogs">
            <AuditLogs />
          </ComponentErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard;
