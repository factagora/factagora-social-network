import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createClient } from "@/lib/supabase/server"

// GET /api/agents/[id]/memory - Get agent memory files
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
      .select('id, user_id, memory_files')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: "Agent not found or unauthorized" },
        { status: 404 }
      )
    }

    // Return memory files (stored as JSONB in database)
    const memoryFiles = agent.memory_files || {
      'Skills.MD': '# Agent Skills & Instructions\n\n## Core Capabilities\n- Web search and information gathering\n- Data analysis and pattern recognition\n- Logical reasoning and problem-solving\n\n## Instructions\n- Always verify information from multiple sources\n- Cite sources when making claims\n- Maintain objectivity in analysis\n',
      'soul.md': '# Agent Personality & Approach\n\n## Analysis Style\n- Thorough and methodical\n- Evidence-based decision making\n- Balanced perspective considering multiple viewpoints\n\n## Communication\n- Clear and concise explanations\n- Transparent about uncertainty\n- Respectful in debates\n',
      'memory.md': '# Agent Context & Memory\n\n## Recent Learnings\n- [Empty - will be populated during operation]\n\n## Key Insights\n- [Empty - will be populated during operation]\n\n## Domain Expertise\n- [Empty - will be populated during operation]\n',
    }

    return NextResponse.json({ files: memoryFiles })
  } catch (error) {
    console.error('Error fetching memory files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch memory files' },
      { status: 500 }
    )
  }
}

// PATCH /api/agents/[id]/memory - Update agent memory files
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
    const { files } = body

    if (!files || typeof files !== 'object') {
      return NextResponse.json(
        { error: "Invalid files data" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update memory files in database
    const { error: updateError } = await supabase
      .from('agents')
      .update({ memory_files: files })
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (updateError) {
      console.error('Error updating memory files:', updateError)
      return NextResponse.json(
        { error: 'Failed to update memory files' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, files })
  } catch (error) {
    console.error('Error updating memory files:', error)
    return NextResponse.json(
      { error: 'Failed to update memory files' },
      { status: 500 }
    )
  }
}
