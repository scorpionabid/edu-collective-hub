
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MassNotification, CreateMassNotificationData, GetMassNotificationsParams, NotificationStats } from '../types';

// Mock notification recipients data since the table doesn't exist yet
const mockRecipients = [
  { id: '1', notificationId: '1', userId: '1', status: 'delivered', readAt: new Date().toISOString() },
  { id: '2', notificationId: '1', userId: '2', status: 'delivered', readAt: null },
  { id: '3', notificationId: '1', userId: '3', status: 'failed', readAt: null },
  { id: '4', notificationId: '1', userId: '4', status: 'pending', readAt: null },
];

// Mock notifications
const mockNotifications: MassNotification[] = [
  {
    id: '1',
    title: 'System Maintenance',
    message: 'The system will be down for maintenance on Sunday',
    notificationType: 'system',
    deliveryStatus: 'completed',
    sentCount: 4,
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  }
];

// Get all mass notifications with optional filtering and pagination
export const getMassNotifications = async (params?: GetMassNotificationsParams): Promise<MassNotification[]> => {
  try {
    // Using mock data for now since the actual table doesn't exist yet
    return mockNotifications;
  } catch (error) {
    console.error('Error fetching mass notifications:', error);
    toast.error('Failed to load mass notifications');
    return [];
  }
};

// Create a new mass notification
export const createMassNotification = async (data: CreateMassNotificationData): Promise<MassNotification> => {
  try {
    // In a real implementation, we would insert into the mass_notifications table
    // and then schedule notification deliveries to recipients
    
    // For now, create a mock notification
    const newNotification: MassNotification = {
      id: `${Date.now()}`,
      title: data.title,
      message: data.message,
      notificationType: data.notificationType,
      deliveryStatus: 'pending',
      sentCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user'
    };
    
    mockNotifications.push(newNotification);
    
    return newNotification;
  } catch (error) {
    console.error('Error creating mass notification:', error);
    toast.error('Failed to create mass notification');
    throw error;
  }
};

// Get recipients for a specific notification
export const getNotificationRecipients = async (notificationId: string) => {
  try {
    // Mock implementation since the table doesn't exist yet
    return mockRecipients.filter(r => r.notificationId === notificationId);
  } catch (error) {
    console.error('Error fetching notification recipients:', error);
    toast.error('Failed to load notification recipients');
    return [];
  }
};

// Get delivery statistics for a notification
export const getNotificationStats = async (notificationId: string): Promise<NotificationStats> => {
  try {
    // In a real implementation, we would query the database for statistics
    // For now, return mock statistics
    
    const recipients = mockRecipients.filter(r => r.notificationId === notificationId);
    const total = recipients.length;
    const delivered = recipients.filter(r => r.status === 'delivered').length;
    const pending = recipients.filter(r => r.status === 'pending').length;
    const failed = recipients.filter(r => r.status === 'failed').length;
    const read = recipients.filter(r => r.readAt !== null).length;
    
    return {
      total,
      sent: delivered + failed,
      pending,
      failed,
      read,
      totalSent: delivered + failed,
      delivered
    };
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return {
      total: 0,
      sent: 0,
      pending: 0,
      failed: 0,
      read: 0,
      totalSent: 0,
      delivered: 0
    };
  }
};
