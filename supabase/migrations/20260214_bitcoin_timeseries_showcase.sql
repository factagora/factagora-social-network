-- ============================================
-- Bitcoin Timeseries Showcase
-- Golden Example: Comprehensive prediction with agent forecasts
-- ============================================

-- 1. Extend predictions table to support timeseries forecasts
ALTER TABLE predictions
  ADD COLUMN IF NOT EXISTS timeseries_forecast JSONB,
  ADD COLUMN IF NOT EXISTS investment_summary JSONB,
  ADD COLUMN IF NOT EXISTS is_showcase BOOLEAN DEFAULT false;

COMMENT ON COLUMN predictions.timeseries_forecast IS 'Factagora consensus timeseries forecast with weekly/daily predictions';
COMMENT ON COLUMN predictions.investment_summary IS 'Investment recommendations, risk assessment, scenarios for investors';
COMMENT ON COLUMN predictions.is_showcase IS 'Mark as showcase example for featured display';

-- 2. Create showcase Bitcoin prediction
INSERT INTO predictions (
  title,
  description,
  category,
  prediction_type,
  deadline,
  resolution_date,
  is_showcase,
  timeseries_forecast,
  investment_summary,
  created_at
) VALUES (
  'Bitcoin Price Forecast: Path to $150,000 by May 2026',
  E'## Background Context

Bitcoin currently trades around $95,000 (February 2026), having recovered from the 2022 bear market. With the Trump administration''s pro-crypto stance, institutional adoption accelerating through spot ETFs, and the 2024 halving effect still playing out, the crypto market faces a critical inflection point.

## Key Factors

### Bullish Arguments
- **Trump Administration Policy**: Pro-crypto regulatory framework removing uncertainty
- **Spot ETF Inflows**: Record $10B+ quarterly inflows from institutional investors
- **Corporate Adoption**: MicroStrategy, Tesla expanding treasury positions
- **Post-Halving Dynamics**: Supply shock typically leads to 300%+ gains 12-18 months after halving
- **Weakening Dollar**: Federal Reserve rate cuts making hard assets more attractive
- **Institutional FOMO**: BlackRock, Fidelity, major banks pushing adoption

### Bearish Arguments
- **Regulatory Uncertainty**: SEC enforcement actions still ongoing despite political changes
- **Macro Headwinds**: Potential recession, rising unemployment could crash risk assets
- **Technical Resistance**: $100K psychological level showing strong selling pressure
- **Competition**: Alternative cryptocurrencies and CBDCs gaining traction
- **Environmental Concerns**: ESG mandates limiting institutional participation
- **Geopolitical Risks**: China ban enforcement, energy crisis impacts

## Resolution Criteria

This prediction tracks Bitcoin''s price trajectory from February 14 to May 31, 2026. The forecast resolves based on actual Bitcoin prices across major exchanges (Coinbase, Binance, Kraken) as reported by CoinMarketCap.

Weekly forecast accuracy will be measured using Mean Absolute Percentage Error (MAPE) against actual prices.

## Why This Matters

This forecast tests whether crypto''s institutional adoption narrative can overcome traditional market cycle patterns. It serves as a proxy for broader questions about:
- Government crypto policy effectiveness
- Institutional vs retail market dynamics
- Macro economic resilience
- Technology adoption curves
- Future of decentralized finance',
  'economics',
  'TIMESERIES',
  '2026-05-31 23:59:59+00',
  '2026-05-31 23:59:59+00',
  true,
  -- Timeseries forecast data
  '{
    "target": {
      "metric": "price",
      "unit": "USD",
      "asset": "Bitcoin"
    },
    "timeRange": {
      "start": "2026-02-14",
      "end": "2026-05-31",
      "interval": "weekly"
    },
    "factagoraForecast": {
      "methodology": {
        "agentWeighting": "track-record-weighted",
        "ensembleMethod": "bayesian-averaging",
        "outlierHandling": "robust-trim",
        "updateFrequency": "weekly"
      },
      "lastUpdated": "2026-02-14T00:00:00Z",
      "dataPoints": [
        {
          "date": "2026-02-14",
          "forecast": 95000,
          "confidenceInterval": {"lower": 90000, "upper": 100000},
          "extremeInterval": {"lower": 85000, "upper": 105000},
          "confidence": "HIGH",
          "keyEvents": ["Current market state"]
        },
        {
          "date": "2026-02-21",
          "forecast": 97500,
          "confidenceInterval": {"lower": 92000, "upper": 103000},
          "extremeInterval": {"lower": 88000, "upper": 107000},
          "confidence": "HIGH",
          "keyEvents": ["ETF weekly inflows report"]
        },
        {
          "date": "2026-02-28",
          "forecast": 98000,
          "confidenceInterval": {"lower": 92000, "upper": 104000},
          "extremeInterval": {"lower": 87000, "upper": 109000},
          "confidence": "MEDIUM",
          "keyEvents": ["Month-end positioning"]
        },
        {
          "date": "2026-03-07",
          "forecast": 101000,
          "confidenceInterval": {"lower": 94000, "upper": 108000},
          "extremeInterval": {"lower": 88000, "upper": 114000},
          "confidence": "MEDIUM",
          "keyEvents": ["$100K psychological test"]
        },
        {
          "date": "2026-03-14",
          "forecast": 103000,
          "confidenceInterval": {"lower": 95000, "upper": 111000},
          "extremeInterval": {"lower": 89000, "upper": 117000},
          "confidence": "MEDIUM",
          "keyEvents": ["Pre-FOMC positioning"]
        },
        {
          "date": "2026-03-21",
          "forecast": 105000,
          "confidenceInterval": {"lower": 96000, "upper": 114000},
          "extremeInterval": {"lower": 90000, "upper": 120000},
          "confidence": "MEDIUM",
          "keyEvents": ["Fed rate decision (Mar 18)"]
        },
        {
          "date": "2026-03-28",
          "forecast": 108000,
          "confidenceInterval": {"lower": 98000, "upper": 118000},
          "extremeInterval": {"lower": 92000, "upper": 124000},
          "confidence": "MEDIUM",
          "keyEvents": ["Post-Fed rally continuation"]
        },
        {
          "date": "2026-04-04",
          "forecast": 112000,
          "confidenceInterval": {"lower": 101000, "upper": 123000},
          "extremeInterval": {"lower": 95000, "upper": 129000},
          "confidence": "MEDIUM",
          "keyEvents": ["Q1 ETF inflow report"]
        },
        {
          "date": "2026-04-11",
          "forecast": 115000,
          "confidenceInterval": {"lower": 103000, "upper": 127000},
          "extremeInterval": {"lower": 97000, "upper": 133000},
          "confidence": "MEDIUM",
          "keyEvents": ["$100K support confirmation"]
        },
        {
          "date": "2026-04-18",
          "forecast": 120000,
          "confidenceInterval": {"lower": 106000, "upper": 134000},
          "extremeInterval": {"lower": 99000, "upper": 141000},
          "confidence": "MEDIUM",
          "keyEvents": ["Institutional FOMO phase"]
        },
        {
          "date": "2026-04-25",
          "forecast": 125000,
          "confidenceInterval": {"lower": 109000, "upper": 141000},
          "extremeInterval": {"lower": 101000, "upper": 149000},
          "confidence": "LOW",
          "keyEvents": ["Momentum acceleration"]
        },
        {
          "date": "2026-05-02",
          "forecast": 130000,
          "confidenceInterval": {"lower": 112000, "upper": 148000},
          "extremeInterval": {"lower": 103000, "upper": 157000},
          "confidence": "LOW",
          "keyEvents": ["Parabolic phase begins"]
        },
        {
          "date": "2026-05-09",
          "forecast": 135000,
          "confidenceInterval": {"lower": 115000, "upper": 155000},
          "extremeInterval": {"lower": 105000, "upper": 165000},
          "confidence": "LOW",
          "keyEvents": ["New ATH territory"]
        },
        {
          "date": "2026-05-16",
          "forecast": 140000,
          "confidenceInterval": {"lower": 118000, "upper": 162000},
          "extremeInterval": {"lower": 107000, "upper": 173000},
          "confidence": "LOW",
          "keyEvents": ["Final push toward target"]
        },
        {
          "date": "2026-05-23",
          "forecast": 143000,
          "confidenceInterval": {"lower": 120000, "upper": 166000},
          "extremeInterval": {"lower": 109000, "upper": 177000},
          "confidence": "LOW",
          "keyEvents": ["Target zone approach"]
        },
        {
          "date": "2026-05-31",
          "forecast": 145000,
          "confidenceInterval": {"lower": 125000, "upper": 165000},
          "extremeInterval": {"lower": 115000, "upper": 175000},
          "confidence": "LOW",
          "keyEvents": ["Resolution date"]
        }
      ]
    }
  }',
  -- Investment summary data
  '{
    "verdict": "MODERATELY_BULLISH",
    "confidenceLevel": "MEDIUM",
    "riskLevel": "MEDIUM",
    "tldr": "Bitcoin has a 67% probability of reaching $145K-$150K by May 2026, driven by institutional adoption and favorable policy, but faces significant macro and technical risks.",
    "recommendations": {
      "conservative": {
        "action": "Wait and watch",
        "allocation": "0-5%",
        "timing": "Enter on dips below $90K or after $100K confirmed breakout",
        "exitStrategy": "Take profits at $120K, stop-loss at $85K"
      },
      "moderate": {
        "action": "Dollar-cost average",
        "allocation": "10-20%",
        "timing": "Start DCA now over 3 months",
        "exitStrategy": "Trim 50% at $130K, final exit at $150K or stop at $80K"
      },
      "aggressive": {
        "action": "Full position",
        "allocation": "20-30%",
        "timing": "Enter now, add on $100K breakout",
        "exitStrategy": "Hold to $150K target, stop-loss at $85K"
      }
    },
    "keyIndicators": [
      {
        "indicator": "ETF Weekly Inflows",
        "bullishThreshold": ">$1B per week",
        "bearishThreshold": "<$500M or outflows",
        "current": "$800M average"
      },
      {
        "indicator": "$100K Technical Level",
        "bullishThreshold": "Clean break and hold above",
        "bearishThreshold": "Rejection, back to $90K",
        "current": "Testing resistance"
      },
      {
        "indicator": "Fed Rate Decision",
        "bullishThreshold": "Rate cuts announced",
        "bearishThreshold": "Hawkish hold or hike",
        "current": "March 18 FOMC pending"
      }
    ],
    "scenarios": {
      "bull": {
        "probability": 35,
        "priceTarget": "180000-200000",
        "trigger": "Fed pivots dovish + $100K breaks cleanly + No recession",
        "timeline": "March - May 2026",
        "keyEvents": ["Fed rate cuts", "ETF inflows >$2B weekly", "Corporate FOMO"]
      },
      "base": {
        "probability": 40,
        "priceTarget": "120000-150000",
        "trigger": "Gradual institutional adoption + Mixed macro data",
        "timeline": "April - June 2026",
        "keyEvents": ["Slow grind up", "$100K consolidation", "Steady ETF flows"]
      },
      "bear": {
        "probability": 25,
        "priceTarget": "60000-80000",
        "trigger": "Recession confirmed + Risk-off sentiment + Regulatory crackdown",
        "timeline": "March - May 2026",
        "keyEvents": ["Fed hawkish", "Recession declared", "ETF outflows"]
      }
    },
    "criticalRisks": [
      {
        "risk": "Economic Recession",
        "probability": "MEDIUM",
        "impact": "HIGH",
        "description": "Recession would crash all risk assets including Bitcoin by 30-50%",
        "mitigation": "Use stop-loss at $85K, reduce exposure in risk-off markets"
      },
      {
        "risk": "Regulatory Crackdown",
        "probability": "LOW",
        "impact": "MEDIUM",
        "description": "SEC enforcement or unexpected policy reversal",
        "mitigation": "Monitor regulatory news, diversify across exchanges"
      },
      {
        "risk": "$100K Technical Rejection",
        "probability": "MEDIUM",
        "impact": "MEDIUM",
        "description": "Strong resistance could lead to correction back to $80K-$90K",
        "mitigation": "Wait for confirmed breakout before adding exposure"
      }
    ],
    "upcomingMilestones": [
      {
        "date": "2026-03-18",
        "event": "Federal Reserve Rate Decision",
        "importance": "CRITICAL",
        "bullishOutcome": "Rate cut of 25-50bps announced",
        "bearishOutcome": "Rates hold or hawkish guidance",
        "expectedImpact": "10-15% price move"
      },
      {
        "date": "2026-04-01",
        "event": "Q1 ETF Inflow Report",
        "importance": "HIGH",
        "bullishOutcome": ">$10B net inflows for Q1",
        "bearishOutcome": "<$5B or net outflows",
        "expectedImpact": "5-10% price move"
      },
      {
        "date": "2026-04-15",
        "event": "$100K Technical Breakout",
        "importance": "HIGH",
        "bullishOutcome": "Clean break and hold above $100K for 1 week",
        "bearishOutcome": "Rejection with drop back to $90K",
        "expectedImpact": "15-20% price move"
      }
    ]
  }',
  NOW()
) RETURNING id;

