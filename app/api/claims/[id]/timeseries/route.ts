import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

interface RouteContext {
  params: Promise<{ id: string }>
}

interface ClaimVote {
  id: string
  claim_id: string
  user_id: string
  vote_value: boolean
  confidence: number
  reasoning: string | null
  voter_type: string | null
  created_at: string
  updated_at: string
}

interface DailySnapshot {
  date: string
  dateFormatted: string
  yesPercentage: number
  noPercentage: number
  yesCount: number
  noCount: number
  totalVotes: number
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = createAdminClient()

    // Verify the claim exists
    const { data: claim, error: claimError } = await supabase
      .from("claims")
      .select("id")
      .eq("id", id)
      .single()

    if (claimError || !claim) {
      return NextResponse.json(
        { error: "Claim not found" },
        { status: 404 }
      )
    }

    // Fetch all votes for this claim, ordered by creation time
    const { data: votes, error: votesError } = await supabase
      .from("claim_votes")
      .select("*")
      .eq("claim_id", id)
      .order("created_at", { ascending: true })

    if (votesError) {
      console.error("Error fetching claim votes:", votesError)
      return NextResponse.json(
        { error: "Failed to fetch claim votes" },
        { status: 500 }
      )
    }

    // No votes — return empty data
    if (!votes || votes.length === 0) {
      return NextResponse.json({
        type: "binary",
        data: [],
        metadata: { count: 0 },
      })
    }

    // Group votes by date
    const votesByDate = new Map<string, ClaimVote[]>()
    for (const vote of votes as ClaimVote[]) {
      const dateKey = new Date(vote.created_at).toISOString().split("T")[0]
      if (!votesByDate.has(dateKey)) {
        votesByDate.set(dateKey, [])
      }
      votesByDate.get(dateKey)!.push(vote)
    }

    // Build cumulative daily snapshots
    const sortedDates = Array.from(votesByDate.keys()).sort()
    let cumulativeTrueCount = 0
    let cumulativeFalseCount = 0

    const data: DailySnapshot[] = sortedDates.map((dateKey) => {
      const dayVotes = votesByDate.get(dateKey)!
      for (const vote of dayVotes) {
        if (vote.vote_value === true) {
          cumulativeTrueCount++
        } else {
          cumulativeFalseCount++
        }
      }

      const total = cumulativeTrueCount + cumulativeFalseCount
      const yesPercentage = total > 0
        ? Math.round((cumulativeTrueCount / total) * 100)
        : 0
      const noPercentage = total > 0
        ? Math.round((cumulativeFalseCount / total) * 100)
        : 0

      return {
        date: new Date(dateKey).toISOString(),
        dateFormatted: new Date(dateKey).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        yesPercentage,
        noPercentage,
        yesCount: cumulativeTrueCount,
        noCount: cumulativeFalseCount,
        totalVotes: total,
      }
    })

    return NextResponse.json({
      type: "binary",
      data,
      metadata: {
        count: data.length,
        firstSnapshot: data[0]?.date,
        lastSnapshot: data[data.length - 1]?.date,
      },
    })
  } catch (error) {
    console.error("Claim timeseries API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
