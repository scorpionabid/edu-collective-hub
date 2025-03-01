
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, FormData } from "@/lib/api";
import { useEffect } from "react";

export function useFormData(schoolId?: string) {
  const queryClient = useQueryClient();
  
  const formDataQuery = useQuery({
    queryKey: ['formData', schoolId],
    queryFn: () => api.formData.getAll(schoolId),
    enabled: !!schoolId
  });
  
  const submitForm = useMutation({
    mutationFn: api.formData.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formData', schoolId] });
    }
  });
  
  const updateForm = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: Partial<FormData> }) => 
      api.formData.update(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formData', schoolId] });
    }
  });
  
  const approveForm = useMutation({
    mutationFn: ({ id, approvedBy }: { id: string; approvedBy: string }) => 
      api.formData.approve(id, approvedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formData', schoolId] });
    }
  });
  
  const rejectForm = useMutation({
    mutationFn: api.formData.reject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formData', schoolId] });
    }
  });
  
  // Set up real-time subscription
  useEffect(() => {
    if (!schoolId) return;
    
    const channel = api.realtime.subscribeToFormData(schoolId, (payload) => {
      queryClient.invalidateQueries({ queryKey: ['formData', schoolId] });
    });
    
    return () => {
      api.realtime.unsubscribe(channel);
    };
  }, [schoolId, queryClient]);
  
  return {
    formData: formDataQuery.data || [],
    isLoading: formDataQuery.isLoading,
    isError: formDataQuery.isError,
    error: formDataQuery.error,
    submitForm,
    updateForm,
    approveForm,
    rejectForm
  };
}
