
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Category } from "@/lib/api";

export function useCategories() {
  const queryClient = useQueryClient();
  
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: api.categories.getAll
  });
  
  const createCategory = useMutation({
    mutationFn: api.categories.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
  
  const updateCategory = useMutation({
    mutationFn: ({ id, category }: { id: number; category: Partial<Category> }) => 
      api.categories.update(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
  
  const deleteCategory = useMutation({
    mutationFn: api.categories.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
  
  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    createCategory,
    updateCategory,
    deleteCategory
  };
}
