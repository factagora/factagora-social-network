# Timeseries Data Module Design

## 목표

1. ✅ 무료 API로 유명 timeseries 데이터 제공
2. ✅ 모듈화된 구조로 나중에 TKG 연동 용이
3. ✅ 확장 가능한 아키텍처

---

## 아키텍처

```
┌─────────────────────────────────────────────┐
│         Prediction Creation UI              │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│      TimeseriesService (Facade)             │
│  - getAvailableAssets()                     │
│  - getHistoricalData(assetId, dateRange)    │
│  - getCurrentPrice(assetId)                 │
└─────────────┬───────────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────────┐
│     DataSourceRegistry                      │
│  - 여러 provider 관리                        │
└────┬────────────────────────────────────────┘
     │
     ├─────────────┬──────────────┬────────────┐
     ↓             ↓              ↓            ↓
┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│CoinGecko│  │  Yahoo   │  │  FRED    │  │   TKG    │
│Provider │  │ Provider │  │ Provider │  │ Provider │
│(현재)    │  │  (현재)   │  │ (추후)   │  │ (미래)   │
└─────────┘  └──────────┘  └──────────┘  └──────────┘
     │             │              │            │
     ↓             ↓              ↓            ↓
┌─────────────────────────────────────────────┐
│         CacheLayer (추상화)                  │
│  - PostgreSQL (현재)                         │
│  - TKG (미래)                                │
└─────────────────────────────────────────────┘
```

---

## 데이터베이스 스키마

```sql
-- 1. Timeseries 자산 메타데이터
CREATE TABLE timeseries_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 기본 정보
  symbol VARCHAR(20) NOT NULL UNIQUE,        -- "BTC", "AAPL"
  name TEXT NOT NULL,                         -- "Bitcoin", "Apple Inc."
  asset_type VARCHAR(50) NOT NULL,            -- "crypto", "stock", "commodity", "forex"

  -- 데이터 소스
  provider VARCHAR(50) NOT NULL,              -- "coingecko", "yahoo", "tkg"
  provider_config JSONB,                      -- Provider별 설정

  -- 메타데이터
  metadata JSONB,                             -- { unit: "USD", decimals: 2, ... }

  -- 상태
  is_active BOOLEAN DEFAULT true,
  update_frequency VARCHAR(20) DEFAULT 'daily', -- "hourly", "daily", "weekly"
  last_updated TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_timeseries_assets_type ON timeseries_assets(asset_type);
CREATE INDEX idx_timeseries_assets_active ON timeseries_assets(is_active);
CREATE INDEX idx_timeseries_assets_provider ON timeseries_assets(provider);

-- 2. Timeseries 데이터 캐시
CREATE TABLE timeseries_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  asset_id UUID NOT NULL REFERENCES timeseries_assets(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,

  -- 가격 데이터
  open DECIMAL(20, 8),
  high DECIMAL(20, 8),
  low DECIMAL(20, 8),
  close DECIMAL(20, 8) NOT NULL,              -- 주요 값
  volume DECIMAL(30, 8),

  -- 추가 메타데이터
  metadata JSONB,                              -- Provider별 추가 데이터

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 복합 유니크 제약
  UNIQUE(asset_id, timestamp)
);

-- 인덱스
CREATE INDEX idx_timeseries_data_asset_time ON timeseries_data(asset_id, timestamp DESC);
CREATE INDEX idx_timeseries_data_timestamp ON timeseries_data(timestamp DESC);

-- 3. Predictions에 asset 연결
ALTER TABLE predictions
  ADD COLUMN IF NOT EXISTS timeseries_asset_id UUID REFERENCES timeseries_assets(id);

CREATE INDEX idx_predictions_timeseries_asset ON predictions(timeseries_asset_id);

COMMENT ON COLUMN predictions.timeseries_asset_id IS 'Link to timeseries asset for TIMESERIES type predictions';
```

---

