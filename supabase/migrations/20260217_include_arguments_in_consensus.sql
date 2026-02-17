-- Include AI agent arguments in prediction consensus calculation
-- Created: 2026-02-17
-- Purpose: Fix consensus showing 0% when AI agents have posted arguments but no votes exist

-- Drop existing view
DROP VIEW IF EXISTS prediction_consensus;

-- Recreate view to include both votes AND arguments
CREATE OR REPLACE VIEW prediction_consensus AS
WITH combined_positions AS (
  -- Include all votes
  SELECT
    v.prediction_id,
    v.voter_id,
    v.voter_type,
    v.voter_name,
    v.position,
    v.confidence,
    v.weight
  FROM votes v

  UNION ALL

  -- Include AI agent arguments as implicit "votes"
  SELECT
    a.prediction_id,
    a.author_id as voter_id,
    'AI_AGENT' as voter_type,
    a.author_name as voter_name,
    a.position,
    a.confidence,
    1.0 as weight -- Default weight for arguments (will use AI weight calculation)
  FROM arguments a
  WHERE a.author_type = 'AI_AGENT'
    AND a.position IN ('YES', 'NO', 'NEUTRAL')
)
SELECT
  cp.prediction_id,

  -- Total counts
  COUNT(*) as total_votes,
  COUNT(*) FILTER (WHERE cp.voter_type = 'HUMAN') as human_votes,
  COUNT(*) FILTER (WHERE cp.voter_type = 'AI_AGENT') as ai_votes,

  -- Position distribution (all)
  COUNT(*) FILTER (WHERE cp.position = 'YES') as yes_votes,
  COUNT(*) FILTER (WHERE cp.position = 'NO') as no_votes,
  COUNT(*) FILTER (WHERE cp.position = 'NEUTRAL') as neutral_votes,

  -- Human position distribution
  COUNT(*) FILTER (WHERE cp.voter_type = 'HUMAN' AND cp.position = 'YES') as human_yes,
  COUNT(*) FILTER (WHERE cp.voter_type = 'HUMAN' AND cp.position = 'NO') as human_no,
  COUNT(*) FILTER (WHERE cp.voter_type = 'HUMAN' AND cp.position = 'NEUTRAL') as human_neutral,

  -- AI position distribution
  COUNT(*) FILTER (WHERE cp.voter_type = 'AI_AGENT' AND cp.position = 'YES') as ai_yes,
  COUNT(*) FILTER (WHERE cp.voter_type = 'AI_AGENT' AND cp.position = 'NO') as ai_no,
  COUNT(*) FILTER (WHERE cp.voter_type = 'AI_AGENT' AND cp.position = 'NEUTRAL') as ai_neutral,

  -- Weighted consensus calculation
  SUM(CASE WHEN cp.position = 'YES' THEN cp.weight ELSE 0 END) as weighted_yes,
  SUM(CASE WHEN cp.position = 'NO' THEN cp.weight ELSE 0 END) as weighted_no,
  SUM(CASE WHEN cp.position = 'NEUTRAL' THEN cp.weight ELSE 0 END) as weighted_neutral,
  SUM(cp.weight) as total_weight,

  -- Overall consensus percentage (YES)
  CASE
    WHEN SUM(cp.weight) > 0 THEN
      ROUND((SUM(CASE WHEN cp.position = 'YES' THEN cp.weight ELSE 0 END) / SUM(cp.weight))::numeric, 4)
    ELSE 0
  END as consensus_yes_pct,

  -- Human consensus percentage (YES)
  CASE
    WHEN SUM(CASE WHEN cp.voter_type = 'HUMAN' THEN cp.weight ELSE 0 END) > 0 THEN
      ROUND((SUM(CASE WHEN cp.voter_type = 'HUMAN' AND cp.position = 'YES' THEN cp.weight ELSE 0 END) /
             SUM(CASE WHEN cp.voter_type = 'HUMAN' THEN cp.weight ELSE 0 END))::numeric, 4)
    ELSE 0
  END as human_consensus_yes_pct,

  -- AI consensus percentage (YES)
  CASE
    WHEN SUM(CASE WHEN cp.voter_type = 'AI_AGENT' THEN cp.weight ELSE 0 END) > 0 THEN
      ROUND((SUM(CASE WHEN cp.voter_type = 'AI_AGENT' AND cp.position = 'YES' THEN cp.weight ELSE 0 END) /
             SUM(CASE WHEN cp.voter_type = 'AI_AGENT' THEN cp.weight ELSE 0 END))::numeric, 4)
    ELSE 0
  END as ai_consensus_yes_pct,

  -- Average confidence
  ROUND(AVG(cp.confidence)::numeric, 4) as avg_confidence,
  ROUND(AVG(cp.confidence) FILTER (WHERE cp.voter_type = 'HUMAN')::numeric, 4) as human_avg_confidence,
  ROUND(AVG(cp.confidence) FILTER (WHERE cp.voter_type = 'AI_AGENT')::numeric, 4) as ai_avg_confidence

FROM combined_positions cp
GROUP BY cp.prediction_id;

COMMENT ON VIEW prediction_consensus IS 'Aggregated statistics from both votes and AI agent arguments per prediction';
