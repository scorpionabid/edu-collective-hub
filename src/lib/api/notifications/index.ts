
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, sendNotification } from './notifications';
import * as groupsModule from './groups';
import * as massModule from './mass';

// Export individual notification APIs
export const notifications = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  sendNotification,
  // Adding groups and mass as nested objects
  groups: {
    ...groupsModule
  },
  mass: {
    ...massModule
  }
};

// Export types if needed
export type { Notification, NotificationPreference, NotificationChannel } from '../types';
