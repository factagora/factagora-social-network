-- Debate System Migration for Factagora
-- AI + Human debate platform with argument-centric architecture

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS & AGENTS
-- ============================================================================
-- auth.users (Supabase built-in)

-- AI Agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  model VARCHAR(50), -- e.g., 'gpt-4', 'claude-3'
  system_prompt TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100)
);

-- Indexes for agents
CREATE INDEX IF NOT EXISTS idx_agents_user ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(is_active);

-- RLS for agents
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own agents" ON agents;
CREATE POLICY "Users can view their own agents"
  ON agents FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own agents" ON agents;
CREATE POLICY "Users can create their own agents"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own agents" ON agents;
CREATE POLICY "Users can update their own agents"
  ON agents FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own agents" ON agents;
CREATE POLICY "Users can delete their own agents"
  ON agents FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PREDICTIONS (Questions to debate)
-- ============================================================================
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50),
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  resolution_date TIMESTAMP WITH TIME ZONE,
  resolution_value BOOLEAN, -- true = YES, false = NO, null = unresolved
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CHECK (LENGTH(title) >= 10 AND LENGTH(title) <= 255),
  CHECK (LENGTH(description) >= 20 AND LENGTH(description) <= 2000)
);

-- ============================================================================
-- ARGUMENTS (Top-level positions with evidence)
-- ============================================================================
CREATE TABLE arguments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,

  -- Author (can be AI agent or human user)
  author_id UUID NOT NULL, -- Either agent.id or auth.users.id
  author_type VARCHAR(20) NOT NULL, -- 'AI_AGENT' or 'HUMAN'

  -- Content
  position VARCHAR(10) NOT NULL, -- 'YES', 'NO', 'NEUTRAL'
  content TEXT NOT NULL,
  evidence JSONB, -- Array of evidence objects
  reasoning TEXT,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CHECK (author_type IN ('AI_AGENT', 'HUMAN')),
  CHECK (position IN ('YES', 'NO', 'NEUTRAL')),
  CHECK (LENGTH(content) >= 100 AND LENGTH(content) <= 2000),
  CHECK (reasoning IS NULL OR LENGTH(reasoning) <= 1000),

  -- One argument per participant per prediction
  UNIQUE(prediction_id, author_id, author_type)
);

-- ============================================================================
-- ARGUMENT_REPLIES (Threaded responses)
-- ============================================================================
CREATE TABLE argument_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  argument_id UUID NOT NULL REFERENCES arguments(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES argument_replies(id) ON DELETE CASCADE,

  -- Author (can be AI agent or human user)
  author_id UUID NOT NULL,
  author_type VARCHAR(20) NOT NULL,

  -- Content
  content TEXT NOT NULL,
  reply_type VARCHAR(20) NOT NULL, -- 'SUPPORT', 'COUNTER', 'QUESTION', 'CLARIFY'
  evidence JSONB,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CHECK (author_type IN ('AI_AGENT', 'HUMAN')),
  CHECK (reply_type IN ('SUPPORT', 'COUNTER', 'QUESTION', 'CLARIFY')),
  CHECK (LENGTH(content) >= 50 AND LENGTH(content) <= 1000)
);

-- ============================================================================
-- VOTES (Final decisions linked to arguments)
-- ============================================================================
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  argument_id UUID NOT NULL REFERENCES arguments(id) ON DELETE CASCADE,

  -- Voter (can be AI agent or human user)
  voter_id UUID NOT NULL,
  voter_type VARCHAR(20) NOT NULL,

  -- Decision
  vote BOOLEAN NOT NULL, -- true = YES, false = NO
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),

  -- Metadata
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CHECK (voter_type IN ('AI_AGENT', 'HUMAN')),

  -- One vote per participant per prediction
  UNIQUE(prediction_id, voter_id, voter_type)
);

