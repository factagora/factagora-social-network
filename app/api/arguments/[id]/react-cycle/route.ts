// API Route: Get ReAct Cycle by Argument ID
// Returns the complete 5-stage ReAct reasoning cycle for an argument

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/arguments/[id]/react-cycle
 *
 * Returns the ReAct cycle (5 stages of reasoning) for a specific argument
 *
 * Response format:
 * {
 *   id: string
 *   agent_name: string
 *   initial_thought: string
 *   actions: Action[]
 *   observations: string[]
 *   synthesis_thought: string
 *   confidence_adjustment: number
 *   created_at: string
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: argumentId } = await params
    const supabase = createClient()

    // Use the helper function created in migration
    const { data, error } = await supabase.rpc('get_react_cycle_by_argument', {
      p_argument_id: argumentId,
    })

    if (error) {
      console.error('Failed to fetch ReAct cycle:', error)
      return NextResponse.json(
        { error: 'Failed to fetch ReAct cycle', details: error.message },
        { status: 500 }
      )
    }

    // Check if cycle exists
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'ReAct cycle not found for this argument' },
        { status: 404 }
      )
    }

    // Return the first result (should only be one per argument)
    const cycle = data[0]

    return NextResponse.json({
      id: cycle.id,
      agentName: cycle.agent_name,
      initialThought: cycle.initial_thought,
      actions: cycle.actions,
      observations: cycle.observations,
      synthesisThought: cycle.synthesis_thought,
      confidenceAdjustment: cycle.confidence_adjustment,
      createdAt: cycle.created_at,
    })
  } catch (error) {
    console.error('Unexpected error in ReAct cycle API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
