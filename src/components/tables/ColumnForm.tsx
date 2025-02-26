
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

interface Column {
  name: string;
  type: string;
  options?: string[];
}

interface ColumnFormProps {
  onSubmit: (column: Column) => void;
  editingColumn?: Column | null;
}

export const ColumnForm = ({ onSubmit, editingColumn }: ColumnFormProps) => {
  const [column, setColumn] = useState<Column>({ name: "", type: "text" });
  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    if (editingColumn) {
      setColumn(editingColumn);
    }
  }, [editingColumn]);

  const handleSubmit = () => {
    if (column.name.trim()) {
      onSubmit(column);
      setColumn({ name: "", type: "text", options: [] });
      setNewOption("");
    }
  };

  const addOption = () => {
    if (newOption.trim() && column.type === "select") {
      setColumn({
        ...column,
        options: [...(column.options || []), newOption.trim()]
      });
      setNewOption("");
    }
  };

  const removeOption = (optionToRemove: string) => {
    setColumn({
      ...column,
      options: column.options?.filter(option => option !== optionToRemove)
    });
  };

  const handleTypeChange = (type: string) => {
    setColumn({
      ...column,
      type,
      options: type === "select" ? [] : undefined
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="column-name">Sütun adı</Label>
          <Input
            id="column-name"
            value={column.name}
            onChange={(e) => setColumn({ ...column, name: e.target.value })}
            placeholder="Sütun adını daxil edin"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="column-type">Sütun tipi</Label>
          <select
            id="column-type"
            className="w-full border rounded-md p-2"
            value={column.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            disabled={!!editingColumn}
          >
            <option value="text">Mətn</option>
            <option value="number">Rəqəm</option>
            <option value="date">Tarix</option>
            <option value="select">Seçim</option>
          </select>
        </div>
      </div>

      {column.type === "select" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Seçimlər</Label>
            <div className="flex gap-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Yeni seçim daxil edin"
              />
              <Button
                type="button"
                onClick={addOption}
                disabled={!newOption.trim()}
              >
                <PlusCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {column.options && column.options.length > 0 && (
            <div className="space-y-2">
              <Label>Mövcud seçimlər</Label>
              <div className="flex flex-wrap gap-2">
                {column.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full"
                  >
                    <span>{option}</span>
                    <button
                      type="button"
                      onClick={() => removeOption(option)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Button onClick={handleSubmit} className="w-full">
        {editingColumn ? "Sütunu yenilə" : "Sütun əlavə et"}
      </Button>
    </div>
  );
};
