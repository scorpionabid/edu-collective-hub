
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { NotificationGroup, CreateNotificationGroupData, UpdateNotificationGroupData } from '@/lib/api/types';
import { toast } from 'sonner';

export const useNotificationGroups = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Get all notification groups
  const {
    data: groups,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['notification-groups'],
    queryFn: async () => {
      if (api.groups && api.groups.getNotificationGroups) {
        return api.groups.getNotificationGroups();
      }
      setError('API method not available: getNotificationGroups');
      return [];
    }
  });

  // Create a new notification group
  const createMutation = useMutation({
    mutationFn: async (data: CreateNotificationGroupData) => {
      if (api.groups && api.groups.createNotificationGroup) {
        return api.groups.createNotificationGroup(data);
      }
      throw new Error('API method not available: createNotificationGroup');
    },
    onSuccess: () => {
      toast.success('Notification group created successfully');
      queryClient.invalidateQueries({ queryKey: ['notification-groups'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create notification group');
      setError(error.message || 'Failed to create notification group');
    }
  });

  // Update an existing notification group
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateNotificationGroupData) => {
      if (api.groups && api.groups.updateNotificationGroup) {
        return api.groups.updateNotificationGroup(data.id, {
          name: data.name,
          description: data.description
        });
      }
      throw new Error('API method not available: updateNotificationGroup');
    },
    onSuccess: () => {
      toast.success('Notification group updated successfully');
      queryClient.invalidateQueries({ queryKey: ['notification-groups'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update notification group');
      setError(error.message || 'Failed to update notification group');
    }
  });

  // Delete a notification group
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (api.groups && api.groups.deleteNotificationGroup) {
        return api.groups.deleteNotificationGroup(id);
      }
      throw new Error('API method not available: deleteNotificationGroup');
    },
    onSuccess: () => {
      toast.success('Notification group deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['notification-groups'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete notification group');
      setError(error.message || 'Failed to delete notification group');
    }
  });

  // Create a new notification group
  const createGroup = useCallback(async (data: CreateNotificationGroupData) => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  // Update an existing notification group
  const updateGroup = useCallback(async (data: UpdateNotificationGroupData) => {
    return updateMutation.mutateAsync(data);
  }, [updateMutation]);

  // Delete a notification group
  const deleteGroup = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    groups,
    isLoading,
    isError,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    refetch
  };
};
