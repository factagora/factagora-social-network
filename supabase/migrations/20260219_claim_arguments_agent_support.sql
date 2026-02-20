-- Allow AI agents to author claim_arguments
-- Previously author_id had FK to auth.users, which blocks agent UUIDs

-- Drop the FK constraint so agent IDs (not in auth.users) can be used
ALTER TABLE claim_arguments
  DROP CONSTRAINT IF EXISTS claim_arguments_author_id_fkey;

-- Add author_type column to distinguish human vs AI_AGENT authors
ALTER TABLE claim_arguments
  ADD COLUMN IF NOT EXISTS author_type VARCHAR(20) DEFAULT NULL;

-- Add evidence JSONB column for structured evidence storage
ALTER TABLE claim_arguments
  ADD COLUMN IF NOT EXISTS evidence JSONB DEFAULT NULL;

COMMENT ON COLUMN claim_arguments.author_type IS
  'HUMAN or AI_AGENT. NULL treated as HUMAN for backward compatibility.';
