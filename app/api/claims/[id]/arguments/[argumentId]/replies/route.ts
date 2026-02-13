import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ClaimReplyInput } from '@/types/claim'

// POST /api/claims/[id]/arguments/[argumentId]/replies - Reply to argument
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; argumentId: string }> }
) {
  const supabase = await createClient()
  const { argumentId } = await params

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: ClaimReplyInput = await request.json()

    // Validate required fields
    if (!body.content || body.content.length < 10) {
      return NextResponse.json(
        { error: 'Content must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (
      !body.replyType ||
      !['SUPPORT', 'COUNTER', 'QUESTION', 'CLARIFY'].includes(body.replyType)
    ) {
      return NextResponse.json(
        { error: 'Reply type must be SUPPORT, COUNTER, QUESTION, or CLARIFY' },
        { status: 400 }
      )
    }

    // Check if argument exists
    const { data: argument, error: argError } = await supabase
      .from('claim_arguments')
      .select('id')
      .eq('id', argumentId)
      .single()

    if (argError || !argument) {
      return NextResponse.json({ error: 'Argument not found' }, { status: 404 })
    }

    // If parentReplyId is provided, check if it exists
    if (body.parentReplyId) {
      const { data: parentReply } = await supabase
        .from('claim_argument_replies')
        .select('id')
        .eq('id', body.parentReplyId)
        .single()

      if (!parentReply) {
        return NextResponse.json({ error: 'Parent reply not found' }, { status: 404 })
      }
    }

    // Get user name
    const { data: userData } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', session.user.id)
      .single()

    const authorName = userData?.name || userData?.email || 'Anonymous'

    // Create reply
    const { data: reply, error: createError } = await supabase
      .from('claim_argument_replies')
      .insert({
        argument_id: argumentId,
        parent_reply_id: body.parentReplyId || null,
        author_id: session.user.id,
        author_type: 'HUMAN',
        author_name: authorName,
        content: body.content,
        reply_type: body.replyType,
        evidence: body.evidence || null,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating reply:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        reply,
        message: 'Reply created successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating reply:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET /api/claims/[id]/arguments/[argumentId]/replies - Get replies for argument
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; argumentId: string }> }
) {
  const supabase = await createClient()
  const { argumentId } = await params

  try {
    // Get all replies for this argument
    const { data: replies, error } = await supabase
      .from('claim_argument_replies')
      .select('*')
      .eq('argument_id', argumentId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching replies:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Organize replies into nested structure
    const replyMap = new Map()
    const topLevelReplies: any[] = []

    // First pass: create map of all replies
    replies?.forEach((reply) => {
      replyMap.set(reply.id, { ...reply, replies: [] })
    })

    // Second pass: organize into tree structure
    replies?.forEach((reply) => {
      const replyObj = replyMap.get(reply.id)
      if (reply.parent_reply_id) {
        const parent = replyMap.get(reply.parent_reply_id)
        if (parent) {
          parent.replies.push(replyObj)
        }
      } else {
        topLevelReplies.push(replyObj)
      }
    })

    return NextResponse.json({ replies: topLevelReplies })
  } catch (error: any) {
    console.error('Error fetching replies:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
