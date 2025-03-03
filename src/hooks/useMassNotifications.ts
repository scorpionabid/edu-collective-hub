
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { CreateMassNotificationData, GetMassNotificationsParams } from '@/lib/api/types';

export function useMassNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch mass notifications
  const {
    data: notifications = [],
    isLoading: isNotificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['massNotifications'],
    queryFn: () => api.notifications.mass.getMassNotifications(),
  });

  // Create mass notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: (data: CreateMassNotificationData) => 
      api.notifications.mass.createMassNotification(data),
    onSuccess: () => {
      toast.success('Notification created successfully');
      queryClient.invalidateQueries({ queryKey: ['massNotifications'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create notification: ${error.message}`);
    },
  });

  // Create mass notification function
  const createMassNotification = async (data: CreateMassNotificationData) => {
    setIsLoading(true);
    try {
      await createNotificationMutation.mutateAsync(data);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get notification stats
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['notificationStats'],
    queryFn: () => api.notifications.mass.getNotificationStats(),
  });

  return {
    notifications,
    stats,
    isLoading: isLoading || isNotificationsLoading || isStatsLoading,
    error: notificationsError || statsError,
    createMassNotification,
    refetchNotifications,
    refetchStats,
  };
}
