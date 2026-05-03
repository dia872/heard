-- Atomic counter for the per-user-per-day extract rate limit.
-- Returns the new count post-increment so the Edge Function can
-- compare against the limit in one round-trip.

create or replace function public.increment_extract_count(
  p_user_id uuid,
  p_day     date
) returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count int;
begin
  insert into public.extract_rate_limit (user_id, day, count)
    values (p_user_id, p_day, 1)
    on conflict (user_id, day)
    do update set count = public.extract_rate_limit.count + 1
    returning count into new_count;
  return new_count;
end;
$$;

-- Only authenticated callers can hit this — the Edge Function uses
-- service-role and bypasses RLS regardless, but the grant is good hygiene.
revoke all on function public.increment_extract_count(uuid, date) from public;
grant execute on function public.increment_extract_count(uuid, date) to authenticated;
