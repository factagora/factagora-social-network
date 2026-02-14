-- ============================================
-- Timeseries Architecture for Multi-Type Predictions
-- Supports: BINARY, NUMERIC, MULTIPLE_CHOICE, RANGE
-- Phase 1: Focus on BINARY, prepare for future expansion
-- ============================================

-- 1. Extend predictions table with prediction type
ALTER TABLE predictions
  ADD COLUMN IF NOT EXISTS prediction_type VARCHAR(20) DEFAULT 'BINARY'
    CHECK (prediction_type IN ('BINARY', 'MULTIPLE_CHOICE', 'NUMERIC', 'RANGE'));

ALTER TABLE predictions
  ADD COLUMN IF NOT EXISTS numeric_resolution DECIMAL(15,4),
  ADD COLUMN IF NOT EXISTS prediction_options JSONB,
  ADD COLUMN IF NOT EXISTS numeric_range JSONB;

COMMENT ON COLUMN predictions.prediction_type IS 'Type of prediction: BINARY (yes/no), NUMERIC (continuous value), MULTIPLE_CHOICE (discrete options), RANGE (bounded numeric)';
COMMENT ON COLUMN predictions.numeric_resolution IS 'Final numeric value for NUMERIC/RANGE type predictions';
COMMENT ON COLUMN predictions.prediction_options IS 'Options for MULTIPLE_CHOICE type: [{"id": "A", "label": "Option A"}, ...]';
COMMENT ON COLUMN predictions.numeric_range IS 'Range constraints for NUMERIC/RANGE: {"min": 0, "max": 100, "unit": "USD"}';

-- 2. Extend arguments table for multi-type predictions
ALTER TABLE arguments
  ADD COLUMN IF NOT EXISTS numeric_value DECIMAL(15,4),
  ADD COLUMN IF NOT EXISTS option_id VARCHAR(50);

COMMENT ON COLUMN arguments.numeric_value IS 'Predicted numeric value for NUMERIC/RANGE type predictions';
COMMENT ON COLUMN arguments.option_id IS 'Selected option ID for MULTIPLE_CHOICE type predictions';

-- 3. Create vote_history table for timeseries data
CREATE TABLE IF NOT EXISTS vote_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  snapshot_time TIMESTAMPTZ NOT NULL,

  -- Binary prediction fields (Phase 1 - Active)
  yes_percentage DECIMAL(5,2),
  no_percentage DECIMAL(5,2),
  yes_count INTEGER,
  no_count INTEGER,

  -- Numeric prediction fields (Phase 2 - Prepared)
  avg_prediction DECIMAL(15,4),
  median_prediction DECIMAL(15,4),
  std_deviation DECIMAL(15,4),
  percentile_25 DECIMAL(15,4),
  percentile_75 DECIMAL(15,4),
  min_prediction DECIMAL(15,4),
  max_prediction DECIMAL(15,4),

  -- Multiple choice fields (Phase 3 - Prepared)
  option_distribution JSONB,

  -- Common metadata
  total_predictions INTEGER NOT NULL DEFAULT 0,
  ai_agent_count INTEGER NOT NULL DEFAULT 0,
  human_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Add regular column for hour truncation (for efficient deduplication)
ALTER TABLE vote_history
  ADD COLUMN IF NOT EXISTS snapshot_hour TIMESTAMPTZ;

-- 5. Create indexes for efficient timeseries queries
CREATE INDEX IF NOT EXISTS idx_vote_history_prediction_time
  ON vote_history(prediction_id, snapshot_time DESC);

CREATE INDEX IF NOT EXISTS idx_vote_history_snapshot_time
  ON vote_history(snapshot_time DESC);

-- 6. Create unique constraint to prevent duplicate hourly snapshots
CREATE UNIQUE INDEX IF NOT EXISTS idx_vote_history_unique_snapshot
  ON vote_history(prediction_id, snapshot_hour);

COMMENT ON TABLE vote_history IS 'Timeseries snapshots of prediction statistics for chart visualization';
COMMENT ON COLUMN vote_history.snapshot_time IS 'Timestamp of this snapshot (hourly granularity)';
COMMENT ON COLUMN vote_history.snapshot_hour IS 'Hour-truncated timestamp for deduplication (set manually)';
COMMENT ON COLUMN vote_history.option_distribution IS 'JSON object with option percentages: {"A": 40.5, "B": 30.2, "C": 29.3}';

-- 6. Create function to aggregate current prediction state
CREATE OR REPLACE FUNCTION calculate_prediction_snapshot(pred_id UUID)
RETURNS TABLE (
  yes_pct DECIMAL(5,2),
  no_pct DECIMAL(5,2),
  yes_cnt INTEGER,
  no_cnt INTEGER,
  total_cnt INTEGER,
  ai_cnt INTEGER,
  human_cnt INTEGER,
  avg_numeric DECIMAL(15,4),
  median_numeric DECIMAL(15,4)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Binary statistics
    ROUND(COUNT(*) FILTER (WHERE position = 'YES') * 100.0 / NULLIF(COUNT(*), 0), 2)::DECIMAL(5,2) as yes_pct,
    ROUND(COUNT(*) FILTER (WHERE position = 'NO') * 100.0 / NULLIF(COUNT(*), 0), 2)::DECIMAL(5,2) as no_pct,
    COUNT(*) FILTER (WHERE position = 'YES')::INTEGER as yes_cnt,
    COUNT(*) FILTER (WHERE position = 'NO')::INTEGER as no_cnt,

    -- Counts
    COUNT(*)::INTEGER as total_cnt,
    COUNT(*) FILTER (WHERE author_type = 'AI_AGENT')::INTEGER as ai_cnt,
    COUNT(*) FILTER (WHERE author_type = 'HUMAN')::INTEGER as human_cnt,

    -- Numeric statistics (for future use)
    AVG(numeric_value)::DECIMAL(15,4) as avg_numeric,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY numeric_value)::DECIMAL(15,4) as median_numeric
  FROM arguments
  WHERE prediction_id = pred_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_prediction_snapshot IS 'Calculate current aggregated statistics for a prediction';

