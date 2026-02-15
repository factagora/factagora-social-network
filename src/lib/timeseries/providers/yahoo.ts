/**
 * Yahoo Finance Provider
 * Free API for stocks, commodities, forex
 * Note: Requires yahoo-finance2 package
 * TODO: npm install yahoo-finance2
 */

import { TimeseriesProvider } from './base'
import { TimeseriesAsset, TimeseriesDataPoint, DateRange, ProviderCapabilities } from '@/types/timeseries'

interface YahooConfig {
  ticker: string
}

export class YahooFinanceProvider extends TimeseriesProvider {
  constructor() {
    super('yahoo')
  }

  supports(asset: TimeseriesAsset): boolean {
    return asset.provider === 'yahoo' &&
           ['stock', 'commodity', 'forex', 'index'].includes(asset.asset_type)
  }

  async getCurrentPrice(asset: TimeseriesAsset): Promise<number> {
    const config = asset.provider_config as YahooConfig

    if (!config.ticker) {
      throw new Error(`Invalid Yahoo config for ${asset.symbol}`)
    }

    try {
      // TODO: Implement with yahoo-finance2
      // const yahooFinance = require('yahoo-finance2').default
      // const quote = await yahooFinance.quote(config.ticker)
      // return quote.regularMarketPrice

      // Temporary mock for development
      console.warn(`Yahoo Finance getCurrentPrice not yet implemented for ${asset.symbol}`)
      return 0

    } catch (error) {
      console.error(`Yahoo getCurrentPrice error for ${asset.symbol}:`, error)
      throw error
    }
  }

  async getHistoricalData(
    asset: TimeseriesAsset,
    dateRange: DateRange
  ): Promise<TimeseriesDataPoint[]> {
    const config = asset.provider_config as YahooConfig

    if (!config.ticker) {
      throw new Error(`Invalid Yahoo config for ${asset.symbol}`)
    }

    try {
      // TODO: Implement with yahoo-finance2
      // const yahooFinance = require('yahoo-finance2').default
      // const queryOptions = {
      //   period1: dateRange.start,
      //   period2: dateRange.end,
      //   interval: '1d' as const
      // }
      // const result = await yahooFinance.historical(config.ticker, queryOptions)
      //
      // return result.map(item => ({
      //   id: '',
      //   asset_id: asset.id,
      //   timestamp: item.date.toISOString(),
      //   open: item.open,
      //   high: item.high,
      //   low: item.low,
      //   close: item.close,
      //   volume: item.volume,
      //   created_at: new Date().toISOString(),
      // }))

      // Temporary mock for development
      console.warn(`Yahoo Finance getHistoricalData not yet implemented for ${asset.symbol}`)
      return []

    } catch (error) {
      console.error(`Yahoo getHistoricalData error for ${asset.symbol}:`, error)
      throw error
    }
  }

  getCapabilities(): ProviderCapabilities {
    return {
      supportsHistorical: true,
      supportsRealtime: false,
      maxHistoricalDays: 3650, // 10 years
      rateLimit: {
        requestsPerMinute: 2000, // Very generous
      }
    }
  }

  validateConfig(config: Record<string, any>): boolean {
    return !!config.ticker
  }
}
