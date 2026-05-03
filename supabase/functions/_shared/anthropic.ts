// Anthropic Claude wrapper for /extract. Uses Claude Haiku 4.5 by
// default (cheap, fast, sufficient for title extraction); /extract
// can escalate to Sonnet 4.6 on ambiguous cases.
//
// JSON-mode prompting: model returns ONLY valid JSON matching the
// AnthropicExtraction shape so we don't have to parse natural-language
// answers. Per-source system prompt nudges ("this is a TikTok caption")
// move accuracy up significantly.

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

export type AnthropicModel = 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6';

export interface AnthropicExtraction {
  /** The most likely title, or null if no clear extraction. */
  title: string | null;
  year: string | null;
  /** 'movie' | 'tv' | null. */
  mediaType: 'movie' | 'tv' | null;
  /** Other plausible candidates (used for med/low confidence disambiguation). */
  alts: Array<{ title: string; year: string | null; mediaType: 'movie' | 'tv' }>;
  /** Model's own confidence — we re-grade this client-side too. */
  confidence: 'high' | 'med' | 'low';
}

export interface ExtractCallInput {
  text: string;
  source: string;
  hints?: Record<string, string>;
}

export async function callAnthropic(
  input: ExtractCallInput,
  model: AnthropicModel = 'claude-haiku-4-5-20251001'
): Promise<AnthropicExtraction> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const sourceHint = describeSource(input.source);
  const hintsBlock = input.hints && Object.keys(input.hints).length
    ? `\n\nAdditional context:\n${Object.entries(input.hints).map(([k, v]) => `- ${k}: ${v}`).join('\n')}`
    : '';

  const userPrompt = `${sourceHint}

Input text:
"""
${input.text}
"""${hintsBlock}

Identify the movie or TV show being referred to. Return JSON ONLY in this exact shape — no preamble, no explanation:

{
  "title": "exact title as it appears in TMDB, or null if unclear",
  "year": "YYYY release/first-air year as a string, or null",
  "mediaType": "movie" | "tv" | null,
  "alts": [{"title": "...", "year": "...", "mediaType": "..."}, ...],
  "confidence": "high" | "med" | "low"
}

- "high" = you're certain (a direct title mention with no ambiguity)
- "med" = likely match but multiple plausible titles (populate alts)
- "low" = unclear, fragmented, or possibly not about a specific title`;

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 512,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic ${res.status}: ${errText}`);
  }
  const body = await res.json() as { content: Array<{ text: string }> };
  const raw = body.content?.[0]?.text ?? '{}';
  return parseExtraction(raw);
}

function parseExtraction(raw: string): AnthropicExtraction {
  // Tolerate ``` fences if the model wraps despite instructions.
  const stripped = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  try {
    const obj = JSON.parse(stripped);
    return {
      title: typeof obj.title === 'string' ? obj.title : null,
      year: typeof obj.year === 'string' ? obj.year : null,
      mediaType: obj.mediaType === 'movie' || obj.mediaType === 'tv' ? obj.mediaType : null,
      alts: Array.isArray(obj.alts)
        ? obj.alts
            .filter((a: any) => a && typeof a.title === 'string')
            .map((a: any) => ({
              title: a.title,
              year: typeof a.year === 'string' ? a.year : null,
              mediaType: a.mediaType === 'movie' || a.mediaType === 'tv' ? a.mediaType : 'movie',
            }))
            .slice(0, 5)
        : [],
      confidence: ['high', 'med', 'low'].includes(obj.confidence) ? obj.confidence : 'low',
    };
  } catch {
    return { title: null, year: null, mediaType: null, alts: [], confidence: 'low' };
  }
}

function describeSource(src: string): string {
  switch (src) {
    case 'voice':      return 'The text below is a voice transcription of someone talking about a show or movie.';
    case 'paste':      return 'The text below was pasted by the user from somewhere — could be a message, post, or article.';
    case 'screenshot': return 'The text below was OCR-extracted from a screenshot. Expect noise (UI labels, captions, hashtags).';
    case 'tiktok':     return 'The text below is from a TikTok post (caption, on-screen text, or transcript).';
    case 'url':        return 'The text below was scraped from a webpage (article body, social post caption, or video description).';
    default:           return 'The text below mentions a movie or TV show.';
  }
}
