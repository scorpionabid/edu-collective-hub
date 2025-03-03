
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MassNotification, CreateMassNotificationData, GetMassNotificationsParams, NotificationStats } from '../types';

// Get mass notifications with pagination
export const getMassNotifications = async (params?: GetMassNotificationsParams): Promise<MassNotification[]> => {
  try {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const offset = (page - 1) * pageSize;
    
    let query = supabase
      .from('mass_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);
    
    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,message.ilike.%${params.search}%`);
    }
    
    const { data, error } = await query;

    if (error) throw error;

    return data.map((notification: any) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      notificationType: notification.notification_type,
      deliveryStatus: notification.delivery_status,
      sentCount: notification.sent_count,
      createdAt: notification.created_at,
      createdBy: notification.created_by
    }));
  } catch (error) {
    console.error('Error fetching mass notifications:', error);
    toast.error('Failed to load mass notifications');
    return [];
  }
};

// Create a mass notification
export const createMassNotification = async (data: CreateMassNotificationData): Promise<MassNotification> => {
  try {
    // Create the mass notification record
    const { data: notificationData, error } = await supabase
      .from('mass_notifications')
      .insert({
        title: data.title,
        message: data.message,
        notification_type: data.notificationType,
        delivery_status: 'pending',
        sent_count: 0,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;

    // Process recipients
    for (const recipient of data.recipients) {
      await supabase.from('mass_notification_recipients').insert({
        notification_id: notificationData.id,
        recipient_type: recipient.type,
        recipient_ids: recipient.ids
      });
    }

    // Invoke the Edge Function to process the notification (if available)
    try {
      await supabase.functions.invoke('process-notifications', {
        body: { notificationId: notificationData.id }
      });
    } catch (functionError) {
      console.error('Error invoking notification processor:', functionError);
      // Continue anyway, as the notifications will be processed by a scheduled job
    }

    toast.success('Mass notification created and queued successfully');

    return {
      id: notificationData.id,
      title: notificationData.title,
      message: notificationData.message,
      notificationType: notificationData.notification_type,
      deliveryStatus: notificationData.delivery_status,
      sentCount: notificationData.sent_count,
      createdAt: notificationData.created_at,
      createdBy: notificationData.created_by
    };
  } catch (error) {
    console.error('Error creating mass notification:', error);
    toast.error('Failed to create mass notification');
    throw error;
  }
};

// Get notification statistics
export const getNotificationStats = async (notificationId: string): Promise<NotificationStats> => {
  try {
    const { data, error } = await supabase
      .from('notification_delivery_stats')
      .select('*')
      .eq('notification_id', notificationId)
      .single();

    if (error) throw error;

    return {
      total: data.total_count || 0,
      pending: data.pending_count || 0,
      sent: data.sent_count || 0,
      delivered: data.delivered_count || 0,
      read: data.read_count || 0,
      failed: data.failed_count || 0,
      totalSent: data.sent_count || 0
    };
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return {
      total: 0,
      pending: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
      totalSent: 0
    };
  }
};

export const mass = {
  getMassNotifications,
  createMassNotification,
  getNotificationStats
};
