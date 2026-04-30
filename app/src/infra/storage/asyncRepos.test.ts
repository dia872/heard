import {
  AsyncInboxRepo,
  AsyncSavedRepo,
  AsyncOwnedRepo,
  MemoryStore,
} from './asyncRepos';

describe('AsyncInboxRepo', () => {
  it('add → list returns the entry as pending, newest-first', async () => {
    const store = new MemoryStore();
    const repo = new AsyncInboxRepo(store);
    const a = await repo.add({
      rawText: 'severance', source: 'paste',
      tmdbId: 107, title: 'Severance', year: '2022',
      confidence: 'high',
    });
    const b = await repo.add({
      rawText: 'dune', source: 'paste',
      tmdbId: 105, title: 'Dune: Part Two', year: '2024',
      confidence: 'med',
    });
    const list = await repo.list();
    expect(list.map((e) => e.id)).toEqual([b.id, a.id]); // newest first
    expect(list[0].status).toBe('pending');
    expect(list[1].confidence).toBe('high');
  });

  it('dismiss removes from list() but listIncludingDismissed() still surfaces it', async () => {
    const store = new MemoryStore();
    const repo = new AsyncInboxRepo(store);
    const e = await repo.add({
      rawText: 'oppenheimer', source: 'voice',
      tmdbId: 106, title: 'Oppenheimer', year: '2023',
      confidence: 'high',
    });
    await repo.dismiss(e.id);
    expect(await repo.list()).toEqual([]);
    const all = await repo.listIncludingDismissed();
    expect(all).toHaveLength(1);
    expect(all[0].status).toBe('dismissed');
    expect(all[0].deletedAt).toBeTruthy();
  });

  it('purges dismissed entries past the 30-day TTL on read', async () => {
    const store = new MemoryStore();
    const repo = new AsyncInboxRepo(store);
    const e = await repo.add({
      rawText: 'old', source: 'paste',
      tmdbId: 1, title: 'Old', year: '2020', confidence: 'low',
    });
    await repo.dismiss(e.id);
    // Hand-rewind the deletedAt timestamp to 31 days ago.
    const items = JSON.parse((await store.getItem('heard:inbox'))!);
    items[0].deletedAt = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
    await store.setItem('heard:inbox', JSON.stringify(items));

    expect(await repo.listIncludingDismissed()).toEqual([]);
    expect(JSON.parse((await store.getItem('heard:inbox'))!)).toEqual([]);
  });

  it('markSaved keeps the entry visible — UI removes from inbox via the save flow', async () => {
    const store = new MemoryStore();
    const repo = new AsyncInboxRepo(store);
    const e = await repo.add({
      rawText: 'fleabag', source: 'paste',
      tmdbId: 108, title: 'Fleabag', year: '2016', confidence: 'high',
    });
    await repo.markSaved(e.id);
    const list = await repo.list();
    // 'saved' status entries are still visible — we don't filter them out
    // here, the screen does (only 'dismissed' and 'archived' hide).
    expect(list[0].status).toBe('saved');
  });

  it('archive hides the entry from the default list', async () => {
    const store = new MemoryStore();
    const repo = new AsyncInboxRepo(store);
    const e = await repo.add({
      rawText: 'x', source: 'paste',
      tmdbId: 1, title: 'X', year: '2020', confidence: 'high',
    });
    await repo.archive(e.id);
    expect(await repo.list()).toEqual([]);
  });
});

describe('AsyncSavedRepo', () => {
  it('toggle adds then removes', async () => {
    const store = new MemoryStore();
    const repo = new AsyncSavedRepo(store);
    const t = { tmdbId: 107, title: 'Severance', year: '2022', posterPath: '/p.jpg' };
    expect(await repo.toggle(t)).toBe('saved');
    expect(await repo.has(107)).toBe(true);
    expect(await repo.toggle(t)).toBe('unsaved');
    expect(await repo.has(107)).toBe(false);
  });

  it('add is idempotent — re-adding the same tmdbId is a no-op', async () => {
    const store = new MemoryStore();
    const repo = new AsyncSavedRepo(store);
    const t = { tmdbId: 107, title: 'Severance', year: '2022', posterPath: '/p.jpg' };
    await repo.add(t);
    await repo.add(t);
    expect((await repo.list()).length).toBe(1);
  });

  it('list returns newest-first', async () => {
    const store = new MemoryStore();
    const repo = new AsyncSavedRepo(store);
    await repo.add({ tmdbId: 1, title: 'A', year: '2020', posterPath: null });
    await repo.add({ tmdbId: 2, title: 'B', year: '2021', posterPath: null });
    const list = await repo.list();
    expect(list[0].tmdbId).toBe(2);
    expect(list[1].tmdbId).toBe(1);
  });
});

describe('AsyncOwnedRepo', () => {
  it('set replaces the list, preserving addedAt for unchanged services', async () => {
    const store = new MemoryStore();
    const repo = new AsyncOwnedRepo(store);
    await repo.set(['netflix', 'max']);
    const before = await repo.list();
    const netflixAddedAt = before.find((o) => o.serviceId === 'netflix')!.addedAt;

    await repo.set(['netflix', 'hulu']);
    const after = await repo.list();
    expect(after.map((o) => o.serviceId).sort()).toEqual(['hulu', 'netflix']);
    expect(after.find((o) => o.serviceId === 'netflix')!.addedAt).toBe(netflixAddedAt);
  });

  it('add is idempotent', async () => {
    const store = new MemoryStore();
    const repo = new AsyncOwnedRepo(store);
    await repo.add('netflix');
    await repo.add('netflix');
    expect((await repo.list()).length).toBe(1);
  });

  it('has() reports membership', async () => {
    const store = new MemoryStore();
    const repo = new AsyncOwnedRepo(store);
    await repo.add('max');
    expect(await repo.has('max')).toBe(true);
    expect(await repo.has('peacock')).toBe(false);
  });
});
