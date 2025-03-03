
import { getNotifications, markAsRead, getUnreadCount, registerDevice, unregisterDevice } from './notifications';
import * as groups from './groups';
import * as mass from './mass';
import { 
  Notification,
  NotificationPreference,
  NotificationChannel,
  NotificationGroup,
  NotificationStats,
  MassNotification
} from '../types/notifications';

// Structure the notifications API
export const notifications = {
  // Basic notification functions
  getNotifications,
  getUnreadCount,
  markAsRead,
  registerDevice,
  unregisterDevice,
  
  // Group notifications
  groups: {
    ...groups
  },
  
  // Mass notifications
  mass: {
    ...mass
  }
};

// Export the types
export type {
  Notification,
  NotificationPreference,
  NotificationChannel,
  NotificationGroup,
  NotificationStats,
  MassNotification
};
