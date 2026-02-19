-- ============================================================================
-- Agent Skill System Migration
-- Adds skill marketplace, skill assignments, and usage tracking
-- ============================================================================

-- ============================================================================
-- AGENT SKILLS TABLE
-- Defines available skills in the marketplace
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Information
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,

  -- Skill Metadata
  version VARCHAR(20) DEFAULT '1.0.0',
  author VARCHAR(200),
  provider VARCHAR(100), -- 'TKG', 'Polymarket', 'Factagora', etc.

  -- Capabilities (JSON)
  capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  required_data JSONB DEFAULT '{}'::jsonb,
  output_format JSONB DEFAULT '{}'::jsonb,

  -- Implementation
  implementation_type VARCHAR(50) NOT NULL,
  implementation_config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Restrictions
  subscription_requirement VARCHAR(20) DEFAULT 'FREE',

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_beta BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CHECK (category IN ('PREDICTION', 'FACT_CHECKING', 'MARKET_ANALYSIS', 'SENTIMENT_ANALYSIS', 'DATA_COLLECTION', 'ANALYSIS')),
  CHECK (implementation_type IN ('BUILT_IN', 'EXTERNAL_API', 'WEBHOOK')),
  CHECK (subscription_requirement IN ('FREE', 'PAID', 'PRO'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_skills_category ON agent_skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_slug ON agent_skills(slug);
CREATE INDEX IF NOT EXISTS idx_skills_active ON agent_skills(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_skills_provider ON agent_skills(provider);

-- RLS
ALTER TABLE agent_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active skills"
  ON agent_skills FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage skills"
  ON agent_skills FOR ALL
  USING (false); -- Only backend/admin can manage

-- ============================================================================
-- AGENT SKILL ASSIGNMENTS TABLE
-- Many-to-Many relationship between agents and skills
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_skill_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES agent_skills(id) ON DELETE CASCADE,

  -- Configuration
  is_enabled BOOLEAN DEFAULT true,
  skill_config JSONB DEFAULT '{}'::jsonb,

  -- Statistics
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(agent_id, skill_id),
  CHECK (usage_count >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assignments_agent ON agent_skill_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_assignments_skill ON agent_skill_assignments(skill_id);
CREATE INDEX IF NOT EXISTS idx_assignments_enabled ON agent_skill_assignments(is_enabled) WHERE is_enabled = true;

-- RLS
ALTER TABLE agent_skill_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view skill assignments"
  ON agent_skill_assignments FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their agent skills"
  ON agent_skill_assignments FOR ALL
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- SKILL USAGE LOGS TABLE
-- Tracks skill execution for analytics and debugging
-- ============================================================================

CREATE TABLE IF NOT EXISTS skill_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES agent_skills(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL,
  argument_id UUID REFERENCES arguments(id) ON DELETE SET NULL,

  -- Execution Information
  input_data JSONB NOT NULL,
  output_data JSONB,
  execution_time_ms INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CHECK (execution_time_ms IS NULL OR execution_time_ms >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_usage_logs_agent ON skill_usage_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_skill ON skill_usage_logs(skill_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_prediction ON skill_usage_logs(prediction_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON skill_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_success ON skill_usage_logs(success);

-- RLS
ALTER TABLE skill_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view usage logs"
  ON skill_usage_logs FOR SELECT
  USING (true);

CREATE POLICY "System can create usage logs"
  ON skill_usage_logs FOR INSERT
  WITH CHECK (true); -- Only backend can create

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update agent_skills.updated_at
CREATE OR REPLACE FUNCTION update_agent_skills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agent_skills_timestamp
  BEFORE UPDATE ON agent_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_skills_updated_at();

-- Increment usage_count when skill is used
CREATE OR REPLACE FUNCTION increment_skill_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment if the execution was successful
  IF NEW.success = true THEN
    UPDATE agent_skill_assignments
    SET
      usage_count = usage_count + 1,
      last_used_at = NEW.created_at
    WHERE agent_id = NEW.agent_id AND skill_id = NEW.skill_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_usage_counter
  AFTER INSERT ON skill_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION increment_skill_usage_count();

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View for skill statistics
CREATE OR REPLACE VIEW skill_statistics AS
SELECT
  s.id as skill_id,
  s.slug,
  s.name,
  s.category,
  s.provider,
  COUNT(DISTINCT asa.agent_id) as agents_using,
  SUM(asa.usage_count) as total_uses,
  COUNT(DISTINCT sul.id) FILTER (WHERE sul.success = true) as successful_executions,
  COUNT(DISTINCT sul.id) FILTER (WHERE sul.success = false) as failed_executions,
  AVG(sul.execution_time_ms) FILTER (WHERE sul.success = true) as avg_execution_time_ms
FROM agent_skills s
LEFT JOIN agent_skill_assignments asa ON asa.skill_id = s.id
LEFT JOIN skill_usage_logs sul ON sul.skill_id = s.id
WHERE s.is_active = true
GROUP BY s.id, s.slug, s.name, s.category, s.provider;

COMMENT ON VIEW skill_statistics IS 'Aggregate statistics for each skill';

-- View for agent skill performance
CREATE OR REPLACE VIEW agent_skill_performance AS
SELECT
  a.id as agent_id,
  a.name as agent_name,
  s.id as skill_id,
  s.name as skill_name,
  asa.usage_count,
  asa.last_used_at,
  COUNT(sul.id) FILTER (WHERE sul.success = true) as successful_uses,
  COUNT(sul.id) FILTER (WHERE sul.success = false) as failed_uses,
  AVG(sul.execution_time_ms) FILTER (WHERE sul.success = true) as avg_execution_time_ms
FROM agents a
JOIN agent_skill_assignments asa ON asa.agent_id = a.id
JOIN agent_skills s ON s.id = asa.skill_id
LEFT JOIN skill_usage_logs sul ON sul.agent_id = a.id AND sul.skill_id = s.id
GROUP BY a.id, a.name, s.id, s.name, asa.usage_count, asa.last_used_at;

COMMENT ON VIEW agent_skill_performance IS 'Performance metrics for each agent-skill combination';

-- ============================================================================
-- SAMPLE DATA - Phase 1 Skills
-- ============================================================================

DO $$
BEGIN
  -- 1. Timeseries Forecasting (TKG API)
  INSERT INTO agent_skills (
    slug,
    name,
    description,
    category,
    version,
    author,
    provider,
    capabilities,
    required_data,
    output_format,
    implementation_type,
    implementation_config,
    subscription_requirement,
    is_active,
    is_beta
  ) VALUES (
    'timeseries-forecasting',
    'Timeseries Forecasting',
    '과거 투표 데이터를 분석하여 미래 트렌드를 예측합니다. TKG ML 엔진을 사용하여 ARIMA, Prophet 등의 고급 시계열 분석 기법을 적용합니다.',
    'PREDICTION',
    '1.0.0',
    'Factagora Team',
    'TKG',
    '{"analyzes_historical_data": true, "supports_trend_detection": true, "provides_confidence_intervals": true, "supports_prediction_types": ["BINARY", "NUMERIC"]}'::jsonb,
    '{"vote_history": {"min_data_points": 5, "time_range": "1 week minimum"}}'::jsonb,
    '{"prediction": "number", "confidence": "number (0-1)", "trend": "string", "supporting_evidence": "array"}'::jsonb,
    'EXTERNAL_API',
    '{"api_endpoint": "/api/mock/tkg/timeseries/forecast", "auth_type": "api_key", "method": "POST", "timeout_ms": 5000}'::jsonb,
    'FREE',
    true,
    false
  ) ON CONFLICT (slug) DO NOTHING;

  -- 2. Polymarket Integration
  INSERT INTO agent_skills (
    slug,
    name,
    description,
    category,
    version,
    author,
    provider,
    capabilities,
    required_data,
    output_format,
    implementation_type,
    implementation_config,
    subscription_requirement,
    is_active,
    is_beta
  ) VALUES (
    'polymarket-integration',
    'Polymarket Market Data',
    'Polymarket 예측시장 데이터를 가져와 현재 시장 컨센서스를 분석합니다. 실시간 오즈, 거래량, 트렌드를 파악할 수 있습니다.',
    'MARKET_ANALYSIS',
    '1.0.0',
    'Factagora Team',
    'Polymarket',
    '{"fetches_market_odds": true, "tracks_volume": true, "identifies_trends": true}'::jsonb,
    '{"query": "string"}'::jsonb,
    '{"current_odds": "object", "24h_change": "number", "volume": "number", "trending": "boolean"}'::jsonb,
    'EXTERNAL_API',
    '{"api_endpoint": "https://api.polymarket.com/v1", "auth_type": "none", "rate_limit": "100/hour"}'::jsonb,
    'FREE',
    true,
    true
  ) ON CONFLICT (slug) DO NOTHING;

  -- 3. News & Web Scraping
  INSERT INTO agent_skills (
    slug,
    name,
    description,
    category,
    version,
    author,
    provider,
    capabilities,
    required_data,
    output_format,
    implementation_type,
    implementation_config,
    subscription_requirement,
    is_active,
    is_beta
  ) VALUES (
    'news-scraper',
    'News & Evidence Scraper',
    '관련 뉴스 기사와 웹 데이터를 수집하여 사실 검증에 활용합니다. 주요 뉴스 사이트와 신뢰할 수 있는 출처에서 정보를 수집합니다.',
    'FACT_CHECKING',
    '1.0.0',
    'Factagora Team',
    'Factagora',
    '{"scrapes_news_articles": true, "extracts_key_facts": true, "validates_sources": true, "supports_multiple_languages": ["en", "ko"]}'::jsonb,
    '{"query": "string", "max_articles": 10}'::jsonb,
    '{"articles": "array", "key_facts": "array", "source_credibility": "object"}'::jsonb,
    'BUILT_IN',
    '{"handler": "lib/skills/news-scraper.ts", "max_articles": 10, "timeout_ms": 10000}'::jsonb,
    'PAID',
    true,
    true
  ) ON CONFLICT (slug) DO NOTHING;

  -- 4. Social Media Sentiment
  INSERT INTO agent_skills (
    slug,
    name,
    description,
    category,
    version,
    author,
    provider,
    capabilities,
    required_data,
    output_format,
    implementation_type,
    implementation_config,
    subscription_requirement,
    is_active,
    is_beta
  ) VALUES (
    'social-sentiment',
    'Social Media Sentiment Analysis',
    'Twitter, Reddit 등 소셜 미디어에서 대중 의견과 감성을 분석합니다. 트렌딩 해시태그와 주요 토픽을 파악할 수 있습니다.',
    'SENTIMENT_ANALYSIS',
    '1.0.0',
    'Factagora Team',
    'External',
    '{"analyzes_twitter": true, "analyzes_reddit": true, "sentiment_scoring": true, "trend_detection": true}'::jsonb,
    '{"query": "string", "platforms": ["twitter", "reddit"]}'::jsonb,
    '{"overall_sentiment": "number (-1 to 1)", "sentiment_distribution": "object", "key_topics": "array", "trending_hashtags": "array"}'::jsonb,
    'EXTERNAL_API',
    '{"api_endpoint": "/api/mock/sentiment/analyze", "auth_type": "api_key", "rate_limit": "1000/day"}'::jsonb,
    'PAID',
    true,
    true
  ) ON CONFLICT (slug) DO NOTHING;

  -- 5. Statistical Validation
  INSERT INTO agent_skills (
    slug,
    name,
    description,
    category,
    version,
    author,
    provider,
    capabilities,
    required_data,
    output_format,
    implementation_type,
    implementation_config,
    subscription_requirement,
    is_active,
    is_beta
  ) VALUES (
    'statistical-validation',
    'Statistical Validation & Analysis',
    '통계적 검증 및 데이터 신뢰도를 분석합니다. TKG ML 엔진을 사용하여 가설 검정, 신뢰 구간, 상관관계 분석 등을 수행합니다.',
    'ANALYSIS',
    '1.0.0',
    'Factagora Team',
    'TKG',
    '{"hypothesis_testing": true, "confidence_intervals": true, "correlation_analysis": true, "outlier_detection": true}'::jsonb,
    '{"data": "array", "hypothesis": "string"}'::jsonb,
    '{"is_statistically_significant": "boolean", "p_value": "number", "confidence_interval": "object", "analysis_summary": "string"}'::jsonb,
    'EXTERNAL_API',
    '{"api_endpoint": "/api/mock/tkg/statistics/validate", "auth_type": "api_key", "method": "POST"}'::jsonb,
    'PRO',
    true,
    false
  ) ON CONFLICT (slug) DO NOTHING;

END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE agent_skills IS 'Catalog of available skills that agents can use';
COMMENT ON TABLE agent_skill_assignments IS 'Many-to-many relationship tracking which agents have which skills enabled';
COMMENT ON TABLE skill_usage_logs IS 'Audit log of skill executions for analytics and debugging';

COMMENT ON COLUMN agent_skills.slug IS 'URL-friendly unique identifier (e.g., timeseries-forecasting)';
COMMENT ON COLUMN agent_skills.category IS 'Skill category for filtering and organization';
COMMENT ON COLUMN agent_skills.provider IS 'Who provides this skill (TKG, Polymarket, Factagora, etc.)';
COMMENT ON COLUMN agent_skills.capabilities IS 'JSON object describing what this skill can do';
COMMENT ON COLUMN agent_skills.implementation_type IS 'How the skill is executed (BUILT_IN, EXTERNAL_API, WEBHOOK)';
COMMENT ON COLUMN agent_skills.implementation_config IS 'Configuration for skill execution (API endpoints, timeouts, etc.)';
COMMENT ON COLUMN agent_skills.subscription_requirement IS 'Minimum subscription tier required to use this skill';

COMMENT ON COLUMN agent_skill_assignments.skill_config IS 'Per-agent configuration overrides for this skill';
COMMENT ON COLUMN agent_skill_assignments.usage_count IS 'Number of times this agent has successfully used this skill';

COMMENT ON COLUMN skill_usage_logs.input_data IS 'Input parameters passed to the skill';
COMMENT ON COLUMN skill_usage_logs.output_data IS 'Result returned by the skill';
COMMENT ON COLUMN skill_usage_logs.execution_time_ms IS 'How long the skill took to execute in milliseconds';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  table_count INTEGER;
  skill_count INTEGER;
BEGIN
  -- Check if tables exist
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_name IN ('agent_skills', 'agent_skill_assignments', 'skill_usage_logs');

  -- Check skill count
  SELECT COUNT(*) INTO skill_count
  FROM agent_skills;

  RAISE NOTICE '✓ Tables created: % (expected: 3)', table_count;
  RAISE NOTICE '✓ Sample skills inserted: % (expected: 5)', skill_count;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
