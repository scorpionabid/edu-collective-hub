
export interface CacheOptions {
  ttl?: number;
  key?: string;
  invalidateOn?: string[];
  enabled?: boolean;
  invalidationTags?: string[];
}

export interface CacheManager {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T, ttl?: number) => Promise<void>;
  invalidate: (keys: string[]) => Promise<void>;
  invalidateByTags: (tags: string[]) => Promise<void>;
  clearAll: () => Promise<void>;
}
