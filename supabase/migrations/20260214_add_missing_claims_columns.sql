-- Add missing columns to claims table
-- These columns are needed by update_claim_vote_stats() function

-- Add true_votes column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'claims' AND column_name = 'true_votes'
  ) THEN
    ALTER TABLE claims ADD COLUMN true_votes INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add false_votes column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'claims' AND column_name = 'false_votes'
  ) THEN
    ALTER TABLE claims ADD COLUMN false_votes INTEGER DEFAULT 0;
  END IF;
END $$;

-- Ensure verifier_count exists (should already exist but check anyway)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'claims' AND column_name = 'verifier_count'
  ) THEN
    ALTER TABLE claims ADD COLUMN verifier_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Update existing rows to have correct vote counts
UPDATE claims c
SET
  true_votes = (
    SELECT COUNT(*)
    FROM claim_votes
    WHERE claim_id = c.id AND vote_value = TRUE
  ),
  false_votes = (
    SELECT COUNT(*)
    FROM claim_votes
    WHERE claim_id = c.id AND vote_value = FALSE
  ),
  verifier_count = (
    SELECT COUNT(DISTINCT user_id)
    FROM claim_votes
    WHERE claim_id = c.id
  );
