
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Users, Table as TableIcon, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface SectorStat {
  id: string;
  name: string;
  schoolsCount: number;
  adminsCount: number;
  completionRate: number;
}

const RegionDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sectorStats, setSectorStats] = useState<SectorStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is a region admin
    if (user && user.role !== 'regionadmin') {
      navigate('/');
      return;
    }

    // Fetch region statistics
    // In a real application, this would be an API call
    setTimeout(() => {
      const mockSectorStats = [
        { id: "1", name: "Sektor 1", schoolsCount: 45, adminsCount: 3, completionRate: 85 },
        { id: "2", name: "Sektor 2", schoolsCount: 32, adminsCount: 2, completionRate: 78 },
        { id: "3", name: "Sektor 3", schoolsCount: 51, adminsCount: 4, completionRate: 92 },
      ];
      setSectorStats(mockSectorStats);
      setLoading(false);
    }, 1000);
  }, [user, navigate]);

  const totalSchools = sectorStats.reduce((acc, sector) => acc + sector.schoolsCount, 0);
  const totalAdmins = sectorStats.reduce((acc, sector) => acc + sector.adminsCount, 0);
  const averageCompletionRate = sectorStats.length 
    ? sectorStats.reduce((acc, sector) => acc + sector.completionRate, 0) / sectorStats.length 
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
                <h1 className="text-xl font-semibold">Region İdarəetmə Paneli</h1>
              </div>
              {user && (
                <div className="text-sm text-muted-foreground">
                  {user.name} | Region Admin
                </div>
              )}
            </div>
          </header>

          <main className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ümumi Məktəblər
                  </CardTitle>
                  <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSchools}</div>
                  <p className="text-xs text-muted-foreground">
                    Region üzrə ümumi məktəblər
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tabe Admin Sayı
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalAdmins}</div>
                  <p className="text-xs text-muted-foreground">
                    Sektor adminləri
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tamamlanma Faizi
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageCompletionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Ortalama hesabat tamamlanma faizi
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sektor Statistikaları</CardTitle>
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
                            <th className="py-3 text-left">Sektor Adı</th>
                            <th className="py-3 text-left">Məktəb Sayı</th>
                            <th className="py-3 text-left">Admin Sayı</th>
                            <th className="py-3 text-left">Tamamlanma Faizi</th>
                            <th className="py-3 text-left"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {sectorStats.map((sector) => (
                            <tr key={sector.id} className="border-b">
                              <td className="py-3">{sector.name}</td>
                              <td className="py-3">{sector.schoolsCount}</td>
                              <td className="py-3">{sector.adminsCount}</td>
                              <td className="py-3">{sector.completionRate}%</td>
                              <td className="py-3">
                                <Button variant="ghost" size="sm" onClick={() => navigate(`/region-sectors?sectorId=${sector.id}`)}>
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
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RegionDashboard;
