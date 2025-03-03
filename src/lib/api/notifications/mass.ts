
import { supabase } from '@/integrations/supabase/client';
import { MassNotification, CreateMassNotificationData, GetMassNotificationsParams, NotificationStats } from '../types/notifications';

/**
 * Get all mass notifications with pagination
 */
export const getAllMassNotifications = async (params?: GetMassNotificationsParams): Promise<MassNotification[]> => {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const search = params?.search || '';
  
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  let query = supabase
    .from('mass_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);
  
  if (search) {
    query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Map DB fields to frontend fields
  return (data || []).map(notification => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    notificationType: notification.notification_type,
    deliveryStatus: notification.delivery_status,
    sentCount: notification.sent_count,
    createdAt: notification.created_at,
    createdBy: notification.created_by
  }));
};

/**
 * Create a new mass notification
 */
export const createMassNotification = async (data: CreateMassNotificationData): Promise<MassNotification> => {
  // First, create the mass notification
  const { data: notification, error } = await supabase
    .from('mass_notifications')
    .insert({
      title: data.title,
      message: data.message,
      notification_type: data.notificationType,
      delivery_status: 'pending',
      sent_count: 0
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Then create entries for each recipient
  const recipientEntries = [];
  
  for (const recipient of data.recipients) {
    for (const id of recipient.ids) {
      recipientEntries.push({
        notification_id: notification.id,
        recipient_type: recipient.type,
        recipient_id: id,
        status: 'pending'
      });
    }
  }
  
  if (recipientEntries.length > 0) {
    const { error: recipientsError } = await supabase
      .from('notification_recipients')
      .insert(recipientEntries);
    
    if (recipientsError) throw recipientsError;
  }
  
  // Return the created notification
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    notificationType: notification.notification_type,
    deliveryStatus: notification.delivery_status,
    sentCount: notification.sent_count,
    createdAt: notification.created_at,
    createdBy: notification.created_by
  };
};

/**
 * Get recipients for a notification
 */
export const getNotificationRecipients = async (notificationId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('notification_recipients')
    .select('*')
    .eq('notification_id', notificationId);
  
  if (error) throw error;
  
  return data || [];
};

/**
 * Get notification statistics
 */
export const getNotificationStats = async (): Promise<NotificationStats> => {
  // Example implementation - would need to be adjusted based on your actual DB structure
  const { data: total, error: totalError } = await supabase
    .from('notifications')
    .select('count', { count: 'exact' });
  
  if (totalError) throw totalError;
  
  const { data: sent, error: sentError } = await supabase
    .from('notifications')
    .select('count', { count: 'exact' })
    .eq('is_sent', true);
  
  if (sentError) throw sentError;
  
  const { data: pending, error: pendingError } = await supabase
    .from('notifications')
    .select('count', { count: 'exact' })
    .eq('is_sent', false);
  
  if (pendingError) throw pendingError;
  
  const { data: failed, error: failedError } = await supabase
    .from('notifications')
    .select('count', { count: 'exact' })
    .eq('failed', true);
  
  if (failedError) throw failedError;
  
  const { data: read, error: readError } = await supabase
    .from('notifications')
    .select('count', { count: 'exact' })
    .eq('is_read', true);
  
  if (readError) throw readError;
  
  const { data: delivered, error: deliveredError } = await supabase
    .from('notifications')
    .select('count', { count: 'exact' })
    .eq('is_delivered', true);
  
  if (deliveredError) throw deliveredError;
  
  return {
    total: total[0].count,
    sent: sent[0].count,
    pending: pending[0].count,
    failed: failed[0].count,
    read: read[0].count,
    totalSent: sent[0].count,
    delivered: delivered[0].count
  };
};
