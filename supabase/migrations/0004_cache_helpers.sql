-- Helpers for /extract's cache table.

-- Atomic increment of hit_count for a cache entry.
create or replace function public.bump_cache_hit(
  p_text_hash text,
  p_source    text
) returns void
language sql
security definer
set search_path = public
as $$
  update public.extraction_cache
    set hit_count = hit_count + 1
    where text_hash = p_text_hash and source = p_source;
$$;

revoke all on function public.bump_cache_hit(text, text) from public;
-- Edge Function uses service-role and bypasses grants, but explicit
-- denials keep this out of the client surface entirely.
