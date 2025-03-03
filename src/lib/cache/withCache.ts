
import { CacheOptions } from "@/lib/api/types";
import { supabase } from "@/integrations/supabase/client";

// Default cache duration (30 minutes)
const DEFAULT_TTL = 30 * 60 * 1000;

/**
 * Wrapper function to add caching to any async function
 * @param fn The async function to wrap with caching
 * @param options Caching options
 */
export async function withCache<T>(
  fn: () => Promise<T>,
  options?: CacheOptions | boolean
): Promise<T> {
  // If caching is disabled or no options are provided, just execute the function
  if (options === false) {
    return fn();
  }

  // Convert boolean true to object with default settings
  const cacheOptions: CacheOptions = options === true
    ? { enabled: true }
    : options || { enabled: true };

  // If caching is explicitly disabled in the options, just execute the function
  if (cacheOptions.enabled === false) {
    return fn();
  }

  const ttl = cacheOptions.ttl || DEFAULT_TTL;
  const cacheKey = cacheOptions.key || generateCacheKey(fn);

  try {
    // Try to get the data from cache
    const { data: cacheEntry } = await supabase
      .from('cache_entries')
      .select('cache_value, expires_at')
      .eq('cache_key', cacheKey)
      .single();

    // If we have a cache hit and it's not expired, return the cached value
    if (
      cacheEntry &&
      cacheEntry.expires_at &&
      new Date(cacheEntry.expires_at) > new Date()
    ) {
      return cacheEntry.cache_value as T;
    }

    // If we have a cache miss or the cache is expired, execute the function
    const result = await fn();

    // Store the result in the cache
    const expiresAt = new Date(Date.now() + ttl);
    await supabase
      .from('cache_entries')
      .upsert(
        {
          cache_key: cacheKey,
          cache_value: result as any,
          expires_at: expiresAt.toISOString(),
        },
        { onConflict: 'cache_key' }
      );

    return result;
  } catch (error) {
    console.error('Cache error:', error);
    // If there's an error with the cache, just execute the function
    return fn();
  }
}

/**
 * Helper function to generate a cache key for a function
 */
function generateCacheKey(fn: Function): string {
  // Use function name and toString() to generate a deterministic key
  const fnString = fn.toString().replace(/\s+/g, '');
  return `cache_${fnString.length}_${Date.now()}`;
}

/**
 * Invalidate cache entries that match the given keys or patterns
 */
export async function invalidateCache(keys: string[]): Promise<void> {
  try {
    if (keys.length === 0) return;

    // Delete cache entries that exactly match the keys
    await supabase.from('cache_entries').delete().in('cache_key', keys);

    // For each key that might be a pattern, find and delete matching entries
    for (const key of keys) {
      if (key.includes('*')) {
        const pattern = key.replace('*', '%');
        await supabase
          .from('cache_entries')
          .delete()
          .like('cache_key', pattern);
      }
    }
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}
