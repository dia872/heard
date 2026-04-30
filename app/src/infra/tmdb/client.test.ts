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

  describe('TMDB_IMAGE helpers', () => {
    it('builds poster + backdrop URLs from paths, returning null for null', () => {
      expect(TMDB_IMAGE.poster('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w500/abc.jpg');
      expect(TMDB_IMAGE.backdrop('/back.jpg')).toBe('https://image.tmdb.org/t/p/original/back.jpg');
      expect(TMDB_IMAGE.poster(null)).toBeNull();
      expect(TMDB_IMAGE.backdrop(null)).toBeNull();
    });
  });
});
