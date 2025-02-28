
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

interface SchoolData {
  id: string;
  name: string;
}

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

interface TableData {
  schoolId: string;
  categoryId: string;
  columnId: number;
  value: string;
}

const SectorTables = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSchoolId = searchParams.get('schoolId') || "";
  
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<string>(initialSchoolId);
  const [editingCells, setEditingCells] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // Check if user is a sector admin
    if (user && user.role !== 'sectoradmin') {
      navigate('/');
      return;
    }

    // Fetch schools, categories, and data
    // In a real application, these would be API calls
    setTimeout(() => {
      const mockSchools = [
        { id: "1", name: "Məktəb 1" },
        { id: "2", name: "Məktəb 2" },
        { id: "3", name: "Məktəb 3" },
      ];
      
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
      
      const mockTableData = [
        { schoolId: "1", categoryId: "1", columnId: 1, value: "Bakı şəh., Yasamal r." },
        { schoolId: "1", categoryId: "1", columnId: 2, value: "Əliyev Məmməd" },
        { schoolId: "1", categoryId: "1", columnId: 3, value: "055-555-55-55" },
        { schoolId: "1", categoryId: "2", columnId: 4, value: "450" },
        { schoolId: "1", categoryId: "2", columnId: 5, value: "35" },
        { schoolId: "1", categoryId: "2", columnId: 6, value: "78.5" },
        { schoolId: "1", categoryId: "3", columnId: 7, value: "25" },
        { schoolId: "1", categoryId: "3", columnId: 8, value: "3" },
        { schoolId: "1", categoryId: "3", columnId: 9, value: "Var" },
        
        { schoolId: "2", categoryId: "1", columnId: 1, value: "Bakı şəh., Nizami r." },
        { schoolId: "2", categoryId: "1", columnId: 2, value: "Qasımova Aynur" },
        { schoolId: "2", categoryId: "1", columnId: 3, value: "050-123-45-67" },
        { schoolId: "2", categoryId: "2", columnId: 4, value: "320" },
        { schoolId: "2", categoryId: "2", columnId: 5, value: "28" },
        { schoolId: "2", categoryId: "2", columnId: 6, value: "81.2" },
        { schoolId: "2", categoryId: "3", columnId: 7, value: "18" },
        { schoolId: "2", categoryId: "3", columnId: 8, value: "2" },
        { schoolId: "2", categoryId: "3", columnId: 9, value: "Var" },
        
        { schoolId: "3", categoryId: "1", columnId: 1, value: "Bakı şəh., Nərimanov r." },
        { schoolId: "3", categoryId: "1", columnId: 2, value: "Hüseynov Elşad" },
        { schoolId: "3", categoryId: "1", columnId: 3, value: "077-987-65-43" },
        { schoolId: "3", categoryId: "2", columnId: 4, value: "510" },
        { schoolId: "3", categoryId: "2", columnId: 5, value: "42" },
        { schoolId: "3", categoryId: "2", columnId: 6, value: "76.8" },
        { schoolId: "3", categoryId: "3", columnId: 7, value: "30" },
        { schoolId: "3", categoryId: "3", columnId: 8, value: "4" },
        { schoolId: "3", categoryId: "3", columnId: 9, value: "Yoxdur" },
      ];
      
      setSchools(mockSchools);
      setCategories(mockCategories);
      setTableData(mockTableData);
      
      if (initialSchoolId && !selectedSchool) {
        setSelectedSchool(initialSchoolId);
      }
      
      setLoading(false);
    }, 1000);
  }, [user, navigate, initialSchoolId, selectedSchool]);

  const getCellValue = (schoolId: string, categoryId: string, columnId: number): string => {
    const cell = tableData.find(
      item => item.schoolId === schoolId && item.categoryId === categoryId && item.columnId === columnId
    );
    return cell ? cell.value : "";
  };

  const handleCellChange = (schoolId: string, categoryId: string, columnId: number, value: string) => {
    setTableData(prev => {
      const newData = [...prev];
      const index = newData.findIndex(
        item => item.schoolId === schoolId && item.categoryId === categoryId && item.columnId === columnId
      );
      
      if (index >= 0) {
        newData[index] = { ...newData[index], value };
      } else {
        newData.push({ schoolId, categoryId, columnId, value });
      }
      
      return newData;
    });
  };

  const toggleEditCell = (cellId: string) => {
    setEditingCells(prev => ({
      ...prev,
      [cellId]: !prev[cellId]
    }));
  };

  const handleSaveCell = (schoolId: string, categoryId: string, columnId: number, cellId: string) => {
    toggleEditCell(cellId);
    toast.success("Məlumat uğurla yeniləndi");
  };

  const filteredCategories = categories.filter(category => 
    category.regionId === user?.regionId || category.sectorId === user?.sectorId
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">Cədvəllər</h1>
              </div>
            </div>
          </header>

          <main className="p-6">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="max-w-sm">
                  <Label htmlFor="school-select">Məktəb Seçin</Label>
                  <Select
                    value={selectedSchool}
                    onValueChange={setSelectedSchool}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Məktəb seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map(school => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
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
            ) : selectedSchool ? (
              <div className="space-y-6">
                {filteredCategories.map(category => (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle>{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              {category.columns.map(column => (
                                <th key={column.id} className="py-3 text-left">{column.name}</th>
                              ))}
                              <th className="py-3 text-left">Əməliyyatlar</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              {category.columns.map(column => {
                                const cellId = `${selectedSchool}-${category.id}-${column.id}`;
                                const cellValue = getCellValue(selectedSchool, category.id, column.id);
                                return (
                                  <td key={column.id} className="py-3">
                                    {editingCells[cellId] ? (
                                      <Input
                                        value={cellValue}
                                        onChange={(e) => handleCellChange(selectedSchool, category.id, column.id, e.target.value)}
                                        className="max-w-[180px]"
                                      />
                                    ) : (
                                      <span>{cellValue}</span>
                                    )}
                                  </td>
                                );
                              })}
                              <td className="py-3">
                                <div className="flex gap-2">
                                  {category.columns.some(col => {
                                    const cellId = `${selectedSchool}-${category.id}-${col.id}`;
                                    return editingCells[cellId];
                                  }) ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        category.columns.forEach(col => {
                                          const cellId = `${selectedSchool}-${category.id}-${col.id}`;
                                          if (editingCells[cellId]) {
                                            handleSaveCell(selectedSchool, category.id, col.id, cellId);
                                          }
                                        });
                                      }}
                                    >
                                      <Save className="h-4 w-4 mr-1" />
                                      Yadda saxla
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        category.columns.forEach(col => {
                                          const cellId = `${selectedSchool}-${category.id}-${col.id}`;
                                          toggleEditCell(cellId);
                                        });
                                      }}
                                    >
                                      <Edit2 className="h-4 w-4 mr-1" />
                                      Redaktə et
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">Məlumatları görmək üçün bir məktəb seçin</p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SectorTables;
