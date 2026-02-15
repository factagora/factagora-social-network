import { NextRequest, NextResponse } from "next/server"
import { getTimeseriesService } from "@/lib/timeseries/service"

/**
 * GET /api/timeseries/[id]/price
 * Get current price for an asset
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      )
    }

    const service = getTimeseriesService()
    const priceInfo = await service.getCurrentPrice(id)

    if (!priceInfo) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      assetId: priceInfo.assetId,
      symbol: priceInfo.symbol,
      currentPrice: priceInfo.currentPrice,
      timestamp: priceInfo.timestamp,
      change24h: priceInfo.change24h,
      change7d: priceInfo.change7d,
      volume24h: priceInfo.volume24h,
    })
  } catch (error) {
    console.error("Error fetching asset price:", error)
    return NextResponse.json(
      { error: "Failed to fetch price" },
      { status: 500 }
    )
  }
}
