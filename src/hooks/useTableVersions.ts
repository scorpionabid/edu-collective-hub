
import { useState } from 'react';
import { api } from '@/lib/api';
import { TableVersion, VersionDiff, FormEntryVersion } from '@/lib/api/types';

export const useTableVersions = () => {
  const [versions, setVersions] = useState<TableVersion[]>([]);
  const [activeVersion, setActiveVersion] = useState<TableVersion | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getTableVersions = async (tableId: string) => {
    setLoading(true);
    try {
      const data = await api.versions.getTableVersions(tableId);
      setVersions(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getActiveVersion = async (tableId: string) => {
    setLoading(true);
    try {
      const data = await api.versions.getActiveTableVersion(tableId);
      setActiveVersion(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createTableVersion = async (tableId: string, schema: any) => {
    setLoading(true);
    try {
      const data = await api.versions.createTableVersion(tableId, schema);
      if (data) {
        // Update the versions list if creation was successful
        getTableVersions(tableId);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const compareVersions = async (tableId: string, version1: number, version2: number) => {
    setLoading(true);
    try {
      const data = await api.versions.compareVersions(tableId, version1, version2);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Form entry version methods
  const getFormEntryVersions = async (formEntryId: string) => {
    setLoading(true);
    try {
      const data = await api.versions.getFormEntryVersions(formEntryId);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getFormEntryVersion = async (formEntryId: string, versionNumber: number) => {
    setLoading(true);
    try {
      const data = await api.versions.getFormEntryVersion(formEntryId, versionNumber);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createFormEntryVersion = async (formEntryId: string, data: any, tableVersionId?: string) => {
    setLoading(true);
    try {
      const result = await api.versions.createFormEntryVersion(formEntryId, data, tableVersionId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    versions,
    activeVersion,
    loading,
    error,
    getTableVersions,
    getActiveVersion,
    createTableVersion,
    compareVersions,
    getFormEntryVersions,
    getFormEntryVersion,
    createFormEntryVersion
  };
};
