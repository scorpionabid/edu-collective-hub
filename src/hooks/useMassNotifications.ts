
import { useState } from 'react';
import { api } from '@/lib/api';
import { MassNotification, CreateMassNotificationData, GetMassNotificationsParams } from '@/lib/api/types';

export function useMassNotifications() {
  const [notifications, setNotifications] = useState<MassNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch mass notifications with optional filtering
  const fetchMassNotifications = async (params?: GetMassNotificationsParams) => {
    setLoading(true);
    try {
      const data = await api.notifications.getMassNotifications(params);
      setNotifications(data);
      setTotalCount(data.length);
    } catch (error) {
      console.error('Error fetching mass notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new mass notification
  const createMassNotification = async (data: CreateMassNotificationData) => {
    setLoading(true);
    try {
      const result = await api.notifications.createMassNotification(data);
      // Refresh the list if successful
      if (result) {
        await fetchMassNotifications();
      }
      return result;
    } catch (error) {
      console.error('Error creating mass notification:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    notifications,
    loading,
    totalCount,
    fetchMassNotifications,
    createMassNotification
  };
}
