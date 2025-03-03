
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormEntryVersion } from "../types";

export const formEntryVersions = {
  getFormEntryVersions: async (formEntryId: string): Promise<FormEntryVersion[]> => {
    try {
      const { data, error } = await supabase
        .from('form_entry_versions')
        .select('*')
        .eq('form_entry_id', formEntryId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        formEntryId: item.form_entry_id,
        versionNumber: item.version_number,
        data: item.data,
        tableVersionId: item.table_version_id,
        createdAt: item.created_at,
        createdBy: item.created_by
      }));
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
      
      return {
        id: data.id,
        formEntryId: data.form_entry_id,
        versionNumber: data.version_number,
        data: data.data,
        tableVersionId: data.table_version_id,
        createdAt: data.created_at,
        createdBy: data.created_by
      };
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
      
      return {
        id: newVersion.id,
        formEntryId: newVersion.form_entry_id,
        versionNumber: newVersion.version_number,
        data: newVersion.data,
        tableVersionId: newVersion.table_version_id,
        createdAt: newVersion.created_at,
        createdBy: newVersion.created_by
      };
    } catch (error) {
      console.error('Error creating form entry version:', error);
      toast.error('Failed to create form entry version');
      return null;
    }
  }
};
