create table if not exists news_checks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  content text not null,
  credibility_score integer,
  verdict text,
  summary text,
  red_flags text[],
  positive_signals text[],
  source_quality text,
  recommendation text,
  created_at timestamptz default now()
);

alter table news_checks enable row level security;

create policy "Users can view own news checks" on news_checks
  for select using (auth.uid() = user_id);

create policy "Service role can insert news checks" on news_checks
  for insert with check (true);

create policy "Users can delete own news checks" on news_checks
  for delete using (auth.uid() = user_id);
