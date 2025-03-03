
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { withCache } from "@/lib/cache/withCache";
import { regions } from "./regions";

// Get all sectors
export const getAllSectors = async (): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('sectors')
      .select(`
        *,
        regions:region_id (name)
      `)
      .order('name');
    
    if (error) throw error;

    // Transform data to include regionName
    return data.map((sector: any) => ({
      ...sector,
      regionName: sector.regions?.name
    }));
  } catch (error) {
    console.error('Error fetching sectors:', error);
    toast.error('Failed to load sectors');
    return [];
  }
};

// Get all sectors with caching
export const getAllSectorsWithCache = async (): Promise<any> => {
  return withCache(
    async () => getAllSectors(),
    { enabled: true, ttl: 30 * 60 * 1000, invalidationTags: ['sectors'] }
  );
};

// Get sectors by region ID
export const getSectorsByRegionId = async (regionId: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('sectors')
      .select(`
        *,
        regions:region_id (name)
      `)
      .eq('region_id', regionId)
      .order('name');
    
    if (error) throw error;
    
    // Transform data to include regionName and get school count
    const sectorsWithDetails = await Promise.all(data.map(async (sector: any) => {
      // Get school count
      const { count } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('sector_id', sector.id);
      
      return {
        ...sector,
        regionName: sector.regions?.name,
        schoolCount: count || 0
      };
    }));
    
    return sectorsWithDetails;
  } catch (error) {
    console.error('Error fetching sectors by region:', error);
    toast.error('Failed to load sectors');
    return [];
  }
};

// Get sectors by region ID with caching
export const getSectorsByRegionIdWithCache = async (regionId: string): Promise<any> => {
  return withCache(
    async () => getSectorsByRegionId(regionId),
    { enabled: true, ttl: 30 * 60 * 1000, invalidationTags: ['sectors'] }
  );
};

// Get a sector by ID
export const getSectorById = async (id: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('sectors')
      .select(`
        *,
        regions:region_id (name)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Get school count
    const { count } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .eq('sector_id', id);
    
    return {
      ...data,
      regionName: data.regions?.name,
      schoolCount: count || 0
    };
  } catch (error) {
    console.error('Error fetching sector:', error);
    toast.error('Failed to load sector');
    return null;
  }
};

// Create a new sector
export const createSector = async (name: string, regionId: string): Promise<any> => {
  try {
    // Check if region exists
    const region = await regions.getById(regionId);
    if (!region) {
      toast.error('Region not found');
      throw new Error('Region not found');
    }
    
    const { data, error } = await supabase
      .from('sectors')
      .insert({ name, region_id: regionId })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Sector created successfully');
    
    // Invalidate cache
    await supabase.from('cache_entries').delete().like('cache_key', '%sectors%');
    
    return {
      ...data,
      regionName: region.name
    };
  } catch (error) {
    console.error('Error creating sector:', error);
    toast.error('Failed to create sector');
    throw error;
  }
};

// Update a sector
export const updateSector = async (id: string, name: string, regionId: string): Promise<any> => {
  try {
    // Check if region exists
    const region = await regions.getById(regionId);
    if (!region) {
      toast.error('Region not found');
      throw new Error('Region not found');
    }
    
    const { data, error } = await supabase
      .from('sectors')
      .update({ name, region_id: regionId })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Sector updated successfully');
    
    // Invalidate cache
    await supabase.from('cache_entries').delete().like('cache_key', '%sectors%');
    
    return {
      ...data,
      regionName: region.name
    };
  } catch (error) {
    console.error('Error updating sector:', error);
    toast.error('Failed to update sector');
    throw error;
  }
};

// Delete a sector
export const deleteSector = async (id: string): Promise<boolean> => {
  try {
    // Check if the sector has schools
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id')
      .eq('sector_id', id);
    
    if (schoolsError) throw schoolsError;
    
    if (schools.length > 0) {
      toast.error('Cannot delete sector with schools. Delete the schools first.');
      return false;
    }
    
    const { error } = await supabase
      .from('sectors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Sector deleted successfully');
    
    // Invalidate cache
    await supabase.from('cache_entries').delete().like('cache_key', '%sectors%');
    
    return true;
  } catch (error) {
    console.error('Error deleting sector:', error);
    toast.error('Failed to delete sector');
    return false;
  }
};

// Get sector name by ID
export const getSectorNameById = async (id: string): Promise<string> => {
  try {
    const sector = await getSectorById(id);
    return sector ? sector.name : '';
  } catch (error) {
    return '';
  }
};

// Export the sectors API
export const sectors = {
  getAll: getAllSectors,
  getAllWithCache: getAllSectorsWithCache,
  getByRegionId: getSectorsByRegionId,
  getByRegionIdWithCache: getSectorsByRegionIdWithCache,
  getById: getSectorById,
  create: createSector,
  update: updateSector,
  delete: deleteSector,
  getNameById: getSectorNameById
};
