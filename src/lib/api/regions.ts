
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { withCache } from '@/lib/cache/withCache';
import { cacheService } from '@/lib/cache/cacheService';

// Cache tags
const CACHE_TAGS = {
  REGIONS: 'regions',
  ALL_REGIONS: 'all_regions'
};

export const regions = {
  getAll: async () => {
    return withCache('regions:all', async () => {
      try {
        const { data, error } = await supabase
          .from('regions')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('Error in getAll regions:', error);
        return [];
      }
    }, { 
      enabled: true, 
      ttl: 3600, // 1 hour
      invalidationTags: [CACHE_TAGS.REGIONS, CACHE_TAGS.ALL_REGIONS]
    });
  },
  
  getById: async (id: string) => {
    return withCache(`regions:${id}`, async () => {
      try {
        const { data, error } = await supabase
          .from('regions')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error('Error in getById region:', error);
        return null;
      }
    }, { 
      enabled: true, 
      ttl: 3600, // 1 hour
      invalidationTags: [CACHE_TAGS.REGIONS]
    });
  },
  
  create: async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .insert({ name })
        .select()
        .maybeSingle();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Region created successfully');
      
      // Invalidate region caches
      await cacheService.invalidate([CACHE_TAGS.REGIONS, CACHE_TAGS.ALL_REGIONS]);
      
      return data;
    } catch (error) {
      console.error('Error in create region:', error);
      toast.error('Failed to create region');
      return null;
    }
  },
  
  update: async (id: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .update({ name })
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Region updated successfully');
      
      // Invalidate region caches
      await cacheService.invalidate([CACHE_TAGS.REGIONS, CACHE_TAGS.ALL_REGIONS]);
      
      return data;
    } catch (error) {
      console.error('Error in update region:', error);
      toast.error('Failed to update region');
      return null;
    }
  },
  
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Region deleted successfully');
      
      // Invalidate region caches
      await cacheService.invalidate([CACHE_TAGS.REGIONS, CACHE_TAGS.ALL_REGIONS]);
    } catch (error) {
      console.error('Error in delete region:', error);
      toast.error('Failed to delete region');
    }
  }
};
