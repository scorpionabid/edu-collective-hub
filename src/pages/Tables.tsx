
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle, Table as TableIcon, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newColumn, setNewColumn] = useState({ name: "", type: "text" });
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deletingColumn, setDeletingColumn] = useState<Column | null>(null);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories([
        ...categories,
        { id: Date.now(), name: newCategory, columns: [] }
      ]);
      setNewCategory("");
      toast.success("Category added successfully");
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory && editingCategory.name.trim()) {
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? editingCategory : cat
      ));
      setEditingCategory(null);
      toast.success("Category updated successfully");
    }
  };

  const handleDeleteCategory = () => {
    if (deletingCategory) {
      setCategories(categories.filter(cat => cat.id !== deletingCategory.id));
      setDeletingCategory(null);
      toast.success("Category deleted successfully");
    }
  };

  const handleAddColumn = () => {
    if (selectedCategory && newColumn.name.trim()) {
      const updatedCategories = categories.map(category => {
        if (category.id === selectedCategory.id) {
          return {
            ...category,
            columns: [
              ...category.columns,
              { id: Date.now(), name: newColumn.name, type: newColumn.type }
            ]
          };
        }
        return category;
      });
      setCategories(updatedCategories);
      setNewColumn({ name: "", type: "text" });
      toast.success("Column added successfully");
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
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="category-name">Category Name</Label>
                          <Input
                            id="category-name"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Enter category name"
                          />
                        </div>
                        <Button onClick={handleAddCategory}>Add Category</Button>
                      </div>
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
                                  <DialogHeader>
                                    <DialogTitle>Manage Columns for {category.name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid gap-4 grid-cols-2">
                                      <div className="space-y-2">
                                        <Label htmlFor="column-name">Column Name</Label>
                                        <Input
                                          id="column-name"
                                          value={newColumn.name}
                                          onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                                          placeholder="Enter column name"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="column-type">Column Type</Label>
                                        <select
                                          id="column-type"
                                          className="w-full border rounded-md p-2"
                                          value={newColumn.type}
                                          onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
                                        >
                                          <option value="text">Text</option>
                                          <option value="number">Number</option>
                                          <option value="date">Date</option>
                                          <option value="select">Select</option>
                                        </select>
                                      </div>
                                    </div>
                                    <Button onClick={handleAddColumn}>Add Column</Button>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Column Name</TableHead>
                                          <TableHead>Type</TableHead>
                                          <TableHead>Actions</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {category.columns.map((column) => (
                                          <TableRow key={column.id}>
                                            <TableCell>
                                              {editingColumn?.id === column.id ? (
                                                <Input
                                                  value={editingColumn.name}
                                                  onChange={(e) => setEditingColumn({
                                                    ...editingColumn,
                                                    name: e.target.value
                                                  })}
                                                />
                                              ) : (
                                                column.name
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              {editingColumn?.id === column.id ? (
                                                <select
                                                  className="w-full border rounded-md p-2"
                                                  value={editingColumn.type}
                                                  onChange={(e) => setEditingColumn({
                                                    ...editingColumn,
                                                    type: e.target.value
                                                  })}
                                                >
                                                  <option value="text">Text</option>
                                                  <option value="number">Number</option>
                                                  <option value="date">Date</option>
                                                  <option value="select">Select</option>
                                                </select>
                                              ) : (
                                                column.type
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex gap-2">
                                                {editingColumn?.id === column.id ? (
                                                  <Button onClick={handleUpdateColumn}>
                                                    Save
                                                  </Button>
                                                ) : (
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingColumn(column)}
                                                  >
                                                    <Pencil className="w-4 h-4" />
                                                  </Button>
                                                )}
                                                <Dialog>
                                                  <DialogTrigger asChild>
                                                    <Button
                                                      variant="destructive"
                                                      size="sm"
                                                      onClick={() => setDeletingColumn(column)}
                                                    >
                                                      <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                  </DialogTrigger>
                                                  <DialogContent>
                                                    <DialogHeader>
                                                      <DialogTitle>Delete Column</DialogTitle>
                                                      <DialogDescription>
                                                        Are you sure you want to delete this column? This action cannot be undone.
                                                      </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="flex justify-end gap-2">
                                                      <Button
                                                        variant="outline"
                                                        onClick={() => setDeletingColumn(null)}
                                                      >
                                                        Cancel
                                                      </Button>
                                                      <Button
                                                        variant="destructive"
                                                        onClick={handleDeleteColumn}
                                                      >
                                                        Delete
                                                      </Button>
                                                    </div>
                                                  </DialogContent>
                                                </Dialog>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingCategory(category)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Category</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-category-name">Category Name</Label>
                                      <Input
                                        id="edit-category-name"
                                        value={editingCategory?.name || ""}
                                        onChange={(e) => setEditingCategory(editingCategory ? {
                                          ...editingCategory,
                                          name: e.target.value
                                        } : null)}
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => setEditingCategory(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button onClick={handleUpdateCategory}>
                                        Save Changes
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setDeletingCategory(category)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Category</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete this category? This will also delete all columns associated with it. This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setDeletingCategory(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={handleDeleteCategory}
                                    >
                                      Delete
                                    </Button>
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
