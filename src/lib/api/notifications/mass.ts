
import { supabase } from "@/integrations/supabase/client";
import { MassNotification, CreateMassNotificationData, GetMassNotificationsParams, NotificationStats } from '../types/notifications';

// Get mass notifications with pagination
export const getMassNotifications = async (params?: GetMassNotificationsParams): Promise<MassNotification[]> => {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('mass_notifications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (params?.search) {
    query = query.or(`title.ilike.%${params.search}%,message.ilike.%${params.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching mass notifications:', error);
    throw new Error(error.message);
  }

  return data as MassNotification[];
};

// Create a new mass notification
export const createMassNotification = async (notificationData: CreateMassNotificationData): Promise<MassNotification> => {
  // First create the mass notification
  const { data: notificationEntry, error: notificationError } = await supabase
    .from('mass_notifications')
    .insert([{
      title: notificationData.title,
      message: notificationData.message,
      notification_type: notificationData.notificationType,
      delivery_status: 'pending',
      sent_count: 0,
    }])
    .select()
    .single();

  if (notificationError) {
    console.error('Error creating mass notification:', notificationError);
    throw new Error(notificationError.message);
  }

  const notificationId = notificationEntry.id;

  // Then create recipients entries for each recipient
  const recipientsToInsert = notificationData.recipients.flatMap(recipient => {
    return recipient.ids.map(id => ({
      notification_id: notificationId,
      recipient_id: id,
      recipient_type: recipient.type,
      status: 'pending'
    }));
  });

  if (recipientsToInsert.length > 0) {
    try {
      // Mock implementation for now - the real API would handle this differently
      console.log('Would add recipients:', recipientsToInsert);
      // In the real implementation we'd have a statement like:
      // const { error: recipientsError } = await supabase
      //   .from('notification_recipients')
      //   .insert(recipientsToInsert);
    } catch (error) {
      console.error('Error adding notification recipients:', error);
      // We already created the notification, so we'll just log the error
      // In a real app, we might need to handle this differently
    }
  }

  return notificationEntry as MassNotification;
};

// Get notification statistics
export const getNotificationStats = async (): Promise<NotificationStats> => {
  // This would typically be a stored procedure or complex query
  // For now, we'll return mock data
  return {
    total: 100,
    sent: 85,
    pending: 10,
    failed: 5,
    read: 50,
    totalSent: 85,
    delivered: 80
  };
};
