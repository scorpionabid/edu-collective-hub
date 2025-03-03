
import { supabase } from "@/integrations/supabase/client";
import { CacheManager } from "../api/types";

/**
 * Simple cache service implementation using Supabase
 */
export const cacheService: CacheManager = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const { data, error } = await supabase
        .from('cache_entries')
        .select('*')
        .eq('cache_key', key)
        .single();

      if (error) return null;

      // Check if the cache entry is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        await cacheService.invalidate([key]);
        return null;
      }

      return data.cache_value as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  set: async <T>(key: string, value: T, ttl: number = 30 * 60 * 1000): Promise<void> => {
    try {
      const expiresAt = new Date(Date.now() + ttl);
      await supabase
        .from('cache_entries')
        .upsert({
          cache_key: key,
          cache_value: value,
          expires_at: expiresAt.toISOString()
        }, { onConflict: 'cache_key' });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  invalidate: async (keys: string[]): Promise<void> => {
    try {
      if (keys.length === 0) return;

      await supabase
        .from('cache_entries')
        .delete()
        .in('cache_key', keys);
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  },

  invalidateByTags: async (tags: string[]): Promise<void> => {
    try {
      if (tags.length === 0) return;

      // This is a simplified approach, in a real implementation you would have
      // a separate table for cache tags with many-to-many relationships
      for (const tag of tags) {
        await supabase
          .from('cache_entries')
          .delete()
          .like('cache_key', `%${tag}%`);
      }
    } catch (error) {
      console.error('Cache invalidateByTags error:', error);
    }
  },

  clearAll: async (): Promise<void> => {
    try {
      await supabase
        .from('cache_entries')
        .delete()
        .gte('id', 0); // Delete all entries
    } catch (error) {
      console.error('Cache clearAll error:', error);
    }
  }
};

export default cacheService;
