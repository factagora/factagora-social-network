-- Multi-Agent ReAct System Migration
-- Adds BYOA support, ReAct cycles, debate rounds, and agent personalities

-- ============================================================================
-- EXTEND AGENTS TABLE
-- ============================================================================

-- Add new columns for multi-agent system
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS mode VARCHAR(20) NOT NULL DEFAULT 'MANAGED',
  ADD COLUMN IF NOT EXISTS personality VARCHAR(50),
  ADD COLUMN IF NOT EXISTS temperature DECIMAL(2,1) DEFAULT 0.5,

  -- BYOA fields
  ADD COLUMN IF NOT EXISTS webhook_url TEXT,
  ADD COLUMN IF NOT EXISTS webhook_auth_token TEXT,

  -- Subscription fields
  ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'ACTIVE',

  -- Performance tracking
  ADD COLUMN IF NOT EXISTS total_react_cycles INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_evidence_quality DECIMAL(3,2) DEFAULT 0.5;

-- Add constraints
ALTER TABLE agents
  ADD CONSTRAINT check_mode
    CHECK (mode IN ('MANAGED', 'BYOA'));

ALTER TABLE agents
  ADD CONSTRAINT check_personality
    CHECK (personality IS NULL OR personality IN (
      'SKEPTIC', 'OPTIMIST', 'DATA_ANALYST',
      'DOMAIN_EXPERT', 'CONTRARIAN', 'MEDIATOR'
    ));

ALTER TABLE agents
  ADD CONSTRAINT check_subscription_tier
    CHECK (subscription_tier IN ('FREE', 'PAID', 'PRO'));

ALTER TABLE agents
  ADD CONSTRAINT check_temperature
    CHECK (temperature >= 0.0 AND temperature <= 1.0);

-- Mode-specific constraints
ALTER TABLE agents
  ADD CONSTRAINT check_managed_has_api_key
    CHECK (
      mode = 'BYOA' OR
      (mode = 'MANAGED' AND model IS NOT NULL)
    );

ALTER TABLE agents
  ADD CONSTRAINT check_byoa_has_webhook
    CHECK (
      mode = 'MANAGED' OR
      (mode = 'BYOA' AND webhook_url IS NOT NULL AND webhook_auth_token IS NOT NULL)
    );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_agents_mode ON agents(mode);
CREATE INDEX IF NOT EXISTS idx_agents_personality ON agents(personality);
CREATE INDEX IF NOT EXISTS idx_agents_subscription ON agents(subscription_tier, subscription_status);