-- 7. Create function to create snapshot
CREATE OR REPLACE FUNCTION create_vote_history_snapshot(pred_id UUID)
RETURNS UUID AS $$
DECLARE
  snapshot_id UUID;
  stats RECORD;
  truncated_hour TIMESTAMPTZ;
BEGIN
  -- Get current statistics
  SELECT * INTO stats FROM calculate_prediction_snapshot(pred_id);

  -- Calculate truncated hour
  truncated_hour := date_trunc('hour', NOW());

  -- Insert snapshot (ON CONFLICT prevents duplicates within same hour)
  INSERT INTO vote_history (
    prediction_id,
    snapshot_time,
    snapshot_hour,
    yes_percentage,
    no_percentage,
    yes_count,
    no_count,
    total_predictions,
    ai_agent_count,
    human_count,
    avg_prediction,
    median_prediction
  ) VALUES (
    pred_id,
    truncated_hour,
    truncated_hour,
    stats.yes_pct,
    stats.no_pct,
    stats.yes_cnt,
    stats.no_cnt,
    stats.total_cnt,
    stats.ai_cnt,
    stats.human_cnt,
    stats.avg_numeric,
    stats.median_numeric
  )
  ON CONFLICT (prediction_id, snapshot_hour)
  DO UPDATE SET
    yes_percentage = EXCLUDED.yes_percentage,
    no_percentage = EXCLUDED.no_percentage,
    yes_count = EXCLUDED.yes_count,
    no_count = EXCLUDED.no_count,
    total_predictions = EXCLUDED.total_predictions,
    ai_agent_count = EXCLUDED.ai_agent_count,
    human_count = EXCLUDED.human_count,
    avg_prediction = EXCLUDED.avg_prediction,
    median_prediction = EXCLUDED.median_prediction,
    updated_at = NOW()
  RETURNING id INTO snapshot_id;

  RETURN snapshot_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_vote_history_snapshot IS 'Create or update hourly snapshot for a prediction';

-- 8. Create trigger to auto-create snapshots when arguments are added
CREATE OR REPLACE FUNCTION trigger_create_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  -- Create snapshot for the prediction (async, don't wait)
  PERFORM create_vote_history_snapshot(NEW.prediction_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'arguments_snapshot_trigger'
  ) THEN
    CREATE TRIGGER arguments_snapshot_trigger
      AFTER INSERT OR UPDATE ON arguments
      FOR EACH ROW
      EXECUTE FUNCTION trigger_create_snapshot();
  END IF;
END $$;

COMMENT ON TRIGGER arguments_snapshot_trigger ON arguments IS 'Automatically create vote history snapshot when arguments change';

-- 9. Backfill historical snapshots for existing predictions (optional)
-- This creates one snapshot per prediction based on current state
DO $$
DECLARE
  current_hour TIMESTAMPTZ := date_trunc('hour', NOW());
BEGIN
  INSERT INTO vote_history (
    prediction_id,
    snapshot_time,
    snapshot_hour,
    yes_percentage,
    no_percentage,
    yes_count,
    no_count,
    total_predictions,
    ai_agent_count,
    human_count
  )
  SELECT
    p.id as prediction_id,
    current_hour as snapshot_time,
    current_hour as snapshot_hour,
    COALESCE(ROUND(COUNT(*) FILTER (WHERE a.position = 'YES') * 100.0 / NULLIF(COUNT(*), 0), 2), 0) as yes_percentage,
    COALESCE(ROUND(COUNT(*) FILTER (WHERE a.position = 'NO') * 100.0 / NULLIF(COUNT(*), 0), 2), 0) as no_percentage,
    COUNT(*) FILTER (WHERE a.position = 'YES') as yes_count,
    COUNT(*) FILTER (WHERE a.position = 'NO') as no_count,
    COUNT(*) as total_predictions,
    COUNT(*) FILTER (WHERE a.author_type = 'AI_AGENT') as ai_agent_count,
    COUNT(*) FILTER (WHERE a.author_type = 'HUMAN') as human_count
  FROM predictions p
  LEFT JOIN arguments a ON a.prediction_id = p.id
  WHERE p.prediction_type = 'BINARY' OR p.prediction_type IS NULL
  GROUP BY p.id
  HAVING COUNT(*) > 0
  ON CONFLICT (prediction_id, snapshot_hour) DO NOTHING;
END $$;

-- 10. Verify installation
DO $$
DECLARE
  table_count INTEGER;
  snapshot_count INTEGER;
BEGIN
  -- Check if table exists
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_name = 'vote_history';

  -- Check snapshot count
  SELECT COUNT(*) INTO snapshot_count
  FROM vote_history;

  RAISE NOTICE '✓ vote_history table: % (snapshots: %)',
    CASE WHEN table_count > 0 THEN 'EXISTS' ELSE 'MISSING' END,
    snapshot_count;
END $$;
