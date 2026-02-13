import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EvidenceCreateInput } from '@/types/claim'

// POST /api/claims/[id]/evidence - Submit evidence
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
    const body: EvidenceCreateInput = await request.json()

    // Validate required fields
    if (!body.title || body.title.length < 5) {
      return NextResponse.json(
        { error: 'Title must be at least 5 characters' },
        { status: 400 }
      )
    }

    if (!body.url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    if (!body.sourceType) {
      return NextResponse.json({ error: 'Source type is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(body.url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Check if claim exists and is approved
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('id, approval_status')
      .eq('id', claimId)
      .single()

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    if (claim.approval_status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Cannot submit evidence for pending claim' },
        { status: 403 }
      )
    }

    // Create evidence
    const { data: evidence, error: createError } = await supabase
      .from('claim_evidence')
      .insert({
        claim_id: claimId,
        source_type: body.sourceType,
        title: body.title,
        url: body.url,
        description: body.description || null,
        publisher: body.publisher || null,
        published_date: body.publishedDate || null,
        submitted_by: session.user.id,
        submission_type: 'HUMAN',
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating evidence:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        evidence,
        message: 'Evidence submitted successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error submitting evidence:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET /api/claims/[id]/evidence - Get all evidence for a claim
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: claimId } = await params

  try {
    const { data: evidence, error } = await supabase
      .from('claim_evidence')
      .select('*')
      .eq('claim_id', claimId)
      .order('credibility_score', { ascending: false })

    if (error) {
      console.error('Error fetching evidence:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ evidence })
  } catch (error: any) {
    console.error('Error fetching evidence:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
