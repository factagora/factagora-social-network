/**
 * Base Provider for Timeseries Data Sources
 * Abstract class that all providers must implement
 */

import { TimeseriesAsset, TimeseriesDataPoint, DateRange, ProviderCapabilities } from '@/types/timeseries'

export abstract class TimeseriesProvider {
  protected providerName: string

  constructor(providerName: string) {
    this.providerName = providerName
  }

  /**
   * Check if this provider supports the given asset
   */
  abstract supports(asset: TimeseriesAsset): boolean

  /**
   * Get current price for an asset
   */
  abstract getCurrentPrice(asset: TimeseriesAsset): Promise<number>

  /**
   * Get historical data for an asset
   * @param asset - The asset to fetch data for
   * @param dateRange - Date range to fetch
   * @returns Array of data points
   */
  abstract getHistoricalData(
    asset: TimeseriesAsset,
    dateRange: DateRange
  ): Promise<TimeseriesDataPoint[]>

  /**
   * Get provider capabilities
   */
  abstract getCapabilities(): ProviderCapabilities

  /**
   * Validate provider configuration
   */
  validateConfig(config: Record<string, any>): boolean {
    return !!config
  }

  /**
   * Get provider name
   */
  getName(): string {
    return this.providerName
  }
}
