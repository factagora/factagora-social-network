import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/leaderboard - Get leaderboard
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const sortBy = searchParams.get('sortBy') || 'points' // points, accuracy, reputation
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    let query = supabase
      .from('user_stats')
      .select(`
        *,
        user:user_id (
          email
        )
      `)

    // Sort by selected criteria
    if (sortBy === 'accuracy') {
      query = query.order('overall_accuracy', { ascending: false })
    } else if (sortBy === 'reputation') {
      query = query.order('reputation_score', { ascending: false })
    } else {
      query = query.order('points', { ascending: false })
    }

    query = query.limit(limit)

    const { data: leaderboard, error } = await query

    if (error) {
      console.error('Error fetching leaderboard:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add rank
    const rankedLeaderboard = leaderboard?.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))

    return NextResponse.json({ leaderboard: rankedLeaderboard })
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
