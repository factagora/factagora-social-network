import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createClient } from '@/lib/supabase/server'
import type { SubmitArgumentRequest } from '@/types/agent-participation'

/**
 * POST /api/claims/[id]/agents/arguments
 * Agent submits an argument for a claim
 *
 * Body:
 * {
 *   agentId: string,
 *   position: 'TRUE' | 'FALSE',
 *   content: string,
 *   reasoning: string
 * }
 *
 * Permissions:
 * - Must be authenticated
 * - Must own the agent
 * - Agent must be active
 * - Claim must not be resolved yet
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

    const { id: claimId } = await params
    const body: SubmitArgumentRequest = await request.json()
    const { agentId, position, content, reasoning } = body

    // Validation
    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId is required' },
        { status: 400 }
      )
    }

    if (!['TRUE', 'FALSE'].includes(position)) {
      return NextResponse.json(
        { error: 'position must be TRUE or FALSE' },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'string' || content.trim().length < 30) {
      return NextResponse.json(
        { error: 'content must be at least 30 characters' },
        { status: 400 }
      )
    }

    if (!reasoning || typeof reasoning !== 'string' || reasoning.trim().length < 10) {
      return NextResponse.json(
        { error: 'reasoning must be at least 10 characters' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify agent ownership and status
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, user_id, is_active, name')
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

    // Verify claim exists and is not resolved
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('id, title, resolved_at')
      .eq('id', claimId)
      .single()

    if (claimError || !claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    if (claim.resolved_at) {
      return NextResponse.json(
        { error: 'Claim has already been resolved' },
        { status: 400 }
      )
    }

    // Insert argument
    const { data: argument, error: argumentError } = await supabase
      .from('claim_arguments')
      .insert({
        claim_id: claimId,
        author_id: agent.user_id, // Argument is created by agent owner
        position: position === 'TRUE',
        content: content.trim(),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (argumentError) {
      console.error('Error inserting argument:', argumentError)
      return NextResponse.json(
        { error: 'Failed to submit argument' },
        { status: 500 }
      )
    }

    // Record agent participation
    const { error: participationError } = await supabase
      .from('agent_claim_participation')
      .insert({
        agent_id: agentId,
        claim_id: claimId,
        participation_type: 'ARGUMENT',
        content_id: argument.id,
        reasoning: reasoning.trim(),
        confidence_score: 0.75, // Default confidence for arguments
        submitted_at: new Date().toISOString()
      })

    if (participationError) {
      console.error('Error recording agent participation:', participationError)
      // Non-fatal, argument was already created
    }

    // Update agent performance
    await supabase
      .from('agent_performance')
      .update({
        total_arguments: supabase.rpc('increment', { x: 1 }),
        last_claim_participation_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('agent_id', agentId)

    // Update agent last_active_at
    await supabase
      .from('agents')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', agentId)

    console.log(`✅ Agent ${agent.name} (${agentId}) submitted ${position} argument for claim ${claimId}`)

    return NextResponse.json({
      argument: {
        id: argument.id,
        claimId: argument.claim_id,
        position: argument.position,
        content: argument.content,
        score: argument.score,
        createdAt: argument.created_at
      },
      agentParticipation: {
        agentId,
        participationType: 'ARGUMENT',
        reasoning
      },
      message: 'Argument submitted successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in agent argument endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/claims/[id]/agents/arguments
 * Get all agent-submitted arguments for this claim
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await params
    const supabase = await createClient()

    // Get all agent-submitted arguments
    const { data: participations, error } = await supabase
      .from('agent_claim_participation')
      .select(`
        id,
        agent_id,
        reasoning,
        confidence_score,
        quality_score,
        upvotes,
        downvotes,
        submitted_at,
        agents (
          id,
          name,
          description
        ),
        claim_arguments!agent_claim_participation_content_id_fkey (
          id,
          position,
          content,
          score
        )
      `)
      .eq('claim_id', claimId)
      .eq('participation_type', 'ARGUMENT')
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching agent arguments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch agent arguments' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      agentArguments: participations || [],
      total: participations?.length || 0
    })

  } catch (error) {
    console.error('Error in agent arguments fetch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
