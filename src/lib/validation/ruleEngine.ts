
import { api } from '@/lib/api';
import { ValidationRule } from '../api/types';
import { toast } from 'sonner';

// Cache for validation rules
const ruleCache: Record<string, ValidationRule[]> = {};

/**
 * Fetches validation rules for a specific category
 */
export const fetchValidationRules = async (categoryId: string): Promise<ValidationRule[]> => {
  // If rules are already cached, return them
  if (ruleCache[categoryId]) {
    return ruleCache[categoryId];
  }

  try {
    const response = await fetch(`/api/validation/rules?categoryId=${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch validation rules: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Convert database format to program format
    const rules = data.map((rule: any) => ({
      id: rule.id,
      name: rule.name,
      description: rule.description || '',
      type: rule.type as "custom" | "dependency" | "simple" | "complex", // Type assertion
      targetField: rule.target_field,
      condition: rule.condition as "pattern" | "max" | "min" | "required" | "custom" | "exists" | "equals", // Type assertion
      value: rule.value,
      message: rule.message,
      sourceField: rule.source_field,
      expression: rule.expression,
      validationFn: rule.validation_fn,
      roles: rule.roles || [],
      categoryId: rule.category_id,
    }));

    // Cache the rules
    ruleCache[categoryId] = rules;
    
    return rules;
  } catch (error) {
    console.error('Error fetching validation rules:', error);
    toast.error('Failed to load validation rules');
    return [];
  }
};

/**
 * Apply validation rules to form data
 */
export const applyValidationRules = (
  data: Record<string, any>,
  rules: ValidationRule[],
  userRole?: string
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Filter rules by user role if specified
  const applicableRules = userRole
    ? rules.filter(rule => !rule.roles || rule.roles.length === 0 || rule.roles.includes(userRole))
    : rules;

  // Apply each rule
  applicableRules.forEach(rule => {
    // Skip validation if the field already has an error
    if (errors[rule.targetField]) {
      return;
    }

    // Handle different rule types
    if (rule.type === 'simple' || rule.type === 'simple') {
      const value = data[rule.targetField];
      
      switch (rule.condition) {
        case 'required':
          if (value === undefined || value === null || value === '') {
            errors[rule.targetField] = rule.message;
          }
          break;
          
        case 'pattern':
          if (value && rule.value && !new RegExp(rule.value as string).test(value.toString())) {
            errors[rule.targetField] = rule.message;
          }
          break;
          
        case 'min':
          if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'number' && value < Number(rule.value)) {
              errors[rule.targetField] = rule.message;
            } else if (typeof value === 'string' && value.length < Number(rule.value)) {
              errors[rule.targetField] = rule.message;
            }
          }
          break;
          
        case 'max':
          if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'number' && value > Number(rule.value)) {
              errors[rule.targetField] = rule.message;
            } else if (typeof value === 'string' && value.length > Number(rule.value)) {
              errors[rule.targetField] = rule.message;
            }
          }
          break;
      }
    } else if (rule.type === 'dependency' || rule.type === 'dependency') {
      const sourceValue = data[rule.sourceField || ''];
      const targetValue = data[rule.targetField];
      
      if (rule.condition === 'exists' && sourceValue && (targetValue === undefined || targetValue === null || targetValue === '')) {
        errors[rule.targetField] = rule.message;
      } else if (rule.condition === 'equals' && sourceValue === rule.value && (targetValue === undefined || targetValue === null || targetValue === '')) {
        errors[rule.targetField] = rule.message;
      }
    } else if (rule.type === 'custom' || rule.type === 'custom') {
      // Handle custom validation with function or expression
      if (rule.validationFn) {
        try {
          // eslint-disable-next-line no-new-func
          const validationFn = new Function('data', rule.validationFn);
          const result = validationFn(data);
          
          if (result === false) {
            errors[rule.targetField] = rule.message;
          }
        } catch (error) {
          console.error(`Error executing custom validation function for ${rule.name}:`, error);
          errors[rule.targetField] = 'Validation failed';
        }
      } else if (rule.expression) {
        try {
          // eslint-disable-next-line no-new-func
          const expressionFn = new Function('data', `return ${rule.expression}`);
          const result = expressionFn(data);
          
          if (result === false) {
            errors[rule.targetField] = rule.message;
          }
        } catch (error) {
          console.error(`Error executing expression for ${rule.name}:`, error);
          errors[rule.targetField] = 'Validation failed';
        }
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  fetchValidationRules,
  applyValidationRules,
};
