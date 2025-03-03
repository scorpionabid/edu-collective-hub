import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const { user, role } = useAuth();
  
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: (query) => 
          query.state.dataUpdatedAt < Date.now() - 60 * 1000,
        
        refetchOnMount: true,
        
        refetchOnReconnect: true,
        
        retry: (failureCount, error: any) => {
          if (error?.status === 404 || error?.status === 401 || error?.status === 403) {
            return false;
          }
          return failureCount < 3;
        },
        
        staleTime: 5 * 60 * 1000,
        
        gcTime: 10 * 60 * 1000,
        
        networkMode: 'always',
      },
      mutations: {
        retry: 1,
        networkMode: 'always',
        onError: (error: any) => {
          console.error('Mutation error:', error);
        }
      },
    },
  }));
  
  useEffect(() => {
    if (!user) {
      queryClient.clear();
    }
  }, [user, queryClient]);
  
  useEffect(() => {
    if (role) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === 'schools' || 
                 query.queryKey[0] === 'sectors' || 
                 query.queryKey[0] === 'categories' ||
                 query.queryKey[0] === 'form-data';
        }
      });
    }
  }, [role, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools 
        initialIsOpen={false} 
        position="bottom" 
      />
    </QueryClientProvider>
  );
};
