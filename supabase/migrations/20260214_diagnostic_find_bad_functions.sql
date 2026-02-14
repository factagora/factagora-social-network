-- Diagnostic: Find all functions that reference cv.vote (incorrect column)
-- Run this in Supabase Dashboard SQL Editor to see what functions need fixing

SELECT
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND (
    pg_get_functiondef(p.oid) LIKE '%cv.vote %'
    OR pg_get_functiondef(p.oid) LIKE '%cv.vote)%'
    OR pg_get_functiondef(p.oid) LIKE '%cv.vote,%'
  );
