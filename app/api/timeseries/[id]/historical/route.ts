import { NextRequest, NextResponse } from "next/server"
import { getTimeseriesService } from "@/lib/timeseries/service"

/**
 * GET /api/timeseries/[id]/historical?from=2024-01-01&to=2024-12-31
 * Get historical data for an asset
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)

    if (!id) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      )
    }

    // Parse date range
    const fromStr = searchParams.get('from')
    const toStr = searchParams.get('to')

    const from = fromStr ? new Date(fromStr) : undefined
    const to = toStr ? new Date(toStr) : undefined

    // Validate dates
    if (from && isNaN(from.getTime())) {
      return NextResponse.json(
        { error: "Invalid 'from' date format" },
        { status: 400 }
      )
    }

    if (to && isNaN(to.getTime())) {
      return NextResponse.json(
        { error: "Invalid 'to' date format" },
        { status: 400 }
      )
    }

    const service = getTimeseriesService()
    const data = await service.getHistoricalData(id, { from, to })

    // Get asset info
    const asset = await service.getAsset(id)

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      )
    }

    // Format response
    return NextResponse.json({
      assetId: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      dataPoints: data.map(point => ({
        timestamp: point.timestamp,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
        volume: point.volume,
      })),
      count: data.length,
      range: {
        from: from?.toISOString() || data[0]?.timestamp,
        to: to?.toISOString() || data[data.length - 1]?.timestamp,
      }
    })
  } catch (error) {
    console.error("Error fetching historical data:", error)
    return NextResponse.json(
      { error: "Failed to fetch historical data" },
      { status: 500 }
    )
  }
}
