
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  School, 
  Users, 
  BookOpen, 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  FileUp
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const SchoolDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock data
  const pendingForms = 3;
  const completedForms = 5;
  const totalForms = 8;
  const completionPercentage = (completedForms / totalForms) * 100;

  // Mock recent submissions
  const recentSubmissions = [
    { id: 1, name: "Məktəbin ümumi məlumatları", status: "approved", date: "2023-06-15" },
    { id: 2, name: "Şagirdlər haqqında məlumat", status: "pending", date: "2023-06-14" },
    { id: 3, name: "Müəllimlər haqqında məlumat", status: "rejected", date: "2023-06-10" }
  ];

  // Mock notifications
  const notifications = [
    { id: 1, message: "Şagirdlər haqqında məlumat formu son təqdim tarixi: 20 İyun 2023", type: "warning" },
    { id: 2, message: "Müəllimlər haqqında məlumat formu rədd edildi. Zəhmət olmasa düzəliş edin.", type: "error" },
    { id: 3, message: "Məktəbin ümumi məlumatları təsdiqləndi", type: "success" }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">Məktəb İdarəetmə Paneli</h1>
              </div>
              {user && (
                <div className="text-sm text-muted-foreground">
                  {user.name} | Məktəb Admin
                </div>
              )}
            </div>
          </header>

          <main className="p-6">
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Gözləyən formlar
                  </CardTitle>
                  <Clock className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-500">{pendingForms}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tamamlanmış formlar
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{completedForms}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ümumi formlar
                  </CardTitle>
                  <ClipboardList className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalForms}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tamamlanma faizi
                  </CardTitle>
                  <FileUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">{completionPercentage.toFixed(0)}%</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Son təqdimlər</CardTitle>
                  <CardDescription>Təqdim etdiyiniz formaların statusu</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSubmissions.map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between border-b pb-3">
                        <div>
                          <p className="font-medium">{submission.name}</p>
                          <p className="text-sm text-muted-foreground">Təqdim edildi: {submission.date}</p>
                        </div>
                        <div>
                          {submission.status === "approved" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Təsdiqləndi
                            </span>
                          )}
                          {submission.status === "pending" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Gözləmədə
                            </span>
                          )}
                          {submission.status === "rejected" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Rədd edildi
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 pb-2">
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => navigate("/school-import")}>
                    Bütün təqdimləri göstər
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bildirişlər</CardTitle>
                  <CardDescription>Son bildirişlər və xəbərdarlıqlar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-3 rounded-lg ${
                        notification.type === "warning" ? "bg-amber-50 border border-amber-200" :
                        notification.type === "error" ? "bg-red-50 border border-red-200" :
                        "bg-green-50 border border-green-200"
                      }`}>
                        <div className="flex items-start">
                          {notification.type === "warning" && <Clock className="w-5 h-5 mr-2 text-amber-500 mt-0.5" />}
                          {notification.type === "error" && <AlertCircle className="w-5 h-5 mr-2 text-red-500 mt-0.5" />}
                          {notification.type === "success" && <CheckCircle2 className="w-5 h-5 mr-2 text-green-500 mt-0.5" />}
                          <p className={`text-sm ${
                            notification.type === "warning" ? "text-amber-800" :
                            notification.type === "error" ? "text-red-800" :
                            "text-green-800"
                          }`}>{notification.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 pb-2">
                  <Button variant="ghost" size="sm" className="ml-auto">
                    Bütün bildirişləri göstər
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Hesabat tamamlanma irəliləyişi</CardTitle>
                <CardDescription>Cari hesabat dövrü üçün ümumi irəliləyiş</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Ümumi irəliləyiş</div>
                      <div className="text-sm text-muted-foreground">{completionPercentage.toFixed(0)}%</div>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Məktəbin ümumi məlumatları</div>
                      <div className="text-sm text-muted-foreground">100%</div>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Şagirdlər haqqında məlumat</div>
                      <div className="text-sm text-muted-foreground">60%</div>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Müəllimlər haqqında məlumat</div>
                      <div className="text-sm text-muted-foreground">25%</div>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="ml-auto" onClick={() => navigate("/school-dashboard")}>
                  Data daxil et
                </Button>
              </CardFooter>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SchoolDashboard;
