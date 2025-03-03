
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { SystemMetricsGrid } from './SystemMetricsGrid';
import { SystemAlertsCard } from './SystemAlertsCard';
import { PerformanceTrendsCard } from './PerformanceTrendsCard';
import { MonitoringTabs } from './MonitoringTabs';
import { useMonitoringData } from '@/hooks/useMonitoringData';

interface MonitoringDashboardImplProps {
  limitPerformanceMetrics?: number;
  limitErrorLogs?: number;
  limitApiMetrics?: number;
  limitAuditLogs?: number;
}

export function MonitoringDashboardImpl({
  limitPerformanceMetrics = 100,
  limitErrorLogs = 100,
  limitApiMetrics = 100,
  limitAuditLogs = 100
}: MonitoringDashboardImplProps) {
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
  } = useMonitoringData({
    limitPerformanceMetrics,
    limitErrorLogs,
    limitApiMetrics,
    limitAuditLogs
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-500">Loading monitoring data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Monitoring</h1>
        <Badge variant="outline">Last updated: {new Date().toLocaleString()}</Badge>
      </div>
      
      <SystemMetricsGrid 
        cpuUsage={cpuUsage}
        memoryUsage={memoryUsage}
        diskUsage={diskUsage}
        activeUsers={activeUsers}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SystemAlertsCard 
          criticalErrors={criticalErrors}
          slowRequests={slowRequests}
          performanceIssues={performanceIssues}
        />
        
        <PerformanceTrendsCard data={performanceMetrics} />
      </div>
      
      <MonitoringTabs 
        performanceMetrics={performanceMetrics}
        errorLogs={errorLogs}
        apiMetrics={apiMetrics}
        auditLogs={auditLogs}
      />
    </div>
  );
}
