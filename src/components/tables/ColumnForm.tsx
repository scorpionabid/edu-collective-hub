
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface Column {
  name: string;
  type: string;
}

interface ColumnFormProps {
  onSubmit: (column: Column) => void;
}

export const ColumnForm = ({ onSubmit }: ColumnFormProps) => {
  const [column, setColumn] = useState<Column>({ name: "", type: "text" });

  const handleSubmit = () => {
    if (column.name.trim()) {
      onSubmit(column);
      setColumn({ name: "", type: "text" });
    }
  };

  return (
    <div className="grid gap-4 grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="column-name">Column Name</Label>
        <Input
          id="column-name"
          value={column.name}
          onChange={(e) => setColumn({ ...column, name: e.target.value })}
          placeholder="Enter column name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="column-type">Column Type</Label>
        <select
          id="column-type"
          className="w-full border rounded-md p-2"
          value={column.type}
          onChange={(e) => setColumn({ ...column, type: e.target.value })}
        >
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="select">Select</option>
        </select>
      </div>
      <div className="col-span-2">
        <Button onClick={handleSubmit} className="w-full">Add Column</Button>
      </div>
    </div>
  );
};
