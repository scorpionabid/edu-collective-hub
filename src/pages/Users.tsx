
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { exportToExcel } from '@/utils/excelExport';
import { toast } from "@/hooks/use-toast";
import SectorList from '@/components/users/SectorList';

// Only superadmins should have access to this page
export default function Users() {
  const { user } = useAuth();

  // Check if user is authorized
  if (!user || user.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You need superadmin privileges to access the users management dashboard.
          </p>
        </div>
      </div>
    );
  }

  const handleExportUsers = async () => {
    try {
      const response = await api.users.getAll();
      await exportToExcel(response, 'users');
      toast({
        title: 'Success',
        description: 'User data exported successfully',
      });
    } catch (error) {
      console.error('Error exporting users:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export user data',
        variant: 'destructive',
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">User Management</h1>
              </div>
              <Button onClick={handleExportUsers}>Export Users</Button>
            </div>
          </header>
          <main className="p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>User Administration</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="sectors">
                  <TabsList className="mb-4">
                    <TabsTrigger value="sectors">Sectors</TabsTrigger>
                    <TabsTrigger value="regions">Regions</TabsTrigger>
                    <TabsTrigger value="schools">Schools</TabsTrigger>
                  </TabsList>
                  <TabsContent value="sectors">
                    <SectorList />
                  </TabsContent>
                  <TabsContent value="regions">
                    <div>Region admin management will be implemented here</div>
                  </TabsContent>
                  <TabsContent value="schools">
                    <div>School admin management will be implemented here</div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
