-- PromptKeeper database schema
create extension if not exists pgcrypto;
create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  content text not null check (char_length(trim(content)) > 0),
  category text,
  tags text[] not null default '{}',
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists prompts_user_id_idx on public.prompts(user_id);
create index if not exists prompts_user_updated_idx on public.prompts(user_id, updated_at desc);
create or replace function public.set_updated_at() returns trigger language plpgsql security invoker as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists prompts_set_updated_at on public.prompts;
create trigger prompts_set_updated_at before update on public.prompts for each row execute function public.set_updated_at();
alter table public.prompts enable row level security;
drop policy if exists "Users can read their own prompts" on public.prompts;
create policy "Users can read their own prompts" on public.prompts for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can insert their own prompts" on public.prompts;
create policy "Users can insert their own prompts" on public.prompts for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update their own prompts" on public.prompts;
create policy "Users can update their own prompts" on public.prompts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete their own prompts" on public.prompts;
create policy "Users can delete their own prompts" on public.prompts for delete to authenticated using ((select auth.uid()) = user_id);
