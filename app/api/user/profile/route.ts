import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/user/profile - Get current user profile
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
    // Try to get user data from custom users table
    const { data: userData } = await supabase
      .from('users')
      .select('tier, agenda_creation_count, agenda_creation_reset_date')
      .eq('id', session.user.id)
      .single()

    // If user doesn't exist in custom table, return default values
    const tier = userData?.tier || 'FREE'
    const agendaCreationCount = userData?.agenda_creation_count || 0
    const agendaCreationResetDate = userData?.agenda_creation_reset_date || null

    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      tier,
      agendaCreationCount,
      agendaCreationResetDate,
    })
  } catch (error: any) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
