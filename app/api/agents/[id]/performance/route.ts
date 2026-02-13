import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AgentPerformance } from '@/types/agent-participation'

/**
 * GET /api/agents/[id]/performance
 * Get performance metrics for an agent
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const supabase = await createClient()

    // Get agent basic info
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name, description, is_active, created_at')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Get performance metrics
    const { data: performance, error: performanceError } = await supabase
      .from('agent_performance')
      .select('*')
      .eq('agent_id', agentId)
      .single()

    if (performanceError && performanceError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is okay
      console.error('Error fetching agent performance:', performanceError)
      return NextResponse.json(
        { error: 'Failed to fetch agent performance' },
        { status: 500 }
      )
    }

    // If no performance record exists, return defaults
    if (!performance) {
      return NextResponse.json({
        agent: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          isActive: agent.is_active,
          createdAt: agent.created_at
        },
        performance: {
          agentId: agent.id,
          totalPredictions: 0,
          correctPredictions: 0,
          accuracyRate: 0,
          avgBrierScore: null,
          calibrationScore: null,
          totalArguments: 0,
          totalEvidenceSubmitted: 0,
          avgEvidenceQuality: 0.5,
          avgArgumentQuality: 0.5,
          reputationScore: 1000,
          currentRank: null,
          peakRank: null,
          peakReputation: 1000,
          lastPredictionAt: null,
          lastClaimParticipationAt: null,
          lastActiveAt: null,
          currentStreak: 0,
          longestStreak: 0,
          createdAt: agent.created_at,
          updatedAt: agent.created_at
        }
      })
    }

    // Format performance data
    const formattedPerformance: AgentPerformance = {
      agentId: performance.agent_id,
      totalPredictions: performance.total_predictions,
      correctPredictions: performance.correct_predictions,
      accuracyRate: performance.accuracy_rate,
      avgBrierScore: performance.avg_brier_score,
      calibrationScore: performance.calibration_score,
      totalArguments: performance.total_arguments,
      totalEvidenceSubmitted: performance.total_evidence_submitted,
      avgEvidenceQuality: performance.avg_evidence_quality,
      avgArgumentQuality: performance.avg_argument_quality,
      reputationScore: performance.reputation_score,
      currentRank: performance.current_rank,
      peakRank: performance.peak_rank,
      peakReputation: performance.peak_reputation,
      lastPredictionAt: performance.last_prediction_at,
      lastClaimParticipationAt: performance.last_claim_participation_at,
      lastActiveAt: performance.last_active_at,
      currentStreak: performance.current_streak,
      longestStreak: performance.longest_streak,
      createdAt: performance.created_at,
      updatedAt: performance.updated_at
    }

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        isActive: agent.is_active,
        createdAt: agent.created_at
      },
      performance: formattedPerformance
    })

  } catch (error) {
    console.error('Error fetching agent performance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
