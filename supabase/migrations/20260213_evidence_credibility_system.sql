-- Evidence Credibility System Migration
-- Migration: 20260213_evidence_credibility_system.sql
-- Purpose: Add evidence credibility scoring, source reputation, and fact-checker tracking

-- ============================================================================
-- 1. SOURCE REPUTATION TABLE
-- ============================================================================
-- Track reputation and credibility of different sources (domains, organizations, etc.)
CREATE TABLE IF NOT EXISTS source_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source identification
  domain TEXT NOT NULL UNIQUE, -- e.g., "nytimes.com", "arxiv.org"
  source_name TEXT, -- Display name e.g., "The New York Times"
  source_type TEXT CHECK (source_type IN (
    'NEWS_OUTLET',
    'ACADEMIC',
    'GOVERNMENT',
    'FACT_CHECKER',
    'SOCIAL_MEDIA',
    'BLOG',
    'OTHER'
  )),

  -- Credibility metrics
  credibility_score INTEGER DEFAULT 50 CHECK (credibility_score >= 0 AND credibility_score <= 100),
  verification_count INTEGER DEFAULT 0, -- How many times this source was verified
  accuracy_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage of accurate claims from this source

  -- Metadata
  bias_rating TEXT CHECK (bias_rating IN ('LEFT', 'CENTER_LEFT', 'CENTER', 'CENTER_RIGHT', 'RIGHT', 'UNKNOWN')),
  fact_check_rating TEXT, -- e.g., "High", "Medium", "Low" from external fact-checkers
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ
);

-- Indexes for source reputation
CREATE INDEX IF NOT EXISTS idx_source_reputation_domain ON source_reputation(domain);
CREATE INDEX IF NOT EXISTS idx_source_reputation_credibility ON source_reputation(credibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_source_reputation_type ON source_reputation(source_type);

-- ============================================================================
-- 2. ENHANCE CLAIM EVIDENCE TABLE
-- ============================================================================
-- Add credibility scoring fields to existing claim_evidence table
ALTER TABLE claim_evidence
  ADD COLUMN IF NOT EXISTS credibility_score INTEGER DEFAULT 50
    CHECK (credibility_score >= 0 AND credibility_score <= 100),
  ADD COLUMN IF NOT EXISTS source_domain TEXT,
  ADD COLUMN IF NOT EXISTS source_reputation_id UUID REFERENCES source_reputation(id),
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Indexes for evidence credibility
CREATE INDEX IF NOT EXISTS idx_evidence_credibility ON claim_evidence(credibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_source ON claim_evidence(source_domain);

-- ============================================================================
-- 3. FACT-CHECKER REPUTATION TABLE
-- ============================================================================
-- Track reputation and accuracy of fact-checkers (users who verify claims)
CREATE TABLE IF NOT EXISTS fact_checker_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User reference
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Reputation metrics
  reputation_score INTEGER DEFAULT 50 CHECK (reputation_score >= 0 AND reputation_score <= 100),
  total_verifications INTEGER DEFAULT 0,
  accurate_verifications INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,2) DEFAULT 0.00,

  -- Expertise areas
  expertise_areas TEXT[], -- e.g., ['politics', 'science', 'technology']
  verified_claims_count INTEGER DEFAULT 0,

  -- Streak tracking
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_verification_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Indexes for fact-checker reputation
CREATE INDEX IF NOT EXISTS idx_fact_checker_user ON fact_checker_reputation(user_id);
CREATE INDEX IF NOT EXISTS idx_fact_checker_reputation ON fact_checker_reputation(reputation_score DESC);
CREATE INDEX IF NOT EXISTS idx_fact_checker_accuracy ON fact_checker_reputation(accuracy_rate DESC);

-- ============================================================================
-- 4. CONSENSUS TRACKING TABLE
-- ============================================================================
-- Track consensus state for claims based on votes and evidence
CREATE TABLE IF NOT EXISTS claim_consensus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,

  -- Consensus metrics
  true_votes INTEGER DEFAULT 0,
  false_votes INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  true_percentage DECIMAL(5,2) DEFAULT 0.00,

  -- Evidence-weighted consensus
  evidence_weighted_score DECIMAL(5,2) DEFAULT 0.00, -- -100 (FALSE) to +100 (TRUE)
  high_credibility_evidence_count INTEGER DEFAULT 0,
  low_credibility_evidence_count INTEGER DEFAULT 0,

  -- Consensus state
  consensus_reached BOOLEAN DEFAULT FALSE,
  consensus_threshold DECIMAL(5,2) DEFAULT 70.00, -- % needed for consensus
  confidence_level TEXT CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW', 'NONE')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(claim_id)
);

