import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ClaimConsensus } from '@/types/credibility'
import { calculateConsensusVerdict } from '@/types/credibility'

/**
 * GET /api/claims/[id]/consensus
 * Get consensus data for a claim
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await params
    const supabase = await createClient()

    // Get consensus data
    const { data: consensus, error } = await supabase
      .from('claim_consensus')
      .select('*')
      .eq('claim_id', claimId)
      .single()

    if (error || !consensus) {
      // If no consensus data exists, create it
      const { error: updateError } = await supabase
        .rpc('update_claim_consensus', { p_claim_id: claimId })

      if (updateError) {
        console.error('Error creating consensus:', updateError)
        return NextResponse.json(
          { error: 'Failed to calculate consensus' },
          { status: 500 }
        )
      }

      // Fetch the newly created consensus
      const { data: newConsensus, error: fetchError } = await supabase
        .from('claim_consensus')
        .select('*')
        .eq('claim_id', claimId)
        .single()

      if (fetchError || !newConsensus) {
        return NextResponse.json(
          { error: 'Failed to fetch consensus' },
          { status: 500 }
        )
      }

      return NextResponse.json(formatConsensus(newConsensus))
    }

    return NextResponse.json(formatConsensus(consensus))

  } catch (error) {
    console.error('Error fetching consensus:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/claims/[id]/consensus/recalculate
 * Force recalculation of consensus (useful after new votes/evidence)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await params
    const supabase = await createClient()

    console.log(`🔄 Recalculating consensus for claim ${claimId}`)

    // Call the database function to update consensus
    const { error } = await supabase
      .rpc('update_claim_consensus', { p_claim_id: claimId })

    if (error) {
      console.error('Error recalculating consensus:', error)
      return NextResponse.json(
        { error: 'Failed to recalculate consensus' },
        { status: 500 }
      )
    }

    // Fetch the updated consensus
    const { data: consensus, error: fetchError } = await supabase
      .from('claim_consensus')
      .select('*')
      .eq('claim_id', claimId)
      .single()

    if (fetchError || !consensus) {
      return NextResponse.json(
        { error: 'Failed to fetch updated consensus' },
        { status: 500 }
      )
    }

    console.log(`✅ Consensus recalculated: ${consensus.true_percentage}% TRUE, confidence: ${consensus.confidence_level}`)

    return NextResponse.json({
      ...formatConsensus(consensus),
      recalculated: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in consensus recalculation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/claims/[id]/consensus/recommendation
 * Get verdict recommendation based on current consensus
 */
export async function recommendation(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await params
    const supabase = await createClient()

    // Get consensus data
    const { data: consensus, error } = await supabase
      .from('claim_consensus')
      .select('*')
      .eq('claim_id', claimId)
      .single()

    if (error || !consensus) {
      return NextResponse.json(
        { error: 'Consensus data not found' },
        { status: 404 }
      )
    }

    // Calculate recommended verdict
    const verdict = calculateConsensusVerdict(
      consensus.true_percentage,
      consensus.evidence_weighted_score,
      consensus.total_votes
    )

    // Generate explanation
    const explanation = generateVerdictExplanation(
      verdict,
      consensus.true_percentage,
      consensus.evidence_weighted_score,
      consensus.total_votes,
      consensus.confidence_level
    )

    return NextResponse.json({
      claimId,
      recommendedVerdict: verdict,
      confidence: consensus.confidence_level,
      consensusReached: consensus.consensus_reached,
      explanation,
      data: {
        truePercentage: consensus.true_percentage,
        evidenceScore: consensus.evidence_weighted_score,
        totalVotes: consensus.total_votes
      }
    })

  } catch (error) {
    console.error('Error generating recommendation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatConsensus(dbConsensus: any): ClaimConsensus {
  return {
    id: dbConsensus.id,
    claimId: dbConsensus.claim_id,
    trueVotes: dbConsensus.true_votes,
    falseVotes: dbConsensus.false_votes,
    totalVotes: dbConsensus.total_votes,
    truePercentage: dbConsensus.true_percentage,
    evidenceWeightedScore: dbConsensus.evidence_weighted_score,
    highCredibilityEvidenceCount: dbConsensus.high_credibility_evidence_count,
    lowCredibilityEvidenceCount: dbConsensus.low_credibility_evidence_count,
    consensusReached: dbConsensus.consensus_reached,
    consensusThreshold: dbConsensus.consensus_threshold,
    confidenceLevel: dbConsensus.confidence_level,
    createdAt: dbConsensus.created_at,
    updatedAt: dbConsensus.updated_at
  }
}

function generateVerdictExplanation(
  verdict: string,
  truePercentage: number,
  evidenceScore: number,
  totalVotes: number,
  confidence: string
): string {
  const parts: string[] = []

  // Vote-based explanation
  if (totalVotes >= 5) {
    parts.push(`${Math.round(truePercentage)}% of ${totalVotes} voters believe this is TRUE`)
  } else {
    parts.push(`Only ${totalVotes} votes so far - more data needed for confidence`)
  }

  // Evidence-based explanation
  if (evidenceScore > 60) {
    parts.push('Strong evidence supports this claim')
  } else if (evidenceScore > 30) {
    parts.push('Moderate evidence supports this claim')
  } else if (evidenceScore < -60) {
    parts.push('Strong evidence contradicts this claim')
  } else if (evidenceScore < -30) {
    parts.push('Moderate evidence contradicts this claim')
  } else {
    parts.push('Evidence is mixed or inconclusive')
  }

  // Confidence explanation
  const confidenceText = {
    HIGH: 'High confidence in this assessment',
    MEDIUM: 'Moderate confidence - some uncertainty remains',
    LOW: 'Low confidence - needs more data',
    NONE: 'Insufficient data for confident assessment'
  }[confidence] || 'Confidence level unknown'

  parts.push(confidenceText)

  return parts.join('. ') + '.'
}
