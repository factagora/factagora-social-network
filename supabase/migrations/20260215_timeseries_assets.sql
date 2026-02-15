-- ============================================
-- Timeseries Assets & Data Module
-- Purpose: Store external timeseries data (Bitcoin, stocks, etc.)
-- Architecture: Prepared for future TKG integration
-- ============================================

-- 1. Create timeseries_assets table
CREATE TABLE IF NOT EXISTS timeseries_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(20) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('crypto', 'stock', 'commodity', 'forex', 'index')),

  -- Provider configuration
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('coingecko', 'yahoo', 'tkg')),
  provider_config JSONB,

  -- Metadata
  description TEXT,
  metadata JSONB,

  -- Status
  is_active BOOLEAN DEFAULT true,
  update_frequency VARCHAR(20) DEFAULT 'daily' CHECK (update_frequency IN ('realtime', 'hourly', 'daily', 'weekly')),
  last_updated TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE timeseries_assets IS 'Asset metadata for timeseries predictions (Bitcoin, stocks, etc.)';
COMMENT ON COLUMN timeseries_assets.symbol IS 'Unique asset symbol (e.g., BTC, AAPL, GOLD)';
COMMENT ON COLUMN timeseries_assets.provider IS 'Data source provider (coingecko, yahoo, tkg)';
COMMENT ON COLUMN timeseries_assets.provider_config IS 'Provider-specific configuration (API params, endpoints)';

-- 2. Create timeseries_data table (cache layer)
CREATE TABLE IF NOT EXISTS timeseries_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES timeseries_assets(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,

  -- OHLCV data
  open DECIMAL(20, 8),
  high DECIMAL(20, 8),
  low DECIMAL(20, 8),
  close DECIMAL(20, 8) NOT NULL,  -- Required: closing price
  volume DECIMAL(30, 8),

  -- Metadata (optional additional fields)
  metadata JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate data points
  UNIQUE(asset_id, timestamp)
);

COMMENT ON TABLE timeseries_data IS 'Historical timeseries data cache (prices, volumes)';
COMMENT ON COLUMN timeseries_data.close IS 'Closing price (required for predictions)';
COMMENT ON COLUMN timeseries_data.metadata IS 'Additional data (market cap, indicators, etc.)';

-- 3. Add timeseries_asset_id to predictions table
ALTER TABLE predictions
  ADD COLUMN IF NOT EXISTS timeseries_asset_id UUID REFERENCES timeseries_assets(id);

COMMENT ON COLUMN predictions.timeseries_asset_id IS 'Link to timeseries asset for TIMESERIES type predictions';

-- 4. Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_timeseries_data_asset_time
  ON timeseries_data(asset_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_timeseries_data_timestamp
  ON timeseries_data(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_timeseries_assets_active
  ON timeseries_assets(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_predictions_timeseries_asset
  ON predictions(timeseries_asset_id) WHERE timeseries_asset_id IS NOT NULL;

-- 5. Seed initial assets (6 popular assets)
INSERT INTO timeseries_assets (symbol, name, asset_type, provider, provider_config, description, metadata) VALUES
  -- Crypto (CoinGecko)
  (
    'BTC',
    'Bitcoin',
    'crypto',
    'coingecko',
    '{"coin_id": "bitcoin", "vs_currency": "usd"}',
    'Leading cryptocurrency by market cap',
    '{"decimals": 8, "display_name": "Bitcoin (BTC)", "icon_url": "https://assets.coingecko.com/coins/images/1/small/bitcoin.png"}'
  ),
  (
    'ETH',
    'Ethereum',
    'crypto',
    'coingecko',
    '{"coin_id": "ethereum", "vs_currency": "usd"}',
    'Leading smart contract platform',
    '{"decimals": 8, "display_name": "Ethereum (ETH)", "icon_url": "https://assets.coingecko.com/coins/images/279/small/ethereum.png"}'
  ),

  -- Stocks (Yahoo Finance)
  (
    'AAPL',
    'Apple Inc.',
    'stock',
    'yahoo',
    '{"ticker": "AAPL"}',
    'Technology company - consumer electronics',
    '{"decimals": 2, "display_name": "Apple Inc. (AAPL)", "exchange": "NASDAQ"}'
  ),
  (
    'TSLA',
    'Tesla Inc.',
    'stock',
    'yahoo',
    '{"ticker": "TSLA"}',
    'Electric vehicles and clean energy',
    '{"decimals": 2, "display_name": "Tesla Inc. (TSLA)", "exchange": "NASDAQ"}'
  ),
  (
    'NVDA',
    'NVIDIA Corporation',
    'stock',
    'yahoo',
    '{"ticker": "NVDA"}',
    'Graphics processing and AI chips',
    '{"decimals": 2, "display_name": "NVIDIA Corp. (NVDA)", "exchange": "NASDAQ"}'
  ),

  -- Commodities (Yahoo Finance)
  (
    'GOLD',
    'Gold',
    'commodity',
    'yahoo',
    '{"ticker": "GC=F"}',
    'Gold futures price',
    '{"decimals": 2, "display_name": "Gold (XAU/USD)", "unit": "USD/oz"}'
  )
ON CONFLICT (symbol) DO NOTHING;

-- 6. Verify installation
DO $$
DECLARE
  asset_count INTEGER;
  data_count INTEGER;
BEGIN
  -- Check assets
  SELECT COUNT(*) INTO asset_count
  FROM timeseries_assets;

  -- Check data
  SELECT COUNT(*) INTO data_count
  FROM timeseries_data;

  RAISE NOTICE '✓ Timeseries module installed';
  RAISE NOTICE '  - Assets: %', asset_count;
  RAISE NOTICE '  - Data points: %', data_count;
END $$;
