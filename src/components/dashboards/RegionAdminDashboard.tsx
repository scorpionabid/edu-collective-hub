
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { categories } from '@/lib/api';
import { sectors } from '@/lib/api/sectors';
import { schools } from '@/lib/api/schools';

export function RegionAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    sectors: [] as any[],
    schools: [] as any[],
    forms: [] as any[],
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.regionId) return;
      
      try {
        setIsLoading(true);
        
        // Get sectors in region
        const regionSectors = await sectors.getByRegionId(user.regionId);
        
        // Get schools in region
        const regionSchools = await schools.getAll();
        const filteredSchools = Array.isArray(regionSchools) 
          ? regionSchools.filter((school: any) => {
              const sectorIds = regionSectors.map((s: any) => s.id);
              return sectorIds.includes(school.sector_id);
            })
          : [];
        
        // Get all form categories
        const allCategories = await categories.getAll();
        
        // Get form data stats
        const { data: formData } = await supabase
          .from('data')
          .select('status, category_id, school_id');
        
        // Stats
        const pendingForms = formData?.filter(form => form.status === 'submitted') || [];
        const approvedForms = formData?.filter(form => form.status === 'approved') || [];
        const rejectedForms = formData?.filter(form => form.status === 'rejected') || [];
        
        setStats({
          sectors: regionSectors,
          schools: filteredSchools,
          forms: formData || [],
          pending: pendingForms.length,
          approved: approvedForms.length,
          rejected: rejectedForms.length
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user?.regionId]);

  return (
    <div className="flex flex-col space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sectors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.schools.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Forms Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.forms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Approved Forms</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.approved}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Rejected Forms</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.rejected}</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline">View All Forms</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sectors in Your Region</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schools</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.sectors.map((sector: any) => (
                          <tr key={sector.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sector.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sector.schoolCount || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Button variant="ghost" size="sm">View</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline">Manage Sectors</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schools in Your Region</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forms</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.schools.slice(0, 5).map((school: any) => (
                          <tr key={school.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{school.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.sectorName || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {stats.forms.filter((form: any) => form.school_id === school.id).length}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Button variant="ghost" size="sm">View</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline">View All Schools</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RegionAdminDashboard;
