
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
  
  const currentVersionQuery = useQuery({
    queryKey: ['currentTableVersion', tableId],
    queryFn: () => api.versions.getCurrentTableVersion(tableId),
    enabled: !!tableId
  });
  
  const createVersionMutation = useMutation({
    mutationFn: ({ schema, description }: { schema: any, description?: string }) => 
      api.versions.createTableVersion(tableId, schema, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tableVersions', tableId] });
      queryClient.invalidateQueries({ queryKey: ['currentTableVersion', tableId] });
    }
  });
  
  const activateVersionMutation = useMutation({
    mutationFn: (versionId: string) => api.versions.activateTableVersion(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tableVersions', tableId] });
      queryClient.invalidateQueries({ queryKey: ['currentTableVersion', tableId] });
    }
  });
  
  return {
    versions: versionsQuery.data || [],
    currentVersion: currentVersionQuery.data || null,
    isLoading: versionsQuery.isLoading || currentVersionQuery.isLoading,
    error: versionsQuery.error || currentVersionQuery.error,
    createVersion: async (schema: any, description?: string) => {
      await createVersionMutation.mutateAsync({ schema, description });
    },
    activateVersion: async (versionId: string) => {
      await activateVersionMutation.mutateAsync(versionId);
    },
    compareVersions: async (versionId1: string, versionId2: string) => {
      return api.versions.compareTableVersions(versionId1, versionId2);
    }
  };
}
