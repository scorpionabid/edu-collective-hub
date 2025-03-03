
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  MassNotification, 
  CreateMassNotificationData,
  GetMassNotificationsParams 
} from "../types";

// Get mass notifications with pagination
export const getMassNotifications = async (params: GetMassNotificationsParams = {}): Promise<MassNotification[]> => {
  try {
    const { page = 1, pageSize = 20, search } = params;
    
    let query = supabase
      .from('mass_notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Add search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`);
    }
    
    // Add pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
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
    toast.error('Failed to load notifications');
    return [];
  }
};

// Create a mass notification
export const createMassNotification = async (
  data: CreateMassNotificationData
): Promise<MassNotification> => {
  try {
    // First create the notification record
    const { data: notification, error } = await supabase
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
    
    // Then add all recipients
    const recipients = [];
    for (const group of data.recipients) {
      for (const id of group.ids) {
        recipients.push({
          notification_id: notification.id,
          recipient_type: group.type,
          recipient_id: id,
          status: 'pending'
        });
      }
    }
    
    if (recipients.length > 0) {
      const { error: recipientsError } = await supabase
        .from('mass_notification_recipients')
        .insert(recipients);
      
      if (recipientsError) throw recipientsError;
    }
    
    toast.success('Mass notification created successfully');
    
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
  } catch (error) {
    console.error('Error creating mass notification:', error);
    toast.error('Failed to create mass notification');
    throw error;
  }
};

// Export all mass notification functions
export const massNotifications = {
  getMassNotifications,
  createMassNotification
};
