
import { supabase } from '@/integrations/supabase/client';
import { MassNotification, CreateMassNotificationData, GetMassNotificationsParams } from '../types/notifications';

// Map DB fields to frontend fields
const mapDbToMassNotification = (item: any): MassNotification => ({
  id: item.id,
  title: item.title,
  message: item.message,
  notificationType: item.notification_type,
  deliveryStatus: item.delivery_status,
  sentCount: item.sent_count,
  createdAt: item.created_at,
  createdBy: item.created_by
});

export const getAll = async (params?: GetMassNotificationsParams): Promise<MassNotification[]> => {
  try {
    let query = supabase.from('mass_notifications').select('*');
    
    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,message.ilike.%${params.search}%`);
    }
    
    if (params?.page !== undefined && params?.pageSize !== undefined) {
      const from = (params.page - 1) * params.pageSize;
      const to = from + params.pageSize - 1;
      query = query.range(from, to);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return Array.isArray(data) ? data.map(mapDbToMassNotification) : [];
  } catch (error) {
    console.error('Error fetching mass notifications:', error);
    return [];
  }
};

export const getRecipients = async (notificationId: string): Promise<any[]> => {
  try {
    // Important: Use RPC calls instead of direct table access for tables that may not exist
    // in the TypeScript definitions but exist in the database
    const { data, error } = await supabase.rpc('get_notification_recipients', {
      p_notification_id: notificationId
    });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching notification recipients:', error);
    return [];
  }
};

export const create = async (data: CreateMassNotificationData): Promise<MassNotification> => {
  try {
    // Create the notification
    const { data: notification, error } = await supabase.from('mass_notifications').insert({
      title: data.title,
      message: data.message,
      notification_type: data.notificationType,
      delivery_status: 'pending',
      created_by: (await supabase.auth.getUser()).data.user?.id
    }).select().single();
    
    if (error) throw error;
    
    // Add recipients using RPC
    for (const recipients of data.recipients) {
      // Batch insert recipients using an RPC call
      await supabase.rpc('add_notification_recipients', {
        p_notification_id: notification.id,
        p_recipient_type: recipients.type,
        p_recipient_ids: recipients.ids
      });
    }
    
    return mapDbToMassNotification(notification);
  } catch (error) {
    console.error('Error creating mass notification:', error);
    throw error;
  }
};

export const getStats = async (): Promise<any> => {
  try {
    // Use RPC call to get statistics
    const { data, error } = await supabase.rpc('get_notification_stats');
    
    if (error) throw error;
    
    return data || {
      total: 0,
      sent: 0,
      pending: 0,
      failed: 0,
      read: 0
    };
  } catch (error) {
    console.error('Error fetching notification statistics:', error);
    return {
      total: 0,
      sent: 0,
      pending: 0,
      failed: 0,
      read: 0
    };
  }
};

export const resendNotification = async (notificationId: string): Promise<void> => {
  try {
    // Use RPC call to resend a notification
    const { error } = await supabase.rpc('resend_notification', {
      p_notification_id: notificationId
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error resending notification:', error);
    throw error;
  }
};

export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    // Use RPC call to cancel a notification
    const { error } = await supabase.rpc('cancel_notification', {
      p_notification_id: notificationId
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error canceling notification:', error);
    throw error;
  }
};
