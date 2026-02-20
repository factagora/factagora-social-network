-- Agent Voting Migration
-- Purpose: Make AI agents cast formal votes in the votes table
-- Previously, agent positions were tracked only in arguments table
-- This migration:
--   1. Backfills votes from existing AI_AGENT arguments
--   2. Updates prediction_consensus view to use only votes table (no more double-counting)

-- ============================================================================
-- 1. Backfill votes from existing AI_AGENT arguments
--    ON CONFLICT: keep the latest argument's position (upsert)
-- ============================================================================

INSERT INTO votes (
  prediction_id,
  voter_id,
  voter_type,
  voter_name,
  position,
  confidence,
  weight,
  reasoning,
  created_at,
  updated_at
)
SELECT
  a.prediction_id,
  a.author_id            AS voter_id,
  'AI_AGENT'             AS voter_type,
  COALESCE(ag.name, 'AI Agent') AS voter_name,
  a.position,
  COALESCE(a.confidence, 0.70) AS confidence,
  1.0                    AS weight,
  a.reasoning,
  a.created_at,
  NOW()                  AS updated_at
FROM arguments a
LEFT JOIN agents ag ON ag.id = a.author_id
WHERE a.author_type = 'AI_AGENT'
ON CONFLICT (prediction_id, voter_id, voter_type)
DO UPDATE SET
  position    = EXCLUDED.position,
  confidence  = EXCLUDED.confidence,
  voter_name  = EXCLUDED.voter_name,
  reasoning   = EXCLUDED.reasoning,
  updated_at  = NOW();

-- ============================================================================
-- 2. Update prediction_consensus view
--    Remove the arguments UNION — agents now vote formally via the votes table.
--    The old UNION only counted BINARY positions (YES/NO/NEUTRAL) and would
--    double-count agents who now also have rows in the votes table.
-- ============================================================================

DROP VIEW IF EXISTS prediction_consensus CASCADE;

CREATE OR REPLACE VIEW prediction_consensus AS
SELECT
  prediction_id,

  -- Total counts
  count(*)                                            AS total_votes,
  count(*) FILTER (WHERE voter_type = 'HUMAN')        AS human_votes,
  count(*) FILTER (WHERE voter_type = 'AI_AGENT')     AS ai_votes,

  -- Position distribution (BINARY)
  count(*) FILTER (WHERE position = 'YES')            AS yes_votes,
  count(*) FILTER (WHERE position = 'NO')             AS no_votes,
  count(*) FILTER (WHERE position = 'NEUTRAL')        AS neutral_votes,

  -- Human position distribution
  count(*) FILTER (WHERE voter_type = 'HUMAN' AND position = 'YES')     AS human_yes,
  count(*) FILTER (WHERE voter_type = 'HUMAN' AND position = 'NO')      AS human_no,
  count(*) FILTER (WHERE voter_type = 'HUMAN' AND position = 'NEUTRAL') AS human_neutral,

  -- AI position distribution
  count(*) FILTER (WHERE voter_type = 'AI_AGENT' AND position = 'YES')     AS ai_yes,
  count(*) FILTER (WHERE voter_type = 'AI_AGENT' AND position = 'NO')      AS ai_no,
  count(*) FILTER (WHERE voter_type = 'AI_AGENT' AND position = 'NEUTRAL') AS ai_neutral,

  -- Weighted sums
  sum(CASE WHEN position = 'YES'     THEN weight ELSE 0 END) AS weighted_yes,
  sum(CASE WHEN position = 'NO'      THEN weight ELSE 0 END) AS weighted_no,
  sum(CASE WHEN position = 'NEUTRAL' THEN weight ELSE 0 END) AS weighted_neutral,
  sum(weight)                                                 AS total_weight,

  -- Overall consensus (YES %)
  CASE WHEN sum(weight) > 0
    THEN round(sum(CASE WHEN position = 'YES' THEN weight ELSE 0 END) / sum(weight), 4)
    ELSE 0
  END AS consensus_yes_pct,

  -- Human consensus (YES %)
  CASE WHEN sum(CASE WHEN voter_type = 'HUMAN' THEN weight ELSE 0 END) > 0
    THEN round(
      sum(CASE WHEN voter_type = 'HUMAN' AND position = 'YES' THEN weight ELSE 0 END)
      / sum(CASE WHEN voter_type = 'HUMAN' THEN weight ELSE 0 END), 4)
    ELSE 0
  END AS human_consensus_yes_pct,

  -- AI consensus (YES %)
  CASE WHEN sum(CASE WHEN voter_type = 'AI_AGENT' THEN weight ELSE 0 END) > 0
    THEN round(
      sum(CASE WHEN voter_type = 'AI_AGENT' AND position = 'YES' THEN weight ELSE 0 END)
      / sum(CASE WHEN voter_type = 'AI_AGENT' THEN weight ELSE 0 END), 4)
    ELSE 0
  END AS ai_consensus_yes_pct,

  -- Confidence averages
  round(avg(confidence), 4)                                                      AS avg_confidence,
  round(avg(confidence) FILTER (WHERE voter_type = 'HUMAN'), 4)    AS human_avg_confidence,
  round(avg(confidence) FILTER (WHERE voter_type = 'AI_AGENT'), 4) AS ai_avg_confidence

FROM votes
GROUP BY prediction_id;

COMMENT ON VIEW prediction_consensus IS
  'Aggregated vote statistics per prediction. AI agents now vote formally via the votes table.';
