-- ============================================
-- User Profile System Migration
-- ============================================

-- Add profile fields to users table if they don't exist
DO $$
BEGIN
  -- Bio field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'bio') THEN
    ALTER TABLE users ADD COLUMN bio TEXT;
  END IF;

  -- Location field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'location') THEN
    ALTER TABLE users ADD COLUMN location VARCHAR(100);
  END IF;

  -- Website field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'website') THEN
    ALTER TABLE users ADD COLUMN website VARCHAR(200);
  END IF;

  -- Twitter handle field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'twitter') THEN
    ALTER TABLE users ADD COLUMN twitter VARCHAR(50);
  END IF;

  -- Expertise (JSONB array)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'expertise') THEN
    ALTER TABLE users ADD COLUMN expertise JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Interests (JSONB array)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'interests') THEN
    ALTER TABLE users ADD COLUMN interests JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- ============================================
-- User Follows Table
-- ============================================

CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent self-follows and duplicate follows
  CONSTRAINT no_self_follow CHECK (follower_id != following_id),
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows(created_at DESC);

-- ============================================
-- Function: Get User Category Performance
-- ============================================

CREATE OR REPLACE FUNCTION get_user_category_performance(p_user_id UUID)
RETURNS TABLE (
  category TEXT,
  total_votes INTEGER,
  correct_votes INTEGER,
  accuracy_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.category,
    COUNT(*)::INTEGER AS total_votes,
    COUNT(*) FILTER (WHERE cv.is_correct = TRUE)::INTEGER AS correct_votes,
    ROUND(
      COALESCE(
        (COUNT(*) FILTER (WHERE cv.is_correct = TRUE)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
        0
      ),
      2
    ) AS accuracy_rate
  FROM claim_votes cv
  JOIN claims c ON cv.claim_id = c.id
  WHERE cv.user_id = p_user_id
    AND cv.is_correct IS NOT NULL  -- Only count resolved votes
  GROUP BY c.category
  HAVING COUNT(*) >= 3  -- Only show categories with at least 3 votes
  ORDER BY accuracy_rate DESC, total_votes DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_category_performance(UUID) TO authenticated, anon;

-- ============================================
-- RLS Policies for user_follows
-- ============================================

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Anyone can view follows
CREATE POLICY "Anyone can view follows"
  ON user_follows
  FOR SELECT
  USING (true);

-- Users can create follows where they are the follower
CREATE POLICY "Users can follow others"
  ON user_follows
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can delete their own follows
CREATE POLICY "Users can unfollow"
  ON user_follows
  FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE user_follows IS 'Tracks user follow relationships';
COMMENT ON COLUMN users.bio IS 'User bio/about section (max 500 chars)';
COMMENT ON COLUMN users.location IS 'User location';
COMMENT ON COLUMN users.website IS 'User website URL';
COMMENT ON COLUMN users.twitter IS 'Twitter/X handle (without @)';
COMMENT ON COLUMN users.expertise IS 'User self-declared expertise areas with levels';
COMMENT ON COLUMN users.interests IS 'User interests and topics of interest';
COMMENT ON FUNCTION get_user_category_performance IS 'Returns user voting accuracy by category';
