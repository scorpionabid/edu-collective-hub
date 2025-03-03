
import { useState, useCallback } from 'react';
import { z } from 'zod';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Column } from '@/lib/api/types';

type ValidationErrors = Record<string, string>;

interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

export const useFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState<boolean>(true);
  const [validationSchema, setValidationSchema] = useState<z.ZodTypeAny | null>(null);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(true);
  }, []);

  const generateSchemaFromColumns = useCallback(async (categoryId: string) => {
    try {
      // Using the getByCategoryId method that we added as an alias to getAll
      const columns = await api.columns.getByCategoryId(categoryId);
      
      if (!columns || columns.length === 0) {
        toast.error('No columns found for this category');
        return null;
      }

      const schemaShape: Record<string, z.ZodTypeAny> = {};

      columns.forEach((column: Column) => {
        const columnType = column.type;
        const isRequired = column.required === true;
        const columnName = column.name;
        
        let fieldSchema: z.ZodTypeAny;

        // Generate schema based on column type
        switch (columnType) {
          case 'text':
            fieldSchema = z.string();
            if (isRequired) {
              fieldSchema = fieldSchema.min(1, `${columnName} is required`);
            } else {
              fieldSchema = fieldSchema.optional();
            }
            break;
          
          case 'number':
            fieldSchema = z.preprocess(
              (val) => (val === '' ? undefined : Number(val)),
              z.number().optional()
            );
            if (isRequired) {
              fieldSchema = z.preprocess(
                (val) => (val === '' ? undefined : Number(val)),
                z.number({ required_error: `${columnName} is required` })
              );
            }
            break;
          
          case 'boolean':
            fieldSchema = z.boolean();
            if (isRequired) {
              fieldSchema = z.boolean({ required_error: `${columnName} is required` });
            } else {
              fieldSchema = z.boolean().optional();
            }
            break;

          case 'date':
            fieldSchema = z.string();
            if (isRequired) {
              fieldSchema = fieldSchema.min(1, `${columnName} is required`);
            } else {
              fieldSchema = fieldSchema.optional();
            }
            break;
            
          case 'select':
            // For select fields, check if options are available
            if (column.options && column.options.length > 0) {
              // Create a string enum from the options
              const enumValues = column.options as [string, ...string[]];
              fieldSchema = z.enum(enumValues);
              if (!isRequired) {
                fieldSchema = fieldSchema.optional();
              }
            } else {
              fieldSchema = z.string();
              if (isRequired) {
                fieldSchema = fieldSchema.min(1, `${columnName} is required`);
              } else {
                fieldSchema = fieldSchema.optional();
              }
            }
            break;
            
          default:
            fieldSchema = z.string();
            if (isRequired) {
              fieldSchema = fieldSchema.min(1, `${columnName} is required`);
            } else {
              fieldSchema = fieldSchema.optional();
            }
        }

        schemaShape[columnName] = fieldSchema;
      });

      return z.object(schemaShape);
    } catch (error) {
      console.error('Error generating schema:', error);
      toast.error('Failed to generate validation schema');
      return null;
    }
  }, []);

  const validateForm = useCallback((data: Record<string, any>): ValidationResult => {
    if (!validationSchema) {
      setIsValid(false);
      setErrors({ _form: 'Validation schema not loaded' });
      return { isValid: false, errors: { _form: 'Validation schema not loaded' } };
    }

    try {
      validationSchema.parse(data);
      setIsValid(true);
      setErrors({});
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: ValidationErrors = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          formattedErrors[path] = err.message;
        });
        
        setIsValid(false);
        setErrors(formattedErrors);
        return { isValid: false, errors: formattedErrors };
      }
      
      // Handle other types of errors
      setIsValid(false);
      const genericError = { _form: 'Validation failed' };
      setErrors(genericError);
      return { isValid: false, errors: genericError };
    }
  }, [validationSchema]);

  return {
    errors,
    isValid,
    validateForm,
    generateSchemaFromColumns,
    validationSchema,
    setValidationSchema,
    clearErrors
  };
};