## 초기 자산 데이터 (5-10개)

```sql
-- 초기 자산 설정
INSERT INTO timeseries_assets (symbol, name, asset_type, provider, provider_config, metadata) VALUES

-- 암호화폐 (CoinGecko)
(
  'BTC',
  'Bitcoin',
  'crypto',
  'coingecko',
  '{"coinId": "bitcoin"}'::jsonb,
  '{"unit": "USD", "decimals": 2, "description": "The first and largest cryptocurrency"}'::jsonb
),
(
  'ETH',
  'Ethereum',
  'crypto',
  'coingecko',
  '{"coinId": "ethereum"}'::jsonb,
  '{"unit": "USD", "decimals": 2, "description": "The second largest cryptocurrency and smart contract platform"}'::jsonb
),

-- 주식 (Yahoo Finance)
(
  'AAPL',
  'Apple Inc.',
  'stock',
  'yahoo',
  '{"ticker": "AAPL"}'::jsonb,
  '{"unit": "USD", "decimals": 2, "exchange": "NASDAQ", "description": "Consumer electronics and software company"}'::jsonb
),
(
  'TSLA',
  'Tesla Inc.',
  'stock',
  'yahoo',
  '{"ticker": "TSLA"}'::jsonb,
  '{"unit": "USD", "decimals": 2, "exchange": "NASDAQ", "description": "Electric vehicle and clean energy company"}'::jsonb
),
(
  'NVDA',
  'NVIDIA Corporation',
  'stock',
  'yahoo',
  '{"ticker": "NVDA"}'::jsonb,
  '{"unit": "USD", "decimals": 2, "exchange": "NASDAQ", "description": "Graphics processing and AI chip manufacturer"}'::jsonb
),

-- 원자재
(
  'GOLD',
  'Gold',
  'commodity',
  'yahoo',
  '{"ticker": "GC=F"}'::jsonb,
  '{"unit": "USD/oz", "decimals": 2, "description": "Gold futures price"}'::jsonb
);
```

---

## 모듈 구조

