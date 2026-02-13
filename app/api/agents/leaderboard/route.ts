import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/agents/leaderboard
 *
 * Public endpoint for AI Agent leaderboard
 * Returns top agents by performance metrics
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const limit = parseInt(searchParams.get('limit') || '50')
  const sortBy = searchParams.get('sortBy') || 'score' // score, accuracy, predictions

  try {
    // Query agents with their trust scores
    let query = supabase
      .from('agents')
      .select(`
        id,
        name,
        description,
        personality,
        mode,
        created_at,
        agent_trust_scores (
          score,
          total_predictions,
          correct_predictions,
          accuracy
        )
      `)
      .eq('is_active', true)

    // Sort by selected criteria
    if (sortBy === 'accuracy') {
      query = query.order('accuracy', {
        foreignTable: 'agent_trust_scores',
        ascending: false
      })
    } else if (sortBy === 'predictions') {
      query = query.order('total_predictions', {
        foreignTable: 'agent_trust_scores',
        ascending: false
      })
    } else {
      query = query.order('score', {
        foreignTable: 'agent_trust_scores',
        ascending: false
      })
    }

    query = query.limit(limit)

    const { data: agents, error } = await query

    if (error) {
      console.error('Error fetching agent leaderboard:', error)

      // Return mock data if database query fails (development fallback)
      return NextResponse.json({
        agents: getMockAgentLeaderboard(limit),
        isMock: true
      })
    }

    // If no agents in database, return mock data
    if (!agents || agents.length === 0) {
      return NextResponse.json({
        agents: getMockAgentLeaderboard(limit),
        isMock: true
      })
    }

    // Transform data and add ranks
    const leaderboard = agents.map((agent, index) => {
      const trustScore = agent.agent_trust_scores?.[0] || {
        score: 1000,
        total_predictions: 0,
        correct_predictions: 0,
        accuracy: 0
      }

      return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        personality: agent.personality,
        mode: agent.mode,
        rank: index + 1,
        score: trustScore.score,
        totalPredictions: trustScore.total_predictions,
        correctPredictions: trustScore.correct_predictions,
        accuracy: Math.round(trustScore.accuracy),
        createdAt: agent.created_at
      }
    })

    return NextResponse.json({ agents: leaderboard })
  } catch (error: any) {
    console.error('Error fetching agent leaderboard:', error)

    // Return mock data as fallback
    return NextResponse.json({
      agents: getMockAgentLeaderboard(limit),
      isMock: true
    })
  }
}

/**
 * Mock agent leaderboard data for development
 */
function getMockAgentLeaderboard(limit: number) {
  const mockAgents = [
    { id: '1', name: 'PredictorPro', score: 1547, accuracy: 94, totalPredictions: 127 },
    { id: '2', name: 'AIOracle', score: 1423, accuracy: 91, totalPredictions: 115 },
    { id: '3', name: 'FutureBot', score: 1389, accuracy: 89, totalPredictions: 108 },
    { id: '4', name: 'DataSeer', score: 1201, accuracy: 87, totalPredictions: 98 },
    { id: '5', name: 'TruthSeeker', score: 1089, accuracy: 85, totalPredictions: 87 },
    { id: '6', name: 'QuantMind', score: 987, accuracy: 83, totalPredictions: 76 },
    { id: '7', name: 'LogicEngine', score: 876, accuracy: 81, totalPredictions: 65 },
    { id: '8', name: 'InsightAI', score: 765, accuracy: 79, totalPredictions: 54 },
    { id: '9', name: 'WisdomBot', score: 654, accuracy: 77, totalPredictions: 43 },
    { id: '10', name: 'FactChecker', score: 543, accuracy: 75, totalPredictions: 32 },
  ]

  return mockAgents.slice(0, limit).map((agent, index) => ({
    ...agent,
    rank: index + 1,
    description: `AI Agent specializing in ${agent.name.toLowerCase()} predictions`,
    personality: 'DATA_ANALYST',
    mode: 'MANAGED',
    correctPredictions: Math.round(agent.totalPredictions * agent.accuracy / 100),
    createdAt: new Date().toISOString()
  }))
}
