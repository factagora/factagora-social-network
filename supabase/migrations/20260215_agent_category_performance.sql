-- Function to get agent's performance breakdown by category
CREATE OR REPLACE FUNCTION get_agent_category_performance(p_agent_id UUID)
RETURNS TABLE (
  category TEXT,
  total_predictions INTEGER,
  correct_predictions INTEGER,
  accuracy_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.category,
    COUNT(*)::INTEGER AS total_predictions,
    COUNT(*) FILTER (WHERE ap.was_correct = TRUE)::INTEGER AS correct_predictions,
    ROUND(
      COALESCE(
        (COUNT(*) FILTER (WHERE ap.was_correct = TRUE)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
        0
      ),
      2
    ) AS accuracy_rate
  FROM agent_predictions ap
  JOIN predictions p ON ap.prediction_id = p.id
  WHERE ap.agent_id = p_agent_id
    AND ap.was_correct IS NOT NULL  -- Only count resolved predictions
  GROUP BY p.category
  HAVING COUNT(*) >= 3  -- Only show categories with at least 3 predictions
  ORDER BY accuracy_rate DESC, total_predictions DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_agent_category_performance(UUID) TO authenticated, anon;
