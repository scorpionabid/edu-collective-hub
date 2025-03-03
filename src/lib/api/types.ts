
export interface Column {
  id: string;
  name: string;
  type: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  regionId: string;
  sectorId: string;
  schoolId: string;
  columns: Column[];
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  createdAt: string;
  email?: string;
}

// Redis cache related types
export interface CacheConfig {
  ttl: number; // Time to live in seconds
}

export interface CacheOptions {
  enabled: boolean;
  ttl?: number; // Time to live in seconds
  invalidationTags?: string[];
}

export interface CacheManager {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, data: T, ttl?: number) => Promise<void>;
  invalidate: (tags: string[]) => Promise<void>;
}

// Pagination related types
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
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
  cache?: CacheOptions;
}

// Form data related types
export interface FormData {
  id: string;
  categoryId: string;
  schoolId: string;
  data: any;
  status: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
}

// School related types
export interface School {
  id: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  sectorId?: string;
  createdAt?: string;
  // Additional properties for UI display
  sectorName?: string;
  regionName?: string;
}

// Sector related types
export interface Sector {
  id: string;
  name: string;
  regionId?: string;
  createdAt?: string;
  // Additional properties for UI display
  regionName?: string;
  schoolCount?: number;
}

// Versioning related types
export interface TableVersion {
  id: string;
  tableId: string;
  versionNumber: number;
  schema: any;
  isActive: boolean;
  startedAt: string;
  endedAt?: string;
  createdAt: string;
  createdBy: string;
}

export interface FormEntryVersion {
  id: string;
  formEntryId: string;
  versionNumber: number;
  data: any;
  tableVersionId?: string;
  createdAt: string;
  createdBy: string;
}

export interface VersionDiff {
  added: string[];
  removed: string[];
  modified: string[];
}

// Notification related types
export interface NotificationGroup {
  id: string;
  name: string;
  description?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateNotificationGroupData {
  name: string;
  description?: string;
}

export interface UpdateNotificationGroupData {
  name?: string;
  description?: string;
}

export interface NotificationGroupMember {
  id: string;
  groupId: string;
  memberId: string;
  memberType: 'school' | 'sector' | 'region' | 'user';
  createdAt: string;
}

export interface AddGroupMemberData {
  groupId: string;
  memberId: string;
  memberType: 'school' | 'sector' | 'region' | 'user';
}

export interface MassNotification {
  id: string;
  title: string;
  message: string;
  notificationType: 'email' | 'sms' | 'push' | 'in-app';
  deliveryStatus: 'pending' | 'sending' | 'completed' | 'failed';
  sentCount?: number;
  createdBy?: string;
  createdAt: string;
}

export interface CreateMassNotificationData {
  title: string;
  message: string;
  notificationType: 'email' | 'sms' | 'push' | 'in-app';
  recipients: {
    groupIds?: string[];
    schoolIds?: string[];
    sectorIds?: string[];
    regionIds?: string[];
    userIds?: string[];
  };
}

export interface MassNotificationRecipient {
  id: string;
  notificationId: string;
  recipientId: string;
  recipientType: 'user' | 'school' | 'sector' | 'region';
  status: 'pending' | 'sent' | 'failed' | 'read';
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationStats {
  totalSent: number;
  delivered: number;
  read: number;
  failed: number;
  pending: number;
}

export interface GetMassNotificationsParams {
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
  status?: string;
  type?: string;
}

// Import and export jobs (re-exported from specialized files)
export { ImportJob, ExportJob } from './types/jobs';

// Export options
export interface ExportOptions {
  fileName?: string;
  sheetName?: string;
  dateFormat?: string;
  includeHeaders?: boolean;
  headerStyle?: any;
  cellStyle?: any;
}
