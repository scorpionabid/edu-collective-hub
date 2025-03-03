
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { CreateNotificationGroupData, UpdateNotificationGroupData } from '@/lib/api/types';

export const useNotificationGroups = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    data: groups = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['notificationGroups'],
    queryFn: async () => {
      try {
        const response = await api.notifications.groups.getNotificationGroups();
        return response;
      } catch (err) {
        console.error('Error fetching notification groups:', err);
        setError('Failed to load notification groups');
        return [];
      }
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: CreateNotificationGroupData) => {
      try {
        return await api.notifications.groups.createNotificationGroup(data);
      } catch (err) {
        console.error('Error creating notification group:', err);
        throw new Error('Failed to create notification group');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationGroups'] });
      toast.success('Notification group created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create notification group');
      setError(error.message || 'Failed to create notification group');
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async (data: UpdateNotificationGroupData) => {
      try {
        return await api.notifications.groups.updateNotificationGroup(data);
      } catch (err) {
        console.error('Error updating notification group:', err);
        throw new Error('Failed to update notification group');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationGroups'] });
      toast.success('Notification group updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update notification group');
      setError(error.message || 'Failed to update notification group');
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      try {
        return await api.notifications.groups.deleteNotificationGroup(groupId);
      } catch (err) {
        console.error('Error deleting notification group:', err);
        throw new Error('Failed to delete notification group');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationGroups'] });
      toast.success('Notification group deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete notification group');
      setError(error.message || 'Failed to delete notification group');
    },
  });

  return {
    groups,
    isLoading,
    isError,
    error,
    createGroup: (data: CreateNotificationGroupData) => createGroupMutation.mutate(data),
    updateGroup: (data: UpdateNotificationGroupData) => updateGroupMutation.mutate(data),
    deleteGroup: (groupId: string) => deleteGroupMutation.mutate(groupId),
    refetch,
  };
};
