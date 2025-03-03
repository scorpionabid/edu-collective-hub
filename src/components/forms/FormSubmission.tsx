
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useValidatedFormSubmission } from "@/hooks/useValidatedFormSubmission";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FormSubmissionProps {
  categoryId: string;
  schoolId?: string;
  onSuccess?: () => void;
  initialData?: any;
  id?: string;
}

export const FormSubmission = ({
  categoryId,
  schoolId,
  onSuccess,
  initialData,
  id,
}: FormSubmissionProps) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { 
    errors, 
    isValid, 
    validateForm, 
    generateSchemaFromColumns,
    validationSchema,
    setValidationSchema,
    clearErrors
  } = useFormValidation();
  
  const {
    submitFormData,
    error: submissionError,
    isSubmitting,
    clearError
  } = useValidatedFormSubmission();

  // Load validation schema when component mounts
  useEffect(() => {
    const loadSchema = async () => {
      const schema = await generateSchemaFromColumns(categoryId);
      if (schema) {
        setValidationSchema(schema);
      }
    };
    
    loadSchema();
    
    return () => {
      clearErrors();
      clearError();
    };
  }, [categoryId, generateSchemaFromColumns, setValidationSchema, clearErrors, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validationSchema) {
      toast.error("Validation schema is not loaded");
      return;
    }

    const validationResult = validateForm(formData);
    
    if (!validationResult.isValid) {
      return;
    }
    
    try {
      const result = await submitFormData(formData, {
        categoryId,
        schoolId: schoolId || "",
        id,
        isUpdate: !!id
      });
      
      if (result?.success) {
        toast.success("Form submitted successfully");
        setIsSubmitted(true);
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit form");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    // Handle different input types
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = value === '' ? '' : Number(value);
    }
    
    setFormData({ ...formData, [name]: finalValue });
    clearErrors();
  };

  // If validation schema is not loaded yet, show a loading message
  if (!validationSchema) {
    return <div>Loading form...</div>;
  }

  // If form is submitted successfully and no error, show success message
  if (isSubmitted && !submissionError) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <h3 className="text-green-700 font-medium">Form Submitted Successfully</h3>
        <p className="text-green-600">Thank you for your submission.</p>
        <Button 
          onClick={() => {
            setFormData({});
            setIsSubmitted(false);
          }} 
          className="mt-4"
        >
          Submit Another
        </Button>
      </div>
    );
  }

  // Dynamically generate form fields based on validation schema
  const renderFormFields = () => {
    if (!validationSchema) return null;
    
    // Since validationSchema might not be a ZodObject directly, we need to be cautious
    const fields = Object.keys(validationSchema instanceof z.ZodObject ? validationSchema.shape : {});
    
    return fields.map((fieldName) => {
      const error = errors[fieldName];
      let inputField;
      
      // Determine field type from schema
      const fieldType = determineFieldType(fieldName, validationSchema as z.ZodObject<any>);
      
      switch (fieldType) {
        case "text":
          inputField = (
            <input
              type="text"
              id={fieldName}
              name={fieldName}
              value={formData[fieldName] || ""}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${error ? "border-red-500" : "border-gray-300"}`}
            />
          );
          break;
        case "number":
          inputField = (
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              value={formData[fieldName] || ""}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${error ? "border-red-500" : "border-gray-300"}`}
            />
          );
          break;
        case "boolean":
          inputField = (
            <input
              type="checkbox"
              id={fieldName}
              name={fieldName}
              checked={!!formData[fieldName]}
              onChange={handleChange}
              className={`p-2 border rounded ${error ? "border-red-500" : "border-gray-300"}`}
            />
          );
          break;
        case "select":
          inputField = (
            <select
              id={fieldName}
              name={fieldName}
              value={formData[fieldName] || ""}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${error ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">Select...</option>
              {/* We would need options from schema here */}
            </select>
          );
          break;
        default:
          inputField = (
            <input
              type="text"
              id={fieldName}
              name={fieldName}
              value={formData[fieldName] || ""}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${error ? "border-red-500" : "border-gray-300"}`}
            />
          );
      }
      
      return (
        <div key={fieldName} className="mb-4">
          <label htmlFor={fieldName} className="block mb-1 font-medium">
            {fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1')}
          </label>
          {inputField}
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      );
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {submissionError && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{submissionError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderFormFields()}
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Helper function to determine field type from schema
const determineFieldType = (fieldName: string, schema: z.ZodObject<any>) => {
  try {
    // This is a simple implementation - might need more sophisticated logic
    // depending on your schema structure
    if (!schema || !schema.shape) return "text";
    
    const fieldSchema = schema.shape[fieldName];
    if (!fieldSchema) return "text";
    
    const typeName = fieldSchema._def?.typeName;
    if (typeName === "ZodNumber") {
      return "number";
    } else if (typeName === "ZodBoolean") {
      return "boolean";
    } else if (typeName === "ZodEnum") {
      return "select";
    } else {
      return "text";
    }
  } catch (error) {
    console.error(`Error determining field type for ${fieldName}:`, error);
    return "text";
  }
};
