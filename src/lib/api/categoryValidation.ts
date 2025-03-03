import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as z from 'zod';
import { createFormDataSchema } from '@/lib/validation/schemas';

// Get columns for a category
export const getCategoryColumns = async (categoryId: string) => {
  try {
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('category_id', categoryId);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching category columns:', error);
    return [];
  }
};

// Get validation rules for a category
export const getCategoryValidationRules = async (categoryId: string) => {
  try {
    const { data, error } = await supabase
      .from('validation_rules')
      .select('*')
      .eq('category_id', categoryId);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching validation rules:', error);
    return [];
  }
};

// Get or create validation schema for a category
export const getValidationSchema = async (categoryId: string): Promise<z.ZodType<any>> => {
  try {
    // First check if we have a predefined schema
    const { data: schemaData, error: schemaError } = await supabase
      .from('schema_definitions')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();
    
    if (schemaError && schemaError.code !== 'PGRST116') { // Not found error
      console.error('Error fetching schema definition:', schemaError);
    }
    
    // If we found a predefined schema, parse and return it
    if (schemaData?.schema_json) {
      try {
        // This is a bit tricky - we're storing a JSON representation
        // of the schema, but we need to construct a real Zod schema
        const schemaObj = schemaData.schema_json;
        
        // Simple approach: transform to a form data schema
        const columns = schemaObj.fields?.map((field: any) => ({
          name: field.name,
          type: field.type,
          required: field.required !== false,
          options: field.options,
        })) || [];
        
        const rules = schemaObj.rules || [];
        
        return createFormDataSchema(columns, rules);
      } catch (parseError) {
        console.error('Error parsing schema JSON:', parseError);
        // Fall back to dynamic schema generation
      }
    }
    
    // Otherwise, build a schema dynamically based on columns and rules
    const columns = await getCategoryColumns(categoryId);
    const rules = await getCategoryValidationRules(categoryId);
    
    return createFormDataSchema(
      columns,
      rules.map(rule => ({
        type: rule.type,
        targetField: rule.target_field,
        condition: rule.condition,
        value: rule.value,
        message: rule.message,
        sourceField: rule.source_field,
      }))
    );
  } catch (error) {
    console.error('Error generating validation schema:', error);
    
    // Return a permissive schema as fallback
    return z.record(z.any());
  }
};

// Save a validation schema for a category
export const saveValidationSchema = async (
  categoryId: string,
  name: string,
  schemaJson: Record<string, any>,
  description?: string
): Promise<boolean> => {
  try {
    // Get current version if exists
    const { data: existingSchema, error: fetchError } = await supabase
      .from('schema_definitions')
      .select('version')
      .eq('category_id', categoryId)
      .order('version', { ascending: false })
      .limit(1)
      .single();
    
    const nextVersion = fetchError ? 1 : (existingSchema?.version || 0) + 1;
    
    // Insert new schema
    const { error } = await supabase
      .from('schema_definitions')
      .insert({
        name,
        description,
        schema_json: schemaJson,
        version: nextVersion,
        category_id: categoryId,
        is_active: true,
      });
    
    if (error) {
      toast.error(`Failed to save validation schema: ${error.message}`);
      throw error;
    }
    
    // Deactivate previous schemas
    if (nextVersion > 1) {
      await supabase
        .from('schema_definitions')
        .update({ is_active: false })
        .eq('category_id', categoryId)
        .neq('version', nextVersion);
    }
    
    toast.success('Validation schema saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving validation schema:', error);
    return false;
  }
};

// Export enhanced category API
export const categoryValidation = {
  getCategoryColumns,
  getCategoryValidationRules,
  getValidationSchema,
  saveValidationSchema,
};
