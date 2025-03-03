
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileUp,
  ChevronRight,
  Database,
  HelpCircle,
  CalendarClock,
  User,
  ArrowRightIcon,
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { FormData } from '@/lib/api/types';

const SchoolAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In a real app, we would use the actual API
        const schoolId = user?.schoolId;
        
        if (!schoolId) {
          console.error("User has no assigned school");
          return;
        }
        
        // Mock data for form submissions
        setFormData([
          { 
            id: "1", 
            categoryId: "cat1", 
            schoolId: schoolId, 
            data: { title: "Student Information" }, 
            status: "approved", 
            submittedAt: "2023-06-15T10:30:00Z",
            approvedAt: "2023-06-16T14:20:00Z",
            approvedBy: "admin1",
            createdAt: "2023-06-14T09:15:00Z",
            updatedAt: "2023-06-16T14:20:00Z",
            categoryName: "Student Data"
          },
          { 
            id: "2", 
            categoryId: "cat2", 
            schoolId: schoolId, 
            data: { title: "Teacher Information" }, 
            status: "pending",
            submittedAt: "2023-06-18T11:45:00Z",
            createdAt: "2023-06-17T16:30:00Z",
            updatedAt: "2023-06-18T11:45:00Z",
            categoryName: "Teacher Data"
          },
          { 
            id: "3", 
            categoryId: "cat3", 
            schoolId: schoolId, 
            data: { title: "Facility Report" }, 
            status: "rejected",
            submittedAt: "2023-06-10T13:20:00Z",
            createdAt: "2023-06-09T15:45:00Z",
            updatedAt: "2023-06-11T09:30:00Z",
            categoryName: "Facility Data"
          },
          { 
            id: "4", 
            categoryId: "cat4", 
            schoolId: schoolId, 
            data: { title: "Curriculum Details" }, 
            status: "draft",
            createdAt: "2023-06-19T10:00:00Z",
            updatedAt: "2023-06-19T10:00:00Z",
            categoryName: "Curriculum Data"
          }
        ]);
        
        // Mock notifications
        setNotifications([
          { 
            id: "1", 
            message: "Your 'Teacher Information' form is awaiting approval", 
            type: "info", 
            date: "2023-06-18T11:45:00Z" 
          },
          { 
            id: "2", 
            message: "Your 'Facility Report' form was rejected. Please review the comments and resubmit.", 
            type: "error", 
            date: "2023-06-11T09:30:00Z" 
          },
          { 
            id: "3", 
            message: "Your 'Student Information' form has been approved.", 
            type: "success", 
            date: "2023-06-16T14:20:00Z" 
          }
        ]);
        
        // Mock upcoming deadlines
        setUpcomingDeadlines([
          {
            id: "1",
            title: "Student Enrollment Data",
            dueDate: "2023-06-30T23:59:59Z",
            status: "not_started",
            priority: "high"
          },
          {
            id: "2",
            title: "Financial Quarter Report",
            dueDate: "2023-07-15T23:59:59Z",
            status: "not_started",
            priority: "medium"
          },
          {
            id: "3",
            title: "Staff Development Plan",
            dueDate: "2023-07-05T23:59:59Z",
            status: "in_progress",
            priority: "high"
          }
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  // Count forms by status
  const countByStatus = (status: string) => {
    return formData.filter(form => form.status === status).length;
  };
  
  const pendingForms = countByStatus("pending");
  const approvedForms = countByStatus("approved");
  const rejectedForms = countByStatus("rejected");
  const draftForms = countByStatus("draft");
  const totalForms = formData.length;
  const completionRate = totalForms > 0 
    ? Math.round(((approvedForms + pendingForms) / totalForms) * 100)
    : 0;
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    }).format(date);
  };
  
  // Calculate time remaining for deadlines
  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const dueDate = new Date(deadline);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">School Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Logged in as {user?.name || 'Admin'} | School Admin
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Forms</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{pendingForms}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Forms</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{approvedForms}</div>
            <p className="text-xs text-muted-foreground">Completed submissions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Forms</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{rejectedForms}</div>
            <p className="text-xs text-muted-foreground">Need revisions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Forms</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftForms}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <FileUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">Overall progress</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Submissions and Notifications */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Status of your form submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.slice(0, 3).map((form) => (
                <div key={form.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{form.data.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {form.submittedAt 
                        ? `Submitted: ${formatDate(form.submittedAt)}` 
                        : 'Not submitted yet'}
                    </p>
                  </div>
                  <div>
                    {form.status === "approved" && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Approved
                      </Badge>
                    )}
                    {form.status === "pending" && (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {form.status === "rejected" && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        Rejected
                      </Badge>
                    )}
                    {form.status === "draft" && (
                      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Draft
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 pb-2">
            <Button variant="outline" className="w-full" onClick={() => navigate("/schooladmin/data-entry")}>
              View All Submissions <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Recent updates and information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-lg ${
                    notification.type === "info" ? "bg-blue-50 border border-blue-200" :
                    notification.type === "error" ? "bg-red-50 border border-red-200" :
                    "bg-green-50 border border-green-200"
                  }`}
                >
                  <div className="flex items-start">
                    {notification.type === "info" && <HelpCircle className="w-5 h-5 mr-2 text-blue-500 mt-0.5" />}
                    {notification.type === "error" && <AlertCircle className="w-5 h-5 mr-2 text-red-500 mt-0.5" />}
                    {notification.type === "success" && <CheckCircle2 className="w-5 h-5 mr-2 text-green-500 mt-0.5" />}
                    <div>
                      <p className={`text-sm ${
                        notification.type === "info" ? "text-blue-800" :
                        notification.type === "error" ? "text-red-800" :
                        "text-green-800"
                      }`}>{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(notification.date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 pb-2">
            <Button variant="outline" className="w-full">
              View All Notifications <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>Forms and reports that need your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-start space-x-3">
                  <CalendarClock className={`h-5 w-5 mt-0.5 ${
                    deadline.priority === 'high' ? 'text-red-500' : 
                    deadline.priority === 'medium' ? 'text-amber-500' : 
                    'text-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium">{deadline.title}</p>
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-muted-foreground">
                        Due: {formatDate(deadline.dueDate)}
                      </p>
                      <Badge 
                        className={`ml-2 ${
                          getTimeRemaining(deadline.dueDate) === 'Overdue'
                            ? 'bg-red-100 text-red-800'
                            : getTimeRemaining(deadline.dueDate) === 'Due today'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {getTimeRemaining(deadline.dueDate)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/schooladmin/data-entry')}
                >
                  {deadline.status === 'in_progress' ? 'Continue' : 'Start'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="w-full">
            <Button 
              className="w-full mb-2" 
              onClick={() => navigate('/schooladmin/data-entry')}
            >
              Enter New Data
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/schooladmin/import')}
            >
              Import Data
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Common tasks and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 space-y-2" 
              onClick={() => navigate("/schooladmin/data-entry")}
            >
              <FileText className="h-8 w-8 text-blue-500" />
              <span>Enter Form Data</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 space-y-2" 
              onClick={() => navigate("/schooladmin/import")}
            >
              <Database className="h-8 w-8 text-green-500" />
              <span>Import Data</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 space-y-2" 
              onClick={() => navigate("/schooladmin/profile")}
            >
              <User className="h-8 w-8 text-purple-500" />
              <span>My Profile</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 space-y-2" 
              onClick={() => navigate("/help")}
            >
              <HelpCircle className="h-8 w-8 text-amber-500" />
              <span>Help & Support</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolAdminDashboard;
