
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceMetricsChart } from './PerformanceMetricsChart';
import { ApiMetricsChart } from './ApiMetricsChart';
import { ErrorLogsTable } from './ErrorLogsTable';
import { AuditLogTable } from './AuditLogTable';
import { PerformanceMetric, ErrorLog, ApiMetric, AuditLogEntry } from '@/lib/monitoring/types';

interface MonitoringTabsProps {
  performanceMetrics: PerformanceMetric[];
  errorLogs: ErrorLog[];
  apiMetrics: ApiMetric[];
  auditLogs: AuditLogEntry[];
}

export function MonitoringTabs({
  performanceMetrics,
  errorLogs,
  apiMetrics,
  auditLogs
}: MonitoringTabsProps) {
  return (
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
  );
}
