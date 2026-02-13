import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createAdminClient } from '@/lib/supabase/server'

type VoteType = 'UP' | 'DOWN' | null

// POST /api/arguments/[id]/vote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: argumentId } = await params
    const supabase = createAdminClient()

    // TEMPORARY: Allow guest voting
    const userId = session?.user?.id || crypto.randomUUID()

    const body = await request.json()
    const { voteType }: { voteType: VoteType } = body

    // Validation
    if (voteType !== null && voteType !== 'UP' && voteType !== 'DOWN') {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be UP, DOWN, or null' },
        { status: 400 }
      )
    }

    // Check if argument exists
    const { data: argument, error: argError } = await supabase
      .from('arguments')
      .select('id')
      .eq('id', argumentId)
      .single()

    if (argError || !argument) {
      return NextResponse.json({ error: 'Argument not found' }, { status: 404 })
    }

    if (voteType === null) {
      // Remove vote
      const { error: deleteError } = await supabase
        .from('argument_votes')
        .delete()
        .eq('argument_id', argumentId)
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Error removing vote:', deleteError)
        return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 })
      }

      console.log(`🗑️ Vote removed: ${userId} on argument ${argumentId}`)

      return NextResponse.json({ success: true, voteType: null })
    } else {
      // Upsert vote
      const { error: voteError } = await supabase
        .from('argument_votes')
        .upsert(
          {
            argument_id: argumentId,
            user_id: userId,
            vote_type: voteType,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'argument_id,user_id',
          }
        )

      if (voteError) {
        console.error('Error submitting vote:', voteError)
        return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 })
      }

      console.log(`✅ Vote submitted: ${userId} voted ${voteType} on argument ${argumentId}`)

      return NextResponse.json({ success: true, voteType })
    }
  } catch (error) {
    console.error('Error in argument vote route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/arguments/[id]/vote - Get current user's vote
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: argumentId } = await params
    const supabase = createAdminClient()

    if (!session?.user?.id) {
      return NextResponse.json({ vote: null })
    }

    const { data: vote } = await supabase
      .from('argument_votes')
      .select('vote_type')
      .eq('argument_id', argumentId)
      .eq('user_id', session.user.id)
      .single()

    return NextResponse.json({
      voteType: vote?.vote_type || null,
    })
  } catch (error) {
    console.error('Error fetching argument vote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
