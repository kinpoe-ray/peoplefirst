import { QueryClient } from '@tanstack/react-query';
import { createLogger } from './logger';

const logger = createLogger('ReactQuery');

// Create QueryClient with sensible defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes for list data
      staleTime: 5 * 60 * 1000,
      // Cache time: 30 minutes (gcTime in v5)
      gcTime: 30 * 60 * 1000,
      // Disable refetch on window focus for most queries
      refetchOnWindowFocus: false,
      // Enable retry for failed queries
      retry: 2,
      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Log mutation errors
      onError: (error) => {
        logger.error('Mutation error', error);
      },
    },
  },
});

// Export for external use (e.g., for manual cache invalidation)
export default queryClient;
