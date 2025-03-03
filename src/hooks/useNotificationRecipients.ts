
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { NotificationStats } from "@/lib/api";

export const useNotificationRecipients = (notificationId: string) => {
  const { 
    data: recipients = [], 
    isLoading: recipientsLoading, 
    error: recipientsError 
  } = useQuery({
    queryKey: ['notificationRecipients', notificationId],
    queryFn: () => api.notifications.getNotificationRecipients(notificationId),
    enabled: !!notificationId,
  });

  const { 
    data: stats = { total: 0, pending: 0, sent: 0, failed: 0, read: 0 } as NotificationStats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useQuery({
    queryKey: ['notificationStats', notificationId],
    queryFn: () => api.notifications.getNotificationStats(notificationId),
    enabled: !!notificationId,
  });

  return {
    recipients,
    stats,
    isLoading: recipientsLoading || statsLoading,
    error: (recipientsError || statsError) as Error | null
  };
};
