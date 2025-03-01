
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FormStatistics {
  totalForms: number;
  submittedForms: number;
  approvedForms: number;
  rejectedForms: number;
  sectors: {
    name: string;
    formCount: number;
    approvedCount: number;
  }[];
  schools: {
    name: string;
    formCount: number;
    approvedCount: number;
  }[];
}

export const useStatistics = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["statistics"],
    queryFn: async () => {
      // Initially, we're using a mock response since the actual function isn't deployed yet
      const mockData: FormStatistics = {
        totalForms: 120,
        submittedForms: 85,
        approvedForms: 72,
        rejectedForms: 8,
        sectors: [
          { name: "Xətai", formCount: 32, approvedCount: 27 },
          { name: "Nəsimi", formCount: 28, approvedCount: 21 },
          { name: "Yasamal", formCount: 25, approvedCount: 24 },
        ],
        schools: [
          { name: "Məktəb №45", formCount: 12, approvedCount: 10 },
          { name: "Məktəb №23", formCount: 10, approvedCount: 8 },
          { name: "Məktəb №189", formCount: 9, approvedCount: 9 },
        ],
      };

      // Uncomment this when the edge function is deployed
      /*
      const { data, error } = await supabase.functions.invoke("get-form-statistics", {
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (error) {
        console.error("Error fetching statistics:", error);
        throw error;
      }

      return data as FormStatistics;
      */

      return mockData;
    },
  });

  return {
    statistics: data,
    isLoading,
    error,
  };
};
