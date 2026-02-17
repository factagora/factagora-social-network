-- Add execution_time_ms column to agent_react_cycles
-- This column was present in the original schema but missing from 20260213_react_cycle_storage.sql

ALTER TABLE agent_react_cycles
ADD COLUMN IF NOT EXISTS execution_time_ms INTEGER;

-- Add constraint
ALTER TABLE agent_react_cycles
ADD CONSTRAINT check_execution_time_positive
CHECK (execution_time_ms IS NULL OR execution_time_ms > 0);

-- Add comment
COMMENT ON COLUMN agent_react_cycles.execution_time_ms IS 'Agent response time in milliseconds for performance tracking';
