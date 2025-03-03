
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, registerDevice, unregisterDevice } from './notifications';
import * as groups from './groups';
import * as mass from './mass';

// Export the flat notification functions
export const notifications = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  registerDevice,
  unregisterDevice,
  groups,  // Export the groups submodule
  mass     // Export the mass submodule
};

// Re-export types
export type { Notification, NotificationPreference, NotificationChannel } from '../types';
