-- DOBERMAN Migration 002 — News Feed + Breach Check tables

-- Cache RSS articles (refresh every 30 min)
CREATE TABLE IF NOT EXISTS cached_news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT,
  article_url TEXT UNIQUE NOT NULL,
  published_at TIMESTAMPTZ,
  category TEXT,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cached_news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read news articles" ON cached_news_articles
  FOR SELECT USING (true);

CREATE POLICY "Service manage news articles" ON cached_news_articles
  FOR ALL WITH CHECK (true);

-- News article AI conversations
CREATE TABLE IF NOT EXISTS news_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  article_url TEXT NOT NULL,
  article_title TEXT,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE news_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own news conversations" ON news_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service manage news conversations" ON news_conversations
  FOR ALL WITH CHECK (true);

-- Breach checks (email stored as SHA-1 hash only)
CREATE TABLE IF NOT EXISTS breach_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email_hash TEXT NOT NULL,
  breach_count INTEGER,
  risk_score INTEGER,
  summary TEXT,
  action_plan JSONB,
  breaches JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE breach_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own breach checks" ON breach_checks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service insert breach checks" ON breach_checks
  FOR INSERT WITH CHECK (true);
