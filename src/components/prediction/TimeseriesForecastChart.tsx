"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
  ComposedChart,
} from "recharts"

interface ForecastDataPoint {
  date: string
  forecast: number
  confidenceInterval: {
    lower: number
    upper: number
  }
  extremeInterval: {
    lower: number
    upper: number
  }
  confidence: "HIGH" | "MEDIUM" | "LOW"
  keyEvents: string[]
}

interface HistoricalDataPoint {
  timestamp: string
  close: number
}

interface TimeseriesForecastChartProps {
  predictionId: string
}

export function TimeseriesForecastChart({ predictionId }: TimeseriesForecastChartProps) {
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([])
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [targetInfo, setTargetInfo] = useState<{
    metric: string
    unit: string
    asset: string
  } | null>(null)
  const [assetId, setAssetId] = useState<string | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [predictionId])

  const fetchAllData = async () => {
    try {
      setLoading(true)

      // Fetch forecast data (includes asset ID and AI predictions)
      const forecastRes = await fetch(`/api/predictions/${predictionId}/forecast`)

      if (!forecastRes.ok) {
        throw new Error("Failed to fetch forecast data")
      }

      const forecastResult = await forecastRes.json()

      // Extract forecast data
      if (forecastResult.factagoraForecast) {
        setForecastData(forecastResult.factagoraForecast.dataPoints || [])
        setTargetInfo(forecastResult.factagoraForecast.target)
      }

      // Check if prediction has timeseries_asset_id (now included in forecast response)
      if (forecastResult.timeseriesAssetId) {
        setAssetId(forecastResult.timeseriesAssetId)

        // Calculate date range for last 30 days
        const toDate = new Date()
        const fromDate = new Date()
        fromDate.setDate(fromDate.getDate() - 30)

        // Fetch historical data for this asset
        const historicalRes = await fetch(
          `/api/timeseries/${forecastResult.timeseriesAssetId}/historical?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`
        )

        if (historicalRes.ok) {
          const historicalResult = await historicalRes.json()
          setHistoricalData(historicalResult.dataPoints || [])
        } else {
          console.warn("Failed to fetch historical data:", await historicalRes.text())
        }
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  // Format data for Recharts - combine historical and forecast
  const historicalChartData = historicalData.map((point) => ({
    date: new Date(point.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    timestamp: point.timestamp,
    actualPrice: point.close,
    type: "historical" as const,
  }))

  const forecastChartData = forecastData.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    timestamp: point.date,
    forecast: point.forecast,
    confidenceLower: point.confidenceInterval.lower,
    confidenceUpper: point.confidenceInterval.upper,
    extremeLower: point.extremeInterval.lower,
    extremeUpper: point.extremeInterval.upper,
    hasEvent: point.keyEvents.length > 0,
    eventLabel: point.keyEvents[0] || "",
    confidence: point.confidence,
    type: "forecast" as const,
  }))

  // Combine and sort by timestamp
  const chartData = [...historicalChartData, ...forecastChartData].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0].payload

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">
          {data.date}
        </p>
        <div className="space-y-1 text-sm">
          {data.type === "historical" ? (
            // Historical data tooltip
            <>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600 dark:text-gray-400">Price:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  ${data.actualPrice.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Historical data
                </p>
              </div>
            </>
          ) : (
            // Forecast data tooltip
            <>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600 dark:text-gray-400">Forecast:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  ${data.forecast.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                <span className={`font-medium ${
                  data.confidence === "HIGH" ? "text-green-600" :
                  data.confidence === "MEDIUM" ? "text-yellow-600" :
                  "text-orange-600"
                }`}>
                  {data.confidence}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  80% Confidence Range:
                </p>
                <div className="flex justify-between text-xs">
                  <span>${data.confidenceLower.toLocaleString()}</span>
                  <span>-</span>
                  <span>${data.confidenceUpper.toLocaleString()}</span>
                </div>
              </div>
              {data.hasEvent && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    📌 {data.eventLabel}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading forecast data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-[400px] bg-red-50 dark:bg-red-900/10 rounded-lg flex items-center justify-center">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="font-semibold mb-2">Error loading forecast</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (historicalData.length === 0 && forecastData.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">No data available</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {assetId ? "Loading historical data..." : "No asset selected"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {historicalData.length > 0 ? "Historical Data & Forecast" : "Factagora Consensus Forecast"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {historicalData.length > 0 && `${historicalData.length} days of historical data • `}
          {targetInfo && `${targetInfo.asset} ${targetInfo.metric} prediction with 80% confidence intervals`}
        </p>
      </div>

      {/* Chart */}
      <div className="w-full h-[500px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={80}
              stroke="#9CA3AF"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="#9CA3AF"
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="line"
            />

            {/* Extreme interval (light background) */}
            <Area
              type="monotone"
              dataKey="extremeUpper"
              stroke="none"
              fill="#DBEAFE"
              fillOpacity={0.2}
              name="Extreme Range"
            />
            <Area
              type="monotone"
              dataKey="extremeLower"
              stroke="none"
              fill="#DBEAFE"
              fillOpacity={0.2}
            />

            {/* Confidence interval (darker area) */}
            <Area
              type="monotone"
              dataKey="confidenceUpper"
              stroke="none"
              fill="#93C5FD"
              fillOpacity={0.4}
              name="80% Confidence"
            />
            <Area
              type="monotone"
              dataKey="confidenceLower"
              stroke="none"
              fill="#93C5FD"
              fillOpacity={0.4}
            />

            {/* Historical price line */}
            <Line
              type="monotone"
              dataKey="actualPrice"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              name="Historical Price"
              connectNulls={false}
            />

            {/* Main forecast line */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#2563EB"
              strokeWidth={3}
              dot={{ fill: "#2563EB", r: 4 }}
              activeDot={{ r: 6 }}
              name="Forecast"
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend explanation */}
      <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
        {historicalData.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Historical Price</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span>Consensus Forecast</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-300 rounded"></div>
          <span>80% Confidence Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 rounded"></div>
          <span>Extreme Scenario Range</span>
        </div>
      </div>
    </div>
  )
}