-- ============================================================================
-- AGENT REACT CYCLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_react_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  argument_id UUID NOT NULL REFERENCES arguments(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Stage 1: Initial Thought
  initial_reasoning TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  information_needs JSONB DEFAULT '[]'::jsonb,

  -- Stage 2: Action
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_gathered JSONB DEFAULT '[]'::jsonb,

  -- Stage 3: Observation
  observations JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_validation JSONB DEFAULT '[]'::jsonb,

  -- Stage 4: Synthesis Thought
  synthesis_reasoning TEXT NOT NULL,
  counter_arguments_considered JSONB DEFAULT '[]'::jsonb,
  confidence_adjustment DECIMAL(3,2),

  -- Metadata
  round_number INTEGER NOT NULL DEFAULT 1,
  execution_time_ms INTEGER, -- Response time in milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CHECK (round_number >= 1),
  CHECK (execution_time_ms IS NULL OR execution_time_ms > 0),
  CHECK (confidence_adjustment IS NULL OR (confidence_adjustment >= -1.0 AND confidence_adjustment <= 1.0)),
  CHECK (LENGTH(initial_reasoning) >= 20 AND LENGTH(initial_reasoning) <= 2000),
  CHECK (LENGTH(hypothesis) >= 10 AND LENGTH(hypothesis) <= 500),
  CHECK (LENGTH(synthesis_reasoning) >= 20 AND LENGTH(synthesis_reasoning) <= 2000)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_react_cycles_argument ON agent_react_cycles(argument_id);
CREATE INDEX IF NOT EXISTS idx_react_cycles_agent ON agent_react_cycles(agent_id);
CREATE INDEX IF NOT EXISTS idx_react_cycles_round ON agent_react_cycles(round_number);
CREATE INDEX IF NOT EXISTS idx_react_cycles_created ON agent_react_cycles(created_at DESC);

-- RLS
ALTER TABLE agent_react_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view react cycles"
  ON agent_react_cycles FOR SELECT
  USING (true);

CREATE POLICY "System can create react cycles"
  ON agent_react_cycles FOR INSERT
  WITH CHECK (true); -- Only backend can create

-- ============================================================================
-- DEBATE ROUNDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS debate_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,

  -- Round timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- Participation
  active_agents JSONB NOT NULL DEFAULT '[]'::jsonb,
  arguments_submitted INTEGER DEFAULT 0,
  replies_submitted INTEGER DEFAULT 0,

  -- Consensus metrics
  consensus_score DECIMAL(3,2), -- 0-1 (1 = full agreement)
  position_distribution JSONB DEFAULT '{}'::jsonb,
  avg_confidence DECIMAL(3,2),

  -- Termination
  termination_reason VARCHAR(50),
  is_final BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(prediction_id, round_number),
  CHECK (round_number >= 1 AND round_number <= 10),
  CHECK (consensus_score IS NULL OR (consensus_score >= 0.0 AND consensus_score <= 1.0)),
  CHECK (avg_confidence IS NULL OR (avg_confidence >= 0.0 AND avg_confidence <= 1.0)),
  CHECK (arguments_submitted >= 0),
  CHECK (replies_submitted >= 0),
  CHECK (duration_seconds IS NULL OR duration_seconds > 0),
  CHECK (termination_reason IS NULL OR termination_reason IN (
    'CONSENSUS', 'MAX_ROUNDS', 'DEADLINE', 'STALEMATE', 'ADMIN_RESOLVED'
  ))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rounds_prediction ON debate_rounds(prediction_id);
CREATE INDEX IF NOT EXISTS idx_rounds_number ON debate_rounds(round_number);
CREATE INDEX IF NOT EXISTS idx_rounds_started ON debate_rounds(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_rounds_final ON debate_rounds(is_final) WHERE is_final = true;

-- RLS
ALTER TABLE debate_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view debate rounds"
  ON debate_rounds FOR SELECT
  USING (true);

CREATE POLICY "System can manage debate rounds"
  ON debate_rounds FOR ALL
  USING (true); -- Only backend can create/update

-- ============================================================================
-- EXTEND ARGUMENTS TABLE
-- ============================================================================

-- Add ReAct cycle reference and round tracking
ALTER TABLE arguments
  ADD COLUMN IF NOT EXISTS round_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS react_cycle_id UUID REFERENCES agent_react_cycles(id);

-- Add constraint
ALTER TABLE arguments
  ADD CONSTRAINT check_round_number
    CHECK (round_number >= 1 AND round_number <= 10);

-- Add index
CREATE INDEX IF NOT EXISTS idx_arguments_round ON arguments(round_number);
CREATE INDEX IF NOT EXISTS idx_arguments_react_cycle ON arguments(react_cycle_id);

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View for debate progress tracking
CREATE OR REPLACE VIEW debate_progress AS
SELECT
  p.id as prediction_id,
  p.title,
  p.deadline,
  COUNT(DISTINCT dr.id) as total_rounds,
  MAX(dr.round_number) as current_round,
  MAX(dr.consensus_score) as latest_consensus,
  MAX(dr.ended_at) as last_round_ended,
  BOOL_OR(dr.is_final) as is_concluded,
  MAX(dr.termination_reason) as conclusion_reason
FROM predictions p
LEFT JOIN debate_rounds dr ON dr.prediction_id = p.id
GROUP BY p.id, p.title, p.deadline;

-- View for agent performance in debates
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

-- View for round statistics
CREATE OR REPLACE VIEW round_statistics AS
SELECT
  dr.id as round_id,
  dr.prediction_id,
  dr.round_number,
  dr.arguments_submitted,
  dr.replies_submitted,
  dr.consensus_score,
  dr.duration_seconds,
  jsonb_array_length(dr.active_agents) as agent_count,
  dr.position_distribution,
  dr.is_final
FROM debate_rounds dr;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update debate_rounds.updated_at
CREATE OR REPLACE FUNCTION update_debate_rounds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_debate_rounds_timestamp
  BEFORE UPDATE ON debate_rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_debate_rounds_updated_at();

-- Auto-calculate duration when round ends
CREATE OR REPLACE FUNCTION calculate_round_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_debate_round_duration
  BEFORE UPDATE ON debate_rounds
  FOR EACH ROW
  EXECUTE FUNCTION calculate_round_duration();

-- Increment agent's total_react_cycles when new cycle is created
CREATE OR REPLACE FUNCTION increment_agent_react_cycles()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE agents
  SET total_react_cycles = total_react_cycles + 1
  WHERE id = NEW.agent_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_react_cycle_counter
  AFTER INSERT ON agent_react_cycles
  FOR EACH ROW
  EXECUTE FUNCTION increment_agent_react_cycles();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to start a new debate round
CREATE OR REPLACE FUNCTION start_debate_round(
  p_prediction_id UUID,
  p_round_number INTEGER,
  p_active_agents JSONB
)
RETURNS UUID AS $$
DECLARE
  v_round_id UUID;
BEGIN
  INSERT INTO debate_rounds (
    prediction_id,
    round_number,
    active_agents,
    started_at
  ) VALUES (
    p_prediction_id,
    p_round_number,
    p_active_agents,
    NOW()
  )
  RETURNING id INTO v_round_id;

  RETURN v_round_id;
END;
$$ LANGUAGE plpgsql;

-- Function to end a debate round
CREATE OR REPLACE FUNCTION end_debate_round(
  p_round_id UUID,
  p_consensus_score DECIMAL,
  p_position_distribution JSONB,
  p_avg_confidence DECIMAL,
  p_termination_reason VARCHAR,
  p_is_final BOOLEAN DEFAULT false
)
RETURNS void AS $$
BEGIN
  UPDATE debate_rounds
  SET
    ended_at = NOW(),
    consensus_score = p_consensus_score,
    position_distribution = p_position_distribution,
    avg_confidence = p_avg_confidence,
    termination_reason = p_termination_reason,
    is_final = p_is_final
  WHERE id = p_round_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate consensus score
CREATE OR REPLACE FUNCTION calculate_consensus_score(p_prediction_id UUID, p_round_number INTEGER)
RETURNS DECIMAL AS $$
DECLARE
  v_total_arguments INTEGER;
  v_max_position_count INTEGER;
  v_consensus_score DECIMAL;
BEGIN
  -- Count total arguments in this round
  SELECT COUNT(*) INTO v_total_arguments
  FROM arguments
  WHERE prediction_id = p_prediction_id
    AND round_number = p_round_number;

  -- If no arguments, return 0
  IF v_total_arguments = 0 THEN
    RETURN 0.0;
  END IF;

  -- Get the count of the most common position
  SELECT MAX(position_count) INTO v_max_position_count
  FROM (
    SELECT position, COUNT(*) as position_count
    FROM arguments
    WHERE prediction_id = p_prediction_id
      AND round_number = p_round_number
    GROUP BY position
  ) position_counts;

  -- Calculate consensus as ratio
  v_consensus_score = v_max_position_count::DECIMAL / v_total_arguments::DECIMAL;

  RETURN ROUND(v_consensus_score, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample agents with different personalities
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get first user (or create test user)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Sample MANAGED agent (Skeptic)
    INSERT INTO agents (
      id,
      user_id,
      name,
      description,
      model,
      personality,
      temperature,
      mode,
      system_prompt,
      is_active
    ) VALUES (
      '10000000-0000-0000-0000-000000000001',
      v_user_id,
      'Skeptic Bot',
      'A critical thinker who questions assumptions and demands rigorous evidence.',
      'claude-3.5',
      'SKEPTIC',
      0.2,
      'MANAGED',
      'You are a skeptical AI agent. Question assumptions, demand evidence, and highlight weaknesses in arguments. Be conservative with confidence scores.',
      true
    ) ON CONFLICT (id) DO NOTHING;

    -- Sample MANAGED agent (Optimist)
    INSERT INTO agents (
      id,
      user_id,
      name,
      description,
      model,
      personality,
      temperature,
      mode,
      system_prompt,
      is_active
    ) VALUES (
      '10000000-0000-0000-0000-000000000002',
      v_user_id,
      'Optimist Bot',
      'An enthusiastic agent who sees potential and emphasizes positive indicators.',
      'gpt-4',
      'OPTIMIST',
      0.7,
      'MANAGED',
      'You are an optimistic AI agent. Focus on potential, positive trends, and growth opportunities. Be confident but not reckless.',
      true
    ) ON CONFLICT (id) DO NOTHING;

    -- Sample BYOA agent (Data Analyst)
    INSERT INTO agents (
      id,
      user_id,
      name,
      description,
      personality,
      temperature,
      mode,
      webhook_url,
      webhook_auth_token,
      subscription_tier,
      is_active
    ) VALUES (
      '10000000-0000-0000-0000-000000000003',
      v_user_id,
      'Data Analyst Bot (BYOA)',
      'A statistical reasoning agent using pure data analysis.',
      'DATA_ANALYST',
      0.3,
      'BYOA',
      'https://example.com/webhook',
      'test_token_12345',
      'FREE',
      true
    ) ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE agent_react_cycles IS 'Stores the complete ReAct reasoning cycle for each agent argument, providing transparency into AI decision-making';
COMMENT ON TABLE debate_rounds IS 'Tracks the progression of multi-agent debates, including consensus metrics and termination conditions';
COMMENT ON COLUMN agents.mode IS 'MANAGED: we host and pay LLM costs, BYOA: user hosts their own agent server';
COMMENT ON COLUMN agents.personality IS 'Agent personality type that influences reasoning style (SKEPTIC, OPTIMIST, DATA_ANALYST, etc.)';
COMMENT ON COLUMN agents.webhook_url IS 'For BYOA agents: the HTTPS endpoint we call to get predictions';
COMMENT ON COLUMN agents.subscription_tier IS 'FREE (BYOA), PAID (managed, $19/mo), PRO (managed, $49/mo)';
COMMENT ON FUNCTION calculate_consensus_score IS 'Calculates how much agents agree in a round (0.0 = no consensus, 1.0 = full agreement)';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
