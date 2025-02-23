
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Table as TableIcon } from "lucide-react";
import { useState } from "react";

interface Category {
  id: number;
  name: string;
  columns: Column[];
}

interface Column {
  id: number;
  name: string;
  type: string;
}

const Tables = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newColumn, setNewColumn] = useState({ name: "", type: "text" });

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories([
        ...categories,
        { id: Date.now(), name: newCategory, columns: [] }
      ]);
      setNewCategory("");
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
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {category.columns.map((column) => (
                                        <TableRow key={column.id}>
                                          <TableCell>{column.name}</TableCell>
                                          <TableCell>{column.type}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </DialogContent>
                            </Dialog>
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
