import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { VoteCreateInput, VotePosition } from '@/src/types/voting'
import { getVoteWeight } from '@/src/types/voting'

// POST /api/predictions/[id]/vote - Submit or update vote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: predictionId } = await params
    const supabase = createAdminClient()

    // Check authentication - Required for voting
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.id

    // Parse request body
    const body: VoteCreateInput = await request.json()
    const { position, confidence = 0.8, reasoning } = body

    // Validation
    if (!['YES', 'NO', 'NEUTRAL'].includes(position)) {
      return NextResponse.json(
        { error: 'Invalid position. Must be YES, NO, or NEUTRAL' },
        { status: 400 }
      )
    }

    if (confidence < 0 || confidence > 1) {
      return NextResponse.json(
        { error: 'Confidence must be between 0 and 1' },
        { status: 400 }
      )
    }

    // Check if prediction exists
    const { data: prediction, error: predError } = await supabase
      .from('predictions')
      .select('id, title, deadline')
      .eq('id', predictionId)
      .single()

    if (predError || !prediction) {
      return NextResponse.json({ error: 'Prediction not found' }, { status: 404 })
    }

    // Check if prediction is still open
    const now = new Date()
    const deadline = new Date(prediction.deadline)
    if (now > deadline) {
      return NextResponse.json(
        { error: 'Prediction voting has closed' },
        { status: 400 }
      )
    }

    // Get total user count for weight calculation
    // For MVP, we'll use a simple count
    const { count: totalUsers } = await supabase
      .from('predictions')
      .select('user_id', { count: 'exact', head: true })

    // Calculate vote weight
    const voterType = 'HUMAN'
    const weight = getVoteWeight(voterType, totalUsers || 0)

    // Upsert vote (insert or update if exists)
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .upsert(
        {
          prediction_id: predictionId,
          voter_id: userId,
          voter_type: voterType,
          voter_name: session.user.name || 'User',
          position,
          confidence,
          weight,
          reasoning: reasoning || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'prediction_id,voter_id,voter_type',
        }
      )
      .select()
      .single()

    if (voteError) {
      console.error('Error submitting vote:', voteError)
      return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 })
    }

    console.log(`✅ Vote submitted: ${userId} voted ${position} on ${predictionId}`)

    return NextResponse.json(
      {
        vote: {
          id: vote.id,
          predictionId: vote.prediction_id,
          voterId: vote.voter_id,
          voterType: vote.voter_type,
          voterName: vote.voter_name,
          position: vote.position,
          confidence: vote.confidence,
          weight: vote.weight,
          reasoning: vote.reasoning,
          createdAt: vote.created_at,
          updatedAt: vote.updated_at,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in vote route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/predictions/[id]/vote - Get current user's vote
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: predictionId } = await params
    const supabase = createAdminClient()

    // If not authenticated, return null
    if (!session?.user?.id) {
      return NextResponse.json({ vote: null })
    }

    const userId = session.user.id

    // Get user's vote
    const { data: vote, error } = await supabase
      .from('votes')
      .select('*')
      .eq('prediction_id', predictionId)
      .eq('voter_id', userId)
      .eq('voter_type', 'HUMAN')
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching vote:', error)
      return NextResponse.json({ error: 'Failed to fetch vote' }, { status: 500 })
    }

    if (!vote) {
      return NextResponse.json({ vote: null })
    }

    return NextResponse.json({
      vote: {
        id: vote.id,
        predictionId: vote.prediction_id,
        voterId: vote.voter_id,
        voterType: vote.voter_type,
        voterName: vote.voter_name,
        position: vote.position,
        confidence: vote.confidence,
        weight: vote.weight,
        reasoning: vote.reasoning,
        createdAt: vote.created_at,
        updatedAt: vote.updated_at,
      },
    })
  } catch (error) {
    console.error('Error in get vote route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
