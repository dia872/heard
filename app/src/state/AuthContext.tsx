// Auth + repos context. Wraps the app so any screen can grab the
// current session/userId via useAuth() and the right repo bundle
// via useRepos(). Soft-gate sign-in flow lands here in Phase 8.
//
// For Phase 5 we ship guest-only — buildRepos returns AsyncStorage
// repos when userId is null. When Phase 8 adds Apple/Google sign-in,
// we'll subscribe to supabase.auth.onAuthStateChange and update
// userId here; everything downstream stays the same.

import { createContext, useContext, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildRepos, ReposBundle } from '../domain/repoFactory';
import { getSupabase } from '../infra/supabase/client';

interface AuthState {
  userId: string | null;
}

interface CtxValue {
  state: AuthState;
  repos: ReposBundle;
}

const Ctx = createContext<CtxValue | null>(null);

// Stable initial state — keeps useMemo deps shallow-equal across renders.
const INITIAL_STATE: AuthState = { userId: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  // Phase 5: guest-only. Phase 8 will swap this for state from
  // supabase.auth.onAuthStateChange.
  const state = INITIAL_STATE;

  const repos = useMemo(
    () =>
      buildRepos({
        supabase: state.userId ? getSupabase() : null,
        userId: state.userId,
        guestStorage: AsyncStorage,
      }),
    [state.userId]
  );

  // Memoize the value object too so consumer re-renders only fire
  // when state or repos identity actually changes.
  const value = useMemo<CtxValue>(() => ({ state, repos }), [state, repos]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
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
