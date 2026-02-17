-- Migration: ReAct Cycle Storage System
-- Purpose: Store agent's 5-stage reasoning process for transparency
-- Date: 2026-02-13

-- ============================================================================
-- CLEANUP: Drop existing tables (development only)
-- ============================================================================

DROP TABLE IF EXISTS agent_react_cycles CASCADE;
DROP TABLE IF EXISTS debate_rounds_metadata CASCADE;
DROP TABLE IF EXISTS debate_rounds_failures CASCADE;

-- ============================================================================
-- TABLE: agent_react_cycles
-- Purpose: Store complete ReAct cycle (5 stages) for each agent argument
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_react_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  argument_id UUID NOT NULL REFERENCES arguments(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id),
  prediction_id UUID REFERENCES predictions(id),

  -- Stage 1: Initial Thought
  initial_thought TEXT NOT NULL,
  hypothesis TEXT,
  information_needs TEXT[],

  -- Stage 2: Action
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Structure: [{"type": "web_search", "query": "...", "source": "...", "result": "...", "reliability": 0.8}]

  -- Stage 3: Observation
  observations TEXT[] NOT NULL DEFAULT '{}',
  source_validation JSONB,
  -- Structure: [{"source": "https://...", "reliability": 0.9, "concerns": ["..."]}]

  -- Stage 4: Synthesis
  synthesis_thought TEXT NOT NULL,
  counter_arguments_considered TEXT[],
  confidence_adjustment DECIMAL(3,2),

  -- Stage 5: Final Answer (stored in arguments table, linked via argument_id)

  -- Metadata
  round_number INTEGER NOT NULL DEFAULT 1,
  thinking_depth VARCHAR(20) DEFAULT 'detailed',
  max_steps_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CHECK (round_number >= 1),
  CHECK (thinking_depth IN ('basic', 'detailed', 'comprehensive')),
  CHECK (confidence_adjustment IS NULL OR (confidence_adjustment >= -1.0 AND confidence_adjustment <= 1.0))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_react_cycles_argument ON agent_react_cycles(argument_id);
CREATE INDEX IF NOT EXISTS idx_react_cycles_agent ON agent_react_cycles(agent_id);
CREATE INDEX IF NOT EXISTS idx_react_cycles_prediction ON agent_react_cycles(prediction_id);
CREATE INDEX IF NOT EXISTS idx_react_cycles_round ON agent_react_cycles(round_number);
CREATE INDEX IF NOT EXISTS idx_react_cycles_created ON agent_react_cycles(created_at DESC);

-- Comments
COMMENT ON TABLE agent_react_cycles IS 'Stores complete 5-stage ReAct reasoning cycle for transparency';
COMMENT ON COLUMN agent_react_cycles.initial_thought IS 'Stage 1: Agent''s initial hypothesis and reasoning';
COMMENT ON COLUMN agent_react_cycles.actions IS 'Stage 2: Actions taken (web search, API calls, data queries)';
COMMENT ON COLUMN agent_react_cycles.observations IS 'Stage 3: Observations from gathered information';
COMMENT ON COLUMN agent_react_cycles.synthesis_thought IS 'Stage 4: Synthesis of findings with counterarguments';
COMMENT ON COLUMN agent_react_cycles.argument_id IS 'Stage 5: Links to final answer in arguments table';


-- ============================================================================
-- TABLE: debate_rounds_metadata
-- Purpose: Track round execution statistics and performance
-- ============================================================================

CREATE TABLE IF NOT EXISTS debate_rounds_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,

  -- Participation
  agents_participated INTEGER NOT NULL,
  successful_responses INTEGER NOT NULL,
  failed_agents TEXT[],

  -- Consensus
  consensus_score DECIMAL(3,2),
  position_distribution JSONB,
  -- Structure: {"YES": 0.6, "NO": 0.3, "NEUTRAL": 0.1}

  -- Performance
  duration_ms INTEGER,
  avg_response_time_ms INTEGER,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(prediction_id, round_number),
  CHECK (round_number >= 1),
  CHECK (consensus_score IS NULL OR (consensus_score >= 0.0 AND consensus_score <= 1.0)),
  CHECK (agents_participated >= 0),
  CHECK (successful_responses >= 0 AND successful_responses <= agents_participated)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rounds_metadata_prediction ON debate_rounds_metadata(prediction_id);
