// Supabase client singleton. Reads URL + anon (publishable) key from
// env at import time. Persists session via AsyncStorage so users stay
// signed in across launches.
//
// Lives in its own module so the node test runner can mock-import
// `getSupabase` without dragging AsyncStorage into pure-logic tests.

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from '../../env';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // mobile, not browser
    },
  });
  return _client;
}

/** Test-only: clear the singleton so tests can re-init with mocked env. */
export function __resetSupabase() {
  _client = null;
}
