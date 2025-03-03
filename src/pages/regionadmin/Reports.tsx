import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, SortAsc, SortDesc, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { utils, writeFileXLSX } from "xlsx";
import { Column, Category } from "@/lib/api/types";

const RegionReports = () => {
  const { user } = useAuth();
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sectors, setSectors] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadSectors = async () => {
      try {
        if (user?.regionId) {
          const sectorsData = await api.sectors.getAll();
          const regionSectors = sectorsData.filter(
            sector => sector.region_id === user.regionId
          );
          setSectors(regionSectors);
        }
      } catch (error) {
        console.error("Error loading sectors:", error);
        toast.error("Failed to load sectors");
      }
    };
    
    loadSectors();
  }, [user]);

  useEffect(() => {
    const loadCategories = async () => {
      if (!selectedSector) {
        setCategories([]);
        return;
      }

      try {
        setIsLoading(true);
        const categoriesData = await api.categories.getAll();
        const sectorCategories = categoriesData.filter(
          (cat: Category) => cat.sectorId === selectedSector
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
  }, [selectedSector]);

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

  const handleFilter = (columnName: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnName]: value,
    }));
  };

  const handleSort = (columnName: string) => {
    setSortConfig((prev) => ({
      key: columnName,
      direction:
        prev?.key === columnName && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredAndSortedData = () => {
    let result = [...data];

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        result = result.filter((item) =>
          String(item[key])
            .toLowerCase()
            .includes(filters[key].toLowerCase())
        );
      }
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
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

  const handleExportToExcel = () => {
    try {
      const filteredData = filteredAndSortedData();
      
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">Region Hesabatları</h1>
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
                    <Label>Sektor</Label>
                    <Select
                      value={selectedSector}
                      onValueChange={setSelectedSector}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sektor seç" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map((sector) => (
                          <SelectItem key={sector.id} value={sector.id}>
                            {sector.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Kateqoriya</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                      disabled={!selectedSector || isLoading}
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
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Məktəb</TableHead>
                          <TableHead>Status</TableHead>
                          {columns.map((column) => (
                            <TableHead key={column.id}>
                              <div className="flex items-center gap-2">
                                {column.name}
                                <button
                                  onClick={() => handleSort(column.name)}
                                  className="hover:text-primary"
                                >
                                  {sortConfig?.key === column.name ? (
                                    sortConfig.direction === "asc" ? (
                                      <SortAsc className="w-4 h-4" />
                                    ) : (
                                      <SortDesc className="w-4 h-4" />
                                    )
                                  ) : (
                                    <Filter className="w-4 h-4" />
                                  )}
                                </button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Filter className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <div className="p-2">
                                      <Input
                                        placeholder="Filtr..."
                                        value={filters[column.name] || ""}
                                        onChange={(e) =>
                                          handleFilter(column.name, e.target.value)
                                        }
                                      />
                                    </div>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedData().length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={columns.length + 2}
                              className="text-center py-8"
                            >
                              Məlumat yoxdur
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAndSortedData().map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>{row.schoolName}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  row.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  row.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                  row.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {row.status === 'approved' ? 'Təsdiqlənib' :
                                   row.status === 'submitted' ? 'Göndərilib' :
                                   row.status === 'rejected' ? 'Rədd edilib' :
                                   'Qaralama'}
                                </span>
                              </TableCell>
                              {columns.map((column) => (
                                <TableCell key={column.id}>{row[column.name]}</TableCell>
                              ))}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
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

export default RegionReports;
