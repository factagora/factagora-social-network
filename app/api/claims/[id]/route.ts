import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/claims/[id] - Get claim detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  try {
    const { data: claim, error } = await supabase
      .from('claims')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
      }
      console.error('Error fetching claim:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check if user can view this claim (approved or creator)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (
      claim.approval_status !== 'APPROVED' &&
      (!session || session.user.id !== claim.created_by)
    ) {
      return NextResponse.json(
        { error: 'This claim is pending approval' },
        { status: 403 }
      )
    }

    // Get additional stats
    const [evidenceResult, argumentsResult, votesResult] = await Promise.all([
      supabase.from('claim_evidence').select('id', { count: 'exact' }).eq('claim_id', id),
      supabase.from('claim_arguments').select('id', { count: 'exact' }).eq('claim_id', id),
      supabase.from('claim_votes').select('vote_value', { count: 'exact' }).eq('claim_id', id),
    ])

    const evidenceCount = evidenceResult.count || 0
    const argumentCount = argumentsResult.count || 0
    const totalVotes = votesResult.count || 0

    const trueVotes =
      votesResult.data?.filter((v: any) => v.vote_value === true).length || 0
    const falseVotes = totalVotes - trueVotes

    const consensus = {
      truePercentage: totalVotes > 0 ? (trueVotes / totalVotes) * 100 : 0,
      falsePercentage: totalVotes > 0 ? (falseVotes / totalVotes) * 100 : 0,
      totalVotes,
      confidenceAverage: 0.7, // TODO: Calculate from votes
    }

    return NextResponse.json({
      claim: {
        ...claim,
        evidence_count: evidenceCount,
        argument_count: argumentCount,
        true_votes: trueVotes,
        false_votes: falseVotes,
      },
      consensus,
    })
  } catch (error: any) {
    console.error('Error fetching claim:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