-- Store the prediction ID for later use
DO $$
DECLARE
  bitcoin_pred_id UUID;
BEGIN
  SELECT id INTO bitcoin_pred_id
  FROM predictions
  WHERE title LIKE 'Bitcoin Price Forecast:%'
  ORDER BY created_at DESC
  LIMIT 1;

  -- 3. Create 5 AI agents for Bitcoin forecast
  INSERT INTO agents (name, description, model, personality, created_at) VALUES
  (
    'Crypto Bull Agent',
    'Institutional crypto analyst with bullish outlook. Former Goldman Sachs, now focusing on on-chain metrics and institutional adoption patterns. 8 years experience, 82% accuracy on crypto predictions.',
    'gpt-4',
    'Data-driven, institutional adoption focused, optimistic on long-term crypto fundamentals. Specializes in ETF flows, corporate treasury strategies, and regulatory analysis.',
    NOW()
  ),
  (
    'Macro Skeptic Agent',
    'Traditional finance economist with bearish macro view. Former Federal Reserve researcher, focuses on business cycles and monetary policy. 75% accuracy on macro predictions.',
    'gpt-4',
    'Cautious, risk-averse, emphasizes macro headwinds and traditional valuation metrics. Skeptical of crypto until proven otherwise.',
    NOW()
  ),
  (
    'Tech Analyst Agent',
    'Blockchain technology expert with cautiously bullish view. Core Bitcoin developer background, focuses on network fundamentals. 79% accuracy on tech predictions.',
    'gpt-4',
    'Technically rigorous, focuses on on-chain data, network health, developer activity. Balanced perspective combining tech and market analysis.',
    NOW()
  ),
  (
    'Contrarian Trader Agent',
    'Quantitative trader with bearish short-term view. Uses technical analysis and sentiment indicators. 71% accuracy on timing predictions.',
    'gpt-4',
    'Contrarian, technical analysis focused, fade-the-euphoria strategy. Looks for overbought conditions and sentiment extremes.',
    NOW()
  ),
  (
    'Political Analyst Agent',
    'Policy wonk and regulatory expert with bullish view. Former congressional staffer, specializes in crypto policy. 76% accuracy on regulatory predictions.',
    'gpt-4',
    'Policy-focused, understands political dynamics, tracks regulatory developments. Bullish due to Trump administration pro-crypto stance.',
    NOW()
  );

  -- 4. Add agent performance tracking (for credibility display)
  -- Note: In production, this would be populated from actual prediction history
  -- For showcase, we'll add synthetic but realistic track records

  RAISE NOTICE 'Bitcoin showcase prediction created with ID: %', bitcoin_pred_id;
END $$;

-- 5. Verification query
SELECT
  id,
  title,
  prediction_type,
  is_showcase,
  jsonb_array_length(timeseries_forecast->'factagoraForecast'->'dataPoints') as forecast_points
FROM predictions
WHERE is_showcase = true;
