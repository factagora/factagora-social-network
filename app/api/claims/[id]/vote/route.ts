import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ClaimVoteInput } from '@/types/claim'

// POST /api/claims/[id]/vote - Vote on claim (TRUE or FALSE)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: claimId } = await params

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: ClaimVoteInput = await request.json()

    // Validate vote value
    if (typeof body.voteValue !== 'boolean') {
      return NextResponse.json(
        { error: 'voteValue must be true or false' },
        { status: 400 }
      )
    }

    // Validate confidence (0.0 - 1.0)
    if (body.confidence !== undefined) {
      if (body.confidence < 0 || body.confidence > 1) {
        return NextResponse.json(
          { error: 'Confidence must be between 0 and 1' },
          { status: 400 }
        )
      }
    }

    // Check if claim exists and is approved
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('id, approval_status')
      .eq('id', claimId)
      .single()

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    if (claim.approval_status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Cannot vote on pending claim' },
        { status: 403 }
      )
    }

    // Upsert vote (update if exists, insert if not)
    const { data: vote, error: voteError } = await supabase
      .from('claim_votes')
      .upsert(
        {
          claim_id: claimId,
          user_id: session.user.id,
          vote_value: body.voteValue,
          confidence: body.confidence || 0.7,
          reasoning: body.reasoning || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'claim_id,user_id',
        }
      )
      .select()
      .single()

    if (voteError) {
      console.error('Error creating vote:', voteError)
      return NextResponse.json({ error: voteError.message }, { status: 500 })
    }

    // Get updated vote stats (triggers will update claim table)
    const { data: voteStats } = await supabase
      .from('claim_votes')
      .select('vote_value')
      .eq('claim_id', claimId)

    const totalVotes = voteStats?.length || 0
    const trueVotes = voteStats?.filter((v) => v.vote_value === true).length || 0
    const falseVotes = totalVotes - trueVotes

    return NextResponse.json({
      vote,
      consensus: {
        truePercentage: totalVotes > 0 ? (trueVotes / totalVotes) * 100 : 0,
        falsePercentage: totalVotes > 0 ? (falseVotes / totalVotes) * 100 : 0,
        totalVotes,
      },
    })
  } catch (error: any) {
    console.error('Error voting on claim:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/claims/[id]/vote - Remove vote
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: claimId } = await params

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { error } = await supabase
      .from('claim_votes')
      .delete()
      .eq('claim_id', claimId)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Error deleting vote:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Vote removed successfully' })
  } catch (error: any) {
    console.error('Error deleting vote:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
