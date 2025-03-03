
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { NotificationStats } from '@/lib/api/types';

export const useNotificationRecipients = (notificationId: string) => {
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    sent: 0,
    pending: 0,
    failed: 0,
    read: 0,
    delivered: 0,
    totalSent: 0
  });
  const [error, setError] = useState<string | null>(null);

  // Get notification stats
  const {
    data: recipients,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['notification-recipients', notificationId],
    queryFn: async () => {
      if (api.mass && api.mass.getNotificationRecipients) {
        return api.mass.getNotificationRecipients(notificationId);
      }
      setError('API method not available: getNotificationRecipients');
      return [];
    },
    enabled: !!notificationId
  });

  // Get notification stats
  const getStats = useCallback(async () => {
    try {
      if (api.mass && api.mass.getNotificationStats) {
        const notificationStats = await api.mass.getNotificationStats(notificationId);
        setStats({
          total: notificationStats.total,
          sent: notificationStats.sent,
          pending: notificationStats.pending,
          failed: notificationStats.failed,
          read: notificationStats.read,
          delivered: notificationStats.delivered,
          totalSent: notificationStats.totalSent
        });
        return notificationStats;
      }
      setError('API method not available: getNotificationStats');
      return null;
    } catch (error: any) {
      setError(error.message || 'Failed to get notification stats');
      return null;
    }
  }, [notificationId]);

  // Get stats on initial load
  useEffect(() => {
    if (notificationId) {
      getStats();
    }
  }, [notificationId, getStats]);

  return {
    recipients,
    stats,
    isLoading,
    isError,
    error,
    refreshStats: getStats,
    refreshRecipients: refetch
  };
};
