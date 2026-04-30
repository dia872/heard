// React Query setup. Three TTL tiers map to the brainstorm decision:
// trending/buzz lists → 1h, title detail → 24h, watch providers → 6h.
// Persistence (AsyncStorage) lives in ./persister.ts so this module
// stays test-portable on Node.

import { QueryClient } from '@tanstack/react-query';

const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;

export const TTL = {
  trending: 1 * HOUR,
  detail: 24 * HOUR,
  watchProviders: 6 * HOUR,
  search: 1 * HOUR,
} as const;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: TTL.trending,
        gcTime: 7 * DAY,
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}
