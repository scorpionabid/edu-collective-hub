
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { MassNotification, CreateMassNotificationData, GetMassNotificationsParams } from '@/lib/api/types';

export const useMassNotifications = () => {
  const [notifications, setNotifications] = useState<MassNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async (params?: GetMassNotificationsParams) => {
    setLoading(true);
    setError(null);
    
    try {
      // Access the notifications.mass.getAll method correctly
      const notificationsData = await api.notifications.mass.getAll(params);
      setNotifications(notificationsData);
    } catch (err: any) {
      setError(err);
      toast.error('Failed to fetch mass notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const createNotification = useCallback(async (data: CreateMassNotificationData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Access the notifications.mass.create method correctly
      const newNotification = await api.notifications.mass.create(data);
      setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
      toast.success('Mass notification created successfully');
      return newNotification;
    } catch (err: any) {
      setError(err);
      toast.error('Failed to create mass notification');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to get notification statistics
  const getNotificationStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Access the notifications.mass.getStats method correctly
      const stats = await api.notifications.mass.getStats();
      return stats;
    } catch (err: any) {
      setError(err);
      toast.error('Failed to fetch notification statistics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    createNotification,
    getNotificationStats
  };
};
