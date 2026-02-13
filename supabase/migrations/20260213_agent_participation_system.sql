-- Agent Participation System Migration
-- Migration: 20260213_agent_participation_system.sql
-- Purpose: Enable agents to actively participate in predictions and claims

-- ============================================================================
-- 1. AGENT PREDICTIONS TABLE
-- ============================================================================
-- Track agent predictions on forecasting markets
CREATE TABLE IF NOT EXISTS agent_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,

  -- Prediction data
  probability DECIMAL(5,4) NOT NULL CHECK (probability >= 0 AND probability <= 1),
  reasoning TEXT NOT NULL,
  confidence_level VARCHAR(20) NOT NULL CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW')),

  -- Performance metrics (calculated after resolution)
  brier_score DECIMAL(5,4) CHECK (brier_score >= 0 AND brier_score <= 1),
  was_correct BOOLEAN,
  reputation_change INTEGER, -- Points gained/lost from this prediction

  -- Metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,

  -- Prevent duplicate predictions from same agent
  UNIQUE(agent_id, prediction_id)
);

-- Indexes for agent predictions
CREATE INDEX IF NOT EXISTS idx_agent_predictions_agent ON agent_predictions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_predictions_prediction ON agent_predictions(prediction_id);
CREATE INDEX IF NOT EXISTS idx_agent_predictions_brier ON agent_predictions(brier_score ASC) WHERE brier_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agent_predictions_submitted ON agent_predictions(submitted_at DESC);

-- ============================================================================
-- 2. AGENT CLAIM PARTICIPATION TABLE
-- ============================================================================
-- Track agent participation in fact-checking claims
CREATE TABLE IF NOT EXISTS agent_claim_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,

  -- Participation details
  participation_type VARCHAR(20) NOT NULL CHECK (participation_type IN ('EVIDENCE', 'ARGUMENT', 'VERDICT')),
  content_id UUID, -- References claim_evidence.id or claim_arguments.id
  reasoning TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),

  -- Performance (for evidence/arguments)
  quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 1),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,

  -- Metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for claim participation
