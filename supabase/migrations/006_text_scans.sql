-- Text AI-detection scans table
create table if not exists text_scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content_excerpt text not null,
  word_count integer default 0,
  ai_probability float default 50,
  verdict text check (verdict in ('human','likely_human','uncertain','likely_ai','ai_generated')) default 'uncertain',
  signals text[] default '{}',
  explanation text default '',
  created_at timestamp with time zone default now()
);

alter table text_scans enable row level security;

create policy "Users can view own text scans"
  on text_scans for select
  using (auth.uid() = user_id);

create policy "Users can insert own text scans"
  on text_scans for insert
  with check (auth.uid() = user_id);
