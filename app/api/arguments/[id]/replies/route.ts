import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/server"
import {
  ReplyCreateInput,
  REPLY_CONTENT_MIN_LENGTH,
  REPLY_CONTENT_MAX_LENGTH,
  MAX_EVIDENCE_ITEMS,
  MAX_REPLY_DEPTH
} from "@/types/debate"

// Helper to get participant info
async function getParticipantInfo(userId: string) {
  const supabase = createAdminClient()

  const { data: agents } = await supabase
    .from('agents')
    .select('id, name')
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(1)

  if (agents && agents.length > 0) {
    return {
      type: 'AI_AGENT' as const,
      id: agents[0].id,
      name: agents[0].name,
    }
  }

  return {
    type: 'HUMAN' as const,
    id: userId,
    name: 'Human User',
  }
}

// Helper to get argument
async function getArgument(argumentId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('arguments')
    .select('*')
    .eq('id', argumentId)
    .single()

  return data
}

// Helper to calculate reply depth recursively
async function calculateReplyDepth(parentReplyId: string | null): Promise<number> {
  if (!parentReplyId) return 0

  const supabase = createAdminClient()
  let depth = 1
  let currentId = parentReplyId

  while (currentId) {
    const { data: reply } = await supabase
      .from('argument_replies')
      .select('parent_reply_id')
      .eq('id', currentId)
      .single()

    if (!reply || !reply.parent_reply_id) break
    depth++
    currentId = reply.parent_reply_id
  }

  return depth
}

// Helper to build nested reply tree
function buildReplyTree(replies: any[], parentId: string | null = null, agentMap?: Map<string, string>): any[] {
  return replies
    .filter(r => r.parent_reply_id === parentId)
    .map(reply => ({
      id: reply.id,
      argumentId: reply.argument_id,
      parentReplyId: reply.parent_reply_id,
      authorId: reply.author_id,
      authorType: reply.author_type,
      authorName: reply.author_type === 'AI_AGENT' && agentMap
        ? agentMap.get(reply.author_id) || 'AI Agent'
        : reply.author_type === 'AI_AGENT'
          ? 'AI Agent'
          : 'Human',
      content: reply.content,
      replyType: reply.reply_type,
      evidence: reply.evidence || [],
      createdAt: reply.created_at,
      // Reddit-style voting
      upvotes: reply.upvotes || 0,
      downvotes: reply.downvotes || 0,
      score: reply.score || 0,
      qualityScore: 0, // TODO: Calculate quality score for replies
      replies: buildReplyTree(replies, reply.id, agentMap),
    }))
}

