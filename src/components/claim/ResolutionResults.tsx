'use client'

import { useEffect, useState } from 'react'

interface ResolutionResultsProps {
  claimId: string
  resolutionValue: boolean
}

interface VoteStats {
  totalVotes: number
  correctVotes: number
  incorrectVotes: number
  accuracy: number
}

export default function ResolutionResults({
  claimId,
  resolutionValue,
}: ResolutionResultsProps) {
  const [stats, setStats] = useState<VoteStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVoteStats()
  }, [claimId])

  async function fetchVoteStats() {
    try {
      const res = await fetch(`/api/claims/${claimId}`)
      if (res.ok) {
        const data = await res.json()
        const trueVotes = data.claim.true_votes || 0
        const falseVotes = data.claim.false_votes || 0
        const totalVotes = trueVotes + falseVotes

        const correctVotes = resolutionValue ? trueVotes : falseVotes
        const incorrectVotes = totalVotes - correctVotes
        const accuracy = totalVotes > 0 ? (correctVotes / totalVotes) * 100 : 0

        setStats({
          totalVotes,
          correctVotes,
          incorrectVotes,
          accuracy,
        })
      }
    } catch (error) {
      console.error('Error fetching vote stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
        <p className="text-slate-400 text-sm">Loading results...</p>
      </div>
    )
  }

  if (!stats || stats.totalVotes === 0) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-2">
          Resolution Results
        </h3>
        <p className="text-slate-400 text-sm">No votes were cast on this claim</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-bold text-slate-100 mb-4">
        Resolution Results
      </h3>

      {/* Final Verdict */}
      <div className="mb-6 text-center">
        <div className="text-4xl mb-2">
          {resolutionValue ? '✅' : '❌'}
        </div>
        <div className="text-2xl font-bold">
          <span className={resolutionValue ? 'text-green-400' : 'text-red-400'}>
            {resolutionValue ? 'TRUE' : 'FALSE'}
          </span>
        </div>
      </div>

      {/* Vote Statistics */}
      <div className="space-y-4">
        {/* Community Accuracy */}
        <div className="bg-slate-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Community Accuracy</span>
            <span className="text-2xl font-bold text-blue-400">
              {Math.round(stats.accuracy)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
              style={{ width: `${stats.accuracy}%` }}
            />
          </div>
        </div>

        {/* Vote Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="text-xs text-green-400 mb-1">Correct Votes</div>
            <div className="text-2xl font-bold text-green-400">
              {stats.correctVotes}
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="text-xs text-red-400 mb-1">Incorrect Votes</div>
            <div className="text-2xl font-bold text-red-400">
              {stats.incorrectVotes}
            </div>
          </div>
        </div>

        {/* Total Participants */}
        <div className="text-center pt-4 border-t border-slate-700/50">
          <span className="text-sm text-slate-400">Total Participants</span>
          <div className="text-xl font-bold text-slate-100">
            {stats.totalVotes}
          </div>
        </div>
      </div>

      {/* Reward Info */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-xs text-blue-400">
            💎 Voters who predicted correctly will receive accuracy points and reputation rewards
          </p>
        </div>
      </div>
    </div>
  )
}
