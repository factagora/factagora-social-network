-- Add verdict column to claims table for simplified resolution
-- This provides a simpler, more user-friendly field than verification_status

-- Add verdict column
ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS verdict VARCHAR(20)
  CHECK (verdict IN ('TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNVERIFIABLE'));

-- Create index for verdict filtering
CREATE INDEX IF NOT EXISTS idx_claims_verdict ON claims(verdict);

-- Comment
COMMENT ON COLUMN claims.verdict IS 'Simplified verdict for V1: TRUE, FALSE, PARTIALLY_TRUE, UNVERIFIABLE';
