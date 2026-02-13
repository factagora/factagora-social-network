-- Create sample data for testing Round Orchestrator
-- Run this in Supabase SQL Editor

-- ============================================================================
-- 1. CHECK IF AGENTS EXIST
-- ============================================================================

-- Sample agents should already exist from migration 20260210_multi_agent_system.sql
-- Check with: SELECT * FROM agents WHERE id LIKE '10000000%';

-- If not, create them:
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get first user (or use your user ID)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  -- If no user exists, you'll need to create one first
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please create a user first via Supabase Auth.';
  END IF;

  -- Sample MANAGED agent (Skeptic)
  INSERT INTO agents (
    id,
    user_id,
    name,
    description,
    model,
    personality,
    temperature,
    mode,
    system_prompt,
    is_active
  ) VALUES (
    '10000000-0000-0000-0000-000000000001',
    v_user_id,
    'Skeptic Bot',
    'A critical thinker who questions assumptions and demands rigorous evidence.',
    'claude-3-5-sonnet-20241022',
    'SKEPTIC',
    0.2,
    'MANAGED',
    'You are a skeptical AI agent. Question assumptions, demand evidence, and highlight weaknesses in arguments. Be conservative with confidence scores.',
    true
  ) ON CONFLICT (id) DO NOTHING;

  -- Sample MANAGED agent (Optimist)
  INSERT INTO agents (
    id,
    user_id,
    name,
    description,
    model,
    personality,
    temperature,
    mode,
    system_prompt,
    is_active
  ) VALUES (
    '10000000-0000-0000-0000-000000000002',
    v_user_id,
    'Optimist Bot',
    'An enthusiastic agent who sees potential and emphasizes positive indicators.',
    'claude-3-5-sonnet-20241022',
    'OPTIMIST',
    0.7,
    'MANAGED',
    'You are an optimistic AI agent. Focus on potential, positive trends, and growth opportunities. Be confident but not reckless.',
    true
  ) ON CONFLICT (id) DO NOTHING;

  -- Sample MANAGED agent (Data Analyst)
  INSERT INTO agents (
    id,
    user_id,
    name,
    description,
    model,
    personality,
    temperature,
    mode,
    system_prompt,
    is_active
  ) VALUES (
    '10000000-0000-0000-0000-000000000003',
    v_user_id,
    'Data Analyst Bot',
    'A statistical reasoning agent using pure data analysis.',
    'claude-3-5-sonnet-20241022',
    'DATA_ANALYST',
    0.3,
    'MANAGED',
    'You are a data-driven AI agent. Base all conclusions on quantitative data and statistics. Use precise confidence scores.',
    true
  ) ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Agents created successfully';
END $$;

-- ============================================================================
-- 2. CREATE SAMPLE PREDICTION (Future Event)
-- ============================================================================

-- Prediction: AGI by end of 2026
INSERT INTO predictions (
  id,
  title,
  description,
  category,
  deadline,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Will AGI be achieved by end of 2026?',
  'Artificial General Intelligence (AGI) is defined as an AI system that can perform any intellectual task that a human can do, with similar or better efficiency. This includes:

- Understanding and learning any intellectual task
- Reasoning across multiple domains without specific training
- Generalizing knowledge from one domain to another
- Demonstrating common sense reasoning
- Self-awareness and goal-directed behavior

For this prediction to resolve as YES, a credible AI research organization (OpenAI, Google DeepMind, Anthropic, Meta AI, or equivalent) must announce and demonstrate an AI system that:

1. Can pass a comprehensive AGI test suite covering multiple cognitive domains
2. Is independently verified by at least 3 leading AI researchers
3. Shows human-level or better performance on tasks it was not explicitly trained for
4. Demonstrates transfer learning across fundamentally different domains

Timeline: Deadline is December 31, 2026, 23:59:59 UTC.',
  'tech',
  '2026-12-31T23:59:59Z',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- ============================================================================
-- 3. CREATE SAMPLE CLAIM (Fact Check)
-- ============================================================================

-- Claim: Tesla Q4 2025 Revenue verification
INSERT INTO predictions (
  id,
  title,
  description,
  category,
  deadline,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Did Tesla achieve $30B+ revenue in Q4 2025?',
  'Tesla Inc. (NASDAQ: TSLA) Q4 2025 earnings report verification.

**Claim**: Tesla achieved over $30 billion in revenue during Q4 2025.

**Source**: Multiple financial news outlets reported this figure based on Tesla''s official earnings release on January 29, 2026.

**Verification Requirements**:
For this claim to resolve as TRUE, we need to verify:

1. Official Tesla 10-Q or 10-K SEC filing showing Q4 2025 revenue
2. The revenue figure must be $30 billion or higher
3. The filing must be from the official SEC EDGAR database
4. No subsequent restatements that reduce the figure below $30B

**Available Evidence**:
- Tesla''s official investor relations website
- SEC EDGAR filings (https://www.sec.gov/edgar)
- Tesla''s Q4 2025 earnings call transcript
- Third-party financial data providers (Bloomberg, Reuters)

**Resolution Criteria**:
- YES: Official SEC filing confirms revenue ≥ $30B
- NO: Official SEC filing shows revenue < $30B or no filing found
- NEUTRAL: Insufficient evidence or conflicting reports

Timeline: This is a fact-checking claim about a past event. Deadline is set to allow sufficient time for official SEC filings to become available.',
  'economics',
  '2026-03-31T23:59:59Z',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check agents
SELECT
  id,
  name,
  personality,
  mode,
  is_active
FROM agents
WHERE id LIKE '10000000%'
ORDER BY name;

-- Check predictions
SELECT
  id,
  title,
  category,
  deadline,
  created_at
FROM predictions
WHERE id LIKE '00000000%'
ORDER BY created_at;

-- Print IDs for testing
DO $$
DECLARE
  v_pred_count INTEGER;
  v_agent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_pred_count FROM predictions WHERE id LIKE '00000000%';
  SELECT COUNT(*) INTO v_agent_count FROM agents WHERE id LIKE '10000000%';

  RAISE NOTICE '================================';
  RAISE NOTICE 'Sample data created successfully!';
  RAISE NOTICE '================================';
  RAISE NOTICE 'Predictions: %', v_pred_count;
  RAISE NOTICE 'Agents: %', v_agent_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Test with:';
  RAISE NOTICE '  npx tsx lib/agents/test-orchestrator.ts 00000000-0000-0000-0000-000000000001';
  RAISE NOTICE '  npx tsx lib/agents/test-orchestrator.ts 00000000-0000-0000-0000-000000000002';
END $$;
