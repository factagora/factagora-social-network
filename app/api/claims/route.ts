import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import type { ClaimCreateInput } from '@/types/claim'
import { startFreeClaimDebate } from '@/lib/agents/simple-debate'

// GET /api/claims - List claims
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const category = searchParams.get('category')
  const status = searchParams.get('status') || 'APPROVED' // Default: show only approved
  const verdict = searchParams.get('verdict') // NEW: Filter by verdict
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const order = searchParams.get('order') || 'desc'

  const offset = (page - 1) * limit

  try {
    let query = supabase
      .from('claims')
      .select('*', { count: 'exact' })
      .eq('approval_status', status)

    if (category) {
      query = query.eq('category', category)
    }

    // NEW: Filter by verdict if provided
    if (verdict) {
      query = query.eq('verdict', verdict)
    }

    query = query.order(sortBy, { ascending: order === 'asc' })
    query = query.range(offset, offset + limit - 1)

    const { data: claims, error, count } = await query

    if (error) {
      console.error('Error fetching claims:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      claims,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching claims:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/claims - Create new claim
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: ClaimCreateInput = await request.json()

    // Validate required fields
    if (!body.title || body.title.length < 10) {
      return NextResponse.json(
        { error: 'Title must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (!body.description || body.description.length < 50) {
      return NextResponse.json(
        { error: 'Description must be at least 50 characters' },
        { status: 400 }
      )
    }

    if (!body.resolutionDate) {
      return NextResponse.json(
        { error: 'Resolution date is required' },
        { status: 400 }
      )
    }

    // Check user tier and creation permission
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tier, agenda_creation_count, agenda_creation_reset_date')
      .eq('id', session.user.id)
      .single()

    if (userError) {
      // User might not have extended profile yet, assume FREE tier
      console.log('User profile not found, assuming FREE tier')
    }

    const userTier = userData?.tier || 'FREE'
    const creationCount = userData?.agenda_creation_count || 0

    // Check permission
    const { data: permission } = await supabase.rpc('check_agenda_creation_limit', {
      p_user_id: session.user.id,
      p_user_tier: userTier,
    })

    if (!permission || !permission[0]?.allowed) {
      return NextResponse.json(
        {
          error: 'Monthly claim creation limit reached',
          remaining: permission?.[0]?.remaining || 0,
          resetDate: permission?.[0]?.reset_date,
        },
        { status: 403 }
      )
    }

    const requiresApproval = permission[0].requires_approval

    // Create claim
    const { data: claim, error: createError } = await supabase
      .from('claims')
      .insert({
        title: body.title,
        description: body.description,
        category: body.category || 'general',
        claim_date: body.claimDate || new Date().toISOString(),
        claim_type: body.claimType || 'FACTUAL',
        source_url: body.sourceUrl,
        source_title: body.sourceTitle,
        resolution_date: body.resolutionDate,
        approval_status: requiresApproval ? 'PENDING' : 'APPROVED',
        created_by: session.user.id,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating claim:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    // Trigger AI agent debate on the claim (fire-and-forget)
    if (!requiresApproval) {
      startFreeClaimDebate(claim.id, {
        title: claim.title,
        description: claim.description,
        category: claim.category,
      }).catch(() => {})
    }

    // Update user's creation count
    if (userTier === 'FREE') {
      await supabase
        .from('users')
        .update({ agenda_creation_count: creationCount + 1 })
        .eq('id', session.user.id)
    }

    return NextResponse.json(
      {
        claim,
        requiresApproval,
        message: requiresApproval
          ? 'Claim created successfully. Pending admin approval.'
          : 'Claim created successfully.',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating claim:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
