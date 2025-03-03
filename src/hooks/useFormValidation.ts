
import { useState, useCallback } from 'react';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Column, ValidationRule } from '@/lib/api/types';
import { toast } from 'sonner';

export type ValidationErrors = Record<string, string>;
export type ValidationResult = { isValid: boolean; errors: ValidationErrors };

export const useFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState(true);
  const [validationSchema, setValidationSchema] = useState<z.ZodType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validate a form submission against a zod schema
  const validateForm = useCallback(<SchemaType extends z.ZodType<any>>(
    data: Record<string, any>,
    schema: SchemaType
  ): ValidationResult => {
    try {
      schema.parse(data);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: ValidationErrors = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errorMap[path] = err.message;
        });
        return { isValid: false, errors: errorMap };
      }
      return { isValid: false, errors: { form: 'Invalid form data' } };
    }
  }, []);

  // Generate Zod schema from category columns
  const generateSchemaFromColumns = useCallback(async (categoryId: string) => {
    setIsLoading(true);
    try {
      // Get columns for the category
      const columns = await api.columns.getAll(categoryId);
      
      // Create schema object from columns
      const schemaObj: Record<string, z.ZodTypeAny> = {};
      
      columns.forEach((column) => {
        if (column.type === 'text') {
          // Properly handle the label property here using the updated ValidationTextOptions type
          schemaObj[column.name] = z.string({
            required_error: `${column.name} is required`,
            invalid_type_error: `${column.name} must be a string`
          });
          
          if (column.required) {
            schemaObj[column.name] = schemaObj[column.name].min(1, {
              message: `${column.name} is required`
            });
          } else {
            schemaObj[column.name] = schemaObj[column.name].optional();
          }
        } else if (column.type === 'number') {
          schemaObj[column.name] = column.required 
            ? z.number({
                required_error: `${column.name} is required`,
                invalid_type_error: `${column.name} must be a number`
              })
            : z.number().optional();
        } else if (column.type === 'boolean') {
          schemaObj[column.name] = column.required
            ? z.boolean({
                required_error: `${column.name} is required`,
                invalid_type_error: `${column.name} must be a boolean`
              })
            : z.boolean().optional();
        } else if (column.type === 'date') {
          schemaObj[column.name] = column.required
            ? z.string({
                required_error: `${column.name} is required`,
              }).regex(/^\d{4}-\d{2}-\d{2}$/, {
                message: `${column.name} must be a valid date in YYYY-MM-DD format`
              })
            : z.string()
                .regex(/^\d{4}-\d{2}-\d{2}$/, {
                  message: `${column.name} must be a valid date in YYYY-MM-DD format`
                })
                .optional();
        } else if (column.type === 'select' && column.options) {
          schemaObj[column.name] = column.required
            ? z.enum([...column.options as string[]] as [string, ...string[]], {
                required_error: `${column.name} is required`,
                invalid_type_error: `${column.name} must be one of the allowed values`
              })
            : z.enum([...column.options as string[]] as [string, ...string[]]).optional();
        }
      });
      
      const schema = z.object(schemaObj);
      setValidationSchema(schema);
      return schema;
    } catch (error) {
      console.error('Error generating schema:', error);
      toast.error('Failed to generate validation schema');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load validation rules for a category from the backend
  const loadValidationRules = useCallback(async (categoryId: string) => {
    setIsLoading(true);
    try {
      // Here we call the new categoryValidation API
      const rules = await api.categoryValidation.getCategoryValidationRules(categoryId);
      return rules;
    } catch (error) {
      console.error('Error loading validation rules:', error);
      toast.error('Failed to load validation rules');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear all validation errors
  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(true);
  }, []);

  return {
    errors,
    isValid,
    validateForm,
    generateSchemaFromColumns,
    loadValidationRules,
    validationSchema,
    setValidationSchema,
    isLoading,
    setErrors,
    clearErrors,
    setIsValid
  };
};
