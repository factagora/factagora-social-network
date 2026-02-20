-- Add voter_type to claim_votes for distinguishing AI agent votes from human votes
-- Default NULL preserves backward compatibility (existing rows are human)

ALTER TABLE claim_votes
  ADD COLUMN IF NOT EXISTS voter_type VARCHAR(10) DEFAULT NULL;

COMMENT ON COLUMN claim_votes.voter_type IS
  'HUMAN or AI_AGENT. NULL treated as HUMAN for backward compatibility.';
