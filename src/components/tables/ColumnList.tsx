
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ColumnForm } from "./ColumnForm";

interface Column {
  id: number;
  name: string;
  type: string;
  options?: string[];
}

interface ColumnListProps {
  columns: Column[];
  editingColumn: Column | null;
  onEditColumn: (column: Column | null) => void;
  onUpdateColumn: () => void;
  onDeleteColumn: () => void;
  setDeletingColumn: (column: Column | null) => void;
  setEditingColumn: (column: Column | null) => void;
}

export const ColumnList = ({
  columns,
  editingColumn,
  onEditColumn,
  onUpdateColumn,
  onDeleteColumn,
  setDeletingColumn,
  setEditingColumn,
}: ColumnListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sütun adı</TableHead>
          <TableHead>Tip</TableHead>
          <TableHead>Seçimlər</TableHead>
          <TableHead>Əməliyyatlar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {columns.map((column) => (
          <TableRow key={column.id}>
            <TableCell>{column.name}</TableCell>
            <TableCell>{column.type}</TableCell>
            <TableCell>
              {column.type === 'select' && column.options && (
                <div className="flex flex-wrap gap-1">
                  {column.options.map((option, index) => (
                    <span key={index} className="bg-secondary px-2 py-1 rounded-full text-xs">
                      {option}
                    </span>
                  ))}
                </div>
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditColumn(column)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sütunu düzəlt</DialogTitle>
                    </DialogHeader>
                    <ColumnForm
                      onSubmit={() => onUpdateColumn()}
                      editingColumn={column}
                    />
                  </DialogContent>
                </Dialog>
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
                      <DialogTitle>Sütunu sil</DialogTitle>
                      <DialogDescription>
                        Bu sütunu silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setDeletingColumn(null)}
                      >
                        Ləğv et
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={onDeleteColumn}
                      >
                        Sil
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
  );
};
