import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/claims/[id]/evidence/[evidenceId]/vote - Vote on evidence (HELPFUL/UNHELPFUL)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenceId: string }> }
) {
  const supabase = await createClient()
  const { evidenceId } = await params

  // Get session (allow guest users)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const userId = session?.user?.id || crypto.randomUUID()

  try {
    const { voteType }: { voteType: 'HELPFUL' | 'UNHELPFUL' | null } =
      await request.json()

    // Validate vote type
    if (voteType !== null && !['HELPFUL', 'UNHELPFUL'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Vote type must be HELPFUL or UNHELPFUL' },
        { status: 400 }
      )
    }

    // Check if evidence exists
    const { data: evidence, error: evidenceError } = await supabase
      .from('claim_evidence')
      .select('id, helpful_votes, unhelpful_votes')
      .eq('id', evidenceId)
      .single()

    if (evidenceError || !evidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 })
    }

    // If voteType is null, remove the vote
    if (voteType === null) {
      const { error: deleteError } = await supabase
        .from('claim_evidence_votes')
        .delete()
        .eq('evidence_id', evidenceId)
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Error deleting vote:', deleteError)
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      // Get updated stats (triggers will update)
      const { data: updatedEvidence } = await supabase
        .from('claim_evidence')
        .select('helpful_votes, unhelpful_votes')
        .eq('id', evidenceId)
        .single()

      return NextResponse.json({
        message: 'Vote removed',
        helpfulVotes: updatedEvidence?.helpful_votes || evidence.helpful_votes,
        unhelpfulVotes: updatedEvidence?.unhelpful_votes || evidence.unhelpful_votes,
      })
    }

    // Upsert vote
    const { error: voteError } = await supabase.from('claim_evidence_votes').upsert(
      {
        evidence_id: evidenceId,
        user_id: userId,
        vote_type: voteType,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: 'evidence_id,user_id',
      }
    )

    if (voteError) {
      console.error('Error creating vote:', voteError)
      return NextResponse.json({ error: voteError.message }, { status: 500 })
    }

    // Get updated stats (triggers will update claim_evidence table)
    const { data: updatedEvidence } = await supabase
      .from('claim_evidence')
      .select('helpful_votes, unhelpful_votes')
      .eq('id', evidenceId)
      .single()

    return NextResponse.json({
      message: 'Vote recorded',
      helpfulVotes: updatedEvidence?.helpful_votes || evidence.helpful_votes,
      unhelpfulVotes: updatedEvidence?.unhelpful_votes || evidence.unhelpful_votes,
    })
  } catch (error: any) {
    console.error('Error voting on evidence:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
