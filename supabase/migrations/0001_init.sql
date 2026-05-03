-- Heard — initial schema
-- Run via: supabase db push  (or paste into SQL Editor in dashboard)
--
-- Three user-scoped tables. `users` is managed by Supabase Auth; we
-- only reference its uuid here. Confidence values are kept as text
-- (not enum) so we can extend without a migration.

create extension if not exists pgcrypto;

-- ─── owned_services ────────────────────────────────────────────────────
-- The streaming services the user has subscriptions to. Composite PK so
-- INSERT ... ON CONFLICT DO NOTHING is the natural "add" operation.

create table public.owned_services (
  user_id     uuid not null references auth.users(id) on delete cascade,
  service_id  text not null,
  added_at    timestamptz not null default now(),
  primary key (user_id, service_id)
);

-- ─── saved ────────────────────────────────────────────────────────────
-- The user's watchlist. Unique (user_id, tmdb_id) prevents duplicates
-- when the same title is saved from inbox + a streamer screen + search.

create table public.saved (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  tmdb_id      int  not null,
  title        text not null,
  year         text,
  poster_path  text,
  added_at     timestamptz not null default now(),
  unique (user_id, tmdb_id)
);

create index saved_user_added_idx on public.saved (user_id, added_at desc);

-- ─── inbox ────────────────────────────────────────────────────────────
-- Captured entries with confidence + extraction metadata. Status moves
-- through pending → saved | dismissed | archived. Soft-delete: dismissed
-- entries kept 30 days for the future ML signal (PRD §14); a separate
-- cron purges them.

create table public.inbox (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  raw_text     text not null,
  source       text not null check (source in ('voice','paste','screenshot','url','tiktok')),
  source_url   text,
  tmdb_id      int,
  title        text,
  year         text,
  confidence   text not null check (confidence in ('high','med','low')),
  alt_matches  jsonb not null default '[]'::jsonb,
  status       text not null default 'pending'
                  check (status in ('pending','saved','dismissed','archived')),
  captured_at  timestamptz not null default now(),
  deleted_at   timestamptz
);

create index inbox_user_status_idx on public.inbox (user_id, status, captured_at desc);
create index inbox_dismissed_purge_idx on public.inbox (deleted_at)
  where status = 'dismissed';

-- ─── extraction_cache ──────────────────────────────────────────────────
-- Server-side cache for /extract (cuts Anthropic spend per PRD §11).
-- Keyed by (text_hash, source). 24h TTL enforced by a cron function.

create table public.extraction_cache (
  text_hash    text not null,
  source       text not null,
  result       jsonb not null,
  hit_count    int  not null default 0,
  cached_at    timestamptz not null default now(),
  primary key (text_hash, source)
);

create index extraction_cache_age_idx on public.extraction_cache (cached_at);

-- ─── extract_rate_limit ────────────────────────────────────────────────
-- Per-user-per-day call counter for /extract. Cleared by a daily cron.
-- Limit enforced inside the Edge Function via _shared/rateLimit.ts.

create table public.extract_rate_limit (
  user_id   uuid not null references auth.users(id) on delete cascade,
  day       date not null,
  count     int  not null default 0,
  primary key (user_id, day)
);
