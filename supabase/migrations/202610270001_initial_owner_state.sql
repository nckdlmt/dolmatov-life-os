create table if not exists public.owner_state (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  structure_version integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.owner_state enable row level security;

create policy "Owner can read own state"
on public.owner_state
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Owner can insert own state"
on public.owner_state
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Owner can update own state"
on public.owner_state
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create table if not exists public.knowledge_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  body text not null default '',
  tags text[] not null default '{}',
  direction_id text,
  initiative_id text,
  activity_id text,
  source_type text not null default 'note',
  source_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('russian', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(body, '')), 'B')
  ) stored
);

create index if not exists knowledge_entries_owner_idx
on public.knowledge_entries(owner_id, updated_at desc);

create index if not exists knowledge_entries_search_idx
on public.knowledge_entries using gin(search_vector);

alter table public.knowledge_entries enable row level security;

create policy "Owner can manage own knowledge"
on public.knowledge_entries
for all
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);
