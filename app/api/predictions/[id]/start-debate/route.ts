import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { startDebate } from "@/lib/agents/debate-orchestrator"
import { getPredictionById } from "@/lib/db/predictions"

/**
 * POST /api/predictions/[id]/start-debate
 * 
 * Start a new multi-round debate for a prediction
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
      maxRounds: body.maxRounds || 5,
      consensusThreshold: body.consensusThreshold || 0.7,
      minAgents: body.minAgents || 2,
    }

    // Prepare prediction data for debate
    const predictionData = {
      title: prediction.title,
      description: prediction.description,
      category: prediction.category || 'General',
      deadline: prediction.deadline,
    }

    // Start the debate
    const result = await startDebate(predictionId, predictionData, config)

    console.log(`🎭 Debate started for prediction ${predictionId}`)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error starting debate:", error)
    return NextResponse.json(
      { error: error.message || "Failed to start debate" },
      { status: 500 }
    )
  }
}
