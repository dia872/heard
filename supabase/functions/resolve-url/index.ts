// /resolve-url — POST { url } → { text, sourceType, meta }
//
// Dispatcher: classifies URL host, then runs the right scraper.
// TikTok/YouTube → oembed (public, no auth). Reddit → append .json.
// Generic articles → server-side fetch + Open Graph parse.
// Instagram/X → already filtered out client-side; we 400 here as backstop.
//
// Real dispatchers land in Phase 7 task 7.x; this skeleton ships the
// auth, request shape, and host classifier so the client can call it.

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { requireUser } from '../_shared/auth.ts';

interface ResolveRequest {
  url: string;
}

interface ResolveResult {
  text: string;
  sourceType: 'tiktok' | 'youtube' | 'reddit' | 'article' | 'unknown';
  meta: Record<string, string>;
}

type Klass = ResolveResult['sourceType'] | 'unsupported';

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
  void user; // accepted but not yet used; will pin per-source telemetry later.

  let body: ResolveRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  if (!body.url) return json({ error: 'Missing url' }, 400);

  const klass = classify(body.url);
  if (klass === 'unsupported') {
    return json({ error: 'URL not supported. Take a screenshot instead.' }, 400);
  }

  // Dispatchers land in Phase 7. Skeleton returns a stub.
  const result: ResolveResult = await stubResolve(body.url, klass);
  return json(result);
});

function classify(rawUrl: string): Klass {
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
  return 'article';
}

async function stubResolve(url: string, klass: Exclude<Klass, 'unsupported'>): Promise<ResolveResult> {
  return { text: '', sourceType: klass, meta: { url } };
}
