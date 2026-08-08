-- EYES evidence fusion: separate AI-generation, deepfake, provenance (C2PA), and
-- model attribution into distinct fields instead of one collapsed score.
alter table eyes_scans
  add column if not exists ai_probability numeric,
  add column if not exists deepfake_probability numeric,
  add column if not exists c2pa_present boolean default false,
  add column if not exists c2pa_valid boolean,
  add column if not exists c2pa_data jsonb,
  add column if not exists model_attribution jsonb,
  add column if not exists watermark jsonb default '{"status":"not_checked"}'::jsonb;
