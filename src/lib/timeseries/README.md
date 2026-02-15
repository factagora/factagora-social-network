# Timeseries Module

Historical market data management for Factagora predictions.

## Architecture

```
TimeseriesService (Facade)
    ├── TimeseriesRegistry (Provider Management)
    ├── TimeseriesCache (PostgreSQL Cache)
    └── Providers
        ├── CoinGeckoProvider ✅ (Bitcoin, Ethereum)
        ├── YahooFinanceProvider ⚠️ (Stocks - TODO)
        └── TKGProvider 🔮 (Future)
```

## Usage

### Get Historical Data

```typescript
import { TimeseriesService } from '@/lib/timeseries/service'

const service = TimeseriesService.getInstance()

// Fetch last 30 days of Bitcoin data
const data = await service.getHistoricalData('dcc9d1db-5a06-4717-b29c-404ca21eec90', {
  dateRange: {
    start: new Date('2026-01-15'),
    end: new Date('2026-02-15')
  },
  interval: 'daily'
})
```

### Get Current Price

```typescript
const price = await service.getCurrentPrice('dcc9d1db-5a06-4717-b29c-404ca21eec90')
// { assetId, symbol, currentPrice, timestamp, ... }
```

## Database Tables

### `timeseries_assets`
Asset metadata (BTC, ETH, AAPL, etc.)

### `timeseries_data`
OHLCV time-series data cache

## API Endpoints

- `GET /api/timeseries/assets` - List all assets
- `GET /api/timeseries/[id]/historical` - Get historical data
- `GET /api/timeseries/[id]/price` - Get current price

## Data Pipeline Integration

See `/Users/randybaek/workspace/inv-sys/FACTAGORA_TIMESERIES_DATA_INTEGRATION.md` for inv-sys integration guide.

## Status

| Provider | Status | Assets |
|----------|--------|--------|
| CoinGecko | ✅ Working | BTC, ETH |
| Yahoo Finance | ⚠️ Not implemented | AAPL, TSLA, NVDA, GOLD |
| TKG | 🔮 Future | TBD |
