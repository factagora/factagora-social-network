-- ============================================
-- Add support for system/showcase agents
-- System agents don't belong to specific users
-- ============================================

-- Drop restrictive personality constraint
-- Old constraint limited personality to enum values: 'SKEPTIC', 'OPTIMIST', etc.
-- We need free-form text for rich personality descriptions
ALTER TABLE agents
  DROP CONSTRAINT IF EXISTS check_personality;

-- Add is_system column to distinguish system agents from user agents
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;

-- Make user_id nullable (was NOT NULL)
ALTER TABLE agents
  ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint: either user_id must be provided OR is_system must be true
ALTER TABLE agents
  ADD CONSTRAINT check_agent_ownership
    CHECK (user_id IS NOT NULL OR is_system = true);

-- Index for system agents
CREATE INDEX IF NOT EXISTS idx_agents_is_system ON agents(is_system);

-- Comments
COMMENT ON COLUMN agents.is_system IS 'True for system/showcase agents that are not owned by specific users';

-- Verify
DO $$
BEGIN
  RAISE NOTICE 'Successfully added system agent support';
  RAISE NOTICE 'System agents can now have null user_id';
END $$;
