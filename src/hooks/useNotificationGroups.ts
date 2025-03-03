
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateNotificationGroupData, UpdateNotificationGroupData, NotificationGroup } from "@/lib/api";

export const useNotificationGroups = () => {
  const queryClient = useQueryClient();
  
  const { 
    data: groups = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['notificationGroups'],
    queryFn: api.notifications.getNotificationGroups,
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: CreateNotificationGroupData) => api.notifications.createNotificationGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationGroups'] });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNotificationGroupData }) => 
      api.notifications.updateNotificationGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationGroups'] });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => api.notifications.deleteNotificationGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationGroups'] });
    },
  });

  const createGroup = async (data: CreateNotificationGroupData): Promise<NotificationGroup> => {
    return createGroupMutation.mutateAsync(data);
  };

  const updateGroup = async (id: string, data: UpdateNotificationGroupData): Promise<NotificationGroup> => {
    return updateGroupMutation.mutateAsync({ id, data });
  };

  const deleteGroup = async (id: string): Promise<void> => {
    return deleteGroupMutation.mutateAsync(id);
  };

  return {
    groups,
    isLoading,
    error: error as Error | null,
    createGroup,
    updateGroup,
    deleteGroup
  };
};
