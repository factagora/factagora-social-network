'use client'

import { useEffect, useState } from 'react'
import { getAccuracyColor } from '@/types/user-stats'

interface LeaderboardEntry {
  rank: number
  user_id: string
  user: { email: string }
  points: number
  overall_accuracy: number
  total_votes: number
  level: number
  reputation_score: number
}

interface LeaderboardTableProps {
  sortBy?: 'points' | 'accuracy' | 'reputation'
}

export default function LeaderboardTable({ sortBy = 'points' }: LeaderboardTableProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSort, setCurrentSort] = useState(sortBy)

  useEffect(() => {
    fetchLeaderboard(currentSort)
  }, [currentSort])

  async function fetchLeaderboard(sort: string) {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?sortBy=${sort}&limit=50`)
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data.leaderboard || [])
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400 font-bold'
    if (rank === 2) return 'text-slate-300 font-bold'
    if (rank === 3) return 'text-orange-400 font-bold'
    return 'text-slate-400'
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
      {/* Sort Tabs */}
      <div className="flex gap-2 p-4 bg-slate-900/50 border-b border-slate-700/50">
        <button
          onClick={() => setCurrentSort('points')}
          className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
            currentSort === 'points'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          💎 Points
        </button>
        <button
          onClick={() => setCurrentSort('accuracy')}
          className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
            currentSort === 'accuracy'
              ? 'bg-green-600 text-white'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          🎯 Accuracy
        </button>
        <button
          onClick={() => setCurrentSort('reputation')}
          className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
            currentSort === 'reputation'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          ⭐ Reputation
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-8 text-center">
          <p className="text-slate-400">Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-slate-400">No data available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">
                  Points
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">
                  Accuracy
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">
                  Votes
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">
                  Level
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {leaderboard.map((entry) => (
                <tr
                  key={entry.user_id}
                  className={`hover:bg-slate-900/30 transition-colors ${
                    entry.rank <= 3 ? 'bg-slate-900/20' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className={`text-lg ${getRankColor(entry.rank)}`}>
                      {getRankBadge(entry.rank)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {entry.user?.email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-slate-300 text-sm">
                        {entry.user?.email?.split('@')[0] || 'Anonymous'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-blue-400 font-bold">{entry.points}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${getAccuracyColor(entry.overall_accuracy)}`}>
                      {Math.round(entry.overall_accuracy)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-slate-400">{entry.total_votes}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-purple-400 font-medium">{entry.level}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
