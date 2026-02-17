-- Add evidence_gathered column to agent_react_cycles table
-- This column was missing from the initial migration

ALTER TABLE agent_react_cycles
ADD COLUMN IF NOT EXISTS evidence_gathered JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN agent_react_cycles.evidence_gathered IS 'Evidence gathered during Stage 2 (Action)';
