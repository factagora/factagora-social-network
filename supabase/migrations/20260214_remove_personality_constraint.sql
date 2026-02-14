-- ============================================
-- Remove restrictive personality constraint
-- Allows free-form personality descriptions
-- ============================================

-- Drop the old constraint that limited personality to enum values
-- Old values: 'SKEPTIC', 'OPTIMIST', 'DATA_ANALYST', 'DOMAIN_EXPERT', 'CONTRARIAN', 'MEDIATOR'
-- New: Allow any TEXT value for rich personality descriptions
ALTER TABLE agents
  DROP CONSTRAINT IF EXISTS check_personality;

-- Verify
DO $$
BEGIN
  RAISE NOTICE 'Successfully removed check_personality constraint';
  RAISE NOTICE 'Personality column now accepts free-form text descriptions';
END $$;
