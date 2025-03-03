
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { NotificationStats } from '@/lib/api/types';

export const useNotificationRecipients = (notificationId?: string) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    sent: 0,
    pending: 0,
    failed: 0,
    read: 0,
    totalSent: 0,
    delivered: 0
  });

  const {
    data: recipients = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['notificationRecipients', notificationId],
    queryFn: async () => {
      if (!notificationId) return [];
      try {
        const response = await api.notifications.mass.getNotificationRecipients(notificationId);
        return response;
      } catch (err) {
        console.error('Error fetching notification recipients:', err);
        setError('Failed to load recipients');
        return [];
      }
    },
    enabled: !!notificationId,
  });

  useEffect(() => {
    if (notificationId) {
      const fetchStats = async () => {
        try {
          const response = await api.notifications.mass.getNotificationStats(notificationId);
          setStats({
            total: response.total,
            sent: response.sent,
            pending: response.pending,
            failed: response.failed,
            read: response.read,
            totalSent: response.totalSent,
            delivered: response.delivered
          });
        } catch (err) {
          console.error('Error fetching notification stats:', err);
        }
      };
      
      fetchStats();
    }
  }, [notificationId]);

  return {
    recipients,
    stats,
    isLoading,
    isError,
    error,
    refetch,
  };
};
