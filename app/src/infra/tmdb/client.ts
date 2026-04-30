// TMDB v3 API client. Read-only endpoints — the v3 API key is safe in
// the client per TMDB's docs. Times out at 10s per REFERENCE.md.
//
// Fetch is dependency-injected so tests don't need a network mocker.
// Pass `globalThis.fetch` in production; pass a stub in tests.

import type {
  TmdbTitle,
  MediaType,
} from '../../types';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';
const TIMEOUT_MS = 10_000;

type FetchLike = typeof fetch;

export interface TmdbClientOptions {
  apiKey: string;
  fetch?: FetchLike;
  /** Override for tests; defaults to AbortSignal.timeout. */
  timeoutMs?: number;
}

export class TmdbClient {
  constructor(private readonly opts: TmdbClientOptions) {}

  /**
   * Trending titles across movie + TV. Falls back to 'day' window if
   * 'week' returns nothing — TMDB occasionally serves empty for new windows.
   */
  async trending(window: 'day' | 'week' = 'week'): Promise<TmdbTitle[]> {
    const data = await this.get<{ results: TmdbRawListItem[] }>(
      `/trending/all/${window}`
    );
    return data.results
      .filter(isMovieOrTv)
      .map(toTmdbTitle);
  }

  /**
   * Multi-search across movie + TV. Backs the manual disambiguation
   * UI when extraction returns 'med' or 'low' confidence.
   */
  async search(query: string): Promise<TmdbTitle[]> {
    if (!query.trim()) return [];
    const data = await this.get<{ results: TmdbRawListItem[] }>(
      '/search/multi',
      { query: query.trim(), include_adult: 'false' }
    );
    return data.results
      .filter(isMovieOrTv)
      .map(toTmdbTitle);
  }

  // ── internals ───────────────────────────────────────────────────────────

  private async get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(TMDB_BASE + path);
    url.searchParams.set('api_key', this.opts.apiKey);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    const fetchFn = this.opts.fetch ?? globalThis.fetch;
    const signal = AbortSignal.timeout(this.opts.timeoutMs ?? TIMEOUT_MS);

    const res = await fetchFn(url.toString(), { signal });
    if (!res.ok) {
      throw new Error(`TMDB ${path} failed: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────

interface TmdbRawListItem {
  id: number;
  media_type: string;
  title?: string;          // movie
  name?: string;           // tv
  release_date?: string;   // movie
  first_air_date?: string; // tv
  vote_average: number;
  popularity: number;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  genre_ids?: number[];
}

function isMovieOrTv(it: TmdbRawListItem): boolean {
  return it.media_type === 'movie' || it.media_type === 'tv';
}

function toTmdbTitle(it: TmdbRawListItem): TmdbTitle {
  const mediaType = it.media_type as MediaType;
  const dateStr = mediaType === 'movie' ? it.release_date : it.first_air_date;
  return {
    id: it.id,
    title: (mediaType === 'movie' ? it.title : it.name) ?? '',
    year: dateStr ? dateStr.slice(0, 4) : null,
    mediaType,
    voteAverage: it.vote_average,
    popularity: it.popularity,
    posterPath: it.poster_path,
    backdropPath: it.backdrop_path,
    overview: it.overview,
    // Genres come back as IDs from list endpoints; resolve in detail call.
    // For trending lists we leave empty rather than ship stale ID arrays.
    genres: [],
  };
}

export const TMDB_IMAGE = {
  poster(path: string | null) {
    return path ? `${POSTER_BASE}${path}` : null;
  },
  backdrop(path: string | null) {
    return path ? `${BACKDROP_BASE}${path}` : null;
  },
};
