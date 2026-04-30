// Type-safe access to environment variables. Only EXPO_PUBLIC_*
// vars are bundled into the client; anything secret stays in the
// Supabase Edge Function runtime.

type EnvKey =
  | 'EXPO_PUBLIC_TMDB_KEY'
  | 'EXPO_PUBLIC_SUPABASE_URL'
  | 'EXPO_PUBLIC_SUPABASE_ANON_KEY'
  | 'EXPO_PUBLIC_GOOGLE_CLIENT_ID';

function read(key: EnvKey): string | undefined {
  // process.env values are inlined at build time by the Expo metro bundler.
  // Reads here are safe in both runtime and test contexts.
  const v = process.env[key];
  return v && v.length > 0 ? v : undefined;
}

function required(key: EnvKey): string {
  const v = read(key);
  if (!v) {
    throw new Error(
      `Missing required env var ${key}. ` +
      `Add it to .env.local — see .env.example for the full list.`
    );
  }
  return v;
}

export const env = {
  // TMDB key is required everywhere — every screen uses it.
  get tmdbKey() { return required('EXPO_PUBLIC_TMDB_KEY'); },

  // Supabase: required once auth ships (Phase 1+).
  get supabaseUrl() { return required('EXPO_PUBLIC_SUPABASE_URL'); },
  get supabaseAnonKey() { return required('EXPO_PUBLIC_SUPABASE_ANON_KEY'); },

  // Google client ID: optional until Phase 8 (auth wiring).
  get googleClientId() { return read('EXPO_PUBLIC_GOOGLE_CLIENT_ID'); },

  // Test-only: read without throwing (lets test files inspect what's set).
  has(key: EnvKey): boolean {
    return read(key) !== undefined;
  },
};
