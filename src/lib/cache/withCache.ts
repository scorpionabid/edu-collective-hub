
import { cacheService } from './cacheService';
import { CacheOptions } from '../api/types';

/**
 * Higher-order function to wrap API calls with caching
 * 
 * @param cacheKey Unique key for the cache entry
 * @param fn API function to cache
 * @param options Caching options
 * @returns Result of the API call
 */
export async function withCache<T>(
  cacheKey: string,
  fn: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  const { enabled = true, ttl, invalidationTags } = options || {};
  
  // Skip cache if disabled
  if (!enabled) {
    return fn();
  }
  
  try {
    // Try to get from cache
    const cachedData = await cacheService.get<T>(cacheKey);
    
    if (cachedData !== null) {
      return cachedData;
    }
    
    // Cache miss, call function
    const data = await fn();
    
    // Store in cache
    if (data !== null && data !== undefined) {
      await cacheService.set(cacheKey, data, ttl);
    }
    
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback to direct function call
    return fn();
  }
}
