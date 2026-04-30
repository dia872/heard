// Client for the /extract Edge Function. The function itself is wired
// up server-side in Phase 1 task 2.10 (Anthropic + TMDB cross-ref). This
// module is the client-side caller — DI'd fetch so it's testable.

import type { ExtractRequest, ExtractResult } from '../../types';

const EXTRACT_TIMEOUT_MS = 30_000; // /extract calls Anthropic — see REFERENCE.md

type FetchLike = typeof fetch;

export interface ExtractClientOptions {
  baseUrl: string;
  authToken?: string | null;
  fetch?: FetchLike;
  timeoutMs?: number;
}

export class ExtractClient {
  constructor(private readonly opts: ExtractClientOptions) {}

  async extract(req: ExtractRequest): Promise<ExtractResult> {
    const fetchFn = this.opts.fetch ?? globalThis.fetch;
    const signal = AbortSignal.timeout(this.opts.timeoutMs ?? EXTRACT_TIMEOUT_MS);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.opts.authToken) headers.Authorization = `Bearer ${this.opts.authToken}`;

    const res = await fetchFn(`${this.opts.baseUrl}/extract`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req),
      signal,
    });
    if (!res.ok) {
      throw new Error(`/extract failed: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<ExtractResult>;
  }
}
