
import { useState, useEffect } from "react";
import { versions } from "@/lib/api";
import { TableVersion, VersionDiff } from "@/lib/api/types";
import { toast } from "sonner";

export const useTableVersions = (tableId: string) => {
  const [versions, setVersions] = useState<TableVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<TableVersion | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const [allVersions, current] = await Promise.all([
        api.versions.getTableVersions(tableId),
        api.versions.getCurrentTableVersion(tableId)
      ]);
      
      setVersions(allVersions);
      setCurrentVersion(current);
      setError(null);
    } catch (err) {
      console.error("Error fetching table versions:", err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast.error("Failed to load table versions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tableId) {
      fetchVersions();
    }
  }, [tableId]);

  const createVersion = async (schema: any, description?: string) => {
    try {
      const newVersion = await api.versions.createTableVersion(tableId, schema, description);
      setVersions(prev => [newVersion, ...prev]);
      setCurrentVersion(newVersion);
      return newVersion;
    } catch (err) {
      console.error("Error creating table version:", err);
      toast.error("Failed to create table version");
      throw err;
    }
  };

  const activateVersion = async (versionId: string) => {
    try {
      await api.versions.activateTableVersion(versionId);
      
      // Update local state after activation
      const activatedVersion = versions.find(v => v.id === versionId);
      if (activatedVersion) {
        // Update the active status in our local state
        setVersions(prevVersions => 
          prevVersions.map(v => ({
            ...v,
            isActive: v.id === versionId
          }))
        );
        
        // Set as current version
        setCurrentVersion({
          ...activatedVersion,
          isActive: true
        });
      }
      
      toast.success("Version activated successfully");
    } catch (err) {
      console.error("Error activating table version:", err);
      toast.error("Failed to activate version");
      throw err;
    }
  };

  const compareVersions = async (versionId1: string, versionId2: string): Promise<VersionDiff> => {
    try {
      return await api.versions.compareTableVersions(versionId1, versionId2);
    } catch (err) {
      console.error("Error comparing versions:", err);
      toast.error("Failed to compare versions");
      throw err;
    }
  };

  return {
    versions,
    currentVersion,
    isLoading,
    error,
    createVersion,
    activateVersion,
    compareVersions,
    refresh: fetchVersions
  };
};

// Fix import and referenced variable naming issue
import { api } from "@/lib/api";
