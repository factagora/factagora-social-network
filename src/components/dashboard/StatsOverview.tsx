"use client"

import { useEffect, useState } from "react"
import { UserStats, getTrustScoreColor, getTrustScoreLabel, getAccuracyColor } from "@/types/user-stats"

export function StatsOverview() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    fetchStats()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  async function fetchStats() {
    // Don't show loading indicator for background refreshes
    const isInitialLoad = stats === null
    if (isInitialLoad) {
      setIsLoading(true)
    }

    try {
      const response = await fetch("/api/user/stats")
      if (!response.ok) throw new Error("Failed to fetch stats")

      const data = await response.json()
      setStats(data.stats)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      if (isInitialLoad) {
        setIsLoading(false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-slate-800 rounded-xl h-32"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const trustScoreColor = getTrustScoreColor(stats.trustScore)
  const trustScoreLabel = getTrustScoreLabel(stats.trustScore)
  const accuracyColor = getAccuracyColor(stats.overallAccuracy)

  const formatLastUpdate = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000)
    if (seconds < 10) return "Just now"
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
  }

  return (
    <div className="space-y-2 mb-8">
      {/* Last Update Indicator */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Your Stats</h2>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
          <span>Updated {formatLastUpdate()}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
      {/* Trust Score */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🏆</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded ${trustScoreColor}`}>
            {trustScoreLabel}
          </span>
        </div>
        <div className="text-3xl font-bold text-white mb-1">
          {stats.trustScore.toFixed(0)}
        </div>
        <div className="text-sm text-slate-400">Trust Score</div>
      </div>

      {/* Accuracy */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:border-green-500/50 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded bg-slate-700/50 ${accuracyColor}`}>
            {stats.correctVotes}/{stats.totalVotes}
          </span>
        </div>
        <div className="text-3xl font-bold text-white mb-1">
          {stats.overallAccuracy.toFixed(1)}%
        </div>
        <div className="text-sm text-slate-400">Overall Accuracy</div>
      </div>

      {/* Total Activity */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
        </div>
        <div className="text-3xl font-bold text-white mb-1">
          {stats.totalVotes + stats.claimsCreated + stats.argumentsWritten}
        </div>
        <div className="text-sm text-slate-400">Total Activity</div>
        <div className="mt-2 flex gap-2 text-xs text-slate-500">
          <span>{stats.totalVotes} votes</span>
          <span>•</span>
          <span>{stats.claimsCreated} claims</span>
        </div>
      </div>

      {/* Level & Points */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:border-yellow-500/50 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <span className="text-2xl">⭐</span>
          </div>
          <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
            LVL {stats.level}
          </span>
        </div>
        <div className="text-3xl font-bold text-white mb-1">
          {stats.points.toLocaleString()}
        </div>
        <div className="text-sm text-slate-400">Points</div>
        <div className="mt-2">
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1.5 rounded-full transition-all"
              style={{ width: `${(stats.experience % 1000) / 10}%` }}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
