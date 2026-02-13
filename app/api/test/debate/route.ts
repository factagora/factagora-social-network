import { NextRequest, NextResponse } from "next/server"
import { startDebate, executeDebateRound, getDebateStatus } from "@/lib/agents/debate-orchestrator"
import { getDebateRounds, getArguments } from "@/lib/db/debates"
import { createAdminClient } from "@/lib/supabase/server"
import { createPrediction, getPredictionById } from "@/lib/db/predictions"

/**
 * TEST-ONLY API route for debate system testing.
 * Bypasses authentication for E2E testing purposes.
 * Should NOT be deployed to production.
 */

// Store prediction ID in memory for test session
let TEST_PREDICTION_ID: string | null = null

async function getOrCreateTestPrediction() {
  // Check if we already have a prediction
  if (TEST_PREDICTION_ID) {
    const existing = await getPredictionById(TEST_PREDICTION_ID)
    if (existing) {
      return {
        id: existing.id,
        data: {
          title: existing.title,
          description: existing.description,
          category: existing.category || 'General',
          deadline: existing.deadline,
        }
      }
    }
    // Prediction was deleted, reset ID
    TEST_PREDICTION_ID = null
  }

  // Create new test prediction
  const prediction = await createPrediction({
    title: "Will AGI be achieved by end of 2026?",
    description: "Artificial General Intelligence (AGI) - an AI system that can perform any intellectual task that a human can - will be achieved by at least one major AI lab before December 31, 2026. The system must demonstrate ability to learn new tasks without specific training, reason across domains, and demonstrate general problem-solving capabilities.",
    category: "Technology",
    deadline: "2026-12-31T23:59:59Z",
  })

  if (!prediction) {
    throw new Error("Failed to create test prediction")
  }

  TEST_PREDICTION_ID = prediction.id

  return {
    id: prediction.id,
    data: {
      title: prediction.title,
      description: prediction.description,
      category: prediction.category || 'General',
      deadline: prediction.deadline,
    }
  }
}

// POST - Start debate, execute round, or cleanup
export async function POST(request: NextRequest) {
  // Block in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Test endpoint disabled in production" }, { status: 403 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const action = body.action || "start"

    if (action === "cleanup") {
      if (!TEST_PREDICTION_ID) {
        return NextResponse.json({ success: true, action: "cleanup", message: "No test data to clean" })
      }

      const supabase = createAdminClient()

      // Delete arguments first (FK to debate_rounds)
      await supabase
        .from('agent_react_cycles')
        .delete()
        .in('argument_id',
          (await supabase
            .from('arguments')
            .select('id')
            .eq('prediction_id', TEST_PREDICTION_ID)
          ).data?.map(a => a.id) || []
        )

      await supabase
        .from('arguments')
        .delete()
        .eq('prediction_id', TEST_PREDICTION_ID)

      await supabase
        .from('debate_rounds')
        .delete()
        .eq('prediction_id', TEST_PREDICTION_ID)

      // Delete the test prediction
      await supabase
        .from('predictions')
        .delete()
        .eq('id', TEST_PREDICTION_ID)

      TEST_PREDICTION_ID = null

      return NextResponse.json({ success: true, action: "cleanup", message: "Test data cleaned including prediction" })
    }

    if (action === "start") {
      const { id: predictionId, data: predictionData } = await getOrCreateTestPrediction()

      const config = {
        maxRounds: body.maxRounds || 3,
        consensusThreshold: body.consensusThreshold || 0.7,
        minAgents: body.minAgents || 2,
      }

      const result = await startDebate(predictionId, predictionData, config)
      return NextResponse.json({
        action: "start",
        predictionId,
        ...result
      })
    }

    if (action === "execute-round") {
      const { id: predictionId, data: predictionData } = await getOrCreateTestPrediction()
      const result = await executeDebateRound(predictionId, predictionData)
      return NextResponse.json({
        action: "execute-round",
        predictionId,
        ...result
      })
    }

    return NextResponse.json({ error: "Invalid action. Use 'start', 'execute-round', or 'cleanup'" }, { status: 400 })
  } catch (error: any) {
    console.error("Test debate error:", error)
    return NextResponse.json({ error: error.message || "Test debate failed" }, { status: 500 })
  }
}

// GET - Get debate status
export async function GET() {
  // Block in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Test endpoint disabled in production" }, { status: 403 })
  }

  try {
    if (!TEST_PREDICTION_ID) {
      return NextResponse.json({
        status: 'NO_DEBATE',
        message: 'No active test debate. Click "Start New Debate" to begin.',
        predictionId: null,
      })
    }

    const status = await getDebateStatus(TEST_PREDICTION_ID)
    const rounds = await getDebateRounds(TEST_PREDICTION_ID)
    const debateArgs = await getArguments(TEST_PREDICTION_ID)

    return NextResponse.json({
      predictionId: TEST_PREDICTION_ID,
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
    console.error("Test debate status error:", error)
    return NextResponse.json({ error: error.message || "Failed to get test debate status" }, { status: 500 })
  }
}
