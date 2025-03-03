
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { withCache } from "@/lib/cache/withCache";
import { Region } from "./types";

// Get all regions
export const getAllRegions = async (): Promise<Region[]> => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    // Transform data to match the Region interface
    return data.map((region: any) => ({
      id: region.id,
      name: region.name,
      createdAt: region.created_at
    }));
  } catch (error) {
    console.error('Error fetching regions:', error);
    toast.error('Failed to load regions');
    return [];
  }
};

// Get all regions with caching
export const getAllRegionsWithCache = async (): Promise<Region[]> => {
  return withCache(
    async () => getAllRegions(),
    { enabled: true, ttl: 30 * 60 * 1000, invalidationTags: ['regions'] }
  );
};

// Get a region by ID
export const getRegionById = async (id: string): Promise<Region | null> => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Transform to match Region interface
    return {
      id: data.id,
      name: data.name,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error fetching region:', error);
    toast.error('Failed to load region');
    return null;
  }
};

// Create a new region
export const createRegion = async (name: string): Promise<Region> => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .insert({ name })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Region created successfully');
    
    // Invalidate cache
    await supabase.from('cache_entries').delete().like('cache_key', '%regions%');
    
    // Transform to match Region interface
    return {
      id: data.id,
      name: data.name,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error creating region:', error);
    toast.error('Failed to create region');
    throw error;
  }
};

// Update a region
export const updateRegion = async (id: string, name: string): Promise<Region> => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Region updated successfully');
    
    // Invalidate cache
    await supabase.from('cache_entries').delete().like('cache_key', '%regions%');
    
    // Transform to match Region interface
    return {
      id: data.id,
      name: data.name,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error updating region:', error);
    toast.error('Failed to update region');
    throw error;
  }
};

// Delete a region
export const deleteRegion = async (id: string): Promise<boolean> => {
  try {
    // Check if the region has sectors
    const { data: sectors, error: sectorsError } = await supabase
      .from('sectors')
      .select('id')
      .eq('region_id', id);
    
    if (sectorsError) throw sectorsError;
    
    if (sectors.length > 0) {
      toast.error('Cannot delete region with sectors. Delete the sectors first.');
      return false;
    }
    
    const { error } = await supabase
      .from('regions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Region deleted successfully');
    
    // Invalidate cache
    await supabase.from('cache_entries').delete().like('cache_key', '%regions%');
    
    return true;
  } catch (error) {
    console.error('Error deleting region:', error);
    toast.error('Failed to delete region');
    return false;
  }
};

// Get a region name by ID
export const getRegionNameById = async (id: string): Promise<string> => {
  try {
    const region = await getRegionById(id);
    return region ? region.name : '';
  } catch (error) {
    return '';
  }
};

// Get regions by ID - for compatibility
export const getByRegionId = async (regionId: string): Promise<Region[]> => {
  try {
    const region = await getRegionById(regionId);
    return region ? [region] : [];
  } catch (error) {
    return [];
  }
};

// Export the regions API
export const regions = {
  getAll: getAllRegions,
  getAllWithCache: getAllRegionsWithCache,
  getById: getRegionById,
  getByRegionId,
  create: createRegion,
  update: updateRegion,
  delete: deleteRegion,
  getNameById: getRegionNameById
};
