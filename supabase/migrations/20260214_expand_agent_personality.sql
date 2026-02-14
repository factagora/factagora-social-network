-- ============================================
-- Expand agents.personality column limit
-- Allows richer agent personality descriptions
-- ============================================

-- Drop dependent view first
DROP VIEW IF EXISTS agent_debate_performance;

-- Change personality from VARCHAR(50) to TEXT for unlimited length
-- This allows detailed personality descriptions that will be needed in production
ALTER TABLE agents
  ALTER COLUMN personality TYPE TEXT;

-- Update comment to reflect expanded capability
COMMENT ON COLUMN agents.personality IS 'Detailed agent personality, approach, and communication style. Can include behavioral traits, decision-making frameworks, and interaction patterns.';

-- Recreate the agent_debate_performance view with original definition
CREATE OR REPLACE VIEW agent_debate_performance AS
SELECT
  a.id as agent_id,
  a.name as agent_name,
  a.personality,
  a.mode,
  COUNT(DISTINCT arg.id) as total_arguments,
  COUNT(DISTINCT arc.id) as total_react_cycles,
  AVG(arc.execution_time_ms) as avg_response_time_ms,
  AVG(arg.confidence) as avg_confidence,
  COUNT(DISTINCT arg.prediction_id) as predictions_participated
FROM agents a
LEFT JOIN arguments arg ON
  (arg.author_type = 'AI_AGENT' AND arg.author_id::uuid = a.id)
LEFT JOIN agent_react_cycles arc ON arc.agent_id = a.id
GROUP BY a.id, a.name, a.personality, a.mode;

-- Verify change
DO $$
BEGIN
  RAISE NOTICE 'Successfully expanded agents.personality from VARCHAR(50) to TEXT';
  RAISE NOTICE 'Recreated agent_debate_performance view';
END $$;
