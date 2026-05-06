// Shared domain types. Keep this file flat — types only, no logic.
// If a type is used in only one file, leave it there.

import type { StreamerId } from './tokens';

export type { StreamerId };

// ─── TMDB ─────────────────────────────────────────────────────────────────────

export type MediaType = 'movie' | 'tv';

export interface TmdbTitle {
  id: number;
  title: string;
  year: string | null;
  mediaType: MediaType;
  voteAverage: number;
  popularity: number;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  genres: string[];
  runtime?: number;
  /**
   * Streaming services this title is on, mapped from TMDB watch-providers.
   * Populated only when watch providers have been fetched.
   */
  streamerIds?: StreamerId[];
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
}

export interface TmdbWatchProvider {
  id: StreamerId;
  name: string;
  /** 'flatrate' = subscription, 'rent' / 'buy' = transactional, 'free' = ad-supported */
  type: 'flatrate' | 'rent' | 'buy' | 'free';
}

export interface TmdbWatchProviders {
  providers: TmdbWatchProvider[];
  /** Server-supplied freshness — surfaced in UI per PRD §11. */
  updatedAt: string; // ISO 8601
}

export interface TmdbPersonCredit {
  id: number;
  title: string;
  year: string | null;
  mediaType: MediaType;
  voteAverage: number;
  popularity: number;
  posterPath: string | null;
  character?: string;
}

// ─── Capture / extraction ─────────────────────────────────────────────────────

export type CaptureSource = 'voice' | 'paste' | 'screenshot' | 'url' | 'tiktok';
export type Confidence = 'high' | 'med' | 'low';

export interface ExtractRequest {
  text: string;
  source: CaptureSource;
  /** Optional metadata to nudge the model (e.g., TikTok creator handle). */
  hints?: Record<string, string>;
}

export interface ExtractResult {
  title: string | null;
  year: string | null;
  tmdbId: number | null;
  mediaType: MediaType | null;
  confidence: Confidence;
  alts: Array<{
    tmdbId: number;
    title: string;
    year: string | null;
    mediaType: MediaType;
  }>;
}

export interface UrlResolveRequest {
  url: string;
}

export interface UrlResolveResult {
  text: string;
  sourceType: 'tiktok' | 'youtube' | 'reddit' | 'article' | 'unknown';
  meta: Record<string, string>;
}

// ─── Inbox / Saved / Owned ────────────────────────────────────────────────────

export type InboxStatus = 'pending' | 'saved' | 'dismissed' | 'archived';

export interface InboxEntry {
  id: string;
  rawText: string;
  source: CaptureSource;
  sourceUrl: string | null;
  tmdbId: number | null;
  title: string | null;
  year: string | null;
  confidence: Confidence;
  altMatches: ExtractResult['alts'];
  status: InboxStatus;
  capturedAt: string; // ISO
  /** Set when status moves to dismissed (used for 30-day soft-delete window). */
  deletedAt?: string | null;
}

export interface SavedTitle {
  /** Composite (user_id, tmdb_id) on the server; client uses `${userId}:${tmdbId}` */
  id: string;
  tmdbId: number;
  title: string;
  year: string | null;
  mediaType: MediaType;
  posterPath: string | null;
  addedAt: string;
}

export interface OwnedService {
  serviceId: StreamerId;
  /** When the user added the service. Used to surface "added recently" UX hints. */
  addedAt: string;
}
