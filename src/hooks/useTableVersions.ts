
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TableVersion, VersionDiff } from "@/lib/api/types";

export function useTableVersions(tableId: string) {
  const queryClient = useQueryClient();
  
  const versionsQuery = useQuery({
    queryKey: ['tableVersions', tableId],
    queryFn: () => api.versions.getTableVersions(tableId),
    enabled: !!tableId
  });
  
  const latestVersionQuery = useQuery({
    queryKey: ['latestTableVersion', tableId],
    queryFn: () => api.versions.getLatestTableVersion(tableId),
    enabled: !!tableId
  });
  
  const createVersionMutation = useMutation({
    mutationFn: ({ schema, createdBy }: { schema: any, createdBy: string }) => 
      api.versions.createTableVersion(tableId, schema, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tableVersions', tableId] });
      queryClient.invalidateQueries({ queryKey: ['latestTableVersion', tableId] });
    }
  });
  
  // Removed activateVersionMutation since it doesn't exist in API
  
  return {
    versions: versionsQuery.data || [],
    currentVersion: latestVersionQuery.data,
    isLoading: versionsQuery.isLoading || latestVersionQuery.isLoading,
    error: versionsQuery.error || latestVersionQuery.error,
    createVersion: async (schema: any, createdBy: string) => {
      await createVersionMutation.mutateAsync({ schema, createdBy });
    },
    compareVersions: async (versionId1: string, versionId2: string) => {
      return api.versions.compareTableVersions(versionId1, versionId2);
    }
  };
}
