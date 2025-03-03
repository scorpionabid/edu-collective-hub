
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
import { Download, Filter } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { utils, writeFileXLSX } from "xlsx";
import { Column, Category } from "@/lib/api/types";

const Reports = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [sectorFilter, setSectorFilter] = useState<string>("");
  const [regions, setRegions] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const data = await api.regions.getAll();
        setRegions(data);
      } catch (error) {
        console.error("Error loading regions:", error);
      }
    };

    const loadSectors = async () => {
      try {
        const data = await api.sectors.getAll();
        setSectors(data);
      } catch (error) {
        console.error("Error loading sectors:", error);
      }
    };

    loadRegions();
    loadSectors();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const categoriesData = await api.categories.getAll();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

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
          const validColumns = Array.isArray(categoryDetails.columns) 
            ? categoryDetails.columns.filter(col => col && typeof col === 'object' && 'id' in col)
            : [];
            
          setColumns(validColumns as Column[]);
          
          const formData = await api.formData.getAll();
          
          let filteredData = formData.filter((item: any) => item.categoryId === selectedCategory);
          
          // Apply region and sector filters if provided
          if (regionFilter) {
            filteredData = filteredData.filter((item: any) => {
              const school = item.school || {};
              const sector = school.sector || {};
              return sector.regionId === regionFilter;
            });
          }
          
          if (sectorFilter) {
            filteredData = filteredData.filter((item: any) => {
              const school = item.school || {};
              return school.sectorId === sectorFilter;
            });
          }
          
          const categoryData = filteredData.map((item: any) => ({
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
  }, [selectedCategory, regionFilter, sectorFilter]);

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
                <h1 className="text-xl font-semibold">Reports</h1>
              </div>
            </div>
          </header>
          <main className="p-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Report Builder</CardTitle>
                <Button 
                  onClick={handleExportToExcel} 
                  disabled={data.length === 0 || isLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export to Excel
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
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
                  
                  <div className="space-y-2">
                    <Label>Region Filter</Label>
                    <Select
                      value={regionFilter}
                      onValueChange={setRegionFilter}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Regions</SelectItem>
                        {regions.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Sector Filter</Label>
                    <Select
                      value={sectorFilter}
                      onValueChange={setSectorFilter}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Sectors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Sectors</SelectItem>
                        {sectors
                          .filter(sector => !regionFilter || sector.regionId === regionFilter)
                          .map((sector) => (
                            <SelectItem key={sector.id} value={sector.id}>
                              {sector.name}
                            </SelectItem>
                          ))
                        }
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
                    sortConfig={sortConfig}
                    onSortChange={(columnName) =>
                      setSortConfig((prev) => ({
                        key: columnName,
                        direction:
                          prev?.key === columnName && prev.direction === "asc"
                            ? "desc"
                            : "asc",
                      }))
                    }
                    onFilterChange={(columnName, value) =>
                      setFilters((prev) => ({ ...prev, [columnName]: value }))
                    }
                  />
                )}

                {!isLoading && selectedCategory && columns.length === 0 && (
                  <div className="text-center py-8">
                    No columns defined for this category
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

export default Reports;
