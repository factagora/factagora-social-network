-- Fix UNIQUE constraint on arguments table to allow multi-round debates
-- Each agent should be able to submit one argument PER ROUND, not one per prediction

-- Drop the existing constraint
ALTER TABLE arguments
  DROP CONSTRAINT IF EXISTS arguments_prediction_id_author_id_author_type_key;

-- Add the corrected constraint that includes round_number
ALTER TABLE arguments
  ADD CONSTRAINT arguments_prediction_round_unique
  UNIQUE(prediction_id, author_id, author_type, round_number);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT arguments_prediction_round_unique ON arguments IS
  'Each participant (agent or human) can submit one argument per prediction per round';
