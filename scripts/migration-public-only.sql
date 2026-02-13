-- ========================================
-- PUBLIC TABLES ONLY (No auth.users modifications)
-- ========================================

-- ========================================
-- CLAIMS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50),
  resolution_date TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Approval system
  approval_status VARCHAR(20) DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolution_value BOOLEAN,
  verification_status VARCHAR(20) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'DISPUTED', 'REJECTED')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_created_by ON claims(created_by);
CREATE INDEX IF NOT EXISTS idx_claims_category ON claims(category);
CREATE INDEX IF NOT EXISTS idx_claims_approval_status ON claims(approval_status);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at DESC);

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved claims"
  ON claims FOR SELECT
  USING (approval_status = 'APPROVED');

CREATE POLICY "Users can view their own claims"
  ON claims FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create claims"
  ON claims FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own pending claims"
  ON claims FOR UPDATE
  USING (auth.uid() = created_by AND approval_status = 'PENDING');

-- ========================================
-- CLAIM VOTES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS claim_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_value BOOLEAN NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0.7 CHECK (confidence >= 0.5 AND confidence <= 1.0),
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(claim_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_claim_votes_claim_id ON claim_votes(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_votes_user_id ON claim_votes(user_id);

ALTER TABLE claim_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes"
  ON claim_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can create/update their own votes"
  ON claim_votes FOR ALL
  USING (auth.uid() = user_id);

-- ========================================
-- CLAIM EVIDENCE TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS claim_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title VARCHAR(500),
  description TEXT,
  credibility_score INTEGER DEFAULT 0 CHECK (credibility_score >= 0 AND credibility_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(claim_id, url)
);

CREATE INDEX IF NOT EXISTS idx_claim_evidence_claim_id ON claim_evidence(claim_id);

ALTER TABLE claim_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view evidence"
  ON claim_evidence FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can submit evidence"
  ON claim_evidence FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

-- ========================================
-- CLAIM ARGUMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS claim_arguments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position VARCHAR(20) NOT NULL CHECK (position IN ('TRUE', 'FALSE', 'UNCERTAIN')),
  content TEXT NOT NULL CHECK (LENGTH(content) >= 100 AND LENGTH(content) <= 2000),
  reasoning TEXT,
  confidence DECIMAL(3,2) DEFAULT 0.7,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claim_arguments_claim_id ON claim_arguments(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_arguments_author_id ON claim_arguments(author_id);
CREATE INDEX IF NOT EXISTS idx_claim_arguments_score ON claim_arguments(score DESC);

ALTER TABLE claim_arguments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view arguments"
  ON claim_arguments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create arguments"
  ON claim_arguments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- ========================================
-- ARGUMENT VOTES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS claim_argument_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  argument_id UUID NOT NULL REFERENCES claim_arguments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type VARCHAR(4) NOT NULL CHECK (vote_type IN ('UP', 'DOWN')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(argument_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_claim_argument_votes_argument_id ON claim_argument_votes(argument_id);

ALTER TABLE claim_argument_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view argument votes"
  ON claim_argument_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own argument votes"
  ON claim_argument_votes FOR ALL
  USING (auth.uid() = user_id);

-- ========================================
-- USER STATS TABLE (without auth.users modifications)
-- ========================================
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Claim Stats
  total_claim_votes INTEGER DEFAULT 0,
  correct_claim_votes INTEGER DEFAULT 0,
  claim_accuracy DECIMAL(5,2) DEFAULT 0.00,
  
  -- Prediction Stats
  total_prediction_votes INTEGER DEFAULT 0,
  correct_prediction_votes INTEGER DEFAULT 0,
  prediction_accuracy DECIMAL(5,2) DEFAULT 0.00,
  
  -- Overall
  total_votes INTEGER DEFAULT 0,
  correct_votes INTEGER DEFAULT 0,
  overall_accuracy DECIMAL(5,2) DEFAULT 0.00,
  
  -- Points & Rewards
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  
  -- Reputation
  reputation_score INTEGER DEFAULT 0,
  trust_score DECIMAL(5,2) DEFAULT 50.00,
  
  -- Activity
  claims_created INTEGER DEFAULT 0,
  evidence_submitted INTEGER DEFAULT 0,
  arguments_written INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_points ON user_stats(points DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_reputation ON user_stats(reputation_score DESC);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user stats"
  ON user_stats FOR SELECT
  USING (true);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- ========================================
-- FUNCTIONS
-- ========================================

-- Initialize user stats
CREATE OR REPLACE FUNCTION initialize_user_stats(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Update claim vote accuracy
CREATE OR REPLACE FUNCTION update_claim_vote_accuracy(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_total_votes INTEGER;
  v_correct_votes INTEGER;
  v_accuracy DECIMAL(5,2);
BEGIN
  SELECT COUNT(*) INTO v_total_votes
  FROM claim_votes
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_correct_votes
  FROM claim_votes cv
  INNER JOIN claims c ON cv.claim_id = c.id
  WHERE cv.user_id = p_user_id
    AND c.resolution_value IS NOT NULL
    AND cv.vote_value = c.resolution_value;

  IF v_total_votes > 0 THEN
    v_accuracy := (v_correct_votes::DECIMAL / v_total_votes) * 100;
  ELSE
    v_accuracy := 0.00;
  END IF;

  INSERT INTO user_stats (
    user_id, total_claim_votes, correct_claim_votes, claim_accuracy,
    total_votes, correct_votes, overall_accuracy
  )
  VALUES (
    p_user_id, v_total_votes, v_correct_votes, v_accuracy,
    v_total_votes, v_correct_votes, v_accuracy
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

-- Distribute points on claim resolution
CREATE OR REPLACE FUNCTION distribute_claim_resolution_points(p_claim_id UUID)
RETURNS void AS $$
DECLARE
  v_resolution_value BOOLEAN;
  v_base_points INTEGER := 10;
  v_bonus_multiplier DECIMAL := 1.0;
  v_voter_record RECORD;
BEGIN
  SELECT resolution_value INTO v_resolution_value
  FROM claims
  WHERE id = p_claim_id;

  IF v_resolution_value IS NULL THEN
    RETURN;
  END IF;

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
    v_bonus_multiplier := 1.0 + (v_voter_record.confidence - 0.5);

    IF v_voter_record.vote_time < v_voter_record.claim_time + INTERVAL '7 days' THEN
      v_bonus_multiplier := v_bonus_multiplier * 1.2;
    END IF;

    INSERT INTO user_stats (user_id, points)
    VALUES (v_voter_record.user_id, FLOOR(v_base_points * v_bonus_multiplier))
    ON CONFLICT (user_id) DO UPDATE SET
      points = user_stats.points + FLOOR(v_base_points * v_bonus_multiplier),
      updated_at = NOW();

    PERFORM update_claim_vote_accuracy(v_voter_record.user_id);
  END LOOP;

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

-- Trigger to distribute points on resolution
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

