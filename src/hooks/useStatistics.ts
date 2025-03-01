
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useStatistics() {
  const dashboardStatsQuery = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-form-statistics');
        
        if (error) {
          throw new Error(`Error fetching statistics: ${error.message}`);
        }
        
        return data || { 
          totalSchools: 0, 
          totalFormSubmissions: 0,
          formsApproved: 0,
          formsRejected: 0,
          submissionsByRegion: [],
          submissionsByDay: [] 
        };
      } catch (err) {
        console.error("Failed to fetch dashboard statistics:", err);
        throw err;
      }
    }
  });

  return {
    statistics: dashboardStatsQuery.data,
    isLoading: dashboardStatsQuery.isLoading,
    isError: dashboardStatsQuery.isError,
    error: dashboardStatsQuery.error
  };
}
