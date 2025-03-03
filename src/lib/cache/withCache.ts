
import { cacheService } from './cacheService';
import { CacheOptions } from '@/lib/api/types';

/**
 * Higher-order function to wrap API calls with caching
 * @param cacheKey Unique key for the cache entry
 * @param fetchFn Function to fetch data if not in cache
 * @param options Cache options including ttl and invalidation tags
 * @returns The data from cache or from the fetch function
 */
export const withCache = async <T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  options?: CacheOptions
): Promise<T> => {
  // Default options
  const defaultOptions: CacheOptions = {
    enabled: true,
    ttl: 300, // 5 minutes
    invalidationTags: []
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Skip cache if disabled
  if (!mergedOptions.enabled) {
    return fetchFn();
  }
  
  try {
    // Try to get from cache first
    const cachedData = await cacheService.get<T>(cacheKey);
    
    if (cachedData !== null) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cachedData;
    }
    
    // Cache miss, fetch data
    console.log(`Cache miss for key: ${cacheKey}`);
    const data = await fetchFn();
    
    // Store in cache
    await cacheService.set(
      cacheKey, 
      data, 
      mergedOptions.ttl,
      mergedOptions.invalidationTags
    );
    
    return data;
  } catch (error) {
    console.error(`Cache error for key ${cacheKey}:`, error);
    // Fallback to fetching data directly on cache error
    return fetchFn();
  }
};
