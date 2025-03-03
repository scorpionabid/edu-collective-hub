
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, TableIcon } from "lucide-react";
import { CategoryForm } from "@/components/tables/CategoryForm";
import { ColumnForm } from "@/components/tables/ColumnForm";
import { ColumnList } from "@/components/tables/ColumnList";
import { Category, Column } from "@/hooks/useTableManagement";

interface CategoryListProps {
  categories: Category[];
  selectedCategory: Category | null;
  editingColumn: Column | null;
  deletingColumn: Column | null;
  onSelectCategory: (category: Category) => void;
  onAddCategory: (data: { name: string; regionId?: string; sectorId?: string; schoolId?: string }) => void;
  onAddColumn: (column: { name: string; type: string }) => void;
  onUpdateColumn: () => void;
  onDeleteColumn: () => void;
  getCategoryVisibilityText: (category: Category) => string;
  setEditingColumn: (column: Column | null) => void;
  setDeletingColumn: (column: Column | null) => void;
}

export const CategoryList = ({
  categories,
  selectedCategory,
  editingColumn,
  deletingColumn,
  onSelectCategory,
  onAddCategory,
  onAddColumn,
  onUpdateColumn,
  onDeleteColumn,
  getCategoryVisibilityText,
  setEditingColumn,
  setDeletingColumn
}: CategoryListProps) => {
  return (
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
            <CategoryForm onSubmit={onAddCategory} />
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
            {categories.map((category) => (
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
                          onClick={() => onSelectCategory(category)}
                        >
                          <TableIcon className="w-4 h-4 mr-2" />
                          Sütunları idarə et
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <div className="space-y-4">
                          <ColumnForm onSubmit={onAddColumn} />
                          {selectedCategory && selectedCategory.id === category.id && (
                            <ColumnList
                              columns={category.columns}
                              editingColumn={editingColumn}
                              onEditColumn={setEditingColumn}
                              onUpdateColumn={onUpdateColumn}
                              onDeleteColumn={onDeleteColumn}
                              setDeletingColumn={setDeletingColumn}
                              setEditingColumn={setEditingColumn}
                            />
                          )}
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
  );
};
