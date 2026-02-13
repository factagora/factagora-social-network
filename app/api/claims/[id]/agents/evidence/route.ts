import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createClient } from '@/lib/supabase/server'
import { extractDomain } from '@/types/credibility'
import type { SubmitEvidenceRequest } from '@/types/agent-participation'

/**
 * POST /api/claims/[id]/agents/evidence
 * Agent submits evidence for a claim
 *
 * Body:
 * {
 *   agentId: string,
 *   content: string,
 *   sourceUrl: string,
 *   supportsClai: boolean,
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
    const body: SubmitEvidenceRequest = await request.json()
    const { agentId, content, sourceUrl, supportsClai, reasoning } = body

    // Validation
    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId is required' },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'string' || content.trim().length < 20) {
      return NextResponse.json(
        { error: 'content must be at least 20 characters' },
        { status: 400 }
      )
    }

    if (!sourceUrl || typeof sourceUrl !== 'string') {
      return NextResponse.json(
        { error: 'sourceUrl is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(sourceUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid source URL format' },
        { status: 400 }
      )
    }

    if (typeof supportsClai !== 'boolean') {
      return NextResponse.json(
        { error: 'supportsClai must be a boolean' },
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

    // Extract domain for credibility scoring
    const sourceDomain = extractDomain(sourceUrl)

    // Insert evidence
    const { data: evidence, error: evidenceError } = await supabase
      .from('claim_evidence')
      .insert({
        claim_id: claimId,
        content: content.trim(),
        source_url: sourceUrl,
        source_domain: sourceDomain,
        supports_claim: supportsClai,
        created_by: agent.user_id, // Evidence is created by agent owner
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (evidenceError) {
      console.error('Error inserting evidence:', evidenceError)
      return NextResponse.json(
        { error: 'Failed to submit evidence' },
        { status: 500 }
      )
    }

    // Record agent participation
    const { error: participationError } = await supabase
      .from('agent_claim_participation')
      .insert({
        agent_id: agentId,
        claim_id: claimId,
        participation_type: 'EVIDENCE',
        content_id: evidence.id,
        reasoning: reasoning.trim(),
        confidence_score: supportsClai ? 0.8 : 0.8, // Default confidence
        submitted_at: new Date().toISOString()
      })

    if (participationError) {
      console.error('Error recording agent participation:', participationError)
      // Non-fatal, evidence was already created
    }

    // Update agent performance
    await supabase
      .from('agent_performance')
      .update({
        total_evidence_submitted: supabase.rpc('increment', { x: 1 }),
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

    console.log(`✅ Agent ${agent.name} (${agentId}) submitted evidence for claim ${claimId}`)

    return NextResponse.json({
      evidence: {
        id: evidence.id,
        claimId: evidence.claim_id,
        content: evidence.content,
        sourceUrl: evidence.source_url,
        sourceDomain: evidence.source_domain,
        supportsClai: evidence.supports_claim,
        credibilityScore: evidence.credibility_score,
        createdAt: evidence.created_at
      },
      agentParticipation: {
        agentId,
        participationType: 'EVIDENCE',
        reasoning
      },
      message: 'Evidence submitted successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in agent evidence endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/claims/[id]/agents/evidence
 * Get all agent-submitted evidence for this claim
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await params
    const supabase = await createClient()

    // Get all agent-submitted evidence
    const { data: participations, error } = await supabase
      .from('agent_claim_participation')
      .select(`
        id,
        agent_id,
        reasoning,
        confidence_score,
        quality_score,
        submitted_at,
        agents (
          id,
          name,
          description
        ),
        claim_evidence!agent_claim_participation_content_id_fkey (
          id,
          content,
          source_url,
          source_domain,
          supports_claim,
          credibility_score
        )
      `)
      .eq('claim_id', claimId)
      .eq('participation_type', 'EVIDENCE')
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching agent evidence:', error)
      return NextResponse.json(
        { error: 'Failed to fetch agent evidence' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      agentEvidence: participations || [],
      total: participations?.length || 0
    })

  } catch (error) {
    console.error('Error in agent evidence fetch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
