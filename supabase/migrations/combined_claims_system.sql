-- ========================================
-- COMBINED MIGRATIONS FOR CLAIMS SYSTEM
-- Run this in Supabase SQL Editor
-- ========================================

-- Migration 1: User Tiers
-- ========================================
-- User Tiers & Permissions System
-- ========================================

-- Add tier column to users table
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'FREE'
  CHECK (tier IN ('FREE', 'PREMIUM', 'ADMIN'));

-- Add agenda creation tracking
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS agenda_creation_count INTEGER DEFAULT 0;

ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS agenda_creation_reset_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_tier ON auth.users(tier);

-- ========================================
-- Monthly Creation Limit Check Function
-- ========================================
CREATE OR REPLACE FUNCTION check_agenda_creation_limit(
  p_user_id UUID,
  p_user_tier VARCHAR(20)
)
RETURNS TABLE(
  allowed BOOLEAN,
  requires_approval BOOLEAN,
  remaining INTEGER,
  reset_date TIMESTAMPTZ
) AS $$
DECLARE
  v_count INTEGER;
  v_reset_date TIMESTAMPTZ;
  v_month_start TIMESTAMPTZ;
BEGIN
  -- PREMIUM and ADMIN have unlimited creation
  IF p_user_tier IN ('PREMIUM', 'ADMIN') THEN
    RETURN QUERY SELECT
      TRUE as allowed,
      FALSE as requires_approval,
      999 as remaining,
      NULL::TIMESTAMPTZ as reset_date;
    RETURN;
  END IF;

  -- Get current user stats
  SELECT agenda_creation_count, agenda_creation_reset_at
  INTO v_count, v_reset_date
  FROM auth.users
  WHERE id = p_user_id;

  -- Calculate month start
  v_month_start := date_trunc('month', NOW());

  -- Reset if month has changed
  IF v_reset_date < v_month_start THEN
    UPDATE auth.users
    SET
      agenda_creation_count = 0,
      agenda_creation_reset_at = NOW()
    WHERE id = p_user_id;

    v_count := 0;
  END IF;

  -- FREE users: 3 per month + requires approval
  RETURN QUERY SELECT
    (v_count < 3) as allowed,
    TRUE as requires_approval,
    GREATEST(3 - v_count, 0) as remaining,
    (v_month_start + INTERVAL '1 month') as reset_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- Increment Creation Count Function
