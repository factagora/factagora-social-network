-- Voting System Migration
-- Created: 2026-02-11
-- Purpose: Enable human and AI agent voting on predictions

-- ============================================================================
-- 0. Clean up existing objects (for re-running migration)
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_update_prediction_vote_stats ON votes;
DROP FUNCTION IF EXISTS update_prediction_vote_stats();
DROP FUNCTION IF EXISTS get_vote_weight(VARCHAR, INTEGER);
DROP VIEW IF EXISTS prediction_consensus;
DROP TABLE IF EXISTS votes CASCADE;

-- ============================================================================
-- 1. Create votes table
-- ============================================================================

CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL, -- user_id or agent_id
  voter_type VARCHAR(10) NOT NULL CHECK (voter_type IN ('HUMAN', 'AI_AGENT')),
  voter_name VARCHAR(255), -- Cached for display
  position VARCHAR(10) NOT NULL CHECK (position IN ('YES', 'NO', 'NEUTRAL')),
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  weight DECIMAL(3,2) NOT NULL DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 3.0),
  reasoning TEXT, -- Optional explanation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate votes (one vote per voter per prediction)
  UNIQUE (prediction_id, voter_id, voter_type)
);

-- Indexes for performance
CREATE INDEX idx_votes_prediction_id ON votes(prediction_id);
CREATE INDEX idx_votes_voter_id ON votes(voter_id);
CREATE INDEX idx_votes_voter_type ON votes(voter_type);
CREATE INDEX idx_votes_created_at ON votes(created_at DESC);

-- ============================================================================
-- 2. Create prediction_consensus view
-- ============================================================================

CREATE OR REPLACE VIEW prediction_consensus AS
SELECT
  v.prediction_id,

  -- Total counts
  COUNT(*) as total_votes,
  COUNT(*) FILTER (WHERE v.voter_type = 'HUMAN') as human_votes,
  COUNT(*) FILTER (WHERE v.voter_type = 'AI_AGENT') as ai_votes,

  -- Position distribution (all)
  COUNT(*) FILTER (WHERE v.position = 'YES') as yes_votes,
  COUNT(*) FILTER (WHERE v.position = 'NO') as no_votes,
  COUNT(*) FILTER (WHERE v.position = 'NEUTRAL') as neutral_votes,

  -- Human position distribution
  COUNT(*) FILTER (WHERE v.voter_type = 'HUMAN' AND v.position = 'YES') as human_yes,
  COUNT(*) FILTER (WHERE v.voter_type = 'HUMAN' AND v.position = 'NO') as human_no,
  COUNT(*) FILTER (WHERE v.voter_type = 'HUMAN' AND v.position = 'NEUTRAL') as human_neutral,

  -- AI position distribution
  COUNT(*) FILTER (WHERE v.voter_type = 'AI_AGENT' AND v.position = 'YES') as ai_yes,
  COUNT(*) FILTER (WHERE v.voter_type = 'AI_AGENT' AND v.position = 'NO') as ai_no,
  COUNT(*) FILTER (WHERE v.voter_type = 'AI_AGENT' AND v.position = 'NEUTRAL') as ai_neutral,

  -- Weighted consensus calculation
  SUM(CASE WHEN v.position = 'YES' THEN v.weight ELSE 0 END) as weighted_yes,
  SUM(CASE WHEN v.position = 'NO' THEN v.weight ELSE 0 END) as weighted_no,
  SUM(CASE WHEN v.position = 'NEUTRAL' THEN v.weight ELSE 0 END) as weighted_neutral,
  SUM(v.weight) as total_weight,

  -- Overall consensus percentage (YES)
  CASE
    WHEN SUM(v.weight) > 0 THEN
      ROUND((SUM(CASE WHEN v.position = 'YES' THEN v.weight ELSE 0 END) / SUM(v.weight))::numeric, 4)
    ELSE 0
  END as consensus_yes_pct,

  -- Human consensus percentage (YES)
  CASE
    WHEN SUM(CASE WHEN v.voter_type = 'HUMAN' THEN v.weight ELSE 0 END) > 0 THEN
      ROUND((SUM(CASE WHEN v.voter_type = 'HUMAN' AND v.position = 'YES' THEN v.weight ELSE 0 END) /
             SUM(CASE WHEN v.voter_type = 'HUMAN' THEN v.weight ELSE 0 END))::numeric, 4)
    ELSE 0
  END as human_consensus_yes_pct,

  -- AI consensus percentage (YES)
  CASE
    WHEN SUM(CASE WHEN v.voter_type = 'AI_AGENT' THEN v.weight ELSE 0 END) > 0 THEN
      ROUND((SUM(CASE WHEN v.voter_type = 'AI_AGENT' AND v.position = 'YES' THEN v.weight ELSE 0 END) /
             SUM(CASE WHEN v.voter_type = 'AI_AGENT' THEN v.weight ELSE 0 END))::numeric, 4)
    ELSE 0
  END as ai_consensus_yes_pct,

  -- Average confidence
  ROUND(AVG(v.confidence)::numeric, 4) as avg_confidence,
  ROUND(AVG(v.confidence) FILTER (WHERE v.voter_type = 'HUMAN')::numeric, 4) as human_avg_confidence,
  ROUND(AVG(v.confidence) FILTER (WHERE v.voter_type = 'AI_AGENT')::numeric, 4) as ai_avg_confidence

