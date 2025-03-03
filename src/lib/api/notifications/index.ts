
import { notificationGroups } from './groups';
import { massNotifications } from './mass';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, registerDevice, unregisterDevice } from './notifications';

// Export everything under one namespace
export const notifications = {
  // Original notification methods
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  registerDevice,
  unregisterDevice,
  
  // Group-related methods
  getNotificationGroups: notificationGroups.getNotificationGroups,
  getGroupMembers: notificationGroups.getGroupMembers,
  createNotificationGroup: notificationGroups.createNotificationGroup,
  updateNotificationGroup: notificationGroups.updateNotificationGroup,
  deleteNotificationGroup: notificationGroups.deleteNotificationGroup,
  addGroupMembers: notificationGroups.addGroupMembers,
  removeGroupMember: notificationGroups.removeGroupMember,
  
  // Mass notification methods
  getMassNotifications: massNotifications.getMassNotifications,
  createMassNotification: massNotifications.createMassNotification
};
