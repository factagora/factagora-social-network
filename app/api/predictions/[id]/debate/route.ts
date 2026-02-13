import { NextRequest, NextResponse } from "next/server"
import { getDebateStatus } from "@/lib/agents/debate-orchestrator"
import { getDebateRounds, getArguments } from "@/lib/db/debates"

/**
 * GET /api/predictions/[id]/debate
 * 
 * Get the current debate status and history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: predictionId } = await params

    // Get debate status
    const status = await getDebateStatus(predictionId)

    // Get all rounds
    const rounds = await getDebateRounds(predictionId)

    // Get all arguments
    const debateArgs = await getArguments(predictionId)

    return NextResponse.json({
      status: status.status,
      currentRound: status.currentRound,
      isComplete: status.isComplete,
      consensus: status.consensus,
      positionDistribution: status.positionDistribution,
      avgConfidence: status.avgConfidence,
      terminationReason: status.terminationReason,
      totalArguments: status.totalArguments,
      rounds: rounds.map(r => ({
        roundNumber: r.round_number,
        startedAt: r.started_at,
        endedAt: r.ended_at,
        consensus: r.consensus_score,
        positionDistribution: r.position_distribution,
        avgConfidence: r.avg_confidence,
        argumentsSubmitted: r.arguments_submitted,
        isFinal: r.is_final,
        terminationReason: r.termination_reason,
      })),
      arguments: debateArgs.map(a => ({
        id: a.id,
        authorId: a.author_id,
        authorType: a.author_type,
        position: a.position,
        content: a.content,
        reasoning: a.reasoning,
        confidence: a.confidence,
        roundNumber: a.round_number,
        createdAt: a.created_at,
      })),
    })
  } catch (error: any) {
    console.error("Error getting debate status:", error)
    return NextResponse.json(
      { error: error.message || "Failed to get debate status" },
      { status: 500 }
    )
  }
}