-- Indexes for consensus
CREATE INDEX IF NOT EXISTS idx_consensus_claim ON claim_consensus(claim_id);
CREATE INDEX IF NOT EXISTS idx_consensus_reached ON claim_consensus(consensus_reached);
CREATE INDEX IF NOT EXISTS idx_consensus_confidence ON claim_consensus(confidence_level);

-- ============================================================================
-- 5. GOOGLE FACT CHECK API CACHE
-- ============================================================================
-- Cache results from Google Fact Check API to avoid repeated API calls
CREATE TABLE IF NOT EXISTS google_factcheck_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Search parameters
  query_text TEXT NOT NULL,
  query_hash TEXT NOT NULL UNIQUE, -- Hash of normalized query for deduplication

  -- API response
  fact_check_results JSONB, -- Store full API response
  claims_found INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'), -- Cache for 7 days
  last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Google Fact Check cache
CREATE INDEX IF NOT EXISTS idx_factcheck_query_hash ON google_factcheck_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_factcheck_expires ON google_factcheck_cache(expires_at);

-- ============================================================================
-- 6. AUTOMATIC SOURCE REPUTATION SEEDING
-- ============================================================================
-- Seed with common trusted sources
INSERT INTO source_reputation (domain, source_name, source_type, credibility_score, bias_rating) VALUES
  -- News outlets
  ('apnews.com', 'Associated Press', 'NEWS_OUTLET', 90, 'CENTER'),
  ('reuters.com', 'Reuters', 'NEWS_OUTLET', 90, 'CENTER'),
  ('bbc.com', 'BBC News', 'NEWS_OUTLET', 85, 'CENTER_LEFT'),
  ('nytimes.com', 'The New York Times', 'NEWS_OUTLET', 80, 'CENTER_LEFT'),
  ('wsj.com', 'The Wall Street Journal', 'NEWS_OUTLET', 80, 'CENTER_RIGHT'),

  -- Fact-checkers
  ('snopes.com', 'Snopes', 'FACT_CHECKER', 95, 'CENTER'),
  ('factcheck.org', 'FactCheck.org', 'FACT_CHECKER', 95, 'CENTER'),
  ('politifact.com', 'PolitiFact', 'FACT_CHECKER', 90, 'CENTER'),

  -- Academic
  ('arxiv.org', 'arXiv', 'ACADEMIC', 95, 'CENTER'),
  ('nature.com', 'Nature', 'ACADEMIC', 95, 'CENTER'),
  ('science.org', 'Science Magazine', 'ACADEMIC', 95, 'CENTER'),

  -- Government
  ('cdc.gov', 'CDC', 'GOVERNMENT', 90, 'CENTER'),
  ('nih.gov', 'NIH', 'GOVERNMENT', 90, 'CENTER'),
  ('nasa.gov', 'NASA', 'GOVERNMENT', 90, 'CENTER'),

  -- Social media (low default credibility)
  ('twitter.com', 'Twitter/X', 'SOCIAL_MEDIA', 30, 'UNKNOWN'),
  ('facebook.com', 'Facebook', 'SOCIAL_MEDIA', 30, 'UNKNOWN'),
  ('reddit.com', 'Reddit', 'SOCIAL_MEDIA', 35, 'UNKNOWN')
ON CONFLICT (domain) DO NOTHING;

-- ============================================================================
-- 7. FUNCTIONS FOR CREDIBILITY CALCULATIONS
-- ============================================================================

