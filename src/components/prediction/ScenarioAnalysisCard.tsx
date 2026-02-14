"use client"

import { useEffect, useState } from "react"

interface ScenarioAnalysisCardProps {
  predictionId: string
}

interface Scenario {
  priceTarget: string
  probability: number
  trigger: string
  timeline: string
  keyEvents: string[]
}

interface ScenarioData {
  bull: Scenario
  base: Scenario
  bear: Scenario
}

export function ScenarioAnalysisCard({ predictionId }: ScenarioAnalysisCardProps) {
  const [scenarios, setScenarios] = useState<ScenarioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchScenarios()
  }, [predictionId])

  const fetchScenarios = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/predictions/${predictionId}/forecast`)

      if (!res.ok) {
        throw new Error("Failed to fetch scenarios")
      }

      const result = await res.json()

      if (result.investmentSummary?.scenarios) {
        setScenarios(result.investmentSummary.scenarios)
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching scenarios:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  // Format price target for display
  const formatPriceTarget = (priceTarget: string) => {
    const [lower, upper] = priceTarget.split("-").map((p) => parseInt(p))
    if (upper) {
      return `$${(lower / 1000).toFixed(0)}K - $${(upper / 1000).toFixed(0)}K`
    }
    return `$${(lower / 1000).toFixed(0)}K`
  }

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="h-4 bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (error || !scenarios) {
    return null // Silently hide if no scenarios available
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500/30 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/30 px-6 py-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🎲</span>
          <span>Scenario Analysis</span>
        </h2>
        <p className="text-sm text-slate-300 mt-1">
          Three potential outcomes with probabilities and triggers
        </p>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Bull Scenario */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/40 rounded-lg p-5 hover:border-green-400 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🚀</span>
                <h3 className="text-xl font-bold text-white">Bull Case</h3>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-400">
                  {scenarios.bull.probability}%
                </div>
                <div className="text-xs text-slate-400">Probability</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-2xl font-bold text-green-300 mb-2">
                {formatPriceTarget(scenarios.bull.priceTarget)}
              </div>
              <div className="text-xs text-slate-400 mb-3">{scenarios.bull.timeline}</div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-semibold text-slate-300 mb-2">Trigger:</div>
              <p className="text-sm text-slate-300">{scenarios.bull.trigger}</p>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-300 mb-2">Key Events:</div>
              <ul className="space-y-1">
                {scenarios.bull.keyEvents.map((event, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>{event}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Base Scenario */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/50 rounded-lg p-5 hover:border-blue-400 transition-colors ring-2 ring-blue-400/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">📊</span>
                <div>
                  <h3 className="text-xl font-bold text-white">Base Case</h3>
                  <span className="text-xs text-blue-400">(Most Likely)</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-400">
                  {scenarios.base.probability}%
                </div>
                <div className="text-xs text-slate-400">Probability</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-2xl font-bold text-blue-300 mb-2">
                {formatPriceTarget(scenarios.base.priceTarget)}
              </div>
              <div className="text-xs text-slate-400 mb-3">{scenarios.base.timeline}</div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-semibold text-slate-300 mb-2">Trigger:</div>
              <p className="text-sm text-slate-300">{scenarios.base.trigger}</p>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-300 mb-2">Key Events:</div>
              <ul className="space-y-1">
                {scenarios.base.keyEvents.map((event, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{event}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bear Scenario */}
          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-2 border-red-500/40 rounded-lg p-5 hover:border-red-400 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">📉</span>
                <h3 className="text-xl font-bold text-white">Bear Case</h3>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-red-400">
                  {scenarios.bear.probability}%
                </div>
                <div className="text-xs text-slate-400">Probability</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-2xl font-bold text-red-300 mb-2">
                {formatPriceTarget(scenarios.bear.priceTarget)}
              </div>
              <div className="text-xs text-slate-400 mb-3">{scenarios.bear.timeline}</div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-semibold text-slate-300 mb-2">Trigger:</div>
              <p className="text-sm text-slate-300">{scenarios.bear.trigger}</p>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-300 mb-2">Key Events:</div>
              <ul className="space-y-1">
                {scenarios.bear.keyEvents.map((event, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>{event}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Probability Visualization */}
        <div className="mt-6">
          <div className="text-sm font-semibold text-slate-400 mb-2">Probability Distribution</div>
          <div className="flex h-8 rounded-lg overflow-hidden">
            <div
              className="bg-green-500 flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${scenarios.bull.probability}%` }}
            >
              {scenarios.bull.probability}%
            </div>
            <div
              className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${scenarios.base.probability}%` }}
            >
              {scenarios.base.probability}%
            </div>
            <div
              className="bg-red-500 flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${scenarios.bear.probability}%` }}
            >
              {scenarios.bear.probability}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
