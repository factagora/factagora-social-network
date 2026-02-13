import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/admin/claims/[id]/approve - Approve claim (ADMIN only)
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

    // Approve claim
    const { data: approvedClaim, error: updateError } = await supabase
      .from('claims')
      .update({
        approval_status: 'APPROVED',
        approved_by: session.user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId)
      .select()
      .single()

    if (updateError) {
      console.error('Error approving claim:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // TODO: Send notification to claim creator

    return NextResponse.json({
      claim: approvedClaim,
      message: 'Claim approved successfully',
    })
  } catch (error: any) {
    console.error('Error approving claim:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
