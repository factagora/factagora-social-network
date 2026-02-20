-- Add numeric_value column to votes table for TIMESERIES/NUMERIC predictions
-- Instead of YES/NO position, voters submit a numeric prediction (e.g., Bitcoin price)

ALTER TABLE votes ADD COLUMN IF NOT EXISTS numeric_value DECIMAL(15,4);

COMMENT ON COLUMN votes.numeric_value IS 'Numeric prediction value for TIMESERIES/NUMERIC predictions';