// POST /api/arguments/[id]/replies - Submit reply
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    // TEMPORARY: Allow guest submissions for testing
    // TODO: Remove this and require proper authentication
    // Generate a proper UUID for guest users
    const userId = session?.user?.id || crypto.randomUUID()
    const isGuest = !session?.user?.id

    const { id: argumentId } = await params
    const supabase = createAdminClient()

    // Check if argument exists
    const argument = await getArgument(argumentId)
    if (!argument) {
      return NextResponse.json(
        { error: "Argument not found" },
        { status: 404 }
      )
    }

    const participant = isGuest
      ? { type: 'HUMAN' as const, id: userId, name: 'Guest User' }
      : await getParticipantInfo(userId)

    const body: ReplyCreateInput = await request.json()
    const { content, replyType, evidence, parentReplyId } = body

    // Validation
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    if (content.length < REPLY_CONTENT_MIN_LENGTH) {
      return NextResponse.json(
        { error: `Content must be at least ${REPLY_CONTENT_MIN_LENGTH} characters` },
        { status: 400 }
      )
    }

    if (content.length > REPLY_CONTENT_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Content must be less than ${REPLY_CONTENT_MAX_LENGTH} characters` },
        { status: 400 }
      )
    }

    if (!replyType || !['SUPPORT', 'COUNTER', 'QUESTION', 'CLARIFY'].includes(replyType)) {
      return NextResponse.json(
        { error: "Reply type must be SUPPORT, COUNTER, QUESTION, or CLARIFY" },
        { status: 400 }
      )
    }

    if (evidence && evidence.length > MAX_EVIDENCE_ITEMS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_EVIDENCE_ITEMS} evidence items allowed` },
        { status: 400 }
      )
    }

    // Check parent reply if nested
    if (parentReplyId) {
      const { data: parentReply } = await supabase
        .from('argument_replies')
        .select('id')
        .eq('id', parentReplyId)
        .single()

      if (!parentReply) {
        return NextResponse.json(
          { error: "Parent reply not found" },
          { status: 404 }
        )
      }

      // Check depth limit
      const depth = await calculateReplyDepth(parentReplyId)
      if (depth >= MAX_REPLY_DEPTH) {
        return NextResponse.json(
          { error: `Maximum reply depth of ${MAX_REPLY_DEPTH} levels reached` },
          { status: 400 }
        )
      }
    }

    // Create new reply in Supabase
    const { data: newReply, error: insertError } = await supabase
      .from('argument_replies')
      .insert({
        argument_id: argumentId,
        parent_reply_id: parentReplyId || null,
        author_id: participant.id,
        author_type: participant.type,
        content: content.trim(),
        reply_type: replyType,
        evidence: evidence || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting reply:", insertError)
      return NextResponse.json(
        { error: "Failed to submit reply" },
        { status: 500 }
      )
    }

    // Format response
    const response = {
      id: newReply.id,
      argumentId: newReply.argument_id,
      parentReplyId: newReply.parent_reply_id,
      authorId: newReply.author_id,
      authorType: newReply.author_type,
      authorName: participant.name,
      content: newReply.content,
      replyType: newReply.reply_type,
      evidence: newReply.evidence || [],
      createdAt: newReply.created_at,
      replyCount: 0, // Nested replies count (TODO: calculate)
    }

    console.log(
      `✅ Reply submitted: ${participant.name} (${participant.type}) ` +
      `${replyType.toLowerCase()}s argument ${argumentId}`
    )

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Error submitting reply:", error)
    return NextResponse.json(
      { error: "Failed to submit reply" },
      { status: 500 }
    )
  }
}

// GET /api/arguments/[id]/replies - Get reply tree
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: argumentId } = await params
    const supabase = createAdminClient()

    // Check if argument exists
    const argument = await getArgument(argumentId)
    if (!argument) {
      return NextResponse.json(
        { error: "Argument not found" },
        { status: 404 }
      )
    }

    // Get all replies for this argument
    const { data: allReplies, error } = await supabase
      .from('argument_replies')
      .select('*')
      .eq('argument_id', argumentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching replies:", error)
      return NextResponse.json(
        { error: "Failed to fetch replies" },
        { status: 500 }
      )
    }

    // Get all agents for name lookup
    const { data: agents } = await supabase
      .from('agents')
      .select('id, name')

    const agentMap = new Map()
    if (agents) {
      agents.forEach((a) => agentMap.set(a.id, a.name))
    }

    // Build nested tree
    const replyTree = buildReplyTree(allReplies || [], null, agentMap)

    // Calculate statistics
    const stats = {
      total: allReplies?.length || 0,
      support: allReplies?.filter(r => r.reply_type === 'SUPPORT').length || 0,
      counter: allReplies?.filter(r => r.reply_type === 'COUNTER').length || 0,
      question: allReplies?.filter(r => r.reply_type === 'QUESTION').length || 0,
      clarify: allReplies?.filter(r => r.reply_type === 'CLARIFY').length || 0,
      byType: {
        aiAgents: allReplies?.filter(r => r.author_type === 'AI_AGENT').length || 0,
        humans: allReplies?.filter(r => r.author_type === 'HUMAN').length || 0,
      },
    }

    return NextResponse.json({
      argument: {
        id: argument.id,
        predictionId: argument.prediction_id,
        authorId: argument.author_id,
        authorType: argument.author_type,
        position: argument.position,
        content: argument.content,
        confidence: argument.confidence,
      },
      replies: replyTree,
      stats,
    })
  } catch (error) {
    console.error("Error fetching replies:", error)
    return NextResponse.json(
      { error: "Failed to fetch replies" },
      { status: 500 }
    )
  }
}
