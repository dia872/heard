// Server-side TMDB lookup for the /extract cross-reference step.
// Mirrors the client's TMDB shape but only the bits we need.

interface TmdbSearchResult {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  popularity: number;
}

export interface TmdbMatch {
  tmdbId: number;
  title: string;
  year: string | null;
  mediaType: 'movie' | 'tv';
  popularity: number;
}

const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function searchTmdb(
  query: string,
  preferredMediaType?: 'movie' | 'tv'
): Promise<TmdbMatch[]> {
  const apiKey = Deno.env.get('TMDB_KEY');
  if (!apiKey) throw new Error('TMDB_KEY not set');

  const url = new URL(`${TMDB_BASE}/search/multi`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('query', query);
  url.searchParams.set('include_adult', 'false');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB search ${res.status}`);
  const body = await res.json() as { results?: TmdbSearchResult[] };

  const matches: TmdbMatch[] = (body.results ?? [])
    .filter((r): r is TmdbSearchResult & { media_type: 'movie' | 'tv' } =>
      r.media_type === 'movie' || r.media_type === 'tv'
    )
    .map((r) => {
      const dateStr = r.media_type === 'movie' ? r.release_date : r.first_air_date;
      return {
        tmdbId: r.id,
        title: (r.media_type === 'movie' ? r.title : r.name) ?? '',
        year: dateStr ? dateStr.slice(0, 4) : null,
        mediaType: r.media_type,
        popularity: r.popularity,
      };
    });

  // Optional re-rank: if Claude said "tv", boost tv matches up.
  if (preferredMediaType) {
    matches.sort((a, b) => {
      if (a.mediaType === preferredMediaType && b.mediaType !== preferredMediaType) return -1;
      if (b.mediaType === preferredMediaType && a.mediaType !== preferredMediaType) return 1;
      return b.popularity - a.popularity;
    });
  } else {
    matches.sort((a, b) => b.popularity - a.popularity);
  }

  return matches;
}
