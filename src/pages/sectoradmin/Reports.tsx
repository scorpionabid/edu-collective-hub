
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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, SortAsc, SortDesc, Download } from "lucide-react";
import { useState, useEffect } from "react";

interface School {
  id: number;
  name: string;
  sectorId: number;
}

interface Column {
  id: number;
  name: string;
  type: string;
}

interface Category {
  id: number;
  name: string;
  columns: Column[];
}

const SectorReports = () => {
  const { user } = useAuth();
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [schools, setSchools] = useState<School[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Simulated data - replace with actual API calls
  useEffect(() => {
    // Load data from localStorage
    const storedSchools = localStorage.getItem('schools');
    if (storedSchools) {
      setSchools(JSON.parse(storedSchools));
    }

    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    }
  }, []);

  // Filter schools for the current sector admin
  useEffect(() => {
    if (user?.sectorId) {
      const filtered = schools.filter(
        (school) => school.sectorId === Number(user.sectorId)
      );
      setSchools(filtered);
    }
  }, [user, schools]);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find((cat) => cat.id === Number(selectedCategory));
      if (category) {
        setColumns(category.columns);
      }
    }
  }, [selectedCategory, categories]);

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
        result = result.filter((item) =>
          String(item[key])
            .toLowerCase()
            .includes(filters[key].toLowerCase())
        );
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  };

  const handleExportToExcel = () => {
    // Implementation for Excel export
    console.log("Exporting to Excel...");
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
                <Button onClick={handleExportToExcel}>
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
                          <SelectItem key={school.id} value={String(school.id)}>
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
                          <SelectItem key={category.id} value={String(category.id)}>
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
                      {filteredAndSortedData().map((row, index) => (
                        <TableRow key={index}>
                          {columns.map((column) => (
                            <TableCell key={column.id}>{row[column.name]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
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
