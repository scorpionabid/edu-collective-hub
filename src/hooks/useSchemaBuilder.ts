
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export type ColumnDefinition = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  options?: string[];
  defaultValue?: any;
  validations?: Array<{
    type: string;
    params?: any;
    message?: string;
  }>;
};

export type ValidationRuleDefinition = {
  name: string;
  type: 'simple' | 'dependency' | 'complex' | 'custom';
  targetField: string;
  condition: string;
  value?: any;
  message: string;
  sourceField?: string;
  expression?: string;
};

export function useSchemaBuilder(categoryId: string) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [columns, setColumns] = useState<ColumnDefinition[]>([]);
  const [rules, setRules] = useState<ValidationRuleDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Load existing column definitions and rules
  const loadSchema = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load columns
      const columnsData = await api.categories.getCategoryColumns(categoryId);
      
      const formattedColumns: ColumnDefinition[] = columnsData.map(col => ({
        name: col.name,
        label: col.name,
        type: col.type as any,
        required: col.required !== false,
        options: col.options,
        defaultValue: null,
      }));
      
      setColumns(formattedColumns);
      
      // Load validation rules
      const rulesData = await api.categories.getCategoryValidationRules(categoryId);
      
      const formattedRules: ValidationRuleDefinition[] = rulesData.map(rule => ({
        name: rule.name,
        type: rule.type as any,
        targetField: rule.target_field,
        condition: rule.condition,
        value: rule.value,
        message: rule.message,
        sourceField: rule.source_field,
        expression: rule.expression,
      }));
      
      setRules(formattedRules);
    } catch (error) {
      console.error('Error loading schema data:', error);
      setError('Failed to load schema data');
      toast.error('Failed to load schema data');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);
  
  // Add a new column definition
  const addColumn = useCallback((column: ColumnDefinition) => {
    setColumns(prevColumns => [...prevColumns, column]);
  }, []);
  
  // Update an existing column
  const updateColumn = useCallback((index: number, column: Partial<ColumnDefinition>) => {
    setColumns(prevColumns => 
      prevColumns.map((col, i) => i === index ? { ...col, ...column } : col)
    );
  }, []);
  
  // Remove a column
  const removeColumn = useCallback((index: number) => {
    setColumns(prevColumns => prevColumns.filter((_, i) => i !== index));
  }, []);
  
  // Add a new validation rule
  const addRule = useCallback((rule: ValidationRuleDefinition) => {
    setRules(prevRules => [...prevRules, rule]);
  }, []);
  
  // Update an existing rule
  const updateRule = useCallback((index: number, rule: Partial<ValidationRuleDefinition>) => {
    setRules(prevRules => 
      prevRules.map((r, i) => i === index ? { ...r, ...rule } : r)
    );
  }, []);
  
  // Remove a rule
  const removeRule = useCallback((index: number) => {
    setRules(prevRules => prevRules.filter((_, i) => i !== index));
  }, []);
  
  // Save the schema to the database
  const saveSchema = useCallback(async (name: string, description?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert local state to schema format
      const schemaJson = {
        name,
        description,
        fields: columns.map(col => ({
          name: col.name,
          label: col.label,
          type: col.type,
          required: col.required,
          options: col.options,
          defaultValue: col.defaultValue,
          validations: col.validations,
        })),
        rules: rules.map(rule => ({
          name: rule.name,
          type: rule.type,
          targetField: rule.targetField,
          condition: rule.condition,
          value: rule.value,
          message: rule.message,
          sourceField: rule.sourceField,
          expression: rule.expression,
        })),
      };
      
      const success = await api.categories.saveValidationSchema(
        categoryId,
        name,
        schemaJson,
        description
      );
      
      if (success) {
        toast.success('Schema saved successfully');
      } else {
        throw new Error('Failed to save schema');
      }
      
      return success;
    } catch (error) {
      console.error('Error saving schema:', error);
      setError('Failed to save schema');
      toast.error('Failed to save schema');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, columns, rules]);
  
  return {
    columns,
    rules,
    isLoading,
    error,
    loadSchema,
    addColumn,
    updateColumn,
    removeColumn,
    addRule,
    updateRule,
    removeRule,
    saveSchema,
  };
}
