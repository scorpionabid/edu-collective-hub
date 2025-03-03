
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, sendNotification, registerDevice, unregisterDevice } from './notifications';
import { getNotificationGroups, createNotificationGroup, updateNotificationGroup, deleteNotificationGroup } from './groups';
import { getMassNotifications, createMassNotification, getNotificationStats } from './mass';

export const notifications = {
  // Basic notifications
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  sendNotification,
  registerDevice,
  unregisterDevice,
  
  // Notification groups
  getNotificationGroups,
  createNotificationGroup,
  updateNotificationGroup,
  deleteNotificationGroup,
  
  // Mass notifications
  getMassNotifications,
  createMassNotification,
  getNotificationStats
};
