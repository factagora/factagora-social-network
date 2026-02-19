// Agent Skills Management API
// GET    /api/agents/[id]/skills - Get agent's skills
// POST   /api/agents/[id]/skills - Assign skill to agent
// DELETE /api/agents/[id]/skills?skillId=xxx - Remove skill from agent

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getAgentSkills,
  assignSkillToAgent,
  removeSkillFromAgent,
  getSkillBySlug,
  getAgentSkillPerformance,
} from '@/lib/db/skills';
import { getAgentById } from '@/lib/db/agents';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ============================================================================
// GET - Get agent's assigned skills
// ============================================================================

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // Get agent skills
    const skills = await getAgentSkills(id);

    // Optionally include performance metrics
    const includePerformance = request.nextUrl.searchParams.get('performance') === 'true';
    let performance = undefined;

    if (includePerformance) {
      performance = await getAgentSkillPerformance(id);
    }

    return NextResponse.json({
      skills,
      performance,
    });
  } catch (error) {
    console.error('Error fetching agent skills:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch agent skills',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Assign skill to agent
// ============================================================================

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    const { id: agentId } = await context.params;

    // Check if user is logged in
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify agent ownership
    const agent = await getAgentById(agentId);
    if (agent.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this agent' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { skillSlug, config } = body;

    if (!skillSlug) {
      return NextResponse.json(
        { error: 'Missing required field: skillSlug' },
        { status: 400 }
      );
    }

    // Get skill by slug
    const skill = await getSkillBySlug(skillSlug);
    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Check subscription requirement
    // TODO: Implement subscription tier check
    // For now, allow all FREE skills
    if (skill.subscriptionRequirement !== 'FREE') {
      // Check if user has required subscription
      // This would check agent.subscription_tier from database
      console.warn(`Skill ${skillSlug} requires ${skill.subscriptionRequirement} tier`);
      // For MVP, we'll allow it anyway
    }

    // Assign skill to agent
    const assignment = await assignSkillToAgent(
      agentId,
      skill.id,
      config || {}
    );

    return NextResponse.json({
      success: true,
      assignment,
      skill,
    });
  } catch (error) {
    console.error('Error assigning skill to agent:', error);

    // Check for duplicate assignment error
    if (error instanceof Error && error.message.includes('duplicate')) {
      return NextResponse.json(
        { error: 'Skill already assigned to this agent' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to assign skill',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Remove skill from agent
// ============================================================================

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    const { id: agentId } = await context.params;

    // Check if user is logged in
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify agent ownership
    const agent = await getAgentById(agentId);
    if (agent.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this agent' },
        { status: 403 }
      );
    }

    // Get skillId from query params
    const skillId = request.nextUrl.searchParams.get('skillId');
    if (!skillId) {
      return NextResponse.json(
        { error: 'Missing required parameter: skillId' },
        { status: 400 }
      );
    }

    // Remove skill from agent
    await removeSkillFromAgent(agentId, skillId);

    return NextResponse.json({
      success: true,
      message: 'Skill removed from agent',
    });
  } catch (error) {
    console.error('Error removing skill from agent:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove skill',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
