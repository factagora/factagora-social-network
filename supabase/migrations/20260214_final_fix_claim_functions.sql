-- FINAL FIX: Drop and recreate ALL claim-related functions and triggers
-- Fixed: cv.vote -> cv.vote_value
-- Fixed: Removed non-existent ce.supports_claim column reference

-- ============================================================================
-- 1. DROP ALL TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Drop all triggers on claim_votes
DROP TRIGGER IF EXISTS after_vote_change ON claim_votes CASCADE;
DROP TRIGGER IF EXISTS trigger_update_claim_vote_stats ON claim_votes CASCADE;
DROP TRIGGER IF EXISTS trigger_update_claim_votes_updated_at ON claim_votes CASCADE;

-- Drop all claim consensus related functions
DROP FUNCTION IF EXISTS calculate_claim_consensus(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_claim_consensus(UUID) CASCADE;
DROP FUNCTION IF EXISTS trigger_update_consensus() CASCADE;
DROP FUNCTION IF EXISTS update_claim_vote_stats() CASCADE;
DROP FUNCTION IF EXISTS update_claim_votes_updated_at() CASCADE;

-- ============================================================================
-- 2. RECREATE ESSENTIAL FUNCTIONS WITH CORRECT COLUMN NAMES
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_claim_votes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update vote statistics in claims table
CREATE OR REPLACE FUNCTION update_claim_vote_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE claims
  SET
    true_votes = (
      SELECT COUNT(*)
      FROM claim_votes
      WHERE claim_id = COALESCE(NEW.claim_id, OLD.claim_id)
        AND vote_value = TRUE
    ),
    false_votes = (
      SELECT COUNT(*)
      FROM claim_votes
      WHERE claim_id = COALESCE(NEW.claim_id, OLD.claim_id)
        AND vote_value = FALSE
    ),
    verifier_count = (
      SELECT COUNT(DISTINCT user_id)
      FROM claim_votes
      WHERE claim_id = COALESCE(NEW.claim_id, OLD.claim_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.claim_id, OLD.claim_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate claim consensus (FIXED: uses cv.vote_value)
CREATE OR REPLACE FUNCTION calculate_claim_consensus(p_claim_id UUID)
RETURNS TABLE(
  true_votes INTEGER,
  false_votes INTEGER,
  total_votes INTEGER,
  true_percentage DECIMAL(5,2),
  confidence_level TEXT,
  average_credibility DECIMAL(5,2)
) AS $$
DECLARE
  v_true_votes INTEGER;
  v_false_votes INTEGER;
  v_total_votes INTEGER;
  v_true_pct DECIMAL(5,2);
  v_evidence_score DECIMAL(5,2);
  v_confidence TEXT;
BEGIN
  -- Count votes using CORRECT column name: cv.vote_value
  SELECT
    COUNT(*) FILTER (WHERE cv.vote_value = TRUE),
    COUNT(*) FILTER (WHERE cv.vote_value = FALSE),
    COUNT(*)
  INTO v_true_votes, v_false_votes, v_total_votes
  FROM claim_votes cv
  WHERE cv.claim_id = p_claim_id;

  v_true_pct := CASE
    WHEN v_total_votes > 0 THEN (v_true_votes::DECIMAL / v_total_votes * 100)
    ELSE 0
  END;

  -- Calculate average credibility score (simple average)
  SELECT COALESCE(AVG(ce.credibility_score), 50)
  INTO v_evidence_score
  FROM claim_evidence ce
  WHERE ce.claim_id = p_claim_id;

  v_confidence := CASE
    WHEN v_total_votes < 5 THEN 'LOW'
    WHEN v_total_votes < 20 THEN 'MEDIUM'
    ELSE 'HIGH'
  END;

  RETURN QUERY SELECT
    v_true_votes,
    v_false_votes,
    v_total_votes,
    v_true_pct,
    v_confidence,
    v_evidence_score;
END;
$$ LANGUAGE plpgsql;

-- Function: Update consensus (FIXED: uses cv.vote_value, removed supports_claim)
CREATE OR REPLACE FUNCTION update_claim_consensus(p_claim_id UUID)
RETURNS VOID AS $$
DECLARE
  v_true_votes INTEGER;
  v_false_votes INTEGER;
  v_total_votes INTEGER;
  v_true_pct DECIMAL(5,2);
  v_evidence_score DECIMAL(5,2);
  v_confidence TEXT;
BEGIN
  -- Count votes using CORRECT column name: cv.vote_value
  SELECT
    COUNT(*) FILTER (WHERE cv.vote_value = TRUE),
    COUNT(*) FILTER (WHERE cv.vote_value = FALSE),
    COUNT(*)
  INTO v_true_votes, v_false_votes, v_total_votes
  FROM claim_votes cv
  WHERE cv.claim_id = p_claim_id;

  v_true_pct := CASE
    WHEN v_total_votes > 0 THEN (v_true_votes::DECIMAL / v_total_votes * 100)
    ELSE 0
  END;

  -- Calculate average credibility score (simple average, no supports_claim)
  SELECT COALESCE(AVG(ce.credibility_score), 0)
  INTO v_evidence_score
  FROM claim_evidence ce
  WHERE ce.claim_id = p_claim_id;

  v_confidence := CASE
    WHEN v_total_votes >= 10 AND ABS(v_true_pct - 50) >= 30 THEN 'HIGH'
    WHEN v_total_votes >= 5 AND ABS(v_true_pct - 50) >= 20 THEN 'MEDIUM'
    WHEN v_total_votes >= 2 THEN 'LOW'
    ELSE 'NONE'
  END;

  -- Upsert into claim_consensus table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'claim_consensus') THEN
    INSERT INTO claim_consensus (
      claim_id,
      true_votes,
      false_votes,
      total_votes,
      true_percentage,
      evidence_weighted_score,
      consensus_reached,
      confidence_level
    ) VALUES (
      p_claim_id,
      v_true_votes,
      v_false_votes,
      v_total_votes,
      v_true_pct,
      v_evidence_score,
      (v_true_pct >= 70 OR v_true_pct <= 30) AND v_total_votes >= 5,
      v_confidence
    )
    ON CONFLICT (claim_id) DO UPDATE SET
      true_votes = EXCLUDED.true_votes,
      false_votes = EXCLUDED.false_votes,
      total_votes = EXCLUDED.total_votes,
      true_percentage = EXCLUDED.true_percentage,
      evidence_weighted_score = EXCLUDED.evidence_weighted_score,
      consensus_reached = EXCLUDED.consensus_reached,
      confidence_level = EXCLUDED.confidence_level,
      updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Trigger function for consensus updates
CREATE OR REPLACE FUNCTION trigger_update_consensus()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_claim_consensus(NEW.claim_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. RECREATE TRIGGERS
-- ============================================================================

-- Trigger: Update updated_at timestamp
CREATE TRIGGER trigger_update_claim_votes_updated_at
  BEFORE UPDATE ON claim_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_claim_votes_updated_at();

-- Trigger: Update vote statistics
CREATE TRIGGER trigger_update_claim_vote_stats
  AFTER INSERT OR UPDATE OR DELETE ON claim_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_claim_vote_stats();

-- Trigger: Update consensus (only if claim_consensus table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'claim_consensus') THEN
    EXECUTE 'CREATE TRIGGER after_vote_change
      AFTER INSERT OR UPDATE ON claim_votes
      FOR EACH ROW
      EXECUTE FUNCTION trigger_update_consensus()';
  END IF;
END $$;

-- ============================================================================
-- 4. COMMENTS
-- ============================================================================

COMMENT ON FUNCTION calculate_claim_consensus IS 'FIXED: Uses cv.vote_value (not cv.vote), removed supports_claim reference';
COMMENT ON FUNCTION update_claim_consensus IS 'FIXED: Uses cv.vote_value (not cv.vote), removed supports_claim reference';
COMMENT ON FUNCTION update_claim_vote_stats IS 'Updates vote counts in claims table using vote_value';
