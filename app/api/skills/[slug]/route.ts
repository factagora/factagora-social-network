// GET /api/skills/[slug] - Get skill details by slug

import { NextRequest, NextResponse } from 'next/server';
import { getSkillBySlug, getSkillUsageLogs } from '@/lib/db/skills';

export const revalidate = 60;

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { slug } = await context.params;

    const skill = await getSkillBySlug(slug);

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Optionally include recent usage logs
    const includeLogs = request.nextUrl.searchParams.get('logs') === 'true';
    let usageLogs = undefined;

    if (includeLogs) {
      usageLogs = await getSkillUsageLogs(skill.id, 20);
    }

    return NextResponse.json({
      skill,
      usageLogs,
    });
  } catch (error) {
    console.error('Error fetching skill:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch skill',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
