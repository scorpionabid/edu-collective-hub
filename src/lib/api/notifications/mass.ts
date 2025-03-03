
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MassNotification, NotificationStats } from "../types";

export const getMassNotifications = async (params: { page?: number, pageSize?: number, search?: string } = {}): Promise<MassNotification[]> => {
  try {
    let query = supabase
      .from('mass_notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply search if provided
    if (params.search) {
      query = query.ilike('title', `%${params.search}%`);
    }
    
    // Apply pagination if provided
    if (params.page !== undefined && params.pageSize !== undefined) {
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize - 1;
      query = query.range(start, end);
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

export const createMassNotification = async (data: {
  title: string,
  message: string,
  notificationType: string,
  recipients: { type: string, ids: string[] }[]
}): Promise<MassNotification | null> => {
  try {
    // First create the mass notification record
    const { data: notificationData, error } = await supabase
      .from('mass_notifications')
      .insert({
        title: data.title,
        message: data.message,
        notification_type: data.notificationType,
        delivery_status: 'pending',
        sent_count: 0,
        created_at: new Date().toISOString(),
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Then create recipient records for each recipient
    for (const recipientGroup of data.recipients) {
      for (const id of recipientGroup.ids) {
        await supabase
          .from('notification_recipients')
          .insert({
            notification_id: notificationData.id,
            recipient_id: id,
            recipient_type: recipientGroup.type,
            status: 'pending'
          });
      }
    }
    
    // Trigger the notification processing (in a real app, this would be a background process)
    setTimeout(() => {
      console.log(`Processing mass notification: ${notificationData.id}`);
      // This would be handled by a background job
    }, 100);
    
    toast.success('Mass notification created and queued for delivery');
    
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
    return null;
  }
};

export const getNotificationStats = async (): Promise<NotificationStats> => {
  try {
    // In a real implementation, this would query a table with notification stats
    // For this mock, we'll just return some example stats
    return {
      total: 100,
      pending: 10,
      sent: 80,
      delivered: 75,
      read: 50,
      failed: 10,
      totalSent: 90
    };
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    toast.error('Failed to load notification stats');
    
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
