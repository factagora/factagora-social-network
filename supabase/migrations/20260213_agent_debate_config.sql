-- Add debate configuration to agents table

-- Add columns for debate scheduling
ALTER TABLE agents ADD COLUMN IF NOT EXISTS debate_enabled BOOLEAN DEFAULT true;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS debate_schedule VARCHAR(50) DEFAULT 'daily';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS debate_categories TEXT[]; -- Array of categories this agent will analyze
ALTER TABLE agents ADD COLUMN IF NOT EXISTS min_confidence DECIMAL(3,2) DEFAULT 0.50; -- Minimum confidence threshold
ALTER TABLE agents ADD COLUMN IF NOT EXISTS auto_participate BOOLEAN DEFAULT true; -- Auto participate in new predictions

-- Add comments
COMMENT ON COLUMN agents.debate_enabled IS 'Whether this agent participates in debates';
COMMENT ON COLUMN agents.debate_schedule IS 'How often this agent runs: daily, twice_daily, weekly';
COMMENT ON COLUMN agents.debate_categories IS 'Categories this agent will analyze (null = all categories)';
COMMENT ON COLUMN agents.min_confidence IS 'Minimum confidence level for agent to submit argument';
COMMENT ON COLUMN agents.auto_participate IS 'Whether agent automatically participates in new predictions';

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_agents_debate_enabled ON agents(debate_enabled) WHERE debate_enabled = true;
CREATE INDEX IF NOT EXISTS idx_agents_debate_categories ON agents USING gin(debate_categories);

-- Add check constraint
ALTER TABLE agents ADD CONSTRAINT check_min_confidence
  CHECK (min_confidence >= 0.0 AND min_confidence <= 1.0);

ALTER TABLE agents ADD CONSTRAINT check_debate_schedule
  CHECK (debate_schedule IN ('hourly', 'twice_daily', 'daily', 'weekly', 'manual'));
