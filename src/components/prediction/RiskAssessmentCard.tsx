"use client"

import { useEffect, useState } from "react"

interface RiskAssessmentCardProps {
  predictionId: string
}

interface Risk {
  risk: string
  impact: "HIGH" | "MEDIUM" | "LOW"
  probability: "HIGH" | "MEDIUM" | "LOW"
  description: string
  mitigation: string
}

export function RiskAssessmentCard({ predictionId }: RiskAssessmentCardProps) {
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRisks()
  }, [predictionId])

  const fetchRisks = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/predictions/${predictionId}/forecast`)

      if (!res.ok) {
        throw new Error("Failed to fetch risks")
      }

      const result = await res.json()

      if (result.investmentSummary?.criticalRisks) {
        setRisks(result.investmentSummary.criticalRisks)
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching risks:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  // Get styling based on impact level
  const getImpactStyle = (impact: string) => {
    switch (impact) {
      case "HIGH":
        return {
          bg: "bg-red-500/20",
          border: "border-red-500/50",
          text: "text-red-400",
          icon: "🚨",
        }
      case "MEDIUM":
        return {
          bg: "bg-orange-500/20",
          border: "border-orange-500/50",
          text: "text-orange-400",
          icon: "⚠️",
        }
      case "LOW":
        return {
          bg: "bg-yellow-500/20",
          border: "border-yellow-500/50",
          text: "text-yellow-400",
          icon: "⚡",
        }
      default:
        return {
          bg: "bg-slate-500/20",
          border: "border-slate-500/50",
          text: "text-slate-400",
          icon: "ℹ️",
        }
    }
  }

  // Get styling based on probability
  const getProbabilityStyle = (probability: string) => {
    switch (probability) {
      case "HIGH":
        return { text: "text-red-400", label: "High Probability" }
      case "MEDIUM":
        return { text: "text-orange-400", label: "Medium Probability" }
      case "LOW":
        return { text: "text-green-400", label: "Low Probability" }
      default:
        return { text: "text-slate-400", label: "Unknown" }
    }
  }

  // Calculate overall risk score
  const calculateRiskScore = () => {
    const weights = { HIGH: 3, MEDIUM: 2, LOW: 1 }
    const totalScore = risks.reduce((sum, risk) => {
      const impactWeight = weights[risk.impact] || 1
      const probWeight = weights[risk.probability] || 1
      return sum + impactWeight * probWeight
    }, 0)
    const maxScore = risks.length * 9 // MAX: HIGH impact (3) * HIGH prob (3)
    return Math.round((totalScore / maxScore) * 100)
  }

  const getRiskLevelLabel = (score: number) => {
    if (score >= 70) return { label: "High Risk", color: "text-red-400" }
    if (score >= 40) return { label: "Moderate Risk", color: "text-orange-400" }
    return { label: "Low Risk", color: "text-green-400" }
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

  if (error || !risks || risks.length === 0) {
    return null // Silently hide if no risks available
  }

  const riskScore = calculateRiskScore()
  const riskLevel = getRiskLevelLabel(riskScore)

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-red-500/30 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-red-500/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>⚠️</span>
              <span>Critical Risks</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Key risks to monitor and mitigation strategies
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${riskLevel.color}`}>
              {riskScore}%
            </div>
            <div className={`text-sm ${riskLevel.color}`}>
              {riskLevel.label}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {risks.map((risk, idx) => {
          const impactStyle = getImpactStyle(risk.impact)
          const probStyle = getProbabilityStyle(risk.probability)

          return (
            <div
              key={idx}
              className={`${impactStyle.bg} border-2 ${impactStyle.border} rounded-lg p-5 hover:border-opacity-70 transition-all`}
            >
              {/* Risk Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-3xl">{impactStyle.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{risk.risk}</h3>
                    <p className="text-sm text-slate-300">{risk.description}</p>
                  </div>
                </div>
              </div>

              {/* Risk Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className={`${impactStyle.bg} border ${impactStyle.border} rounded-lg p-3`}>
                  <div className="text-xs text-slate-400 mb-1">Impact</div>
                  <div className={`text-lg font-bold ${impactStyle.text}`}>
                    {risk.impact}
                  </div>
                </div>
                <div className="bg-slate-700/40 border border-slate-600 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">Probability</div>
                  <div className={`text-lg font-bold ${probStyle.text}`}>
                    {risk.probability}
                  </div>
                </div>
              </div>

              {/* Mitigation Strategy */}
              <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-green-400">✓</span>
                  <div className="text-sm font-semibold text-slate-300">
                    Mitigation Strategy
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed ml-6">
                  {risk.mitigation}
                </p>
              </div>
            </div>
          )
        })}

        {/* Risk Management Disclaimer */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mt-6">
          <p className="text-xs text-orange-200/80">
            <strong>Risk Management:</strong> These risks represent significant threats to
            the forecast. Always implement proper risk management including position sizing,
            stop-losses, and portfolio diversification. Past performance does not guarantee
            future results.
          </p>
        </div>
      </div>
    </div>
  )
}
