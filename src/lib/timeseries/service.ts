/**
 * Timeseries Service
 * Main facade for timeseries functionality
 * Coordinates providers, cache, and database
 */

import { DataSourceRegistry } from './registry'
import { PostgresCacheProvider } from './cache/postgres'
import { CacheProvider } from './cache/interface'
import { createAdminClient } from '@/lib/supabase/server'
import {
  TimeseriesAsset,
  TimeseriesDataPoint,
  DateRange,
  AssetPriceInfo,
  TimeseriesQueryOptions,
} from '@/types/timeseries'

export class TimeseriesService {
  private registry: DataSourceRegistry
  private cache: CacheProvider

  constructor(cache?: CacheProvider) {
    this.registry = new DataSourceRegistry()
    this.cache = cache || new PostgresCacheProvider()
  }

  /**
   * Get all available assets
   */
  async getAvailableAssets(): Promise<TimeseriesAsset[]> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('timeseries_assets')
      .select('*')
      .eq('is_active', true)
      .order('symbol', { ascending: true })

    if (error) {
      console.error('TimeseriesService.getAvailableAssets error:', error)
      throw new Error(`Failed to get assets: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get asset by ID
   */
  async getAsset(assetId: string): Promise<TimeseriesAsset | null> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('timeseries_assets')
      .select('*')
      .eq('id', assetId)
      .single()

    if (error) {
      console.error('TimeseriesService.getAsset error:', error)
      return null
    }

    return data
  }

  /**
   * Get current price for an asset
   */
  async getCurrentPrice(assetId: string): Promise<AssetPriceInfo | null> {
    const asset = await this.getAsset(assetId)
    if (!asset) return null

    const provider = this.registry.getProvider(asset)
    if (!provider) {
      throw new Error(`No provider found for asset ${asset.symbol}`)
    }

    try {
      const price = await provider.getCurrentPrice(asset)

      return {
        assetId: asset.id,
        symbol: asset.symbol,
        currentPrice: price,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error(`TimeseriesService.getCurrentPrice error for ${asset.symbol}:`, error)
      throw error
    }
  }

  /**
   * Get historical data for an asset
   * Uses cache-first strategy
   */
  async getHistoricalData(
    assetId: string,
    options: TimeseriesQueryOptions = {}
  ): Promise<TimeseriesDataPoint[]> {
    const asset = await this.getAsset(assetId)
    if (!asset) {
      throw new Error(`Asset not found: ${assetId}`)
    }

    // Default date range: last 365 days
    const to = options.to || new Date()
    const from = options.from || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)

    const dateRange: DateRange = { start: from, end: to }

    // Try cache first
    const cachedData = await this.cache.get(assetId, dateRange)

    if (cachedData.length > 0) {
      console.log(`✓ Cache hit for ${asset.symbol}: ${cachedData.length} points`)
      return cachedData
    }

    // Cache miss - fetch from provider
    console.log(`Cache miss for ${asset.symbol} - fetching from provider`)

    const provider = this.registry.getProvider(asset)
    if (!provider) {
      throw new Error(`No provider found for asset ${asset.symbol}`)
    }

    try {
      const data = await provider.getHistoricalData(asset, dateRange)

      // Store in cache
      if (data.length > 0) {
        await this.cache.set(assetId, data)
        console.log(`✓ Cached ${data.length} points for ${asset.symbol}`)
      }

      return data
    } catch (error) {
      console.error(`TimeseriesService.getHistoricalData error for ${asset.symbol}:`, error)
      throw error
    }
  }

  /**
   * Update cache for an asset (refresh data)
   */
  async refreshAssetData(assetId: string, days: number = 365): Promise<void> {
    const asset = await this.getAsset(assetId)
    if (!asset) {
      throw new Error(`Asset not found: ${assetId}`)
    }

    const provider = this.registry.getProvider(asset)
    if (!provider) {
      throw new Error(`No provider found for asset ${asset.symbol}`)
    }

    const dateRange: DateRange = {
      start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      end: new Date(),
    }

    try {
      const data = await provider.getHistoricalData(asset, dateRange)

      if (data.length > 0) {
        await this.cache.set(assetId, data)
        console.log(`✓ Refreshed ${data.length} points for ${asset.symbol}`)
      }

      // Update last_updated timestamp
      const supabase = createAdminClient()
      await supabase
        .from('timeseries_assets')
        .update({ last_updated: new Date().toISOString() })
        .eq('id', assetId)

    } catch (error) {
      console.error(`TimeseriesService.refreshAssetData error for ${asset.symbol}:`, error)
      throw error
    }
  }

  /**
   * Clear cache for an asset
   */
  async clearCache(assetId: string): Promise<void> {
    await this.cache.clear(assetId)
  }
}

// Singleton instance
let serviceInstance: TimeseriesService | null = null

export function getTimeseriesService(): TimeseriesService {
  if (!serviceInstance) {
    serviceInstance = new TimeseriesService()
  }
  return serviceInstance
}
