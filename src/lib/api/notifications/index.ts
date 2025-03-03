
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount, registerDevice, unregisterDevice } from './notifications';
import * as groups from './groups';
import * as mass from './mass';
import type { Notification, NotificationGroup, MassNotification, NotificationPreference, NotificationChannel, NotificationStats } from '../types/notifications';

// Export the notifications API
export const notifications = {
  // Basic notification functions
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  registerDevice,
  unregisterDevice,
  
  // Notification groups functions
  groups: {
    getAll: groups.getAllGroups,
    getById: groups.getGroupById,
    create: groups.createGroup,
    update: groups.updateGroup,
    delete: groups.deleteGroup,
    addMembers: groups.addGroupMembers,
    getMembers: groups.getGroupMembers,
    removeMembers: groups.removeGroupMembers
  },
  
  // Mass notification functions
  mass: {
    getAll: mass.getAllMassNotifications,
    create: mass.createMassNotification,
    getRecipients: mass.getNotificationRecipients,
    getStats: mass.getNotificationStats
  }
};

// Re-export types
export type {
  Notification,
  NotificationGroup,
  MassNotification,
  NotificationPreference,
  NotificationChannel,
  NotificationStats
};
