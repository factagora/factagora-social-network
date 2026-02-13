import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/claims/[id]/resolve - Resolve claim (creator only)
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

  try {
    const { resolutionValue }: { resolutionValue: boolean } = await request.json()

    // Validate resolution value
    if (typeof resolutionValue !== 'boolean') {
      return NextResponse.json(
        { error: 'Resolution value must be true or false' },
        { status: 400 }
      )
    }

    // Get claim and check ownership
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('id, created_by, resolution_date, resolution_value, resolved_at')
      .eq('id', claimId)
      .single()

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    // Check if user is creator
    if (claim.created_by !== session.user.id) {
      return NextResponse.json(
        { error: 'Only claim creator can resolve it' },
        { status: 403 }
      )
    }

    // Check if already resolved
    if (claim.resolution_value !== null || claim.resolved_at) {
      return NextResponse.json(
        { error: 'Claim already resolved' },
        { status: 400 }
      )
    }

    // Check if resolution date has passed
    const resolutionDate = new Date(claim.resolution_date)
    const now = new Date()

    if (now < resolutionDate) {
      return NextResponse.json(
        {
          error: `Claim can only be resolved after ${resolutionDate.toISOString()}`,
          resolutionDate: claim.resolution_date,
        },
        { status: 400 }
      )
    }

    // Resolve claim
    const { data: resolvedClaim, error: updateError } = await supabase
      .from('claims')
      .update({
        resolution_value: resolutionValue,
        resolved_by: session.user.id,
        resolved_at: new Date().toISOString(),
        verification_status: resolutionValue ? 'VERIFIED_TRUE' : 'VERIFIED_FALSE',
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId)
      .select()
      .single()

    if (updateError) {
      console.error('Error resolving claim:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // TODO: Calculate and distribute rewards/points based on votes

    return NextResponse.json({
      claim: resolvedClaim,
      message: `Claim resolved as ${resolutionValue ? 'TRUE' : 'FALSE'}`,
    })
  } catch (error: any) {
    console.error('Error resolving claim:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
