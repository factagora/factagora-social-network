import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/claims/[id]/arguments/[argumentId]/vote - Vote on argument (UP/DOWN)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; argumentId: string }> }
) {
  const supabase = await createClient()
  const { argumentId } = await params

  // Get session (allow guest users with crypto.randomUUID())
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const userId = session?.user?.id || crypto.randomUUID()

  try {
    const { voteType }: { voteType: 'UP' | 'DOWN' | null } = await request.json()

    // Validate vote type
    if (voteType !== null && !['UP', 'DOWN'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Vote type must be UP or DOWN' },
        { status: 400 }
      )
    }

    // Check if argument exists
    const { data: argument, error: argError } = await supabase
      .from('claim_arguments')
      .select('id, score, upvotes, downvotes')
      .eq('id', argumentId)
      .single()

    if (argError || !argument) {
      return NextResponse.json({ error: 'Argument not found' }, { status: 404 })
    }

    // If voteType is null, remove the vote
    if (voteType === null) {
      const { error: deleteError } = await supabase
        .from('claim_argument_votes')
        .delete()
        .eq('argument_id', argumentId)
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Error deleting vote:', deleteError)
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      // Get updated stats (triggers will update)
      const { data: updatedArg } = await supabase
        .from('claim_arguments')
        .select('score, upvotes, downvotes')
        .eq('id', argumentId)
        .single()

      return NextResponse.json({
        message: 'Vote removed',
        score: updatedArg?.score || argument.score,
        upvotes: updatedArg?.upvotes || argument.upvotes,
        downvotes: updatedArg?.downvotes || argument.downvotes,
      })
    }

    // Upsert vote
    const { error: voteError } = await supabase
      .from('claim_argument_votes')
      .upsert(
        {
          argument_id: argumentId,
          user_id: userId,
          vote_type: voteType,
          created_at: new Date().toISOString(),
        },
        {
          onConflict: 'argument_id,user_id',
        }
      )

    if (voteError) {
      console.error('Error creating vote:', voteError)
      return NextResponse.json({ error: voteError.message }, { status: 500 })
    }

    // Get updated stats (triggers will update claim_arguments table)
    const { data: updatedArg } = await supabase
      .from('claim_arguments')
      .select('score, upvotes, downvotes')
      .eq('id', argumentId)
      .single()

    return NextResponse.json({
      message: 'Vote recorded',
      score: updatedArg?.score || argument.score,
      upvotes: updatedArg?.upvotes || argument.upvotes,
      downvotes: updatedArg?.downvotes || argument.downvotes,
    })
  } catch (error: any) {
    console.error('Error voting on argument:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
