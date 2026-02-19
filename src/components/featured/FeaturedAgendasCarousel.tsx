'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ComposedChart, Area, Line, ResponsiveContainer, Tooltip } from 'recharts'

interface FeaturedAgenda {
  id: string
  type: 'prediction' | 'claim'
  predictionType?: string
  title: string
  description?: string
  category: string | null
  imageUrl?: string
  stats: {
    consensus: number
    trend24h: number
    agentCount: number
    avgConfidence: number
    argumentCount: number
    totalVotes: number
  }
}

interface ChartDataPoint {
  date: string
  timestamp: string
  actualPrice?: number
  forecast?: number
  confidenceLower?: number
  confidenceUpper?: number
  yesPercentage?: number
  type: 'historical' | 'forecast' | 'binary'
}

interface FeaturedAgendasCarouselProps {
  agendas: FeaturedAgenda[]
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; cardBg: string; chartColor: string }> = {
  technology: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', cardBg: 'from-blue-600/20 to-blue-900/20', chartColor: '#3b82f6' },
  politics: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50', cardBg: 'from-purple-600/20 to-purple-900/20', chartColor: '#a855f7' },
  business: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50', cardBg: 'from-orange-600/20 to-orange-900/20', chartColor: '#f97316' },
  sports: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50', cardBg: 'from-green-600/20 to-green-900/20', chartColor: '#22c55e' },
  health: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50', cardBg: 'from-cyan-600/20 to-cyan-900/20', chartColor: '#06b6d4' },
  climate: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/50', cardBg: 'from-teal-600/20 to-teal-900/20', chartColor: '#14b8a6' },
  tech: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', cardBg: 'from-blue-600/20 to-blue-900/20', chartColor: '#3b82f6' },
  science: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50', cardBg: 'from-cyan-600/20 to-cyan-900/20', chartColor: '#06b6d4' },
  economics: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50', cardBg: 'from-yellow-600/20 to-yellow-900/20', chartColor: '#eab308' },
  entertainment: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/50', cardBg: 'from-pink-600/20 to-pink-900/20', chartColor: '#ec4899' },
}

