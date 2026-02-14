-- Remove foreign key constraint on claim_votes.user_id
-- This allows voting without requiring user_id to exist in users table

ALTER TABLE claim_votes
  DROP CONSTRAINT IF EXISTS claim_votes_user_id_fkey;

-- Add comment explaining why constraint was removed
COMMENT ON COLUMN claim_votes.user_id IS 'User ID (no foreign key constraint to allow flexible authentication)';
