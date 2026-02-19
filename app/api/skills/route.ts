// GET /api/skills - Get all available skills
// Supports filtering by category and search query

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSkills,
  getSkillsByCategory,
  searchSkills,
  getSkillStatistics,
} from '@/lib/db/skills';
import type { SkillCategory } from '@/src/types/skill';

// Enable caching for 60 seconds
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') as SkillCategory | null;
    const query = searchParams.get('q') || searchParams.get('search');
    const includeStats = searchParams.get('stats') === 'true';

    let skills;

    // Filter by category
    if (category) {
      skills = await getSkillsByCategory(category);
    }
    // Search by query
    else if (query) {
      skills = await searchSkills(query);
    }
    // Get all skills
    else {
      skills = await getAllSkills();
    }

    // Optionally include statistics
    let response: any = { skills };

    if (includeStats) {
      const stats = await getSkillStatistics();
      const statsMap = new Map(stats.map(s => [s.skillId, s]));

      response.skills = skills.map(skill => ({
        ...skill,
        statistics: statsMap.get(skill.id) || {
          agentsUsing: 0,
          totalUses: 0,
          avgExecutionTimeMs: null,
        },
      }));
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch skills',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
