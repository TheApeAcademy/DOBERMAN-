-- DOBERMAN Migration 004 — breach_scans table
--
-- breach-check/index.ts and useBreach.ts have always read/written a table
-- called breach_scans, but no migration ever created it. The breach_checks
-- table from 002_news_breach_tables.sql was built for an earlier, narrower
-- design of the breach-check function (email-hash lookups only) and has an
-- incompatible column shape; it is left in place but unused by current code.

create table if not exists breach_scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  scan_type text not null,
  query text,
  result text,
  created_at timestamptz default now()
);

alter table breach_scans enable row level security;

create policy "Users can view own breach scans"
  on breach_scans for select
  using (auth.uid() = user_id);

create policy "Users can insert own breach scans"
  on breach_scans for insert
  with check (auth.uid() = user_id);
