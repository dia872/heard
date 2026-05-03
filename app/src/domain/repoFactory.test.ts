import { buildRepos } from './repoFactory';
import { MemoryStore } from '../infra/storage/asyncRepos';

describe('buildRepos', () => {
  it('returns AsyncStorage repos when there is no session (guest)', () => {
    const repos = buildRepos({
      supabase: null,
      userId: null,
      guestStorage: new MemoryStore(),
    });
    expect(repos.isGuest).toBe(true);
    expect(repos.inbox.constructor.name).toBe('AsyncInboxRepo');
    expect(repos.saved.constructor.name).toBe('AsyncSavedRepo');
    expect(repos.owned.constructor.name).toBe('AsyncOwnedRepo');
  });

  it('returns Supabase repos when supabase + userId are present', () => {
    const fakeSb = {} as any; // not exercised by buildRepos itself
    const repos = buildRepos({
      supabase: fakeSb,
      userId: 'user-1',
      guestStorage: new MemoryStore(),
    });
    expect(repos.isGuest).toBe(false);
    expect(repos.inbox.constructor.name).toBe('SupabaseInboxRepo');
    expect(repos.saved.constructor.name).toBe('SupabaseSavedRepo');
    expect(repos.owned.constructor.name).toBe('SupabaseOwnedRepo');
  });

  it('falls back to guest if supabase is set but userId is null (defensive)', () => {
    const repos = buildRepos({
      supabase: {} as any,
      userId: null,
      guestStorage: new MemoryStore(),
    });
    expect(repos.isGuest).toBe(true);
  });
});