```typescript
// lib/timeseries/types.ts
export interface TimeseriesAsset {
  id: string
  symbol: string
  name: string
  assetType: 'crypto' | 'stock' | 'commodity' | 'forex'
  provider: string
  metadata: {
    unit: string
    decimals: number
    description?: string
    exchange?: string
  }
  currentPrice?: number
  priceChange24h?: number
}

export interface TimeseriesDataPoint {
  timestamp: Date
  open?: number
  high?: number
  low?: number
  close: number
  volume?: number
}

export interface DateRange {
  start: Date
  end: Date
}

// lib/timeseries/providers/base.ts
export abstract class TimeseriesProvider {
  abstract readonly name: string

  /**
   * 최신 가격 조회 (실시간 표시용)
   */
  abstract getCurrentPrice(asset: TimeseriesAsset): Promise<number>

  /**
   * 과거 데이터 조회
   */
  abstract getHistoricalData(
    asset: TimeseriesAsset,
    dateRange: DateRange
  ): Promise<TimeseriesDataPoint[]>

  /**
   * Provider가 해당 asset을 지원하는지 확인
   */
  abstract supports(asset: TimeseriesAsset): boolean
}

// lib/timeseries/providers/coingecko.ts
export class CoinGeckoProvider extends TimeseriesProvider {
  readonly name = 'coingecko'
  private readonly baseUrl = 'https://api.coingecko.com/api/v3'

  supports(asset: TimeseriesAsset): boolean {
    return asset.provider === 'coingecko' && asset.assetType === 'crypto'
  }

  async getCurrentPrice(asset: TimeseriesAsset): Promise<number> {
    const coinId = asset.providerConfig?.coinId
    const response = await fetch(
      `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd`
    )
    const data = await response.json()
    return data[coinId]?.usd
  }

  async getHistoricalData(
    asset: TimeseriesAsset,
    dateRange: DateRange
  ): Promise<TimeseriesDataPoint[]> {
    const coinId = asset.providerConfig?.coinId
    const from = Math.floor(dateRange.start.getTime() / 1000)
    const to = Math.floor(dateRange.end.getTime() / 1000)

    const response = await fetch(
      `${this.baseUrl}/coins/${coinId}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`
    )
    const data = await response.json()

    return data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp: new Date(timestamp),
      close: price,
      volume: data.total_volumes.find((v: any) => v[0] === timestamp)?.[1]
    }))
  }
}

// lib/timeseries/providers/yahoo.ts
export class YahooFinanceProvider extends TimeseriesProvider {
  readonly name = 'yahoo'

  supports(asset: TimeseriesAsset): boolean {
    return asset.provider === 'yahoo'
  }

  async getCurrentPrice(asset: TimeseriesAsset): Promise<number> {
    // yfinance 또는 Yahoo Finance API 사용
    // 실제 구현 필요
    return 0
  }

  async getHistoricalData(
    asset: TimeseriesAsset,
    dateRange: DateRange
  ): Promise<TimeseriesDataPoint[]> {
    // yfinance 또는 Yahoo Finance API 사용
    // 실제 구현 필요
    return []
  }
}

// lib/timeseries/cache.ts
/**
 * 캐시 레이어 - 현재는 PostgreSQL, 나중에 TKG로 교체 가능
 */
export interface CacheProvider {
  get(assetId: string, dateRange: DateRange): Promise<TimeseriesDataPoint[]>
  set(assetId: string, data: TimeseriesDataPoint[]): Promise<void>
  clear(assetId: string): Promise<void>
}

export class PostgresCacheProvider implements CacheProvider {
  async get(assetId: string, dateRange: DateRange): Promise<TimeseriesDataPoint[]> {
    const { data } = await supabase
      .from('timeseries_data')
      .select('*')
      .eq('asset_id', assetId)
      .gte('timestamp', dateRange.start.toISOString())
      .lte('timestamp', dateRange.end.toISOString())
      .order('timestamp', { ascending: true })

    return data?.map(d => ({
      timestamp: new Date(d.timestamp),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume
    })) || []
  }

  async set(assetId: string, data: TimeseriesDataPoint[]): Promise<void> {
    const records = data.map(d => ({
      asset_id: assetId,
      timestamp: d.timestamp.toISOString(),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume
    }))

    await supabase.from('timeseries_data').upsert(records, {
      onConflict: 'asset_id,timestamp'
    })
  }

  async clear(assetId: string): Promise<void> {
    await supabase.from('timeseries_data').delete().eq('asset_id', assetId)
  }
}

// 미래: TKG Cache Provider
export class TKGCacheProvider implements CacheProvider {
  // TKG 연동 구현
  // temporal queries, knowledge graph relations 등
}

// lib/timeseries/registry.ts
export class DataSourceRegistry {
  private providers: Map<string, TimeseriesProvider> = new Map()

  register(provider: TimeseriesProvider) {
    this.providers.set(provider.name, provider)
  }

  getProvider(asset: TimeseriesAsset): TimeseriesProvider | null {
    for (const provider of this.providers.values()) {
      if (provider.supports(asset)) {
        return provider
      }
    }
    return null
  }
}

// lib/timeseries/service.ts
export class TimeseriesService {
  private registry: DataSourceRegistry
  private cache: CacheProvider

  constructor() {
    this.registry = new DataSourceRegistry()
    this.cache = new PostgresCacheProvider() // 나중에 TKGCacheProvider로 교체

    // Provider 등록
    this.registry.register(new CoinGeckoProvider())
    this.registry.register(new YahooFinanceProvider())
  }

  /**
   * 사용 가능한 자산 목록
   */
  async getAvailableAssets(): Promise<TimeseriesAsset[]> {
    const { data } = await supabase
      .from('timeseries_assets')
      .select('*')
      .eq('is_active', true)
      .order('name')

    return data || []
  }

  /**
   * 현재 가격 조회 (실시간)
   */
  async getCurrentPrice(assetId: string): Promise<number> {
    const asset = await this.getAsset(assetId)
    const provider = this.registry.getProvider(asset)

    if (!provider) {
      throw new Error(`No provider for asset: ${asset.symbol}`)
    }

    return provider.getCurrentPrice(asset)
  }

  /**
   * 과거 데이터 조회 (캐시 활용)
   */
  async getHistoricalData(
    assetId: string,
    dateRange: DateRange
  ): Promise<TimeseriesDataPoint[]> {
    // 1. 캐시 확인
    const cached = await this.cache.get(assetId, dateRange)

    if (cached.length > 0) {
      console.log(`Cache hit for ${assetId}`)
      return cached
    }

    // 2. Provider에서 가져오기
    const asset = await this.getAsset(assetId)
    const provider = this.registry.getProvider(asset)

    if (!provider) {
      throw new Error(`No provider for asset: ${asset.symbol}`)
    }

    const data = await provider.getHistoricalData(asset, dateRange)

    // 3. 캐시에 저장
    await this.cache.set(assetId, data)

    return data
  }

  private async getAsset(assetId: string): Promise<TimeseriesAsset> {
    const { data } = await supabase
      .from('timeseries_assets')
      .select('*')
      .eq('id', assetId)
      .single()

    if (!data) {
      throw new Error(`Asset not found: ${assetId}`)
    }

    return data
  }
}

// Singleton instance
export const timeseriesService = new TimeseriesService()
```

