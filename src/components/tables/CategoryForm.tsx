
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

interface CategoryFormProps {
  onSubmit: (name: string) => void;
}

export const CategoryForm = ({ onSubmit }: CategoryFormProps) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name);
      setName("");
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Category</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="category-name">Category Name</Label>
          <Input
            id="category-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
          />
        </div>
        <Button onClick={handleSubmit}>Add Category</Button>
      </div>
    </>
  );
};
