"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface AgentStats {
  id: string
  name: string
  model: string
  trustScore: number
  totalPredictions: number
  accuracy: number
  avgConfidence: number
  isActive: boolean
}

export function AgentPerformance() {
  const [agentStats, setAgentStats] = useState<AgentStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAgentStats()
  }, [])

  async function fetchAgentStats() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/agents")
      if (!response.ok) throw new Error("Failed to fetch agents")

      const agents = await response.json()

      // Transform to stats format
      const stats: AgentStats[] = agents.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        model: agent.model || "claude-sonnet-4-5",
        trustScore: agent.trust_score || 1000,
        totalPredictions: 0, // TODO: Get from API
        accuracy: 0, // TODO: Calculate
        avgConfidence: 0, // TODO: Calculate
        isActive: agent.is_active,
      }))

      setAgentStats(stats)
    } catch (error) {
      console.error("Error fetching agent stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getModelBadge = (model: string) => {
    switch (model) {
      case "claude-sonnet-4-5":
        return { emoji: "⚡", label: "Sonnet 4.5", color: "bg-blue-500/20 text-blue-400" }
      case "claude-haiku-4-5":
        return { emoji: "🚀", label: "Haiku 4.5", color: "bg-green-500/20 text-green-400" }
      case "claude-opus-4-6":
        return { emoji: "🧠", label: "Opus 4.6", color: "bg-purple-500/20 text-purple-400" }
      default:
        return { emoji: "🤖", label: "Unknown", color: "bg-slate-500/20 text-slate-400" }
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 1200) return "text-green-400"
    if (score >= 1000) return "text-blue-400"
    if (score >= 800) return "text-yellow-400"
    return "text-red-400"
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Agent Performance</h3>
        <div className="animate-pulse">
          <div className="h-32 bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (agentStats.length === 0) {
    return null
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Agent Performance</h3>
        <Link
          href="/agent/register"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          + Add Agent
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-700">
              <th className="pb-3 font-medium">Agent</th>
              <th className="pb-3 font-medium">Model</th>
              <th className="pb-3 font-medium text-right">Trust Score</th>
              <th className="pb-3 font-medium text-right">Predictions</th>
              <th className="pb-3 font-medium text-right">Accuracy</th>
              <th className="pb-3 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {agentStats.map((agent, index) => {
              const modelBadge = getModelBadge(agent.model)
              return (
                <tr
                  key={agent.id}
                  className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${
                    index === agentStats.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-lg">
                        🤖
                      </div>
                      <div>
                        <div className="text-white font-medium">{agent.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`text-xs px-2 py-1 rounded ${modelBadge.color}`}>
                      {modelBadge.emoji} {modelBadge.label}
                    </span>
                  </td>
                  <td className={`py-4 text-right font-semibold ${getTrustScoreColor(agent.trustScore)}`}>
                    {agent.trustScore}
                  </td>
                  <td className="py-4 text-right text-slate-300">
                    {agent.totalPredictions}
                  </td>
                  <td className="py-4 text-right text-slate-300">
                    {agent.accuracy > 0 ? `${agent.accuracy.toFixed(1)}%` : "-"}
                  </td>
                  <td className="py-4 text-center">
                    {agent.isActive ? (
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-slate-700 text-slate-400 rounded">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {agentStats.map((agent) => {
          const modelBadge = getModelBadge(agent.model)
          return (
            <div
              key={agent.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xl">
                    🤖
                  </div>
                  <div>
                    <div className="text-white font-semibold">{agent.name}</div>
                    <span className={`text-xs px-2 py-0.5 rounded ${modelBadge.color}`}>
                      {modelBadge.emoji} {modelBadge.label}
                    </span>
                  </div>
                </div>
                {agent.isActive ? (
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                    Active
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 bg-slate-700 text-slate-400 rounded">
                    Inactive
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Trust Score</div>
                  <div className={`text-lg font-bold ${getTrustScoreColor(agent.trustScore)}`}>
                    {agent.trustScore}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Predictions</div>
                  <div className="text-lg font-bold text-white">{agent.totalPredictions}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Accuracy</div>
                  <div className="text-lg font-bold text-white">
                    {agent.accuracy > 0 ? `${agent.accuracy.toFixed(1)}%` : "-"}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
