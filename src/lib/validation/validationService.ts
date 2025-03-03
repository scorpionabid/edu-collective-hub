
import * as z from 'zod';
import { toast } from 'sonner';

// Types for different validation scenarios
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
  formattedErrors?: Record<string, string>;
};

export type ValidationError = {
  path: (string | number)[];
  message: string;
};

export type ValidationOptions = {
  abortEarly?: boolean;
  showToast?: boolean;
  context?: Record<string, any>;
};

// Main validation service
export const validationService = {
  validate: <T>(
    schema: z.ZodType<T>,
    data: unknown,
    options: ValidationOptions = {}
  ): ValidationResult<T> => {
    const { abortEarly = false, showToast = false } = options;
    
    try {
      const validData = schema.parse(data);
      return {
        success: true,
        data: validData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path,
          message: err.message,
        }));
        
        // Format errors for form handling
        const formattedErrors = formatZodErrors(error);
        
        if (showToast) {
          // Show toast with first error
          toast.error(errors[0].message);
        }
        
        return {
          success: false,
          errors,
          formattedErrors,
        };
      }
      
      // Unknown error
      if (showToast) {
        toast.error('Validation failed due to an unknown error');
      }
      
      return {
        success: false,
        errors: [
          {
            path: [],
            message: 'Unknown validation error occurred',
          },
        ],
        formattedErrors: {
          _form: 'Unknown validation error occurred',
        },
      };
    }
  },
  
  validateAsync: async <T>(
    schemaPromise: Promise<z.ZodType<T>>,
    data: unknown,
    options: ValidationOptions = {}
  ): Promise<ValidationResult<T>> => {
    try {
      const schema = await schemaPromise;
      return validationService.validate(schema, data, options);
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            path: [],
            message: 'Failed to load validation schema',
          },
        ],
        formattedErrors: {
          _form: 'Failed to load validation schema',
        },
      };
    }
  },
  
  // Helper to format errors for specific UI frameworks
  formatErrors: <T>(result: ValidationResult<T>): Record<string, string> => {
    if (result.success || !result.errors) {
      return {};
    }
    
    return result.errors.reduce((acc, error) => {
      const key = error.path.join('.') || '_form';
      acc[key] = error.message;
      return acc;
    }, {} as Record<string, string>);
  },
};

// Helper to format Zod errors into a path-based Record for form libraries
export const formatZodErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const key = err.path.join('.') || '_form';
    
    // Don't override existing errors for the same key (use first error)
    if (!errors[key]) {
      errors[key] = err.message;
    }
  });
  
  return errors;
};

// Helper for React Hook Form integration
export const zodResolver = <T>(schema: z.ZodType<T>) => {
  return async (data: unknown) => {
    const result = validationService.validate(schema, data);
    
    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }
    
    return {
      values: {},
      errors: result.formattedErrors || {},
    };
  };
};

// Create validation context for sharing validators between client and server
export class SharedValidator<T> {
  private schema: z.ZodType<T>;
  
  constructor(schema: z.ZodType<T>) {
    this.schema = schema;
  }
  
  validate(data: unknown, options: ValidationOptions = {}): ValidationResult<T> {
    return validationService.validate(this.schema, data, options);
  }
  
  // Server-side validation helper
  validateWithThrow(data: unknown): T {
    return this.schema.parse(data);
  }
  
  // Helper for getting type information
  getType(): z.ZodType<T> {
    return this.schema;
  }
}
