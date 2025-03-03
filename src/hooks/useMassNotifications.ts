
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { CreateMassNotificationData, GetMassNotificationsParams } from '@/lib/api/types';

export const useMassNotifications = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['massNotifications'],
    queryFn: async () => {
      try {
        const response = await api.notifications.mass.getMassNotifications();
        return response;
      } catch (err) {
        console.error('Error fetching mass notifications:', err);
        setError('Failed to load notifications');
        return [];
      }
    },
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (data: CreateMassNotificationData) => {
      try {
        return await api.notifications.mass.createMassNotification(data);
      } catch (err) {
        console.error('Error creating mass notification:', err);
        throw new Error('Failed to create notification');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['massNotifications'] });
      toast.success('Notification created and queued for delivery');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create notification');
      setError(error.message || 'Failed to create notification');
    },
  });

  const createNotification = (data: CreateMassNotificationData) => {
    createNotificationMutation.mutate(data);
  };

  return {
    notifications,
    isLoading,
    isError,
    error,
    createNotification,
    refetch,
  };
};
