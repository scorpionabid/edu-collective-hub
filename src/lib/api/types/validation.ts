
export interface ValidationTextOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  errorMessage?: string;
  isHtml?: boolean;
  htmlProfile?: 'basic' | 'strict' | 'medium' | 'rich' | 'custom';
  label?: string;
}

export interface ValidationRule {
  id: string;
  name: string;
  type: string;
  targetField: string;
  sourceField?: string;
  condition?: string;
  value?: any;
  message: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  roles?: string[];
  validationFn?: string;
  expression?: string;
}
