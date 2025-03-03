
import * as z from 'zod';

// Basic primitive type validations
export const stringSchema = z.string();
export const numberSchema = z.number();
export const booleanSchema = z.boolean();
export const dateSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Invalid date format',
});

// Common field validations with customizable messages
export const createStringSchema = (options?: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  label?: string;
}) => {
  const { required = true, minLength, maxLength, label = 'Field' } = options || {};
  
  let schema = z.string();
  
  if (minLength) {
    schema = schema.min(minLength, `${label} must be at least ${minLength} characters`);
  }
  
  if (maxLength) {
    schema = schema.max(maxLength, `${label} must not exceed ${maxLength} characters`);
  }
  
  return required ? schema.min(1, `${label} is required`) : schema.optional();
};

export const createEmailSchema = (options?: { required?: boolean; label?: string }) => {
  const { required = true, label = 'Email' } = options || {};
  
  let schema = z.string().email(`Invalid ${label.toLowerCase()} address`);
  
  return required ? schema : schema.optional();
};

export const createNumberSchema = (options?: {
  required?: boolean;
  min?: number;
  max?: number;
  label?: string;
  integer?: boolean;
}) => {
  const { required = true, min, max, label = 'Number', integer = false } = options || {};
  
  let schema = z.number();
  
  if (integer) {
    schema = schema.int(`${label} must be an integer`);
  }
  
  if (min !== undefined) {
    schema = schema.min(min, `${label} must be at least ${min}`);
  }
  
  if (max !== undefined) {
    schema = schema.max(max, `${label} must not exceed ${max}`);
  }
  
  return required ? schema : schema.optional();
};

// Common schemas for reuse
export const idSchema = z.string().uuid();
export const nameSchema = createStringSchema({ label: 'Name', minLength: 2, maxLength: 100 });
export const emailSchema = createEmailSchema();
export const phoneSchema = z.string()
  .min(10, 'Phone number must be at least 10 characters')
  .max(20, 'Phone number must not exceed 20 characters')
  .regex(/^[+]?[\d\s()-]+$/, 'Invalid phone number format')
  .optional();

// Advanced validation schemas
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must not exceed 100 characters')
  .refine(
    (password) => {
      // At least one uppercase letter, one lowercase letter, one number, and one special character
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[^A-Za-z0-9]/.test(password);
      return hasUppercase && hasLowercase && hasNumber && hasSpecial;
    },
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }
  );

// Domain-specific schemas
export const categorySchema = z.object({
  id: idSchema.optional(),
  name: nameSchema,
  regionId: idSchema.nullable().optional(),
  sectorId: idSchema.nullable().optional(),
  schoolId: idSchema.nullable().optional(),
  description: createStringSchema({ required: false, maxLength: 500, label: 'Description' }).optional(),
});

export const columnSchema = z.object({
  id: idSchema.optional(),
  name: nameSchema,
  type: z.enum(['text', 'number', 'date', 'select'], {
    errorMap: () => ({ message: 'Invalid column type' }),
  }),
  categoryId: idSchema,
  required: z.boolean().optional().default(true),
  description: createStringSchema({ required: false, maxLength: 500, label: 'Description' }).optional(),
  options: z.array(z.string()).optional().nullable(),
});

export const userProfileSchema = z.object({
  id: idSchema.optional(),
  userId: idSchema.optional(),
  firstName: nameSchema,
  lastName: nameSchema,
  role: z.enum(['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin', 'user'], {
    errorMap: () => ({ message: 'Invalid user role' }),
  }),
  regionId: idSchema.nullable().optional(),
  sectorId: idSchema.nullable().optional(),
  schoolId: idSchema.nullable().optional(),
  email: emailSchema.optional(),
});

// Form data schema (dynamic based on columns)
export const createFormDataSchema = (columns: any[], conditionalRules?: any) => {
  const dataShape: Record<string, z.ZodTypeAny> = {};
  
  columns.forEach(column => {
    let fieldSchema: z.ZodTypeAny;
    
    switch (column.type) {
      case 'text':
        fieldSchema = createStringSchema({ 
          required: column.required, 
          label: column.name,
          maxLength: 1000 
        });
        break;
      case 'number':
        fieldSchema = z.preprocess(
          (val) => (val === '' ? undefined : Number(val)),
          createNumberSchema({ 
            required: column.required, 
            label: column.name 
          })
        );
        break;
      case 'date':
        fieldSchema = dateSchema;
        if (!column.required) {
          fieldSchema = fieldSchema.optional();
        }
        break;
      case 'select':
        if (column.options && Array.isArray(column.options) && column.options.length > 0) {
          fieldSchema = z.enum([...column.options] as [string, ...string[]], {
            errorMap: () => ({ message: `Invalid option for ${column.name}` }),
          });
          if (!column.required) {
            fieldSchema = fieldSchema.optional();
          }
        } else {
          fieldSchema = createStringSchema({ 
            required: column.required, 
            label: column.name 
          });
        }
        break;
      default:
        fieldSchema = createStringSchema({ 
          required: column.required, 
          label: column.name 
        });
    }
    
    dataShape[column.name] = fieldSchema;
  });
  
  let schema = z.object(dataShape);
  
  // Apply conditional rules if provided
  if (conditionalRules && Array.isArray(conditionalRules)) {
    conditionalRules.forEach(rule => {
      if (rule.type === 'dependency') {
        schema = schema.refine(
          (data) => {
            const { sourceField, targetField, condition } = rule;
            // If source field meets condition, check target field
            const sourceValue = data[sourceField];
            const targetValue = data[targetField];
            
            if (condition === 'exists' && sourceValue) {
              return targetValue !== undefined && targetValue !== null && targetValue !== '';
            }
            if (condition === 'equals' && sourceValue === rule.value) {
              return targetValue !== undefined && targetValue !== null && targetValue !== '';
            }
            return true;
          },
          {
            message: rule.message || `${rule.targetField} is required when ${rule.sourceField} ${rule.condition === 'exists' ? 'is provided' : `equals ${rule.value}`}`,
            path: [rule.targetField],
          }
        );
      }
    });
  }
  
  return schema;
};

// Create a function to generate schemas dynamically based on category and its columns
export const getCategoryFormSchema = async (
  categoryId: string, 
  fetchColumns: (categoryId: string) => Promise<any[]>,
  fetchRules?: (categoryId: string) => Promise<any[]>
) => {
  const columns = await fetchColumns(categoryId);
  const rules = fetchRules ? await fetchRules(categoryId) : [];
  return createFormDataSchema(columns, rules);
};
