
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SchoolStatistics {
  totalSchools: number;
  regionsWithSchools: number;
  sectorsWithSchools: number;
  formSubmissions: number;
  formCompletionRate: number;
  schoolsWithData: number;
}

interface FormStatistics {
  totalForms: number;
  submittedForms: number;
  approvedForms: number;
  pendingForms: number;
  completionRate: number;
}

export function useStatistics() {
  const fetchSchoolStatistics = async (): Promise<SchoolStatistics> => {
    try {
      // In a real implementation, this would be an API call or database query
      // For now, we'll mock the data
      const mockData = {
        totalSchools: 150,
        regionsWithSchools: 8,
        sectorsWithSchools: 24,
        formSubmissions: 120,
        formCompletionRate: 0.8,
        schoolsWithData: 95,
      };

      return mockData;
    } catch (error) {
      console.error("Error fetching school statistics:", error);
      throw error;
    }
  };

  const fetchFormStatistics = async (): Promise<FormStatistics> => {
    try {
      // In a real implementation, this would call the edge function
      const { data, error } = await supabase.functions.invoke("get-form-statistics", {
        body: { /* pass any parameters here */ },
      });

      if (error) {
        throw error;
      }

      // If we got data back, use it, otherwise use mock data
      if (data) {
        return data;
      }

      // Mock data as fallback
      return {
        totalForms: 200,
        submittedForms: 150,
        approvedForms: 120,
        pendingForms: 30,
        completionRate: 0.75,
      };
    } catch (error) {
      console.error("Error fetching form statistics:", error);
      
      // Return mock data in case of error
      return {
        totalForms: 200,
        submittedForms: 150,
        approvedForms: 120,
        pendingForms: 30,
        completionRate: 0.75,
      };
    }
  };

  const schoolStatsQuery = useQuery({
    queryKey: ["schoolStatistics"],
    queryFn: fetchSchoolStatistics,
  });

  const formStatsQuery = useQuery({
    queryKey: ["formStatistics"],
    queryFn: fetchFormStatistics,
  });

  return {
    schoolStats: schoolStatsQuery.data,
    isLoadingSchoolStats: schoolStatsQuery.isLoading,
    isErrorSchoolStats: schoolStatsQuery.isError,
    errorSchoolStats: schoolStatsQuery.error,

    formStats: formStatsQuery.data,
    isLoadingFormStats: formStatsQuery.isLoading,
    isErrorFormStats: formStatsQuery.isError,
    errorFormStats: formStatsQuery.error,
  };
}
