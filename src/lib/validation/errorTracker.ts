
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types for error tracking
export type ValidationErrorEntry = {
  id?: string;
  formId?: string;
  userId?: string;
  componentName: string;
  fieldName: string;
  errorMessage: string;
  inputValue?: any;
  validationRule?: string;
  context?: Record<string, any>;
  timestamp: string;
};

// Error category types
export enum ErrorCategory {
  VALIDATION = 'validation',
  FORM_SUBMISSION = 'form_submission',
  API = 'api',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Error tracking service
export const errorTracker = {
  // Log a validation error
  logValidationError: async (error: Omit<ValidationErrorEntry, 'timestamp'>, showToast: boolean = false): Promise<string> => {
    try {
      const errorEntry: ValidationErrorEntry = {
        ...error,
        timestamp: new Date().toISOString(),
      };
      
      // Log to database
      const { data, error: dbError } = await supabase
        .from('validation_errors')
        .insert({
          form_id: errorEntry.formId,
          user_id: errorEntry.userId,
          component_name: errorEntry.componentName,
          field_name: errorEntry.fieldName,
          error_message: errorEntry.errorMessage,
          input_value: errorEntry.inputValue,
          validation_rule: errorEntry.validationRule,
          context: errorEntry.context,
          timestamp: errorEntry.timestamp,
        })
        .select()
        .single();
      
      if (dbError) {
        console.error('Failed to log validation error:', dbError);
      }
      
      // Show toast if requested
      if (showToast) {
        toast.error(`Validation error: ${errorEntry.errorMessage}`);
      }
      
      // Also log to console for development
      console.error('Validation error:', errorEntry);
      
      return data?.id || 'unknown';
    } catch (e) {
      console.error('Failed to track validation error:', e);
      return 'unknown';
    }
  },
  
  // Log a general application error with categorization
  logError: async (
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    details: Record<string, any> = {}
  ): Promise<string> => {
    try {
      const { data, error: dbError } = await supabase
        .from('error_logs')
        .insert({
          error_message: message,
          severity: severity,
          component: details.component || 'unknown',
          page_path: details.pagePath,
          user_id: details.userId,
          error_context: {
            ...details,
            category,
          },
          error_stack: details.stack,
          browser_info: details.browserInfo,
        })
        .select()
        .single();
      
      if (dbError) {
        console.error('Failed to log error:', dbError);
      }
      
      // Show critical errors as toasts
      if (severity === ErrorSeverity.CRITICAL) {
        toast.error(`System error: ${message}`);
      }
      
      // Log to console for development
      console.error(`[${severity}] ${category} error:`, message, details);
      
      return data?.id || 'unknown';
    } catch (e) {
      console.error('Failed to track error:', e);
      return 'unknown';
    }
  },
  
  // Get validation error statistics
  getValidationErrorStats: async (
    timeframe: 'day' | 'week' | 'month' = 'week',
    filters: Record<string, any> = {}
  ): Promise<Record<string, any>> => {
    try {
      let query = supabase
        .from('validation_errors')
        .select('*', { count: 'exact' });
      
      // Apply timeframe filter
      const now = new Date();
      let startDate: Date;
      
      switch (timeframe) {
        case 'day':
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'week':
        default:
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
      }
      
      query = query.gte('timestamp', startDate.toISOString());
      
      // Apply custom filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      if (filters.formId) {
        query = query.eq('form_id', filters.formId);
      }
      
      if (filters.fieldName) {
        query = query.eq('field_name', filters.fieldName);
      }
      
      if (filters.componentName) {
        query = query.eq('component_name', filters.componentName);
      }
      
      const { data, count, error } = await query;
      
      if (error) {
        console.error('Failed to get validation error stats:', error);
        return { count: 0, errors: [] };
      }
      
      // Process to get field-specific counts
      const fieldCounts: Record<string, number> = {};
      const componentCounts: Record<string, number> = {};
      
      data?.forEach(error => {
        // Count by field
        if (error.field_name) {
          fieldCounts[error.field_name] = (fieldCounts[error.field_name] || 0) + 1;
        }
        
        // Count by component
        if (error.component_name) {
          componentCounts[error.component_name] = (componentCounts[error.component_name] || 0) + 1;
        }
      });
      
      return {
        count: count || 0,
        errors: data || [],
        fieldCounts,
        componentCounts,
        timeframe,
      };
    } catch (e) {
      console.error('Failed to get validation error stats:', e);
      return { count: 0, errors: [] };
    }
  },
  
  // Format error messages to be user-friendly
  formatErrorMessage: (
    message: string,
    context: Record<string, any> = {}
  ): string => {
    // Replace placeholders in message
    let formattedMessage = message;
    
    // Replace context variables like {min}, {max}, etc.
    Object.entries(context).forEach(([key, value]) => {
      formattedMessage = formattedMessage.replace(
        new RegExp(`\\{${key}\\}`, 'g'),
        String(value)
      );
    });
    
    // Make error messages more user-friendly
    formattedMessage = formattedMessage
      .replace(/is required/g, 'qeyd olunmalıdır')
      .replace(/must be/g, 'olmalıdır')
      .replace(/cannot be/g, 'ola bilməz')
      .replace(/invalid/gi, 'yanlış')
      .replace(/minimum/gi, 'minimum')
      .replace(/maximum/gi, 'maksimum');
    
    return formattedMessage;
  },
  
  // Suggest fixes for common validation errors
  suggestFix: (
    fieldName: string,
    errorType: string,
    context: Record<string, any> = {}
  ): string => {
    switch (errorType) {
      case 'required':
        return `${fieldName} qiymətini daxil edin.`;
      case 'min':
        return `${fieldName} ən azı ${context.min || ''} ${context.unit || 'simvol'} olmalıdır.`;
      case 'max':
        return `${fieldName} ən çoxu ${context.max || ''} ${context.unit || 'simvol'} olmalıdır.`;
      case 'email':
        return 'Düzgün e-poçt ünvanı daxil edin (misalçün, ad@domain.com).';
      case 'pattern':
        return `${fieldName} düzgün formatda deyil.`;
      case 'date':
        return 'Tarix formatı düzgün deyil. GG/AA/İİİİ formatında daxil edin.';
      case 'number':
        return 'Bu sahə yalnız rəqəm qəbul edir.';
      default:
        return `${fieldName} sahəsindəki məlumatları düzgün daxil edin.`;
    }
  },
};
