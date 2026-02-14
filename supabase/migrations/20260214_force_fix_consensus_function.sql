-- Force fix calculate_claim_consensus function
-- This migration drops and recreates the function with correct column name
-- to fix persistent "column cv.vote does not exist" error

-- Drop the function completely (force cascade to drop dependencies)
DROP FUNCTION IF EXISTS calculate_claim_consensus(UUID) CASCADE;

-- Recreate with correct column name (cv.vote_value)
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
  -- Count votes using correct column name: cv.vote_value
  SELECT
    COUNT(*) FILTER (WHERE cv.vote_value = TRUE),
    COUNT(*) FILTER (WHERE cv.vote_value = FALSE),
    COUNT(*)
  INTO v_true_votes, v_false_votes, v_total_votes
  FROM claim_votes cv
  WHERE cv.claim_id = p_claim_id;

  -- Calculate percentage
  v_true_pct := CASE
    WHEN v_total_votes > 0 THEN (v_true_votes::DECIMAL / v_total_votes * 100)
    ELSE 0
  END;

  -- Calculate evidence-weighted score
  SELECT
    COALESCE(
      AVG(
        CASE
          WHEN ce.supports_claim THEN ce.credibility_score
          ELSE -ce.credibility_score
        END
      ),
      0
    )
  INTO v_evidence_score
  FROM claim_evidence ce
  WHERE ce.claim_id = p_claim_id;

  -- Determine confidence level based on vote count
  v_confidence := CASE
    WHEN v_total_votes < 5 THEN 'LOW'
    WHEN v_total_votes < 20 THEN 'MEDIUM'
    ELSE 'HIGH'
  END;

  -- Return results
  RETURN QUERY SELECT
    v_true_votes,
    v_false_votes,
    v_total_votes,
    v_true_pct,
    v_confidence,
    v_evidence_score;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_claim_consensus IS 'Calculate consensus for a claim using cv.vote_value (FIXED: not cv.vote)';
