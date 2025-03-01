
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Column } from "@/lib/api";

export function useColumns(categoryId: string) {
  const queryClient = useQueryClient();
  
  const columnsQuery = useQuery({
    queryKey: ['columns', categoryId],
    queryFn: () => api.columns.getAll(categoryId),
    enabled: !!categoryId
  });
  
  const createColumn = useMutation({
    mutationFn: (column: Omit<Column, 'id'> & { categoryId: string }) => 
      api.columns.create(column),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', categoryId] });
    }
  });
  
  const updateColumn = useMutation({
    mutationFn: ({ id, column }: { id: string; column: Partial<Column> }) => 
      api.columns.update(id, column),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', categoryId] });
    }
  });
  
  const deleteColumn = useMutation({
    mutationFn: api.columns.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', categoryId] });
    }
  });
  
  return {
    columns: columnsQuery.data || [],
    isLoading: columnsQuery.isLoading,
    isError: columnsQuery.isError,
    error: columnsQuery.error,
    createColumn,
    updateColumn,
    deleteColumn
  };
}
