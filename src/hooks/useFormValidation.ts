
import { useState, useCallback } from 'react';
import { z } from 'zod';
import sanitizationService from '@/lib/validation/sanitization';
import { api } from '@/lib/api';
import { ValidationRule } from '@/lib/api/types';

export function useFormValidation<T>() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState<boolean>(false);

  // Validate a form against a schema
  const validateForm = useCallback(<SchemaType extends z.ZodType<any>>(
    data: Record<string, any>,
    schema: SchemaType
  ): { isValid: boolean; errors: Record<string, string> } => {
    try {
      schema.parse(data);
      return { isValid: true, errors: {} };
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          // Get the field name from the path
          const fieldName = error.path.join('.');
          // Add the error message for this field
          fieldErrors[fieldName] = error.message;
        });
        return { isValid: false, errors: fieldErrors };
      }
      // If it's not a ZodError, something else went wrong
      return { 
        isValid: false, 
        errors: { _form: 'Validation failed, please check your inputs.' } 
      };
    }
  }, []);

  // Get validation rules for a category
  const getValidationRules = useCallback(async (categoryId: string): Promise<ValidationRule[]> => {
    try {
      // First try to get rules from the API
      const { data: columns } = await api.categories.getCategoryColumns(categoryId);
      
      // If we don't have columns, return an empty array
      if (!columns || columns.length === 0) {
        return [];
      }
      
      // Generate basic validation rules for each column
      const rules: ValidationRule[] = columns.map(column => ({
        id: `${column.id}_required`,
        name: `${column.name} Required`,
        type: column.required ? 'simple' : 'custom',
        targetField: column.name,
        condition: 'required',
        message: `${column.name} is required`,
        roles: [],
        categoryId
      }));
      
      return rules;
    } catch (error) {
      console.error('Error fetching validation rules:', error);
      return [];
    }
  }, []);

  // Create a validation schema from columns
  const createSchemaFromColumns = useCallback((columns: any[]): z.ZodType<any> => {
    const schemaObj: Record<string, z.ZodTypeAny> = {};

    columns.forEach(column => {
      let fieldSchema: z.ZodTypeAny;
      
      // Determine the schema based on column type
      switch (column.type) {
        case 'text':
          fieldSchema = sanitizationService.createSanitizedStringSchema({
            required: column.required,
            label: column.name,
            maxLength: 1000
          });
          break;
        case 'number':
          fieldSchema = z.preprocess(
            (val) => val === '' ? undefined : Number(val),
            column.required ? z.number() : z.number().optional()
          );
          break;
        case 'date':
          fieldSchema = z.string().refine(val => !isNaN(Date.parse(val)), {
            message: 'Invalid date format'
          });
          if (!column.required) {
            fieldSchema = fieldSchema.optional();
          }
          break;
        case 'select':
          if (column.options && Array.isArray(column.options) && column.options.length > 0) {
            const options = column.options.map((opt: any) => 
              typeof opt === 'string' ? opt : String(opt)
            );
            fieldSchema = z.enum([...options] as [string, ...string[]]);
            if (!column.required) {
              fieldSchema = fieldSchema.optional();
            }
          } else {
            fieldSchema = sanitizationService.createSanitizedStringSchema({
              required: column.required,
              label: column.name
            });
          }
          break;
        default:
          fieldSchema = sanitizationService.createSanitizedStringSchema({
            required: column.required,
            label: column.name
          });
      }
      
      schemaObj[column.name] = fieldSchema;
    });
    
    return z.object(schemaObj);
  }, []);
  
  // Get a schema for a category
  const getCategorySchema = useCallback(async (categoryId: string): Promise<z.ZodType<any>> => {
    try {
      const { data: columns } = await api.categories.getCategoryColumns(categoryId);
      
      if (!columns || columns.length === 0) {
        return z.any();
      }
      
      return createSchemaFromColumns(columns);
    } catch (error) {
      console.error('Error getting category schema:', error);
      return z.any();
    }
  }, [createSchemaFromColumns]);

  return {
    errors,
    isValid,
    validateForm,
    getValidationRules,
    createSchemaFromColumns,
    getCategorySchema,
    setErrors,
    setIsValid,
  };
}
