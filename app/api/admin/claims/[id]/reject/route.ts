import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/admin/claims/[id]/reject - Reject claim (ADMIN only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: claimId } = await params

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

  try {
    const { reason }: { reason: string } = await request.json()

    if (!reason || reason.length < 10) {
      return NextResponse.json(
        { error: 'Rejection reason must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Check if claim exists and is pending
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('id, approval_status, title')
      .eq('id', claimId)
      .single()

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    if (claim.approval_status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Claim is not pending approval' },
        { status: 400 }
      )
    }

    // Reject claim
    const { data: rejectedClaim, error: updateError } = await supabase
      .from('claims')
      .update({
        approval_status: 'REJECTED',
        approved_by: session.user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId)
      .select()
      .single()

    if (updateError) {
      console.error('Error rejecting claim:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // TODO: Send notification to claim creator with rejection reason

    return NextResponse.json({
      claim: rejectedClaim,
      message: 'Claim rejected',
    })
  } catch (error: any) {
    console.error('Error rejecting claim:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
