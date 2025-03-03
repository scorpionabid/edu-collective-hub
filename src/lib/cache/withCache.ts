
import { cacheService } from './cacheService';
import { CacheOptions } from '@/lib/api/types';

export const withCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = { enabled: true, ttl: 300 }
): Promise<T> => {
  // Skip cache if disabled
  if (!options.enabled) {
    return fetchFn();
  }
  
  try {
    // Try to get from cache first
    const cachedData = await cacheService.get<T>(key);
    
    if (cachedData) {
      console.log(`Cache HIT for key: ${key}`);
      return cachedData;
    }
    
    console.log(`Cache MISS for key: ${key}`);
    // Fetch fresh data
    const freshData = await fetchFn();
    
    // Store in cache
    if (freshData) {
      await cacheService.set(
        key, 
        freshData, 
        options.ttl, 
        options.invalidationTags
      );
    }
    
    return freshData;
  } catch (error) {
    console.error(`Cache error for key ${key}:`, error);
    // Fallback to direct fetch on error
    return fetchFn();
  }
};
