/**
 * CoinGecko Provider
 * Free API for cryptocurrency data
 * Rate limit: 50 calls/min
 */

import { TimeseriesProvider } from './base'
import { TimeseriesAsset, TimeseriesDataPoint, DateRange, ProviderCapabilities } from '@/types/timeseries'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

interface CoinGeckoConfig {
  coin_id: string
  vs_currency: string
}

export class CoinGeckoProvider extends TimeseriesProvider {
  constructor() {
    super('coingecko')
  }

  supports(asset: TimeseriesAsset): boolean {
    return asset.provider === 'coingecko' && asset.asset_type === 'crypto'
  }

  async getCurrentPrice(asset: TimeseriesAsset): Promise<number> {
    const config = asset.provider_config as CoinGeckoConfig

    if (!config.coin_id || !config.vs_currency) {
      throw new Error(`Invalid CoinGecko config for ${asset.symbol}`)
    }

    const url = `${COINGECKO_API_BASE}/simple/price?ids=${config.coin_id}&vs_currencies=${config.vs_currency}`

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const data = await response.json()
      const price = data[config.coin_id]?.[config.vs_currency]

      if (typeof price !== 'number') {
        throw new Error(`Price not found for ${asset.symbol}`)
      }

      return price
    } catch (error) {
      console.error(`CoinGecko getCurrentPrice error for ${asset.symbol}:`, error)
      throw error
    }
  }

  async getHistoricalData(
    asset: TimeseriesAsset,
    dateRange: DateRange
  ): Promise<TimeseriesDataPoint[]> {
    const config = asset.provider_config as CoinGeckoConfig

    if (!config.coin_id || !config.vs_currency) {
      throw new Error(`Invalid CoinGecko config for ${asset.symbol}`)
    }

    // Calculate days difference
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))

    // CoinGecko: max 365 days for free tier with daily granularity
    const effectiveDays = Math.min(days, 365)

    const url = `${COINGECKO_API_BASE}/coins/${config.coin_id}/market_chart?vs_currency=${config.vs_currency}&days=${effectiveDays}`

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.prices || !Array.isArray(data.prices)) {
        throw new Error(`Invalid response format from CoinGecko`)
      }

      // Transform to TimeseriesDataPoint format
      const dataPoints: TimeseriesDataPoint[] = data.prices.map(([timestamp, price]: [number, number]) => ({
        id: '', // Will be set by database
        asset_id: asset.id,
        timestamp: new Date(timestamp).toISOString(),
        close: price,
        volume: undefined, // CoinGecko returns volume separately
        created_at: new Date().toISOString(),
      }))

      // Filter by date range
      const startTime = dateRange.start.getTime()
      const endTime = dateRange.end.getTime()

      return dataPoints.filter(point => {
        const pointTime = new Date(point.timestamp).getTime()
        return pointTime >= startTime && pointTime <= endTime
      })

    } catch (error) {
      console.error(`CoinGecko getHistoricalData error for ${asset.symbol}:`, error)
      throw error
    }
  }

  getCapabilities(): ProviderCapabilities {
    return {
      supportsHistorical: true,
      supportsRealtime: false,
      maxHistoricalDays: 365,
      rateLimit: {
        requestsPerMinute: 50,
      }
    }
  }

  validateConfig(config: Record<string, any>): boolean {
    return !!(config.coin_id && config.vs_currency)
  }
}
