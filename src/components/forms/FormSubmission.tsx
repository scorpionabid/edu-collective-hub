import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Category, Column, FormData } from '@/lib/api/types';
import { useFormValidation } from '@/hooks/useFormValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react";
import { useValidatedFormSubmission } from '@/hooks/useValidatedFormSubmission';

interface FormSubmissionProps {
  onComplete?: (formData: FormData) => void;
}

const FormSubmission: React.FC<FormSubmissionProps> = ({ onComplete }) => {
  const { categoryId, formDataId } = useParams<{ categoryId?: string; formDataId?: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category>({
    id: '',
    name: '',
    regionId: '',
    sectorId: '',
    schoolId: '',
    columns: [],
    description: '',
    createdAt: '',
    updatedAt: '',
    createdBy: ''
  });
  const [columns, setColumns] = useState<Column[]>([]);
  const [formData, setFormData] = useState<FormData>({
    id: '',
    categoryId: '',
    schoolId: '',
    data: {},
    status: 'draft',
    createdAt: '',
    updatedAt: ''
  });
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formAction, setFormAction] = useState<'draft' | 'submit'>('draft');
  const [showErrors, setShowErrors] = useState(false);
  const { formErrors, setFormErrors, submitForm, submitting } = useValidatedFormSubmission(categoryId || '');
  const { schema: categorySchema } = useFormValidation(categoryId || '');
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (schema) {
      // Initialize form values based on schema
      const initialValues: Record<string, any> = {};
      columns.forEach(column => {
        initialValues[column.name] = ''; // Default value
      });
      setFormValues(initialValues);
    }
  }, [schema, columns]);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryDetails();
    }
    if (formDataId) {
      fetchFormData();
    }
  }, [categoryId, formDataId]);

  useEffect(() => {
    if (formData.data) {
      setFormValues(formData.data);
    }
  }, [formData]);

  const fetchCategoryDetails = async () => {
    try {
      if (categoryId) {
        const category = await api.categories.getById(categoryId);
        // Add missing fields to match Category interface
        const completeCategory: Category = {
          ...category,
          description: category.description || "",
          createdAt: category.createdAt || new Date().toISOString(),
          updatedAt: category.updatedAt || new Date().toISOString(),
          createdBy: category.createdBy || ""
        };
        setCategory(completeCategory);
        
        // Also fetch columns for this category
        const columnsData = await api.columns.getAll(categoryId);
        
        // Convert from snake_case to camelCase
        const formattedColumns: Column[] = columnsData.map((col: any) => ({
          id: col.id,
          name: col.name,
          type: col.type,
          categoryId: col.category_id,
          required: col.required,
          options: col.options,
          description: col.description || null,
          createdAt: col.created_at,
          updatedAt: col.updated_at
        }));
        
        setColumns(formattedColumns);
      }
    } catch (error) {
      console.error('Error fetching category details:', error);
    }
  };

  const fetchFormData = async () => {
    try {
      if (formDataId) {
        const response = await api.formData.getFormDataById(formDataId);
        if (response) {
          setFormData(response);
        }
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, column: Column) => {
    const { name, value, type, checked } = e.target;

    let parsedValue = value;

    if (type === 'number') {
      parsedValue = Number(value);
    } else if (type === 'checkbox') {
      parsedValue = checked;
    }

    setFormValues(prev => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleFormElementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;
    
    // Handle checkbox inputs differently
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    }
    
    // Handle number inputs
    if (type === 'number') {
      newValue = value === '' ? '' : String(parseFloat(value));
    }
    
    // Update formData with the new value
    setFormData({
      ...formData,
      [name]: newValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Show validation errors
      if (formErrors.length > 0) {
        setShowErrors(true);
        return;
      }
      
      const submissionData = {
        ...formData,
        data: formValues,
        status: formAction === 'submit' ? 'submitted' : 'draft',
        submittedAt: formAction === 'submit' ? new Date().toISOString() : undefined
      };
      
      let result;
      
      if (formDataId) {
        // Use updateFormData instead of update
        result = await api.formData.updateFormData(formDataId, submissionData);
      } else {
        // Use createFormData instead of create
        result = await api.formData.createFormData(submissionData);
      }
      
      if (result.success) {
        toast.success(
          formAction === 'submit'
            ? 'Form submitted successfully!'
            : 'Form saved as draft.'
        );
        
        if (onComplete) {
          onComplete(result.data!);
        }
      } else {
        toast.error(result.error || 'Failed to save form data.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An error occurred while saving the form.');
    }
  };

  const handleSaveDraft = () => {
    setFormAction('draft');
  };

  const handleFinalSubmit = () => {
    setFormAction('submit');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mt-8 space-y-6">
      <h2 className="text-2xl font-bold">{category.name}</h2>
      <p className="text-gray-600">Fill out the form below to submit your data.</p>

      {columns.map(column => (
        <div key={column.id} className="space-y-2">
          <Label htmlFor={column.name}>{column.name} {column.required && <span className="text-red-500">*</span>}</Label>
          {column.type === 'text' && (
            <Input
              type="text"
              id={column.name}
              name={column.name}
              value={formValues[column.name] || ''}
              onChange={(e) => handleChange(e, column)}
              required={column.required}
              aria-required={column.required}
            />
          )}

          {column.type === 'number' && (
            <Input
              type="number"
              id={column.name}
              name={column.name}
              value={formValues[column.name] || ''}
              onChange={(e) => handleChange(e, column)}
              required={column.required}
              aria-required={column.required}
            />
          )}

          {column.type === 'date' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) =>
                    date > new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}

          {column.type === 'select' && column.options && (
            <Select>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                {column.options.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {column.type === 'textarea' && (
            <Textarea
              id={column.name}
              name={column.name}
              value={formValues[column.name] || ''}
              onChange={(e) => handleChange(e, column)}
              required={column.required}
              aria-required={column.required}
            />
          )}

          {showErrors && formErrors.find(error => error.field === column.name) && (
            <p className="text-red-500 text-sm">{formErrors.find(error => error.field === column.name)?.message}</p>
          )}
        </div>
      ))}

      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={handleSaveDraft} disabled={submitting}>
          Save as Draft
        </Button>
        <Button type="submit" disabled={submitting} onClick={handleFinalSubmit}>
          {submitting ? 'Submitting...' : 'Submit Form'}
        </Button>
      </div>
    </form>
  );
};

export default FormSubmission;
