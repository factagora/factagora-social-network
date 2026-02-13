-- ========================================
-- CLAIM EVIDENCE Table
-- ========================================

CREATE TABLE IF NOT EXISTS claim_evidence (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,

  -- Evidence Information
  source_type VARCHAR(50) NOT NULL
    CHECK (source_type IN (
      'OFFICIAL_DOCUMENT',    -- Government, SEC filings
      'NEWS_ARTICLE',         -- News media
      'RESEARCH_PAPER',       -- Academic papers
      'STATISTICS',           -- Statistical data
      'VIDEO',                -- Video evidence
      'SOCIAL_MEDIA',         -- Social media posts
      'EXPERT_TESTIMONY',     -- Expert statements
      'OTHER'
    )),

  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,

  -- Credibility
  credibility_score DECIMAL(3,2),              -- 0.00 - 1.00
  publisher TEXT,                               -- Publishing organization
  published_date TIMESTAMPTZ,

  -- Submission Info
  submitted_by UUID NOT NULL,
  submission_type VARCHAR(20) DEFAULT 'HUMAN'
    CHECK (submission_type IN ('HUMAN', 'AI_AGENT')),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Community Voting
  helpful_votes INTEGER DEFAULT 0,
  unhelpful_votes INTEGER DEFAULT 0,

  -- Constraints
  CONSTRAINT claim_evidence_url_format
    CHECK (url ~* '^https?://'),
  CONSTRAINT claim_evidence_title_length
    CHECK (char_length(title) >= 5 AND char_length(title) <= 200)
);

-- ========================================
-- Indexes
-- ========================================
CREATE INDEX idx_claim_evidence_claim_id ON claim_evidence(claim_id);
CREATE INDEX idx_claim_evidence_source_type ON claim_evidence(source_type);
CREATE INDEX idx_claim_evidence_submitted_by ON claim_evidence(submitted_by);
CREATE INDEX idx_claim_evidence_created_at ON claim_evidence(created_at DESC);

-- ========================================
-- Enable RLS
-- ========================================
ALTER TABLE claim_evidence ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view evidence for approved claims
CREATE POLICY "Anyone can view evidence for approved claims"
  ON claim_evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.id = claim_evidence.claim_id
        AND claims.approval_status = 'APPROVED'
    )
  );

-- Policy: Authenticated users can submit evidence
CREATE POLICY "Authenticated users can submit evidence"
  ON claim_evidence FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

-- ========================================
-- Trigger to update claim stats
-- ========================================
CREATE OR REPLACE FUNCTION update_claim_evidence_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update evidence count in claims table
  UPDATE claims
  SET
    evidence_count = (
      SELECT COUNT(*)
      FROM claim_evidence
      WHERE claim_id = COALESCE(NEW.claim_id, OLD.claim_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.claim_id, OLD.claim_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_claim_evidence_count
  AFTER INSERT OR DELETE ON claim_evidence
  FOR EACH ROW
  EXECUTE FUNCTION update_claim_evidence_count();

-- ========================================
-- Evidence Voting Table
-- ========================================
CREATE TABLE IF NOT EXISTS claim_evidence_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID NOT NULL REFERENCES claim_evidence(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('HELPFUL', 'UNHELPFUL')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(evidence_id, user_id)
);

CREATE INDEX idx_evidence_votes_evidence_id ON claim_evidence_votes(evidence_id);
CREATE INDEX idx_evidence_votes_user_id ON claim_evidence_votes(user_id);

ALTER TABLE claim_evidence_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view evidence votes"
  ON claim_evidence_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote on evidence"
  ON claim_evidence_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own evidence votes"
  ON claim_evidence_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own evidence votes"
  ON claim_evidence_votes FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- Trigger to update evidence vote counts
-- ========================================
CREATE OR REPLACE FUNCTION update_evidence_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE claim_evidence
  SET
    helpful_votes = (
      SELECT COUNT(*)
      FROM claim_evidence_votes
      WHERE evidence_id = COALESCE(NEW.evidence_id, OLD.evidence_id)
        AND vote_type = 'HELPFUL'
    ),
    unhelpful_votes = (
      SELECT COUNT(*)
      FROM claim_evidence_votes
      WHERE evidence_id = COALESCE(NEW.evidence_id, OLD.evidence_id)
        AND vote_type = 'UNHELPFUL'
    )
  WHERE id = COALESCE(NEW.evidence_id, OLD.evidence_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_evidence_vote_count
  AFTER INSERT OR UPDATE OR DELETE ON claim_evidence_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_evidence_vote_count();

-- ========================================
-- Comments
-- ========================================
COMMENT ON TABLE claim_evidence IS 'Supporting evidence for claims';
COMMENT ON COLUMN claim_evidence.credibility_score IS 'Auto-calculated credibility (0.00-1.00)';
COMMENT ON COLUMN claim_evidence.helpful_votes IS 'Number of users who found this evidence helpful';