CREATE INDEX IF NOT EXISTS idx_agent_claim_participation_agent ON agent_claim_participation(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_claim_participation_claim ON agent_claim_participation(claim_id);
CREATE INDEX IF NOT EXISTS idx_agent_claim_participation_type ON agent_claim_participation(participation_type);
CREATE INDEX IF NOT EXISTS idx_agent_claim_participation_quality ON agent_claim_participation(quality_score DESC) WHERE quality_score IS NOT NULL;

-- ============================================================================
-- 3. AGENT PERFORMANCE TABLE
-- ============================================================================
-- Aggregate performance metrics for each agent
CREATE TABLE IF NOT EXISTS agent_performance (
  agent_id UUID PRIMARY KEY REFERENCES agents(id) ON DELETE CASCADE,

  -- Prediction metrics
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage 0-100
  avg_brier_score DECIMAL(5,4), -- Lower is better (0-1)
  calibration_score DECIMAL(5,4), -- How well calibrated the predictions are

  -- Claim metrics
  total_arguments INTEGER DEFAULT 0,
  total_evidence_submitted INTEGER DEFAULT 0,
  avg_evidence_quality DECIMAL(3,2) DEFAULT 0.50,
  avg_argument_quality DECIMAL(3,2) DEFAULT 0.50,

  -- Reputation & ranking
  reputation_score INTEGER DEFAULT 1000, -- Starts at 1000
  current_rank INTEGER,
  peak_rank INTEGER,
  peak_reputation INTEGER DEFAULT 1000,

  -- Activity tracking
  last_prediction_at TIMESTAMPTZ,
  last_claim_participation_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,

  -- Streaks
  current_streak INTEGER DEFAULT 0, -- Consecutive correct predictions
  longest_streak INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for agent performance
CREATE INDEX IF NOT EXISTS idx_agent_performance_reputation ON agent_performance(reputation_score DESC);
CREATE INDEX IF NOT EXISTS idx_agent_performance_accuracy ON agent_performance(accuracy_rate DESC);
CREATE INDEX IF NOT EXISTS idx_agent_performance_brier ON agent_performance(avg_brier_score ASC);
CREATE INDEX IF NOT EXISTS idx_agent_performance_rank ON agent_performance(current_rank ASC) WHERE current_rank IS NOT NULL;

-- ============================================================================
-- 4. AGENT EXECUTION QUEUE TABLE
-- ============================================================================
-- Queue system for automated agent execution
CREATE TABLE IF NOT EXISTS agent_execution_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Task details
  task_type VARCHAR(20) NOT NULL CHECK (task_type IN ('PREDICTION', 'CLAIM_ANALYSIS', 'EVIDENCE_REVIEW')),
  target_id UUID NOT NULL, -- prediction_id or claim_id
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10), -- 1=highest, 10=lowest

  -- Execution state
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Result
  result_data JSONB, -- Store the agent's response

  -- Metadata
  execution_time_ms INTEGER, -- How long the execution took
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for execution queue
CREATE INDEX IF NOT EXISTS idx_agent_execution_queue_status ON agent_execution_queue(status, priority, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_agent_execution_queue_agent ON agent_execution_queue(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_execution_queue_target ON agent_execution_queue(target_id);
CREATE INDEX IF NOT EXISTS idx_agent_execution_queue_created ON agent_execution_queue(created_at DESC);

-- ============================================================================
-- 5. ENHANCE AGENTS TABLE FOR PARTICIPATION
-- ============================================================================
-- Add auto-participation settings to agents table
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS auto_participate BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS participate_categories TEXT[], -- Filter by category, null = all categories
  ADD COLUMN IF NOT EXISTS cooldown_ms INTEGER DEFAULT 60000 CHECK (cooldown_ms >= 0), -- 1 minute default
  ADD COLUMN IF NOT EXISTS max_daily_executions INTEGER DEFAULT 100 CHECK (max_daily_executions > 0),
  ADD COLUMN IF NOT EXISTS daily_execution_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_count_reset_at TIMESTAMPTZ DEFAULT NOW();

-- Indexes for agent participation settings
CREATE INDEX IF NOT EXISTS idx_agents_auto_participate ON agents(auto_participate) WHERE auto_participate = true;

-- ============================================================================
-- 6. FUNCTIONS FOR PERFORMANCE CALCULATIONS
-- ============================================================================

-- Function to calculate Brier score for a prediction
CREATE OR REPLACE FUNCTION calculate_brier_score(
  p_prediction DECIMAL(5,4),
  p_outcome BOOLEAN
) RETURNS DECIMAL(5,4) AS $$
BEGIN
  -- Brier score = (prediction - outcome)^2
  -- Lower is better, 0 = perfect, 1 = worst possible
  RETURN POWER(p_prediction - CASE WHEN p_outcome THEN 1 ELSE 0 END, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update agent performance after a prediction resolves
CREATE OR REPLACE FUNCTION update_agent_prediction_performance(
  p_agent_prediction_id UUID,
  p_outcome BOOLEAN
) RETURNS VOID AS $$
DECLARE
  v_agent_id UUID;
  v_probability DECIMAL(5,4);
  v_brier_score DECIMAL(5,4);
  v_was_correct BOOLEAN;
  v_reputation_change INTEGER;
BEGIN
  -- Get prediction details
  SELECT agent_id, probability
  INTO v_agent_id, v_probability
  FROM agent_predictions
  WHERE id = p_agent_prediction_id;

  -- Calculate Brier score
  v_brier_score := calculate_brier_score(v_probability, p_outcome);

  -- Determine if prediction was correct (probability > 0.5 matches outcome)
  v_was_correct := (v_probability > 0.5 AND p_outcome) OR (v_probability <= 0.5 AND NOT p_outcome);

  -- Calculate reputation change
  -- Perfect prediction (brier=0) → +50 points
  -- Worst prediction (brier=1) → -50 points
  -- Average prediction (brier=0.25) → +12.5 points
  v_reputation_change := ROUND((1 - v_brier_score) * 50 - 25);

  -- Update agent prediction record
  UPDATE agent_predictions
  SET
    brier_score = v_brier_score,
    was_correct = v_was_correct,
    reputation_change = v_reputation_change,
    resolved_at = NOW()
  WHERE id = p_agent_prediction_id;

  -- Update agent performance
  UPDATE agent_performance
  SET
    total_predictions = total_predictions + 1,
    correct_predictions = correct_predictions + CASE WHEN v_was_correct THEN 1 ELSE 0 END,
    accuracy_rate = ROUND(
      (correct_predictions + CASE WHEN v_was_correct THEN 1 ELSE 0 END)::DECIMAL
      / (total_predictions + 1) * 100,
      2
    ),
    avg_brier_score = COALESCE(
      (avg_brier_score * total_predictions + v_brier_score) / (total_predictions + 1),
      v_brier_score
    ),
    reputation_score = reputation_score + v_reputation_change,
    peak_reputation = GREATEST(peak_reputation, reputation_score + v_reputation_change),
    current_streak = CASE
      WHEN v_was_correct THEN current_streak + 1
      ELSE 0
    END,
    longest_streak = GREATEST(
      longest_streak,
      CASE WHEN v_was_correct THEN current_streak + 1 ELSE 0 END
    ),
    last_prediction_at = NOW(),
    last_active_at = NOW(),
    updated_at = NOW()
  WHERE agent_id = v_agent_id;

  -- Insert performance record if it doesn't exist
  INSERT INTO agent_performance (agent_id)
  VALUES (v_agent_id)
  ON CONFLICT (agent_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to queue agent for execution
CREATE OR REPLACE FUNCTION queue_agent_execution(
  p_agent_id UUID,
  p_task_type VARCHAR(20),
  p_target_id UUID,
  p_priority INTEGER DEFAULT 5
) RETURNS UUID AS $$
DECLARE
  v_queue_id UUID;
  v_agent agents%ROWTYPE;
  v_daily_count INTEGER;
BEGIN
  -- Get agent details
  SELECT * INTO v_agent FROM agents WHERE id = p_agent_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Agent not found: %', p_agent_id;
  END IF;

  IF NOT v_agent.is_active THEN
    RAISE EXCEPTION 'Agent is not active: %', p_agent_id;
  END IF;

  -- Check daily execution limit
  IF v_agent.daily_execution_count >= v_agent.max_daily_executions THEN
    -- Check if we need to reset the counter (new day)
    IF NOW() - v_agent.daily_count_reset_at > INTERVAL '1 day' THEN
      UPDATE agents
      SET
        daily_execution_count = 0,
        daily_count_reset_at = NOW()
      WHERE id = p_agent_id;
    ELSE
      RAISE EXCEPTION 'Agent has reached daily execution limit: %', p_agent_id;
    END IF;
  END IF;

  -- Create queue entry
  INSERT INTO agent_execution_queue (agent_id, task_type, target_id, priority)
  VALUES (p_agent_id, p_task_type, p_target_id, p_priority)
  RETURNING id INTO v_queue_id;

  -- Increment daily counter
  UPDATE agents
  SET daily_execution_count = daily_execution_count + 1
  WHERE id = p_agent_id;

  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. TRIGGERS FOR AUTOMATIC PERFORMANCE UPDATES
-- ============================================================================

-- Initialize agent performance when agent is created
CREATE OR REPLACE FUNCTION trigger_init_agent_performance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO agent_performance (agent_id)
  VALUES (NEW.id)
  ON CONFLICT (agent_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_agent_insert
  AFTER INSERT ON agents
  FOR EACH ROW
  EXECUTE FUNCTION trigger_init_agent_performance();

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE agent_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_claim_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_execution_queue ENABLE ROW LEVEL SECURITY;

-- Public read access for agent predictions
CREATE POLICY "Public can view agent predictions"
  ON agent_predictions FOR SELECT
  USING (true);

-- Agents can insert their own predictions
CREATE POLICY "Users can insert predictions for their agents"
  ON agent_predictions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = agent_predictions.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- Public read access for agent claim participation
CREATE POLICY "Public can view agent claim participation"
  ON agent_claim_participation FOR SELECT
  USING (true);

-- Agents can insert their own participation
CREATE POLICY "Users can insert participation for their agents"
  ON agent_claim_participation FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = agent_claim_participation.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- Public read access for agent performance
CREATE POLICY "Public can view agent performance"
  ON agent_performance FOR SELECT
  USING (true);

-- Public read access for execution queue (for transparency)
CREATE POLICY "Public can view execution queue"
  ON agent_execution_queue FOR SELECT
  USING (true);

-- ============================================================================
-- 9. COMMENTS
-- ============================================================================

COMMENT ON TABLE agent_predictions IS 'Track agent predictions on forecasting markets with performance metrics';
COMMENT ON TABLE agent_claim_participation IS 'Track agent participation in fact-checking claims (evidence, arguments, verdicts)';
COMMENT ON TABLE agent_performance IS 'Aggregate performance metrics for each agent (Brier score, accuracy, reputation)';
COMMENT ON TABLE agent_execution_queue IS 'Queue system for automated agent execution with retry logic';

COMMENT ON FUNCTION calculate_brier_score IS 'Calculate Brier score for a prediction: (prediction - outcome)^2, lower is better';
COMMENT ON FUNCTION update_agent_prediction_performance IS 'Update agent performance metrics after a prediction resolves';
COMMENT ON FUNCTION queue_agent_execution IS 'Queue an agent for execution with priority and daily limit checks';
