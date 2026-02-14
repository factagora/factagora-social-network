"use client"

import { useEffect, useState } from "react"

interface SummaryCardProps {
  predictionId: string
}

interface InvestmentRecommendation {
  action: string
  allocation: string
  timing: string
  exitStrategy: string
}

interface SummaryData {
  verdict: string
  confidenceLevel: string
  riskLevel: string
  tldr: string
  recommendations?: {
    conservative?: InvestmentRecommendation
    moderate?: InvestmentRecommendation
    aggressive?: InvestmentRecommendation
  }
  keyIndicators?: Array<{
    indicator: string
    bullishThreshold: string
    bearishThreshold: string
    current: string
  }>
}

export function SummaryCard({ predictionId }: SummaryCardProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSummary()
  }, [predictionId])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/predictions/${predictionId}/forecast`)

      if (!res.ok) {
        throw new Error("Failed to fetch summary")
      }

      const result = await res.json()

      if (result.investmentSummary) {
        setSummary(result.investmentSummary)
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching summary:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  // Verdict styling
  const getVerdictStyle = (verdict: string) => {
    const v = verdict.toUpperCase()
    if (v.includes("BULLISH") || v.includes("POSITIVE")) {
      return {
        bg: "bg-green-500/10",
        border: "border-green-500/30",
        text: "text-green-400",
        icon: "📈",
      }
    } else if (v.includes("BEARISH") || v.includes("NEGATIVE")) {
      return {
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-400",
        icon: "📉",
      }
    } else {
      return {
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-400",
        icon: "📊",
      }
    }
  }

  // Risk level styling
  const getRiskStyle = (risk: string) => {
    const r = risk.toUpperCase()
    if (r === "HIGH") {
      return { bg: "bg-red-500/10", text: "text-red-400", icon: "⚠️" }
    } else if (r === "MEDIUM") {
      return { bg: "bg-yellow-500/10", text: "text-yellow-400", icon: "⚡" }
    } else {
      return { bg: "bg-green-500/10", text: "text-green-400", icon: "✅" }
    }
  }

  // Confidence level styling
  const getConfidenceStyle = (confidence: string) => {
    const c = confidence.toUpperCase()
    if (c === "HIGH") {
      return { text: "text-green-400", icon: "💪" }
    } else if (c === "MEDIUM") {
      return { text: "text-yellow-400", icon: "👍" }
    } else {
      return { text: "text-orange-400", icon: "🤔" }
    }
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

  if (error || !summary) {
    return null // Silently hide if no summary available
  }

  const verdictStyle = getVerdictStyle(summary.verdict)
  const riskStyle = getRiskStyle(summary.riskLevel)
  const confidenceStyle = getConfidenceStyle(summary.confidenceLevel)

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-blue-500/30 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-blue-500/30 px-6 py-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>💡</span>
          <span>Executive Summary</span>
        </h2>
        <p className="text-sm text-slate-300 mt-1">
          Actionable insights synthesized from {" "}
          <span className="font-semibold text-blue-400">5 expert AI agents</span>
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* TLDR */}
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">
            TL;DR
          </h3>
          <p className="text-slate-200 leading-relaxed">{summary.tldr}</p>
        </div>

        {/* Verdict, Risk, Confidence */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Verdict */}
          <div
            className={`${verdictStyle.bg} border ${verdictStyle.border} rounded-lg p-4`}
          >
            <div className="text-sm text-slate-400 mb-1">Verdict</div>
            <div className={`text-lg font-bold ${verdictStyle.text} flex items-center gap-2`}>
              <span>{verdictStyle.icon}</span>
              <span>{summary.verdict.replace(/_/g, " ")}</span>
            </div>
          </div>

          {/* Risk Level */}
          <div className={`${riskStyle.bg} border border-slate-600 rounded-lg p-4`}>
            <div className="text-sm text-slate-400 mb-1">Risk Level</div>
            <div className={`text-lg font-bold ${riskStyle.text} flex items-center gap-2`}>
              <span>{riskStyle.icon}</span>
              <span>{summary.riskLevel}</span>
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Confidence</div>
            <div
              className={`text-lg font-bold ${confidenceStyle.text} flex items-center gap-2`}
            >
              <span>{confidenceStyle.icon}</span>
              <span>{summary.confidenceLevel}</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {summary.recommendations && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>🎯</span>
              <span>Investment Strategies</span>
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Conservative */}
              {summary.recommendations.conservative && (
                <div className="bg-slate-700/40 border border-slate-600 rounded-lg p-4 hover:border-blue-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-200">
                      🛡️ Conservative
                    </h4>
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                      {summary.recommendations.conservative.allocation}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-400">Action: </span>
                      <span className="text-slate-200">
                        {summary.recommendations.conservative.action}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Timing: </span>
                      <span className="text-slate-200">
                        {summary.recommendations.conservative.timing}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Exit: </span>
                      <span className="text-slate-200">
                        {summary.recommendations.conservative.exitStrategy}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Moderate */}
              {summary.recommendations.moderate && (
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/50 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white flex items-center gap-1">
                      ⚖️ Moderate
                      <span className="text-xs text-blue-400">(Recommended)</span>
                    </h4>
                    <span className="text-xs px-2 py-1 bg-blue-500/30 text-blue-200 rounded font-semibold">
                      {summary.recommendations.moderate.allocation}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-400">Action: </span>
                      <span className="text-white font-medium">
                        {summary.recommendations.moderate.action}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Timing: </span>
                      <span className="text-white">
                        {summary.recommendations.moderate.timing}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Exit: </span>
                      <span className="text-white">
                        {summary.recommendations.moderate.exitStrategy}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Aggressive */}
              {summary.recommendations.aggressive && (
                <div className="bg-slate-700/40 border border-slate-600 rounded-lg p-4 hover:border-orange-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-200">
                      🚀 Aggressive
                    </h4>
                    <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded">
                      {summary.recommendations.aggressive.allocation}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-400">Action: </span>
                      <span className="text-slate-200">
                        {summary.recommendations.aggressive.action}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Timing: </span>
                      <span className="text-slate-200">
                        {summary.recommendations.aggressive.timing}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Exit: </span>
                      <span className="text-slate-200">
                        {summary.recommendations.aggressive.exitStrategy}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Key Indicators */}
        {summary.keyIndicators && summary.keyIndicators.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>📊</span>
              <span>Key Indicators to Watch</span>
            </h3>
            <div className="space-y-3">
              {summary.keyIndicators.map((indicator, idx) => (
                <div
                  key={idx}
                  className="bg-slate-700/30 border border-slate-600 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-200">
                      {indicator.indicator}
                    </h4>
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                      Current: {indicator.current}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-green-400">✅ Bullish: </span>
                      <span className="text-slate-300">
                        {indicator.bullishThreshold}
                      </span>
                    </div>
                    <div>
                      <span className="text-red-400">❌ Bearish: </span>
                      <span className="text-slate-300">
                        {indicator.bearishThreshold}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-xs text-yellow-200/80">
            ⚠️ <strong>Disclaimer:</strong> This is AI-generated analysis for
            informational purposes only. Not financial advice. Always do your own
            research and consult with a qualified financial advisor before making
            investment decisions.
          </p>
        </div>
      </div>
    </div>
  )
}
