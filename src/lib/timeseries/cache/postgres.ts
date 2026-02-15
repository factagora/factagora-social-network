/**
 * PostgreSQL Cache Provider
 * Current implementation using Supabase
 * Future: Will be replaced/supplemented by TKG
 */

import { CacheProvider } from './interface'
import { TimeseriesDataPoint, DateRange } from '@/types/timeseries'
import { createAdminClient } from '@/lib/supabase/server'

export class PostgresCacheProvider implements CacheProvider {
  async get(assetId: string, dateRange: DateRange): Promise<TimeseriesDataPoint[]> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('timeseries_data')
      .select('*')
      .eq('asset_id', assetId)
      .gte('timestamp', dateRange.start.toISOString())
      .lte('timestamp', dateRange.end.toISOString())
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('PostgresCacheProvider.get error:', error)
      throw new Error(`Failed to get cached data: ${error.message}`)
    }

    return data || []
  }

  async set(assetId: string, data: TimeseriesDataPoint[]): Promise<void> {
    if (data.length === 0) return

    const supabase = createAdminClient()

    // Prepare data for insertion
    const insertData = data.map(point => ({
      asset_id: assetId,
      timestamp: point.timestamp,
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      volume: point.volume,
      metadata: point.metadata,
    }))

    const { error } = await supabase
      .from('timeseries_data')
      .upsert(insertData, {
        onConflict: 'asset_id,timestamp',
        ignoreDuplicates: false,
      })

    if (error) {
      console.error('PostgresCacheProvider.set error:', error)
      throw new Error(`Failed to cache data: ${error.message}`)
    }
  }

  async clear(assetId: string): Promise<void> {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('timeseries_data')
      .delete()
      .eq('asset_id', assetId)

    if (error) {
      console.error('PostgresCacheProvider.clear error:', error)
      throw new Error(`Failed to clear cache: ${error.message}`)
    }
  }

  async has(assetId: string, dateRange: DateRange): Promise<boolean> {
    const supabase = createAdminClient()

    const { count, error } = await supabase
      .from('timeseries_data')
      .select('id', { count: 'exact', head: true })
      .eq('asset_id', assetId)
      .gte('timestamp', dateRange.start.toISOString())
      .lte('timestamp', dateRange.end.toISOString())

    if (error) {
      console.error('PostgresCacheProvider.has error:', error)
      return false
    }

    return (count ?? 0) > 0
  }

  async getLatestTimestamp(assetId: string): Promise<Date | null> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('timeseries_data')
      .select('timestamp')
      .eq('asset_id', assetId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    return new Date(data.timestamp)
  }
}
