
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
    mutationFn: ({ tableVersionId, data, createdBy }: { tableVersionId: string, data: any, createdBy: string }) => 
      api.versions.createFormEntryVersion(formEntryId, tableVersionId, data, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formVersions', formEntryId] });
    }
  });
  
  return {
    versions: versionsQuery.data || [],
    isLoading: versionsQuery.isLoading,
    error: versionsQuery.error,
    createVersion: async (tableVersionId: string, data: any, createdBy: string) => {
      await createVersionMutation.mutateAsync({ tableVersionId, data, createdBy });
    }
    // Removed migrateData function as it doesn't exist in the API
  };
}
