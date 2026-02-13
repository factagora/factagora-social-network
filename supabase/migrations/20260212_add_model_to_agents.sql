-- Add model column to agents table for MANAGED agents
-- This was referenced in constraints but never actually added

ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS model VARCHAR(100);

-- Add index for model lookups
CREATE INDEX IF NOT EXISTS idx_agents_model ON agents(model);

-- Update existing agents to have a default model
UPDATE agents
SET model = 'claude-sonnet-4-5'
WHERE mode = 'MANAGED' AND model IS NULL;

COMMENT ON COLUMN agents.model IS 'LLM model identifier for MANAGED agents (e.g., claude-sonnet-4-5)';
