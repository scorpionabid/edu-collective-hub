
import * as z from 'zod';
import { supabase } from "@/integrations/supabase/client";

// Types for rule engine
export type ValidationRule = {
  id: string;
  name: string;
  description?: string;
  type: 'simple' | 'dependency' | 'complex' | 'custom';
  targetField: string;
  condition: 'required' | 'min' | 'max' | 'pattern' | 'equals' | 'exists' | 'custom';
  value?: any;
  message: string;
  // For dependency rules
  sourceField?: string;
  // For complex conditions
  expression?: string;
  // For custom validation
  validationFn?: string;
  // Context restrictions
  roles?: string[];
  categoryId?: string;
};

// Rule Engine service
export const ruleEngine = {
  // Fetch rules from the database
  getRules: async (categoryId: string): Promise<ValidationRule[]> => {
    try {
      const { data, error } = await supabase
        .from('validation_rules')
        .select('*')
        .eq('category_id', categoryId);
      
      if (error) throw error;
      
      return data.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        type: rule.type,
        targetField: rule.target_field,
        condition: rule.condition,
        value: rule.value,
        message: rule.message,
        sourceField: rule.source_field,
        expression: rule.expression,
        validationFn: rule.validation_fn,
        roles: rule.roles,
        categoryId: rule.category_id,
      }));
    } catch (error) {
      console.error('Error fetching validation rules:', error);
      return [];
    }
  },
  
  // Create a new rule
  createRule: async (rule: Omit<ValidationRule, 'id'>): Promise<ValidationRule | null> => {
    try {
      const { data, error } = await supabase
        .from('validation_rules')
        .insert({
          name: rule.name,
          description: rule.description,
          type: rule.type,
          target_field: rule.targetField,
          condition: rule.condition,
          value: rule.value,
          message: rule.message,
          source_field: rule.sourceField,
          expression: rule.expression,
          validation_fn: rule.validationFn,
          roles: rule.roles,
          category_id: rule.categoryId,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        type: data.type,
        targetField: data.target_field,
        condition: data.condition,
        value: data.value,
        message: data.message,
        sourceField: data.source_field,
        expression: data.expression,
        validationFn: data.validation_fn,
        roles: data.roles,
        categoryId: data.category_id,
      };
    } catch (error) {
      console.error('Error creating validation rule:', error);
      return null;
    }
  },
  
  // Update a rule
  updateRule: async (id: string, rule: Partial<ValidationRule>): Promise<ValidationRule | null> => {
    try {
      const updateData: Record<string, any> = {};
      
      if (rule.name) updateData.name = rule.name;
      if (rule.description !== undefined) updateData.description = rule.description;
      if (rule.type) updateData.type = rule.type;
      if (rule.targetField) updateData.target_field = rule.targetField;
      if (rule.condition) updateData.condition = rule.condition;
      if (rule.value !== undefined) updateData.value = rule.value;
      if (rule.message) updateData.message = rule.message;
      if (rule.sourceField !== undefined) updateData.source_field = rule.sourceField;
      if (rule.expression !== undefined) updateData.expression = rule.expression;
      if (rule.validationFn !== undefined) updateData.validation_fn = rule.validationFn;
      if (rule.roles !== undefined) updateData.roles = rule.roles;
      if (rule.categoryId) updateData.category_id = rule.categoryId;
      
      const { data, error } = await supabase
        .from('validation_rules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        type: data.type,
        targetField: data.target_field,
        condition: data.condition,
        value: data.value,
        message: data.message,
        sourceField: data.source_field,
        expression: data.expression,
        validationFn: data.validation_fn,
        roles: data.roles,
        categoryId: data.category_id,
      };
    } catch (error) {
      console.error('Error updating validation rule:', error);
      return null;
    }
  },
  
  // Delete a rule
  deleteRule: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('validation_rules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting validation rule:', error);
      return false;
    }
  },
  
  // Apply rules to schema
  applyRulesToSchema: <T>(
    schema: z.ZodType<T>,
    rules: ValidationRule[],
    context: { role?: string; userId?: string } = {}
  ): z.ZodType<T> => {
    let modifiedSchema = schema;
    
    // Filter rules based on context
    const applicableRules = rules.filter(rule => {
      if (rule.roles && rule.roles.length > 0) {
        return context.role && rule.roles.includes(context.role);
      }
      return true;
    });
    
    // Apply rules
    for (const rule of applicableRules) {
      if (rule.type === 'simple') {
        // Simple field validations
        modifiedSchema = modifiedSchema.refine(
          (data: any) => {
            const value = data[rule.targetField];
            
            switch (rule.condition) {
              case 'required':
                return value !== undefined && value !== null && value !== '';
              case 'min':
                return typeof value === 'number' ? value >= rule.value : 
                       typeof value === 'string' ? value.length >= rule.value : true;
              case 'max':
                return typeof value === 'number' ? value <= rule.value : 
                       typeof value === 'string' ? value.length <= rule.value : true;
              case 'pattern':
                return typeof value === 'string' && new RegExp(rule.value).test(value);
              case 'equals':
                return value === rule.value;
              default:
                return true;
            }
          },
          {
            message: rule.message,
            path: [rule.targetField],
          }
        );
      } else if (rule.type === 'dependency') {
        // Field dependencies
        modifiedSchema = modifiedSchema.refine(
          (data: any) => {
            const sourceValue = data[rule.sourceField!];
            const targetValue = data[rule.targetField];
            
            if (rule.condition === 'exists' && sourceValue) {
              return targetValue !== undefined && targetValue !== null && targetValue !== '';
            }
            if (rule.condition === 'equals' && sourceValue === rule.value) {
              return targetValue !== undefined && targetValue !== null && targetValue !== '';
            }
            return true;
          },
          {
            message: rule.message,
            path: [rule.targetField],
          }
        );
      } else if (rule.type === 'complex' && rule.expression) {
        // Complex expressions (careful with eval - sanitize expressions first)
        try {
          // Using Function instead of eval for slightly better security
          const expressionFn = new Function('data', `return ${rule.expression}`);
          
          modifiedSchema = modifiedSchema.refine(
            (data: any) => {
              try {
                return expressionFn(data);
              } catch (e) {
                console.error('Error evaluating validation expression:', e);
                return true; // Skip validation on error
              }
            },
            {
              message: rule.message,
              path: [rule.targetField],
            }
          );
        } catch (e) {
          console.error('Invalid validation expression:', rule.expression, e);
        }
      } else if (rule.type === 'custom' && rule.validationFn) {
        // Custom validation functions (careful with eval)
        try {
          // Using Function instead of eval for slightly better security
          const validationFn = new Function('data', 'context', rule.validationFn);
          
          modifiedSchema = modifiedSchema.refine(
            (data: any) => {
              try {
                return validationFn(data, context);
              } catch (e) {
                console.error('Error executing custom validation function:', e);
                return true; // Skip validation on error
              }
            },
            {
              message: rule.message,
              path: [rule.targetField],
            }
          );
        } catch (e) {
          console.error('Invalid custom validation function:', rule.validationFn, e);
        }
      }
    }
    
    return modifiedSchema;
  },
};
