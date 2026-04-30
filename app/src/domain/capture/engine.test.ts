import type { ExtractResult, UrlResolveResult } from '../../types';
import { CaptureEngine } from './engine';
import { ExtractClient } from './extractClient';
import { UrlResolver, classifyUrl, UnsupportedUrlError } from './urlResolver';

function mockOk<T>(body: T) {
  return jest.fn(async () => ({
    ok: true, status: 200, statusText: 'OK', json: async () => body,
  })) as unknown as typeof fetch;
}

function mockFail(status: number, statusText = 'Bad') {
  return jest.fn(async () => ({
    ok: false, status, statusText, json: async () => ({}),
  })) as unknown as typeof fetch;
}

describe('classifyUrl', () => {
  it.each([
    ['https://www.tiktok.com/@x/video/123', 'tiktok'],
    ['https://vm.tiktok.com/abc', 'tiktok'],
    ['https://youtu.be/xyz', 'youtube'],
    ['https://www.youtube.com/watch?v=abc', 'youtube'],
    ['https://reddit.com/r/movies/comments/abc', 'reddit'],
    ['https://old.reddit.com/r/foo', 'reddit'],
    ['https://www.instagram.com/p/abc', 'unsupported'],
    ['https://x.com/user/status/123', 'unsupported'],
    ['https://twitter.com/user/status/123', 'unsupported'],
    ['https://nytimes.com/an-article', 'generic'],
    ['not-a-url', 'unsupported'],
  ])('%s → %s', (url, expected) => {
    expect(classifyUrl(url)).toBe(expected);
  });
});

describe('UrlResolver', () => {
  it('throws UnsupportedUrlError for IG/X without hitting the network', async () => {
    const fetch = jest.fn();
    const r = new UrlResolver({ baseUrl: 'https://api.test', fetch: fetch as any });
    await expect(r.resolve({ url: 'https://instagram.com/p/abc' }))
      .rejects.toBeInstanceOf(UnsupportedUrlError);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('POSTs to /resolve-url for supported hosts', async () => {
    const fetch = mockOk<UrlResolveResult>({
      text: 'Severance season 2 premiering...',
      sourceType: 'tiktok',
      meta: { creator: '@whoever' },
    });
    const r = new UrlResolver({ baseUrl: 'https://api.test', fetch });
    const out = await r.resolve({ url: 'https://tiktok.com/@x/video/1' });

    const [url, init] = (fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://api.test/resolve-url');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ url: 'https://tiktok.com/@x/video/1' });
    expect(out.sourceType).toBe('tiktok');
  });

  it('forwards auth token as Authorization header when present', async () => {
    const fetch = mockOk({ text: '', sourceType: 'youtube', meta: {} });
    const r = new UrlResolver({
      baseUrl: 'https://api.test', fetch, authToken: 'jwt-abc',
    });
    await r.resolve({ url: 'https://youtu.be/x' });
    const init = (fetch as jest.Mock).mock.calls[0][1];
    expect(init.headers.Authorization).toBe('Bearer jwt-abc');
  });
});

describe('ExtractClient', () => {
  it('POSTs to /extract and returns the result', async () => {
    const result: ExtractResult = {
      title: 'Severance', year: '2022', tmdbId: 107, mediaType: 'tv',
      confidence: 'high', alts: [],
    };
    const fetch = mockOk(result);
    const c = new ExtractClient({ baseUrl: 'https://api.test', fetch });
    const out = await c.extract({ text: 'severance', source: 'paste' });

    const [url, init] = (fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://api.test/extract');
    expect(JSON.parse(init.body).text).toBe('severance');
    expect(out.tmdbId).toBe(107);
  });

  it('throws on non-2xx', async () => {
    const fetch = mockFail(500, 'Internal Server Error');
    const c = new ExtractClient({ baseUrl: 'https://api.test', fetch });
    await expect(c.extract({ text: 'x', source: 'paste' }))
      .rejects.toThrow(/\/extract failed: 500/);
  });
});

describe('CaptureEngine', () => {
  function buildEngine(overrides: {
    extractFetch?: typeof fetch;
    urlFetch?: typeof fetch;
  } = {}) {
    const extract = new ExtractClient({
      baseUrl: 'https://api.test',
      fetch: overrides.extractFetch ?? mockOk<ExtractResult>({
        title: 'Severance', year: '2022', tmdbId: 107, mediaType: 'tv',
        confidence: 'high', alts: [],
      }),
    });
    const urlResolver = new UrlResolver({
      baseUrl: 'https://api.test',
      fetch: overrides.urlFetch ?? mockOk<UrlResolveResult>({
        text: 'severance', sourceType: 'tiktok', meta: { creator: '@x' },
      }),
    });
    return new CaptureEngine({ extract, urlResolver });
  }

  it('paste source bypasses /resolve-url', async () => {
    const extractFetch = mockOk<ExtractResult>({
      title: 'Severance', year: '2022', tmdbId: 107, mediaType: 'tv',
      confidence: 'high', alts: [],
    });
    const urlFetch = jest.fn() as unknown as typeof fetch;
    const engine = buildEngine({ extractFetch, urlFetch });

    const out = await engine.run({ source: 'paste', text: 'severance' });
    expect(out.confidence).toBe('high');
    expect(out.action).toBe('auto-save');
    expect(urlFetch).not.toHaveBeenCalled();
  });

  it('url source resolves first, then extracts, and retains the source URL', async () => {
    const extractFetch = mockOk<ExtractResult>({
      title: 'Severance', year: '2022', tmdbId: 107, mediaType: 'tv',
      confidence: 'high', alts: [],
    });
    const urlFetch = mockOk<UrlResolveResult>({
      text: 'just watched severance s2', sourceType: 'tiktok', meta: { creator: '@x' },
    });
    const engine = buildEngine({ extractFetch, urlFetch });

    const out = await engine.run({
      source: 'url',
      text: 'https://tiktok.com/@x/video/1',
    });

    // /resolve-url called first
    expect((urlFetch as jest.Mock).mock.calls[0][0]).toBe('https://api.test/resolve-url');
    // /extract receives the resolved text, not the URL
    const extractBody = JSON.parse((extractFetch as jest.Mock).mock.calls[0][1].body);
    expect(extractBody.text).toBe('just watched severance s2');
    expect(extractBody.hints.sourceType).toBe('tiktok');
    expect(extractBody.hints.creator).toBe('@x');

    expect(out.sourceUrl).toBe('https://tiktok.com/@x/video/1');
    expect(out.action).toBe('auto-save');
  });

  it('regrades confidence client-side regardless of server label', async () => {
    // Server says high, but TMDB+alts means we should grade as med.
    const extractFetch = mockOk<ExtractResult>({
      title: 'The Bear', year: '2022', tmdbId: 101, mediaType: 'tv',
      confidence: 'high',
      alts: [{ tmdbId: 999, title: 'The Bear (1988)', year: '1988', mediaType: 'movie' }],
    });
    const engine = buildEngine({ extractFetch });
    const out = await engine.run({ source: 'paste', text: 'the bear' });
    expect(out.confidence).toBe('med');
    expect(out.action).toBe('confirm');
    expect(out.result.confidence).toBe('med'); // also written into the result
  });
});
