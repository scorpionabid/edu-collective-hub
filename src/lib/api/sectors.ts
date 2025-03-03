
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { withCache } from '@/lib/cache/withCache';
import { cacheService } from '@/lib/cache/cacheService';

// Cache tags
const CACHE_TAGS = {
  SECTORS: 'sectors',
  ALL_SECTORS: 'all_sectors',
  REGION_SECTORS: 'region_sectors',
};

export const sectors = {
  getAll: async () => {
    return withCache('sectors:all', async () => {
      try {
        const { data, error } = await supabase
          .from('sectors')
          .select('*, regions(name)')
          .order('name', { ascending: true });
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('Error in getAll sectors:', error);
        return [];
      }
    }, { 
      enabled: true, 
      ttl: 3600, // 1 hour
      invalidationTags: [CACHE_TAGS.SECTORS, CACHE_TAGS.ALL_SECTORS]
    });
  },
  
  getByRegion: async (regionId: string) => {
    return withCache(`sectors:region:${regionId}`, async () => {
      try {
        const { data, error } = await supabase
          .from('sectors')
          .select('*')
          .eq('region_id', regionId)
          .order('name', { ascending: true });
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('Error in getByRegion sectors:', error);
        return [];
      }
    }, { 
      enabled: true, 
      ttl: 3600, // 1 hour
      invalidationTags: [CACHE_TAGS.SECTORS, CACHE_TAGS.REGION_SECTORS]
    });
  },
  
  getById: async (id: string) => {
    return withCache(`sectors:${id}`, async () => {
      try {
        const { data, error } = await supabase
          .from('sectors')
          .select('*, regions(name)')
          .eq('id', id)
          .maybeSingle();
        
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error('Error in getById sector:', error);
        return null;
      }
    }, { 
      enabled: true, 
      ttl: 3600, // 1 hour
      invalidationTags: [CACHE_TAGS.SECTORS]
    });
  },
  
  create: async (name: string, regionId: string) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .insert({ 
          name,
          region_id: regionId
        })
        .select()
        .maybeSingle();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Sector created successfully');
      
      // Invalidate sector caches
      await cacheService.invalidate([
        CACHE_TAGS.SECTORS, 
        CACHE_TAGS.ALL_SECTORS, 
        CACHE_TAGS.REGION_SECTORS
      ]);
      
      return data;
    } catch (error) {
      console.error('Error in create sector:', error);
      toast.error('Failed to create sector');
      return null;
    }
  },
  
  update: async (id: string, name: string, regionId: string) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .update({ 
          name,
          region_id: regionId
        })
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Sector updated successfully');
      
      // Invalidate sector caches
      await cacheService.invalidate([
        CACHE_TAGS.SECTORS, 
        CACHE_TAGS.ALL_SECTORS, 
        CACHE_TAGS.REGION_SECTORS
      ]);
      
      return data;
    } catch (error) {
      console.error('Error in update sector:', error);
      toast.error('Failed to update sector');
      return null;
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
      
      // Invalidate sector caches
      await cacheService.invalidate([
        CACHE_TAGS.SECTORS, 
        CACHE_TAGS.ALL_SECTORS, 
        CACHE_TAGS.REGION_SECTORS
      ]);
    } catch (error) {
      console.error('Error in delete sector:', error);
      toast.error('Failed to delete sector');
    }
  }
};
