
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Basic notification methods - these were previously defined elsewhere
// and I'm creating placeholders for compatibility

export const getNotifications = async (limit = 10, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const getUnreadCount = async () => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
    
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
};

export const markAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

export const markAllAsRead = async () => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('is_read', false);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

export const registerDevice = async (deviceToken: string, deviceType = 'web') => {
  try {
    const { error } = await supabase
      .from('user_devices')
      .upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        device_token: deviceToken,
        device_type: deviceType,
        is_active: true,
        last_used_at: new Date().toISOString()
      }, { onConflict: 'device_token' });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error registering device:', error);
    return false;
  }
};

export const unregisterDevice = async (deviceToken: string) => {
  try {
    const { error } = await supabase
      .from('user_devices')
      .update({ is_active: false })
      .eq('device_token', deviceToken);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error unregistering device:', error);
    return false;
  }
};
