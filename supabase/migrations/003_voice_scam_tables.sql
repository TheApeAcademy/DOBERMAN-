-- Voice scans table
create table if not exists voice_scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  file_name text not null,
  file_url text not null,
  manipulation_probability float default 0,
  clone_indicators text[] default '{}',
  emotional_manipulation_score float default 0,
  verdict text check (verdict in ('authentic','likely_authentic','uncertain','likely_ai','certain_ai')) default 'uncertain',
  daye_analysis text default '',
  trust_score float default 0,
  created_at timestamp with time zone default now()
);

alter table voice_scans enable row level security;

create policy "Users can view own voice scans"
  on voice_scans for select
  using (auth.uid() = user_id);

create policy "Users can insert own voice scans"
  on voice_scans for insert
  with check (auth.uid() = user_id);

-- Scam link checks table
create table if not exists scam_link_checks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  domain text not null,
  risk_score integer default 0,
  verdict text check (verdict in ('safe','suspicious','dangerous','phishing','malware')) default 'safe',
  threat_type text default '',
  indicators text[] default '{}',
  daye_analysis text default '',
  created_at timestamp with time zone default now()
);

alter table scam_link_checks enable row level security;

create policy "Users can view own scam link checks"
  on scam_link_checks for select
  using (auth.uid() = user_id);

create policy "Users can insert own scam link checks"
  on scam_link_checks for insert
  with check (auth.uid() = user_id);

-- Add voice and scam_link to usage_logs module enum if not already present
do $$
begin
  -- usage_logs.module is stored as text, no enum to alter
  -- Just ensure the constraint allows new values
  null;
end $$;
