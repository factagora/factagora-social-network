-- Add resolved_option_id column for MULTIPLE_CHOICE prediction resolution
-- BINARY uses resolution_value (BOOLEAN), NUMERIC/TIMESERIES uses numeric_resolution (DECIMAL),
-- MULTIPLE_CHOICE needs a string column to store the winning option.

ALTER TABLE predictions
  ADD COLUMN IF NOT EXISTS resolved_option_id VARCHAR(50);

COMMENT ON COLUMN predictions.resolved_option_id IS 'Winning option ID/label for MULTIPLE_CHOICE predictions';
