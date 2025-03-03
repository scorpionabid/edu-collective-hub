
export interface NotificationStats {
  total: number;
  sent: number;
  pending: number;
  failed: number;
  read: number;
  totalSent: number;
  delivered: number;
}

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

// Basic notification types
export interface Notification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  notificationType: string;
  userId: string;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  data?: Record<string, any>;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  notificationType: string;
  isEnabled: boolean;
  channelId?: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface NotificationChannel {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}
