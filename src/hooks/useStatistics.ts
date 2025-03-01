
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useStatistics() {
  const { user } = useAuth();
  
  // Determine the parameters based on user role
  const getQueryParams = () => {
    if (!user) return null;
    
    if (user.role === 'schooladmin' && user.schoolId) {
      return `schoolId=${user.schoolId}`;
    } else if (user.role === 'sectoradmin' && user.sectorId) {
      return `sectorId=${user.sectorId}`;
    } else if (user.role === 'regionadmin' && user.regionId) {
      return `regionId=${user.regionId}`;
    } else if (user.role === 'superadmin') {
      return '';
    }
    
    return null;
  };
  
  const params = getQueryParams();
  
  const statisticsQuery = useQuery({
    queryKey: ['statistics', params],
    queryFn: async () => {
      if (params === null) return null;
      
      const { data, error } = await supabase.functions.invoke('get-form-statistics', {
        query: params
      });
      
      if (error) {
        console.error('Error fetching statistics:', error);
        throw error;
      }
      
      return data;
    },
    enabled: params !== null
  });
  
  return {
    statistics: statisticsQuery.data,
    isLoading: statisticsQuery.isLoading,
    isError: statisticsQuery.isError,
    error: statisticsQuery.error
  };
}
