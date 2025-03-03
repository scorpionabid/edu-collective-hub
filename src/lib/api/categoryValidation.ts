
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ValidationRule } from "./types";

// Get validation rules for a category
export const getCategoryValidationRules = async (categoryId: string): Promise<ValidationRule[]> => {
  try {
    const { data, error } = await supabase.rpc('get_validation_rules', {
      p_category_id: categoryId
    });
    
    if (error) throw error;
    
    return Array.isArray(data) ? data.map((rule: any) => ({
      id: rule.id,
      name: rule.name,
      type: rule.type,
      targetField: rule.target_field,
      sourceField: rule.source_field,
      condition: rule.condition,
      value: rule.value,
      message: rule.message,
      categoryId: rule.category_id,
      createdAt: rule.created_at,
      updatedAt: rule.updated_at,
      roles: rule.roles,
      validationFn: rule.validation_fn,
      expression: rule.expression
    })) : [];
  } catch (error) {
    console.error('Error fetching validation rules:', error);
    toast.error('Failed to load validation rules');
    return [];
  }
};

// Create a validation rule
export const createValidationRule = async (rule: Omit<ValidationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ValidationRule> => {
  try {
    const { data, error } = await supabase.rpc('create_validation_rule', {
      p_name: rule.name,
      p_type: rule.type,
      p_target_field: rule.targetField,
      p_source_field: rule.sourceField,
      p_condition: rule.condition,
      p_value: rule.value,
      p_message: rule.message,
      p_category_id: rule.categoryId,
      p_roles: rule.roles,
      p_validation_fn: rule.validationFn,
      p_expression: rule.expression
    });
    
    if (error) throw error;
    
    toast.success('Validation rule created successfully');
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      targetField: data.target_field,
      sourceField: data.source_field,
      condition: data.condition,
      value: data.value,
      message: data.message,
      categoryId: data.category_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      roles: data.roles,
      validationFn: data.validation_fn,
      expression: data.expression
    };
  } catch (error) {
    console.error('Error creating validation rule:', error);
    toast.error('Failed to create validation rule');
    throw error;
  }
};

// Update a validation rule
export const updateValidationRule = async (id: string, rule: Partial<Omit<ValidationRule, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ValidationRule> => {
  try {
    const updateParams: any = { p_rule_id: id };
    
    if (rule.name !== undefined) updateParams.p_name = rule.name;
    if (rule.type !== undefined) updateParams.p_type = rule.type;
    if (rule.targetField !== undefined) updateParams.p_target_field = rule.targetField;
    if (rule.sourceField !== undefined) updateParams.p_source_field = rule.sourceField;
    if (rule.condition !== undefined) updateParams.p_condition = rule.condition;
    if (rule.value !== undefined) updateParams.p_value = rule.value;
    if (rule.message !== undefined) updateParams.p_message = rule.message;
    if (rule.roles !== undefined) updateParams.p_roles = rule.roles;
    if (rule.validationFn !== undefined) updateParams.p_validation_fn = rule.validationFn;
    if (rule.expression !== undefined) updateParams.p_expression = rule.expression;
    
    const { data, error } = await supabase.rpc('update_validation_rule', updateParams);
    
    if (error) throw error;
    
    toast.success('Validation rule updated successfully');
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      targetField: data.target_field,
      sourceField: data.source_field,
      condition: data.condition,
      value: data.value,
      message: data.message,
      categoryId: data.category_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      roles: data.roles,
      validationFn: data.validation_fn,
      expression: data.expression
    };
  } catch (error) {
    console.error('Error updating validation rule:', error);
    toast.error('Failed to update validation rule');
    throw error;
  }
};

// Delete a validation rule
export const deleteValidationRule = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('delete_validation_rule', {
      p_rule_id: id
    });
    
    if (error) throw error;
    
    toast.success('Validation rule deleted successfully');
    
    return true;
  } catch (error) {
    console.error('Error deleting validation rule:', error);
    toast.error('Failed to delete validation rule');
    return false;
  }
};

// Save validation schema for a category
export const saveValidationSchema = async (categoryId: string, schema: any): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('save_validation_schema', {
      p_category_id: categoryId,
      p_schema: schema
    });
    
    if (error) throw error;
    
    toast.success('Validation schema saved successfully');
    
    return true;
  } catch (error) {
    console.error('Error saving validation schema:', error);
    toast.error('Failed to save validation schema');
    return false;
  }
};

// Get validation schema for a category
export const getValidationSchema = async (categoryId: string): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc('get_validation_schema', {
      p_category_id: categoryId
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching validation schema:', error);
    toast.error('Failed to load validation schema');
    return null;
  }
};

// Export the categoryValidation API
export const categoryValidation = {
  getCategoryValidationRules,
  createValidationRule,
  updateValidationRule,
  deleteValidationRule,
  saveValidationSchema,
  getValidationSchema
};
