-- DOBERMAN Initial Schema
-- Run this in the Supabase SQL editor for your project

-- Profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  avatar_url text,
  plan text default 'free',
  scan_credits integer default 5,
  created_at timestamptz default now(),
  last_login timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- EYES scans
create table if not exists eyes_scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  file_name text,
  file_type text,
  file_url text,
  result text,
  confidence_score numeric,
  explanation text,
  hive_raw jsonb,
  created_at timestamptz default now()
);

alter table eyes_scans enable row level security;

create policy "Users can view own eyes scans" on eyes_scans
  for select using (auth.uid() = user_id);

create policy "Service role can insert eyes scans" on eyes_scans
  for insert with check (true);

create policy "Service role can delete eyes scans" on eyes_scans
  for delete using (auth.uid() = user_id);

-- NOSE scans
create table if not exists nose_scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  environment_description text,
  devices jsonb,
  overall_risk_score integer,
  vulnerabilities jsonb,
  recommendations jsonb,
  created_at timestamptz default now()
);

alter table nose_scans enable row level security;

create policy "Users can view own nose scans" on nose_scans
  for select using (auth.uid() = user_id);

create policy "Service role can insert nose scans" on nose_scans
  for insert with check (true);

create policy "Service role can delete nose scans" on nose_scans
  for delete using (auth.uid() = user_id);

-- BRAIN conversations
create table if not exists brain_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text,
  messages jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table brain_conversations enable row level security;

create policy "Users can view own conversations" on brain_conversations
  for select using (auth.uid() = user_id);

create policy "Service role can insert conversations" on brain_conversations
  for insert with check (true);

create policy "Service role can update conversations" on brain_conversations
  for update using (true);

create policy "Service role can delete conversations" on brain_conversations
  for delete using (auth.uid() = user_id);

-- Usage tracking
create table if not exists usage_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  module text,
  action text,
  created_at timestamptz default now()
);

alter table usage_logs enable row level security;

create policy "Users can view own usage" on usage_logs
  for select using (auth.uid() = user_id);

create policy "Service role can insert usage" on usage_logs
  for insert with check (true);

create policy "Service role can delete usage" on usage_logs
  for delete using (auth.uid() = user_id);

-- Storage bucket (run in Supabase dashboard if not CLI)
-- insert into storage.buckets (id, name, public) values ('doberman-files', 'doberman-files', true);
