
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  School, 
  BookOpen, 
  Settings, 
  Table as TableIcon, 
  Building,
  ChevronRight,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const RegionAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sectors: 0,
    schools: 0,
    admins: 0,
    pendingApprovals: 0,
    completionRate: 0
  });
  const [sectorStats, setSectorStats] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In a real app, we would filter by the user's regionId
        const regionId = user?.regionId;
        
        if (!regionId) {
          console.error("User has no assigned region");
          return;
        }
        
        // Fetch sectors for this region
        const sectorsData = await api.sectors.getAll();
        const filteredSectors = sectorsData.filter((sector: any) => sector.regionId === regionId);
        
        // Fetch schools
        const schoolsData = await api.schools.getAll();
        const regionSchools = schoolsData.filter((school: any) => {
          const sectorIds = filteredSectors.map((s: any) => s.id);
          return sectorIds.includes(school.sectorId);
        });
        
        // Mock data for other stats
        setStats({
          sectors: filteredSectors.length,
          schools: regionSchools.length,
          admins: 12, // Mock data
          pendingApprovals: 8, // Mock data 
          completionRate: 86 // Mock data
        });
        
        // Mock data for sector stats
        setSectorStats([
          { id: "1", name: "Sektor 1", schoolsCount: 15, adminsCount: 2, completionRate: 92 },
          { id: "2", name: "Sektor 2", schoolsCount: 12, adminsCount: 2, completionRate: 78 },
          { id: "3", name: "Sektor 3", schoolsCount: 18, adminsCount: 3, completionRate: 85 },
          { id: "4", name: "Sektor 4", schoolsCount: 9, adminsCount: 1, completionRate: 67 }
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Region Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Logged in as {user?.name || 'Admin'} | Region Admin
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sectors</CardTitle>
            <Building className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sectors}</div>
            <p className="text-xs text-muted-foreground">Total sectors in your region</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schools</CardTitle>
            <School className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.schools}</div>
            <p className="text-xs text-muted-foreground">Schools across all sectors</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sector Admins</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">Admins managing sectors</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Average form completion</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Forms awaiting your review</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.pendingApprovals > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="font-medium">{stats.pendingApprovals} forms require your approval</span>
                </div>
                <Button onClick={() => navigate("/regionadmin/reports")}>
                  Review Now
                </Button>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-sm text-muted-foreground">No pending approvals</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Sector Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Sector Statistics</CardTitle>
          <CardDescription>Performance across sectors</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left">Sector Name</th>
                    <th className="py-3 text-left">Schools</th>
                    <th className="py-3 text-left">Admins</th>
                    <th className="py-3 text-left">Completion Rate</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sectorStats.map((sector) => (
                    <tr key={sector.id} className="border-b">
                      <td className="py-3">{sector.name}</td>
                      <td className="py-3">{sector.schoolsCount}</td>
                      <td className="py-3">{sector.adminsCount}</td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <Progress value={sector.completionRate} className="h-2 w-24" />
                          <span>{sector.completionRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/regionadmin/sectors?id=${sector.id}`)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => navigate("/regionadmin/sectors")}>
            Manage All Sectors <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
      
      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Common management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 space-y-2" 
              onClick={() => navigate("/regionadmin/sectors")}
            >
              <Building className="h-8 w-8 text-blue-500" />
              <span>Manage Sectors</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 space-y-2" 
              onClick={() => navigate("/regionadmin/schools")}
            >
              <School className="h-8 w-8 text-orange-500" />
              <span>View Schools</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 space-y-2" 
              onClick={() => navigate("/regionadmin/reports")}
            >
              <FileText className="h-8 w-8 text-green-500" />
              <span>Review Forms</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 space-y-2" 
              onClick={() => navigate("/regionadmin/tables")}
            >
              <TableIcon className="h-8 w-8 text-purple-500" />
              <span>Data Tables</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegionAdminDashboard;
