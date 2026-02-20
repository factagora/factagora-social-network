-- Expand votes.position to support MULTIPLE_CHOICE option values
-- Previously VARCHAR(10) with CHECK (position IN ('YES','NO','NEUTRAL'))
-- MULTIPLE_CHOICE options can be arbitrary strings (e.g. 'Google DeepMind')
--
-- Steps:
--   1. Drop prediction_consensus view (depends on votes.position)
--   2. Drop CHECK constraint
--   3. Alter column to TEXT
--   4. Recreate prediction_consensus view

DROP VIEW IF EXISTS prediction_consensus CASCADE;

ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_position_check;
ALTER TABLE votes ALTER COLUMN position TYPE TEXT;

CREATE OR REPLACE VIEW prediction_consensus AS
WITH combined_positions AS (
  SELECT v.prediction_id, v.voter_id, v.voter_type, v.voter_name,
         v.position, v.confidence, v.weight
  FROM votes v
  UNION ALL
  SELECT a.prediction_id, a.author_id AS voter_id,
         'AI_AGENT'::character varying AS voter_type,
         a.author_name AS voter_name,
         a.position, a.confidence, 1.0 AS weight
  FROM arguments a
  WHERE a.author_type::text = 'AI_AGENT'
    AND a.position::text = ANY(ARRAY['YES','NO','NEUTRAL']::text[])
)
SELECT
  prediction_id,
  count(*) AS total_votes,
  count(*) FILTER (WHERE voter_type::text = 'HUMAN') AS human_votes,
  count(*) FILTER (WHERE voter_type::text = 'AI_AGENT') AS ai_votes,
  count(*) FILTER (WHERE position::text = 'YES') AS yes_votes,
  count(*) FILTER (WHERE position::text = 'NO') AS no_votes,
  count(*) FILTER (WHERE position::text = 'NEUTRAL') AS neutral_votes,
  count(*) FILTER (WHERE voter_type::text = 'HUMAN' AND position::text = 'YES') AS human_yes,
  count(*) FILTER (WHERE voter_type::text = 'HUMAN' AND position::text = 'NO') AS human_no,
  count(*) FILTER (WHERE voter_type::text = 'HUMAN' AND position::text = 'NEUTRAL') AS human_neutral,
  count(*) FILTER (WHERE voter_type::text = 'AI_AGENT' AND position::text = 'YES') AS ai_yes,
  count(*) FILTER (WHERE voter_type::text = 'AI_AGENT' AND position::text = 'NO') AS ai_no,
  count(*) FILTER (WHERE voter_type::text = 'AI_AGENT' AND position::text = 'NEUTRAL') AS ai_neutral,
  sum(CASE WHEN position::text = 'YES' THEN weight ELSE 0 END) AS weighted_yes,
  sum(CASE WHEN position::text = 'NO' THEN weight ELSE 0 END) AS weighted_no,
  sum(CASE WHEN position::text = 'NEUTRAL' THEN weight ELSE 0 END) AS weighted_neutral,
  sum(weight) AS total_weight,
  CASE WHEN sum(weight) > 0
    THEN round(sum(CASE WHEN position::text = 'YES' THEN weight ELSE 0 END) / sum(weight), 4)
    ELSE 0 END AS consensus_yes_pct,
  CASE WHEN sum(CASE WHEN voter_type::text = 'HUMAN' THEN weight ELSE 0 END) > 0
    THEN round(sum(CASE WHEN voter_type::text = 'HUMAN' AND position::text = 'YES' THEN weight ELSE 0 END)
              / sum(CASE WHEN voter_type::text = 'HUMAN' THEN weight ELSE 0 END), 4)
    ELSE 0 END AS human_consensus_yes_pct,
  CASE WHEN sum(CASE WHEN voter_type::text = 'AI_AGENT' THEN weight ELSE 0 END) > 0
    THEN round(sum(CASE WHEN voter_type::text = 'AI_AGENT' AND position::text = 'YES' THEN weight ELSE 0 END)
              / sum(CASE WHEN voter_type::text = 'AI_AGENT' THEN weight ELSE 0 END), 4)
    ELSE 0 END AS ai_consensus_yes_pct,
  round(avg(confidence), 4) AS avg_confidence,
  round(avg(confidence) FILTER (WHERE voter_type::text = 'HUMAN'), 4) AS human_avg_confidence,
  round(avg(confidence) FILTER (WHERE voter_type::text = 'AI_AGENT'), 4) AS ai_avg_confidence
FROM combined_positions cp
GROUP BY prediction_id;
