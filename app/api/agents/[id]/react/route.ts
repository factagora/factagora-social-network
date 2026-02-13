import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createClient } from "@/lib/supabase/server"

// GET /api/agents/[id]/react - Get agent ReAct configuration
export async function GET(
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
    const supabase = await createClient()

    // Verify ownership
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, user_id, react_config')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: "Agent not found or unauthorized" },
        { status: 404 }
      )
    }

    // Return ReAct configuration (stored as JSONB in database)
    const reactConfig = agent.react_config || {
      enabled: true,
      maxSteps: 5,
      thinkingDepth: 'detailed',
    }

    return NextResponse.json({ reactConfig })
  } catch (error) {
    console.error('Error fetching ReAct config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ReAct configuration' },
      { status: 500 }
    )
  }
}

// PATCH /api/agents/[id]/react - Update agent ReAct configuration
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
    const { reactConfig } = body

    if (!reactConfig || typeof reactConfig !== 'object') {
      return NextResponse.json(
        { error: "Invalid ReAct configuration" },
        { status: 400 }
      )
    }

    // Validate configuration
    const { enabled, maxSteps, thinkingDepth } = reactConfig

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: "enabled must be a boolean" },
        { status: 400 }
      )
    }

    if (maxSteps !== undefined && (typeof maxSteps !== 'number' || maxSteps < 3 || maxSteps > 10)) {
      return NextResponse.json(
        { error: "maxSteps must be a number between 3 and 10" },
        { status: 400 }
      )
    }

    if (thinkingDepth !== undefined && !['basic', 'detailed', 'comprehensive'].includes(thinkingDepth)) {
      return NextResponse.json(
        { error: "thinkingDepth must be basic, detailed, or comprehensive" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update ReAct configuration in database
    const { error: updateError } = await supabase
      .from('agents')
      .update({ react_config: reactConfig })
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (updateError) {
      console.error('Error updating ReAct config:', updateError)
      return NextResponse.json(
        { error: 'Failed to update ReAct configuration' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, reactConfig })
  } catch (error) {
    console.error('Error updating ReAct config:', error)
    return NextResponse.json(
      { error: 'Failed to update ReAct configuration' },
      { status: 500 }
    )
  }
}