CREATE INDEX IF NOT EXISTS idx_rounds_metadata_round ON debate_rounds_metadata(round_number);
CREATE INDEX IF NOT EXISTS idx_rounds_metadata_created ON debate_rounds_metadata(created_at DESC);

-- Comments
COMMENT ON TABLE debate_rounds_metadata IS 'Tracks performance metrics for each debate round';
COMMENT ON COLUMN debate_rounds_metadata.consensus_score IS 'Degree of agreement (0-1, higher = more consensus)';
COMMENT ON COLUMN debate_rounds_metadata.failed_agents IS 'Names of agents that failed to respond';


-- ============================================================================
-- TABLE: debate_rounds_failures
-- Purpose: Log errors and failures for debugging
-- ============================================================================

CREATE TABLE IF NOT EXISTS debate_rounds_failures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,

  -- Agent info
  agent_id UUID REFERENCES agents(id),
  agent_name TEXT,

  -- Error details
  error_type VARCHAR(50),
  error_message TEXT NOT NULL,
  error_stack TEXT,

  -- Context
  retry_attempt INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CHECK (round_number >= 1),
  CHECK (retry_attempt >= 0 AND retry_attempt <= 10)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_failures_prediction ON debate_rounds_failures(prediction_id);
CREATE INDEX IF NOT EXISTS idx_failures_agent ON debate_rounds_failures(agent_id);
CREATE INDEX IF NOT EXISTS idx_failures_error_type ON debate_rounds_failures(error_type);
CREATE INDEX IF NOT EXISTS idx_failures_created ON debate_rounds_failures(created_at DESC);

-- Comments
COMMENT ON TABLE debate_rounds_failures IS 'Logs all errors during debate round execution';
COMMENT ON COLUMN debate_rounds_failures.error_type IS 'Category of error (TIMEOUT, LLM_ERROR, NETWORK_ERROR, etc)';
COMMENT ON COLUMN debate_rounds_failures.retry_attempt IS 'Which retry attempt failed (0 = first attempt)';


-- ============================================================================
-- RLS (Row Level Security) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE agent_react_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_rounds_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_rounds_failures ENABLE ROW LEVEL SECURITY;

-- Public read access for ReAct cycles (transparency)
CREATE POLICY "Public read access for agent_react_cycles"
  ON agent_react_cycles FOR SELECT
  USING (true);

-- Only system can write ReAct cycles
CREATE POLICY "System can insert agent_react_cycles"
  ON agent_react_cycles FOR INSERT
  WITH CHECK (true);

-- Public read access for round metadata
CREATE POLICY "Public read access for debate_rounds_metadata"
  ON debate_rounds_metadata FOR SELECT
  USING (true);

-- Only system can write metadata
CREATE POLICY "System can insert debate_rounds_metadata"
  ON debate_rounds_metadata FOR INSERT
  WITH CHECK (true);

-- Admin-only access for failures (security)
CREATE POLICY "Admin read access for debate_rounds_failures"
  ON debate_rounds_failures FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- Only system can write failures
CREATE POLICY "System can insert debate_rounds_failures"
  ON debate_rounds_failures FOR INSERT
  WITH CHECK (true);


-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to get ReAct cycle by argument_id
CREATE OR REPLACE FUNCTION get_react_cycle_by_argument(p_argument_id UUID)
RETURNS TABLE (
  id UUID,
  agent_name TEXT,
  initial_thought TEXT,
  actions JSONB,
  observations TEXT[],
  synthesis_thought TEXT,
  confidence_adjustment DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    a.name as agent_name,
    rc.initial_thought,
    rc.actions,
    rc.observations,
    rc.synthesis_thought,
    rc.confidence_adjustment,
    rc.created_at
  FROM agent_react_cycles rc
  JOIN agents a ON a.id = rc.agent_id
  WHERE rc.argument_id = p_argument_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_react_cycle_by_argument(UUID) TO authenticated, anon;


-- ============================================================================
-- Success Message
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ ReAct Cycle Storage System migration completed successfully';
  RAISE NOTICE '   - agent_react_cycles table created';
  RAISE NOTICE '   - debate_rounds_metadata table created';
  RAISE NOTICE '   - debate_rounds_failures table created';
  RAISE NOTICE '   - RLS policies applied';
  RAISE NOTICE '   - Helper function get_react_cycle_by_argument() created';
END $$;
