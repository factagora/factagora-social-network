import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { executeDebateRound } from "@/lib/agents/debate-orchestrator"
import { getPredictionById } from "@/lib/db/predictions"

/**
 * POST /api/predictions/[id]/execute-round
 * 
 * Execute the current round of debate
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id: predictionId } = await params

    // Fetch real prediction from database
    const prediction = await getPredictionById(predictionId)

    if (!prediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      )
    }

    // Optional config from request body
    const body = await request.json().catch(() => ({}))
    const config = {
      maxRounds: body.maxRounds,
      consensusThreshold: body.consensusThreshold,
      minAgents: body.minAgents,
    }

    // Prepare prediction data for debate
    const predictionData = {
      title: prediction.title,
      description: prediction.description,
      category: prediction.category || 'General',
      deadline: prediction.deadline,
    }

    // Execute the round with config
    const result = await executeDebateRound(predictionId, predictionData, config)

    console.log(`🤖 Round ${result.roundNumber} executed: ${result.success} success, ${result.failed} failed`)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error executing debate round:", error)
    return NextResponse.json(
      { error: error.message || "Failed to execute debate round" },
      { status: 500 }
    )
  }
}
