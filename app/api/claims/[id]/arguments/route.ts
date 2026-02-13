import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ClaimArgumentInput } from '@/types/claim'

// POST /api/claims/[id]/arguments - Create argument
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
    const body: ClaimArgumentInput = await request.json()

    // Validate required fields
    if (!body.content || body.content.length < 50) {
      return NextResponse.json(
        { error: 'Content must be at least 50 characters' },
        { status: 400 }
      )
    }

    if (!body.position || !['TRUE', 'FALSE', 'UNCERTAIN'].includes(body.position)) {
      return NextResponse.json(
        { error: 'Position must be TRUE, FALSE, or UNCERTAIN' },
        { status: 400 }
      )
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
        { error: 'Cannot submit argument for pending claim' },
        { status: 403 }
      )
    }

    // Get user name
    const { data: userData } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', session.user.id)
      .single()

    const authorName = userData?.name || userData?.email || 'Anonymous'

    // Create argument
    const { data: argument, error: createError } = await supabase
      .from('claim_arguments')
      .insert({
        claim_id: claimId,
        author_id: session.user.id,
        author_type: 'HUMAN',
        author_name: authorName,
        position: body.position,
        content: body.content,
        reasoning: body.reasoning || null,
        evidence: body.evidence || null,
        confidence: body.confidence || 0.7,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating argument:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        argument,
        message: 'Argument created successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating argument:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET /api/claims/[id]/arguments - Get all arguments for a claim
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: claimId } = await params
  const { searchParams } = new URL(request.url)

  const sortBy = searchParams.get('sortBy') || 'score' // score, created_at
  const position = searchParams.get('position') // Filter by position

  try {
    let query = supabase
      .from('claim_arguments')
      .select('*')
      .eq('claim_id', claimId)

    if (position && ['TRUE', 'FALSE', 'UNCERTAIN'].includes(position)) {
      query = query.eq('position', position)
    }

    if (sortBy === 'score') {
      query = query.order('score', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data: argumentsList, error } = await query

    if (error) {
      console.error('Error fetching arguments:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get reply counts for each argument
    const argumentIds = argumentsList?.map((arg) => arg.id) || []

    let replyCounts: Record<string, number> = {}

    if (argumentIds.length > 0) {
      const { data: replies } = await supabase
        .from('claim_argument_replies')
        .select('argument_id')
        .in('argument_id', argumentIds)

      if (replies) {
        replyCounts = replies.reduce((acc, reply) => {
          acc[reply.argument_id] = (acc[reply.argument_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }

    // Add reply counts to arguments
    const argumentsWithCounts = argumentsList?.map((arg) => ({
      ...arg,
      replyCount: replyCounts[arg.id] || 0,
    }))

    return NextResponse.json({ arguments: argumentsWithCounts })
  } catch (error: any) {
    console.error('Error fetching arguments:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
