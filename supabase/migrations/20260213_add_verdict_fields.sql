-- Add verdict and fact-checking specific fields to claims table
-- Migration: 20260213_add_verdict_fields.sql
-- Purpose: Transform claims table for proper fact-checking

-- Add verdict field with enum constraint
ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS verdict VARCHAR(20)
    CHECK (verdict IN ('TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNVERIFIED', 'MISLEADING'));

-- Add fact-checking metadata
ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS claimed_by TEXT,
  ADD COLUMN IF NOT EXISTS claim_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verdict_summary TEXT,
  ADD COLUMN IF NOT EXISTS verdict_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source_credibility INTEGER DEFAULT 50
    CHECK (source_credibility >= 0 AND source_credibility <= 100);

-- Make resolution_date nullable (not all claims need future resolution)
ALTER TABLE claims
  ALTER COLUMN resolution_date DROP NOT NULL;

-- Add indexes for verdict filtering and sorting
CREATE INDEX IF NOT EXISTS idx_claims_verdict ON claims(verdict);
CREATE INDEX IF NOT EXISTS idx_claims_claim_date ON claims(claim_date DESC);
CREATE INDEX IF NOT EXISTS idx_claims_source_credibility ON claims(source_credibility DESC);

-- Update existing claims to have default verdict
UPDATE claims
SET verdict = 'UNVERIFIED'
WHERE verdict IS NULL;

-- Add comment explaining the verdict system
COMMENT ON COLUMN claims.verdict IS 'Fact-check verdict: TRUE/FALSE/PARTIALLY_TRUE/UNVERIFIED/MISLEADING';
COMMENT ON COLUMN claims.claimed_by IS 'Person or organization who made the original claim';
COMMENT ON COLUMN claims.claim_date IS 'Date when the claim was originally made';
COMMENT ON COLUMN claims.verdict_summary IS 'Short explanation of the verdict (max 500 chars)';
COMMENT ON COLUMN claims.verdict_date IS 'Date when the verdict was reached';
COMMENT ON COLUMN claims.source_credibility IS 'Credibility score of the claim source (0-100)';
