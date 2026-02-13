'use client'

import { useEffect, useState } from 'react'
import { UserStats, getAccuracyColor, getTrustScoreColor, getTrustScoreLabel } from '@/types/user-stats'

export default function UserStatsCard() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/user/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <p className="text-slate-400">Loading stats...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <p className="text-slate-400">No stats available</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-xl font-bold text-slate-100 mb-6">Your Statistics</h3>

      {/* Points & Level */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4">
          <div className="text-sm text-blue-400 mb-1">Points</div>
          <div className="text-3xl font-bold text-blue-400">{stats.points}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
          <div className="text-sm text-purple-400 mb-1">Level</div>
          <div className="text-3xl font-bold text-purple-400">{stats.level}</div>
        </div>
      </div>

      {/* Accuracy Stats */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-400 mb-3">Accuracy</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500 mb-1">Overall</div>
            <div className={`text-xl font-bold ${getAccuracyColor(stats.overallAccuracy)}`}>
              {Math.round(stats.overallAccuracy)}%
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500 mb-1">Claims</div>
            <div className={`text-xl font-bold ${getAccuracyColor(stats.claimAccuracy)}`}>
              {Math.round(stats.claimAccuracy)}%
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500 mb-1">Predictions</div>
            <div className={`text-xl font-bold ${getAccuracyColor(stats.predictionAccuracy)}`}>
              {Math.round(stats.predictionAccuracy)}%
            </div>
          </div>
        </div>
      </div>

      {/* Trust Score */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-400 mb-2">Trust Score</h4>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full ${getTrustScoreColor(stats.trustScore)}`}
              style={{ width: `${stats.trustScore}%` }}
            />
          </div>
          <div className="w-24 text-right">
            <span className={`text-sm font-bold ${getTrustScoreColor(stats.trustScore).split(' ')[0]}`}>
              {Math.round(stats.trustScore)}/100
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {getTrustScoreLabel(stats.trustScore)}
        </p>
      </div>

      {/* Voting Record */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-400 mb-3">Voting Record</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-xs text-slate-500 mb-1">Total Votes</div>
            <div className="text-lg font-bold text-slate-200">{stats.totalVotes}</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-xs text-slate-500 mb-1">Correct Votes</div>
            <div className="text-lg font-bold text-green-400">{stats.correctVotes}</div>
          </div>
        </div>
      </div>

      {/* Activity */}
      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-3">Activity</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-900/50 rounded p-2 text-center">
            <div className="text-sm font-bold text-slate-200">{stats.claimsCreated}</div>
            <div className="text-xs text-slate-500">Claims</div>
          </div>
          <div className="bg-slate-900/50 rounded p-2 text-center">
            <div className="text-sm font-bold text-slate-200">{stats.evidenceSubmitted}</div>
            <div className="text-xs text-slate-500">Evidence</div>
          </div>
          <div className="bg-slate-900/50 rounded p-2 text-center">
            <div className="text-sm font-bold text-slate-200">{stats.argumentsWritten}</div>
            <div className="text-xs text-slate-500">Arguments</div>
          </div>
        </div>
      </div>

      {/* Reputation Score */}
      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Reputation Score</span>
          <span className="text-xl font-bold text-yellow-400">
            {stats.reputationScore}
          </span>
        </div>
      </div>
    </div>
  )
}
