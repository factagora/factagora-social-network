import { NextRequest, NextResponse } from "next/server"
import { getTimeseriesService } from "@/lib/timeseries/service"

/**
 * GET /api/timeseries/assets
 * Get all available timeseries assets
 */
export async function GET(request: NextRequest) {
  try {
    const service = getTimeseriesService()
    const assets = await service.getAvailableAssets()

    // Transform to camelCase for frontend
    const formattedAssets = assets.map(asset => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      assetType: asset.asset_type,
      provider: asset.provider,
      description: asset.description,
      metadata: asset.metadata,
      displayName: asset.metadata?.display_name || asset.name,
      iconUrl: asset.metadata?.icon_url,
      isActive: asset.is_active,
      lastUpdated: asset.last_updated,
    }))

    return NextResponse.json(formattedAssets)
  } catch (error) {
    console.error("Error fetching timeseries assets:", error)
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    )
  }
}
