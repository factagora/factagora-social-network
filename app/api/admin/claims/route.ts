import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/claims - Get pending claims (ADMIN only)
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is ADMIN
  const { data: userData } = await supabase
    .from('users')
    .select('tier')
    .eq('id', session.user.id)
    .single()

  if (userData?.tier !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'PENDING'

  try {
    const { data: claims, error } = await supabase
      .from('claims')
      .select(`
        *,
        creator:created_by (
          id,
          email,
          tier
        )
      `)
      .eq('approval_status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching claims:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ claims })
  } catch (error: any) {
    console.error('Error fetching claims:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
