
import { supabase } from '@/integrations/supabase/client';
import { CacheManager } from '@/lib/api/types';

// Default TTL: 5 minutes
const DEFAULT_TTL = 300;

export const cacheService: CacheManager = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      console.log(`Cache: Trying to get key ${key}`);
      const { data, error } = await supabase.functions.invoke('redis-cache', {
        body: { action: 'get', key }
      });
      
      if (error) {
        console.error('Cache get error:', error);
        return null;
      }
      
      return data as T;
    } catch (err) {
      console.error('Cache service error (get):', err);
      return null;
    }
  },
  
  set: async <T>(key: string, data: T, ttl: number = DEFAULT_TTL, tags: string[] = []): Promise<void> => {
    try {
      console.log(`Cache: Setting key ${key} with TTL ${ttl}s`);
      await supabase.functions.invoke('redis-cache', {
        body: { action: 'set', key, data, ttl, tags }
      });
    } catch (err) {
      console.error('Cache service error (set):', err);
    }
  },
  
  invalidate: async (tags: string[]): Promise<void> => {
    try {
      console.log(`Cache: Invalidating tags: ${tags.join(', ')}`);
      await supabase.functions.invoke('redis-cache', {
        body: { action: 'invalidate', tags }
      });
    } catch (err) {
      console.error('Cache service error (invalidate):', err);
    }
  }
};
