// Auth + repos context. Wraps the app so any screen can grab the
// current session/userId via useAuth() and the right repo bundle
// via useRepos(). Soft-gate sign-in flow lands here in Phase 8.
//
// For Phase 5 we ship guest-only — the buildRepos factory returns
// AsyncStorage repos when userId is null. When Phase 8 adds Apple/
// Google sign-in, we'll subscribe to supabase.auth.onAuthStateChange
// and update the userId here; everything downstream stays the same.

import { createContext, useContext, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildRepos, ReposBundle } from '../domain/repoFactory';
import { getSupabase } from '../infra/supabase/client';

interface AuthState {
  /** Authenticated user id, or null when guest. */
  userId: string | null;
}

const Ctx = createContext<{ state: AuthState; repos: ReposBundle } | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Phase 5: guest-only. Phase 8 will populate from supabase auth state.
  const state: AuthState = { userId: null };

  const repos = useMemo(() => {
    return buildRepos({
      // Defer reading supabase until something actually needs it; in
      // guest mode buildRepos doesn't call .from(), so this is fine.
      supabase: state.userId ? getSupabase() : null,
      userId: state.userId,
      guestStorage: AsyncStorage,
    });
  }, [state.userId]);

  return <Ctx.Provider value={{ state, repos }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v.state;
}

export function useRepos(): ReposBundle {
  const v = useContext(Ctx);
  if (!v) throw new Error('useRepos must be used inside AuthProvider');
  return v.repos;
}
