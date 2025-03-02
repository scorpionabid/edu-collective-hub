
// Common types used across API modules

export interface Category {
  id: string;
  name: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  columns: Column[];
}

export interface Column {
  id: string;
  name: string;
  type: string;
  categoryId: string;
}

export interface FormData {
  id?: string;
  categoryId: string;
  schoolId: string;
  data: Record<string, any>;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  userId?: string;
}
