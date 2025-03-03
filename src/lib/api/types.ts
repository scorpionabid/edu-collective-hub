
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

export interface TableVersion {
  id: string;
  tableId: string;
  versionNumber: number;
  schema: any;
  isActive: boolean;
  startedAt: string;
  endedAt: string | null;
  createdBy: string;
  createdAt: string;
}

export interface FormEntryVersion {
  id: string;
  formEntryId: string;
  versionNumber: number;
  tableVersionId: string;
  data: any;
  createdBy: string;
  createdAt: string;
}

export interface VersionDiff {
  added: string[];
  removed: string[];
  modified: {
    [key: string]: {
      before: any;
      after: any;
    }
  };
}