-- Function to calculate evidence credibility score
CREATE OR REPLACE FUNCTION calculate_evidence_credibility(
  p_evidence_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_base_score INTEGER := 50;
  v_source_score INTEGER;
  v_verification_bonus INTEGER := 0;
  v_final_score INTEGER;
BEGIN
  -- Get source credibility if available
  SELECT
    COALESCE(sr.credibility_score, 50)
  INTO v_source_score
  FROM claim_evidence ce
  LEFT JOIN source_reputation sr ON ce.source_domain = sr.domain
  WHERE ce.id = p_evidence_id;

  -- Add verification bonus if verified by fact-checker
  SELECT
    CASE
      WHEN ce.verified_by IS NOT NULL THEN 20
      ELSE 0
    END
  INTO v_verification_bonus
  FROM claim_evidence ce
  WHERE ce.id = p_evidence_id;

  -- Calculate final score (weighted average)
  v_final_score := LEAST(100, (v_source_score * 0.7 + v_base_score * 0.3)::INTEGER + v_verification_bonus);

  -- Update the evidence record
  UPDATE claim_evidence
  SET credibility_score = v_final_score,
      updated_at = NOW()
  WHERE id = p_evidence_id;

  RETURN v_final_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update consensus for a claim
CREATE OR REPLACE FUNCTION update_claim_consensus(
  p_claim_id UUID
) RETURNS VOID AS $$
DECLARE
  v_true_votes INTEGER;
  v_false_votes INTEGER;
  v_total_votes INTEGER;
  v_true_pct DECIMAL(5,2);
  v_evidence_score DECIMAL(5,2);
  v_confidence TEXT;
BEGIN
  -- Count votes
  SELECT
    COUNT(*) FILTER (WHERE cv.vote = TRUE),
    COUNT(*) FILTER (WHERE cv.vote = FALSE),
    COUNT(*)
  INTO v_true_votes, v_false_votes, v_total_votes
  FROM claim_votes cv
  WHERE cv.claim_id = p_claim_id;

  -- Calculate percentage
  v_true_pct := CASE
    WHEN v_total_votes > 0 THEN (v_true_votes::DECIMAL / v_total_votes * 100)
    ELSE 0
  END;

  -- Calculate evidence-weighted score
  SELECT
    COALESCE(
      AVG(
        CASE
          WHEN ce.supports_claim THEN ce.credibility_score
          ELSE -ce.credibility_score
        END
      ),
      0
    )
  INTO v_evidence_score
  FROM claim_evidence ce
  WHERE ce.claim_id = p_claim_id;

  -- Determine confidence level
  v_confidence := CASE
    WHEN v_total_votes >= 10 AND ABS(v_true_pct - 50) >= 30 THEN 'HIGH'
    WHEN v_total_votes >= 5 AND ABS(v_true_pct - 50) >= 20 THEN 'MEDIUM'
    WHEN v_total_votes >= 2 THEN 'LOW'
    ELSE 'NONE'
  END;

  -- Upsert consensus record
  INSERT INTO claim_consensus (
    claim_id,
    true_votes,
    false_votes,
    total_votes,
    true_percentage,
    evidence_weighted_score,
    consensus_reached,
    confidence_level
  ) VALUES (
    p_claim_id,
    v_true_votes,
    v_false_votes,
    v_total_votes,
    v_true_pct,
    v_evidence_score,
    (v_true_pct >= 70 OR v_true_pct <= 30) AND v_total_votes >= 5,
    v_confidence
  )
  ON CONFLICT (claim_id) DO UPDATE SET
    true_votes = EXCLUDED.true_votes,
    false_votes = EXCLUDED.false_votes,
    total_votes = EXCLUDED.total_votes,
    true_percentage = EXCLUDED.true_percentage,
    evidence_weighted_score = EXCLUDED.evidence_weighted_score,
    consensus_reached = EXCLUDED.consensus_reached,
    confidence_level = EXCLUDED.confidence_level,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Trigger to update consensus when vote is added/changed
CREATE OR REPLACE FUNCTION trigger_update_consensus()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_claim_consensus(NEW.claim_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_vote_change
  AFTER INSERT OR UPDATE ON claim_votes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_consensus();

-- Trigger to calculate evidence credibility on insert/update
CREATE OR REPLACE FUNCTION trigger_calculate_evidence_credibility()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_evidence_credibility(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_evidence_change
  AFTER INSERT OR UPDATE ON claim_evidence
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_evidence_credibility();

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE source_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_checker_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_consensus ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_factcheck_cache ENABLE ROW LEVEL SECURITY;

-- Public read access for source reputation
CREATE POLICY "Public can view source reputation"
  ON source_reputation FOR SELECT
  USING (true);

-- Only admins can modify source reputation
CREATE POLICY "Only admins can modify source reputation"
  ON source_reputation FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Public read access for consensus
CREATE POLICY "Public can view consensus"
  ON claim_consensus FOR SELECT
  USING (true);

-- Users can view their own fact-checker reputation
CREATE POLICY "Users can view fact-checker reputation"
  ON fact_checker_reputation FOR SELECT
  USING (true);

-- Public read access for Google Fact Check cache
CREATE POLICY "Public can view factcheck cache"
  ON google_factcheck_cache FOR SELECT
  USING (true);

-- ============================================================================
-- 10. COMMENTS
-- ============================================================================

COMMENT ON TABLE source_reputation IS 'Track credibility and reputation of evidence sources (domains, organizations)';
COMMENT ON TABLE fact_checker_reputation IS 'Track reputation and accuracy of users who verify claims and evidence';
COMMENT ON TABLE claim_consensus IS 'Track consensus state for claims based on votes and evidence quality';
COMMENT ON TABLE google_factcheck_cache IS 'Cache results from Google Fact Check API to minimize API calls';

COMMENT ON FUNCTION calculate_evidence_credibility IS 'Calculate credibility score for evidence based on source reputation and verification status';
COMMENT ON FUNCTION update_claim_consensus IS 'Update consensus metrics for a claim based on votes and evidence';
