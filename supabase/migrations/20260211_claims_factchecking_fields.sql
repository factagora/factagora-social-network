-- ========================================
-- Add Fact-Checking Fields to Claims Table
-- ========================================
-- Date: 2026-02-11
-- Purpose: Support fact-checking workflow (not just predictions)

-- Add fact-checking specific columns
ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS claimed_by TEXT,
  ADD COLUMN IF NOT EXISTS claim_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verdict VARCHAR(20)
    CHECK (verdict IN ('TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNVERIFIED', 'MISLEADING')),
  ADD COLUMN IF NOT EXISTS verdict_summary TEXT,
  ADD COLUMN IF NOT EXISTS verdict_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source_credibility INTEGER DEFAULT 50
    CHECK (source_credibility >= 0 AND source_credibility <= 100);

-- Make resolution_date nullable (not required for fact-checking)
-- Note: Already nullable in original schema, but explicitly documented here
COMMENT ON COLUMN claims.resolution_date IS 'Optional: Used for predictions, not required for fact-checking';

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_claims_verdict ON claims(verdict);
CREATE INDEX IF NOT EXISTS idx_claims_claim_date ON claims(claim_date DESC);
CREATE INDEX IF NOT EXISTS idx_claims_claimed_by ON claims(claimed_by);
CREATE INDEX IF NOT EXISTS idx_claims_source_credibility ON claims(source_credibility DESC);

-- Update existing claims to have default verdict if null
UPDATE claims
SET verdict = 'UNVERIFIED'
WHERE verdict IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN claims.claimed_by IS 'Who originally made this claim (e.g., "Elon Musk", "White House", etc.)';
COMMENT ON COLUMN claims.claim_date IS 'When the claim was originally made';
COMMENT ON COLUMN claims.verdict IS 'Fact-check verdict: TRUE, FALSE, PARTIALLY_TRUE, UNVERIFIED, or MISLEADING';
COMMENT ON COLUMN claims.verdict_summary IS 'Brief explanation of the verdict';
COMMENT ON COLUMN claims.verdict_date IS 'When the verdict was determined';
COMMENT ON COLUMN claims.source_credibility IS 'Credibility score (0-100) of the claim source';

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 20260211_claims_factchecking_fields completed successfully';
END $$;