const DEFAULT_COLOR = { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/50', cardBg: 'from-slate-600/20 to-slate-900/20', chartColor: '#64748b' }

export function FeaturedAgendasCarousel({ agendas }: FeaturedAgendasCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [chartLoading, setChartLoading] = useState(false)
  const [chartLabel, setChartLabel] = useState<string>('YES probability over time')
  const [chartType, setChartType] = useState<'binary' | 'timeseries'>('binary')
  const router = useRouter()

  const currentAgenda = agendas?.[currentIndex]

  useEffect(() => {
    if (!currentAgenda || currentAgenda.type !== 'prediction') {
      setChartData([])
      return
    }
    if (currentAgenda.predictionType === 'TIMESERIES') {
      fetchTimeseriesAsset(currentAgenda.id)
    } else {
      fetchBinaryTimeseries(currentAgenda.id)
    }
  }, [currentIndex])

  if (!agendas || agendas.length === 0) return null

  const categoryColor = CATEGORY_COLORS[currentAgenda.category?.toLowerCase() || ''] || DEFAULT_COLOR

  async function fetchBinaryTimeseries(id: string) {
    setChartLoading(true)
    try {
      const res = await fetch(`/api/predictions/${id}/timeseries`)
      if (res.ok) {
        const result = await res.json()
        const points: ChartDataPoint[] = (result.data || []).map((p: any) => ({
          date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          timestamp: p.date,
          yesPercentage: p.yesPercentage,
          type: 'binary' as const,
        }))
        setChartData(points)
        setChartLabel('YES probability over time')
        setChartType('binary')
      } else {
        setChartData([])
      }
    } catch {
      setChartData([])
    } finally {
      setChartLoading(false)
    }
  }

  async function fetchTimeseriesAsset(id: string) {
    setChartLoading(true)
    try {
      const forecastRes = await fetch(`/api/predictions/${id}/forecast`)
      if (!forecastRes.ok) { setChartData([]); return }

      const forecastResult = await forecastRes.json()
      const assetId = forecastResult.timeseriesAssetId
      if (!assetId) { setChartData([]); return }

      const toDate = new Date()
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - 30)

      const [histRes] = await Promise.all([
        fetch(`/api/timeseries/${assetId}/historical?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`),
      ])

      const historicalPoints: ChartDataPoint[] = []
      if (histRes.ok) {
        const histResult = await histRes.json()
        for (const p of histResult.dataPoints || []) {
          historicalPoints.push({
            date: new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            timestamp: p.timestamp,
            actualPrice: p.close,
            type: 'historical',
          })
        }
      }

      const forecastPoints: ChartDataPoint[] = (forecastResult.factagoraForecast?.dataPoints || []).map((p: any) => ({
        date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: p.date,
        forecast: p.forecast,
        confidenceLower: p.confidenceInterval?.lower,
        confidenceUpper: p.confidenceInterval?.upper,
        type: 'forecast' as const,
      }))

      const combined = [...historicalPoints, ...forecastPoints].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      setChartData(combined)
      setChartType('timeseries')
      const target = forecastResult.factagoraForecast?.target
      setChartLabel(target ? `${target.asset} ${target.metric} (${target.unit})` : 'Price over time')
    } catch {
      setChartData([])
    } finally {
      setChartLoading(false)
    }
  }

  const href = currentAgenda.type === 'prediction'
    ? `/predictions/${currentAgenda.id}`
    : `/claims/${currentAgenda.id}`

  const handleCardClick = () => router.push(href)

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? agendas.length - 1 : prev - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === agendas.length - 1 ? 0 : prev + 1))
  }

  const trendIcon = currentAgenda.stats.trend24h > 0 ? '↑' : currentAgenda.stats.trend24h < 0 ? '↓' : '→'
  const trendColor = currentAgenda.stats.trend24h > 0 ? 'text-green-400' : currentAgenda.stats.trend24h < 0 ? 'text-red-400' : 'text-slate-400'

  const showChart = currentAgenda.type === 'prediction' && chartData.length >= 2

  return (
    <div className="relative">
      {/* Clickable Card */}
      <div
        onClick={handleCardClick}
        className={`relative cursor-pointer bg-gradient-to-br ${categoryColor.cardBg} border ${categoryColor.border} rounded-3xl overflow-hidden shadow-2xl hover:brightness-110 transition-all duration-200 group`}
      >
        {/* Image */}
        {currentAgenda.imageUrl && (
          <div className="relative h-64 md:h-80">
            <img
              src={currentAgenda.imageUrl}
              alt={currentAgenda.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          </div>
        )}

        <div className="p-8 md:p-12">
          {/* Top Bar: Badges + Navigation */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              {currentAgenda.category && (
                <span className={`px-4 py-2 rounded-lg text-sm font-bold ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border} border`}>
                  {currentAgenda.category.charAt(0).toUpperCase() + currentAgenda.category.slice(1)}
                </span>
              )}
              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700">
                {currentAgenda.type === 'prediction' ? '🔮 Prediction' : '✅ Fact-Check'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Arrow hint */}
              <span className="text-slate-400 text-sm group-hover:text-white transition-colors hidden sm:block">
                View details →
              </span>

              {/* Navigation */}
              <div className="flex items-center gap-1 bg-slate-800/60 backdrop-blur-sm rounded-xl p-1.5 border border-slate-700/50 flex-shrink-0">
                <button
                  onClick={handlePrevious}
                  className="p-2 hover:bg-slate-700/80 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                  aria-label="Previous agenda"
                >
                  <svg className="w-4 h-4 text-slate-300 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="px-2 text-sm font-semibold text-slate-300">
                  {currentIndex + 1}/{agendas.length}
                </div>
                <button
                  onClick={handleNext}
                  className="p-2 hover:bg-slate-700/80 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                  aria-label="Next agenda"
                >
                  <svg className="w-4 h-4 text-slate-300 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {currentAgenda.title}
          </h2>

          {/* Description */}
          {currentAgenda.description && (
            <p className="text-lg text-slate-300 mb-6 leading-relaxed line-clamp-2">
              {currentAgenda.description}
            </p>
          )}

          {/* Mini Timeseries Chart */}
          {showChart && (
            <div className="mb-6 h-32 md:h-40 rounded-xl overflow-hidden bg-slate-900/40 border border-slate-700/30 px-2 pt-3 pb-1">
              <div className="text-xs text-slate-400 px-2 mb-1 font-medium">{chartLabel}</div>
              <ResponsiveContainer width="100%" height="85%">
                <ComposedChart data={chartData} margin={{ top: 2, right: 4, left: 4, bottom: 2 }}>
                  <defs>
                    <linearGradient id={`hist-grad-${currentAgenda.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id={`conf-grad-${currentAgenda.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>

                  {chartType === 'timeseries' ? (
                    <>
                      {/* Confidence band */}
                      <Area type="monotone" dataKey="confidenceUpper" stroke="none" fill={`url(#conf-grad-${currentAgenda.id})`} isAnimationActive={false} />
                      <Area type="monotone" dataKey="confidenceLower" stroke="none" fill="transparent" isAnimationActive={false} />
                      {/* Historical price */}
                      <Line type="monotone" dataKey="actualPrice" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls={false} />
                      {/* Forecast line */}
                      <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 2" dot={false} isAnimationActive={false} connectNulls={false} />
                    </>
                  ) : (
                    <>
                      <Area type="monotone" dataKey="yesPercentage" stroke={categoryColor.chartColor} strokeWidth={2} fill={`url(#hist-grad-${currentAgenda.id})`} dot={false} isAnimationActive={false} />
                    </>
                  )}

                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload as ChartDataPoint
                      return (
                        <div className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white space-y-0.5">
                          <div className="text-slate-400">{d.date}</div>
                          {d.actualPrice != null && <div>Price: <span className="font-bold text-green-400">${d.actualPrice.toLocaleString()}</span></div>}
                          {d.forecast != null && <div>Forecast: <span className="font-bold text-blue-400">${d.forecast.toLocaleString()}</span></div>}
                          {d.yesPercentage != null && <div>YES: <span className="font-bold">{d.yesPercentage.toFixed(1)}%</span></div>}
                        </div>
                      )
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Chart loading placeholder */}
          {currentAgenda.type === 'prediction' && chartLoading && (
            <div className="mb-6 h-28 md:h-36 rounded-xl bg-slate-900/40 border border-slate-700/30 flex items-center justify-center">
              <div className="animate-pulse text-slate-500 text-sm">Loading chart...</div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1 font-medium">Consensus</div>
              <div className="text-3xl font-bold text-white mb-1">
                {Math.round(currentAgenda.stats.consensus)}%
              </div>
              <div className={`text-xs font-semibold ${trendColor} flex items-center gap-0.5`}>
                <span>{trendIcon}</span>
                {Math.abs(currentAgenda.stats.trend24h)}% 24h
              </div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1 font-medium">AI Agents</div>
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {currentAgenda.stats.agentCount}
              </div>
              <div className="text-xs text-slate-400">
                {Math.round(currentAgenda.stats.avgConfidence)}% avg conf.
              </div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1 font-medium">Total Votes</div>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {currentAgenda.stats.totalVotes}
              </div>
              <div className="text-xs text-slate-400">Community</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1 font-medium">Arguments</div>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {currentAgenda.stats.argumentCount}
              </div>
              <div className="text-xs text-slate-400">Evidence</div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicator Dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {agendas.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700 hover:bg-slate-600'
            }`}
            aria-label={`Go to agenda ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
