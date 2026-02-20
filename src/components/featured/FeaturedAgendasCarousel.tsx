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
  verdict: {
    label: string
    pct: number | null
    isPositive: boolean
  }
  topArgument: {
    agentName: string
    position: string
    content: string
    confidence: number
  } | null
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

export function FeaturedAgendasCarousel({ agendas }: FeaturedAgendasCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [chartLoading, setChartLoading] = useState(false)
  const [chartLabel, setChartLabel] = useState<string>('YES probability over time')
  const [chartType, setChartType] = useState<'binary' | 'timeseries'>('binary')
  const [timeseriesVerdict, setTimeseriesVerdict] = useState<string | null>(null)
  const router = useRouter()

  const currentAgenda = agendas?.[currentIndex]

  useEffect(() => {
    if (!currentAgenda) {
      setChartData([])
      setTimeseriesVerdict(null)
      return
    }

    if (currentAgenda.type === 'claim') {
      fetchClaimTimeseries(currentAgenda.id)
      setTimeseriesVerdict(null)
      return
    }

    // prediction types
    if (currentAgenda.predictionType === 'TIMESERIES') {
      fetchTimeseriesAsset(currentAgenda.id)
    } else if (currentAgenda.predictionType === 'MULTIPLE_CHOICE') {
      fetchMultipleChoiceTimeseries(currentAgenda.id)
      setTimeseriesVerdict(null)
    } else {
      fetchBinaryTimeseries(currentAgenda.id)
      setTimeseriesVerdict(null)
    }
  }, [currentIndex])

  if (!agendas || agendas.length === 0) return null

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

      // Set timeseries verdict from forecast target
      const lastPoint = forecastResult.factagoraForecast?.dataPoints?.slice(-1)[0]
      if (lastPoint?.forecast) {
        setTimeseriesVerdict(`$${lastPoint.forecast.toLocaleString()}`)
      }

      const toDate = new Date()
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - 30)

      const histRes = await fetch(
        `/api/timeseries/${assetId}/historical?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`
      )

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

  async function fetchClaimTimeseries(id: string) {
    setChartLoading(true)
    try {
      const res = await fetch(`/api/claims/${id}/timeseries`)
      if (res.ok) {
        const result = await res.json()
        const points: ChartDataPoint[] = (result.data || []).map((p: any) => ({
          date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          timestamp: p.date,
          yesPercentage: p.yesPercentage,
          type: 'binary' as const,
        }))
        setChartData(points)
        setChartLabel('TRUE probability over time')
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

  async function fetchMultipleChoiceTimeseries(id: string) {
    setChartLoading(true)
    try {
      const res = await fetch(`/api/predictions/${id}/timeseries`)
      if (res.ok) {
        const result = await res.json()
        if (result.type === 'multiple' && result.data?.length > 0) {
          // Find option keys (exclude metadata fields)
          const firstPoint = result.data[0]
          const optionKeys = Object.keys(firstPoint).filter(
            k => !['date', 'dateFormatted', 'totalVotes'].includes(k)
          )

          // Find the leading option from the latest data point
          const lastPoint = result.data[result.data.length - 1]
          let leadingOption = optionKeys[0] || 'Option'
          let maxPct = 0
          for (const key of optionKeys) {
            if ((lastPoint[key] || 0) > maxPct) {
              maxPct = lastPoint[key]
              leadingOption = key
            }
          }

          // Track leading option's percentage over time
          const points: ChartDataPoint[] = result.data.map((p: any) => ({
            date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            timestamp: p.date,
            yesPercentage: p[leadingOption] || 0,
            type: 'binary' as const,
          }))

          setChartData(points)
          setChartLabel(`Leading: ${leadingOption}`)
          setChartType('binary')
        } else {
          setChartData([])
        }
      } else {
        setChartData([])
      }
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

  const verdict = currentAgenda.verdict
  const effectiveVerdict = currentAgenda.predictionType === 'TIMESERIES' && timeseriesVerdict
    ? { label: timeseriesVerdict, pct: null, isPositive: true }
    : verdict

  const trendPositive = currentAgenda.stats.trend24h > 0
  const trendIcon = trendPositive ? '↑' : currentAgenda.stats.trend24h < 0 ? '↓' : '—'
  const trendColor = trendPositive ? 'text-emerald-400' : currentAgenda.stats.trend24h < 0 ? 'text-red-400' : 'text-slate-400'

  const showChart = chartData.length >= 1

  // Truncate argument content
  const argContent = currentAgenda.topArgument?.content
  const truncatedArg = argContent && argContent.length > 120
    ? argContent.slice(0, 120).trim() + '...'
    : argContent

  return (
    <div className="relative">
      <div
        onClick={handleCardClick}
        className="relative cursor-pointer bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl hover:bg-slate-800/80 hover:border-slate-600 transition-all duration-200 group"
      >
        <div className="p-6 md:p-8">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {currentAgenda.category && (
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700/80 text-slate-300 border border-slate-600/50">
                  {currentAgenda.category.charAt(0).toUpperCase() + currentAgenda.category.slice(1)}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700/80 text-slate-400 border border-slate-600/50">
                {currentAgenda.type === 'prediction' ? '🔮 Prediction' : '✅ Fact-Check'}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-900/60 rounded-lg p-1 border border-slate-700/50 flex-shrink-0">
              <button onClick={handlePrevious} className="p-1.5 hover:bg-slate-700 rounded-md transition-colors" aria-label="Previous">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="px-2 text-xs font-medium text-slate-400">{currentIndex + 1}/{agendas.length}</span>
              <button onClick={handleNext} className="p-1.5 hover:bg-slate-700 rounded-md transition-colors" aria-label="Next">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-5 leading-snug line-clamp-2">
            {currentAgenda.title}
          </h2>

          {/* Main content: Verdict + Chart */}
          <div className="flex flex-col md:flex-row gap-4 mb-5">

            {/* Verdict panel */}
            <div className="md:w-48 flex-shrink-0 bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-center">
              <div className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wide">
                {currentAgenda.predictionType === 'TIMESERIES' ? 'Forecast Target'
                  : currentAgenda.type === 'claim' ? 'Verification'
                  : 'Current Verdict'}
              </div>

              <div className={`text-3xl font-extrabold mb-2 ${effectiveVerdict.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {effectiveVerdict.label}
              </div>

              {effectiveVerdict.pct !== null && (
                <>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${effectiveVerdict.isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${effectiveVerdict.pct}%` }}
                    />
                  </div>
                  <div className="text-sm text-slate-400">{effectiveVerdict.pct}% of votes</div>
                </>
              )}

              {effectiveVerdict.pct === null && currentAgenda.predictionType === 'TIMESERIES' && chartLoading && (
                <div className="text-xs text-slate-500 animate-pulse">Loading forecast...</div>
              )}
            </div>

            {/* Mini chart */}
            <div className="flex-1 min-h-[120px]">
              {showChart ? (
                <div className="h-32 md:h-full min-h-[120px] rounded-xl overflow-hidden bg-slate-900/40 border border-slate-700/30 px-2 pt-3 pb-1">
                  <div className="text-xs text-slate-500 px-1 mb-1">{chartLabel}</div>
                  <ResponsiveContainer width="100%" height="80%">
                    <ComposedChart data={chartData} margin={{ top: 2, right: 4, left: 4, bottom: 2 }}>
                      <defs>
                        <linearGradient id={`binary-grad-${currentAgenda.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id={`conf-grad-${currentAgenda.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      {chartType === 'timeseries' ? (
                        <>
                          <Area type="monotone" dataKey="confidenceUpper" stroke="none" fill={`url(#conf-grad-${currentAgenda.id})`} isAnimationActive={false} />
                          <Area type="monotone" dataKey="confidenceLower" stroke="none" fill="transparent" isAnimationActive={false} />
                          <Line type="monotone" dataKey="actualPrice" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls={false} />
                          <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 2" dot={false} isAnimationActive={false} connectNulls={false} />
                        </>
                      ) : (
                        <Area type="monotone" dataKey="yesPercentage" stroke="#3b82f6" strokeWidth={2} fill={`url(#binary-grad-${currentAgenda.id})`} dot={false} isAnimationActive={false} />
                      )}
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          const d = payload[0].payload as ChartDataPoint
                          return (
                            <div className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white space-y-0.5">
                              <div className="text-slate-400">{d.date}</div>
                              {d.actualPrice != null && <div>Price: <span className="font-bold text-emerald-400">${d.actualPrice.toLocaleString()}</span></div>}
                              {d.forecast != null && <div>Forecast: <span className="font-bold text-blue-400">${d.forecast.toLocaleString()}</span></div>}
                              {d.yesPercentage != null && <div>YES: <span className="font-bold">{d.yesPercentage.toFixed(1)}%</span></div>}
                            </div>
                          )
                        }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : chartLoading ? (
                <div className="h-32 rounded-xl bg-slate-900/40 border border-slate-700/30 flex items-center justify-center">
                  <div className="text-xs text-slate-500 animate-pulse">Loading chart...</div>
                </div>
              ) : (
                <div className="h-32 rounded-xl bg-slate-900/40 border border-slate-700/30 flex items-center justify-center p-4">
                  <div className="w-full">
                    <div className="text-xs text-slate-500 mb-2 text-center">Consensus</div>
                    <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          currentAgenda.stats.consensus >= 50 ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${currentAgenda.stats.consensus}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{currentAgenda.type === 'claim' ? 'FALSE' : 'NO'}</span>
                      <span className="text-slate-300 font-medium">{Math.round(currentAgenda.stats.consensus)}%</span>
                      <span>{currentAgenda.type === 'claim' ? 'TRUE' : 'YES'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Debate Preview */}
          {truncatedArg && (
            <div className="mb-5 bg-slate-900/50 border border-slate-700/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">🤖 AI Debate</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  currentAgenda.topArgument?.position === 'YES' || currentAgenda.topArgument?.position === 'TRUE' || currentAgenda.topArgument?.position === 'FOR'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-red-500/15 text-red-400'
                }`}>
                  {currentAgenda.topArgument?.position}
                </span>
                <span className="text-xs text-slate-500 ml-auto">
                  {Math.round((currentAgenda.topArgument?.confidence || 0) * 100)}% conf.
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "{truncatedArg}"
              </p>
              <div className="text-xs text-slate-500 mt-1.5">— {currentAgenda.topArgument?.agentName}</div>
            </div>
          )}

          {/* Stats strip */}
          <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-700/40 pt-4 flex-wrap">
            <span>🤖 <span className="text-slate-300 font-medium">{currentAgenda.stats.agentCount}</span> agents</span>
            <span>📊 <span className="text-slate-300 font-medium">{currentAgenda.stats.totalVotes}</span> votes</span>
            <span>💬 <span className="text-slate-300 font-medium">{currentAgenda.stats.argumentCount}</span> arguments</span>
            <span className={`ml-auto font-medium ${trendColor}`}>
              {trendIcon} {Math.abs(currentAgenda.stats.trend24h)}% 24h
            </span>
          </div>

        </div>
      </div>

      {/* Indicator Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {agendas.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-6 bg-slate-400' : 'w-1.5 bg-slate-600 hover:bg-slate-500'
            }`}
            aria-label={`Go to agenda ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
