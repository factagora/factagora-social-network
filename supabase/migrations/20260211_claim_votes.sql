-- ========================================
-- CLAIM VOTES Table (TRUE/FALSE Voting)
-- ========================================

CREATE TABLE IF NOT EXISTS claim_votes (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,

  -- Voter
  user_id UUID NOT NULL,

  -- Vote (TRUE or FALSE)
  vote_value BOOLEAN NOT NULL,

  -- Confidence (0.00 - 1.00)
  confidence DECIMAL(3,2) DEFAULT 0.70
    CHECK (confidence >= 0.00 AND confidence <= 1.00),

  -- Reasoning
  reasoning TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one vote per user per claim
  UNIQUE(claim_id, user_id),

  -- Constraints
  CONSTRAINT claim_votes_reasoning_length
    CHECK (reasoning IS NULL OR char_length(reasoning) <= 1000)
);

-- ========================================
-- Indexes
-- ========================================
CREATE INDEX idx_claim_votes_claim_id ON claim_votes(claim_id);
CREATE INDEX idx_claim_votes_user_id ON claim_votes(user_id);
CREATE INDEX idx_claim_votes_vote_value ON claim_votes(vote_value);
CREATE INDEX idx_claim_votes_created_at ON claim_votes(created_at DESC);

-- ========================================
-- Enable RLS
-- ========================================
ALTER TABLE claim_votes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view votes for approved claims
CREATE POLICY "Anyone can view votes for approved claims"
  ON claim_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.id = claim_votes.claim_id
        AND claims.approval_status = 'APPROVED'
    )
  );

-- Policy: Authenticated users can vote
CREATE POLICY "Authenticated users can vote"
  ON claim_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own votes
CREATE POLICY "Users can update their own votes"
  ON claim_votes FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own votes
CREATE POLICY "Users can delete their own votes"
  ON claim_votes FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- Update timestamp trigger
-- ========================================
CREATE OR REPLACE FUNCTION update_claim_votes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_claim_votes_updated_at
  BEFORE UPDATE ON claim_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_claim_votes_updated_at();

-- ========================================
-- Trigger to update claim vote stats
-- ========================================
CREATE OR REPLACE FUNCTION update_claim_vote_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update vote counts and verifier count in claims table
  UPDATE claims
  SET
    true_votes = (
      SELECT COUNT(*)
      FROM claim_votes
      WHERE claim_id = COALESCE(NEW.claim_id, OLD.claim_id)
        AND vote_value = TRUE
    ),
    false_votes = (
      SELECT COUNT(*)
      FROM claim_votes
      WHERE claim_id = COALESCE(NEW.claim_id, OLD.claim_id)
        AND vote_value = FALSE
    ),
    verifier_count = (
      SELECT COUNT(DISTINCT user_id)
      FROM claim_votes
      WHERE claim_id = COALESCE(NEW.claim_id, OLD.claim_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.claim_id, OLD.claim_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_claim_vote_stats
  AFTER INSERT OR UPDATE OR DELETE ON claim_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_claim_vote_stats();

-- ========================================
-- Comments
-- ========================================
COMMENT ON TABLE claim_votes IS 'TRUE/FALSE votes on claims';
COMMENT ON COLUMN claim_votes.vote_value IS 'TRUE or FALSE - user''s verdict on the claim';
COMMENT ON COLUMN claim_votes.confidence IS 'User confidence in their vote (0.00-1.00)';
COMMENT ON COLUMN claim_votes.reasoning IS 'Optional explanation for the vote';
