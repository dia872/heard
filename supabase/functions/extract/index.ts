// /extract — POST { text, source, hints? } → ExtractResult
//
// Pipeline:
//   1. requireUser (auth)
//   2. checkRateLimit
//   3. cache lookup on (text_hash, source) — return cached result if hit
//   4. call Anthropic (Haiku default, escalate to Sonnet on low confidence)
//   5. cross-reference with TMDB to validate the title
//   6. cache + return
//
// Steps 4–5 are stubbed in this skeleton — the actual Anthropic + TMDB
// wiring lands in task 2.10 (Phase 2). This file ships the request
// shape, auth, rate limit, and cache so the client can call it today.

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { requireUser } from '../_shared/auth.ts';
import { checkRateLimit, RateLimitExceeded } from '../_shared/rateLimit.ts';
import { callAnthropic } from '../_shared/anthropic.ts';
import { searchTmdb } from '../_shared/tmdb.ts';

interface ExtractRequest {
  text: string;
  source: 'voice' | 'paste' | 'screenshot' | 'url' | 'tiktok';
  hints?: Record<string, string>;
}

interface ExtractResult {
  title: string | null;
  year: string | null;
  tmdbId: number | null;
  mediaType: 'movie' | 'tv' | null;
  confidence: 'high' | 'med' | 'low';
  alts: Array<{ tmdbId: number; title: string; year: string | null; mediaType: 'movie' | 'tv' }>;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let user;
  try {
    user = await requireUser(req);
  } catch (r) {
    if (r instanceof Response) return r;
    return json({ error: 'Auth failed' }, 401);
  }

  let body: ExtractRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  if (!body.text || !body.source) {
    return json({ error: 'Missing text or source' }, 400);
  }

  // ── rate limit ──────────────────────────────────────────────────────
  try {
    await checkRateLimit(user.userId);
  } catch (e) {
    if (e instanceof RateLimitExceeded) return json({ error: e.message }, 429);
    return json({ error: 'Rate-limit error' }, 500);
  }

  // ── cache lookup ────────────────────────────────────────────────────
  const textHash = await sha256(`${body.source}:${body.text.trim().toLowerCase()}`);
  const cached = await readCache(textHash, body.source);
  if (cached) return json(cached);

  // ── extraction (STUB — task 2.10 wires Anthropic + TMDB) ───────────
  const result: ExtractResult = await stubExtract(body);

  // ── cache store ─────────────────────────────────────────────────────
  await writeCache(textHash, body.source, result);
  return json(result);
});

// ─── helpers ──────────────────────────────────────────────────────────

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

let _admin: ReturnType<typeof createClient> | null = null;
function admin() {
  if (_admin) return _admin;
  const url = Deno.env.get('SUPABASE_URL')!;
  const sk = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  _admin = createClient(url, sk);
  return _admin;
}

const CACHE_TTL_HOURS = 24;
async function readCache(textHash: string, source: string): Promise<ExtractResult | null> {
  const cutoff = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();
  const { data } = await admin()
    .from('extraction_cache')
    .select('result, cached_at')
    .eq('text_hash', textHash)
    .eq('source', source)
    .gte('cached_at', cutoff)
    .maybeSingle();
  if (!data) return null;
  // Bump hit_count; ignore failure (cache is best-effort).
  await admin().rpc('bump_cache_hit', { p_text_hash: textHash, p_source: source }).catch(() => {});
  return data.result as ExtractResult;
}

async function writeCache(textHash: string, source: string, result: ExtractResult): Promise<void> {
  await admin().from('extraction_cache').upsert({
    text_hash: textHash,
    source,
    result,
    cached_at: new Date().toISOString(),
  });
}

// Real extraction: Anthropic (Haiku) → TMDB cross-ref → confidence.
// Escalates to Sonnet if Haiku returns 'low' confidence (cheap fallback;
// ~5x more expensive but only fires on the ambiguous tail).
async function stubExtract(req: ExtractRequest): Promise<ExtractResult> {
  let claudeResult = await callAnthropic(req, 'claude-haiku-4-5-20251001');

  // Escalate if Haiku is unsure and there's enough text to retry meaningfully.
  if (claudeResult.confidence === 'low' && req.text.length > 24) {
    try {
      const sonnetResult = await callAnthropic(req, 'claude-sonnet-4-6');
      // Only adopt Sonnet's answer if it actually produced a title.
      if (sonnetResult.title) claudeResult = sonnetResult;
    } catch {
      // Sonnet failure is non-fatal; we keep Haiku's low-confidence answer.
    }
  }

  // No title at all → nothing to validate against TMDB.
  if (!claudeResult.title) {
    return {
      title: null, year: null, tmdbId: null, mediaType: null,
      confidence: 'low', alts: [],
    };
  }

  // Cross-reference with TMDB.
  let tmdbMatches: Awaited<ReturnType<typeof searchTmdb>> = [];
  try {
    tmdbMatches = await searchTmdb(claudeResult.title, claudeResult.mediaType ?? undefined);
  } catch {
    // TMDB hiccup — return Claude's title without validation as low confidence.
    return {
      title: claudeResult.title,
      year: claudeResult.year,
      tmdbId: null,
      mediaType: claudeResult.mediaType,
      confidence: 'low',
      alts: [],
    };
  }

  // Best match: highest popularity (TMDB sort already does this).
  const best = tmdbMatches[0];
  if (!best) {
    return {
      title: claudeResult.title,
      year: claudeResult.year,
      tmdbId: null,
      mediaType: claudeResult.mediaType,
      confidence: 'low',
      alts: [],
    };
  }

  // Other plausible matches → med-confidence alts.
  const alts = tmdbMatches.slice(1, 5).map((m) => ({
    tmdbId: m.tmdbId,
    title: m.title,
    year: m.year,
    mediaType: m.mediaType,
  }));

  // Confidence: client-side gate runs again, but a useful server hint:
  // unique strong match → high; multiple plausible → med.
  const confidence: ExtractResult['confidence'] = alts.length === 0 ? 'high' : 'med';

  return {
    title: best.title,
    year: best.year,
    tmdbId: best.tmdbId,
    mediaType: best.mediaType,
    confidence,
    alts,
  };
}
