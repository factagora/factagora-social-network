import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getUserAgents, createAgent } from "@/lib/db/agents"

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

    // Get agents from database
    const agents = await getUserAgents(session.user.id)

    // Transform to expected format
    const userAgents = agents.map(agent => ({
      id: agent.id,
      userId: agent.user_id,
      mode: agent.mode,
      name: agent.name,
      description: agent.description,
      personality: agent.personality,
      temperature: agent.temperature,
      model: agent.model,
      webhookUrl: agent.webhook_url,
      isActive: agent.is_active,
      createdAt: agent.created_at,
      updatedAt: agent.updated_at,
      stats: {
        score: 1000.0,
        totalPredictions: agent.total_react_cycles || 0,
        correctPredictions: 0,
        accuracy: agent.avg_evidence_quality || 0.0,
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
    const {
      mode, name, description, personality, temperature, model, webhookUrl, authToken,
      // Agent Manager fields
      reactConfig, memoryFiles, debateSchedule, debateCategories, minConfidence
    } = body

    // Validation
    if (!mode || !['MANAGED', 'BYOA'].includes(mode)) {
      return NextResponse.json(
        { error: "Invalid agent mode" },
        { status: 400 }
      )
    }

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

    // Mode-specific validation
    if (mode === 'MANAGED') {
      const validPersonalities = ['SKEPTIC', 'OPTIMIST', 'DATA_ANALYST', 'DOMAIN_EXPERT', 'CONTRARIAN', 'MEDIATOR']
      if (!personality || !validPersonalities.includes(personality)) {
        return NextResponse.json(
          { error: "Valid personality is required for managed agents" },
          { status: 400 }
        )
      }
      if (temperature !== undefined && (temperature < 0 || temperature > 1)) {
        return NextResponse.json(
          { error: "Temperature must be between 0 and 1" },
          { status: 400 }
        )
      }
    } else if (mode === 'BYOA') {
      if (!webhookUrl || typeof webhookUrl !== 'string') {
        return NextResponse.json(
          { error: "Webhook URL is required for BYOA agents" },
          { status: 400 }
        )
      }
      if (!authToken || typeof authToken !== 'string') {
        return NextResponse.json(
          { error: "Authentication token is required for BYOA agents" },
          { status: 400 }
        )
      }
      try {
        new URL(webhookUrl)
      } catch {
        return NextResponse.json(
          { error: "Invalid webhook URL format" },
          { status: 400 }
        )
      }
    }

    // Check if user already has an agent with this name
    const existingAgents = await getUserAgents(session.user.id)
    const existingAgent = existingAgents.find(
      agent => agent.name.toLowerCase() === name.trim().toLowerCase()
    )

    if (existingAgent) {
      return NextResponse.json(
        { error: "You already have an agent with this name" },
        { status: 409 }
      )
    }

    // Create new agent in database
    const agent = await createAgent({
      userId: session.user.id,
      mode,
      name: name.trim(),
      description: description?.trim(),
      personality: mode === 'MANAGED' ? personality : undefined,
      temperature: mode === 'MANAGED' ? (temperature || 0.7) : undefined,
      model: mode === 'MANAGED' ? (model || 'claude-sonnet-4-5') : undefined,
      webhookUrl: mode === 'BYOA' ? webhookUrl : undefined,
      authToken: mode === 'BYOA' ? authToken : undefined, // TODO: Hash this in production!
      // Agent Manager fields
      reactConfig: mode === 'MANAGED' ? reactConfig : undefined,
      memoryFiles: mode === 'MANAGED' ? memoryFiles : undefined,
      debateSchedule: debateSchedule || 'daily',
      debateCategories,
      minConfidence: minConfidence || 0.5,
    })

    // Transform to expected format
    const agentWithStats = {
      id: agent.id,
      userId: agent.user_id,
      mode: agent.mode,
      name: agent.name,
      description: agent.description,
      personality: agent.personality,
      temperature: agent.temperature,
      model: agent.model,
      webhookUrl: agent.webhook_url,
      isActive: agent.is_active,
      createdAt: agent.created_at,
      updatedAt: agent.updated_at,
      stats: {
        score: 1000.0,
        totalPredictions: 0,
        correctPredictions: 0,
        accuracy: 0.0,
      }
    }

    console.log(`✅ ${mode} Agent created: ${name} (${agent.id}) by user ${session.user.id}`)

    return NextResponse.json(agentWithStats, { status: 201 })
  } catch (error) {
    console.error("Error creating agent:", error)
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    )
  }
}
