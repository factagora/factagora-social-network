-- ============================================
-- Add TIMESERIES to prediction_type enum
-- Must run this BEFORE bitcoin showcase migration
-- ============================================

-- 1. Drop existing prediction_type check constraint
ALTER TABLE predictions
  DROP CONSTRAINT IF EXISTS predictions_prediction_type_check;

-- 2. Add new constraint including TIMESERIES
ALTER TABLE predictions
  ADD CONSTRAINT predictions_prediction_type_check
  CHECK (prediction_type IN ('BINARY', 'MULTIPLE_CHOICE', 'NUMERIC', 'RANGE', 'TIMESERIES'));

-- 3. Verify constraint
DO $$
BEGIN
  RAISE NOTICE 'Successfully added TIMESERIES to prediction_type constraint';
END $$;

SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'predictions'::regclass
  AND conname = 'predictions_prediction_type_check';
