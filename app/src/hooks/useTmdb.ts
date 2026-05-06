// React Query hooks over the TmdbClient. One hook per endpoint so
// screens just call useTrending(), useTitleDetail(id), etc. — no
// query-key bookkeeping at the call site.

import { useQuery } from '@tanstack/react-query';
import { getTmdbClient } from '../infra/tmdb';
import { TTL } from '../state/queryClient';
import type { MediaType, StreamerId } from '../types';

export function useTrending(window: 'day' | 'week' = 'week') {
  return useQuery({
    queryKey: ['tmdb', 'trending', window],
    queryFn: () => getTmdbClient().trending(window),
    staleTime: TTL.trending,
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['tmdb', 'search', query],
    queryFn: () => getTmdbClient().search(query),
    staleTime: TTL.search,
    enabled: query.trim().length > 0,
  });
}

export function useTitleDetail(id: number | undefined, mediaType: MediaType | undefined) {
  return useQuery({
    queryKey: ['tmdb', 'detail', id, mediaType],
    queryFn: () => getTmdbClient().titleDetail(id!, mediaType!),
    staleTime: TTL.detail,
    enabled: id != null && mediaType != null,
  });
}

export function useWatchProviders(id: number | undefined, mediaType: MediaType | undefined) {
  return useQuery({
    queryKey: ['tmdb', 'providers', id, mediaType],
    queryFn: () => getTmdbClient().watchProviders(id!, mediaType!),
    staleTime: TTL.watchProviders,
    enabled: id != null && mediaType != null,
  });
}

export function usePersonCredits(id: number | undefined) {
  return useQuery({
    queryKey: ['tmdb', 'person', id],
    queryFn: () => getTmdbClient().personCredits(id!),
    staleTime: TTL.detail,
    enabled: id != null,
  });
}

export function useStreamerTitles(streamerId: StreamerId | undefined) {
  return useQuery({
    queryKey: ['tmdb', 'streamer', streamerId],
    queryFn: () => getTmdbClient().discoverByProvider(streamerId!),
    staleTime: TTL.trending,
    enabled: streamerId != null,
  });
}
