
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { CreateNotificationGroupData, UpdateNotificationGroupData } from '@/lib/api/types';

export function useNotificationGroups() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notification groups
  const {
    data: groups = [],
    isLoading: isGroupsLoading,
    error: groupsError,
    refetch: refetchGroups,
  } = useQuery({
    queryKey: ['notificationGroups'],
    queryFn: () => api.notifications.groups.getNotificationGroups(),
  });

  // Create notification group mutation
  const createGroupMutation = useMutation({
    mutationFn: (data: CreateNotificationGroupData) => 
      api.notifications.groups.createNotificationGroup(data),
    onSuccess: () => {
      toast.success('Group created successfully');
      queryClient.invalidateQueries({ queryKey: ['notificationGroups'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create group: ${error.message}`);
    },
  });

  // Update notification group mutation
  const updateGroupMutation = useMutation({
    mutationFn: (data: UpdateNotificationGroupData) => 
      api.notifications.groups.updateNotificationGroup(data),
    onSuccess: () => {
      toast.success('Group updated successfully');
      queryClient.invalidateQueries({ queryKey: ['notificationGroups'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update group: ${error.message}`);
    },
  });

  // Delete notification group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => 
      api.notifications.groups.deleteNotificationGroup(id),
    onSuccess: () => {
      toast.success('Group deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['notificationGroups'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete group: ${error.message}`);
    },
  });

  // Create group function
  const createGroup = async (data: CreateNotificationGroupData) => {
    setIsLoading(true);
    try {
      await createGroupMutation.mutateAsync(data);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update group function
  const updateGroup = async (data: UpdateNotificationGroupData) => {
    setIsLoading(true);
    try {
      await updateGroupMutation.mutateAsync(data);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete group function
  const deleteGroup = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteGroupMutation.mutateAsync(id);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    groups,
    isLoading: isLoading || isGroupsLoading,
    error: groupsError,
    createGroup,
    updateGroup,
    deleteGroup,
    refetchGroups,
  };
}
