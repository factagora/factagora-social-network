/**
 * Data Source Registry
 * Manages all timeseries providers
 */

import { TimeseriesProvider } from './providers/base'
import { CoinGeckoProvider } from './providers/coingecko'
import { YahooFinanceProvider } from './providers/yahoo'
import { TimeseriesAsset } from '@/types/timeseries'

export class DataSourceRegistry {
  private providers: TimeseriesProvider[] = []

  constructor() {
    // Register all providers
    this.registerProvider(new CoinGeckoProvider())
    this.registerProvider(new YahooFinanceProvider())
  }

  /**
   * Register a new provider
   */
  registerProvider(provider: TimeseriesProvider): void {
    this.providers.push(provider)
    console.log(`✓ Registered provider: ${provider.getName()}`)
  }

  /**
   * Find the appropriate provider for an asset
   */
  getProvider(asset: TimeseriesAsset): TimeseriesProvider | null {
    for (const provider of this.providers) {
      if (provider.supports(asset)) {
        return provider
      }
    }
    return null
  }

  /**
   * Get all registered providers
   */
  getAllProviders(): TimeseriesProvider[] {
    return [...this.providers]
  }

  /**
   * Get provider by name
   */
  getProviderByName(name: string): TimeseriesProvider | null {
    return this.providers.find(p => p.getName() === name) || null
  }
}