-- ========================================
CREATE OR REPLACE FUNCTION increment_agenda_creation_count(
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE auth.users
  SET agenda_creation_count = agenda_creation_count + 1
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- Grant permissions
-- ========================================
GRANT EXECUTE ON FUNCTION check_agenda_creation_limit(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_agenda_creation_count(UUID) TO authenticated;

-- ========================================
-- Migration 2: Claims Table
-- ========================================

-- ========================================
-- CLAIMS Table (Fact-Checking Agendas)
-- ========================================

CREATE TABLE IF NOT EXISTS claims (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50),

  -- Claim-specific fields
  claim_date TIMESTAMPTZ,                    -- The date the claim refers to
  claim_type VARCHAR(20) DEFAULT 'FACTUAL'
    CHECK (claim_type IN ('FACTUAL', 'STATISTICAL', 'QUOTE', 'EVENT')),

  source_url TEXT,                            -- Original source URL
  source_title TEXT,                          -- Source title/description

  -- Approval Status (for FREE users)
  approval_status VARCHAR(20) DEFAULT 'PENDING'
    CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Verification Status
  verification_status VARCHAR(20) DEFAULT 'PENDING'
    CHECK (verification_status IN (
      'PENDING',           -- Awaiting verification
      'VERIFIED_TRUE',     -- Confirmed as true
      'VERIFIED_FALSE',    -- Confirmed as false
      'PARTIALLY_TRUE',    -- Partially true
      'MISLEADING',        -- Misleading
      'UNVERIFIABLE'       -- Cannot be verified
    )),

  -- Credibility Score (0.00 - 1.00)
  verification_confidence DECIMAL(3,2) DEFAULT 0.50,

  -- Resolution (by creator at resolution_date)
  resolution_date TIMESTAMPTZ,                -- When can be resolved
  resolution_value BOOLEAN,                   -- TRUE or FALSE
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,

  -- Statistics
  verifier_count INTEGER DEFAULT 0,
  evidence_count INTEGER DEFAULT 0,
  argument_count INTEGER DEFAULT 0,

  -- Voting stats
  true_votes INTEGER DEFAULT 0,
  false_votes INTEGER DEFAULT 0,

  -- Creator
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT claims_title_length
    CHECK (char_length(title) >= 10 AND char_length(title) <= 500),
  CONSTRAINT claims_resolution_date_future
    CHECK (resolution_date > created_at)
);

-- ========================================
-- Indexes for Performance
-- ========================================
CREATE INDEX idx_claims_category ON claims(category);
CREATE INDEX idx_claims_approval_status ON claims(approval_status);
CREATE INDEX idx_claims_verification_status ON claims(verification_status);
CREATE INDEX idx_claims_created_at ON claims(created_at DESC);
CREATE INDEX idx_claims_created_by ON claims(created_by);
CREATE INDEX idx_claims_resolution_date ON claims(resolution_date);

-- ========================================
-- Enable Row Level Security
-- ========================================
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view APPROVED claims
CREATE POLICY "Anyone can view approved claims"
  ON claims FOR SELECT
  USING (approval_status = 'APPROVED');

-- Policy: Creators can view their own claims (even if pending)
CREATE POLICY "Creators can view their own claims"
  ON claims FOR SELECT
  USING (auth.uid() = created_by);

-- Policy: Authenticated users can create claims
CREATE POLICY "Authenticated users can create claims"
  ON claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Policy: Creators can update their own claims (before approval)
CREATE POLICY "Creators can update their own claims"
  ON claims FOR UPDATE
  USING (auth.uid() = created_by AND approval_status = 'PENDING');

-- Policy: Creators can delete their own claims (before approval)
CREATE POLICY "Creators can delete their own claims"
  ON claims FOR DELETE
  USING (auth.uid() = created_by AND approval_status = 'PENDING');

-- ========================================
-- Update timestamp trigger
-- ========================================
CREATE OR REPLACE FUNCTION update_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_claims_updated_at();

-- ========================================
-- Comments
-- ========================================
COMMENT ON TABLE claims IS 'Fact-checking agendas for past/present events';
COMMENT ON COLUMN claims.claim_date IS 'The date/time the claim refers to';
COMMENT ON COLUMN claims.resolution_date IS 'Date when creator can resolve the claim';
COMMENT ON COLUMN claims.resolution_value IS 'Final verdict: TRUE or FALSE';
COMMENT ON COLUMN claims.verification_confidence IS 'Credibility score (0.00-1.00)';

-- ========================================
-- Migration 3: Claim Evidence
-- ========================================

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

-- ========================================
-- Migration 4: Claim Votes
-- ========================================

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

-- ========================================
-- Migration 5: Claim Arguments
-- ========================================

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

-- ========================================
-- Migration 6: Predictions Update
-- ========================================

-- ========================================
-- Update PREDICTIONS Table for Unified System
-- ========================================

-- Add approval status (for FREE users)
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'APPROVED'
  CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED'));

ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS approved_by UUID;

ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add resolved_by (who resolved the prediction)
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS resolved_by UUID;

-- Add creator tracking
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_predictions_approval_status ON predictions(approval_status);
CREATE INDEX IF NOT EXISTS idx_predictions_created_by ON predictions(created_by);

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can view predictions" ON predictions;

CREATE POLICY "Anyone can view approved predictions"
  ON predictions FOR SELECT
  USING (approval_status = 'APPROVED');

CREATE POLICY "Creators can view their own predictions"
  ON predictions FOR SELECT
  USING (auth.uid() = created_by);

-- ========================================
-- Comments
-- ========================================
COMMENT ON COLUMN predictions.approval_status IS 'PENDING (FREE users) or APPROVED (PREMIUM)';
COMMENT ON COLUMN predictions.resolved_by IS 'User who resolved the prediction';
COMMENT ON COLUMN predictions.created_by IS 'User who created the prediction';
