-- ============================================
-- Backfill User Profiles
-- ============================================
-- This script manually creates user_profiles for all existing auth.users
-- Run this in Supabase SQL Editor

-- First, check if user_profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
);

-- Insert profiles for all existing users that don't have one
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

-- Check how many profiles were created
SELECT COUNT(*) as total_profiles FROM user_profiles;

-- Verify your specific user profile exists
SELECT * FROM user_profiles WHERE id = '5d375915-4e84-4478-90e8-16ff299e2165';
