// Auth-aware repo factory. Screens never instantiate a repo directly —
// they call `getRepos()` which returns a bundle of (Inbox|Saved|Owned)Repo
// pointing at the right backing store for the current session:
//
//   - guest (no session) → AsyncStorage
//   - authed              → Supabase
//
// On sign-in we run a one-time migration (Phase 8 task 8.x) that copies
// guest rows into Postgres before flipping the factory output.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { InboxRepo, SavedRepo, OwnedRepo, KeyValueStore } from './repos';
import {
  AsyncInboxRepo,
  AsyncSavedRepo,
  AsyncOwnedRepo,
} from '../infra/storage/asyncRepos';
import {
  SupabaseInboxRepo,
  SupabaseSavedRepo,
  SupabaseOwnedRepo,
} from '../infra/storage/supabaseRepos';

export interface ReposBundle {
  inbox: InboxRepo;
  saved: SavedRepo;
  owned: OwnedRepo;
  /** Lets the UI render "guest mode" hints when relevant. */
  isGuest: boolean;
}

export interface RepoFactoryDeps {
  supabase: SupabaseClient | null;
  /** Authenticated user id, or null when guest. */
  userId: string | null;
  /** Storage for guest mode (AsyncStorage in app, MemoryStore in tests). */
  guestStorage: KeyValueStore;
}

export function buildRepos(deps: RepoFactoryDeps): ReposBundle {
  const isGuest = !(deps.supabase && deps.userId);
  if (isGuest) {
    return {
      inbox: new AsyncInboxRepo(deps.guestStorage),
      saved: new AsyncSavedRepo(deps.guestStorage),
      owned: new AsyncOwnedRepo(deps.guestStorage),
      isGuest: true,
    };
  }
  return {
    inbox: new SupabaseInboxRepo(deps.supabase!, deps.userId!),
    saved: new SupabaseSavedRepo(deps.supabase!, deps.userId!),
    owned: new SupabaseOwnedRepo(deps.supabase!, deps.userId!),
    isGuest: false,
  };
}
