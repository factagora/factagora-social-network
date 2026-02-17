import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/server"
import { notifyFactBlockResolved, notifyVotersOfResolution } from "@/lib/notifications"

type Verdict = 'TRUE' | 'FALSE' | 'PARTIALLY_TRUE' | 'UNVERIFIABLE'

// POST /api/claims/[id]/resolve - Resolve a claim
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { verdict } = await request.json()

    // Validate verdict
    const validVerdicts: Verdict[] = ['TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNVERIFIABLE']
    if (!validVerdicts.includes(verdict)) {
      return NextResponse.json(
        { error: "Invalid verdict. Must be one of: TRUE, FALSE, PARTIALLY_TRUE, UNVERIFIABLE" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get the claim
    const { data: claim, error: fetchError } = await supabase
      .from('claims')
      .select('id, created_by, title, resolution_date, verdict')
      .eq('id', id)
      .single()

    if (fetchError || !claim) {
      return NextResponse.json(
        { error: "Claim not found" },
        { status: 404 }
      )
    }

    // Check if user is the creator
    if (claim.created_by !== session.user.id) {
      return NextResponse.json(
        { error: "Only the creator can resolve this claim" },
        { status: 403 }
      )
    }

    // Check if already resolved
    if (claim.verdict) {
      return NextResponse.json(
        { error: "Claim already resolved" },
        { status: 400 }
      )
    }

    // Check if resolution date has passed (if set)
    if (claim.resolution_date) {
      const now = new Date()
      const resolutionDate = new Date(claim.resolution_date)
      if (now < resolutionDate) {
        return NextResponse.json(
          { error: "Cannot resolve before resolution date" },
          { status: 400 }
        )
      }
    }

    // Resolve the claim
    const { data: resolved, error: updateError } = await supabase
      .from('claims')
      .update({
        verdict,
        resolved_by: session.user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error resolving claim:', updateError)
      return NextResponse.json(
        { error: "Failed to resolve claim" },
        { status: 500 }
      )
    }

    // Send notifications
    // Notify the creator
    await notifyFactBlockResolved(
      claim.created_by,
      id,
      'claim',
      claim.title,
      verdict
    )

    // Notify voters
    await notifyVotersOfResolution(
      id,
      'claim',
      claim.title,
      verdict
    )

    return NextResponse.json({
      message: "Claim resolved successfully",
      claim: resolved,
    })
  } catch (error) {
    console.error('Error in /api/claims/[id]/resolve:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
