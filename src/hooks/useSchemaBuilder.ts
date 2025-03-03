
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Column, ValidationRule } from '@/lib/api/types';
import { toast } from 'sonner';

export interface ColumnWithRules extends Column {
  validationRules: ValidationRule[];
}

export const useSchemaBuilder = (categoryId: string) => {
  const [columns, setColumns] = useState<ColumnWithRules[]>([]);
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [schema, setSchema] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch columns and validation rules
  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) return;
      
      setIsLoading(true);
      try {
        // Fetch columns
        const cols = await api.categories.getCategoryColumns(categoryId);
        
        // Fetch validation rules
        let rules: ValidationRule[] = [];
        if (api.categoryValidation && typeof api.categoryValidation.getCategoryValidationRules === 'function') {
          rules = await api.categoryValidation.getCategoryValidationRules(categoryId);
        }
        
        setValidationRules(rules);
        
        // Combine columns with their rules
        const columnsWithRules: ColumnWithRules[] = cols.map(col => ({
          ...col,
          validationRules: rules.filter(rule => rule.targetField === col.name)
        }));
        
        setColumns(columnsWithRules);
        
        // Try to fetch existing schema
        if (api.categoryValidation && typeof api.categoryValidation.getValidationSchema === 'function') {
          const existingSchema = await api.categoryValidation.getValidationSchema(categoryId);
          if (existingSchema) {
            setSchema(existingSchema);
          }
        }
      } catch (error: any) {
        console.error('Error fetching schema data:', error);
        setError(error.message || 'Failed to fetch schema data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [categoryId]);

  // Add a validation rule
  const addValidationRule = useCallback(async (rule: Omit<ValidationRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!api.categoryValidation || typeof api.categoryValidation.createValidationRule !== 'function') {
      setError('API method not available: createValidationRule');
      return null;
    }
    
    try {
      const newRule = await api.categoryValidation.createValidationRule(rule);
      
      setValidationRules(prev => [...prev, newRule]);
      
      // Update columns with rules
      setColumns(prev => prev.map(col => {
        if (col.name === rule.targetField) {
          return {
            ...col,
            validationRules: [...col.validationRules, newRule]
          };
        }
        return col;
      }));
      
      toast.success('Validation rule added successfully');
      return newRule;
    } catch (error: any) {
      console.error('Error adding validation rule:', error);
      setError(error.message || 'Failed to add validation rule');
      return null;
    }
  }, []);

  // Update a validation rule
  const updateValidationRule = useCallback(async (id: string, rule: Partial<Omit<ValidationRule, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!api.categoryValidation || typeof api.categoryValidation.updateValidationRule !== 'function') {
      setError('API method not available: updateValidationRule');
      return null;
    }
    
    try {
      const updatedRule = await api.categoryValidation.updateValidationRule(id, rule);
      
      setValidationRules(prev => prev.map(r => r.id === id ? updatedRule : r));
      
      // Update columns with rules
      setColumns(prev => prev.map(col => {
        const ruleIndex = col.validationRules.findIndex(r => r.id === id);
        if (ruleIndex !== -1) {
          const newRules = [...col.validationRules];
          newRules[ruleIndex] = updatedRule;
          return {
            ...col,
            validationRules: newRules
          };
        }
        return col;
      }));
      
      toast.success('Validation rule updated successfully');
      return updatedRule;
    } catch (error: any) {
      console.error('Error updating validation rule:', error);
      setError(error.message || 'Failed to update validation rule');
      return null;
    }
  }, []);

  // Delete a validation rule
  const deleteValidationRule = useCallback(async (id: string) => {
    if (!api.categoryValidation || typeof api.categoryValidation.deleteValidationRule !== 'function') {
      setError('API method not available: deleteValidationRule');
      return false;
    }
    
    try {
      const result = await api.categoryValidation.deleteValidationRule(id);
      
      if (result) {
        setValidationRules(prev => prev.filter(r => r.id !== id));
        
        // Update columns with rules
        setColumns(prev => prev.map(col => ({
          ...col,
          validationRules: col.validationRules.filter(r => r.id !== id)
        })));
        
        toast.success('Validation rule deleted successfully');
      }
      
      return result;
    } catch (error: any) {
      console.error('Error deleting validation rule:', error);
      setError(error.message || 'Failed to delete validation rule');
      return false;
    }
  }, []);

  // Save the entire schema
  const saveSchema = useCallback(async (schemaData: any) => {
    if (!api.categoryValidation || typeof api.categoryValidation.saveValidationSchema !== 'function') {
      setError('API method not available: saveValidationSchema');
      return false;
    }
    
    try {
      const result = await api.categoryValidation.saveValidationSchema(categoryId, schemaData);
      
      if (result) {
        setSchema(schemaData);
        toast.success('Schema saved successfully');
      }
      
      return result;
    } catch (error: any) {
      console.error('Error saving schema:', error);
      setError(error.message || 'Failed to save schema');
      return false;
    }
  }, [categoryId]);

  return {
    columns,
    validationRules,
    isLoading,
    schema,
    error,
    addValidationRule,
    updateValidationRule,
    deleteValidationRule,
    saveSchema
  };
};
