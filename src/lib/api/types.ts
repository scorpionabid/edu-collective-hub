
import { Json } from "@/integrations/supabase/types";

// Core entity types
export interface Category {
  id: string;
  name: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  createdAt: string;
  createdBy?: string;
  description?: string;
}

export interface Column {
  id: string;
  name: string;
  type: string;
  categoryId: string;
  required: boolean;
  options?: string[];
  description?: string;
}

export interface FormData {
  id: string;
  categoryId: string;
  schoolId: string;
  data: Record<string, any>;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface Region {
  id: string;
  name: string;
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

export interface School {
  id: string;
  name: string;
  sectorId: string;
  address?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  sectorName?: string;
  regionName?: string;
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
  name?: string; // Added to fix errors where the name property is accessed
  email?: string; // Added to fix TypeScript errors
  profile?: any; // Added to fix TypeScript errors
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  createdAt: string;
}

// Versioning types
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

export interface FormEntryVersion {
  id: string;
  formEntryId: string;
  versionNumber: number;
  data: any;
  tableVersionId?: string;
  createdAt: string;
  createdBy?: string;
}

export interface VersionDiff {
  added: string[];
  removed: string[];
  modified: string[];
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  notificationType: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  data?: any;
}

export interface NotificationGroup {
  id: string;
  name: string;
  description?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  memberId: string;
  memberType: 'user' | 'role' | 'school' | 'sector' | 'region';
  createdAt: string;
}

export interface MassNotification {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  deliveryStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  sentCount: number;
  createdBy?: string;
  createdAt: string;
}

export interface NotificationRecipient {
  id: string;
  notificationId: string;
  recipientId: string;
  recipientType: 'user' | 'role' | 'school' | 'sector' | 'region';
  status: 'pending' | 'sent' | 'failed' | 'read';
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationStats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  read: number;
  totalSent: number;
  delivered: number;
}

// Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  metadata?: any;
  filter?: any;
}

// Additional types for API request parameters
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  field?: string;
  direction?: 'asc' | 'desc';
  column?: string; // Added to support existing code
}

export interface FilterParams {
  [key: string]: any;
}

export interface QueryOptions {
  pagination?: PaginationParams;
  sort?: SortParams;
  filter?: FilterParams;
  includes?: string[];
  filters?: FilterParams; // Added to support existing code
  cache?: boolean; // Added to support cache operations
}

// Import/Export types
export interface ImportJob {
  id: string;
  userId: string;
  tableName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total_rows: number;
  processed_rows: number;
  failed_rows: number;
  start_time: string;
  end_time?: string;
  error_message?: string;
  file_name: string;
  file_size: number;
  created_at: string;
}

export interface ExportJob {
  id: string;
  userId: string;
  tableName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  filters?: Record<string, any>;
  start_time: string;
  end_time?: string;
  error_message?: string;
  file_name: string;
  file_size?: number;
  download_url?: string;
  created_at: string;
}

// Column definitions 
export interface ColumnDefinition {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options: string[] | any; // Modified to accept any type for flexibility
  defaultValue?: any;
}

// Notification-related types
export interface CreateNotificationGroupData {
  name: string;
  description?: string;
}

export interface UpdateNotificationGroupData {
  name?: string;
  description?: string;
}

export interface AddGroupMemberData {
  groupId: string;
  memberId: string;
  memberType: 'user' | 'role' | 'school' | 'sector' | 'region';
}

export interface CreateMassNotificationData {
  title: string;
  message: string;
  notificationType: string;
  recipients: {
    id: string;
    type: 'user' | 'role' | 'school' | 'sector' | 'region' | 'group';
  }[];
}

export interface GetMassNotificationsParams extends PaginationParams {
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
}

// Cache-related types
export interface CacheOptions {
  ttl?: number;
  key?: string;
  invalidateOn?: string[];
  enabled?: boolean; // Added to support existing code
  invalidationTags?: string[]; // Added to support existing code
}

export interface CacheManager {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T, ttl?: number) => Promise<void>;
  invalidate: (keys: string[]) => Promise<void>;
}

// Validation related types
export interface ValidationRule {
  id: string;
  name: string;
  description?: string;
  type: "custom" | "dependency" | "simple" | "complex" | string; // Made more flexible to handle string values
  targetField: string;
  condition: "pattern" | "max" | "min" | "required" | "custom" | "exists" | "equals" | string; // Made more flexible
  value?: any;
  message: string;
  sourceField?: string;
  expression?: string;
  validationFn?: string;
  roles?: string[];
  categoryId?: string;
}
