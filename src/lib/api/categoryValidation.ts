
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ValidationRule } from "./types";

// Get validation rules for a category
export const getCategoryValidationRules = async (categoryId: string): Promise<ValidationRule[]> => {
  try {
    const { data, error } = await supabase
      .from('validation_rules')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at');
    
    if (error) throw error;
    
    return data.map((rule: any) => ({
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
    }));
  } catch (error) {
    console.error('Error fetching validation rules:', error);
    toast.error('Failed to load validation rules');
    return [];
  }
};

// Create a validation rule
export const createValidationRule = async (rule: Omit<ValidationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ValidationRule> => {
  try {
    const { data, error } = await supabase
      .from('validation_rules')
      .insert({
        name: rule.name,
        type: rule.type,
        target_field: rule.targetField,
        source_field: rule.sourceField,
        condition: rule.condition,
        value: rule.value,
        message: rule.message,
        category_id: rule.categoryId,
        roles: rule.roles,
        validation_fn: rule.validationFn,
        expression: rule.expression
      })
      .select()
      .single();
    
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
    const updateData: any = {};
    
    if (rule.name !== undefined) updateData.name = rule.name;
    if (rule.type !== undefined) updateData.type = rule.type;
    if (rule.targetField !== undefined) updateData.target_field = rule.targetField;
    if (rule.sourceField !== undefined) updateData.source_field = rule.sourceField;
    if (rule.condition !== undefined) updateData.condition = rule.condition;
    if (rule.value !== undefined) updateData.value = rule.value;
    if (rule.message !== undefined) updateData.message = rule.message;
    if (rule.roles !== undefined) updateData.roles = rule.roles;
    if (rule.validationFn !== undefined) updateData.validation_fn = rule.validationFn;
    if (rule.expression !== undefined) updateData.expression = rule.expression;
    
    const { data, error } = await supabase
      .from('validation_rules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
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
    const { error } = await supabase
      .from('validation_rules')
      .delete()
      .eq('id', id);
    
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
    const { error } = await supabase
      .from('category_schemas')
      .upsert({
        category_id: categoryId,
        validation_schema: schema,
        updated_at: new Date().toISOString()
      }, { onConflict: 'category_id' });
    
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
    const { data, error } = await supabase
      .from('category_schemas')
      .select('validation_schema')
      .eq('category_id', categoryId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No schema found
        return null;
      }
      throw error;
    }
    
    return data.validation_schema;
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
