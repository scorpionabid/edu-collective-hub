
import { supabase } from "@/integrations/supabase/client";
import { CacheManager } from "@/lib/api/types";
import { Json } from "@/integrations/supabase/types";

// Default cache duration (30 minutes)
const DEFAULT_TTL = 30 * 60 * 1000;

/**
 * Create a cache service instance
 */
export const createCacheService = (): CacheManager => {
  /**
   * Get a cached value by key
   */
  const get = async <T>(key: string): Promise<T | null> => {
    try {
      const { data, error } = await supabase
        .from('cache_entries')
        .select('cache_value, expires_at')
        .eq('cache_key', key)
        .single();
      
      if (error || !data) return null;
      
      // Check if the cache entry is expired
      if (data.expires_at && new Date(data.expires_at) > new Date()) {
        return data.cache_value as unknown as T;
      }
      
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  };
  
  /**
   * Set a value in the cache
   */
  const set = async <T>(key: string, value: T, ttl: number = DEFAULT_TTL): Promise<void> => {
    try {
      // Convert value to JSON to ensure it can be stored
      const jsonValue = JSON.parse(JSON.stringify(value)) as Json;
      const expiresAt = new Date(Date.now() + ttl).toISOString();
      
      // Insert or update the cache entry
      const { error } = await supabase
        .from('cache_entries')
        .upsert({
          cache_key: key,
          cache_value: jsonValue,
          expires_at: expiresAt,
          updated_at: new Date().toISOString()
        }, { onConflict: 'cache_key' });
      
      if (error) throw error;
    } catch (error) {
      console.error('Cache set error:', error);
    }
  };
  
  /**
   * Invalidate cache entries by keys
   */
  const invalidate = async (keys: string[]): Promise<void> => {
    try {
      if (keys.length === 0) return;
      
      // Delete cache entries that match the keys
      const { error } = await supabase
        .from('cache_entries')
        .delete()
        .in('cache_key', keys);
      
      if (error) throw error;
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  };
  
  /**
   * Invalidate cache entries by tags
   */
  const invalidateByTags = async (tags: string[]): Promise<void> => {
    try {
      if (tags.length === 0) return;
      
      // Get all cache entries with matching tags
      const { data, error } = await supabase
        .from('cache_tags')
        .select('cache_key')
        .in('tag', tags);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Extract cache keys
        const keys = data.map(item => item.cache_key);
        
        // Invalidate those keys
        await invalidate(keys);
      }
    } catch (error) {
      console.error('Cache invalidateByTags error:', error);
    }
  };
  
  /**
   * Clear all cache entries
   */
  const clearAll = async (): Promise<void> => {
    try {
      // Delete all cache entries
      const { error } = await supabase
        .from('cache_entries')
        .delete()
        .neq('cache_key', ''); // Dummy condition to delete all
      
      if (error) throw error;
    } catch (error) {
      console.error('Cache clearAll error:', error);
    }
  };
  
  return {
    get,
    set,
    invalidate,
    invalidateByTags,
    clearAll
  };
};

// Export a singleton instance
export const cacheService = createCacheService();
