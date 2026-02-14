"use client"

import { useEffect, useState } from "react"

interface UpcomingMilestonesTimelineProps {
  predictionId: string
}

interface Milestone {
  date: string
  event: string
  importance: "CRITICAL" | "HIGH" | "MEDIUM"
  bullishOutcome: string
  bearishOutcome: string
  expectedImpact: string
}

export function UpcomingMilestonesTimeline({ predictionId }: UpcomingMilestonesTimelineProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMilestones()
  }, [predictionId])

  const fetchMilestones = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/predictions/${predictionId}/forecast`)

      if (!res.ok) {
        throw new Error("Failed to fetch milestones")
      }

      const result = await res.json()

      if (result.investmentSummary?.upcomingMilestones) {
        setMilestones(result.investmentSummary.upcomingMilestones)
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching milestones:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Get days until milestone
  const getDaysUntil = (dateString: string) => {
    const now = new Date()
    const milestone = new Date(dateString)
    const diffTime = milestone.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Past"
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    return `${diffDays} days`
  }

  // Get styling based on importance
  const getImportanceStyle = (importance: string) => {
    switch (importance) {
      case "CRITICAL":
        return {
          bg: "bg-red-500/20",
          border: "border-red-500/50",
          text: "text-red-400",
          icon: "🔥",
          label: "Critical",
        }
      case "HIGH":
        return {
          bg: "bg-orange-500/20",
          border: "border-orange-500/50",
          text: "text-orange-400",
          icon: "⚡",
          label: "High",
        }
      case "MEDIUM":
        return {
          bg: "bg-blue-500/20",
          border: "border-blue-500/50",
          text: "text-blue-400",
          icon: "📌",
          label: "Medium",
        }
      default:
        return {
          bg: "bg-slate-500/20",
          border: "border-slate-500/50",
          text: "text-slate-400",
          icon: "ℹ️",
          label: "Info",
        }
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

  if (error || !milestones || milestones.length === 0) {
    return null // Silently hide if no milestones available
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-blue-500/30 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-blue-500/30 px-6 py-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📅</span>
          <span>Upcoming Milestones</span>
        </h2>
        <p className="text-sm text-slate-300 mt-1">
          Key dates and events that will impact the forecast
        </p>
      </div>

      <div className="p-6">
        {/* Timeline */}
        <div className="space-y-6">
          {milestones.map((milestone, idx) => {
            const style = getImportanceStyle(milestone.importance)
            const daysUntil = getDaysUntil(milestone.date)
            const isPast = daysUntil === "Past"

            return (
              <div key={idx} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className={`w-12 h-12 rounded-full ${style.bg} border-2 ${style.border} flex items-center justify-center text-2xl ${
                      isPast ? "opacity-50" : ""
                    }`}
                  >
                    {style.icon}
                  </div>
                  {/* Vertical Line */}
                  {idx < milestones.length - 1 && (
                    <div className={`w-0.5 h-full mt-2 ${isPast ? "bg-slate-700" : "bg-blue-500/30"}`}></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-xl font-bold ${isPast ? "text-slate-500" : "text-white"}`}>
                          {milestone.event}
                        </h3>
                        <span className={`px-2 py-1 ${style.bg} ${style.text} text-xs font-semibold rounded`}>
                          {style.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className={`font-semibold ${isPast ? "text-slate-500" : "text-slate-300"}`}>
                          📆 {formatDate(milestone.date)}
                        </span>
                        <span className={`${isPast ? "text-slate-600" : style.text} font-bold`}>
                          {daysUntil}
                        </span>
                      </div>
                    </div>
                    <div className={`text-right ${isPast ? "opacity-50" : ""}`}>
                      <div className="text-xs text-slate-400 mb-1">Expected Impact</div>
                      <div className={`text-lg font-bold ${style.text}`}>
                        {milestone.expectedImpact}
                      </div>
                    </div>
                  </div>

                  {/* Outcomes */}
                  <div className={`grid md:grid-cols-2 gap-3 ${isPast ? "opacity-50" : ""}`}>
                    {/* Bullish Outcome */}
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-400">📈</span>
                        <div className="text-sm font-semibold text-green-400">Bullish Case</div>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {milestone.bullishOutcome}
                      </p>
                    </div>

                    {/* Bearish Outcome */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-400">📉</span>
                        <div className="text-sm font-semibold text-red-400">Bearish Case</div>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {milestone.bearishOutcome}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Timeline Legend */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500"></div>
              <span className="text-slate-400">Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500/50 border border-orange-500"></div>
              <span className="text-slate-400">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500/50 border border-blue-500"></div>
              <span className="text-slate-400">Medium</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
