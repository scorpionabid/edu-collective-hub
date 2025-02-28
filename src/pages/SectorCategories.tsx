
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileDown, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { exportToExcel, convertToExcelData } from "@/utils/excelExport";

interface Category {
  id: string;
  name: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  columns: Column[];
}

interface Column {
  id: number;
  name: string;
  type: string;
}

const SectorCategories = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is a sector admin
    if (user && user.role !== 'sectoradmin') {
      navigate('/');
      return;
    }

    // Fetch categories for this sector
    // In a real application, this would be an API call
    setTimeout(() => {
      const mockCategories = [
        { 
          id: "1", 
          name: "Ümumi Məlumatlar", 
          regionId: "1",
          columns: [
            { id: 1, name: "Ünvan", type: "text" },
            { id: 2, name: "Direktor", type: "text" },
            { id: 3, name: "Telefon", type: "text" },
          ]
        },
        { 
          id: "2", 
          name: "Tədris Göstəriciləri", 
          regionId: "1",
          columns: [
            { id: 4, name: "Tələbə sayı", type: "number" },
            { id: 5, name: "Müəllim sayı", type: "number" },
            { id: 6, name: "Orta bal", type: "number" },
          ]
        },
        { 
          id: "3", 
          name: "İnfrastruktur", 
          sectorId: "1",
          columns: [
            { id: 7, name: "Sinif otaqları", type: "number" },
            { id: 8, name: "Laboratoriyalar", type: "number" },
            { id: 9, name: "İdman zalı", type: "select" },
          ]
        },
      ];
      
      // Filter categories visible to this sector admin (categories for all regions + this sector)
      const filteredCategories = mockCategories.filter(category => 
        category.regionId || category.sectorId === user?.sectorId
      );
      
      setCategories(filteredCategories);
      setLoading(false);
    }, 1000);
  }, [user, navigate]);

  // Export categories to Excel
  const handleExportCategories = () => {
    try {
      const exportData = categories.map(category => ({
        'Kateqoriya': category.name,
        'Sütunlar': category.columns.map(col => col.name).join(", "),
        'Səviyyə': category.sectorId ? 'Sektor' : category.regionId ? 'Region' : 'Ümumi'
      }));
      
      exportToExcel(exportData, "Kateqoriyalar");
      toast.success("Kateqoriyalar uğurla export edildi");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Export zamanı xəta baş verdi");
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
                <h1 className="text-xl font-semibold">Kateqoriyalar</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportCategories}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Export et
                </Button>
              </div>
            </div>
          </header>

          <main className="p-6">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="max-w-sm">
                  <Label htmlFor="category-select">Kateqoriya Seçin</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kateqoriya seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="flex justify-center items-center h-32">
                <p>Yüklənir...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Kateqoriyalar və Sütunlar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kateqoriya</TableHead>
                          <TableHead>Sütunlar</TableHead>
                          <TableHead>Səviyyə</TableHead>
                          <TableHead>Əməliyyatlar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {category.columns.map((column) => (
                                  <span 
                                    key={column.id} 
                                    className="bg-secondary px-2 py-1 rounded-full text-xs"
                                  >
                                    {column.name}
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {category.sectorId ? 'Sektor' : category.regionId ? 'Region' : 'Ümumi'}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/sector-forms?categoryId=${category.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Form Görünüşü
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {selectedCategory && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {categories.find(c => c.id === selectedCategory)?.name} - Sütunlar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sütun adı</TableHead>
                            <TableHead>Tip</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categories
                            .find(c => c.id === selectedCategory)
                            ?.columns.map(column => (
                              <TableRow key={column.id}>
                                <TableCell>{column.name}</TableCell>
                                <TableCell>{column.type}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SectorCategories;
