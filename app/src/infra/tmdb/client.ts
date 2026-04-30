// TMDB v3 API client. Read-only endpoints — the v3 API key is safe in
// the client per TMDB's docs. Times out at 10s per REFERENCE.md.
//
// Fetch is dependency-injected so tests don't need a network mocker.
// Pass `globalThis.fetch` in production; pass a stub in tests.

import type {
  TmdbTitle,
  TmdbCastMember,
  TmdbWatchProvider,
  TmdbWatchProviders,
  MediaType,
  StreamerId,
} from '../../types';

export interface TitleDetail extends TmdbTitle {
  cast: TmdbCastMember[];
  similarIds: number[];
}

/**
 * TMDB watch-provider IDs we recognize. Anything not in this map is
 * dropped from results — the prototype only ships with these 7 services.
 * Add to this map (and the data file) before adding new streamers.
 */
const TMDB_PROVIDER_TO_STREAMER: Record<number, StreamerId> = {
  8: 'netflix',
  9: 'prime',
  350: 'appletv',
  // Max has multiple historical IDs as it rebranded.
  384: 'max',  // HBO Max (legacy)
  1899: 'max', // Max
  15: 'hulu',
  337: 'disney',
  386: 'peacock',
};

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

  /**
   * Title detail with cast and similar titles. Uses TMDB's
   * append_to_response so we get everything in one request.
   */
  async titleDetail(id: number, mediaType: MediaType): Promise<TitleDetail> {
    const data = await this.get<TmdbRawDetail>(
      `/${mediaType}/${id}`,
      { append_to_response: 'credits,similar' }
    );
    return toTitleDetail(data, mediaType);
  }

  /**
   * Where-to-watch providers for a title in a given region.
   * Returns updatedAt = fetch time so the UI can show "Updated 2h ago"
   * (per PRD §11 freshness mitigation).
   *
   * region defaults to 'US' for v0.5 alpha; region picker is post-alpha.
   */
  async watchProviders(
    id: number,
    mediaType: MediaType,
    region: string = 'US'
  ): Promise<TmdbWatchProviders> {
    const data = await this.get<TmdbRawWatchProviders>(
      `/${mediaType}/${id}/watch/providers`
    );
    const regionData = data.results?.[region];
    return {
      providers: regionData ? mapWatchProviders(regionData) : [],
      updatedAt: new Date().toISOString(),
    };
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

interface TmdbRawWatchProviders {
  results?: Record<string, TmdbRawRegion>;
}

interface TmdbRawRegion {
  flatrate?: TmdbRawProvider[];
  rent?: TmdbRawProvider[];
  buy?: TmdbRawProvider[];
  free?: TmdbRawProvider[];
}

interface TmdbRawProvider {
  provider_id: number;
  provider_name: string;
}

function mapWatchProviders(region: TmdbRawRegion): TmdbWatchProvider[] {
  const out: TmdbWatchProvider[] = [];
  const seen = new Set<StreamerId>();
  const consume = (
    arr: TmdbRawProvider[] | undefined,
    type: TmdbWatchProvider['type'],
  ) => {
    for (const p of arr ?? []) {
      const id = TMDB_PROVIDER_TO_STREAMER[p.provider_id];
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push({ id, name: p.provider_name, type });
    }
  };
  // Subscription providers first — they're the user's "owned" set.
  consume(region.flatrate, 'flatrate');
  consume(region.rent, 'rent');
  consume(region.buy, 'buy');
  consume(region.free, 'free');
  return out;
}

interface TmdbRawDetail {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  popularity: number;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  runtime?: number;             // movie
  episode_run_time?: number[];  // tv
  genres?: { id: number; name: string }[];
  credits?: {
    cast?: Array<{
      id: number;
      name: string;
      character?: string;
      profile_path: string | null;
      order: number;
    }>;
  };
  similar?: { results?: Array<{ id: number }> };
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

function toTitleDetail(d: TmdbRawDetail, mediaType: MediaType): TitleDetail {
  const dateStr = mediaType === 'movie' ? d.release_date : d.first_air_date;
  const runtime =
    mediaType === 'movie'
      ? d.runtime
      : d.episode_run_time && d.episode_run_time.length > 0
        ? d.episode_run_time[0]
        : undefined;

  const cast: TmdbCastMember[] =
    d.credits?.cast?.slice(0, 12).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character ?? '',
      profilePath: c.profile_path,
      order: c.order,
    })) ?? [];

  const similarIds = (d.similar?.results ?? []).map((s) => s.id).slice(0, 12);

  return {
    id: d.id,
    title: (mediaType === 'movie' ? d.title : d.name) ?? '',
    year: dateStr ? dateStr.slice(0, 4) : null,
    mediaType,
    voteAverage: d.vote_average,
    popularity: d.popularity,
    posterPath: d.poster_path,
    backdropPath: d.backdrop_path,
    overview: d.overview,
    runtime,
    genres: d.genres?.map((g) => g.name.toLowerCase()) ?? [],
    cast,
    similarIds,
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
