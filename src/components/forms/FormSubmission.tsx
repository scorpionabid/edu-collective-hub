
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Category, Column, FormData } from '@/lib/api/types';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useValidatedFormSubmission } from '@/hooks/useValidatedFormSubmission';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

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
    description: '',
    createdAt: '',
    updatedAt: '',
    createdBy: '',
    columns: []
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
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Use our hooks and define our own error state to avoid property conflicts
  const { errors, isValid, validateForm } = useFormValidation(categoryId || '');
  const { submitFormData, error, isSubmitting, clearError } = useValidatedFormSubmission(categoryId || '');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
        const categoryData = await api.categories.getById(categoryId);
        if (categoryData) {
          setCategory(categoryData);
          
          // Also fetch columns for this category
          const columnsData = await api.categories.getCategoryColumns(categoryId);
          setColumns(columnsData);
        }
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
    const { name, value } = e.target;
    
    // Get the input type based on the element
    const inputElement = e.target as HTMLInputElement;
    const type = inputElement.type;
    
    let parsedValue: any = value;

    // Handle different input types
    if (type === 'number') {
      parsedValue = value ? Number(value) : '';
    } else if (type === 'checkbox') {
      parsedValue = inputElement.checked;
    }

    setFormValues(prev => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormValues(prev => ({
        ...prev,
        [name]: date.toISOString(),
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validationResult = validateForm(formValues);
    setValidationErrors(validationResult.errors);
    
    if (!validationResult.isValid) {
      setShowErrors(true);
      return;
    }
    
    try {
      const submissionData = {
        categoryId: categoryId || '',
        schoolId: formData.schoolId || '',
        data: formValues,
        status: formAction === 'submit' ? 'submitted' : 'draft',
        ...(formAction === 'submit' ? { submittedAt: new Date().toISOString() } : {})
      };
      
      let result;
      
      if (formDataId) {
        // Update existing form
        result = await submitFormData(
          submissionData, 
          { categoryId: categoryId || '', id: formDataId, isUpdate: true }
        );
      } else {
        // Create new form
        result = await submitFormData(
          submissionData, 
          { categoryId: categoryId || '' }
        );
      }
      
      if (result) {
        toast.success(
          formAction === 'submit'
            ? 'Form submitted successfully!'
            : 'Form saved as draft.'
        );
        
        if (onComplete) {
          onComplete(result);
        } else {
          navigate(-1);
        }
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
              aria-invalid={showErrors && validationErrors[column.name] ? 'true' : 'false'}
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
              aria-invalid={showErrors && validationErrors[column.name] ? 'true' : 'false'}
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
                  {formValues[column.name] 
                    ? format(new Date(formValues[column.name]), "PPP") 
                    : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formValues[column.name] ? new Date(formValues[column.name]) : undefined}
                  onSelect={(date) => handleDateChange(column.name, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}

          {column.type === 'select' && column.options && (
            <Select 
              value={formValues[column.name] || ''} 
              onValueChange={(value) => handleSelectChange(column.name, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an option" />
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
              aria-invalid={showErrors && validationErrors[column.name] ? 'true' : 'false'}
            />
          )}

          {showErrors && validationErrors[column.name] && (
            <p className="text-red-500 text-sm">{validationErrors[column.name]}</p>
          )}
        </div>
      ))}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={handleSaveDraft} disabled={isSubmitting}>
          Save as Draft
        </Button>
        <Button type="submit" disabled={isSubmitting} onClick={handleFinalSubmit}>
          {isSubmitting ? 'Submitting...' : 'Submit Form'}
        </Button>
      </div>
    </form>
  );
};

export default FormSubmission;
