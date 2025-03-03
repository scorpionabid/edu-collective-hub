// Only updating the Category interface and NotificationStats to match the required properties
export interface Category {
  id: string;
  name: string;
  regionId: string | null;
  sectorId: string | null;
  schoolId: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  columns?: Column[];
}

// Update NotificationStats to include all required properties
export interface NotificationStats {
  total: number;
  sent: number;
  pending: number;
  failed: number;
  read: number;
  totalSent: number;
  delivered: number;
}

// Add missing interfaces for notification-related hooks
export interface AddGroupMemberData {
  groupId: string;
  memberIds: string[];
  memberType: string;
}

export interface CreateNotificationGroupData {
  name: string;
  description?: string;
}

export interface UpdateNotificationGroupData {
  id: string;
  name?: string;
  description?: string;
}

export interface CreateMassNotificationData {
  title: string;
  message: string;
  notificationType: string;
  recipients: {
    type: string;
    ids: string[];
  }[];
}

export interface GetMassNotificationsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

// Expand the CacheManager interface
export interface CacheManager {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T, ttl?: number) => Promise<void>;
  invalidate: (keys: string[]) => Promise<void>;
  invalidateByTags: (tags: string[]) => Promise<void>;
  clearAll: () => Promise<void>;
}

// Update the ColumnDefinition interface
export interface ColumnDefinition {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
  defaultValue: any;
}

// Update the UserProfile interface
export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  email?: string;
  regionId?: string | null;
  sectorId?: string | null;
  schoolId?: string | null;
  createdAt: string;
  name?: string;
}

// Adding missing interfaces and types
export interface ImportError {
  row: number;
  column: string;
  message: string;
}

export interface ImportJob {
  id: string;
  userId: string;
  tableName: string;
  fileName: string;
  fileSize: number;
  totalRows: number;
  processedRows: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  errors: ImportError[];
}

export interface ExportJob {
  id: string;
  userId: string;
  tableName: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt: string | null;
  filters: FilterParams;
  downloadUrl?: string;
}

export interface Column {
  id: string;
  name: string;
  type: string;
  categoryId: string;
  required: boolean;
  options: string[] | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  name: string;
  sectorId: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

export interface Sector {
  id: string;
  name: string;
  regionId: string;
  createdAt: string;
  regionName?: string;
  schoolCount?: number;
}

export interface Region {
  id: string;
  name: string;
  createdAt: string;
}

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

export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
  totalPages?: number;
  total?: number;
  filter?: any;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  column: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface QueryOptions {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: FilterParams;
  cache?: boolean | CacheOptions;
}

export interface CacheOptions {
  ttl?: number;
  key?: string;
  invalidateOn?: string[];
  enabled?: boolean;
  invalidationTags?: string[];
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  regionId?: string | null;
  sectorId?: string | null;
  schoolId?: string | null;
  createdAt: string;
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

export interface VersionDiff {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
  added?: string[];
  removed?: string[];
  modified?: string[];
}

export interface NotificationGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface MassNotification {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  deliveryStatus: string;
  sentCount: number;
  createdAt: string;
  createdBy?: string;
}

export interface CacheManager {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T, ttl?: number) => Promise<void>;
  invalidate: (keys: string[]) => Promise<void>;
  invalidateByTags: (tags: string[]) => Promise<void>;
  clearAll: () => Promise<void>;
}

// Type definition for column definition in schema builder
export interface ColumnDefinition {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
  defaultValue: any;
}
