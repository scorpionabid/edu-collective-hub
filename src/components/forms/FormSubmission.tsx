
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Category, Column, FormData } from '@/lib/api/types';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Info, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FormSubmissionProps {
  categoryId: string;
  formId?: string; // Optional - if editing an existing form
  onSuccess?: (formData: FormData) => void;
}

const FormSubmission: React.FC<FormSubmissionProps> = ({ 
  categoryId, 
  formId,
  onSuccess
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingForm, setExistingForm] = useState<FormData | null>(null);
  
  useEffect(() => {
    const fetchCategoryAndColumns = async () => {
      setLoading(true);
      try {
        // Fetch category
        const categoryData = await api.categories.getById(categoryId);
        if (!categoryData) {
          toast.error("Category not found");
          return;
        }
        setCategory(categoryData);
        
        // Fetch columns for this category
        const columnsData = await api.categories.getCategoryColumns(categoryId);
        setColumns(columnsData);
        
        // If editing, fetch the existing form data
        if (formId) {
          const formData = await api.formData.getById(formId);
          if (formData) {
            setExistingForm(formData);
            setFormValues(formData.data || {});
          }
        }
      } catch (error) {
        console.error("Error fetching category and columns:", error);
        toast.error("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryAndColumns();
  }, [categoryId, formId]);
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    columns.forEach(column => {
      // Check required fields
      if (column.required && !formValues[column.name]) {
        newErrors[column.name] = "This field is required";
        isValid = false;
      }
      
      // Additional validation based on field type
      if (formValues[column.name]) {
        const value = formValues[column.name];
        
        switch(column.type) {
          case 'number':
            if (isNaN(Number(value))) {
              newErrors[column.name] = "Must be a valid number";
              isValid = false;
            }
            break;
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              newErrors[column.name] = "Must be a valid email address";
              isValid = false;
            }
            break;
          case 'phone':
            const phoneRegex = /^\+?[0-9\s-]{10,15}$/;
            if (!phoneRegex.test(value)) {
              newErrors[column.name] = "Must be a valid phone number";
              isValid = false;
            }
            break;
          // Additional validation types as needed
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleInputChange = (columnName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [columnName]: value
    }));
    
    // Clear error for this field
    if (errors[columnName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[columnName];
        return newErrors;
      });
    }
  };
  
  const handleSubmit = async (saveAsDraft: boolean = false) => {
    // For drafts, we skip validation
    if (!saveAsDraft && !validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setSubmitting(true);
    try {
      const formData: any = {
        categoryId,
        schoolId: user?.schoolId,
        data: formValues,
        status: saveAsDraft ? "draft" : "pending"
      };
      
      let result;
      
      if (formId) {
        // Update existing form
        result = await api.formData.update(formId, formData);
        toast.success(saveAsDraft 
          ? "Form saved as draft" 
          : "Form submitted successfully");
      } else {
        // Create new form
        result = await api.formData.create(formData);
        toast.success(saveAsDraft 
          ? "Form saved as draft" 
          : "Form submitted for approval");
      }
      
      if (onSuccess && result) {
        onSuccess(result);
      }
      
      // Navigate back or clear form depending on the flow
      if (!saveAsDraft && !onSuccess) {
        navigate("/schooladmin/dashboard");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading form...</span>
      </div>
    );
  }
  
  if (!category || columns.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load form configuration. Please try again or contact support.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{category.name}</CardTitle>
        <CardDescription>
          {category.description || 'Please fill in the required information'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {existingForm?.status === 'rejected' && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Form Rejected</AlertTitle>
            <AlertDescription>
              This form was rejected. Please make the necessary corrections and resubmit.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-2">
              <Label 
                htmlFor={column.name}
                className="flex items-center"
              >
                {column.name}
                {column.required && <span className="text-red-500 ml-1">*</span>}
                {column.description && (
                  <span className="ml-2 text-muted-foreground text-xs flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    {column.description}
                  </span>
                )}
              </Label>
              
              {renderFormField(column, formValues, handleInputChange)}
              
              {errors[column.name] && (
                <p className="text-sm text-red-500">{errors[column.name]}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => handleSubmit(true)}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : 'Save as Draft'}
        </Button>
        <Button 
          onClick={() => handleSubmit(false)}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : existingForm ? 'Update & Submit' : 'Submit for Approval'}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Helper function to render different form fields based on column type
const renderFormField = (
  column: Column, 
  formValues: Record<string, any>,
  onChange: (name: string, value: any) => void
) => {
  const value = formValues[column.name] || '';
  
  switch (column.type) {
    case 'text':
      return (
        <Input
          id={column.name}
          placeholder={`Enter ${column.name}`}
          value={value}
          onChange={(e) => onChange(column.name, e.target.value)}
        />
      );
      
    case 'textarea':
      return (
        <Textarea
          id={column.name}
          placeholder={`Enter ${column.name}`}
          value={value}
          onChange={(e) => onChange(column.name, e.target.value)}
          rows={4}
        />
      );
      
    case 'number':
      return (
        <Input
          id={column.name}
          type="number"
          placeholder={`Enter ${column.name}`}
          value={value}
          onChange={(e) => onChange(column.name, e.target.value)}
        />
      );
      
    case 'email':
      return (
        <Input
          id={column.name}
          type="email"
          placeholder={`Enter ${column.name}`}
          value={value}
          onChange={(e) => onChange(column.name, e.target.value)}
        />
      );
      
    case 'date':
      return (
        <Input
          id={column.name}
          type="date"
          value={value}
          onChange={(e) => onChange(column.name, e.target.value)}
        />
      );
      
    case 'select':
      return (
        <Select 
          value={value}
          onValueChange={(value) => onChange(column.name, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${column.name}`} />
          </SelectTrigger>
          <SelectContent>
            {column.options && Array.isArray(column.options) && column.options.map((option: string) => (
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
          id={column.name}
          placeholder={`Enter ${column.name}`}
          value={value}
          onChange={(e) => onChange(column.name, e.target.value)}
        />
      );
  }
};

export default FormSubmission;
