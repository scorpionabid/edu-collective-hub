
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CreateMassNotificationData, GetMassNotificationsParams } from '@/lib/api/types';
import { toast } from 'sonner';

export const useMassNotifications = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Get all mass notifications
  const {
    data: notifications,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['mass-notifications'],
    queryFn: async () => {
      if (api.mass && api.mass.getMassNotifications) {
        return api.mass.getMassNotifications();
      }
      setError('API method not available: getMassNotifications');
      return [];
    }
  });

  // Create a new mass notification
  const createMutation = useMutation({
    mutationFn: async (data: CreateMassNotificationData) => {
      if (api.mass && api.mass.createMassNotification) {
        return api.mass.createMassNotification(data);
      }
      throw new Error('API method not available: createMassNotification');
    },
    onSuccess: () => {
      toast.success('Mass notification created successfully');
      queryClient.invalidateQueries({ queryKey: ['mass-notifications'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create mass notification');
      setError(error.message || 'Failed to create mass notification');
    }
  });

  // Create a new mass notification
  const createNotification = useCallback(async (data: CreateMassNotificationData) => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  return {
    notifications,
    isLoading,
    isError,
    error,
    createNotification,
    refetch
  };
};
