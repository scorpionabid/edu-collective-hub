
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminList } from "@/components/users/AdminList";
import { AdminForm } from "@/components/users/AdminForm";
import { RegionList } from "@/components/users/RegionList";
import { SectorList } from "@/components/users/SectorList";
import { SchoolList } from "@/components/users/SchoolList";
import { ImportDialog } from "@/components/users/ImportDialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { api } from '@/lib/api';
import { exportToExcel } from '@/utils/excelExport';
import { toast } from 'sonner';

const Users = () => {
  const { user } = useAuth();
  const [regions, setRegions] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [schools, setSchools] = useState([]);
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch regions, sectors, schools, and admins
        const regionsData = await api.regions.getAll();
        setRegions(regionsData);

        const sectorsData = await api.sectors.getAll();
        setSectors(sectorsData);

        const schoolsData = await api.schools.getAll();
        setSchools(schoolsData);

        // Fetch admins (this might need a different API call)
        // Placeholder for admin data fetching
        setAdmins([]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load user data');
      }
    };

    fetchData();
  }, []);

  const handleExportUsers = () => {
    try {
      exportToExcel(admins, 'users');
      toast.success('Users exported successfully');
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error('Failed to export users');
    }
  };

  if (!user || user.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You need superadmin privileges to access this page.
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
                <h1 className="text-xl font-semibold">User Management</h1>
              </div>
              <div className="flex gap-2">
                <ImportDialog />
                <Button onClick={handleExportUsers} variant="outline">Export Users</Button>
              </div>
            </div>
          </header>
          <main className="p-6">
            <div className="grid gap-6 mb-8">
              <AdminList admins={admins} />
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Regions</CardTitle>
                </CardHeader>
                <CardContent>
                  <RegionList regions={regions} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sectors</CardTitle>
                </CardHeader>
                <CardContent>
                  <SectorList 
                    sectors={sectors} 
                    regions={regions}
                    onAdd={(data) => console.log('Add sector', data)}
                    onEdit={(id, data) => console.log('Edit sector', id, data)}
                    onDelete={(id) => console.log('Delete sector', id)}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Schools</CardTitle>
                </CardHeader>
                <CardContent>
                  <SchoolList schools={schools} />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Add New Admin</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminForm 
                  regions={regions}
                  sectors={sectors}
                  schools={schools}
                  onSubmit={(data) => console.log('Submit admin form', data)}
                />
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Users;
