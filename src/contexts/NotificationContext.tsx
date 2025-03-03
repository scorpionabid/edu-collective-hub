import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { notifications, Notification } from '@/lib/api/notifications';
import { toast } from 'sonner';

// Types
interface NotificationContextType {
  unreadCount: number;
  allNotifications: Notification[];
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  connected: boolean;
}

interface NotificationProviderProps {
  children: ReactNode;
}

// Context creation
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
export function NotificationProvider({ children }: NotificationProviderProps) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Get initial notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notifications.getNotifications(50, 0);
      setAllNotifications(data);
      const count = await notifications.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up realtime subscription
  const setupRealtimeSubscription = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    try {
      // Create channel subscription
      const newChannel = supabase
        .channel('notification_changes')
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${data.session.user.id}`
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            handleNewNotification(payload.new);
          }
        )
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${data.session.user.id}`
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            handleUpdatedNotification(payload.new);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Connected to realtime notifications');
            setConnected(true);
          }
        });

      setChannel(newChannel);

      // Heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        newChannel.send({
          type: 'broadcast',
          event: 'heartbeat',
          payload: {},
        });
      }, 30000);

      return () => {
        clearInterval(heartbeatInterval);
        if (newChannel) {
          supabase.removeChannel(newChannel);
        }
        setConnected(false);
      };
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
      setConnected(false);
    }
  };

  // Handle new notifications
  const handleNewNotification = (notification: any) => {
    const formattedNotification: Notification = {
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
    };

    setAllNotifications(prev => [formattedNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    toast(formattedNotification.title, {
      description: formattedNotification.body,
      action: formattedNotification.actionUrl ? {
        label: "View",
        onClick: () => window.open(formattedNotification.actionUrl, '_blank')
      } : undefined,
    });
  };

  // Handle updated notifications
  const handleUpdatedNotification = (notification: any) => {
    const formattedNotification: Notification = {
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
    };

    setAllNotifications(prev => 
      prev.map(n => n.id === notification.id ? formattedNotification : n)
    );

    // Update unread count if notification was marked as read
    if (notification.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    const success = await notifications.markAsRead(id);
    if (success) {
      setAllNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const count = await notifications.markAllAsRead();
    if (count > 0) {
      setAllNotifications(prev => 
        prev.map(n => !n.isRead ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(0);
    }
  };

  // Reconnect handler for WebSocket
  const handleReconnect = () => {
    if (channel) {
      supabase.removeChannel(channel);
    }
    setupRealtimeSubscription();
  };

  // Effect to handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchNotifications();
        setupRealtimeSubscription();
      } else if (event === 'SIGNED_OUT') {
        if (channel) {
          supabase.removeChannel(channel);
        }
        setAllNotifications([]);
        setUnreadCount(0);
        setConnected(false);
      }
    });

    // Initial load if user is already signed in
    const initializeNotifications = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        fetchNotifications();
        setupRealtimeSubscription();
      }
    };
    
    initializeNotifications();

    // Visibility change handler to refresh on tab focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
        
        // Reconnect WebSocket if needed
        if (!connected) {
          handleReconnect();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Reconnect on network status change
    window.addEventListener('online', handleReconnect);
    
    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleReconnect);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        allNotifications,
        loading,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
        connected
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
