
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { PaginationParams, SortParams, FilterParams, QueryOptions, PaginatedResponse } from '@/lib/api/types';

interface UsePaginatedDataOptions<T> {
  queryKey: string | Array<string | number>;
  queryFn: (options: QueryOptions) => Promise<PaginatedResponse<T>>;
  initialPagination?: PaginationParams;
  initialSort?: SortParams;
  initialFilter?: FilterParams;
  enabled?: boolean;
  staleTime?: number;
  onSuccess?: (data: PaginatedResponse<T>) => void;
  onError?: (error: Error) => void;
}

export function usePaginatedData<T>({
  queryKey,
  queryFn,
  initialPagination = { page: 1, pageSize: 10 },
  initialSort,
  initialFilter,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes
  onSuccess,
  onError
}: UsePaginatedDataOptions<T>) {
  const [pagination, setPagination] = useState<PaginationParams>(initialPagination);
  const [sort, setSort] = useState<SortParams | undefined>(initialSort);
  const [filter, setFilter] = useState<FilterParams | undefined>(initialFilter);

  // Combine all query options
  const queryOptions: QueryOptions = {
    pagination,
    sort,
    filter
  };

  // Create a stable query key that includes all parameters
  const fullQueryKey = Array.isArray(queryKey) 
    ? [...queryKey, pagination, sort, filter] 
    : [queryKey, pagination, sort, filter];

  // The main query
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: fullQueryKey,
    queryFn: () => queryFn(queryOptions),
    staleTime,
    enabled: !!enabled,
    meta: {
      onSuccess: onSuccess as (data: any) => void,
      onError: onError as (error: any) => void
    }
  });

  // Helper to change page
  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Helper to change page size
  const setPageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  // Helper to change sorting
  const setSorting = useCallback((field: string, direction: 'asc' | 'desc') => {
    setSort({ field, direction });
  }, []);

  // Helper to reset to initial values
  const reset = useCallback(() => {
    setPagination(initialPagination);
    setSort(initialSort);
    setFilter(initialFilter);
  }, [initialPagination, initialSort, initialFilter]);

  // Helper for filter changing
  const updateFilter = useCallback((newFilter: FilterParams) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    // Reset to first page when filter changes
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  return {
    data: data?.data || [],
    pagination: {
      ...pagination,
      totalPages: data?.totalPages || 0,
      total: data?.total || 0
    },
    metadata: data?.metadata,
    filter: data?.filter,
    sort,
    isLoading,
    isRefetching,
    error,
    goToPage,
    setPageSize,
    setSorting,
    updateFilter,
    setFilter,
    reset,
    refetch
  };
}

export default usePaginatedData;
