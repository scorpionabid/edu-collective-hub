
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  School, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Table, 
  Database,
  BarChart3
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const SectorAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    schools: 0,
    schoolAdmins: 0,
    pendingForms: 0,
    completedForms: 0,
    categories: 0
  });
  const [schoolStats, setSchoolStats] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In a real app, we would filter by the user's sectorId
        const sectorId = user?.sectorId;
        
        if (!sectorId) {
          console.error("User has no assigned sector");
          return;
        }
        
        // Fetch schools for this sector
        const schoolsData = await api.schools.getAll();
        const sectorSchools = schoolsData.filter((school: any) => school.sectorId === sectorId);
        
        // Fetch categories
        const categoriesData = await api.categories.getAll();
        const sectorCategories = categoriesData.filter((cat: any) => cat.sectorId === sectorId);
        
        // Mock data for other stats
        setStats({
          schools: sectorSchools.length,
          schoolAdmins: 18, // Mock data
          pendingForms: 12, // Mock data
          completedForms: 86, // Mock data
          categories: sectorCategories.length
        });
        
        // Mock data for school stats
        setSchoolStats([
          { id: "1", name: "School #5", submittedForms: 24, pendingForms: 2, completionRate: 92 },
          { id: "2", name: "School #12", submittedForms: 18, pendingForms: 4, completionRate: 78 },
          { id: "3", name: "School #8", submittedForms: 22, pendingForms: 0, completionRate: 100 },
          { id: "4", name: "School #15", submittedForms: 16, pendingForms: 6, completionRate: 67 },
          { id: "5", name: "School #21", submittedForms: 20, pendingForms: 3, completionRate: 85 }
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  const totalForms = stats.pendingForms + stats.completedForms;
  const completionRate = totalForms > 0 ? Math.round((stats.completedForms / totalForms) * 100) : 0;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sector Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Logged in as {user?.name || 'Admin'} | Sector Admin
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schools</CardTitle>
            <School className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.schools}</div>
            <p className="text-xs text-muted-foreground">Schools in your sector</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">School Admins</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.schoolAdmins}</div>
            <p className="text-xs text-muted-foreground">Registered school administrators</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Forms</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingForms}</div>
            <p className="text-xs text-muted-foreground">Forms awaiting approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Database className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">Form categories configured</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <BarChart3 className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">Overall completion rate</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Form Approval Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Form Processing Progress</CardTitle>
          <CardDescription>Status of form submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">All Forms</div>
                <div className="text-sm text-muted-foreground">{totalForms} forms</div>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Completed</div>
                <div className="text-sm text-muted-foreground">
                  {stats.completedForms} forms ({completionRate}%)
                </div>
              </div>
              <Progress 
                value={completionRate} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Pending</div>
                <div className="text-sm text-muted-foreground">
                  {stats.pendingForms} forms ({totalForms > 0 ? Math.round((stats.pendingForms / totalForms) * 100) : 0}%)
                </div>
              </div>
              <Progress 
                value={totalForms > 0 ? (stats.pendingForms / totalForms) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </div>
          
          {stats.pendingForms > 0 && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-md p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Action Required</p>
                  <p className="text-sm text-amber-700">You have {stats.pendingForms} forms waiting for your review.</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/sectoradmin/forms")}
                className="mt-2 ml-7"
              >
                Review Forms
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* School Performance */}
      <Card>
        <CardHeader>
          <CardTitle>School Form Completion</CardTitle>
          <CardDescription>Performance across schools in your sector</CardDescription>
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
                    <th className="py-3 text-left">School Name</th>
                    <th className="py-3 text-left">Submitted Forms</th>
                    <th className="py-3 text-left">Pending Forms</th>
                    <th className="py-3 text-left">Completion Rate</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolStats.map((school) => (
                    <tr key={school.id} className="border-b">
                      <td className="py-3">{school.name}</td>
                      <td className="py-3">{school.submittedForms}</td>
                      <td className="py-3">
                        {school.pendingForms > 0 ? (
                          <span className="flex items-center text-amber-600">
                            <AlertCircle className="h-3.5 w-3.5 mr-1" />
                            {school.pendingForms}
                          </span>
                        ) : (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            None
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <Progress value={school.completionRate} className="h-2 w-24" />
                          <span>{school.completionRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/sectoradmin/schools?id=${school.id}`)}
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
          <Button variant="outline" className="w-full" onClick={() => navigate("/sectoradmin/schools")}>
            View All Schools <ChevronRight className="ml-2 h-4 w-4" />
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
              onClick={() => navigate("/sectoradmin/schools")}
            >
              <School className="h-8 w-8 text-blue-500" />
              <span>Manage Schools</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 space-y-2" 
              onClick={() => navigate("/sectoradmin/forms")}
            >
              <FileText className="h-8 w-8 text-green-500" />
              <span>Review Forms</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 space-y-2" 
              onClick={() => navigate("/sectoradmin/categories")}
            >
              <Database className="h-8 w-8 text-amber-500" />
              <span>Configure Categories</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 space-y-2" 
              onClick={() => navigate("/sectoradmin/tables")}
            >
              <Table className="h-8 w-8 text-purple-500" />
              <span>View Tables</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectorAdminDashboard;
