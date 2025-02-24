
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

interface Column {
  id: number;
  name: string;
  type: string;
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
          <TableHead>Column Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {columns.map((column) => (
          <TableRow key={column.id}>
            <TableCell>
              {editingColumn?.id === column.id ? (
                <Input
                  value={editingColumn.name}
                  onChange={(e) =>
                    setEditingColumn({
                      ...editingColumn,
                      name: e.target.value,
                    })
                  }
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
                  onChange={(e) =>
                    setEditingColumn({
                      ...editingColumn,
                      type: e.target.value,
                    })
                  }
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
                  <Button onClick={onUpdateColumn}>Save</Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditColumn(column)}
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
                        onClick={onDeleteColumn}
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
  );
};
