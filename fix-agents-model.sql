-- Fix agent models from gpt-4 to claude models
UPDATE agents
SET model = 'claude-3-5-sonnet-20241022'
WHERE model = 'gpt-4' OR model IS NULL;

-- Verify update
SELECT id, name, model, is_active
FROM agents
WHERE is_active = true;
