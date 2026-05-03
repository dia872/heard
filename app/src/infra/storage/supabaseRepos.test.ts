// Behavioral tests using a chainable mock SupabaseClient. The real
// client gets exercised end-to-end after `supabase db push` runs;
// these tests pin the SQL contract (which columns we touch, what
// upsert keys we set, what we order by).

import {
  SupabaseInboxRepo,
  SupabaseSavedRepo,
  SupabaseOwnedRepo,
} from './supabaseRepos';

interface QueryRecord {
  table: string;
  select?: string;
  inserts?: any[];
  upserts?: { rows: any; opts: any }[];
  updates?: any[];
  deletes?: number;
  filters: Array<[string, ...any[]]>;
  order?: { column: string; ascending: boolean };
}

function mockSupabase(responses: Record<string, any> = {}) {
  const log: QueryRecord[] = [];

  const buildQuery = (table: string) => {
    const rec: QueryRecord = { table, filters: [] };
    log.push(rec);

    const chain: any = {};
    chain.select = (cols?: string) => { rec.select = cols ?? '*'; return chain; };
    chain.insert = (rows: any) => { rec.inserts = (rec.inserts ?? []).concat(rows); return chain; };
    chain.upsert = (rows: any, opts?: any) => {
      rec.upserts = (rec.upserts ?? []).concat([{ rows, opts }]);
      return chain;
    };
    chain.update = (patch: any) => { rec.updates = (rec.updates ?? []).concat(patch); return chain; };
    chain.delete = () => { rec.deletes = (rec.deletes ?? 0) + 1; return chain; };
    chain.eq = (col: string, v: any) => { rec.filters.push(['eq', col, v]); return chain; };
    chain.in = (col: string, v: any) => { rec.filters.push(['in', col, v]); return chain; };
    chain.neq = (col: string, v: any) => { rec.filters.push(['neq', col, v]); return chain; };
    chain.order = (column: string, opts: { ascending: boolean }) => {
      rec.order = { column, ascending: opts.ascending };
      return chain;
    };

    // Resolution methods — return the canned response (or a default).
    const resolve = () => Promise.resolve(responses[table] ?? { data: [], error: null });
    chain.then = (fn: any) => resolve().then(fn);
    chain.maybeSingle = () => resolve().then((r: any) => ({
      ...r, data: Array.isArray(r.data) ? (r.data[0] ?? null) : r.data,
    }));
    chain.single = () => resolve().then((r: any) => ({
      ...r, data: Array.isArray(r.data) ? r.data[0] : r.data,
    }));

    return chain;
  };

  return { client: { from: buildQuery } as any, log };
}

describe('SupabaseInboxRepo', () => {
  it('list filters to pending+saved status, orders newest-first', async () => {
    const { client, log } = mockSupabase({ inbox: { data: [], error: null } });
    const repo = new SupabaseInboxRepo(client, 'user-1');
    await repo.list();
    const rec = log.find((r) => r.table === 'inbox')!;
    expect(rec.filters).toContainEqual(['in', 'status', ['pending', 'saved']]);
    expect(rec.order).toEqual({ column: 'captured_at', ascending: false });
  });

  it('add inserts user_id + extraction fields and converts row→domain', async () => {
    const row = {
      id: 'i1', raw_text: 'severance', source: 'paste', source_url: null,
      tmdb_id: 107, title: 'Severance', year: '2022',
      confidence: 'high', alt_matches: [],
      status: 'pending', captured_at: '2026-04-29T00:00:00Z', deleted_at: null,
    };
    const { client, log } = mockSupabase({ inbox: { data: [row], error: null } });
    const repo = new SupabaseInboxRepo(client, 'user-1');
    const entry = await repo.add({
      rawText: 'severance', source: 'paste',
      tmdbId: 107, title: 'Severance', year: '2022',
      confidence: 'high',
    });
    const rec = log.find((r) => r.table === 'inbox')!;
    expect(rec.inserts?.[0]).toMatchObject({
      user_id: 'user-1',
      raw_text: 'severance',
      source: 'paste',
      tmdb_id: 107,
      confidence: 'high',
    });
    expect(entry.title).toBe('Severance');
  });

  it('dismiss sets status + deleted_at', async () => {
    const { client, log } = mockSupabase({ inbox: { data: [], error: null } });
    const repo = new SupabaseInboxRepo(client, 'user-1');
    await repo.dismiss('i1');
    const rec = log.find((r) => r.table === 'inbox')!;
    expect(rec.updates?.[0]).toEqual(expect.objectContaining({ status: 'dismissed' }));
    expect(rec.updates?.[0].deleted_at).toBeTruthy();
    expect(rec.filters).toContainEqual(['eq', 'id', 'i1']);
  });

  it('archive sets status without deleted_at', async () => {
    const { client, log } = mockSupabase({ inbox: { data: [], error: null } });
    const repo = new SupabaseInboxRepo(client, 'user-1');
    await repo.archive('i1');
    const rec = log.find((r) => r.table === 'inbox')!;
    expect(rec.updates?.[0]).toEqual({ status: 'archived' });
  });
});

