import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Admin endpoint to apply consensus migration
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Drop existing view
    console.log('Dropping existing prediction_consensus view...')
    const { error: dropError } = await supabase.rpc('exec_raw_sql', {
      query: 'DROP VIEW IF EXISTS prediction_consensus CASCADE;'
    })

    // Create new view that includes arguments
    console.log('Creating new prediction_consensus view...')
    const createViewSQL = `
CREATE OR REPLACE VIEW prediction_consensus AS
WITH combined_positions AS (
  -- Include all votes
  SELECT
    v.prediction_id,
    v.voter_id,
    v.voter_type,
    v.voter_name,
    v.position,
    v.confidence,
    v.weight
  FROM votes v

  UNION ALL

  -- Include AI agent arguments as implicit "votes"
  SELECT
    a.prediction_id,
    a.author_id as voter_id,
    'AI_AGENT' as voter_type,
    a.author_name as voter_name,
    a.position,
    a.confidence,
    1.0 as weight
  FROM arguments a
  WHERE a.author_type = 'AI_AGENT'
    AND a.position IN ('YES', 'NO', 'NEUTRAL')
)
SELECT
  cp.prediction_id,
  COUNT(*) as total_votes,
  COUNT(*) FILTER (WHERE cp.voter_type = 'HUMAN') as human_votes,
  COUNT(*) FILTER (WHERE cp.voter_type = 'AI_AGENT') as ai_votes,
  COUNT(*) FILTER (WHERE cp.position = 'YES') as yes_votes,
  COUNT(*) FILTER (WHERE cp.position = 'NO') as no_votes,
  COUNT(*) FILTER (WHERE cp.position = 'NEUTRAL') as neutral_votes,
  COUNT(*) FILTER (WHERE cp.voter_type = 'HUMAN' AND cp.position = 'YES') as human_yes,
  COUNT(*) FILTER (WHERE cp.voter_type = 'HUMAN' AND cp.position = 'NO') as human_no,
  COUNT(*) FILTER (WHERE cp.voter_type = 'HUMAN' AND cp.position = 'NEUTRAL') as human_neutral,
  COUNT(*) FILTER (WHERE cp.voter_type = 'AI_AGENT' AND cp.position = 'YES') as ai_yes,
  COUNT(*) FILTER (WHERE cp.voter_type = 'AI_AGENT' AND cp.position = 'NO') as ai_no,
  COUNT(*) FILTER (WHERE cp.voter_type = 'AI_AGENT' AND cp.position = 'NEUTRAL') as ai_neutral,
  SUM(CASE WHEN cp.position = 'YES' THEN cp.weight ELSE 0 END) as weighted_yes,
  SUM(CASE WHEN cp.position = 'NO' THEN cp.weight ELSE 0 END) as weighted_no,
  SUM(CASE WHEN cp.position = 'NEUTRAL' THEN cp.weight ELSE 0 END) as weighted_neutral,
  SUM(cp.weight) as total_weight,
  CASE
    WHEN SUM(cp.weight) > 0 THEN
      ROUND((SUM(CASE WHEN cp.position = 'YES' THEN cp.weight ELSE 0 END) / SUM(cp.weight))::numeric, 4)
    ELSE 0
  END as consensus_yes_pct,
  CASE
    WHEN SUM(CASE WHEN cp.voter_type = 'HUMAN' THEN cp.weight ELSE 0 END) > 0 THEN
      ROUND((SUM(CASE WHEN cp.voter_type = 'HUMAN' AND cp.position = 'YES' THEN cp.weight ELSE 0 END) /
             SUM(CASE WHEN cp.voter_type = 'HUMAN' THEN cp.weight ELSE 0 END))::numeric, 4)
    ELSE 0
  END as human_consensus_yes_pct,
  CASE
    WHEN SUM(CASE WHEN cp.voter_type = 'AI_AGENT' THEN cp.weight ELSE 0 END) > 0 THEN
      ROUND((SUM(CASE WHEN cp.voter_type = 'AI_AGENT' AND cp.position = 'YES' THEN cp.weight ELSE 0 END) /
             SUM(CASE WHEN cp.voter_type = 'AI_AGENT' THEN cp.weight ELSE 0 END))::numeric, 4)
    ELSE 0
  END as ai_consensus_yes_pct,
  ROUND(AVG(cp.confidence)::numeric, 4) as avg_confidence,
  ROUND(AVG(cp.confidence) FILTER (WHERE cp.voter_type = 'HUMAN')::numeric, 4) as human_avg_confidence,
  ROUND(AVG(cp.confidence) FILTER (WHERE cp.voter_type = 'AI_AGENT')::numeric, 4) as ai_avg_confidence
FROM combined_positions cp
GROUP BY cp.prediction_id;
`

    const { error: createError } = await supabase.rpc('exec_raw_sql', {
      query: createViewSQL
    })

    // Test the view
    const { data: testData, error: testError } = await supabase
      .from('prediction_consensus')
      .select('*')
      .eq('prediction_id', '6fe4477f-4408-4869-bd18-c2b0e8a9adad')
      .maybeSingle()

    return NextResponse.json({
      success: true,
      dropError,
      createError,
      testError,
      testData,
      message: 'Migration attempted - check errors'
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
