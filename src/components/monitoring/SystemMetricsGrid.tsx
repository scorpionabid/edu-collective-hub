
import React from 'react';
import { SystemMetricsCard } from './SystemMetricsCard';

interface SystemMetricsGridProps {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeUsers: number;
}

export function SystemMetricsGrid({
  cpuUsage,
  memoryUsage,
  diskUsage,
  activeUsers
}: SystemMetricsGridProps) {
  return (
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
  );
}
