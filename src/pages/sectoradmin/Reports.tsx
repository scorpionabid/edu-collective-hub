import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportTable } from "@/components/reports/ReportTable";
import { Download } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { utils, writeFileXLSX } from "xlsx";
import { Column, Category } from "@/lib/api/types";

const SectorReports = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadCategories = async () => {
      if (!user?.sectorId) {
        return;
      }

      try {
        setIsLoading(true);
        const categoriesData = await api.categories.getAll();
        const sectorCategories = categoriesData.filter(
          (cat: Category) => cat.sectorId === user.sectorId
        );
        setCategories(sectorCategories);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [user?.sectorId]);

  useEffect(() => {
    const loadColumnsAndData = async () => {
      if (!selectedCategory) {
        setColumns([]);
        setData([]);
        return;
      }

      try {
        setIsLoading(true);
        
        const categoryDetails = await api.categories.getById(selectedCategory);
        
        if (categoryDetails && categoryDetails.columns) {
          // Ensure we have valid columns
          const validColumns = Array.isArray(categoryDetails.columns) 
            ? categoryDetails.columns.filter(col => col && typeof col === 'object' && 'id' in col)
            : [];
            
          setColumns(validColumns as Column[]);
          
          const formData = await api.formData.getAll();
          
          const categoryData = formData
            .filter((item: any) => item.categoryId === selectedCategory)
            .map((item: any) => ({
              ...item.data,
              id: item.id,
              status: item.status,
              submittedAt: item.submittedAt,
              schoolName: item.schoolName || 'Unknown School'
            }));
            
          setData(categoryData);
        }
      } catch (error) {
        console.error("Error loading columns and data:", error);
        toast.error("Failed to load report data");
      } finally {
        setIsLoading(false);
      }
    };

    loadColumnsAndData();
  }, [selectedCategory]);

  const handleExportToExcel = () => {
    try {
      const filteredData = getFilteredSortedData();
      
      if (filteredData.length === 0) {
        toast.error("No data to export");
        return;
      }
      
      const worksheet = utils.json_to_sheet(filteredData);
      
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Report Data");
      
      const categoryName = categories.find(c => c.id === selectedCategory)?.name || "Report";
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `${categoryName}_${timestamp}.xlsx`;
      
      writeFileXLSX(workbook, fileName);
      
      toast.success("Report exported to Excel");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export data to Excel");
    }
  };

  const getFilteredSortedData = () => {
    let result = [...data];

    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        result = result.filter(item => {
          const itemValue = String(item[key] || '').toLowerCase();
          return itemValue.includes(filters[key].toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = String(a[sortConfig.key] || '');
        const bValue = String(b[sortConfig.key] || '');
        
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
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
                <h1 className="text-xl font-semibold">Sector Hesabatları</h1>
              </div>
            </div>
          </header>
          <main className="p-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Hesabat Yaradıcısı</CardTitle>
                <Button 
                  onClick={handleExportToExcel} 
                  disabled={data.length === 0 || isLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Excel-ə çıxar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label>Kateqoriya</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kateqoriya seç" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isLoading && (
                  <div className="flex justify-center my-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}

                {!isLoading && selectedCategory && columns.length > 0 && (
                  <ReportTable
                    data={getFilteredSortedData()}
                    columns={columns}
                    filters={filters}
                    setFilters={setFilters}
                    sortConfig={sortConfig}
                    setSortConfig={setSortConfig}
                  />
                )}

                {!isLoading && selectedCategory && columns.length === 0 && (
                  <div className="text-center py-8">
                    Bu kateqoriya üçün heç bir sütun müəyyən edilməyib
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SectorReports;
