-- Heard — row-level security
-- Every user sees only their own rows. RLS off → everyone sees everything,
-- which is the WRONG default. We turn it on for every table that holds
-- user data, then add owner-only policies.

alter table public.owned_services    enable row level security;
alter table public.saved              enable row level security;
alter table public.inbox              enable row level security;
alter table public.extract_rate_limit enable row level security;

-- ─── owned_services ───────────────────────────────────────────────────

create policy owned_services_select_own
  on public.owned_services for select
  using (auth.uid() = user_id);

create policy owned_services_insert_own
  on public.owned_services for insert
  with check (auth.uid() = user_id);

create policy owned_services_update_own
  on public.owned_services for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy owned_services_delete_own
  on public.owned_services for delete
  using (auth.uid() = user_id);

-- ─── saved ────────────────────────────────────────────────────────────

create policy saved_select_own
  on public.saved for select
  using (auth.uid() = user_id);

create policy saved_insert_own
  on public.saved for insert
  with check (auth.uid() = user_id);

create policy saved_update_own
  on public.saved for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy saved_delete_own
  on public.saved for delete
  using (auth.uid() = user_id);

-- ─── inbox ────────────────────────────────────────────────────────────

create policy inbox_select_own
  on public.inbox for select
  using (auth.uid() = user_id);

create policy inbox_insert_own
  on public.inbox for insert
  with check (auth.uid() = user_id);

create policy inbox_update_own
  on public.inbox for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy inbox_delete_own
  on public.inbox for delete
  using (auth.uid() = user_id);

-- ─── extract_rate_limit ───────────────────────────────────────────────
-- Users can read their own counter (so the app can show "you're
-- approaching your daily limit" later); only the Edge Function (with
-- service-role key) writes to it.

create policy extract_rate_limit_select_own
  on public.extract_rate_limit for select
  using (auth.uid() = user_id);

-- Note: extraction_cache is intentionally NOT user-scoped. It's a
-- shared server-side cache keyed on (text_hash, source). Edge Functions
-- access it via the service-role key, never via RLS, so no policy here.
-- If we ever expose this table to the client (we shouldn't), turn RLS
-- on and lock it down first.
