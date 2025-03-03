
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sector } from "./types";

export const sectors = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching sectors:', error);
        throw error;
      }
      
      return data ? data.map(sector => ({
        id: sector.id,
        name: sector.name,
        regionId: sector.region_id,
        region_id: sector.region_id
      })) : [];
    } catch (error) {
      console.error('Error in getAll sectors:', error);
      return [];
    }
  },
  
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching sector:', error);
        throw error;
      }
      
      return {
        id: data.id,
        name: data.name,
        regionId: data.region_id,
        region_id: data.region_id
      };
    } catch (error) {
      console.error('Error in getById sector:', error);
      return null;
    }
  },
  
  getByRegion: async (regionId: string) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('region_id', regionId)
        .order('name');
      
      if (error) {
        console.error('Error fetching sectors by region:', error);
        throw error;
      }
      
      return data ? data.map(sector => ({
        id: sector.id,
        name: sector.name,
        regionId: sector.region_id,
        region_id: sector.region_id
      })) : [];
    } catch (error) {
      console.error('Error in getByRegion sectors:', error);
      return [];
    }
  },
  
  create: async (sectorData: { name: string, region_id: string }) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .insert(sectorData)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Sector created successfully');
      return {
        id: data.id,
        name: data.name,
        regionId: data.region_id,
        region_id: data.region_id
      };
    } catch (error) {
      console.error('Error in create sector:', error);
      toast.error('Failed to create sector');
      return { 
        id: "0", 
        name: sectorData.name,
        regionId: sectorData.region_id,
        region_id: sectorData.region_id
      };
    }
  },
  
  update: async (id: string, sectorData: Partial<Sector>) => {
    try {
      const updateData: any = {};
      if (sectorData.name) updateData.name = sectorData.name;
      if (sectorData.regionId) updateData.region_id = sectorData.regionId;
      
      const { data, error } = await supabase
        .from('sectors')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Sector updated successfully');
      return {
        id: data.id,
        name: data.name,
        regionId: data.region_id,
        region_id: data.region_id
      };
    } catch (error) {
      console.error('Error in update sector:', error);
      toast.error('Failed to update sector');
      return { 
        id, 
        name: sectorData.name || "Unknown",
        regionId: sectorData.regionId || "",
        region_id: sectorData.regionId || ""
      };
    }
  },
  
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Sector deleted successfully');
    } catch (error) {
      console.error('Error in delete sector:', error);
      toast.error('Failed to delete sector');
    }
  }
};
