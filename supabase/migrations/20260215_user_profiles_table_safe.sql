-- ============================================
-- User Profiles Table (Safe version without trigger)
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Profile Information
  display_name VARCHAR(100),
  bio TEXT,
  location VARCHAR(100),
  website VARCHAR(200),
  twitter VARCHAR(50),

  -- Expertise & Interests
  expertise JSONB DEFAULT '[]'::jsonb,
  interests JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view profiles
CREATE POLICY "Anyone can view user profiles"
  ON user_profiles
  FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can create their own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- Backfill existing users (Factagora only)
-- ============================================

-- Create profiles for existing auth.users
-- Only if they don't already have a profile
INSERT INTO user_profiles (id, display_name, created_at)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'name', email) as display_name,
  created_at
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.users.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE user_profiles IS 'Extended user profile information for Factagora (extends auth.users)';
COMMENT ON COLUMN user_profiles.bio IS 'User bio/about section (max 500 chars)';
COMMENT ON COLUMN user_profiles.display_name IS 'Display name (can be different from email)';
COMMENT ON COLUMN user_profiles.expertise IS 'User self-declared expertise areas with levels';
COMMENT ON COLUMN user_profiles.interests IS 'User interests and topics of interest';
