import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/claims/[id]/votes - Get all votes and consensus with human/AI breakdown
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = createAdminClient()

    // Check claim exists
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('id')
      .eq('id', id)
      .single()

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    // Fetch all claim_votes for this claim
    const { data: votes, error: votesError } = await supabase
      .from('claim_votes')
      .select('*')
      .eq('claim_id', id)
      .order('created_at', { ascending: false })

    if (votesError) {
      console.error('Error fetching claim votes:', votesError)
      return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 })
    }

    const allVotes = votes || []

    // Compute consensus by iterating all votes
    let humanYes = 0
    let humanNo = 0
    let aiYes = 0
    let aiNo = 0
    let humanConfidenceSum = 0
    let aiConfidenceSum = 0
    let humanCount = 0
    let aiCount = 0

    for (const vote of allVotes) {
      const isAI = vote.voter_type === 'AI_AGENT'
      const isYes = vote.vote_value === true
      const confidence = Number(vote.confidence) || 0

      if (isAI) {
        aiCount++
        aiConfidenceSum += confidence
        if (isYes) {
          aiYes++
        } else {
          aiNo++
        }
      } else {
        // NULL or 'HUMAN' treated as human
        humanCount++
        humanConfidenceSum += confidence
        if (isYes) {
          humanYes++
        } else {
          humanNo++
        }
      }
    }

    const totalVotes = humanCount + aiCount
    const yesVotes = humanYes + aiYes
    const noVotes = humanNo + aiNo

    // Weighted: human = 1.0, AI = 0.5 (bootstrap phase)
    const weightedYes = humanYes * 1.0 + aiYes * 0.5
    const weightedNo = humanNo * 1.0 + aiNo * 0.5
    const weightedNeutral = 0
    const totalWeight = weightedYes + weightedNo

    // Percentages (handle division by zero)
    const consensusYesPct = totalWeight > 0 ? weightedYes / totalWeight : 0
    const humanTotal = humanYes + humanNo
    const humanConsensusYesPct = humanTotal > 0 ? humanYes / humanTotal : 0
    const aiTotal = aiYes + aiNo
    const aiConsensusYesPct = aiTotal > 0 ? aiYes / aiTotal : 0

    // Average confidence
    const totalConfidenceSum = humanConfidenceSum + aiConfidenceSum
    const avgConfidence = totalVotes > 0 ? totalConfidenceSum / totalVotes : 0
    const humanAvgConfidence = humanCount > 0 ? humanConfidenceSum / humanCount : 0
    const aiAvgConfidence = aiCount > 0 ? aiConfidenceSum / aiCount : 0

    const consensus = {
      predictionId: id, // reuse field name for PredictionConsensus compat
      totalVotes,
      humanVotes: humanCount,
      aiVotes: aiCount,
      yesVotes,
      noVotes,
      neutralVotes: 0,
      humanYes,
      humanNo,
      humanNeutral: 0,
      aiYes,
      aiNo,
      aiNeutral: 0,
      weightedYes,
      weightedNo,
      weightedNeutral,
      totalWeight,
      consensusYesPct,
      humanConsensusYesPct,
      aiConsensusYesPct,
      avgConfidence,
      humanAvgConfidence,
      aiAvgConfidence,
    }

    // Recent votes (limit 20)
    const recentVotes = allVotes.slice(0, 20).map((v) => ({
      id: v.id,
      claimId: v.claim_id,
      voterId: v.user_id,
      voterType: v.voter_type || 'HUMAN',
      voteValue: v.vote_value,
      confidence: Number(v.confidence) || 0,
      reasoning: v.reasoning ?? null,
      createdAt: v.created_at,
    }))

    return NextResponse.json({ consensus, recentVotes })
  } catch (error) {
    console.error('Error in claim votes route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
