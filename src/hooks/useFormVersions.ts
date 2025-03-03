
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { FormEntryVersion } from "@/lib/api/types";
import { toast } from "sonner";

export const useFormVersions = (formEntryId: string) => {
  const [versions, setVersions] = useState<FormEntryVersion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVersions = async () => {
    if (!formEntryId) {
      setVersions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const formVersions = await api.versions.getFormEntryVersions(formEntryId);
      setVersions(formVersions);
      setError(null);
    } catch (err) {
      console.error("Error fetching form versions:", err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast.error("Failed to load form versions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (formEntryId) {
      fetchVersions();
    }
  }, [formEntryId]);

  const createVersion = async (tableVersionId: string, data: any) => {
    try {
      const newVersion = await api.versions.createFormEntryVersion(
        formEntryId,
        tableVersionId,
        data
      );
      setVersions(prev => [newVersion, ...prev]);
      return newVersion;
    } catch (err) {
      console.error("Error creating form version:", err);
      toast.error("Failed to create form version");
      throw err;
    }
  };

  const migrateData = async (data: any, fromVersionId: string, toVersionId: string) => {
    try {
      return await api.versions.migrateFormData(data, fromVersionId, toVersionId);
    } catch (err) {
      console.error("Error migrating form data:", err);
      toast.error("Failed to migrate form data");
      throw err;
    }
  };

  return {
    versions,
    isLoading,
    error,
    createVersion,
    migrateData,
    refresh: fetchVersions
  };
};
