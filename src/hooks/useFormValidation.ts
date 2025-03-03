
import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Column, ValidationRule } from '@/lib/api/types';
import { createSanitizedStringSchema } from '@/lib/validation/sanitization';

type ValidationErrors = Record<string, string>;
type ValidationResult = { isValid: boolean; errors: ValidationErrors };

export function useFormValidation(categoryId: string) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch column and validation rules for the category
  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) return;
      
      setIsLoading(true);
      try {
        // Fetch columns for the category
        const categoryColumns = await api.categories.getCategoryColumns(categoryId);
        setColumns(categoryColumns);
        
        // Fetch validation rules if they exist
        if (api.categoryValidation) {
          const rules = await api.categoryValidation.getCategoryValidationRules(categoryId);
          setValidationRules(rules);
        }
      } catch (error) {
        console.error('Error fetching validation data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [categoryId]);

  // Build a Zod schema based on column types and validation rules
  const buildSchema = useCallback(() => {
    const schemaMap: Record<string, z.ZodType<any>> = {};
    
    // Process each column and create appropriate validators
    columns.forEach(column => {
      let fieldSchema;
      
      switch (column.type) {
        case 'text':
        case 'textarea':
          fieldSchema = createSanitizedStringSchema({
            required: column.required,
            label: column.name
          });
          break;
          
        case 'number':
          fieldSchema = z.preprocess(
            (val) => (val === '' ? undefined : Number(val)),
            z.number({
              required_error: `${column.name} is required`,
              invalid_type_error: `${column.name} must be a number`
            }).optional().nullable()
          );
          
          if (column.required) {
            fieldSchema = fieldSchema.refine(val => val !== undefined && val !== null, {
              message: `${column.name} is required`
            });
          }
          break;
          
        case 'date':
          fieldSchema = z.preprocess(
            (val) => (val ? new Date(val as string) : undefined),
            z.date({
              required_error: `${column.name} is required`,
              invalid_type_error: `${column.name} must be a valid date`
            }).optional().nullable()
          );
          
          if (column.required) {
            fieldSchema = fieldSchema.refine(val => val !== undefined && val !== null, {
              message: `${column.name} is required`
            });
          }
          break;
          
        case 'select':
          fieldSchema = createSanitizedStringSchema({
            required: column.required,
            label: column.name
          });
          
          if (column.options && column.options.length > 0) {
            fieldSchema = z.enum(column.options as [string, ...string[]]).optional();
            
            if (column.required) {
              fieldSchema = fieldSchema.refine(val => val !== undefined, {
                message: `${column.name} is required`
              });
            }
          }
          break;
          
        default:
          fieldSchema = z.any();
      }
      
      schemaMap[column.name] = fieldSchema;
    });
    
    // Create a schema object from our schema map
    return z.object(schemaMap);
  }, [columns]);

  // Validate form data against our schema
  const validateForm = useCallback(<SchemaType extends z.ZodType<any>>(
    data: Record<string, any>,
    schema?: SchemaType
  ): ValidationResult => {
    const validationSchema = schema || buildSchema();
    const result = validationSchema.safeParse(data);
    
    if (!result.success) {
      const formattedErrors: ValidationErrors = {};
      
      result.error.errors.forEach(err => {
        const field = err.path.join('.');
        formattedErrors[field] = err.message;
      });
      
      setErrors(formattedErrors);
      setIsValid(false);
      
      return { isValid: false, errors: formattedErrors };
    }
    
    setErrors({});
    setIsValid(true);
    
    return { isValid: true, errors: {} };
  }, [buildSchema]);

  return {
    errors,
    isValid,
    validateForm,
    setErrors,
    setIsValid,
    isLoading,
    columns,
    validationRules
  };
}
