import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

// Mock data stores (shared with other routes)
const mockVotes = new Map<string, any>()

// Helper to get agent by user ID (from agents API mock data)
async function getUserAgent(userId: string) {
  // In production, this would query the database
  // For now, we'll import from the agents route
  const { mockAgents } = await import("@/app/api/agents/route")
  const userAgents = Array.from(mockAgents.values()).filter(
    agent => agent.userId === userId && agent.isActive
  )
  return userAgents[0] || null
}

// Helper to get mock prediction
async function getPrediction(predictionId: string) {
  const { mockPredictions } = await import("@/app/api/predictions/route")
  return mockPredictions.get(predictionId) || null
}

// POST /api/predictions/[id]/vote - Submit vote for a prediction
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const predictionId = params.id

    // Check if prediction exists
    const prediction = await getPrediction(predictionId)
    if (!prediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      )
    }

    // Check if prediction is still open
    if (prediction.resolutionValue !== null) {
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

    // Get user's agent
    const agent = await getUserAgent(session.user.id)
    if (!agent) {
      return NextResponse.json(
        { error: "You must register an agent before voting" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { vote, confidence, reasoning } = body

    // Validation
    if (typeof vote !== "boolean") {
      return NextResponse.json(
        { error: "Vote must be true (YES) or false (NO)" },
        { status: 400 }
      )
    }

    if (typeof confidence !== "number" || confidence < 0 || confidence > 1) {
      return NextResponse.json(
        { error: "Confidence must be a number between 0 and 1" },
        { status: 400 }
      )
    }

    if (reasoning && reasoning.length > 1000) {
      return NextResponse.json(
        { error: "Reasoning must be less than 1000 characters" },
        { status: 400 }
      )
    }

    // Check if agent already voted on this prediction
    const existingVote = Array.from(mockVotes.values()).find(
      v => v.predictionId === predictionId && v.agentId === agent.id
    )

    if (existingVote) {
      return NextResponse.json(
        { error: "Your agent has already voted on this prediction" },
        { status: 409 }
      )
    }

    // Create new vote (mock)
    const voteId = `vote_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const now = new Date().toISOString()

    const newVote = {
      id: voteId,
      predictionId,
      agentId: agent.id,
      vote,
      confidence,
      reasoning: reasoning?.trim() || null,
      votedAt: now,
    }

    // Store in mock data
    mockVotes.set(voteId, newVote)

    console.log(
      `✅ Vote submitted: Agent ${agent.name} voted ${vote ? "YES" : "NO"} ` +
      `(${(confidence * 100).toFixed(0)}% confidence) on prediction ${predictionId}`
    )

    return NextResponse.json(newVote, { status: 201 })
  } catch (error) {
    console.error("Error submitting vote:", error)
    return NextResponse.json(
      { error: "Failed to submit vote" },
      { status: 500 }
    )
  }
}

// GET /api/predictions/[id]/vote - Get votes for a prediction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const predictionId = params.id

    // Check if prediction exists
    const prediction = await getPrediction(predictionId)
    if (!prediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      )
    }

    // Get all votes for this prediction
    const votes = Array.from(mockVotes.values()).filter(
      v => v.predictionId === predictionId
    )

    // Calculate statistics
    const totalVotes = votes.length
    const yesVotes = votes.filter(v => v.vote === true).length
    const noVotes = votes.filter(v => v.vote === false).length
    const yesPercentage = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0

    return NextResponse.json({
      prediction,
      votes,
      stats: {
        totalVotes,
        yesVotes,
        noVotes,
        yesPercentage: Math.round(yesPercentage * 10) / 10,
      },
    })
  } catch (error) {
    console.error("Error fetching votes:", error)
    return NextResponse.json(
      { error: "Failed to fetch votes" },
      { status: 500 }
    )
  }
}

// Export mock data for access in other routes
export { mockVotes }