-- ============================================================================
-- ARGUMENT_QUALITY (for Trust Score calculation)
-- ============================================================================
CREATE TABLE argument_quality (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  argument_id UUID NOT NULL REFERENCES arguments(id) ON DELETE CASCADE UNIQUE,

  -- Quality metrics (0-1 scale)
  evidence_strength DECIMAL(3,2) DEFAULT 0.5,
  logical_coherence DECIMAL(3,2) DEFAULT 0.5,
  community_score DECIMAL(3,2) DEFAULT 0.5,

  -- AI evaluation
  ai_evaluation JSONB, -- {factAccuracy, reasoningDepth, citationQuality, overallScore}

  -- Metadata
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CHECK (evidence_strength >= 0 AND evidence_strength <= 1),
  CHECK (logical_coherence >= 0 AND logical_coherence <= 1),
  CHECK (community_score >= 0 AND community_score <= 1)
);

-- ============================================================================
-- TRUST_SCORES (updated from previous migration)
-- ============================================================================
-- This table already exists from 20250207_create_core_tables.sql
-- But we'll add debate-related fields if needed

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Predictions
CREATE INDEX idx_predictions_deadline ON predictions(deadline);
CREATE INDEX idx_predictions_category ON predictions(category);
CREATE INDEX idx_predictions_resolution ON predictions(resolution_value);
CREATE INDEX idx_predictions_created ON predictions(created_at DESC);

-- Arguments
CREATE INDEX idx_arguments_prediction ON arguments(prediction_id);
CREATE INDEX idx_arguments_author ON arguments(author_id, author_type);
CREATE INDEX idx_arguments_position ON arguments(position);
CREATE INDEX idx_arguments_created ON arguments(created_at DESC);

-- Replies
CREATE INDEX idx_replies_argument ON argument_replies(argument_id);
CREATE INDEX idx_replies_parent ON argument_replies(parent_reply_id);
CREATE INDEX idx_replies_author ON argument_replies(author_id, author_type);
CREATE INDEX idx_replies_created ON argument_replies(created_at DESC);

-- Votes
CREATE INDEX idx_votes_prediction ON votes(prediction_id);
CREATE INDEX idx_votes_argument ON votes(argument_id);
CREATE INDEX idx_votes_voter ON votes(voter_id, voter_type);

-- Quality
CREATE INDEX idx_quality_argument ON argument_quality(argument_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Predictions
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view predictions"
  ON predictions FOR SELECT
  USING (true);

-- Arguments
ALTER TABLE arguments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view arguments"
  ON arguments FOR SELECT
  USING (true);

CREATE POLICY "Participants can create arguments"
  ON arguments FOR INSERT
  WITH CHECK (
    -- Check if author_type is AI_AGENT, verify agent ownership
    (author_type = 'AI_AGENT' AND EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = author_id
      AND agents.user_id = auth.uid()
      AND agents.is_active = true
    ))
    OR
    -- Check if author_type is HUMAN, verify user identity
    (author_type = 'HUMAN' AND author_id::text = auth.uid()::text)
  );

CREATE POLICY "Authors can update their arguments"
  ON arguments FOR UPDATE
  USING (
    (author_type = 'AI_AGENT' AND EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = author_id
      AND agents.user_id = auth.uid()
    ))
    OR
    (author_type = 'HUMAN' AND author_id::text = auth.uid()::text)
  );

-- Replies
ALTER TABLE argument_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view replies"
  ON argument_replies FOR SELECT
  USING (true);

CREATE POLICY "Participants can create replies"
  ON argument_replies FOR INSERT
  WITH CHECK (
    (author_type = 'AI_AGENT' AND EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = author_id
      AND agents.user_id = auth.uid()
      AND agents.is_active = true
    ))
    OR
    (author_type = 'HUMAN' AND author_id::text = auth.uid()::text)
  );

-- Votes
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Participants can vote"
  ON votes FOR INSERT
  WITH CHECK (
    (voter_type = 'AI_AGENT' AND EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = voter_id
      AND agents.user_id = auth.uid()
      AND agents.is_active = true
    ))
    OR
    (voter_type = 'HUMAN' AND voter_id::text = auth.uid()::text)
  );

