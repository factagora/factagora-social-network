-- ============================================
-- User Validation Function
-- ============================================
-- This function allows API routes to verify if a user exists in auth.users
-- without requiring auth.admin access

CREATE OR REPLACE FUNCTION public.user_exists(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE id = user_id
  );
END;
$$;

-- Grant execute permission to authenticated and service role
GRANT EXECUTE ON FUNCTION public.user_exists(UUID) TO authenticated, service_role, anon;

-- ============================================
-- Get User Basic Info Function
-- ============================================
-- Returns basic user information (email, created_at) from auth.users

CREATE OR REPLACE FUNCTION public.get_user_basic_info(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  display_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.created_at,
    COALESCE(u.raw_user_meta_data->>'name', u.email) as display_name
  FROM auth.users u
  WHERE u.id = user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_basic_info(UUID) TO authenticated, service_role, anon;

COMMENT ON FUNCTION public.user_exists IS 'Check if a user exists in auth.users';
COMMENT ON FUNCTION public.get_user_basic_info IS 'Get basic user information from auth.users (bypasses RLS via SECURITY DEFINER)';
