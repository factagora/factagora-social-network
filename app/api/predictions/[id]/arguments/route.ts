import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/server"
import {
  ArgumentCreateInput,
  ARGUMENT_CONTENT_MIN_LENGTH,
  ARGUMENT_CONTENT_MAX_LENGTH,
  ARGUMENT_REASONING_MAX_LENGTH,
  MAX_EVIDENCE_ITEMS
} from "@/types/debate"

// Helper to get participant info
async function getParticipantInfo(userId: string) {
  const supabase = createAdminClient()

  // Check if user has an active agent
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

  // Otherwise, user is participating as human
  return {
    type: 'HUMAN' as const,
    id: userId,
    name: 'Human User', // TODO: Get from auth.users
  }
}

// Helper to check if prediction exists
async function getPrediction(predictionId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('id', predictionId)
    .single()

  return data
}

// POST /api/predictions/[id]/arguments - Submit argument
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

    const { id: predictionId } = await params
    const supabase = createAdminClient()

    // Check if prediction exists
    const prediction = await getPrediction(predictionId)
    if (!prediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      )
    }

    // Check if prediction is still open
    if (prediction.resolution_value !== null) {
      return NextResponse.json(
        { error: "This prediction has already been resolved" },
        { status: 400 }
      )
    }

    // Check if deadline has passed
    if (new Date(prediction.deadline) < new Date()) {
      return NextResponse.json(
        { error: "Prediction deadline has passed" },
        { status: 400 }
      )
    }

    // Get participant info (AI agent or human)
    const participant = isGuest
      ? { type: 'HUMAN' as const, id: userId, name: 'Guest User' }
      : await getParticipantInfo(userId)

    // Check if already submitted argument
    const { data: existingArgument } = await supabase
      .from('arguments')
      .select('id')
      .eq('prediction_id', predictionId)
      .eq('author_id', participant.id)
      .eq('author_type', participant.type)
      .single()

    if (existingArgument) {
      return NextResponse.json(
        { error: "You have already submitted an argument for this prediction" },
        { status: 409 }
      )
    }

    const body: ArgumentCreateInput = await request.json()
    const { position, content, evidence, reasoning, confidence } = body

    // Validation
    if (!position || !['YES', 'NO', 'NEUTRAL'].includes(position)) {
      return NextResponse.json(
        { error: "Position must be YES, NO, or NEUTRAL" },
        { status: 400 }
      )
    }

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    if (content.length < ARGUMENT_CONTENT_MIN_LENGTH) {
      return NextResponse.json(
        { error: `Content must be at least ${ARGUMENT_CONTENT_MIN_LENGTH} characters` },
        { status: 400 }
      )
    }

    if (content.length > ARGUMENT_CONTENT_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Content must be less than ${ARGUMENT_CONTENT_MAX_LENGTH} characters` },
        { status: 400 }
      )
    }

    if (reasoning && reasoning.length > ARGUMENT_REASONING_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Reasoning must be less than ${ARGUMENT_REASONING_MAX_LENGTH} characters` },
        { status: 400 }
      )
    }

    if (evidence && evidence.length > MAX_EVIDENCE_ITEMS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_EVIDENCE_ITEMS} evidence items allowed` },
        { status: 400 }
      )
    }

    if (typeof confidence !== "number" || confidence < 0 || confidence > 1) {
      return NextResponse.json(
        { error: "Confidence must be a number between 0 and 1" },
        { status: 400 }
      )
    }

    // Create new argument in Supabase
    const { data: newArgument, error: insertError } = await supabase
      .from('arguments')
      .insert({
        prediction_id: predictionId,
        author_id: participant.id,
        author_type: participant.type,
        position,
        content: content.trim(),
        evidence: evidence || null,
        reasoning: reasoning?.trim() || null,
        confidence,
      })
      .select(`
        *,
        argument_quality(*)
      `)
      .single()

    if (insertError) {
      console.error("Error inserting argument:", insertError)
      return NextResponse.json(
        { error: "Failed to submit argument", details: insertError.message, code: insertError.code },
        { status: 500 }
      )
    }

    // Get reply count (for stats)
    const { count: replyCount } = await supabase
      .from('argument_replies')
      .select('*', { count: 'exact', head: true })
      .eq('argument_id', newArgument.id)

    // Format response
    const response = {
      id: newArgument.id,
      predictionId: newArgument.prediction_id,
      authorId: newArgument.author_id,
      authorType: newArgument.author_type,
      authorName: participant.name,
      position: newArgument.position,
      content: newArgument.content,
      evidence: newArgument.evidence || [],
      reasoning: newArgument.reasoning,
      confidence: newArgument.confidence,
      createdAt: newArgument.created_at,
      updatedAt: newArgument.updated_at,
      replyCount: replyCount || 0,
      qualityScore: (newArgument.argument_quality?.evidence_strength || 0.5) * 100,
      supportCount: 0, // TODO: Calculate from replies
      counterCount: 0, // TODO: Calculate from replies
    }

    console.log(
      `✅ Argument submitted: ${participant.name} (${participant.type}) ` +
      `voted ${position} with ${(confidence * 100).toFixed(0)}% confidence ` +
      `on prediction ${predictionId}`
    )

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Error submitting argument:", error)
    return NextResponse.json(
      { error: "Failed to submit argument" },
      { status: 500 }
    )
  }
}

// GET /api/predictions/[id]/arguments - Get arguments with sorting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: predictionId } = await params
    const supabase = createAdminClient()

    // Check if prediction exists
    const prediction = await getPrediction(predictionId)
    if (!prediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get("sort") || "best" // best, new, position
    const position = searchParams.get("position") // YES, NO, NEUTRAL, all

    // Build query
    let query = supabase
      .from('arguments')
      .select(`
        *,
        argument_quality(
          evidence_strength,
          logical_coherence,
          community_score
        ),
        agent_react_cycles!agent_react_cycles_argument_id_fkey(*)
      `)
      .eq('prediction_id', predictionId)

    // Filter by position
    if (position && position !== "all") {
      query = query.eq('position', position.toUpperCase())
    }

    // Sort
    switch (sortBy) {
      case "new":
        query = query.order('created_at', { ascending: false })
        break
      case "position":
        // PostgreSQL custom ordering: YES=0, NO=1, NEUTRAL=2
        query = query.order('position', { ascending: true })
        break
      case "best":
      default:
        // Sort by quality score (using evidence_strength as proxy)
        // In production, join with argument_quality and sort by composite score
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data: args, error } = await query

    if (error) {
      console.error("Error fetching arguments:", error)
      return NextResponse.json(
        { error: "Failed to fetch arguments" },
        { status: 500 }
      )
    }

    // Get reply counts for each argument
    const argsWithCounts = await Promise.all(
      (args || []).map(async (arg: any) => {
        const { count: replyCount } = await supabase
          .from('argument_replies')
          .select('*', { count: 'exact', head: true })
          .eq('argument_id', arg.id)

        const { count: supportCount } = await supabase
          .from('argument_replies')
          .select('*', { count: 'exact', head: true })
          .eq('argument_id', arg.id)
          .eq('reply_type', 'SUPPORT')

        const { count: counterCount } = await supabase
          .from('argument_replies')
          .select('*', { count: 'exact', head: true })
          .eq('argument_id', arg.id)
          .eq('reply_type', 'COUNTER')

        return {
          id: arg.id,
          predictionId: arg.prediction_id,
          authorId: arg.author_id,
          authorType: arg.author_type,
          authorName: arg.author_name || (arg.author_type === 'AI_AGENT' ? 'AI Agent' : 'Human'),
          position: arg.position,
          content: arg.content,
          evidence: arg.evidence || [],
          reasoning: arg.reasoning,
          confidence: arg.confidence,
          roundNumber: arg.round_number || 1,
          createdAt: arg.created_at,
          updatedAt: arg.updated_at,
          replyCount: replyCount || 0,
          qualityScore: (arg.argument_quality?.evidence_strength || 0.5) * 100,
          supportCount: supportCount || 0,
          counterCount: counterCount || 0,
          reactCycle: arg.agent_react_cycles?.[0] || null,
          // Reddit-style voting
          upvotes: arg.upvotes || 0,
          downvotes: arg.downvotes || 0,
          score: arg.score || 0,
        }
      })
    )

    // Calculate statistics
    const totalArguments = argsWithCounts.length
    const yesCount = argsWithCounts.filter(a => a.position === 'YES').length
    const noCount = argsWithCounts.filter(a => a.position === 'NO').length
    const neutralCount = argsWithCounts.filter(a => a.position === 'NEUTRAL').length

    const byType = {
      aiAgents: {
        total: argsWithCounts.filter(a => a.authorType === 'AI_AGENT').length,
        yes: argsWithCounts.filter(a => a.authorType === 'AI_AGENT' && a.position === 'YES').length,
        no: argsWithCounts.filter(a => a.authorType === 'AI_AGENT' && a.position === 'NO').length,
      },
      humans: {
        total: argsWithCounts.filter(a => a.authorType === 'HUMAN').length,
        yes: argsWithCounts.filter(a => a.authorType === 'HUMAN' && a.position === 'YES').length,
        no: argsWithCounts.filter(a => a.authorType === 'HUMAN' && a.position === 'NO').length,
      },
    }

    return NextResponse.json({
      prediction: {
        id: prediction.id,
        title: prediction.title,
        description: prediction.description,
        category: prediction.category,
        deadline: prediction.deadline,
        resolutionDate: prediction.resolution_date,
        resolutionValue: prediction.resolution_value,
      },
      arguments: argsWithCounts,
      stats: {
        total: totalArguments,
        yes: yesCount,
        no: noCount,
        neutral: neutralCount,
        byType,
      },
    })
  } catch (error) {
    console.error("Error fetching arguments:", error)
    return NextResponse.json(
      { error: "Failed to fetch arguments" },
      { status: 500 }
    )
  }
}
