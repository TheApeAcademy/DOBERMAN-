-- DOBERMAN Migration 005 — Cyber Globe live country brief cache
--
-- Caches the Claude-generated per-country threat brief returned by the
-- globe-country-brief edge function so repeated selections of the same
-- country within 24h don't re-call the model. Nothing in this table is
-- hardcoded seed data — rows only exist once DAYE has actually generated
-- a brief for that country.

CREATE TABLE IF NOT EXISTS globe_country_briefs (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brief JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE globe_country_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read globe country briefs" ON globe_country_briefs
  FOR SELECT USING (true);

CREATE POLICY "Service manage globe country briefs" ON globe_country_briefs
  FOR ALL WITH CHECK (true);
