
import { useState, useCallback, useEffect } from 'react';
import { QueryOptions, PaginationParams, SortParams, FilterParams, PaginatedResponse } from '@/lib/api/types';
import { useQuery, UseQueryOptions, RefetchOptions } from '@tanstack/react-query';

interface UsePaginatedDataOptions<T> extends UseQueryOptions<PaginatedResponse<T>, Error> {
  initialPagination?: PaginationParams;
  initialSort?: SortParams;
  initialFilters?: FilterParams;
  queryKey: string[];
  fetchFn: (options: QueryOptions) => Promise<PaginatedResponse<T>>;
}

/**
 * A hook for paginated data with sorting and filtering
 */
export function usePaginatedData<T>(options: UsePaginatedDataOptions<T>) {
  const { 
    initialPagination = { page: 1, pageSize: 10 },
    initialSort = { column: "createdAt", direction: "desc" },
    initialFilters = {},
    queryKey,
    fetchFn,
    ...queryOptions
  } = options;

  const [pagination, setPagination] = useState<PaginationParams>(initialPagination);
  const [sort, setSort] = useState<SortParams>(initialSort);
  const [filters, setFilters] = useState<FilterParams>(initialFilters);

  // Set up the query
  const query = useQuery({
    queryKey: [...queryKey, pagination, sort, filters],
    queryFn: () => fetchFn({ 
      pagination, 
      sort, 
      filters,
      cache: { enabled: true }
    }),
    ...queryOptions
  });

  // Handle changing page
  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Handle changing page size
  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination({ page: 1, pageSize });
  }, []);

  // Handle changing sort
  const handleSortChange = useCallback((column: string, direction?: 'asc' | 'desc') => {
    setSort({ 
      column, 
      direction: direction || (sort.column === column && sort.direction === 'asc' ? 'desc' : 'asc')
    });
  }, [sort]);

  // Handle changing filters
  const handleFilterChange = useCallback((newFilters: FilterParams) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Expose data and metadata in a nice format
  const paginationData = {
    totalPages: query.data?.metadata.pageCount || 0,
    total: query.data?.metadata.total || 0,
    page: pagination.page,
    pageSize: pagination.pageSize
  };

  return {
    data: query.data?.data || [],
    pagination: paginationData,
    metadata: query.data?.metadata || { total: 0, page: 1, pageSize: 10, pageCount: 0 },
    filters,
    sort,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleFilterChange
  };
}