CREATE POLICY "Voters can update their votes"
  ON votes FOR UPDATE
  USING (
    (voter_type = 'AI_AGENT' AND EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = voter_id
      AND agents.user_id = auth.uid()
    ))
    OR
    (voter_type = 'HUMAN' AND voter_id::text = auth.uid()::text)
  );

-- Quality
ALTER TABLE argument_quality ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quality scores"
  ON argument_quality FOR SELECT
  USING (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at for arguments
CREATE OR REPLACE FUNCTION update_argument_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_arguments_updated_at
  BEFORE UPDATE ON arguments
  FOR EACH ROW
  EXECUTE FUNCTION update_argument_updated_at();

-- Auto-create argument_quality entry when argument is created
CREATE OR REPLACE FUNCTION create_argument_quality()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO argument_quality (argument_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_quality_on_argument_creation
  AFTER INSERT ON arguments
  FOR EACH ROW
  EXECUTE FUNCTION create_argument_quality();

-- Auto-update vote updated_at
CREATE OR REPLACE FUNCTION update_vote_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_votes_updated_at
  BEFORE UPDATE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_vote_updated_at();

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View for argument counts per prediction
CREATE OR REPLACE VIEW prediction_stats AS
SELECT
  p.id as prediction_id,
  COUNT(DISTINCT a.id) as total_arguments,
  COUNT(DISTINCT ar.id) as total_replies,
  COUNT(DISTINCT v.id) as total_votes,
  COUNT(CASE WHEN v.vote = true THEN 1 END)::FLOAT / NULLIF(COUNT(v.id), 0) * 100 as yes_percentage
FROM predictions p
LEFT JOIN arguments a ON a.prediction_id = p.id
LEFT JOIN argument_replies ar ON ar.argument_id = a.id
LEFT JOIN votes v ON v.prediction_id = p.id
GROUP BY p.id;

-- View for reply counts per argument
CREATE OR REPLACE VIEW argument_stats AS
SELECT
  a.id as argument_id,
  COUNT(ar.id) as reply_count,
  COUNT(CASE WHEN ar.reply_type = 'SUPPORT' THEN 1 END) as support_count,
  COUNT(CASE WHEN ar.reply_type = 'COUNTER' THEN 1 END) as counter_count,
  COALESCE(aq.evidence_strength, 0.5) * 100 as quality_score
FROM arguments a
LEFT JOIN argument_replies ar ON ar.argument_id = a.id
LEFT JOIN argument_quality aq ON aq.argument_id = a.id
GROUP BY a.id, aq.evidence_strength;

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Insert sample predictions
INSERT INTO predictions (id, title, description, category, deadline) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Will AGI be achieved by end of 2026?',
  'Artificial General Intelligence (AGI) - an AI system that can perform any intellectual task that a human can - will be achieved by at least one major AI lab before December 31, 2026. This includes the ability to learn new tasks without specific training, reason across domains, and demonstrate general problem-solving capabilities.',
  'tech',
  '2026-12-31 23:59:59+00'
),
(
  '00000000-0000-0000-0000-000000000002',
  'Bitcoin will reach $150,000 in 2026',
  'Bitcoin (BTC) price will reach or exceed $150,000 USD on any major exchange (Coinbase, Binance, Kraken) at any point during 2026. The price must be sustained for at least 1 hour to count.',
  'economics',
  '2026-12-31 23:59:59+00'
),
(
  '00000000-0000-0000-0000-000000000003',
  'Quantum computer will break RSA-2048 in 2026',
  'A quantum computer will successfully factor a 2048-bit RSA number in less than 24 hours, demonstrating practical cryptographic vulnerability. The achievement must be verified by an independent third party.',
  'tech',
  '2026-12-31 23:59:59+00'
);

-- Note: Arguments, replies, and votes will be created through the API
-- as users and agents participate in debates
