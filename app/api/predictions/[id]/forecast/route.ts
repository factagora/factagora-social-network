import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/predictions/[id]/forecast
 *
 * Fetches timeseries forecast data for a prediction
 * Includes Factagora consensus forecast and individual agent forecasts
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = createAdminClient()

    // Fetch prediction with timeseries forecast
    const { data: prediction, error: predError } = await supabase
      .from("predictions")
      .select("id, title, prediction_type, timeseries_forecast, timeseries_asset_id, investment_summary")
      .eq("id", id)
      .single()

    if (predError || !prediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      )
    }

    // Check if this prediction has timeseries data
    if (prediction.prediction_type !== "TIMESERIES") {
      return NextResponse.json(
        { error: "This prediction is not a timeseries forecast" },
        { status: 400 }
      )
    }

    // If no forecast data yet but has asset_id, return empty structure
    if (!prediction.timeseries_forecast && !prediction.timeseries_asset_id) {
      return NextResponse.json(
        { error: "This prediction does not have timeseries data" },
        { status: 400 }
      )
    }

    // Fetch agent arguments for this prediction
    const { data: agentArgs, error: argsError } = await supabase
      .from("arguments")
      .select(`
        id,
        author_id,
        author_name,
        author_type,
        position,
        content,
        evidence,
        reasoning,
        confidence,
        round_number,
        created_at
      `)
      .eq("prediction_id", id)
      .eq("author_type", "AI_AGENT")
      .order("confidence", { ascending: false })

    if (argsError) {
      console.error("Error fetching arguments:", argsError)
    }

    // Extract timeseries forecast data
    const forecastData = (prediction.timeseries_forecast as any) || {}
    const investmentData = prediction.investment_summary as any

    // Build agent forecasts from agentArgs
    const agentForecasts = (agentArgs || []).map((arg: any) => {
      // Extract numeric forecast if agent mentions specific price target
      const content = arg.content || ""
      const priceMatch = content.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)[kK]?/g)
      let targetPrice = null

      if (priceMatch && priceMatch.length > 0) {
        // Parse the largest number mentioned (likely the target)
        const prices = priceMatch.map((p: string) => {
          const num = parseFloat(p.replace(/[$,kK]/g, ""))
          return p.includes("K") || p.includes("k") ? num * 1000 : num
        })
        targetPrice = Math.max(...prices)
      }

      return {
        agentId: arg.author_id,
        agentName: arg.author_name,
        position: arg.position,
        confidence: arg.confidence,
        targetPrice,
        reasoning: arg.reasoning,
        keyPoints: extractKeyPoints(arg.content),
        evidence: arg.evidence || [],
        createdAt: arg.created_at
      }
    })

    // Calculate consensus metrics
    const totalWeight = agentForecasts.reduce((sum: number, a: any) => sum + (a.confidence || 0), 0)
    const weightedConsensus = agentForecasts.reduce((sum: number, a: any) => {
      const weight = (a.confidence || 0) / totalWeight
      return sum + (a.position === "YES" ? weight * 100 : 0)
    }, 0)

    return NextResponse.json({
      predictionId: prediction.id,
      title: prediction.title,
      type: prediction.prediction_type,
      timeseriesAssetId: prediction.timeseries_asset_id || null,

      // Factagora consensus forecast
      factagoraForecast: {
        target: forecastData.target,
        timeRange: forecastData.timeRange,
        dataPoints: forecastData.factagoraForecast?.dataPoints || [],
        methodology: forecastData.factagoraForecast?.methodology,
        lastUpdated: forecastData.factagoraForecast?.lastUpdated
      },

      // Investment summary
      investmentSummary: investmentData ? {
        verdict: investmentData.verdict,
        confidenceLevel: investmentData.confidenceLevel,
        riskLevel: investmentData.riskLevel,
        tldr: investmentData.tldr,
        recommendations: investmentData.recommendations,
        keyIndicators: investmentData.keyIndicators,
        scenarios: investmentData.scenarios,
        criticalRisks: investmentData.criticalRisks,
        upcomingMilestones: investmentData.upcomingMilestones
      } : null,

      // Agent forecasts
      agentForecasts,

      // Consensus metrics
      consensus: {
        weightedPercentage: Math.round(weightedConsensus),
        agentCount: agentForecasts.length,
        averageConfidence: Math.round(
          agentForecasts.reduce((sum: number, a: any) => sum + (a.confidence || 0), 0) / agentForecasts.length
        ),
        positionBreakdown: {
          yes: agentForecasts.filter((a: any) => a.position === "YES").length,
          no: agentForecasts.filter((a: any) => a.position === "NO").length
        }
      },

      metadata: {
        fetchedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Forecast API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * Extract key bullet points from agent argument content
 */
function extractKeyPoints(content: string): string[] {
  if (!content) return []

  // Look for numbered lists or bullet points
  const lines = content.split("\n")
  const points: string[] = []

  for (const line of lines) {
    // Match patterns like "1. ", "- ", "* ", "• "
    const match = line.match(/^[\s]*(?:\d+\.|[-*•])\s+(.+)$/)
    if (match && match[1]) {
      const point = match[1].trim()
      if (point.length > 20 && point.length < 200) {
        points.push(point)
      }
    }
  }

  // Return top 3 points
  return points.slice(0, 3)
}
