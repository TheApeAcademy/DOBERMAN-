-- FANGS: Cybersecurity Threat Analyzer
-- Add fangs_scans table and update usage_logs module constraint

create table if not exists fangs_scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  input_value text not null,
  input_type text not null check (input_type in ('url', 'ip', 'domain', 'hash', 'email', 'code', 'text')),
  threat_type text not null check (threat_type in ('phishing', 'malware', 'intrusion', 'vulnerability', 'darkweb', 'general')),
  verdict text not null check (verdict in ('malicious', 'suspicious', 'clean', 'unknown')),
  risk_score integer not null default 0,
  threat_name text,
  description text,
  indicators jsonb default '[]',
  cves jsonb default '[]',
  apt_groups jsonb default '[]',
  recommendations jsonb default '[]',
  created_at timestamptz default now()
);

alter table fangs_scans enable row level security;

create policy "Users can view own fangs scans" on fangs_scans
  for select using (auth.uid() = user_id);

create policy "Service role can insert fangs scans" on fangs_scans
  for insert with check (true);

create policy "Service role can delete fangs scans" on fangs_scans
  for delete using (auth.uid() = user_id);

create index if not exists fangs_scans_user_id_idx on fangs_scans(user_id);
create index if not exists fangs_scans_created_at_idx on fangs_scans(created_at desc);
