// Repository interfaces. Two adapters back these:
//   - infra/storage/asyncRepos.ts (AsyncStorage, guest mode)
//   - infra/storage/supabaseRepos.ts (Postgres, auth mode — Phase 2.8)
// A factory (Phase 2.9) chooses based on auth state.

import type {
  InboxEntry,
  SavedTitle,
  OwnedService,
  StreamerId,
  CaptureSource,
  Confidence,
  ExtractResult,
} from '../types';

export interface AddInboxInput {
  rawText: string;
  source: CaptureSource;
  sourceUrl?: string | null;
  tmdbId: number | null;
  title: string | null;
  year: string | null;
  confidence: Confidence;
  altMatches?: ExtractResult['alts'];
}

export interface InboxRepo {
  list(): Promise<InboxEntry[]>;
  /** Including dismissed entries within the 30-day soft-delete window. */
  listIncludingDismissed(): Promise<InboxEntry[]>;
  add(input: AddInboxInput): Promise<InboxEntry>;
  /** Move to 'saved' status; the SavedRepo also gets the title. */
  markSaved(id: string): Promise<void>;
  dismiss(id: string): Promise<void>;
  archive(id: string): Promise<void>;
  /** Hard delete (used by tests + admin paths only). */
  remove(id: string): Promise<void>;
}

export interface SavedRepo {
  list(): Promise<SavedTitle[]>;
  add(t: Omit<SavedTitle, 'id' | 'addedAt'>): Promise<SavedTitle>;
  remove(tmdbId: number): Promise<void>;
  /** Returns the new state ('saved' or 'unsaved') for caller convenience. */
  toggle(t: Omit<SavedTitle, 'id' | 'addedAt'>): Promise<'saved' | 'unsaved'>;
  has(tmdbId: number): Promise<boolean>;
}

export interface OwnedRepo {
  list(): Promise<OwnedService[]>;
  set(serviceIds: StreamerId[]): Promise<OwnedService[]>;
  add(serviceId: StreamerId): Promise<void>;
  remove(serviceId: StreamerId): Promise<void>;
  has(serviceId: StreamerId): Promise<boolean>;
}

/** Storage surface — AsyncStorage shape. Tests pass an in-memory impl. */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
