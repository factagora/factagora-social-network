-- ========================================
-- USER STATS Table
-- ========================================

CREATE TABLE IF NOT EXISTS user_stats (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,

  -- Claim Voting Stats
  total_claim_votes INTEGER DEFAULT 0,
  correct_claim_votes INTEGER DEFAULT 0,
  claim_accuracy DECIMAL(5,2) DEFAULT 0.00,  -- 0.00 - 100.00

  -- Prediction Voting Stats (기존 시스템과 호환)
  total_prediction_votes INTEGER DEFAULT 0,
  correct_prediction_votes INTEGER DEFAULT 0,
  prediction_accuracy DECIMAL(5,2) DEFAULT 0.00,

  -- Overall Stats
  total_votes INTEGER DEFAULT 0,
  correct_votes INTEGER DEFAULT 0,
  overall_accuracy DECIMAL(5,2) DEFAULT 0.00,

  -- Points & Rewards
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,

  -- Reputation
  reputation_score INTEGER DEFAULT 0,
  trust_score DECIMAL(5,2) DEFAULT 50.00,  -- 0.00 - 100.00

  -- Activity
  claims_created INTEGER DEFAULT 0,
  evidence_submitted INTEGER DEFAULT 0,
  arguments_written INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Indexes
-- ========================================
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_stats_points ON user_stats(points DESC);
CREATE INDEX idx_user_stats_reputation ON user_stats(reputation_score DESC);
CREATE INDEX idx_user_stats_accuracy ON user_stats(overall_accuracy DESC);

-- ========================================
-- Enable RLS
-- ========================================
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view user stats
CREATE POLICY "Anyone can view user stats"
  ON user_stats FOR SELECT
  USING (true);

-- Policy: Users can update their own stats (via functions only)
CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- ========================================
-- Function: Initialize user stats
-- ========================================
CREATE OR REPLACE FUNCTION initialize_user_stats(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Function: Update claim vote accuracy
-- ========================================
CREATE OR REPLACE FUNCTION update_claim_vote_accuracy(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_total_votes INTEGER;
  v_correct_votes INTEGER;
  v_accuracy DECIMAL(5,2);
BEGIN
  -- Count total claim votes
  SELECT COUNT(*) INTO v_total_votes
  FROM claim_votes
  WHERE user_id = p_user_id;

  -- Count correct votes (where vote matches resolution)
  SELECT COUNT(*) INTO v_correct_votes
  FROM claim_votes cv
  INNER JOIN claims c ON cv.claim_id = c.id
  WHERE cv.user_id = p_user_id
    AND c.resolution_value IS NOT NULL
    AND cv.vote_value = c.resolution_value;

  -- Calculate accuracy
  IF v_total_votes > 0 THEN
    v_accuracy := (v_correct_votes::DECIMAL / v_total_votes) * 100;
  ELSE
    v_accuracy := 0.00;
  END IF;

  -- Update user stats
  INSERT INTO user_stats (
    user_id,
    total_claim_votes,
    correct_claim_votes,
    claim_accuracy,
    total_votes,
    correct_votes,
    overall_accuracy
  )
  VALUES (
    p_user_id,
    v_total_votes,
    v_correct_votes,
    v_accuracy,
    v_total_votes,
    v_correct_votes,
    v_accuracy
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_claim_votes = v_total_votes,
    correct_claim_votes = v_correct_votes,
    claim_accuracy = v_accuracy,
    total_votes = v_total_votes,
    correct_votes = v_correct_votes,
    overall_accuracy = v_accuracy,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Function: Calculate and distribute points
-- ========================================
CREATE OR REPLACE FUNCTION distribute_claim_resolution_points(p_claim_id UUID)
RETURNS void AS $$
DECLARE
  v_resolution_value BOOLEAN;
  v_base_points INTEGER := 10;
  v_bonus_multiplier DECIMAL := 1.0;
  v_voter_record RECORD;
BEGIN
  -- Get claim resolution value
  SELECT resolution_value INTO v_resolution_value
  FROM claims
  WHERE id = p_claim_id;

  IF v_resolution_value IS NULL THEN
    RETURN;
  END IF;

  -- Award points to correct voters
  FOR v_voter_record IN
    SELECT
      cv.user_id,
      cv.confidence,
      cv.created_at as vote_time,
      c.created_at as claim_time
    FROM claim_votes cv
    INNER JOIN claims c ON cv.claim_id = c.id
    WHERE cv.claim_id = p_claim_id
      AND cv.vote_value = v_resolution_value
  LOOP
    -- Calculate bonus based on confidence
    v_bonus_multiplier := 1.0 + (v_voter_record.confidence - 0.5);

    -- Calculate early voter bonus (voted within first week)
    IF v_voter_record.vote_time < v_voter_record.claim_time + INTERVAL '7 days' THEN
      v_bonus_multiplier := v_bonus_multiplier * 1.2;
    END IF;

    -- Award points
    INSERT INTO user_stats (user_id, points)
    VALUES (v_voter_record.user_id, FLOOR(v_base_points * v_bonus_multiplier))
    ON CONFLICT (user_id) DO UPDATE SET
      points = user_stats.points + FLOOR(v_base_points * v_bonus_multiplier),
      updated_at = NOW();

    -- Update accuracy
    PERFORM update_claim_vote_accuracy(v_voter_record.user_id);
  END LOOP;

  -- Update accuracy for incorrect voters too
  FOR v_voter_record IN
    SELECT user_id
    FROM claim_votes
    WHERE claim_id = p_claim_id
      AND vote_value != v_resolution_value
  LOOP
    PERFORM update_claim_vote_accuracy(v_voter_record.user_id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Trigger: Auto-distribute points on resolution
-- ========================================
CREATE OR REPLACE FUNCTION trigger_distribute_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.resolution_value IS NOT NULL AND OLD.resolution_value IS NULL THEN
    PERFORM distribute_claim_resolution_points(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_claim_resolved_distribute_points
  AFTER UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION trigger_distribute_points();

-- ========================================
-- Comments
-- ========================================
COMMENT ON TABLE user_stats IS 'User statistics and reputation tracking';
COMMENT ON COLUMN user_stats.trust_score IS 'Trust score based on accuracy and activity (0-100)';
COMMENT ON COLUMN user_stats.reputation_score IS 'Accumulated reputation points';
COMMENT ON COLUMN user_stats.points IS 'Redeemable points for rewards';
