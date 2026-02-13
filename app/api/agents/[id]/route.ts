import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { updateAgent, deleteAgent, getAgentById } from "@/lib/db/agents"

// PATCH /api/agents/[id] - Update agent (deactivate/activate)
export async function PATCH(
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

    const { id } = await params
    const body = await request.json()
    const {
      isActive,
      debateEnabled,
      debateSchedule,
      debateCategories,
      minConfidence,
      autoParticipate
    } = body

    // Validation
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      )
    }

    if (debateEnabled !== undefined && typeof debateEnabled !== "boolean") {
      return NextResponse.json(
        { error: "debateEnabled must be a boolean" },
        { status: 400 }
      )
    }

    if (debateSchedule !== undefined) {
      const validSchedules = ['hourly', 'twice_daily', 'daily', 'weekly', 'manual']
      if (!validSchedules.includes(debateSchedule)) {
        return NextResponse.json(
          { error: `debateSchedule must be one of: ${validSchedules.join(', ')}` },
          { status: 400 }
        )
      }
    }

    if (minConfidence !== undefined) {
      if (typeof minConfidence !== 'number' || minConfidence < 0 || minConfidence > 1) {
        return NextResponse.json(
          { error: "minConfidence must be a number between 0 and 1" },
          { status: 400 }
        )
      }
    }

    // Update agent in database
    const updateData: any = {}
    if (isActive !== undefined) updateData.isActive = isActive
    if (debateEnabled !== undefined) updateData.debateEnabled = debateEnabled
    if (debateSchedule !== undefined) updateData.debateSchedule = debateSchedule
    if (debateCategories !== undefined) updateData.debateCategories = debateCategories
    if (minConfidence !== undefined) updateData.minConfidence = minConfidence
    if (autoParticipate !== undefined) updateData.autoParticipate = autoParticipate

    const agent = await updateAgent(id, session.user.id, updateData)

    // Transform to expected format
    const updatedAgent = {
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
      // Debate configuration
      debateEnabled: (agent as any).debate_enabled ?? true,
      debateSchedule: (agent as any).debate_schedule ?? 'daily',
      debateCategories: (agent as any).debate_categories ?? null,
      minConfidence: (agent as any).min_confidence ?? 0.5,
      autoParticipate: (agent as any).auto_participate ?? true,
    }

    console.log(`✅ Agent ${isActive ? 'activated' : 'deactivated'}: ${agent.name} (${id})`)

    return NextResponse.json(updatedAgent)
  } catch (error: any) {
    console.error("Error updating agent:", error)

    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: "Agent not found or you don't have permission" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    )
  }
}

// DELETE /api/agents/[id] - Delete agent
export async function DELETE(
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

    const { id } = await params

    // Delete agent from database (function checks if inactive)
    await deleteAgent(id, session.user.id)

    console.log(`✅ Agent deleted: ${id}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting agent:", error)

    if (error.message?.includes('Cannot delete active agent')) {
      return NextResponse.json(
        { error: "Cannot delete active agent. Deactivate it first." },
        { status: 400 }
      )
    }

    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: "Agent not found or you don't have permission" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to delete agent" },
      { status: 500 }
    )
  }
}
