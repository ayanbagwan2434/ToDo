-- TaskFlow Supabase Database Schema & Row Level Security (RLS)
-- Run this script in your Supabase project's SQL Editor.

-- Enable pgcrypto for UUID generation if not already enabled
create extension if not exists "pgcrypto";

-- Tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text not null default '',
  due_date timestamptz null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  category text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for fast user-scoped queries and sorting
create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_due_date_idx on public.tasks (user_id, due_date);
create index if not exists tasks_status_idx on public.tasks (user_id, status);

-- Categories table (per-user project/category organization)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  color text not null default '#4F46E5',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- Automatically update updated_at timestamp on row updates
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

-- Enable Row Level Security (RLS)
alter table public.tasks enable row level security;
alter table public.categories enable row level security;

-- Tasks RLS Policies: Users can only read, insert, update, and delete their own tasks
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can create their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Categories RLS Policies
create policy "Users can view their own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can create their own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own categories"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on public.categories for delete
  using (auth.uid() = user_id);
