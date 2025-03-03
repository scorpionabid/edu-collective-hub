
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Users, 
  School, 
  BookOpen, 
  Settings, 
  Table, 
  Building,
  ChevronRight,
  Activity 
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface StatCard {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  change?: string;
  trend?: 'positive' | 'negative' | 'neutral';
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    regions: 0,
    sectors: 0,
    schools: 0,
    users: 0,
    formsSubmitted: 0,
    formsApproved: 0,
    pendingApprovals: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch counts
        const regionsData = await api.regions.getAll();
        const sectorsData = await api.sectors.getAll();
        const schoolsData = await api.schools.getAll();
        
        // This is a mock implementation until we have the actual API endpoints
        setStats({
          regions: regionsData?.length || 0,
          sectors: sectorsData?.length || 0,
          schools: schoolsData?.length || 0,
          users: 24, // Mock data
          formsSubmitted: 156, // Mock data
          formsApproved: 142, // Mock data
          pendingApprovals: 14 // Mock data
        });
        
        // Mock recent activity
        setRecentActivity([
          { id: 1, action: "Form Submitted", user: "Anar Mammadov", entity: "School #42", time: "2 hours ago", status: "pending" },
          { id: 2, action: "Form Approved", user: "Leyla Aliyeva", entity: "School #15", time: "3 hours ago", status: "approved" },
          { id: 3, action: "User Created", user: "Admin", entity: "Farid Huseynov", time: "5 hours ago", status: "completed" },
          { id: 4, action: "Region Added", user: "Admin", entity: "Ganja Region", time: "1 day ago", status: "completed" },
          { id: 5, action: "Form Rejected", user: "Kamran Asgarov", entity: "School #33", time: "1 day ago", status: "rejected" }
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards: StatCard[] = [
    {
      title: "Regions",
      value: stats.regions,
      description: "Total regions in the system",
      icon: <Building className="h-6 w-6 text-blue-500" />,
    },
    {
      title: "Sectors",
      value: stats.sectors,
      description: "Total sectors across all regions",
      icon: <Table className="h-6 w-6 text-green-500" />,
    },
    {
      title: "Schools",
      value: stats.schools,
      description: "Total schools across all sectors",
      icon: <School className="h-6 w-6 text-orange-500" />,
    },
    {
      title: "Users",
      value: stats.users,
      description: "Total system users",
      icon: <Users className="h-6 w-6 text-purple-500" />,
      change: "+12%",
      trend: "positive"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Logged in as {user?.name || 'Admin'} | SuperAdmin
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              {stat.change && (
                <p className={`text-xs mt-2 ${
                  stat.trend === 'positive' ? 'text-green-500' : 
                  stat.trend === 'negative' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {stat.change} from last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Form Submissions Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Form Submissions</CardTitle>
            <CardDescription>
              Overview of form submissions and approvals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Total Submitted</div>
                  <div className="text-sm text-muted-foreground">{stats.formsSubmitted}</div>
                </div>
                <Progress value={(stats.formsSubmitted > 0 ? 100 : 0)} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Approved</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.formsApproved} ({stats.formsSubmitted > 0 
                      ? Math.round((stats.formsApproved / stats.formsSubmitted) * 100) 
                      : 0}%)
                  </div>
                </div>
                <Progress 
                  value={stats.formsSubmitted > 0 
                    ? (stats.formsApproved / stats.formsSubmitted) * 100 
                    : 0
                  } 
                  className="h-2" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Pending Approval</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.pendingApprovals} ({stats.formsSubmitted > 0 
                      ? Math.round((stats.pendingApprovals / stats.formsSubmitted) * 100) 
                      : 0}%)
                  </div>
                </div>
                <Progress 
                  value={stats.formsSubmitted > 0 
                    ? (stats.pendingApprovals / stats.formsSubmitted) * 100 
                    : 0
                  } 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate("/superadmin/reports")}>
              View All Reports <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-start space-x-2 pb-3 border-b border-gray-100">
                  <div className={`min-w-2 min-h-2 rounded-full mt-2 ${
                    activity.status === 'approved' ? 'bg-green-500' :
                    activity.status === 'rejected' ? 'bg-red-500' :
                    activity.status === 'pending' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user} - {activity.entity}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate("/superadmin/monitoring")}>
              View Activity Log <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Access Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Frequently used management pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 space-y-2" 
              onClick={() => navigate("/superadmin/regions")}
            >
              <Building className="h-8 w-8 text-blue-500" />
              <span>Manage Regions</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 space-y-2" 
              onClick={() => navigate("/superadmin/sectors")}
            >
              <Table className="h-8 w-8 text-green-500" />
              <span>Manage Sectors</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 space-y-2" 
              onClick={() => navigate("/superadmin/schools")}
            >
              <School className="h-8 w-8 text-orange-500" />
              <span>Manage Schools</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 space-y-2" 
              onClick={() => navigate("/superadmin/users")}
            >
              <Users className="h-8 w-8 text-purple-500" />
              <span>Manage Users</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
