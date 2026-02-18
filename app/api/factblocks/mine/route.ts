import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/server"

interface FactBlock {
  id: string
  type: 'prediction' | 'claim'
  title: string
  description: string | null
  category: string | null
  status: 'active' | 'resolved' | 'deadline_passed' | 'verified' | 'rejected'
  createdAt: string
  updatedAt: string
  activity: {
    totalArguments: number
    newArguments: number
    lastActivityAt: string
  }
  consensus?: {
    yesPercentage: number
    noPercentage: number
    totalVotes: number
  }
  // Prediction-specific
  deadline?: string
  resolutionValue?: boolean | null
  // Claim-specific
  verdict?: 'TRUE' | 'FALSE' | 'PARTIALLY_TRUE' | 'UNVERIFIABLE' | null
}

// GET /api/factblocks/mine - Get my predictions and claims
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Fetch user's predictions
    const { data: predictions, error: predError } = await supabase
      .from('predictions')
      .select(`
        id,
        title,
        description,
        category,
        deadline,
        resolution_value,
        created_at
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (predError) {
      console.error('Error fetching predictions:', predError)
    }

    // Fetch user's claims
    const { data: claims, error: claimError } = await supabase
      .from('claims')
      .select(`
        id,
        title,
        description,
        category,
        verdict,
        created_at
      `)
      .eq('created_by', session.user.id)
      .order('created_at', { ascending: false })

    if (claimError) {
      console.error('Error fetching claims:', claimError)
    }

    // Process predictions with activity
    const predictionsWithActivity = await Promise.all(
      (predictions || []).map(async (pred) => {
        // Get total arguments count
        const { count: totalArguments } = await supabase
          .from('arguments')
          .select('id', { count: 'exact', head: true })
          .eq('prediction_id', pred.id)

        // Get new arguments (last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { count: newArguments } = await supabase
          .from('arguments')
          .select('id', { count: 'exact', head: true })
          .eq('prediction_id', pred.id)
          .gte('created_at', twentyFourHoursAgo)

        // Get latest argument timestamp
        const { data: latestArg } = await supabase
          .from('arguments')
          .select('created_at')
          .eq('prediction_id', pred.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Get consensus
        const { data: consensus } = await supabase
          .from('ai_agent_consensus_view')
          .select('*')
          .eq('prediction_id', pred.id)
          .single()

        // Determine status
        let status: FactBlock['status'] = 'active'
        if (pred.resolution_value !== null) {
          status = 'resolved'
        } else if (new Date(pred.deadline) < new Date()) {
          status = 'deadline_passed'
        }

        return {
          id: pred.id,
          type: 'prediction' as const,
          title: pred.title,
          description: pred.description,
          category: pred.category,
          status,
          createdAt: pred.created_at,
          updatedAt: pred.created_at, // Use created_at as fallback
          activity: {
            totalArguments: totalArguments || 0,
            newArguments: newArguments || 0,
            lastActivityAt: latestArg?.created_at || pred.created_at,
          },
          consensus: consensus ? {
            yesPercentage: Math.round(consensus.consensus_yes_pct * 100),
            noPercentage: Math.round((1 - consensus.consensus_yes_pct) * 100),
            totalVotes: consensus.total_votes,
          } : undefined,
          deadline: pred.deadline,
          resolutionValue: pred.resolution_value,
        }
      })
    )

    // Process claims with activity
    const claimsWithActivity = await Promise.all(
      (claims || []).map(async (claim) => {
        // Get verifications count as "arguments"
        const { count: totalVerifications } = await supabase
          .from('verifications')
          .select('id', { count: 'exact', head: true })
          .eq('claim_id', claim.id)

        // Get new verifications (last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { count: newVerifications } = await supabase
          .from('verifications')
          .select('id', { count: 'exact', head: true })
          .eq('claim_id', claim.id)
          .gte('created_at', twentyFourHoursAgo)

        // Get latest verification timestamp
        const { data: latestVerification } = await supabase
          .from('verifications')
          .select('created_at')
          .eq('claim_id', claim.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Determine status
        let status: FactBlock['status'] = 'active'
        if (claim.verdict === 'TRUE' || claim.verdict === 'FALSE') {
          status = 'verified'
        } else if (claim.verdict === 'UNVERIFIABLE') {
          status = 'rejected'
        }

        return {
          id: claim.id,
          type: 'claim' as const,
          title: claim.title,
          description: claim.description,
          category: claim.category,
          status,
          createdAt: claim.created_at,
          updatedAt: claim.created_at, // Use created_at as fallback
          activity: {
            totalArguments: totalVerifications || 0,
            newArguments: newVerifications || 0,
            lastActivityAt: latestVerification?.created_at || claim.created_at,
          },
          verdict: claim.verdict,
        }
      })
    )

    // Combine and sort by created date
    const allFactBlocks = [...predictionsWithActivity, ...claimsWithActivity]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      factBlocks: allFactBlocks,
      total: allFactBlocks.length,
      predictions: predictionsWithActivity.length,
      claims: claimsWithActivity.length,
    })
  } catch (error) {
    console.error('Error in /api/factblocks/mine:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
