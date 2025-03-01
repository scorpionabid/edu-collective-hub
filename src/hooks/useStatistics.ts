
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StatCountsByCategory {
  categoryId: string;
  categoryName: string;
  totalForms: number;
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
}

interface StatCountsByRegion {
  regionId: string;
  regionName: string;
  totalSchools: number;
  formCounts: {
    totalForms: number;
    draft: number;
    submitted: number;
    approved: number;
    rejected: number;
  };
}

export function useStatistics() {
  const fetchCategoryCounts = async (): Promise<StatCountsByCategory[]> => {
    try {
      // This would typically be a Supabase edge function
      const { data, error } = await supabase.functions.invoke(
        'get-form-statistics',
        {
          body: { type: 'category' }
        }
      );

      if (error) {
        console.error('Error fetching category statistics:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchCategoryCounts:', error);
      return [];
    }
  };

  const fetchRegionCounts = async (): Promise<StatCountsByRegion[]> => {
    try {
      // This would typically be a Supabase edge function
      const { data, error } = await supabase.functions.invoke(
        'get-form-statistics',
        {
          body: { type: 'region' }
        }
      );

      if (error) {
        console.error('Error fetching region statistics:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchRegionCounts:', error);
      return [];
    }
  };

  const categoryCounts = useQuery({
    queryKey: ['statistics', 'category'],
    queryFn: fetchCategoryCounts,
  });

  const regionCounts = useQuery({
    queryKey: ['statistics', 'region'],
    queryFn: fetchRegionCounts,
  });

  return {
    categoryCounts,
    regionCounts,
  };
}
