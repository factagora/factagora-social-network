"use client"

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface PredictionChartProps {
  predictionId: string
  type?: 'binary' | 'multiple'
}

interface TimeseriesDataPoint {
  date: string
  dateFormatted: string
  yesPercentage?: number
  noPercentage?: number
  yesCount?: number
  noCount?: number
  totalVotes?: number
  [key: string]: any
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-slate-300 text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white font-semibold text-sm">
              {entry.name}: {entry.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function PredictionChart({ predictionId, type = 'binary' }: PredictionChartProps) {
  const [data, setData] = useState<TimeseriesDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTimeseriesData()
  }, [predictionId])

  const fetchTimeseriesData = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/predictions/${predictionId}/timeseries`)

      if (!res.ok) {
        throw new Error(`Failed to fetch timeseries: ${res.status}`)
      }

      const result = await res.json()
      setData(result.data || [])
    } catch (err) {
      console.error('Error fetching timeseries:', err)
      setError(err instanceof Error ? err.message : 'Failed to load chart data')
    } finally {
      setLoading(false)
    }
  }

  const isBinary = type === 'binary'

  const binaryColors = {
    yes: '#3b82f6', // blue-500
    no: '#ef4444'   // red-500
  }

  const multipleColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']

  // Loading state
  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-1">
            {isBinary ? 'Probability Over Time' : 'Options Probability Over Time'}
          </h3>
          <p className="text-slate-400 text-sm">Loading chart data...</p>
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-1">
            {isBinary ? 'Probability Over Time' : 'Options Probability Over Time'}
          </h3>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-slate-400">Unable to load chart data</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-1">
            {isBinary ? 'Probability Over Time' : 'Options Probability Over Time'}
          </h3>
          <p className="text-slate-400 text-sm">
            No historical data yet. Chart will appear as predictions are made.
          </p>
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-slate-500">📊 Waiting for predictions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-1">
          {isBinary ? 'Probability Over Time' : 'Options Probability Over Time'}
        </h3>
        <p className="text-slate-400 text-sm">
          {isBinary
            ? 'Historical probability that the prediction will resolve as YES'
            : 'Historical probability for each option'
          }
        </p>
        <p className="text-slate-500 text-xs mt-1">
          {data.length} snapshot{data.length !== 1 ? 's' : ''} • Last updated: {new Date(data[data.length - 1]?.date).toLocaleString()}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="dateFormatted"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#94a3b8' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#94a3b8' }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
          />
          <Tooltip content={<CustomTooltip />} />

          {isBinary ? (
            <>
              <Line
                type="monotone"
                dataKey="yesPercentage"
                name="YES"
                stroke={binaryColors.yes}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </>
          ) : (
            <>
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
                formatter={(value) => <span className="text-white text-sm">{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="Option A"
                stroke={multipleColors[0]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Option B"
                stroke={multipleColors[1]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Option C"
                stroke={multipleColors[2]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Option D"
                stroke={multipleColors[3]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>

      {isBinary && (
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded-full" style={{ backgroundColor: binaryColors.yes }} />
            <span className="text-slate-300 text-sm font-medium">YES</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded-full" style={{ backgroundColor: binaryColors.no }} />
            <span className="text-slate-300 text-sm font-medium">NO</span>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs">
          * This chart shows real historical data aggregated from all predictions. Snapshots are taken hourly.
        </p>
      </div>
    </div>
  )
}
