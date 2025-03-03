
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function useNotificationRecipients() {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all school admins
  const {
    data: schoolAdmins = [],
    isLoading: isSchoolAdminsLoading,
  } = useQuery({
    queryKey: ['schoolAdmins'],
    queryFn: async () => {
      // This is a mock function for now
      // In a real app, this would come from a proper API endpoint
      return [
        { id: 'admin1', name: 'Admin 1', email: 'admin1@example.com' },
        { id: 'admin2', name: 'Admin 2', email: 'admin2@example.com' },
      ];
    },
  });

  // Fetch notification stats
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
    schoolAdmins,
    stats,
    isLoading: isLoading || isSchoolAdminsLoading || isStatsLoading,
    error: statsError,
    refetchStats,
  };
}
