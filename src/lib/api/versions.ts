
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TableVersion, FormEntryVersion, VersionDiff } from "./types";

// Helper function to compare object properties
const compareObjects = (before: any, after: any): VersionDiff => {
  const diff: VersionDiff = {
    added: [],
    removed: [],
    modified: {}
  };

  // Find added properties
  Object.keys(after).forEach(key => {
    if (before[key] === undefined) {
      diff.added.push(key);
    }
  });

  // Find removed properties
  Object.keys(before).forEach(key => {
    if (after[key] === undefined) {
      diff.removed.push(key);
    }
  });

  // Find modified properties
  Object.keys(after).forEach(key => {
    if (before[key] !== undefined && 
        JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      diff.modified[key] = {
        before: before[key],
        after: after[key]
      };
    }
  });

  return diff;
};

// Table Versions
const getTableVersions = async (tableId: string): Promise<TableVersion[]> => {
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
    console.error(`Error in getTableVersions: ${error}`);
    return [];
  }
};

const getLatestTableVersion = async (tableId: string): Promise<TableVersion | null> => {
  try {
    const { data, error } = await supabase
      .from('table_versions')
      .select('*')
      .eq('table_id', tableId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching latest table version:', error);
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
    console.error(`Error in getLatestTableVersion: ${error}`);
    return null;
  }
};

const createTableVersion = async (
  tableId: string, 
  schema: Record<string, any>, 
  createdBy: string
): Promise<TableVersion> => {
  try {
    // Get the latest version number
    const latestVersion = await getLatestTableVersion(tableId);
    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
    
    // Deactivate previous versions if any
    if (latestVersion) {
      await supabase
        .from('table_versions')
        .update({ 
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('id', latestVersion.id);
    }
    
    // Create new version
    const { data, error } = await supabase
      .from('table_versions')
      .insert({
        table_id: tableId,
        version_number: newVersionNumber,
        schema: schema,
        is_active: true,
        started_at: new Date().toISOString(),
        created_by: createdBy
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating table version:', error);
      toast.error('Failed to create table version');
      throw error;
    }
    
    toast.success('New table version created successfully');
    
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
    console.error(`Error in createTableVersion: ${error}`);
    throw error;
  }
};

const compareTableVersions = async (
  versionId1: string, 
  versionId2: string
): Promise<VersionDiff> => {
  try {
    const { data, error } = await supabase
      .from('table_versions')
      .select('id, schema')
      .in('id', [versionId1, versionId2]);
    
    if (error) {
      console.error('Error fetching versions for comparison:', error);
      throw error;
    }
    
    if (data.length !== 2) {
      throw new Error('Could not find both versions for comparison');
    }
    
    const version1 = data.find(v => v.id === versionId1);
    const version2 = data.find(v => v.id === versionId2);
    
    if (!version1 || !version2) {
      throw new Error('Could not find both versions for comparison');
    }
    
    return compareObjects(version1.schema, version2.schema);
  } catch (error) {
    console.error(`Error in compareTableVersions: ${error}`);
    toast.error('Failed to compare table versions');
    return {
      added: [],
      removed: [],
      modified: {}
    };
  }
};

// Form Entry Versions
const getFormEntryVersions = async (formEntryId: string): Promise<FormEntryVersion[]> => {
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
    
    return data.map(version => ({
      id: version.id,
      formEntryId: version.form_entry_id,
      versionNumber: version.version_number,
      tableVersionId: version.table_version_id,
      data: version.data as Record<string, any>,
      createdBy: version.created_by,
      createdAt: version.created_at
    }));
  } catch (error) {
    console.error(`Error in getFormEntryVersions: ${error}`);
    return [];
  }
};

const getLatestFormEntryVersion = async (formEntryId: string): Promise<FormEntryVersion | null> => {
  try {
    const { data, error } = await supabase
      .from('form_entry_versions')
      .select('*')
      .eq('form_entry_id', formEntryId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching latest form entry version:', error);
      throw error;
    }
    
    return {
      id: data.id,
      formEntryId: data.form_entry_id,
      versionNumber: data.version_number,
      tableVersionId: data.table_version_id,
      data: data.data as Record<string, any>,
      createdBy: data.created_by,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error(`Error in getLatestFormEntryVersion: ${error}`);
    return null;
  }
};

const createFormEntryVersion = async (
  formEntryId: string,
  tableVersionId: string, 
  data: Record<string, any>,
  createdBy: string
): Promise<FormEntryVersion> => {
  try {
    // Get the latest version number
    const latestVersion = await getLatestFormEntryVersion(formEntryId);
    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
    
    // Create new version
    const { data: newVersion, error } = await supabase
      .from('form_entry_versions')
      .insert({
        form_entry_id: formEntryId,
        version_number: newVersionNumber,
        table_version_id: tableVersionId,
        data: data,
        created_by: createdBy
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating form entry version:', error);
      toast.error('Failed to create form entry version');
      throw error;
    }
    
    toast.success('New form entry version created successfully');
    
    return {
      id: newVersion.id,
      formEntryId: newVersion.form_entry_id,
      versionNumber: newVersion.version_number,
      tableVersionId: newVersion.table_version_id,
      data: newVersion.data as Record<string, any>,
      createdBy: newVersion.created_by,
      createdAt: newVersion.created_at
    };
  } catch (error) {
    console.error(`Error in createFormEntryVersion: ${error}`);
    throw error;
  }
};

const compareFormEntryVersions = async (
  versionId1: string, 
  versionId2: string
): Promise<VersionDiff> => {
  try {
    const { data, error } = await supabase
      .from('form_entry_versions')
      .select('id, data')
      .in('id', [versionId1, versionId2]);
    
    if (error) {
      console.error('Error fetching versions for comparison:', error);
      throw error;
    }
    
    if (data.length !== 2) {
      throw new Error('Could not find both versions for comparison');
    }
    
    const version1 = data.find(v => v.id === versionId1);
    const version2 = data.find(v => v.id === versionId2);
    
    if (!version1 || !version2) {
      throw new Error('Could not find both versions for comparison');
    }
    
    return compareObjects(version1.data, version2.data);
  } catch (error) {
    console.error(`Error in compareFormEntryVersions: ${error}`);
    toast.error('Failed to compare form entry versions');
    return {
      added: [],
      removed: [],
      modified: {}
    };
  }
};

// Export all functions
export const versions = {
  // Table versions
  getTableVersions,
  getLatestTableVersion,
  createTableVersion,
  compareTableVersions,
  
  // Form entry versions
  getFormEntryVersions,
  getLatestFormEntryVersion,
  createFormEntryVersion,
  compareFormEntryVersions
};