describe('SupabaseSavedRepo', () => {
  it('add upserts on (user_id, tmdb_id) for idempotency', async () => {
    const row = { id: 's1', tmdb_id: 107, title: 'Severance', year: '2022', poster_path: '/p.jpg', added_at: '2026-04-29T00:00:00Z' };
    const { client, log } = mockSupabase({ saved: { data: [row], error: null } });
    const repo = new SupabaseSavedRepo(client, 'user-1');
    await repo.add({ tmdbId: 107, title: 'Severance', year: '2022', posterPath: '/p.jpg' });
    const rec = log.find((r) => r.table === 'saved')!;
    expect(rec.upserts?.[0].rows).toEqual({
      user_id: 'user-1', tmdb_id: 107, title: 'Severance',
      year: '2022', poster_path: '/p.jpg',
    });
    expect(rec.upserts?.[0].opts.onConflict).toBe('user_id,tmdb_id');
  });

  it('toggle round-trips: not saved → saved → unsaved', async () => {
    let exists = false;
    const { client } = mockSupabase();
    // Override: mimic stateful has() and add()/remove() resolution.
    (client.from as any) = (table: string) => {
      const rec: QueryRecord = { table, filters: [] };
      const chain: any = {};
      chain.select = () => chain;
      chain.upsert = (rows: any) => { exists = true; rec.upserts = [{ rows, opts: {} }]; return chain; };
      chain.delete = () => { exists = false; rec.deletes = 1; return chain; };
      chain.eq = () => chain;
      chain.in = () => chain;
      chain.order = () => chain;
      chain.maybeSingle = async () => ({ data: exists ? { id: 'x' } : null, error: null });
      chain.single = async () => ({
        data: { id: 's1', tmdb_id: 107, title: 'Severance', year: '2022', poster_path: null, added_at: '2026-04-29T00:00:00Z' },
        error: null,
      });
      chain.then = (fn: any) => Promise.resolve({ data: [], error: null }).then(fn);
      return chain;
    };
    const repo = new SupabaseSavedRepo(client, 'user-1');
    expect(await repo.toggle({ tmdbId: 107, title: 'Severance', year: '2022', posterPath: null })).toBe('saved');
    expect(await repo.toggle({ tmdbId: 107, title: 'Severance', year: '2022', posterPath: null })).toBe('unsaved');
  });
});

describe('SupabaseOwnedRepo', () => {
  it('set replaces all rows: blanket delete then bulk insert', async () => {
    const { client, log } = mockSupabase({ owned_services: { data: [
      { service_id: 'netflix', added_at: '2026-04-29T00:00:00Z' },
      { service_id: 'max', added_at: '2026-04-29T00:00:00Z' },
    ], error: null } });
    const repo = new SupabaseOwnedRepo(client, 'user-1');
    await repo.set(['netflix', 'max']);
    const recs = log.filter((r) => r.table === 'owned_services');
    expect(recs[0].deletes).toBe(1);
    expect(recs[1].inserts).toEqual([
      { user_id: 'user-1', service_id: 'netflix' },
      { user_id: 'user-1', service_id: 'max' },
    ]);
  });

  it('add upserts with ignoreDuplicates so it stays idempotent', async () => {
    const { client, log } = mockSupabase({ owned_services: { data: [], error: null } });
    const repo = new SupabaseOwnedRepo(client, 'user-1');
    await repo.add('peacock');
    const rec = log.find((r) => r.table === 'owned_services')!;
    expect(rec.upserts?.[0].opts).toEqual({
      onConflict: 'user_id,service_id', ignoreDuplicates: true,
    });
  });
});
