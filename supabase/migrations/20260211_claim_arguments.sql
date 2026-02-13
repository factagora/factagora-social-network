-- ========================================
-- CLAIM ARGUMENTS Table
-- ========================================

CREATE TABLE IF NOT EXISTS claim_arguments (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,

  -- Author
  author_id UUID NOT NULL,
  author_type VARCHAR(20) NOT NULL
    CHECK (author_type IN ('HUMAN', 'AI_AGENT')),

  -- Position (TRUE, FALSE, or UNCERTAIN)
  position VARCHAR(20) NOT NULL
    CHECK (position IN ('TRUE', 'FALSE', 'UNCERTAIN')),

  -- Content
  content TEXT NOT NULL,
  reasoning TEXT,

  -- Evidence (JSONB array)
  evidence JSONB,

  -- Confidence
  confidence DECIMAL(3,2) DEFAULT 0.70
    CHECK (confidence >= 0.00 AND confidence <= 1.00),

  -- Reddit-style voting
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT claim_arguments_content_length
    CHECK (char_length(content) >= 50 AND char_length(content) <= 5000),
  CONSTRAINT claim_arguments_reasoning_length
    CHECK (reasoning IS NULL OR char_length(reasoning) <= 2000)
);

-- ========================================
-- Indexes
-- ========================================
CREATE INDEX idx_claim_arguments_claim_id ON claim_arguments(claim_id);
CREATE INDEX idx_claim_arguments_author_id ON claim_arguments(author_id);
CREATE INDEX idx_claim_arguments_author_type ON claim_arguments(author_type);
CREATE INDEX idx_claim_arguments_position ON claim_arguments(position);
CREATE INDEX idx_claim_arguments_score ON claim_arguments(score DESC);
CREATE INDEX idx_claim_arguments_created_at ON claim_arguments(created_at DESC);

-- ========================================
-- Enable RLS
-- ========================================
ALTER TABLE claim_arguments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view arguments for approved claims
CREATE POLICY "Anyone can view arguments for approved claims"
  ON claim_arguments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.id = claim_arguments.claim_id
        AND claims.approval_status = 'APPROVED'
    )
  );

-- Policy: Authenticated users can create arguments
CREATE POLICY "Authenticated users can create arguments"
  ON claim_arguments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Policy: Authors can update their own arguments
CREATE POLICY "Authors can update their own arguments"
  ON claim_arguments FOR UPDATE
  USING (auth.uid() = author_id);

-- Policy: Authors can delete their own arguments
CREATE POLICY "Authors can delete their own arguments"
  ON claim_arguments FOR DELETE
  USING (auth.uid() = author_id);

-- ========================================
-- Update timestamp trigger
-- ========================================
CREATE OR REPLACE FUNCTION update_claim_arguments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_claim_arguments_updated_at
  BEFORE UPDATE ON claim_arguments
  FOR EACH ROW
  EXECUTE FUNCTION update_claim_arguments_updated_at();

-- ========================================
-- Trigger to update claim argument count
-- ========================================
CREATE OR REPLACE FUNCTION update_claim_argument_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE claims
  SET
    argument_count = (
      SELECT COUNT(*)
      FROM claim_arguments
      WHERE claim_id = COALESCE(NEW.claim_id, OLD.claim_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.claim_id, OLD.claim_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_claim_argument_count
  AFTER INSERT OR DELETE ON claim_arguments
  FOR EACH ROW
  EXECUTE FUNCTION update_claim_argument_count();

-- ========================================
-- CLAIM ARGUMENT VOTES Table (Upvote/Downvote)
-- ========================================
CREATE TABLE IF NOT EXISTS claim_argument_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  argument_id UUID NOT NULL REFERENCES claim_arguments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('UP', 'DOWN')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(argument_id, user_id)
);

CREATE INDEX idx_claim_argument_votes_argument_id ON claim_argument_votes(argument_id);
CREATE INDEX idx_claim_argument_votes_user_id ON claim_argument_votes(user_id);

ALTER TABLE claim_argument_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view argument votes"
  ON claim_argument_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote on arguments"
  ON claim_argument_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own argument votes"
  ON claim_argument_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own argument votes"
  ON claim_argument_votes FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- Trigger to update argument vote counts
-- ========================================
CREATE OR REPLACE FUNCTION update_claim_argument_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE claim_arguments
  SET
    upvotes = (
      SELECT COUNT(*)
      FROM claim_argument_votes
      WHERE argument_id = COALESCE(NEW.argument_id, OLD.argument_id)
        AND vote_type = 'UP'
    ),
    downvotes = (
      SELECT COUNT(*)
      FROM claim_argument_votes
      WHERE argument_id = COALESCE(NEW.argument_id, OLD.argument_id)
        AND vote_type = 'DOWN'
    )
  WHERE id = COALESCE(NEW.argument_id, OLD.argument_id);

  -- Update score
  UPDATE claim_arguments
  SET score = upvotes - downvotes
  WHERE id = COALESCE(NEW.argument_id, OLD.argument_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_claim_argument_vote_count
  AFTER INSERT OR UPDATE OR DELETE ON claim_argument_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_claim_argument_vote_count();

-- ========================================
-- CLAIM ARGUMENT REPLIES Table
-- ========================================
CREATE TABLE IF NOT EXISTS claim_argument_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  argument_id UUID NOT NULL REFERENCES claim_arguments(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES claim_argument_replies(id) ON DELETE CASCADE,

  author_id UUID NOT NULL,
  author_type VARCHAR(20) NOT NULL CHECK (author_type IN ('HUMAN', 'AI_AGENT')),

  content TEXT NOT NULL,
  reply_type VARCHAR(20) NOT NULL
    CHECK (reply_type IN ('SUPPORT', 'COUNTER', 'QUESTION', 'CLARIFY')),

  evidence JSONB,

  -- Reddit-style voting
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT claim_argument_replies_content_length
    CHECK (char_length(content) >= 10 AND char_length(content) <= 2000)
);

CREATE INDEX idx_claim_arg_replies_argument_id ON claim_argument_replies(argument_id);
CREATE INDEX idx_claim_arg_replies_parent_id ON claim_argument_replies(parent_reply_id);
CREATE INDEX idx_claim_arg_replies_author_id ON claim_argument_replies(author_id);
CREATE INDEX idx_claim_arg_replies_created_at ON claim_argument_replies(created_at DESC);

ALTER TABLE claim_argument_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view replies"
  ON claim_argument_replies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create replies"
  ON claim_argument_replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- ========================================
-- Comments
-- ========================================
COMMENT ON TABLE claim_arguments IS 'Arguments for/against claims with evidence';
COMMENT ON COLUMN claim_arguments.position IS 'TRUE (supports claim), FALSE (refutes claim), or UNCERTAIN';
COMMENT ON COLUMN claim_arguments.evidence IS 'JSONB array of evidence items';
COMMENT ON COLUMN claim_arguments.score IS 'Reddit-style score (upvotes - downvotes)';
