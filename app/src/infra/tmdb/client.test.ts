import { TmdbClient, TMDB_IMAGE } from './client';

function mockFetch(body: unknown, opts: { status?: number; statusText?: string } = {}) {
  return jest.fn(async (_url: any, _init?: any) => ({
    ok: (opts.status ?? 200) < 400,
    status: opts.status ?? 200,
    statusText: opts.statusText ?? 'OK',
    json: async () => body,
  })) as unknown as typeof fetch;
}

describe('TmdbClient', () => {
  describe('trending', () => {
    it('returns titles mapped to the domain shape (movie + tv)', async () => {
      const fetch = mockFetch({
        results: [
          {
            id: 107, media_type: 'tv', name: 'Severance',
            first_air_date: '2022-02-18', vote_average: 8.7, popularity: 380,
            poster_path: '/poster.jpg', backdrop_path: '/back.jpg',
            overview: 'Mark leads...', genre_ids: [],
          },
          {
            id: 105, media_type: 'movie', title: 'Dune: Part Two',
            release_date: '2024-03-01', vote_average: 8.2, popularity: 600,
            poster_path: '/dune.jpg', backdrop_path: '/dune-back.jpg',
            overview: 'Paul Atreides...', genre_ids: [],
          },
          // Should be filtered out — not a movie or tv.
          {
            id: 999, media_type: 'person', name: 'Some Person',
            vote_average: 0, popularity: 0, poster_path: null, backdrop_path: null,
            overview: '',
          },
        ],
      });

      const client = new TmdbClient({ apiKey: 'k', fetch });
      const titles = await client.trending();

      expect(titles).toHaveLength(2);
      expect(titles[0]).toMatchObject({
        id: 107, title: 'Severance', year: '2022', mediaType: 'tv',
      });
      expect(titles[1]).toMatchObject({
        id: 105, title: 'Dune: Part Two', year: '2024', mediaType: 'movie',
      });
    });

    it('appends api_key and the window to the URL', async () => {
      const fetch = mockFetch({ results: [] });
      const client = new TmdbClient({ apiKey: 'secret-123', fetch });
      await client.trending('day');

      expect(fetch).toHaveBeenCalledTimes(1);
      const url = (fetch as jest.Mock).mock.calls[0][0] as string;
      expect(url).toContain('/trending/all/day');
      expect(url).toContain('api_key=secret-123');
    });

    it('throws a labeled error on non-2xx', async () => {
      const fetch = mockFetch({}, { status: 401, statusText: 'Unauthorized' });
      const client = new TmdbClient({ apiKey: 'bad', fetch });
      await expect(client.trending()).rejects.toThrow(/TMDB.*401.*Unauthorized/);
    });

    it('passes an abort signal so the call times out', async () => {
      const fetchFn: typeof fetch = jest.fn(async (_url: any, init?: any) => {
        expect(init?.signal).toBeDefined();
        expect(typeof init.signal.aborted).toBe('boolean');
        return { ok: true, status: 200, statusText: 'OK', json: async () => ({ results: [] }) } as Response;
      }) as unknown as typeof fetch;
      const client = new TmdbClient({ apiKey: 'k', fetch: fetchFn });
      await client.trending();
    });
  });

  describe('search', () => {
    it('hits /search/multi with the query and filters to movie+tv', async () => {
      const fetch = mockFetch({
        results: [
          { id: 107, media_type: 'tv', name: 'Severance', first_air_date: '2022-01-01',
            vote_average: 8.7, popularity: 380, poster_path: '/p.jpg', backdrop_path: null, overview: '' },
          { id: 1, media_type: 'person', name: 'Some Actor',
            vote_average: 0, popularity: 0, poster_path: null, backdrop_path: null, overview: '' },
        ],
      });
      const client = new TmdbClient({ apiKey: 'k', fetch });
      const results = await client.search('severance');

      const url = (fetch as jest.Mock).mock.calls[0][0] as string;
      expect(url).toContain('/search/multi');
      expect(url).toContain('query=severance');
      expect(url).toContain('include_adult=false');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Severance');
    });

    it('returns empty array for empty query without hitting the network', async () => {
      const fetch = mockFetch({ results: [] });
      const client = new TmdbClient({ apiKey: 'k', fetch });
      expect(await client.search('  ')).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('titleDetail', () => {
    it('returns shape with cast (capped at 12) and similar IDs', async () => {
      const fetch = mockFetch({
        id: 107, name: 'Severance', first_air_date: '2022-02-18',
        vote_average: 8.7, popularity: 380, poster_path: '/p.jpg',
        backdrop_path: '/b.jpg', overview: 'Mark...', episode_run_time: [50],
        genres: [{ id: 1, name: 'Drama' }, { id: 2, name: 'Sci-Fi' }],
        credits: {
          cast: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1, name: `Actor ${i + 1}`, character: `Char ${i + 1}`,
            profile_path: null, order: i,
          })),
        },
        similar: { results: [{ id: 102 }, { id: 103 }] },
      });
      const client = new TmdbClient({ apiKey: 'k', fetch });
      const detail = await client.titleDetail(107, 'tv');

      const url = (fetch as jest.Mock).mock.calls[0][0] as string;
      expect(url).toContain('/tv/107');
      expect(url).toContain('append_to_response=credits%2Csimilar');
      expect(detail.title).toBe('Severance');
      expect(detail.runtime).toBe(50);
      expect(detail.genres).toEqual(['drama', 'sci-fi']);
      expect(detail.cast).toHaveLength(12);
      expect(detail.cast[0].name).toBe('Actor 1');
      expect(detail.similarIds).toEqual([102, 103]);
    });

    it('uses runtime field for movies, not episode_run_time', async () => {
      const fetch = mockFetch({
        id: 105, title: 'Dune: Part Two', release_date: '2024-03-01',
        vote_average: 8.2, popularity: 600, poster_path: null, backdrop_path: null,
        overview: '', runtime: 166, genres: [],
      });
      const client = new TmdbClient({ apiKey: 'k', fetch });
      const detail = await client.titleDetail(105, 'movie');
      expect(detail.runtime).toBe(166);
    });
  });

  describe('watchProviders', () => {
    it('maps TMDB provider IDs to internal StreamerIds, dedupes by streamer', async () => {
      const fetch = mockFetch({
        results: {
          US: {
            flatrate: [
              { provider_id: 8, provider_name: 'Netflix' },
              { provider_id: 9, provider_name: 'Amazon Prime Video' },
              { provider_id: 350, provider_name: 'Apple TV Plus' },
            ],
            rent: [
              { provider_id: 9, provider_name: 'Amazon Prime Video' }, // dup
              { provider_id: 99999, provider_name: 'Unknown' },        // dropped
            ],
          },
          GB: {
            flatrate: [{ provider_id: 8, provider_name: 'Netflix UK' }],
          },
        },
      });

      const client = new TmdbClient({ apiKey: 'k', fetch });
      const wp = await client.watchProviders(107, 'tv');

      expect(wp.providers).toEqual([
        { id: 'netflix', name: 'Netflix', type: 'flatrate' },
        { id: 'prime', name: 'Amazon Prime Video', type: 'flatrate' },
        { id: 'appletv', name: 'Apple TV Plus', type: 'flatrate' },
      ]);
      expect(wp.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('returns empty when the region has no data', async () => {
      const fetch = mockFetch({ results: { GB: { flatrate: [] } } });
      const client = new TmdbClient({ apiKey: 'k', fetch });
      const wp = await client.watchProviders(107, 'tv', 'US');
      expect(wp.providers).toEqual([]);
      expect(wp.updatedAt).toBeTruthy();
    });

    it('honors a custom region', async () => {
      const fetch = mockFetch({
        results: { GB: { flatrate: [{ provider_id: 8, provider_name: 'Netflix UK' }] } },
      });
      const client = new TmdbClient({ apiKey: 'k', fetch });
      const wp = await client.watchProviders(107, 'tv', 'GB');
      expect(wp.providers[0].id).toBe('netflix');
    });
  });

  describe('TMDB_IMAGE helpers', () => {
    it('builds poster + backdrop URLs from paths, returning null for null', () => {
      expect(TMDB_IMAGE.poster('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w500/abc.jpg');
      expect(TMDB_IMAGE.backdrop('/back.jpg')).toBe('https://image.tmdb.org/t/p/original/back.jpg');
      expect(TMDB_IMAGE.poster(null)).toBeNull();
      expect(TMDB_IMAGE.backdrop(null)).toBeNull();
    });
  });
});
