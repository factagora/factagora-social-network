/**
 * Cache Provider Interface
 * Abstraction layer for cache storage (PostgreSQL now, TKG later)
 */

import { TimeseriesDataPoint, DateRange } from '@/types/timeseries'

export interface CacheProvider {
  /**
   * Get cached data points for an asset within a date range
   */
  get(assetId: string, dateRange: DateRange): Promise<TimeseriesDataPoint[]>

  /**
   * Store data points in cache
   */
  set(assetId: string, data: TimeseriesDataPoint[]): Promise<void>

  /**
   * Clear cached data for an asset
   */
  clear(assetId: string): Promise<void>

  /**
   * Check if data exists in cache for a date range
   */
  has(assetId: string, dateRange: DateRange): Promise<boolean>

  /**
   * Get the latest cached timestamp for an asset
   */
  getLatestTimestamp(assetId: string): Promise<Date | null>
}
