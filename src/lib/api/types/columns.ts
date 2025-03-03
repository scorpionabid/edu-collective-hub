
export interface Column {
  id: string;
  name: string;
  type: string;
  categoryId: string;
  required?: boolean;
  options?: string[] | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  label?: string;
}

export interface ColumnDefinition {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
  defaultValue: any;
}
