import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/claims/my-claims - Get current user's claims
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
    const { data: claims, error } = await supabase
      .from('claims')
      .select('*')
      .eq('created_by', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching my claims:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ claims })
  } catch (error: any) {
    console.error('Error fetching my claims:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
