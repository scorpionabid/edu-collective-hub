
import { useState } from 'react';
import { api } from '@/lib/api';
import { 
  MassNotification, 
  CreateMassNotificationData, 
  GetMassNotificationsParams 
} from '@/lib/api/types';

export const useMassNotifications = () => {
  const [notifications, setNotifications] = useState<MassNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = async (params?: GetMassNotificationsParams) => {
    setLoading(true);
    try {
      const data = await api.notifications.getMassNotifications(params);
      setNotifications(data);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (notificationData: CreateMassNotificationData) => {
    setLoading(true);
    try {
      const notification = await api.notifications.createMassNotification(notificationData);
      setNotifications(prev => [notification, ...prev]);
      return notification;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    createNotification
  };
};