---

## API 엔드포인트

```typescript
// app/api/timeseries/assets/route.ts
import { timeseriesService } from '@/lib/timeseries/service'

export async function GET() {
  try {
    const assets = await timeseriesService.getAvailableAssets()
    return NextResponse.json({ assets })
  } catch (error) {
    console.error('Error fetching assets:', error)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}

// app/api/timeseries/[assetId]/price/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params

  try {
    const price = await timeseriesService.getCurrentPrice(assetId)
    return NextResponse.json({ price })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 })
  }
}

// app/api/timeseries/[assetId]/historical/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params
  const { searchParams } = new URL(request.url)

  const start = searchParams.get('start')
  const end = searchParams.get('end')

  try {
    const data = await timeseriesService.getHistoricalData(assetId, {
      start: new Date(start!),
      end: new Date(end!)
    })

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
```

---

## TKG 연동 준비

**현재 구조**:
```
TimeseriesService → PostgresCacheProvider → Supabase
                  → CoinGeckoProvider
                  → YahooFinanceProvider
```

**TKG 연동 후**:
```
TimeseriesService → TKGCacheProvider → Temporal Knowledge Graph
                  → TKGProvider (TKG에서 직접 조회)
                  → CoinGeckoProvider (fallback)
                  → YahooFinanceProvider (fallback)
```

**TKG 연동 시 변경 사항**:
1. `TKGCacheProvider` 구현
2. `TKGProvider` 구현 (TKG 네이티브 데이터 소스)
3. `TimeseriesService` 생성자에서 provider 교체
4. 기존 PostgreSQL 캐시는 fallback으로 유지

**장점**:
- ✅ 모듈 교체만으로 TKG 연동
- ✅ 기존 API 변경 없음
- ✅ 점진적 마이그레이션 가능

---

## 다음 단계

1. **Migration 파일 생성**: `timeseries_assets`, `timeseries_data` 테이블
2. **초기 자산 데이터**: Bitcoin, Ethereum, Apple, Tesla, NVIDIA, Gold
3. **Provider 구현**: CoinGecko, Yahoo Finance
4. **Service 레이어**: TimeseriesService
5. **API 엔드포인트**: `/api/timeseries/*`
6. **UI 업데이트**: 자산 선택 드롭다운

**시작할까요?**
