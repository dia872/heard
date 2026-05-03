// Supabase-backed repos. Same interfaces as asyncRepos.ts; the
// repoFactory swaps between them based on auth state.
//
// All methods rely on RLS to scope to the calling user — no explicit
// .eq('user_id', ...) needed because policies enforce auth.uid() = user_id.
// We DO insert user_id explicitly because the RLS WITH CHECK requires it.

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  InboxEntry,
  SavedTitle,
  OwnedService,
  StreamerId,
} from '../../types';
import type {
  AddInboxInput,
  InboxRepo,
  OwnedRepo,
  SavedRepo,
} from '../../domain/repos';

// Row types match the SQL schema; converters translate to domain types.

interface InboxRow {
  id: string;
  raw_text: string;
  source: 'voice' | 'paste' | 'screenshot' | 'url' | 'tiktok';
  source_url: string | null;
  tmdb_id: number | null;
  title: string | null;
  year: string | null;
  confidence: 'high' | 'med' | 'low';
  alt_matches: InboxEntry['altMatches'];
  status: 'pending' | 'saved' | 'dismissed' | 'archived';
  captured_at: string;
  deleted_at: string | null;
}

interface SavedRow {
  id: string;
  tmdb_id: number;
  title: string;
  year: string | null;
  poster_path: string | null;
  added_at: string;
}

interface OwnedRow {
  service_id: string;
  added_at: string;
}

const inboxFromRow = (r: InboxRow): InboxEntry => ({
  id: r.id,
  rawText: r.raw_text,
  source: r.source,
  sourceUrl: r.source_url,
  tmdbId: r.tmdb_id,
  title: r.title,
  year: r.year,
  confidence: r.confidence,
  altMatches: r.alt_matches ?? [],
  status: r.status,
  capturedAt: r.captured_at,
  deletedAt: r.deleted_at,
});

const savedFromRow = (r: SavedRow): SavedTitle => ({
  id: r.id,
  tmdbId: r.tmdb_id,
  title: r.title,
  year: r.year,
  posterPath: r.poster_path,
  addedAt: r.added_at,
});

const ownedFromRow = (r: OwnedRow): OwnedService => ({
  serviceId: r.service_id as StreamerId,
  addedAt: r.added_at,
});

// ─── InboxRepo ─────────────────────────────────────────────────────────

export class SupabaseInboxRepo implements InboxRepo {
  constructor(private readonly sb: SupabaseClient, private readonly userId: string) {}

  async list(): Promise<InboxEntry[]> {
    const { data, error } = await this.sb
      .from('inbox')
      .select('*')
      .in('status', ['pending', 'saved'])
      .order('captured_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(inboxFromRow);
  }

  async listIncludingDismissed(): Promise<InboxEntry[]> {
    const { data, error } = await this.sb
      .from('inbox')
      .select('*')
      .order('captured_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(inboxFromRow);
  }

  async add(input: AddInboxInput): Promise<InboxEntry> {
    const { data, error } = await this.sb
      .from('inbox')
      .insert({
        user_id: this.userId,
        raw_text: input.rawText,
        source: input.source,
        source_url: input.sourceUrl ?? null,
        tmdb_id: input.tmdbId,
        title: input.title,
        year: input.year,
        confidence: input.confidence,
        alt_matches: input.altMatches ?? [],
      })
      .select()
      .single();
    if (error) throw error;
    return inboxFromRow(data as InboxRow);
  }

  async markSaved(id: string)  { await this.setStatus(id, 'saved'); }
  async dismiss(id: string)    { await this.setStatus(id, 'dismissed'); }
  async archive(id: string)    { await this.setStatus(id, 'archived'); }

  async remove(id: string): Promise<void> {
    const { error } = await this.sb.from('inbox').delete().eq('id', id);
    if (error) throw error;
  }

  private async setStatus(id: string, status: InboxRow['status']): Promise<void> {
    const patch: { status: InboxRow['status']; deleted_at?: string } = { status };
    if (status === 'dismissed') patch.deleted_at = new Date().toISOString();
    const { error } = await this.sb.from('inbox').update(patch).eq('id', id);
    if (error) throw error;
  }
}

// ─── SavedRepo ─────────────────────────────────────────────────────────

export class SupabaseSavedRepo implements SavedRepo {
  constructor(private readonly sb: SupabaseClient, private readonly userId: string) {}

  async list(): Promise<SavedTitle[]> {
    const { data, error } = await this.sb
      .from('saved')
      .select('*')
      .order('added_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(savedFromRow);
  }

  async add(t: Omit<SavedTitle, 'id' | 'addedAt'>): Promise<SavedTitle> {
    // upsert handles the unique (user_id, tmdb_id) constraint idempotently.
    const { data, error } = await this.sb
      .from('saved')
      .upsert(
        {
          user_id: this.userId,
          tmdb_id: t.tmdbId,
          title: t.title,
          year: t.year,
          poster_path: t.posterPath,
        },
        { onConflict: 'user_id,tmdb_id', ignoreDuplicates: false }
      )
      .select()
      .single();
    if (error) throw error;
    return savedFromRow(data as SavedRow);
  }

  async remove(tmdbId: number): Promise<void> {
    const { error } = await this.sb.from('saved').delete().eq('tmdb_id', tmdbId);
    if (error) throw error;
  }

  async toggle(t: Omit<SavedTitle, 'id' | 'addedAt'>): Promise<'saved' | 'unsaved'> {
    if (await this.has(t.tmdbId)) {
      await this.remove(t.tmdbId);
      return 'unsaved';
    }
    await this.add(t);
    return 'saved';
  }

  async has(tmdbId: number): Promise<boolean> {
    const { data, error } = await this.sb
      .from('saved')
      .select('id')
      .eq('tmdb_id', tmdbId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  }
}

// ─── OwnedRepo ─────────────────────────────────────────────────────────

export class SupabaseOwnedRepo implements OwnedRepo {
  constructor(private readonly sb: SupabaseClient, private readonly userId: string) {}

  async list(): Promise<OwnedService[]> {
    const { data, error } = await this.sb.from('owned_services').select('*');
    if (error) throw error;
    return (data ?? []).map(ownedFromRow);
  }

  async set(serviceIds: StreamerId[]): Promise<OwnedService[]> {
    // Replace semantics — easier than diffing. RLS ensures we only
    // touch this user's rows, so a blanket delete is safe.
    const { error: delErr } = await this.sb.from('owned_services').delete().neq('service_id', '');
    if (delErr) throw delErr;
    if (serviceIds.length === 0) return [];
    const rows = serviceIds.map((id) => ({ user_id: this.userId, service_id: id }));
    const { data, error } = await this.sb
      .from('owned_services')
      .insert(rows)
      .select();
    if (error) throw error;
    return (data ?? []).map(ownedFromRow);
  }

  async add(serviceId: StreamerId): Promise<void> {
    const { error } = await this.sb
      .from('owned_services')
      .upsert(
        { user_id: this.userId, service_id: serviceId },
        { onConflict: 'user_id,service_id', ignoreDuplicates: true }
      );
    if (error) throw error;
  }

  async remove(serviceId: StreamerId): Promise<void> {
    const { error } = await this.sb
      .from('owned_services')
      .delete()
      .eq('service_id', serviceId);
    if (error) throw error;
  }

  async has(serviceId: StreamerId): Promise<boolean> {
    const { data, error } = await this.sb
      .from('owned_services')
      .select('service_id')
      .eq('service_id', serviceId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  }
}
