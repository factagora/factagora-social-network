import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createClient } from '@/lib/supabase/server'
import { ClaimVerdict } from '@/types/claim'

/**
 * PATCH /api/claims/[id]/verdict
 * Set verdict on a claim (fact-checking verdict)
 *
 * Body:
 * {
 *   verdict: 'TRUE' | 'FALSE' | 'PARTIALLY_TRUE' | 'UNVERIFIED' | 'MISLEADING',
 *   verdictSummary?: string  // Optional explanation (max 500 chars)
 * }
 *
 * Permissions:
 * - Must be authenticated
 * - TODO: Add fact-checker role check in future
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to set verdict.' },
        { status: 401 }
      )
    }

    const { id: claimId } = await params
    const body = await request.json()
    const { verdict, verdictSummary } = body

    // Validate verdict
    const validVerdicts: ClaimVerdict[] = ['TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNVERIFIED', 'MISLEADING']
    if (!verdict || !validVerdicts.includes(verdict)) {
      return NextResponse.json(
        { error: `Invalid verdict. Must be one of: ${validVerdicts.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate verdictSummary length
    if (verdictSummary && verdictSummary.length > 500) {
      return NextResponse.json(
        { error: 'Verdict summary must be less than 500 characters' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if claim exists and user has permission
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('id, created_by, approval_status')
      .eq('id', claimId)
      .single()

    if (claimError || !claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    // TODO: Add fact-checker role check
    // For now, any authenticated user can set verdict
    // In future: check if user has 'FACT_CHECKER' or 'ADMIN' role

    // Update claim with verdict
    const { data: updatedClaim, error: updateError } = await supabase
      .from('claims')
      .update({
        verdict,
        verdict_summary: verdictSummary || null,
        verdict_date: new Date().toISOString(),
        verification_status: verdict === 'UNVERIFIED' ? 'PENDING' : 'VERIFIED_TRUE', // Update verification status
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating claim verdict:', updateError)
      return NextResponse.json(
        { error: 'Failed to update claim verdict' },
        { status: 500 }
      )
    }

    console.log(`✅ Verdict set: ${claimId} → ${verdict} by user ${session.user.id}`)

    // Return updated claim in expected format
    return NextResponse.json({
      claim: {
        id: updatedClaim.id,
        verdict: updatedClaim.verdict,
        verdictSummary: updatedClaim.verdict_summary,
        verdictDate: updatedClaim.verdict_date,
        verificationStatus: updatedClaim.verification_status
      }
    })
  } catch (error) {
    console.error('Error in verdict endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
