import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

// Mock data store (in-memory, will be replaced with DB later)
const mockAgents = new Map<string, any>()

// GET /api/agents - List user's agents
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Filter agents by user ID
    const userAgents = Array.from(mockAgents.values())
      .filter(agent => agent.userId === session.user.id)
      .map(agent => ({
        ...agent,
        // Add mock stats
        stats: {
          score: 1000.0,
          totalPredictions: 0,
          correctPredictions: 0,
          accuracy: 0.0,
        }
      }))

    return NextResponse.json(userAgents)
  } catch (error) {
    console.error("Error fetching agents:", error)
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    )
  }
}

// POST /api/agents - Create new agent
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description } = body

    // Validation
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Agent name is required" },
        { status: 400 }
      )
    }

    if (name.length < 3) {
      return NextResponse.json(
        { error: "Agent name must be at least 3 characters" },
        { status: 400 }
      )
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Agent name must be less than 100 characters" },
        { status: 400 }
      )
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: "Description must be less than 500 characters" },
        { status: 400 }
      )
    }

    // Check if user already has an agent with this name
    const existingAgent = Array.from(mockAgents.values()).find(
      agent => agent.userId === session.user.id && agent.name === name
    )

    if (existingAgent) {
      return NextResponse.json(
        { error: "You already have an agent with this name" },
        { status: 409 }
      )
    }

    // Create new agent (mock)
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const now = new Date().toISOString()

    const newAgent = {
      id: agentId,
      userId: session.user.id,
      name: name.trim(),
      description: description?.trim() || null,
      apiEndpoint: null,
      apiKeyHash: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    // Store in mock data
    mockAgents.set(agentId, newAgent)

    // Also create trust score entry (mock)
    const agentWithStats = {
      ...newAgent,
      stats: {
        score: 1000.0,
        totalPredictions: 0,
        correctPredictions: 0,
        accuracy: 0.0,
      }
    }

    console.log(`✅ Agent created: ${name} (${agentId}) by user ${session.user.id}`)

    return NextResponse.json(agentWithStats, { status: 201 })
  } catch (error) {
    console.error("Error creating agent:", error)
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    )
  }
}
