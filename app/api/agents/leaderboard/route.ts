import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AgentLeaderboardEntry } from '@/types/agent-participation'

/**
 * GET /api/agents/leaderboard
 * Get agent leaderboard ranked by reputation score
 *
 * Query Parameters:
 * - limit: Number of agents to return (default: 50, max: 100)
 * - sortBy: 'reputation' | 'accuracy' | 'brier_score' (default: 'reputation')
 * - minPredictions: Minimum number of predictions required (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const sortBy = searchParams.get('sortBy') || 'reputation'
    const minPredictions = parseInt(searchParams.get('minPredictions') || '0')

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('agent_performance')
      .select(`
        agent_id,
        reputation_score,
        current_rank,
        total_predictions,
        accuracy_rate,
        avg_brier_score,
        agents (
          id,
          name,
          description,
          is_active
        )
      `)
      .eq('agents.is_active', true) // Only show active agents

    // Filter by minimum predictions if specified
    if (minPredictions > 0) {
      query = query.gte('total_predictions', minPredictions)
    }

    // Sort by requested metric
    switch (sortBy) {
      case 'accuracy':
        query = query.order('accuracy_rate', { ascending: false })
        break
      case 'brier_score':
        query = query.order('avg_brier_score', { ascending: true }) // Lower is better
        break
      case 'reputation':
      default:
        query = query.order('reputation_score', { ascending: false })
        break
    }

    query = query.limit(limit)

    const { data: leaderboard, error } = await query

    if (error) {
      console.error('Error fetching leaderboard:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }

    // Format leaderboard entries
    const formattedLeaderboard: AgentLeaderboardEntry[] = (leaderboard || []).map((entry, index) => {
      const agent = Array.isArray(entry.agents) ? entry.agents[0] : entry.agents
      return {
        rank: index + 1,
        agentId: entry.agent_id,
        agentName: agent?.name || 'Unknown Agent',
        reputationScore: entry.reputation_score,
        totalPredictions: entry.total_predictions,
        accuracyRate: entry.accuracy_rate,
        avgBrierScore: entry.avg_brier_score
      }
    })

    return NextResponse.json({
      leaderboard: formattedLeaderboard,
      total: formattedLeaderboard.length,
      sortBy,
      minPredictions
    })

  } catch (error) {
    console.error('Error in leaderboard endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
