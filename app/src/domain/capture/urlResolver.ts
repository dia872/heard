// Client for the /resolve-url Edge Function. The dispatcher inside the
// function (TikTok oembed, YouTube oembed, Reddit .json, Open Graph) is
// implemented server-side in Phase 7. Until then this is just the typed
// caller — same DI pattern as ExtractClient.
//
// Includes a client-side host classifier so we can degrade gracefully
// for unsupported sources (Instagram, X) before even hitting the server.

import type { UrlResolveRequest, UrlResolveResult } from '../../types';

const URL_RESOLVE_TIMEOUT_MS = 5_000; // OG scrapes are fast — see REFERENCE.md

type FetchLike = typeof fetch;

export interface UrlResolverOptions {
  baseUrl: string;
  authToken?: string | null;
  fetch?: FetchLike;
  timeoutMs?: number;
}

/**
 * Sources we know how to resolve. 'unsupported' is a fast-fail signal —
 * the UI shows a "take a screenshot instead" hint for these (IG/X rely
 * on deprecated oembed and would 401 on the server anyway).
 */
export type UrlClass = 'tiktok' | 'youtube' | 'reddit' | 'unsupported' | 'generic';

export function classifyUrl(rawUrl: string): UrlClass {
  let host: string;
  try {
    host = new URL(rawUrl).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return 'unsupported';
  }

  if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) return 'tiktok';
  if (host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be') return 'youtube';
  if (host === 'reddit.com' || host.endsWith('.reddit.com')) return 'reddit';
  if (host === 'instagram.com' || host.endsWith('.instagram.com')) return 'unsupported';
  if (host === 'x.com' || host === 'twitter.com' || host.endsWith('.twitter.com')) return 'unsupported';

  return 'generic';
}

export class UrlResolver {
  constructor(private readonly opts: UrlResolverOptions) {}

  async resolve(req: UrlResolveRequest): Promise<UrlResolveResult> {
    const klass = classifyUrl(req.url);
    if (klass === 'unsupported') {
      throw new UnsupportedUrlError(req.url);
    }
    const fetchFn = this.opts.fetch ?? globalThis.fetch;
    const signal = AbortSignal.timeout(this.opts.timeoutMs ?? URL_RESOLVE_TIMEOUT_MS);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.opts.authToken) headers.Authorization = `Bearer ${this.opts.authToken}`;

    const res = await fetchFn(`${this.opts.baseUrl}/resolve-url`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req),
      signal,
    });
    if (!res.ok) {
      throw new Error(`/resolve-url failed: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<UrlResolveResult>;
  }
}

export class UnsupportedUrlError extends Error {
  readonly kind = 'UnsupportedUrlError';
  constructor(public readonly url: string) {
    super(`URL not supported: ${url}. Try taking a screenshot instead.`);
  }
}
