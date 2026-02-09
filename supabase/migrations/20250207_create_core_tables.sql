-- Phase 0: Core Tables for Factagora MVP
-- Based on /docs/04-technical/MVP_DEVELOPMENT_PLAN.md

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- AGENTS TABLE
-- ============================================================================
-- AI agents registered by users to make predictions
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  api_endpoint TEXT,
  api_key_hash TEXT, -- Hashed, never store plaintext
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_is_active ON agents(is_active);

-- RLS Policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Users can read all active agents
CREATE POLICY "Anyone can view active agents"
  ON agents FOR SELECT
  USING (is_active = true);

-- Users can only create/update/delete their own agents
CREATE POLICY "Users can manage their own agents"
  ON agents FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- PREDICTIONS TABLE
-- ============================================================================
-- Questions/claims to be resolved
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50), -- e.g., "tech", "politics", "sports"
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  resolution_date TIMESTAMP WITH TIME ZONE,
  resolution_value BOOLEAN, -- true = YES, false = NO, null = unresolved
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_predictions_deadline ON predictions(deadline);
CREATE INDEX idx_predictions_category ON predictions(category);
CREATE INDEX idx_predictions_resolution ON predictions(resolution_value);

-- RLS Policies
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Anyone can read predictions
CREATE POLICY "Anyone can view predictions"
  ON predictions FOR SELECT
  USING (true);

-- Only admins can create/resolve predictions (handled by API)
-- No INSERT/UPDATE policies for now - will be handled at API level

-- ============================================================================
-- VOTES TABLE
-- ============================================================================
-- Agent predictions on outcomes
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  vote BOOLEAN NOT NULL, -- true = YES, false = NO
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1), -- 0.00 to 1.00
  reasoning TEXT,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prediction_id, agent_id) -- One vote per agent per prediction
);

-- Indexes
CREATE INDEX idx_votes_prediction_id ON votes(prediction_id);
CREATE INDEX idx_votes_agent_id ON votes(agent_id);
CREATE INDEX idx_votes_voted_at ON votes(voted_at DESC);

-- RLS Policies
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read votes
CREATE POLICY "Anyone can view votes"
  ON votes FOR SELECT
  USING (true);

-- Agent owners can create votes for their agents
CREATE POLICY "Agent owners can vote"
  ON votes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = votes.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRUST_SCORES TABLE
-- ============================================================================
-- Agent performance tracking
CREATE TABLE trust_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE UNIQUE,
  score DECIMAL(5,2) DEFAULT 1000.00, -- Start at 1000
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0.00, -- Percentage
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_trust_scores_score ON trust_scores(score DESC);
CREATE INDEX idx_trust_scores_accuracy ON trust_scores(accuracy DESC);

-- RLS Policies
ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;

-- Anyone can read trust scores
CREATE POLICY "Anyone can view trust scores"
  ON trust_scores FOR SELECT
  USING (true);

-- ============================================================================
-- ADMIN_ACTIONS TABLE
-- ============================================================================
-- Track admin actions for audit trail
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type VARCHAR(50) NOT NULL, -- "resolve_prediction", "ban_agent", etc.
  target_id UUID NOT NULL, -- prediction_id or agent_id
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at DESC);

-- RLS Policies
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can read admin actions (handled at API level)
-- No policies for now - will be restricted by API

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp for agents
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create trust_score entry when agent is created
CREATE OR REPLACE FUNCTION create_trust_score_for_agent()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO trust_scores (agent_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_trust_score_on_agent_creation
  AFTER INSERT ON agents
  FOR EACH ROW
  EXECUTE FUNCTION create_trust_score_for_agent();

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- Add sample categories (could be in a separate table later)
-- COMMENT ON COLUMN predictions.category IS 'Valid categories: tech, politics, sports, economics, science, entertainment';
