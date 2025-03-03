
import { useState } from 'react';
import { api } from '@/lib/api';
import { FormEntryVersion } from '@/lib/api/types';

export const useFormVersions = () => {
  const [versions, setVersions] = useState<FormEntryVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<FormEntryVersion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFormVersions = async (formEntryId: string) => {
    setLoading(true);
    try {
      const data = await api.versions.getFormEntryVersions(formEntryId);
      setVersions(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getFormVersion = async (formEntryId: string, versionNumber: number) => {
    setLoading(true);
    try {
      const data = await api.versions.getFormEntryVersion(formEntryId, versionNumber);
      setCurrentVersion(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createFormVersion = async (formEntryId: string, formData: any, tableVersionId?: string) => {
    setLoading(true);
    try {
      const data = await api.versions.createFormEntryVersion(formEntryId, formData, tableVersionId);
      if (data) {
        // Re-fetch the versions list if creation was successful
        getFormVersions(formEntryId);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    versions,
    currentVersion,
    loading,
    error,
    getFormVersions,
    getFormVersion,
    createFormVersion
  };
};
