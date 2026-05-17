-- Breach checks table
CREATE TABLE IF NOT EXISTS breach_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  check_type text NOT NULL,
  query_display text NOT NULL,
  breach_count integer DEFAULT 0,
  breaches jsonb DEFAULT '[]'::jsonb,
  risk_level text DEFAULT 'low',
  daye_analysis text,
  trust_score integer DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

-- Scam link checks table
CREATE TABLE IF NOT EXISTS scam_link_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  domain text,
  risk_score integer DEFAULT 0,
  verdict text DEFAULT 'safe',
  threat_type text,
  indicators jsonb DEFAULT '[]'::jsonb,
  daye_analysis text,
  created_at timestamptz DEFAULT now()
);

-- Voice scans table
CREATE TABLE IF NOT EXISTS voice_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  manipulation_probability integer DEFAULT 50,
  clone_indicators jsonb DEFAULT '[]'::jsonb,
  emotional_manipulation_score integer DEFAULT 0,
  verdict text DEFAULT 'uncertain',
  daye_analysis text,
  trust_score integer DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE breach_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_link_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own breach_checks"
  ON breach_checks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own scam_link_checks"
  ON scam_link_checks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own voice_scans"
  ON voice_scans FOR ALL USING (auth.uid() = user_id);
