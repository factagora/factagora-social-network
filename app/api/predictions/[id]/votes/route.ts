import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { VotePosition } from '@/src/types/voting'

// GET /api/predictions/[id]/votes - Get all votes and consensus
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: predictionId } = await params
    const supabase = createAdminClient()

    // Check if prediction exists
    const { data: prediction, error: predError } = await supabase
      .from('predictions')
      .select('id, title, description, category, deadline')
      .eq('id', predictionId)
      .single()

    if (predError || !prediction) {
      return NextResponse.json({ error: 'Prediction not found' }, { status: 404 })
    }

    // Get consensus from view
    const { data: consensus, error: consensusError } = await supabase
      .from('prediction_consensus')
      .select('*')
      .eq('prediction_id', predictionId)
      .single()

    if (consensusError && consensusError.code !== 'PGRST116') {
      console.error('Error fetching consensus:', consensusError)
    }

    // Get recent votes
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .eq('prediction_id', predictionId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (votesError) {
      console.error('Error fetching votes:', votesError)
    }

    // Format response
    const formattedConsensus = consensus
      ? {
          predictionId: consensus.prediction_id,
          totalVotes: consensus.total_votes,
          humanVotes: consensus.human_votes,
          aiVotes: consensus.ai_votes,
          yesVotes: consensus.yes_votes,
          noVotes: consensus.no_votes,
          neutralVotes: consensus.neutral_votes,
          humanYes: consensus.human_yes,
          humanNo: consensus.human_no,
          humanNeutral: consensus.human_neutral,
          aiYes: consensus.ai_yes,
          aiNo: consensus.ai_no,
          aiNeutral: consensus.ai_neutral,
          weightedYes: consensus.weighted_yes,
          weightedNo: consensus.weighted_no,
          weightedNeutral: consensus.weighted_neutral,
          totalWeight: consensus.total_weight,
          consensusYesPct: consensus.consensus_yes_pct,
          humanConsensusYesPct: consensus.human_consensus_yes_pct,
          aiConsensusYesPct: consensus.ai_consensus_yes_pct,
          avgConfidence: consensus.avg_confidence,
          humanAvgConfidence: consensus.human_avg_confidence,
          aiAvgConfidence: consensus.ai_avg_confidence,
        }
      : null

    const formattedVotes = (votes || []).map((v) => ({
      id: v.id,
      predictionId: v.prediction_id,
      voterId: v.voter_id,
      voterType: v.voter_type,
      voterName: v.voter_name,
      position: v.position,
      confidence: v.confidence,
      weight: v.weight,
      reasoning: v.reasoning,
      createdAt: v.created_at,
      updatedAt: v.updated_at,
    }))

    return NextResponse.json({
      prediction,
      consensus: formattedConsensus,
      recentVotes: formattedVotes,
      breakdown: consensus
        ? {
            human: {
              total: consensus.human_votes,
              yes: consensus.human_yes,
              no: consensus.human_no,
              neutral: consensus.human_neutral,
              yesPct: consensus.human_consensus_yes_pct,
            },
            ai: {
              total: consensus.ai_votes,
              yes: consensus.ai_yes,
              no: consensus.ai_no,
              neutral: consensus.ai_neutral,
              yesPct: consensus.ai_consensus_yes_pct,
            },
          }
        : null,
    })
  } catch (error) {
    console.error('Error in votes route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
