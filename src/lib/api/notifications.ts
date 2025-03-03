
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  notificationType: string;
  isRead: boolean;
  actionUrl?: string;
  data?: any;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  notificationType: string;
  channelId: string;
  isEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationChannel {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserDevice {
  id: string;
  userId: string;
  deviceToken: string;
  deviceType: 'web' | 'android' | 'ios';
  isActive: boolean;
  lastUsedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  templateType: 'email' | 'push' | 'in-app';
  htmlContent?: string;
  variables?: any[];
  createdAt: string;
  updatedAt: string;
}

// Notification API methods
export const notifications = {
  // Get user notifications
  getNotifications: async (limit = 50, offset = 0): Promise<Notification[]> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      
      return data.map(notification => ({
        id: notification.id,
        userId: notification.user_id,
        title: notification.title,
        body: notification.body,
        notificationType: notification.notification_type,
        isRead: notification.is_read,
        actionUrl: notification.action_url,
        data: notification.data,
        createdAt: notification.created_at,
        readAt: notification.read_at
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      return [];
    }
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('mark_notification_read', { p_notification_id: notificationId });

      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
      return false;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<number> => {
    try {
      const { data, error } = await supabase
        .rpc('mark_all_notifications_read');

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to update notifications');
      return 0;
    }
  },

  // Send a notification (admin operation)
  sendNotification: async (
    userId: string,
    title: string,
    body: string,
    notificationType: string,
    actionUrl?: string,
    data?: any
  ): Promise<string | null> => {
    try {
      const { data: result, error } = await supabase
        .rpc('send_notification', {
          p_user_id: userId,
          p_title: title,
          p_body: body,
          p_notification_type: notificationType,
          p_action_url: actionUrl,
          p_data: data
        });

      if (error) throw error;
      
      toast.success('Notification sent successfully');
      return result;
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
      return null;
    }
  },

  // User Notification Preferences
  getUserPreferences: async (): Promise<NotificationPreference[]> => {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*');

      if (error) throw error;
      
      return data.map(pref => ({
        id: pref.id,
        userId: pref.user_id,
        notificationType: pref.notification_type,
        channelId: pref.channel_id,
        isEnabled: pref.is_enabled,
        quietHoursStart: pref.quiet_hours_start,
        quietHoursEnd: pref.quiet_hours_end,
        createdAt: pref.created_at,
        updatedAt: pref.updated_at
      }));
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      toast.error('Failed to load notification preferences');
      return [];
    }
  },

  // Update user preference for a notification type and channel
  updatePreference: async (
    notificationType: string,
    channelId: string,
    isEnabled: boolean,
    quietHoursStart?: string,
    quietHoursEnd?: string
  ): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.user.id,
          notification_type: notificationType,
          channel_id: channelId,
          is_enabled: isEnabled,
          quiet_hours_start: quietHoursStart,
          quiet_hours_end: quietHoursEnd,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,notification_type,channel_id'
        });

      if (error) throw error;
      
      toast.success('Notification preferences updated');
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences');
      return false;
    }
  },

  // Get notification channels (email, push, in-app)
  getChannels: async (): Promise<NotificationChannel[]> => {
    try {
      const { data, error } = await supabase
        .from('notification_channels')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      return data.map(channel => ({
        id: channel.id,
        name: channel.name,
        description: channel.description,
        isActive: channel.is_active,
        createdAt: channel.created_at
      }));
    } catch (error) {
      console.error('Error fetching notification channels:', error);
      return [];
    }
  },

  // Device registration for push notifications
  registerDevice: async (
    deviceToken: string,
    deviceType: 'web' | 'android' | 'ios'
  ): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_devices')
        .upsert({
          user_id: user.user.id,
          device_token: deviceToken,
          device_type: deviceType,
          is_active: true,
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,device_token'
        });

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error registering device:', error);
      return false;
    }
  },

  // Unregister a device
  unregisterDevice: async (deviceToken: string): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_devices')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', user.user.id)
        .eq('device_token', deviceToken);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error unregistering device:', error);
      return false;
    }
  }
};
