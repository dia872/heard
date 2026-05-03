// Resolve the calling user's UUID from the bearer token sent by the app.
// All Edge Functions that touch user state should call requireUser() first.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface UserCtx {
  userId: string;
  email: string | null;
}

/**
 * Validates the request's Authorization header against Supabase Auth.
 * Returns the user context, or throws a Response (401) the caller can
 * surface directly: `try { ... } catch (r) { if (r instanceof Response) return r; ... }`
 */
export async function requireUser(req: Request): Promise<UserCtx> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !anonKey) {
    throw new Response(JSON.stringify({ error: 'Server misconfigured' }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return { userId: data.user.id, email: data.user.email ?? null };
}
