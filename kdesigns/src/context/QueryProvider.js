import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 0,
      gcTime: 0,
    },
  },
});

if (typeof window !== 'undefined') {
  window.__TANSTACK_QUERY_CLIENT__ = queryClient;
}

function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  );
}

export default QueryProvider;
