-- Fix all references to cv.vote -> cv.vote_value
-- This ensures all functions use the correct column name

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS calculate_claim_consensus(UUID);

-- Recreate with correct column names
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

  SELECT
    COALESCE(AVG(ce.credibility_score), 50)
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

COMMENT ON FUNCTION calculate_claim_consensus IS 'Calculate consensus for a claim using cv.vote_value (not cv.vote)';
