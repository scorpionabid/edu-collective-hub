
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TableVersion, FormEntryVersion, VersionDiff } from "./types";

export const versions = {
  // Table versions
  getTableVersions: async (tableId: string): Promise<TableVersion[]> => {
    try {
      const { data, error } = await supabase
        .from('table_versions')
        .select('*')
        .eq('table_id', tableId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data as TableVersion[];
    } catch (error) {
      console.error('Error fetching table versions:', error);
      toast.error('Failed to load table versions');
      return [];
    }
  },

  getActiveTableVersion: async (tableId: string): Promise<TableVersion | null> => {
    try {
      const { data, error } = await supabase
        .from('table_versions')
        .select('*')
        .eq('table_id', tableId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as TableVersion;
    } catch (error) {
      console.error('Error fetching active table version:', error);
      toast.error('Failed to load active table version');
      return null;
    }
  },

  createTableVersion: async (tableId: string, schema: any): Promise<TableVersion | null> => {
    try {
      // Get the latest version number
      const { data: versions, error: versionsError } = await supabase
        .from('table_versions')
        .select('version_number')
        .eq('table_id', tableId)
        .order('version_number', { ascending: false })
        .limit(1);

      if (versionsError) throw versionsError;

      const newVersionNumber = versions.length > 0 ? versions[0].version_number + 1 : 1;

      // Deactivate current active version
      await supabase
        .from('table_versions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('table_id', tableId)
        .eq('is_active', true);

      // Create new version
      const { data, error } = await supabase
        .from('table_versions')
        .insert({
          table_id: tableId,
          version_number: newVersionNumber,
          schema,
          is_active: true,
          started_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Table version created successfully');
      return data as TableVersion;
    } catch (error) {
      console.error('Error creating table version:', error);
      toast.error('Failed to create table version');
      return null;
    }
  },

  compareVersions: async (tableId: string, version1: number, version2: number): Promise<VersionDiff | null> => {
    try {
      const { data: v1, error: e1 } = await supabase
        .from('table_versions')
        .select('schema')
        .eq('table_id', tableId)
        .eq('version_number', version1)
        .single();

      const { data: v2, error: e2 } = await supabase
        .from('table_versions')
        .select('schema')
        .eq('table_id', tableId)
        .eq('version_number', version2)
        .single();

      if (e1 || e2) throw e1 || e2;

      const schema1 = v1.schema;
      const schema2 = v2.schema;

      // Compare the schemas
      const keys1 = Object.keys(schema1);
      const keys2 = Object.keys(schema2);

      const added = keys2.filter(k => !keys1.includes(k));
      const removed = keys1.filter(k => !keys2.includes(k));
      const modified = keys1.filter(k => 
        keys2.includes(k) && JSON.stringify(schema1[k]) !== JSON.stringify(schema2[k])
      );

      return { added, removed, modified };
    } catch (error) {
      console.error('Error comparing versions:', error);
      toast.error('Failed to compare versions');
      return null;
    }
  },

  // Form entry versions
  getFormEntryVersions: async (formEntryId: string): Promise<FormEntryVersion[]> => {
    try {
      const { data, error } = await supabase
        .from('form_entry_versions')
        .select('*')
        .eq('form_entry_id', formEntryId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data as FormEntryVersion[];
    } catch (error) {
      console.error('Error fetching form entry versions:', error);
      toast.error('Failed to load form entry versions');
      return [];
    }
  },

  getFormEntryVersion: async (formEntryId: string, versionNumber: number): Promise<FormEntryVersion | null> => {
    try {
      const { data, error } = await supabase
        .from('form_entry_versions')
        .select('*')
        .eq('form_entry_id', formEntryId)
        .eq('version_number', versionNumber)
        .single();

      if (error) throw error;
      return data as FormEntryVersion;
    } catch (error) {
      console.error('Error fetching form entry version:', error);
      toast.error('Failed to load form entry version');
      return null;
    }
  },

  createFormEntryVersion: async (formEntryId: string, data: any, tableVersionId?: string): Promise<FormEntryVersion | null> => {
    try {
      // Get the latest version number
      const { data: versions, error: versionsError } = await supabase
        .from('form_entry_versions')
        .select('version_number')
        .eq('form_entry_id', formEntryId)
        .order('version_number', { ascending: false })
        .limit(1);

      if (versionsError) throw versionsError;

      const newVersionNumber = versions.length > 0 ? versions[0].version_number + 1 : 1;

      // Create new version
      const { data: newVersion, error } = await supabase
        .from('form_entry_versions')
        .insert({
          form_entry_id: formEntryId,
          version_number: newVersionNumber,
          data,
          table_version_id: tableVersionId,
          created_at: new Date().toISOString(),
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Form entry version created successfully');
      return newVersion as FormEntryVersion;
    } catch (error) {
      console.error('Error creating form entry version:', error);
      toast.error('Failed to create form entry version');
      return null;
    }
  }
};
