-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  message text not null default '' check (char_length(message) <= 800),
  photo_url text,
  storage_path text,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  content text not null check (char_length(content) between 1 and 6000),
  unlock_date timestamptz not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.memories enable row level security;
alter table public.letters enable row level security;

drop policy if exists "Public can read approved memories" on public.memories;
create policy "Public can read approved memories"
on public.memories for select
to anon, authenticated
using (approved = true);

-- Letter content is only returned by the browser after its unlock date.
drop policy if exists "Public can read unlocked letters" on public.letters;
create policy "Public can read unlocked letters"
on public.letters for select
to anon, authenticated
using (unlock_date <= now());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-photos',
  'memory-photos',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Only the service-role Edge Function writes files.
drop policy if exists "Public can view memory photos" on storage.objects;
create policy "Public can view memory photos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'memory-photos');
