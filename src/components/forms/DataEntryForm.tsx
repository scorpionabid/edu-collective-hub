
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Column } from "@/lib/api";

interface DataEntryFormProps {
  columns: Column[];
  categoryId: string;
  schoolId: string;
  initialData?: Record<string, any>;
  isReadOnly?: boolean;
  onSubmit: (data: any) => void;
}

export const DataEntryForm = ({
  columns,
  categoryId,
  schoolId,
  initialData = {},
  isReadOnly = false,
  onSubmit
}: DataEntryFormProps) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (columnId: string, value: any) => {
    setFormData(prev => ({ ...prev, [columnId]: value }));
    
    // Clear validation error when user edits the field
    if (errors[columnId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[columnId];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    columns.forEach(column => {
      // Skip validation for empty optional fields (future enhancement)
      if (!formData[column.id] && column.type !== 'number') {
        newErrors[column.id] = "Bu sahə tələb olunur";
      }
      
      if (column.type === 'number' && formData[column.id] && isNaN(Number(formData[column.id]))) {
        newErrors[column.id] = "Rəqəm daxil edin";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    onSubmit({
      categoryId,
      schoolId,
      data: formData
    });
  };

  const renderField = (column: Column) => {
    const value = formData[column.id] ?? '';
    
    switch (column.type) {
      case 'text':
        return (
          <Input
            id={column.id}
            value={value}
            onChange={(e) => handleChange(column.id, e.target.value)}
            className={errors[column.id] ? "border-red-500" : ""}
            readOnly={isReadOnly}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={column.id}
            value={value}
            onChange={(e) => handleChange(column.id, e.target.value)}
            className={errors[column.id] ? "border-red-500" : ""}
            readOnly={isReadOnly}
          />
        );
        
      case 'number':
        return (
          <Input
            id={column.id}
            type="number"
            value={value}
            onChange={(e) => handleChange(column.id, e.target.value)}
            className={errors[column.id] ? "border-red-500" : ""}
            readOnly={isReadOnly}
          />
        );
        
      case 'select':
        // In a real application, options would come from the API
        const options = ['Var', 'Yox', 'Təmir olunur'];
        
        return (
          <Select
            value={value}
            onValueChange={(val) => handleChange(column.id, val)}
            disabled={isReadOnly}
          >
            <SelectTrigger className={errors[column.id] ? "border-red-500" : ""}>
              <SelectValue placeholder="Seçin" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      default:
        return (
          <Input
            id={column.id}
            value={value}
            onChange={(e) => handleChange(column.id, e.target.value)}
            className={errors[column.id] ? "border-red-500" : ""}
            readOnly={isReadOnly}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {columns.map((column) => (
        <div key={column.id} className="space-y-2">
          <label 
            htmlFor={column.id} 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {column.name}
          </label>
          
          {renderField(column)}
          
          {errors[column.id] && (
            <p className="text-sm text-red-500">{errors[column.id]}</p>
          )}
        </div>
      ))}
      
      {!isReadOnly && (
        <Button type="submit" className="mt-6">
          Təqdim edin
        </Button>
      )}
    </form>
  );
};
