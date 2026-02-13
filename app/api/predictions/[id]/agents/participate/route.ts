import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createClient } from '@/lib/supabase/server'
import type { SubmitPredictionRequest } from '@/types/agent-participation'

/**
 * POST /api/predictions/[id]/agents/participate
 * Agent submits a prediction for a forecasting market
 *
 * Body:
 * {
 *   agentId: string,
 *   probability: number (0-1),
 *   reasoning: string,
 *   confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW'
 * }
 *
 * Permissions:
 * - Must be authenticated
 * - Must own the agent
 * - Agent must be active
 * - Prediction must not be resolved yet
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const { id: predictionId } = await params
    const body: SubmitPredictionRequest = await request.json()
    const { agentId, probability, reasoning, confidenceLevel } = body

    // Validation
    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId is required' },
        { status: 400 }
      )
    }

    if (typeof probability !== 'number' || probability < 0 || probability > 1) {
      return NextResponse.json(
        { error: 'probability must be a number between 0 and 1' },
        { status: 400 }
      )
    }

    if (!reasoning || typeof reasoning !== 'string' || reasoning.trim().length < 10) {
      return NextResponse.json(
        { error: 'reasoning must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (!['HIGH', 'MEDIUM', 'LOW'].includes(confidenceLevel)) {
      return NextResponse.json(
        { error: 'confidenceLevel must be HIGH, MEDIUM, or LOW' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify agent ownership and status
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, user_id, is_active, name, cooldown_ms, last_active_at')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    if (agent.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not own this agent' },
        { status: 403 }
      )
    }

    if (!agent.is_active) {
      return NextResponse.json(
        { error: 'Agent is not active' },
        { status: 403 }
      )
    }

    // Check cooldown
    if (agent.last_active_at) {
      const lastActive = new Date(agent.last_active_at)
      const cooldownEndTime = new Date(lastActive.getTime() + (agent.cooldown_ms || 60000))

      if (cooldownEndTime > new Date()) {
        const remainingMs = cooldownEndTime.getTime() - new Date().getTime()
        return NextResponse.json(
          {
            error: 'Agent is in cooldown period',
            remainingMs,
            nextAvailableAt: cooldownEndTime.toISOString()
          },
          { status: 429 }
        )
      }
    }

    // Verify prediction exists and is not resolved
    const { data: prediction, error: predictionError } = await supabase
      .from('predictions')
      .select('id, title, resolved_at, resolution_date')
      .eq('id', predictionId)
      .single()

    if (predictionError || !prediction) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      )
    }

    if (prediction.resolved_at) {
      return NextResponse.json(
        { error: 'Prediction has already been resolved' },
        { status: 400 }
      )
    }

    // Check if agent has already predicted on this
    const { data: existingPrediction } = await supabase
      .from('agent_predictions')
      .select('id')
      .eq('agent_id', agentId)
      .eq('prediction_id', predictionId)
      .single()

    if (existingPrediction) {
      return NextResponse.json(
        { error: 'Agent has already submitted a prediction for this market' },
        { status: 409 }
      )
    }

    // Insert agent prediction
    const { data: agentPrediction, error: insertError } = await supabase
      .from('agent_predictions')
      .insert({
        agent_id: agentId,
        prediction_id: predictionId,
        probability,
        reasoning: reasoning.trim(),
        confidence_level: confidenceLevel,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting agent prediction:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit prediction' },
        { status: 500 }
      )
    }

    // Update agent last_active_at
    await supabase
      .from('agents')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', agentId)

    // Update agent performance
    await supabase
      .from('agent_performance')
      .update({
        last_prediction_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('agent_id', agentId)

    console.log(`✅ Agent ${agent.name} (${agentId}) predicted ${Math.round(probability * 100)}% on prediction ${predictionId}`)

    return NextResponse.json({
      agentPrediction: {
        id: agentPrediction.id,
        agentId: agentPrediction.agent_id,
        predictionId: agentPrediction.prediction_id,
        probability: agentPrediction.probability,
        reasoning: agentPrediction.reasoning,
        confidenceLevel: agentPrediction.confidence_level,
        submittedAt: agentPrediction.submitted_at
      },
      message: 'Prediction submitted successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in agent prediction endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/predictions/[id]/agents/participate
 * Get all agent predictions for this prediction
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: predictionId } = await params
    const supabase = await createClient()

    // Get all agent predictions for this prediction
    const { data: agentPredictions, error } = await supabase
      .from('agent_predictions')
      .select(`
        id,
        agent_id,
        probability,
        reasoning,
        confidence_level,
        brier_score,
        was_correct,
        reputation_change,
        submitted_at,
        resolved_at,
        agents (
          id,
          name,
          description
        )
      `)
      .eq('prediction_id', predictionId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching agent predictions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch agent predictions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      agentPredictions: agentPredictions || [],
      total: agentPredictions?.length || 0
    })

  } catch (error) {
    console.error('Error in agent predictions fetch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
