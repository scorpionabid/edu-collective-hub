
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Table as TableIcon, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CategoryForm } from "@/components/tables/CategoryForm";
import { ColumnForm } from "@/components/tables/ColumnForm";
import { ColumnList } from "@/components/tables/ColumnList";

interface Column {
  id: number;
  name: string;
  type: string;
}

interface Category {
  id: number;
  name: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  columns: Column[];
}

const RegionTables = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deletingColumn, setDeletingColumn] = useState<Column | null>(null);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  // Load categories from localStorage on mount
  useEffect(() => {
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    }
  }, []);

  // Save categories to localStorage when they change
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  // Filter categories based on user role and assigned entities
  useEffect(() => {
    if (!user) {
      setFilteredCategories([]);
      return;
    }

    // For regionadmin, show only categories for their region
    const filtered = categories.filter(category => {
      if (user.role === 'regionadmin' && user.regionId) {
        return category.regionId === user.regionId ||
               !category.regionId && !category.sectorId && !category.schoolId;
      }
      return false;
    });

    setFilteredCategories(filtered);
  }, [categories, user]);

  const handleAddCategory = (data: { 
    name: string; 
    regionId?: string; 
    sectorId?: string; 
    schoolId?: string; 
  }) => {
    const newCategory: Category = {
      id: Date.now(),
      name: data.name,
      regionId: data.regionId || user?.regionId,
      sectorId: data.sectorId,
      schoolId: data.schoolId,
      columns: []
    };
    
    setCategories([...categories, newCategory]);
    toast.success("Kateqoriya uğurla əlavə edildi");
  };

  const handleAddColumn = (column: { name: string; type: string }) => {
    if (selectedCategory) {
      const updatedCategories = categories.map(category => {
        if (category.id === selectedCategory.id) {
          return {
            ...category,
            columns: [
              ...category.columns,
              { id: Date.now(), ...column }
            ]
          };
        }
        return category;
      });
      setCategories(updatedCategories);
      toast.success("Sütun uğurla əlavə edildi");
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory) {
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? editingCategory : cat
      ));
      setEditingCategory(null);
      toast.success("Kateqoriya uğurla yeniləndi");
    }
  };

  const handleUpdateColumn = () => {
    if (selectedCategory && editingColumn) {
      const updatedCategories = categories.map(category => {
        if (category.id === selectedCategory.id) {
          return {
            ...category,
            columns: category.columns.map(col => 
              col.id === editingColumn.id ? editingColumn : col
            )
          };
        }
        return category;
      });
      setCategories(updatedCategories);
      setEditingColumn(null);
      toast.success("Sütun uğurla yeniləndi");
    }
  };

  const handleDeleteCategory = () => {
    if (deletingCategory) {
      setCategories(categories.filter(cat => cat.id !== deletingCategory.id));
      setDeletingCategory(null);
      toast.success("Kateqoriya uğurla silindi");
    }
  };

  const handleDeleteColumn = () => {
    if (selectedCategory && deletingColumn) {
      const updatedCategories = categories.map(category => {
        if (category.id === selectedCategory.id) {
          return {
            ...category,
            columns: category.columns.filter(col => col.id !== deletingColumn.id)
          };
        }
        return category;
      });
      setCategories(updatedCategories);
      setDeletingColumn(null);
      toast.success("Sütun uğurla silindi");
    }
  };

  // Helper function to get visibility text
  const getCategoryVisibilityText = (category: Category) => {
    if (category.schoolId) {
      return "Məktəb səviyyəsi";
    } else if (category.sectorId) {
      return "Sektor səviyyəsi";
    } else if (category.regionId) {
      return "Region səviyyəsi";
    } else {
      return "Bütün səviyyələr";
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
                <h1 className="text-xl font-semibold">Region Tables</h1>
              </div>
            </div>
          </header>
          <main className="p-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Kateqoriyalar</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Kateqoriya əlavə et
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <CategoryForm onSubmit={handleAddCategory} />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kateqoriya adı</TableHead>
                        <TableHead>Görünürlük</TableHead>
                        <TableHead>Sütunlar</TableHead>
                        <TableHead>Əməliyyatlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>{getCategoryVisibilityText(category)}</TableCell>
                          <TableCell>{category.columns.length} sütun</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedCategory(category)}
                                  >
                                    <TableIcon className="w-4 h-4 mr-2" />
                                    Sütunları idarə et
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <div className="space-y-4">
                                    <ColumnForm onSubmit={handleAddColumn} />
                                    <ColumnList
                                      columns={category.columns}
                                      editingColumn={editingColumn}
                                      onEditColumn={setEditingColumn}
                                      onUpdateColumn={handleUpdateColumn}
                                      onDeleteColumn={handleDeleteColumn}
                                      setDeletingColumn={setDeletingColumn}
                                      setEditingColumn={setEditingColumn}
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RegionTables;
