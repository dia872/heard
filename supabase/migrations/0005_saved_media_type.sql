alter table public.saved
  add column if not exists media_type text not null default 'movie'
    check (media_type in ('movie', 'tv'));
