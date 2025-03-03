
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PerformanceMetricsChart } from './PerformanceMetricsChart';
import { ApiMetricsChart } from './ApiMetricsChart';
import { ErrorLogsTable } from './ErrorLogsTable';
import { AuditLogTable } from './AuditLogTable';
import { SystemMetricsGrid } from './SystemMetricsGrid';
import { SystemAlertsCard } from './SystemAlertsCard';
import { MonitoringTabs } from './MonitoringTabs';
import { useMonitoringData } from '@/hooks/useMonitoringData';

export function MonitoringDashboard() {
  const { 
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
  } = useMonitoringData();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Monitoring Dashboard</h1>
      
      {/* System Metrics Overview */}
      <SystemMetricsGrid 
        cpuUsage={cpuUsage}
        memoryUsage={memoryUsage}
        diskUsage={diskUsage}
        activeUsers={activeUsers}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Performance Trends Card */}
        <PerformanceTrendsCard data={performanceMetrics} />
        
        {/* System Alerts Card */}
        <SystemAlertsCard 
          criticalErrors={criticalErrors}
          slowRequests={slowRequests}
          performanceIssues={performanceIssues}
        />
      </div>
      
      {/* Detailed Monitoring Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Monitoring</CardTitle>
          <CardDescription>View detailed metrics and logs for system performance</CardDescription>
        </CardHeader>
        <CardContent>
          <MonitoringTabs 
            performanceMetrics={performanceMetrics}
            errorLogs={errorLogs}
            apiMetrics={apiMetrics}
            auditLogs={auditLogs}
          />
        </CardContent>
      </Card>
    </div>
  );
}
