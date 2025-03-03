
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MonitoringDashboardImpl from '@/components/monitoring/MonitoringDashboardImpl';

const Monitoring = () => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You need superadmin privileges to access the monitoring dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">System Monitoring</h1>
              </div>
            </div>
          </header>
          <main className="p-6">
            <MonitoringDashboardImpl />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Monitoring;