FROM votes v
GROUP BY v.prediction_id;

-- ============================================================================
-- 3. Add vote_count to predictions table
-- ============================================================================

ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS consensus_yes_pct DECIMAL(5,4) DEFAULT 0;

-- ============================================================================
-- 4. Create function to update prediction vote stats
-- ============================================================================

CREATE OR REPLACE FUNCTION update_prediction_vote_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update prediction with latest vote stats
  UPDATE predictions p
  SET
    vote_count = COALESCE(pc.total_votes, 0),
    consensus_yes_pct = COALESCE(pc.consensus_yes_pct, 0)
  FROM prediction_consensus pc
  WHERE p.id = pc.prediction_id
    AND pc.prediction_id = COALESCE(NEW.prediction_id, OLD.prediction_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. Create trigger to auto-update prediction stats
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_update_prediction_vote_stats ON votes;

CREATE TRIGGER trigger_update_prediction_vote_stats
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_prediction_vote_stats();

-- ============================================================================
-- 6. Create function to get vote weight based on platform phase
-- ============================================================================

CREATE OR REPLACE FUNCTION get_vote_weight(
  p_voter_type VARCHAR,
  p_total_users INTEGER DEFAULT NULL
)
RETURNS DECIMAL AS $$
DECLARE
  v_weight DECIMAL;
  v_user_count INTEGER;
BEGIN
  -- Get total user count if not provided
  IF p_total_users IS NULL THEN
    -- Count unique users who have created predictions
    SELECT COUNT(DISTINCT user_id) INTO v_user_count
    FROM predictions
    WHERE user_id IS NOT NULL;
  ELSE
    v_user_count := p_total_users;
  END IF;

  -- Calculate weight based on platform phase
  IF p_voter_type = 'HUMAN' THEN
    v_weight := 1.0; -- Human votes always have full weight
  ELSIF p_voter_type = 'AI_AGENT' THEN
    CASE
      WHEN v_user_count < 100 THEN v_weight := 0.5;  -- Bootstrap phase
      WHEN v_user_count < 1000 THEN v_weight := 0.3; -- Growth phase
      ELSE v_weight := 0.1;                           -- Mature phase
    END CASE;
  ELSE
    v_weight := 0.0; -- Unknown voter type
  END IF;

  RETURN v_weight;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. Comments
-- ============================================================================

COMMENT ON TABLE votes IS 'Stores all votes (human and AI) on predictions';
COMMENT ON COLUMN votes.weight IS 'Vote weight: Human=1.0, AI varies by platform phase (0.5→0.3→0.1)';
COMMENT ON COLUMN votes.confidence IS 'Voter confidence level (0.0-1.0)';
COMMENT ON VIEW prediction_consensus IS 'Aggregated voting statistics per prediction';
COMMENT ON FUNCTION get_vote_weight IS 'Calculates vote weight based on voter type and platform phase';
