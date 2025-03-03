
export interface FormData {
  id: string;
  categoryId: string;
  schoolId: string;
  data: any;
  status: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
  schoolName?: string;
  createdBy?: string;
}

export interface FormEntryVersion {
  id: string;
  formEntryId: string;
  versionNumber: number;
  tableVersionId?: string;
  data: any;
  createdAt: string;
  createdBy?: string;
}

export interface VersionDiff {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
  added?: string[];
  removed?: string[];
  modified?: string[];
}

export interface TableVersion {
  id: string;
  tableId: string;
  versionNumber: number;
  schema: any;
  isActive: boolean;
  startedAt: string;
  endedAt?: string;
  createdAt: string;
  createdBy?: string;
}
