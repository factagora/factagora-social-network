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
