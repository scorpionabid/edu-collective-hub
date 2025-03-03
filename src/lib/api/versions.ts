
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TableVersion, FormEntryVersion, VersionDiff } from "./types";

// Export the versions API object
export const versions = {
  // Table versions
  createTableVersion: async (tableId: string, schema: any, description?: string): Promise<TableVersion> => {
    try {
      // First get the latest version number for this table
      const { data: existingVersions, error: countError } = await supabase
        .from('table_versions')
        .select('version_number')
        .eq('table_id', tableId)
        .order('version_number', { ascending: false })
        .limit(1);
      
      if (countError) {
        console.error('Error getting latest version number:', countError);
        throw countError;
      }
      
      const newVersionNumber = existingVersions && existingVersions.length > 0 
        ? existingVersions[0].version_number + 1 
        : 1;
      
      // Insert the new version
      const { data, error } = await supabase
        .from('table_versions')
        .insert({
          table_id: tableId,
          version_number: newVersionNumber,
          schema: schema,
          is_active: false, // Default to inactive until activated
          started_at: null,
          created_by: supabase.auth.getUser() ? (await supabase.auth.getUser()).data?.user?.id : null
        })
        .select('*')
        .single();
      
      if (error) {
        toast.error(`Error creating table version: ${error.message}`);
        throw error;
      }
      
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
      console.error('Error in createTableVersion:', error);
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
      
      if (error) {
        console.error('Error fetching table versions:', error);
        throw error;
      }
      
      return data?.map(version => ({
        id: version.id,
        tableId: version.table_id,
        versionNumber: version.version_number,
        schema: version.schema,
        isActive: version.is_active,
        startedAt: version.started_at,
        endedAt: version.ended_at,
        createdBy: version.created_by,
        createdAt: version.created_at
      })) || [];
    } catch (error) {
      console.error('Error in getTableVersions:', error);
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
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching current table version:', error);
        throw error;
      }
      
      if (!data) return null;
      
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
      console.error('Error in getCurrentTableVersion:', error);
      return null;
    }
  },
  
  activateTableVersion: async (versionId: string): Promise<void> => {
    try {
      // Get the version we want to activate to find its tableId
      const { data: versionToActivate, error: getError } = await supabase
        .from('table_versions')
        .select('*')
        .eq('id', versionId)
        .single();
      
      if (getError) {
        console.error('Error fetching version to activate:', getError);
        throw getError;
      }
      
      // First, deactivate all other versions for this table
      const { error: deactivateError } = await supabase
        .from('table_versions')
        .update({ 
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('table_id', versionToActivate.table_id)
        .eq('is_active', true);
      
      if (deactivateError) {
        console.error('Error deactivating current versions:', deactivateError);
        throw deactivateError;
      }
      
      // Now activate the requested version
      const { error: activateError } = await supabase
        .from('table_versions')
        .update({ 
          is_active: true,
          started_at: new Date().toISOString(),
          ended_at: null
        })
        .eq('id', versionId);
      
      if (activateError) {
        console.error('Error activating version:', activateError);
        throw activateError;
      }
      
      toast.success('Table version activated successfully');
    } catch (error) {
      console.error('Error in activateTableVersion:', error);
      toast.error('Failed to activate table version');
      throw error;
    }
  },
  
  compareTableVersions: async (versionId1: string, versionId2: string): Promise<VersionDiff> => {
    try {
      // Get both versions
      const { data: version1, error: error1 } = await supabase
        .from('table_versions')
        .select('*')
        .eq('id', versionId1)
        .single();
      
      if (error1) {
        console.error('Error fetching version 1:', error1);
        throw error1;
      }
      
      const { data: version2, error: error2 } = await supabase
        .from('table_versions')
        .select('*')
        .eq('id', versionId2)
        .single();
      
      if (error2) {
        console.error('Error fetching version 2:', error2);
        throw error2;
      }
      
      // Compare schemas
      const schema1 = version1.schema;
      const schema2 = version2.schema;
      
      const fields1 = Object.keys(schema1);
      const fields2 = Object.keys(schema2);
      
      const added = fields2.filter(field => !fields1.includes(field));
      const removed = fields1.filter(field => !fields2.includes(field));
      
      const modified: Record<string, { before: any; after: any }> = {};
      
      fields1.forEach(field => {
        if (fields2.includes(field) && schema1[field] !== schema2[field]) {
          modified[field] = {
            before: schema1[field],
            after: schema2[field]
          };
        }
      });
      
      return {
        added,
        removed,
        modified
      };
    } catch (error) {
      console.error('Error in compareTableVersions:', error);
      return {
        added: [],
        removed: [],
        modified: {}
      };
    }
  },
  
  // Form entry versions
  createFormEntryVersion: async (formEntryId: string, tableVersionId: string, data: any): Promise<FormEntryVersion> => {
    try {
      // First get the latest version number for this form entry
      const { data: existingVersions, error: countError } = await supabase
        .from('form_entry_versions')
        .select('version_number')
        .eq('form_entry_id', formEntryId)
        .order('version_number', { ascending: false })
        .limit(1);
      
      if (countError) {
        console.error('Error getting latest version number:', countError);
        throw countError;
      }
      
      const newVersionNumber = existingVersions && existingVersions.length > 0 
        ? existingVersions[0].version_number + 1 
        : 1;
      
      // Insert the new version
      const { data: versionData, error } = await supabase
        .from('form_entry_versions')
        .insert({
          form_entry_id: formEntryId,
          version_number: newVersionNumber,
          table_version_id: tableVersionId,
          data: data,
          created_by: supabase.auth.getUser() ? (await supabase.auth.getUser()).data?.user?.id : null
        })
        .select('*')
        .single();
      
      if (error) {
        toast.error(`Error creating form entry version: ${error.message}`);
        throw error;
      }
      
      toast.success('Form entry version created successfully');
      
      return {
        id: versionData.id,
        formEntryId: versionData.form_entry_id,
        versionNumber: versionData.version_number,
        tableVersionId: versionData.table_version_id,
        data: versionData.data,
        createdBy: versionData.created_by,
        createdAt: versionData.created_at
      };
    } catch (error) {
      console.error('Error in createFormEntryVersion:', error);
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
      
      if (error) {
        console.error('Error fetching form entry versions:', error);
        throw error;
      }
      
      return data?.map(version => ({
        id: version.id,
        formEntryId: version.form_entry_id,
        versionNumber: version.version_number,
        tableVersionId: version.table_version_id,
        data: version.data,
        createdBy: version.created_by,
        createdAt: version.created_at
      })) || [];
    } catch (error) {
      console.error('Error in getFormEntryVersions:', error);
      return [];
    }
  },
  
  migrateFormData: async (data: any, fromVersionId: string, toVersionId: string): Promise<any> => {
    try {
      // Get the source and target versions
      const { data: fromVersion, error: fromError } = await supabase
        .from('table_versions')
        .select('*')
        .eq('id', fromVersionId)
        .single();
      
      if (fromError) {
        console.error('Error fetching source version:', fromError);
        throw fromError;
      }
      
      const { data: toVersion, error: toError } = await supabase
        .from('table_versions')
        .select('*')
        .eq('id', toVersionId)
        .single();
      
      if (toError) {
        console.error('Error fetching target version:', toError);
        throw toError;
      }
      
      // Get schemas
      const fromSchema = fromVersion.schema;
      const toSchema = toVersion.schema;
      
      // Initialize migrated data
      let migratedData: Record<string, any> = {};
      
      // Copy data for fields that exist in both schemas
      Object.keys(data).forEach(key => {
        if (key in toSchema) {
          migratedData[key] = data[key];
        }
      });
      
      // Set default values for new fields in target schema
      Object.keys(toSchema).forEach(key => {
        if (!(key in data)) {
          migratedData[key] = null; // Default value
        }
      });
      
      return migratedData;
    } catch (error) {
      console.error('Error in migrateFormData:', error);
      return data; // Return original data on error
    }
  }
};
