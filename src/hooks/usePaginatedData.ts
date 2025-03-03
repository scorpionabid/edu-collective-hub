
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PaginatedResponse, PaginationParams, SortParams, FilterParams, QueryOptions } from '@/lib/api/types';

interface UsePaginatedDataProps<T> {
  queryKey: string[];
  queryFn: (options: QueryOptions) => Promise<PaginatedResponse<T>>;
  initialPagination?: PaginationParams;
  initialSort?: SortParams;
  initialFilters?: FilterParams;
  enabled?: boolean;
}

export function usePaginatedData<T>({
  queryKey,
  queryFn,
  initialPagination = { page: 1, pageSize: 10 },
  initialSort,
  initialFilters = {},
  enabled = true
}: UsePaginatedDataProps<T>) {
  // State for pagination, sorting, and filtering
  const [pagination, setPagination] = useState<PaginationParams>(initialPagination);
  const [sort, setSort] = useState<SortParams | undefined>(initialSort);
  const [filters, setFilters] = useState<FilterParams>(initialFilters);
  
  // Build query options
  const queryOptions: QueryOptions = {
    pagination,
    sort,
    filters,
    cache: { enabled: true }
  };
  
  // Query function with options
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...queryKey, pagination, sort, filters],
    queryFn: () => queryFn(queryOptions),
    enabled
  });
  
  // Handler for changing page
  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);
  
  // Handler for changing page size
  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, page: 1, pageSize }));
  }, []);
  
  // Handler for sorting
  const handleSortChange = useCallback((column: string, direction: 'asc' | 'desc') => {
    setSort({ column, direction });
  }, []);
  
  // Handler for filters
  const handleFilterChange = useCallback((newFilters: FilterParams) => {
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
    setFilters(newFilters);
  }, []);
  
  // Add or update a single filter
  const addFilter = useCallback((key: string, value: any) => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  // Remove a single filter
  const removeFilter = useCallback((key: string) => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);
  
  // Reset all filters
  const resetFilters = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setFilters({});
  }, []);
  
  return {
    // Data and loading states
    data: data?.data || [],
    metadata: data?.metadata || {
      total: 0,
      page: pagination.page,
      pageSize: pagination.pageSize,
      pageCount: 0
    },
    isLoading,
    error,
    refetch,
    
    // Pagination state and handlers
    pagination,
    handlePageChange,
    handlePageSizeChange,
    
    // Sort state and handlers
    sort,
    handleSortChange,
    
    // Filter state and handlers
    filters,
    handleFilterChange,
    addFilter,
    removeFilter,
    resetFilters
  };
}
