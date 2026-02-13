-- ========================================
-- User Tiers & Permissions System
-- ========================================

-- Add tier column to users table
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'FREE'
  CHECK (tier IN ('FREE', 'PREMIUM', 'ADMIN'));

-- Add agenda creation tracking
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS agenda_creation_count INTEGER DEFAULT 0;

ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS agenda_creation_reset_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_tier ON auth.users(tier);

-- ========================================
-- Monthly Creation Limit Check Function
-- ========================================
CREATE OR REPLACE FUNCTION check_agenda_creation_limit(
  p_user_id UUID,
  p_user_tier VARCHAR(20)
)
RETURNS TABLE(
  allowed BOOLEAN,
  requires_approval BOOLEAN,
  remaining INTEGER,
  reset_date TIMESTAMPTZ
) AS $$
DECLARE
  v_count INTEGER;
  v_reset_date TIMESTAMPTZ;
  v_month_start TIMESTAMPTZ;
BEGIN
  -- PREMIUM and ADMIN have unlimited creation
  IF p_user_tier IN ('PREMIUM', 'ADMIN') THEN
    RETURN QUERY SELECT
      TRUE as allowed,
      FALSE as requires_approval,
      999 as remaining,
      NULL::TIMESTAMPTZ as reset_date;
    RETURN;
  END IF;

  -- Get current user stats
  SELECT agenda_creation_count, agenda_creation_reset_at
  INTO v_count, v_reset_date
  FROM auth.users
  WHERE id = p_user_id;

  -- Calculate month start
  v_month_start := date_trunc('month', NOW());

  -- Reset if month has changed
  IF v_reset_date < v_month_start THEN
    UPDATE auth.users
    SET
      agenda_creation_count = 0,
      agenda_creation_reset_at = NOW()
    WHERE id = p_user_id;

    v_count := 0;
  END IF;

  -- FREE users: 3 per month + requires approval
  RETURN QUERY SELECT
    (v_count < 3) as allowed,
    TRUE as requires_approval,
    GREATEST(3 - v_count, 0) as remaining,
    (v_month_start + INTERVAL '1 month') as reset_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- Increment Creation Count Function
-- ========================================
CREATE OR REPLACE FUNCTION increment_agenda_creation_count(
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE auth.users
  SET agenda_creation_count = agenda_creation_count + 1
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- Grant permissions
-- ========================================
GRANT EXECUTE ON FUNCTION check_agenda_creation_limit(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_agenda_creation_count(UUID) TO authenticated;
