
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateMassNotificationData, GetMassNotificationsParams, MassNotification } from "@/lib/api";

export const useMassNotifications = (params?: GetMassNotificationsParams) => {
  const queryClient = useQueryClient();
  
  const { 
    data: notifications = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['massNotifications', params],
    queryFn: () => api.notifications.getMassNotifications(params),
  });

  const createNotificationMutation = useMutation({
    mutationFn: (data: CreateMassNotificationData) => api.notifications.createMassNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['massNotifications'] });
    },
  });

  const createNotification = async (data: CreateMassNotificationData): Promise<MassNotification> => {
    return createNotificationMutation.mutateAsync(data);
  };

  return {
    notifications,
    isLoading,
    error: error as Error | null,
    createNotification
  };
};
