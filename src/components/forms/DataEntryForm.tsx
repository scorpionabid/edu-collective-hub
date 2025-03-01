
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FormData, Column } from "@/lib/api";

interface DataEntryFormProps {
  columns: Column[];
  categoryId: number;
  schoolId: string;
  initialData?: Record<string, any>;
  isReadOnly?: boolean;
  onSubmit: (data: Omit<FormData, 'id'>) => Promise<void>;
}

export function DataEntryForm({
  columns,
  categoryId,
  schoolId,
  initialData = {},
  isReadOnly = false,
  onSubmit
}: DataEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: initialData
  });

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        categoryId,
        schoolId,
        data: formData,
        status: 'submitted'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {columns.map((column) => (
        <div key={column.id} className="space-y-2">
          <label 
            htmlFor={`field-${column.id}`} 
            className="text-sm font-medium"
          >
            {column.name}
          </label>

          {column.type === 'text' && (
            <Input
              id={`field-${column.id}`}
              {...register(`field_${column.id}`, { required: true })}
              disabled={isReadOnly}
              className={errors[`field_${column.id}`] ? "border-red-500" : ""}
            />
          )}

          {column.type === 'number' && (
            <Input
              id={`field-${column.id}`}
              type="number"
              {...register(`field_${column.id}`, { required: true })}
              disabled={isReadOnly}
              className={errors[`field_${column.id}`] ? "border-red-500" : ""}
            />
          )}
          
          {column.type === 'textarea' && (
            <Textarea
              id={`field-${column.id}`}
              {...register(`field_${column.id}`, { required: true })}
              disabled={isReadOnly}
              className={errors[`field_${column.id}`] ? "border-red-500" : ""}
            />
          )}
          
          {column.type === 'date' && (
            <Popover>
              <PopoverTrigger asChild disabled={isReadOnly}>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watch(`field_${column.id}`) && "text-muted-foreground",
                    errors[`field_${column.id}`] && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch(`field_${column.id}`) ? (
                    format(new Date(watch(`field_${column.id}`)), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watch(`field_${column.id}`) ? new Date(watch(`field_${column.id}`)) : undefined}
                  onSelect={(date) => setValue(`field_${column.id}`, date?.toISOString())}
                  disabled={isReadOnly}
                />
              </PopoverContent>
            </Popover>
          )}

          {column.type === 'select' && (
            <Select 
              disabled={isReadOnly}
              defaultValue={watch(`field_${column.id}`)}
              onValueChange={(value) => setValue(`field_${column.id}`, value)}
            >
              <SelectTrigger className={errors[`field_${column.id}`] ? "border-red-500" : ""}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {/* Hardcoded options for the example - in a real app, these would come from the server */}
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {errors[`field_${column.id}`] && (
            <p className="text-xs text-red-500 mt-1">This field is required</p>
          )}
        </div>
      ))}

      {!isReadOnly && (
        <div className="space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            Save & Submit
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleSubmit((data) => 
              onSubmit({
                categoryId,
                schoolId,
                data,
                status: 'draft'
              })
            )()}
            disabled={isSubmitting}
          >
            Save as Draft
          </Button>
        </div>
      )}
    </form>
  );
}
