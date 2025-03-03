export interface Column {
  id: string;
  name: string;
  type: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  regionId: string;
  sectorId: string;
  schoolId: string;
  columns: Column[];
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  createdAt: string;
}

// Redis cache related types
export interface CacheConfig {
  ttl: number; // Time to live in seconds
}

export interface CacheOptions {
  enabled: boolean;
  ttl?: number; // Time to live in seconds
  invalidationTags?: string[];
}

export interface CacheManager {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, data: T, ttl?: number) => Promise<void>;
  invalidate: (tags: string[]) => Promise<void>;
}

// Pagination related types
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
}

export interface SortParams {
  column: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface QueryOptions {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: FilterParams;
  cache?: CacheOptions;
}
