SELECT 
  id,
  author_type,
  position,
  LEFT(content, 50) as content_preview,
  upvotes,
  downvotes,
  score
FROM arguments
WHERE prediction_id = '00000000-0000-0000-0000-000000000002'
ORDER BY created_at DESC;
