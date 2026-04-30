import { env } from './env';

describe('env', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('throws a clear error if EXPO_PUBLIC_TMDB_KEY is missing', () => {
    delete process.env.EXPO_PUBLIC_TMDB_KEY;
    expect(() => env.tmdbKey).toThrow(/EXPO_PUBLIC_TMDB_KEY/);
    expect(() => env.tmdbKey).toThrow(/.env.local/);
  });

  it('returns the value when EXPO_PUBLIC_TMDB_KEY is set', () => {
    process.env.EXPO_PUBLIC_TMDB_KEY = 'tmdb-test-123';
    expect(env.tmdbKey).toBe('tmdb-test-123');
  });

  it('treats empty string as missing', () => {
    process.env.EXPO_PUBLIC_TMDB_KEY = '';
    expect(() => env.tmdbKey).toThrow();
  });

  it('googleClientId is optional and returns undefined when unset', () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    expect(env.googleClientId).toBeUndefined();
  });

  it('has() reports whether a var is set', () => {
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID = 'g-123';
    expect(env.has('EXPO_PUBLIC_GOOGLE_CLIENT_ID')).toBe(true);
    delete process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    expect(env.has('EXPO_PUBLIC_GOOGLE_CLIENT_ID')).toBe(false);
  });
});
