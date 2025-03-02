
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
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface Column {
  id: string;
  name: string;
  type: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  columns: Column[];
}

const SectorReports = () => {
  const { user } = useAuth();
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [columns, setColumns] = useState<Column[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Fetch schools for current sector
  const { data: schools = [] } = useQuery({
    queryKey: ['schools', user?.sectorId],
    queryFn: () => user?.sectorId ? api.schools.getAll(user.sectorId) : [],
    enabled: !!user?.sectorId,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.getAll(),
  });

  // Fetch form data for selected school and category
  const { data: formData = [], refetch: refetchFormData } = useQuery({
    queryKey: ['formData', selectedSchool, selectedCategory],
    queryFn: () => selectedSchool ? api.formData.getAll(selectedSchool) : [],
    enabled: !!selectedSchool,
  });

  useEffect(() => {
    if (selectedCategory) {
      // Fetch category details to get columns
      api.categories.getById(selectedCategory)
        .then(category => {
          if (category && category.columns) {
            setColumns(category.columns);
          }
        })
        .catch(error => {
          console.error('Error fetching category columns:', error);
          toast.error('Failed to load category columns');
        });
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (formData.length > 0 && columns.length > 0) {
      setData(formData);
    }
  }, [formData, columns]);

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

    // Apply filters
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        result = result.filter((item) => {
          const value = item.data ? item.data[key] : item[key];
          return String(value)
            .toLowerCase()
            .includes(filters[key].toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a.data ? a.data[sortConfig.key] : a[sortConfig.key];
        const bValue = b.data ? b.data[sortConfig.key] : b[sortConfig.key];
        
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
    const exportData = filteredAndSortedData().map(item => {
      // Flatten the data structure for Excel
      const flatItem: Record<string, any> = {};
      columns.forEach(column => {
        flatItem[column.name] = item.data[column.name] || '';
      });
      return flatItem;
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "report.xlsx");
    
    toast.success('Report exported successfully');
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
                <h1 className="text-xl font-semibold">Sektor Hesabatları</h1>
              </div>
            </div>
          </header>
          <main className="p-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Hesabat Yaradıcısı</CardTitle>
                <Button onClick={handleExportToExcel} disabled={data.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Excel-ə çıxar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label>Məktəb</Label>
                    <Select
                      value={selectedSchool}
                      onValueChange={setSelectedSchool}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Məktəb seç" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
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
                      disabled={!selectedSchool}
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

                {selectedCategory && columns.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((column) => (
                          <TableHead key={column.id}>
                            <div className="flex items-center gap-2">
                              {column.name}
                              <div className="flex flex-col">
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
                              </div>
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
                      {filteredAndSortedData().length > 0 ? (
                        filteredAndSortedData().map((row, index) => (
                          <TableRow key={index}>
                            {columns.map((column) => (
                              <TableCell key={column.id}>
                                {row.data && row.data[column.name] ? row.data[column.name] : ''}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={columns.length} className="text-center py-4">
                            Məlumat yoxdur
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
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
