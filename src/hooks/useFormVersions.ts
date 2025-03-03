
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FormEntryVersion } from "@/lib/api/types";

export function useFormVersions(formEntryId: string) {
  const queryClient = useQueryClient();
  
  const versionsQuery = useQuery({
    queryKey: ['formVersions', formEntryId],
    queryFn: () => api.versions.getFormEntryVersions(formEntryId),
    enabled: !!formEntryId
  });
  
  const createVersionMutation = useMutation({
    mutationFn: ({ tableVersionId, data }: { tableVersionId: string, data: any }) => 
      api.versions.createFormEntryVersion(formEntryId, tableVersionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formVersions', formEntryId] });
    }
  });
  
  return {
    versions: versionsQuery.data || [],
    isLoading: versionsQuery.isLoading,
    error: versionsQuery.error,
    createVersion: async (tableVersionId: string, data: any) => {
      await createVersionMutation.mutateAsync({ tableVersionId, data });
    },
    migrateData: async (data: any, fromVersionId: string, toVersionId: string) => {
      return api.versions.migrateFormData(data, fromVersionId, toVersionId);
    }
  };
}
