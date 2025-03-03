
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

// Notification System Types
export interface NotificationGroup {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
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
  memberType: 'region' | 'sector' | 'school' | 'profile';
  memberId: string;
  memberName?: string;
  createdAt: string;
}

export interface AddGroupMemberData {
  memberType: 'region' | 'sector' | 'school' | 'profile';
  memberId: string;
}

export interface MassNotification {
  id: string;
  title: string;
  message: string;
  notificationType: 'email' | 'sms' | 'app' | 'all';
  deliveryStatus: 'pending' | 'in-progress' | 'completed' | 'failed';
  sentCount: number;
  createdBy: string;
  createdAt: string;
}

export interface CreateMassNotificationData {
  title: string;
  message: string;
  notificationType: 'email' | 'sms' | 'app' | 'all';
  recipients: {
    type: 'group' | 'region' | 'sector' | 'school' | 'profile';
    id: string;
  }[];
}

export interface MassNotificationRecipient {
  id: string;
  notificationId: string;
  recipientType: 'region' | 'sector' | 'school' | 'profile';
  recipientId: string;
  recipientName?: string;
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
}

export interface GetMassNotificationsParams {
  limit?: number;
  status?: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdBy?: string;
  createdAfter?: string;
  createdBefore?: string;
}
