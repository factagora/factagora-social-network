import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = createAdminClient()

    // Get prediction type and options
    const { data: prediction, error: predError } = await supabase
      .from("predictions")
      .select("prediction_type, prediction_options")
      .eq("id", id)
      .single()

    if (predError || !prediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      )
    }

    const predictionType = prediction.prediction_type || "BINARY"

    // Fetch timeseries data based on prediction type
    if (predictionType === "BINARY") {
      // Fetch binary timeseries
      const { data: history, error: historyError } = await supabase
        .from("vote_history")
        .select(`
          snapshot_time,
          yes_percentage,
          no_percentage,
          yes_count,
          no_count,
          total_predictions,
          ai_agent_count,
          human_count
        `)
        .eq("prediction_id", id)
        .order("snapshot_time", { ascending: true })

      if (historyError) {
        console.error("Error fetching timeseries:", historyError)
        return NextResponse.json(
          { error: "Failed to fetch timeseries data" },
          { status: 500 }
        )
      }

      // If no history exists, create initial snapshot and return it
      if (!history || history.length === 0) {
        // Call function to create snapshot
        const { data: snapshotResult, error: snapshotError } = await supabase
          .rpc("create_vote_history_snapshot", { pred_id: id })

        if (snapshotError) {
          console.error("Error creating snapshot:", snapshotError)
        }

        // Fetch again after creating snapshot
        const { data: newHistory } = await supabase
          .from("vote_history")
          .select(`
            snapshot_time,
            yes_percentage,
            no_percentage,
            yes_count,
            no_count,
            total_predictions,
            ai_agent_count,
            human_count
          `)
          .eq("prediction_id", id)
          .order("snapshot_time", { ascending: true })

        return NextResponse.json({
          type: "binary",
          data: newHistory || [],
          metadata: {
            count: newHistory?.length || 0,
            firstSnapshot: newHistory?.[0]?.snapshot_time,
            lastSnapshot: newHistory?.[newHistory.length - 1]?.snapshot_time,
          },
        })
      }

      // Format data for chart
      const formattedData = history.map((snapshot) => ({
        date: snapshot.snapshot_time,
        dateFormatted: new Date(snapshot.snapshot_time).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        yesPercentage: snapshot.yes_percentage || 0,
        noPercentage: snapshot.no_percentage || 0,
        yesCount: snapshot.yes_count || 0,
        noCount: snapshot.no_count || 0,
        totalVotes: snapshot.total_predictions || 0,
        aiCount: snapshot.ai_agent_count || 0,
        humanCount: snapshot.human_count || 0,
      }))

      return NextResponse.json({
        type: "binary",
        data: formattedData,
        metadata: {
          count: formattedData.length,
          firstSnapshot: formattedData[0]?.date,
          lastSnapshot: formattedData[formattedData.length - 1]?.date,
        },
      })
    } else if (predictionType === "NUMERIC") {
      // Phase 2: Numeric predictions
      const { data: history, error: historyError } = await supabase
        .from("vote_history")
        .select(`
          snapshot_time,
          avg_prediction,
          median_prediction,
          std_deviation,
          percentile_25,
          percentile_75,
          min_prediction,
          max_prediction,
          total_predictions,
          ai_agent_count,
          human_count
        `)
        .eq("prediction_id", id)
        .order("snapshot_time", { ascending: true })

      if (historyError) {
        return NextResponse.json(
          { error: "Failed to fetch timeseries data" },
          { status: 500 }
        )
      }

      const formattedData = (history || []).map((snapshot) => ({
        date: snapshot.snapshot_time,
        dateFormatted: new Date(snapshot.snapshot_time).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        avgPrediction: snapshot.avg_prediction || 0,
        medianPrediction: snapshot.median_prediction || 0,
        stdDeviation: snapshot.std_deviation || 0,
        percentile25: snapshot.percentile_25 || 0,
        percentile75: snapshot.percentile_75 || 0,
        minPrediction: snapshot.min_prediction || 0,
        maxPrediction: snapshot.max_prediction || 0,
        totalVotes: snapshot.total_predictions || 0,
      }))

      return NextResponse.json({
        type: "numeric",
        data: formattedData,
        metadata: {
          count: formattedData.length,
          firstSnapshot: formattedData[0]?.date,
          lastSnapshot: formattedData[formattedData.length - 1]?.date,
        },
      })
    } else if (predictionType === "MULTIPLE_CHOICE") {
      // Phase 3: Multiple choice predictions
      const { data: history, error: historyError } = await supabase
        .from("vote_history")
        .select(`
          snapshot_time,
          option_distribution,
          total_predictions,
          ai_agent_count,
          human_count
        `)
        .eq("prediction_id", id)
        .order("snapshot_time", { ascending: true })

      if (historyError) {
        return NextResponse.json(
          { error: "Failed to fetch timeseries data" },
          { status: 500 }
        )
      }

      // Only keep snapshots that actually have option_distribution data
      const validHistory = (history || []).filter(
        (s) => s.option_distribution && typeof s.option_distribution === "object"
      )

      // If no valid snapshots, compute current distribution from raw votes
      if (validHistory.length === 0) {
        const predOptions: string[] = prediction.prediction_options ?? []

        const { data: rawVotes } = await supabase
          .from("votes")
          .select("position")
          .eq("prediction_id", id)

        if (!rawVotes || rawVotes.length === 0) {
          return NextResponse.json({ type: "multiple", data: [], metadata: { count: 0 } })
        }

        // Build percentage distribution keyed by option name
        const counts: Record<string, number> = {}
        predOptions.forEach((opt) => { counts[opt] = 0 })
        rawVotes.forEach((v) => {
          if (v.position in counts) counts[v.position]++
        })

        const total = rawVotes.length
        const pctDistribution: Record<string, number> = {}
        for (const [opt, count] of Object.entries(counts)) {
          pctDistribution[opt] = total > 0 ? Math.round((count / total) * 100) : 0
        }

        const singlePoint = [{
          date: new Date().toISOString(),
          dateFormatted: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          ...pctDistribution,
          totalVotes: total,
        }]

        return NextResponse.json({ type: "multiple", data: singlePoint, metadata: { count: 1 } })
      }

      const formattedData = validHistory.map((snapshot) => ({
        date: snapshot.snapshot_time,
        dateFormatted: new Date(snapshot.snapshot_time).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        ...snapshot.option_distribution,
        totalVotes: snapshot.total_predictions || 0,
      }))

      return NextResponse.json({
        type: "multiple",
        data: formattedData,
        metadata: {
          count: formattedData.length,
          firstSnapshot: formattedData[0]?.date,
          lastSnapshot: formattedData[formattedData.length - 1]?.date,
        },
      })
    }

    return NextResponse.json(
      { error: "Unsupported prediction type" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Timeseries API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
