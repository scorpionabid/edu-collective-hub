
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Table as TableIcon, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
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
  columns: Column[];
}

const Tables = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deletingColumn, setDeletingColumn] = useState<Column | null>(null);

  const handleAddCategory = (name: string) => {
    setCategories([
      ...categories,
      { id: Date.now(), name, columns: [] }
    ]);
    toast.success("Category added successfully");
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
      toast.success("Column added successfully");
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory) {
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? editingCategory : cat
      ));
      setEditingCategory(null);
      toast.success("Category updated successfully");
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
      toast.success("Column updated successfully");
    }
  };

  const handleDeleteCategory = () => {
    if (deletingCategory) {
      setCategories(categories.filter(cat => cat.id !== deletingCategory.id));
      setDeletingCategory(null);
      toast.success("Category deleted successfully");
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
      toast.success("Column deleted successfully");
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
                <h1 className="text-xl font-semibold">Tables</h1>
              </div>
            </div>
          </header>
          <main className="p-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Categories</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Category
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
                        <TableHead>Category Name</TableHead>
                        <TableHead>Columns</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>{category.columns.length} columns</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedCategory(category)}
                                  >
                                    <TableIcon className="w-4 h-4 mr-2" />
                                    Manage Columns
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

export default Tables;
