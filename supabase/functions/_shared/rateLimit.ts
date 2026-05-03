// Per-user-per-day rate limit for /extract. Backed by the
// extract_rate_limit table — atomic UPSERT increments on each call.
// At 100 calls/day/user × ~$0.005/call this caps cost at ~$15/mo per
// active user even before Haiku/cache savings (PRD §11 mitigation).

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const DAILY_LIMIT = 100;

export class RateLimitExceeded extends Error {
  readonly kind = 'RateLimitExceeded';
  constructor(public readonly current: number, public readonly limit: number = DAILY_LIMIT) {
    super(`Daily extract limit reached (${current}/${limit})`);
  }
}

let _admin: SupabaseClient | null = null;
function admin(): SupabaseClient {
  if (_admin) return _admin;
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) throw new Error('Server misconfigured');
  _admin = createClient(url, serviceKey);
  return _admin;
}

/**
 * Atomically increments the day counter and throws if over limit.
 * Uses Postgres ON CONFLICT to keep the operation race-free.
 */
export async function checkRateLimit(userId: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC

  // Try to insert today's row; if it exists, increment the counter.
  const { data, error } = await admin().rpc('increment_extract_count', {
    p_user_id: userId,
    p_day: today,
  });

  if (error) throw new Error(`Rate-limit check failed: ${error.message}`);

  const count = (data as number) ?? 0;
  if (count > DAILY_LIMIT) {
    throw new RateLimitExceeded(count);
  }
}

export const __testing = { DAILY_LIMIT };
