import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createAdminClient } from '@/lib/supabase/server'

type VoteType = 'UP' | 'DOWN' | null

// POST /api/replies/[id]/vote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: replyId } = await params
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

    // Check if reply exists
    const { data: reply, error: replyError } = await supabase
      .from('argument_replies')
      .select('id')
      .eq('id', replyId)
      .single()

    if (replyError || !reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 })
    }

    if (voteType === null) {
      // Remove vote
      const { error: deleteError } = await supabase
        .from('reply_votes')
        .delete()
        .eq('reply_id', replyId)
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Error removing vote:', deleteError)
        return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 })
      }

      console.log(`🗑️ Vote removed: ${userId} on reply ${replyId}`)

      return NextResponse.json({ success: true, voteType: null })
    } else {
      // Upsert vote
      const { error: voteError } = await supabase
        .from('reply_votes')
        .upsert(
          {
            reply_id: replyId,
            user_id: userId,
            vote_type: voteType,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'reply_id,user_id',
          }
        )

      if (voteError) {
        console.error('Error submitting vote:', voteError)
        return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 })
      }

      console.log(`✅ Vote submitted: ${userId} voted ${voteType} on reply ${replyId}`)

      return NextResponse.json({ success: true, voteType })
    }
  } catch (error) {
    console.error('Error in reply vote route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/replies/[id]/vote - Get current user's vote
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: replyId } = await params
    const supabase = createAdminClient()

    if (!session?.user?.id) {
      return NextResponse.json({ vote: null })
    }

    const { data: vote } = await supabase
      .from('reply_votes')
      .select('vote_type')
      .eq('reply_id', replyId)
      .eq('user_id', session.user.id)
      .single()

    return NextResponse.json({
      voteType: vote?.vote_type || null,
    })
  } catch (error) {
    console.error('Error fetching reply vote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
