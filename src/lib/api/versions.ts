import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TableVersion, FormEntryVersion, VersionDiff } from "./types";

export const versions = {
  // Table version operations
  createTableVersion: async (tableId: string, schema: any, description?: string): Promise<TableVersion> => {
    try {
      // Get current version number
      const { data: existingVersions, error: fetchError } = await supabase
        .from('table_versions')
        .select('version_number')
        .eq('table_id', tableId)
        .order('version_number', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const versionNumber = existingVersions && existingVersions.length > 0 
        ? existingVersions[0].version_number + 1 
        : 1;

      // Deactivate all previous versions
      await supabase
        .from('table_versions')
        .update({ is_active: false })
        .eq('table_id', tableId);

      // Insert new version
      const { data, error } = await supabase
        .from('table_versions')
        .insert([
          { 
            table_id: tableId, 
            version_number: versionNumber, 
            schema, 
            is_active: true,
            description
          }
        ])
        .select('*')
        .single();

      if (error) throw error;

      toast.success('Table version created successfully');
      
      return {
        id: data.id,
        tableId: data.table_id,
        versionNumber: data.version_number,
        schema: data.schema,
        isActive: data.is_active,
        startedAt: data.started_at,
        endedAt: data.ended_at,
        createdBy: data.created_by,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error creating table version:', error);
      toast.error('Failed to create table version');
      throw error;
    }
  },

  getTableVersions: async (tableId: string): Promise<TableVersion[]> => {
    try {
      const { data, error } = await supabase
        .from('table_versions')
        .select('*')
        .eq('table_id', tableId)
        .order('version_number', { ascending: false });

      if (error) throw error;

      return data.map(version => ({
        id: version.id,
        tableId: version.table_id,
        versionNumber: version.version_number,
        schema: version.schema,
        isActive: version.is_active,
        startedAt: version.started_at,
        endedAt: version.ended_at,
        createdBy: version.created_by,
        createdAt: version.created_at
      }));
    } catch (error) {
      console.error('Error fetching table versions:', error);
      return [];
    }
  },

  getCurrentTableVersion: async (tableId: string): Promise<TableVersion | null> => {
    try {
      const { data, error } = await supabase
        .from('table_versions')
        .select('*')
        .eq('table_id', tableId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No active version found
          return null;
        }
        throw error;
      }

      return {
        id: data.id,
        tableId: data.table_id,
        versionNumber: data.version_number,
        schema: data.schema,
        isActive: data.is_active,
        startedAt: data.started_at,
        endedAt: data.ended_at,
        createdBy: data.created_by,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error fetching current table version:', error);
      return null;
    }
  },

  activateTableVersion: async (versionId: string): Promise<void> => {
    try {
      // Get the version to activate
      const { data: versionData, error: fetchError } = await supabase
        .from('table_versions')
        .select('table_id')
        .eq('id', versionId)
        .single();

      if (fetchError) throw fetchError;

      // Deactivate all versions for this table
      await supabase
        .from('table_versions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('table_id', versionData.table_id);

      // Activate the specified version
      const { error } = await supabase
        .from('table_versions')
        .update({ is_active: true, ended_at: null })
        .eq('id', versionId);

      if (error) throw error;

      toast.success('Table version activated successfully');
    } catch (error) {
      console.error('Error activating table version:', error);
      toast.error('Failed to activate table version');
      throw error;
    }
  },

  compareTableVersions: async (versionId1: string, versionId2: string): Promise<VersionDiff> => {
    try {
      // Fetch both versions
      const { data: version1, error: error1 } = await supabase
        .from('table_versions')
        .select('schema')
        .eq('id', versionId1)
        .single();

      const { data: version2, error: error2 } = await supabase
        .from('table_versions')
        .select('schema')
        .eq('id', versionId2)
        .single();

      if (error1) throw error1;
      if (error2) throw error2;

      const schema1 = version1.schema;
      const schema2 = version2.schema;

      // Compare the schemas
      const fields1 = Object.keys(schema1);
      const fields2 = Object.keys(schema2);

      const added = fields2.filter(field => !fields1.includes(field));
      const removed = fields1.filter(field => !fields2.includes(field));
      
      const modified: { [key: string]: { before: any; after: any } } = {};
      
      fields1
        .filter(field => fields2.includes(field))
        .forEach(field => {
          if (JSON.stringify(schema1[field]) !== JSON.stringify(schema2[field])) {
            modified[field] = {
              before: schema1[field],
              after: schema2[field]
            };
          }
        });

      return { added, removed, modified };
    } catch (error) {
      console.error('Error comparing table versions:', error);
      return { added: [], removed: [], modified: {} };
    }
  },

  // Form entry version operations
  createFormEntryVersion: async (
    formEntryId: string, 
    tableVersionId: string, 
    data: any
  ): Promise<FormEntryVersion> => {
    try {
      // Get current version number
      const { data: existingVersions, error: fetchError } = await supabase
        .from('form_entry_versions')
        .select('version_number')
        .eq('form_entry_id', formEntryId)
        .order('version_number', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const versionNumber = existingVersions && existingVersions.length > 0 
        ? existingVersions[0].version_number + 1 
        : 1;

      // Insert new version
      const { data: newVersion, error } = await supabase
        .from('form_entry_versions')
        .insert([
          { 
            form_entry_id: formEntryId, 
            table_version_id: tableVersionId, 
            version_number: versionNumber, 
            data 
          }
        ])
        .select('*')
        .single();

      if (error) throw error;

      toast.success('Form entry version created successfully');

      return {
        id: newVersion.id,
        formEntryId: newVersion.form_entry_id,
        versionNumber: newVersion.version_number,
        tableVersionId: newVersion.table_version_id,
        data: newVersion.data,
        createdBy: newVersion.created_by,
        createdAt: newVersion.created_at
      };
    } catch (error) {
      console.error('Error creating form entry version:', error);
      toast.error('Failed to create form entry version');
      throw error;
    }
  },

  getFormEntryVersions: async (formEntryId: string): Promise<FormEntryVersion[]> => {
    try {
      const { data, error } = await supabase
        .from('form_entry_versions')
        .select('*')
        .eq('form_entry_id', formEntryId)
        .order('version_number', { ascending: false });

      if (error) throw error;

      return data.map(version => ({
        id: version.id,
        formEntryId: version.form_entry_id,
        versionNumber: version.version_number,
        tableVersionId: version.table_version_id,
        data: version.data,
        createdBy: version.created_by,
        createdAt: version.created_at
      }));
    } catch (error) {
      console.error('Error fetching form entry versions:', error);
      return [];
    }
  },

  migrateFormData: async (data: any, fromVersionId: string, toVersionId: string): Promise<any> => {
    try {
      // Fetch both table versions to get their schemas
      const { data: fromVersion, error: error1 } = await supabase
        .from('table_versions')
        .select('schema')
        .eq('id', fromVersionId)
        .single();

      const { data: toVersion, error: error2 } = await supabase
        .from('table_versions')
        .select('schema')
        .eq('id', toVersionId)
        .single();

      if (error1) throw error1;
      if (error2) throw error2;

      const fromSchema = fromVersion.schema;
      const toSchema = toVersion.schema;

      // Simple migration strategy: Keep fields that exist in both schemas
      const migratedData: Record<string, any> = {};
      
      Object.keys(data).forEach(key => {
        if (toSchema[key]) {
          migratedData[key] = data[key];
        }
      });

      // Initialize new fields with default values or null
      Object.keys(toSchema).forEach(key => {
        if (!migratedData.hasOwnProperty(key)) {
          // Use schema-defined default if available, otherwise null
          migratedData[key] = toSchema[key].default || null;
        }
      });

      return migratedData;
    } catch (error) {
      console.error('Error migrating form data:', error);
      // In case of error, return original data
      return data;
    }
  }
};

export default versions;
