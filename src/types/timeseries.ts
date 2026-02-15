/**
 * Timeseries Module Types
 * Architecture: Prepared for TKG integration
 */

// ============================================
// Database Types
// ============================================

export interface TimeseriesAsset {
  id: string
  symbol: string
  name: string
  asset_type: 'crypto' | 'stock' | 'commodity' | 'forex' | 'index'
  provider: 'coingecko' | 'yahoo' | 'tkg'
  provider_config: Record<string, any>
  description?: string
  metadata?: {
    decimals?: number
    display_name?: string
    icon_url?: string
    exchange?: string
    unit?: string
    [key: string]: any
  }
  is_active: boolean
  update_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  last_updated?: string
  created_at: string
  updated_at: string
}

export interface TimeseriesDataPoint {
  id: string
  asset_id: string
  timestamp: string
  open?: number
  high?: number
  low?: number
  close: number  // Required
  volume?: number
  metadata?: Record<string, any>
  created_at: string
}

// ============================================
// API Response Types
// ============================================

export interface TimeseriesAssetResponse {
  id: string
  symbol: string
  name: string
  assetType: string
  displayName: string
  iconUrl?: string
  currentPrice?: number
  change24h?: number
  provider: string
}

export interface TimeseriesHistoricalResponse {
  assetId: string
  symbol: string
  data: {
    timestamp: string
    open?: number
    high?: number
    low?: number
    close: number
    volume?: number
  }[]
}

// ============================================
// Provider Types
// ============================================

export interface DateRange {
  start: Date
  end: Date
}

export interface ProviderCapabilities {
  supportsHistorical: boolean
  supportsRealtime: boolean
  maxHistoricalDays: number
  rateLimit?: {
    requestsPerMinute: number
    requestsPerDay?: number
  }
}

// ============================================
// Service Types
// ============================================

export interface TimeseriesQueryOptions {
  from?: Date
  to?: Date
  interval?: 'hourly' | 'daily' | 'weekly'
  includeVolume?: boolean
}

export interface AssetPriceInfo {
  assetId: string
  symbol: string
  currentPrice: number
  timestamp: string
  change24h?: number
  change7d?: number
  volume24h?: number
}
