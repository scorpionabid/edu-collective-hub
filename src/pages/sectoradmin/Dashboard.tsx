
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, School, Users, Table as TableIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface SchoolStat {
  id: string;
  name: string;
  studentsCount: number;
  teachersCount: number;
  completionRate: number;
}

const SectorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schoolStats, setSchoolStats] = useState<SchoolStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is a sector admin
    if (user && user.role !== 'sectoradmin') {
      navigate('/');
      return;
    }

    // Fetch sector statistics
    // In a real application, this would be an API call
    setTimeout(() => {
      const mockSchoolStats = [
        { id: "1", name: "Məktəb 1", studentsCount: 450, teachersCount: 35, completionRate: 85 },
        { id: "2", name: "Məktəb 2", studentsCount: 320, teachersCount: 28, completionRate: 78 },
        { id: "3", name: "Məktəb 3", studentsCount: 510, teachersCount: 42, completionRate: 92 },
      ];
      setSchoolStats(mockSchoolStats);
      setLoading(false);
    }, 1000);
  }, [user, navigate]);

  const totalStudents = schoolStats.reduce((acc, school) => acc + school.studentsCount, 0);
  const totalTeachers = schoolStats.reduce((acc, school) => acc + school.teachersCount, 0);
  const averageCompletionRate = schoolStats.length 
    ? schoolStats.reduce((acc, school) => acc + school.completionRate, 0) / schoolStats.length 
    : 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">Sektor İdarəetmə Paneli</h1>
              </div>
              {user && (
                <div className="text-sm text-muted-foreground">
                  {user.name} | Sektor Admin
                </div>
              )}
            </div>
          </header>

          <main className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ümumi Tələbələr
                  </CardTitle>
                  <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    Tabe olan məktəblərdə tələbələr
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ümumi Müəllimlər
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTeachers}</div>
                  <p className="text-xs text-muted-foreground">
                    Tabe olan məktəblərdə müəllimlər
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tamamlanma Faizi
                  </CardTitle>
                  <TableIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageCompletionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Ortalama tamamlanma faizi
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Məktəb Statistikaları</CardTitle>
                  <CardDescription>
                    Sektorunuza aid olan məktəblərin cari statistikaları
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <p>Yüklənir...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-3 text-left">Məktəb Adı</th>
                            <th className="py-3 text-left">Tələbə Sayı</th>
                            <th className="py-3 text-left">Müəllim Sayı</th>
                            <th className="py-3 text-left">Tamamlanma Faizi</th>
                            <th className="py-3 text-left"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {schoolStats.map((school) => (
                            <tr key={school.id} className="border-b">
                              <td className="py-3">{school.name}</td>
                              <td className="py-3">{school.studentsCount}</td>
                              <td className="py-3">{school.teachersCount}</td>
                              <td className="py-3">{school.completionRate}%</td>
                              <td className="py-3">
                                <Button variant="ghost" size="sm" onClick={() => navigate(`/sector-tables?schoolId=${school.id}`)}>
                                  <ArrowUpRight className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SectorDashboard;
