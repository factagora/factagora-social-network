import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/user/stats - Get current user stats
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Initialize user stats if not exists
    await supabase.rpc('initialize_user_stats', {
      p_user_id: session.user.id,
    })

    // Get user stats
    const { data: stats, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      console.error('Error fetching user stats:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ stats })
  } catch (error: any) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
