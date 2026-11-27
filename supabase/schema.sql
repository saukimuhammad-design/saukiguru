-- GuruApp Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User profiles table
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  school_name text,
  role text check (role in ('guru', 'kepala_sekolah', 'admin', 'siswa')) default 'guru',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Lessons table
create table if not exists public.lessons (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject text not null,
  grade text not null,
  topic text not null,
  curriculum text check (curriculum in ('merdeka', 'ktsp', 'cambridge', 'ib')) default 'merdeka',
  standard text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Lesson outputs table
create table if not exists public.lesson_outputs (
  id uuid default gen_random_uuid() primary key,
  lesson_id uuid references public.lessons on delete cascade not null,
  type text check (type in ('rpp', 'slide', 'soal', 'lks', 'rubrik', 'media', 'remedial', 'enrichment')) not null,
  content jsonb not null,
  version int default 1 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index if not exists lessons_user_id_idx on public.lessons(user_id);
create index if not exists lessons_created_at_idx on public.lessons(created_at desc);
create index if not exists lesson_outputs_lesson_id_idx on public.lesson_outputs(lesson_id);
create index if not exists lesson_outputs_type_idx on public.lesson_outputs(type);

-- RLS Policies
alter table public.user_profiles enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_outputs enable row level security;

-- User profiles policies
create policy "Users can view own profile" on public.user_profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.user_profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.user_profiles
  for insert with check (auth.uid() = id);

-- Lessons policies
create policy "Users can view own lessons" on public.lessons
  for select using (auth.uid() = user_id);

create policy "Users can insert own lessons" on public.lessons
  for insert with check (auth.uid() = user_id);

create policy "Users can update own lessons" on public.lessons
  for update using (auth.uid() = user_id);

create policy "Users can delete own lessons" on public.lessons
  for delete using (auth.uid() = user_id);

-- Lesson outputs policies
create policy "Users can view own lesson outputs" on public.lesson_outputs
  for select using (
    exists (
      select 1 from public.lessons 
      where lessons.id = lesson_outputs.lesson_id 
      and lessons.user_id = auth.uid()
    )
  );

create policy "Users can insert own lesson outputs" on public.lesson_outputs
  for insert with check (
    exists (
      select 1 from public.lessons 
      where lessons.id = lesson_outputs.lesson_id 
      and lessons.user_id = auth.uid()
    )
  );

create policy "Users can update own lesson outputs" on public.lesson_outputs
  for update using (
    exists (
      select 1 from public.lessons 
      where lessons.id = lesson_outputs.lesson_id 
      and lessons.user_id = auth.uid()
    )
  );

create policy "Users can delete own lesson outputs" on public.lesson_outputs
  for delete using (
    exists (
      select 1 from public.lessons 
      where lessons.id = lesson_outputs.lesson_id 
      and lessons.user_id = auth.uid()
    )
  );

-- Trigger to auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'guru'
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end $$;

drop trigger if exists set_updated_at_user_profiles on public.user_profiles;
create trigger set_updated_at_user_profiles
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at_lessons on public.lessons;
create trigger set_updated_at_lessons
  before update on public.lessons
  for each row execute procedure public.handle_updated_at();