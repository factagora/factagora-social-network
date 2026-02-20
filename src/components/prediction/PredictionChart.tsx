"use client"

import { useState, useEffect } from 'react'
import {
  LineChart, Line,
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

interface PredictionChartProps {
  predictionId: string
  type?: 'binary' | 'multiple'
  options?: string[]
  apiUrl?: string
  positiveLabel?: string
  negativeLabel?: string
  positiveColor?: string
  negativeColor?: string
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

type ViewMode = 'trends' | 'distribution'

// ── Colors ──────────────────────────────────────────────────────────────────
const BINARY_COLORS = { yes: '#3b82f6', no: '#ef4444' }
const MULTI_COLORS  = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f97316']

// ── Tooltip for line chart ───────────────────────────────────────────────────
const LineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-slate-300 text-sm font-medium mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-white font-semibold text-sm">
            {entry.name}: {(entry.value ?? 0).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Toggle button ─────────────────────────────────────────────────────────────
function ViewToggle({ view, onChange, trendsDisabled }: {
  view: ViewMode
  onChange: (v: ViewMode) => void
  trendsDisabled: boolean
}) {
  return (
    <div className="flex gap-1 bg-slate-700/60 rounded-lg p-1 shrink-0">
      <button
        onClick={() => onChange('trends')}
        disabled={trendsDisabled}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all
          ${view === 'trends'
            ? 'bg-blue-500 text-white shadow'
            : trendsDisabled
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-400 hover:text-white hover:bg-slate-600/50'}`}
      >
        <span>📈</span> Trends
      </button>
      <button
        onClick={() => onChange('distribution')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all
          ${view === 'distribution'
            ? 'bg-blue-500 text-white shadow'
            : 'text-slate-400 hover:text-white hover:bg-slate-600/50'}`}
      >
        <span>📊</span> Distribution
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function PredictionChart({
  predictionId,
  type = 'binary',
  options = [],
  apiUrl,
  positiveLabel = 'YES',
  negativeLabel = 'NO',
  positiveColor = '#3b82f6',
  negativeColor = '#ef4444',
}: PredictionChartProps) {
  const [data, setData] = useState<TimeseriesDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>('distribution')

  const isBinary = type === 'binary'

  useEffect(() => {
    fetchTimeseriesData()
  }, [predictionId])

  const fetchTimeseriesData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(apiUrl ?? `/api/predictions/${predictionId}/timeseries`)
      if (!res.ok) throw new Error(`Failed to fetch timeseries: ${res.status}`)
      const result = await res.json()
      const newData: TimeseriesDataPoint[] = result.data || []
      setData(newData)
      // Auto-select trends when there are enough snapshots
      if (newData.length > 1) setView('trends')
    } catch (err) {
      console.error('Error fetching timeseries:', err)
      setError(err instanceof Error ? err.message : 'Failed to load chart data')
    } finally {
      setLoading(false)
    }
  }

  // Build bar data from the latest snapshot
  const getBarData = () => {
    if (data.length === 0) return []
    const latest = data[data.length - 1]
    if (isBinary) {
      return [
        { name: positiveLabel, value: latest.yesPercentage ?? 0, color: positiveColor },
        { name: negativeLabel, value: latest.noPercentage  ?? 0, color: negativeColor },
      ]
    }
    return options.map((opt, i) => ({
      name: opt,
      value: latest[opt] ?? 0,
      color: MULTI_COLORS[i % MULTI_COLORS.length],
    }))
  }

  const trendsDisabled = false

  // ── Shared header ───────────────────────────────────────────────────────────
  const Header = ({ subtitle }: { subtitle: string }) => (
    <div className="flex items-start justify-between mb-5 gap-4">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">
          {view === 'trends'
            ? (isBinary ? 'Probability Over Time' : 'Options Probability Over Time')
            : 'Current Distribution'}
        </h3>
        <p className="text-slate-400 text-sm">{subtitle}</p>
      </div>
      <ViewToggle view={view} onChange={setView} trendsDisabled={trendsDisabled} />
    </div>
  )

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-start justify-between mb-5 gap-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              {isBinary ? 'Probability Over Time' : 'Options Probability Over Time'}
            </h3>
            <p className="text-slate-400 text-sm">Loading chart data...</p>
          </div>
          <div className="flex gap-1 bg-slate-700/60 rounded-lg p-1 opacity-50 pointer-events-none shrink-0">
            <div className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-400">📈 Trends</div>
            <div className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-400">📊 Distribution</div>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-2">
          {isBinary ? 'Probability Over Time' : 'Options Probability Over Time'}
        </h3>
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <div className="h-48 flex items-center justify-center">
          <p className="text-slate-400">Unable to load chart data</p>
        </div>
      </div>
    )
  }

  // ── Empty ───────────────────────────────────────────────────────────────────
  if (data.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-start justify-between mb-5 gap-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              {isBinary ? 'Probability Over Time' : 'Options Probability Over Time'}
            </h3>
            <p className="text-slate-400 text-sm">No votes recorded yet.</p>
          </div>
          <div className="flex gap-1 bg-slate-700/60 rounded-lg p-1 opacity-50 pointer-events-none shrink-0">
            <div className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-400">📈 Trends</div>
            <div className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-400">📊 Distribution</div>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center">
          <p className="text-slate-500">📊 Waiting for first votes...</p>
        </div>
      </div>
    )
  }

  const barData = getBarData()
  const latest = data[data.length - 1]
  const totalVotes = latest?.totalVotes ?? 0
  const barHeight = isBinary ? 180 : Math.max(200, barData.length * 56)

  // ── Distribution (bar chart) ────────────────────────────────────────────────
  const DistributionChart = () => (
    <>
      <p className="text-slate-500 text-xs mb-4">
        {totalVotes} vote{totalVotes !== 1 ? 's' : ''} •{' '}
        As of {new Date(latest.date).toLocaleString()}
      </p>
      <ResponsiveContainer width="100%" height={barHeight}>
        <BarChart
          data={barData}
          layout="vertical"
          margin={{ top: 0, right: 48, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#94a3b8"
            tick={{ fill: '#e2e8f0', fontSize: 13 }}
            width={isBinary ? 48 : 130}
          />
          <Tooltip
            formatter={(value: any) => [`${(value as number).toFixed(1)}%`, 'Share']}
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
            labelStyle={{ color: '#e2e8f0' }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#94a3b8', fontSize: 12, formatter: (v: any) => `${v}%` }}>
            {barData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  )

  // ── Trends (line chart) ─────────────────────────────────────────────────────
  const TrendsChart = () => (
    <>
      <p className="text-slate-500 text-xs mb-4">
        {data.length} snapshot{data.length !== 1 ? 's' : ''} •{' '}
        Last updated {new Date(latest.date).toLocaleString()}
        {data.length === 1 && ' • Add more votes over time to see trends'}
      </p>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="dateFormatted"
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
          />
          <Tooltip content={<LineTooltip />} />

          {isBinary ? (
            <>
              <Line
                type="monotone"
                dataKey="yesPercentage"
                name={positiveLabel}
                stroke={positiveColor}
                strokeWidth={3}
                dot={data.length === 1 ? { r: 6, fill: positiveColor } : false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="noPercentage"
                name={negativeLabel}
                stroke={negativeColor}
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={data.length === 1 ? { r: 5, fill: negativeColor } : false}
                activeDot={{ r: 5 }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '16px' }}
                iconType="line"
                formatter={(value) => <span style={{ color: '#e2e8f0', fontSize: '13px' }}>{value}</span>}
              />
            </>
          ) : (
            <>
              <Legend
                wrapperStyle={{ paddingTop: '16px' }}
                iconType="line"
                formatter={(value) => <span style={{ color: '#e2e8f0', fontSize: '13px' }}>{value}</span>}
              />
              {options.map((opt, i) => (
                <Line
                  key={opt}
                  type="monotone"
                  dataKey={opt}
                  name={opt}
                  stroke={MULTI_COLORS[i % MULTI_COLORS.length]}
                  strokeWidth={2}
                  dot={data.length === 1 ? { r: 5, fill: MULTI_COLORS[i % MULTI_COLORS.length] } : { r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </>
  )

  // ── Subtitle by view ────────────────────────────────────────────────────────
  const subtitle = view === 'trends'
    ? (isBinary
        ? `How ${positiveLabel}/${negativeLabel} probability changed over time`
        : 'How each option\'s probability changed over time')
    : (isBinary
        ? `Current ${positiveLabel} vs ${negativeLabel} vote share`
        : 'Current vote share across all options')

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <Header subtitle={subtitle} />
      {view === 'distribution' ? <DistributionChart /> : <TrendsChart />}
      <div className="mt-5 pt-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs">
          * Snapshots are taken hourly. Distribution shows the most recent snapshot.
        </p>
      </div>
    </div>
  )
}
