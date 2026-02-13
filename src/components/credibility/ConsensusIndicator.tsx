'use client'

import { useState, useEffect } from 'react'
import type { ClaimConsensus } from '@/types/credibility'
import { getConfidenceColor } from '@/types/credibility'

interface ConsensusIndicatorProps {
  claimId: string
  showBreakdown?: boolean
  autoRefresh?: boolean
}

export function ConsensusIndicator({
  claimId,
  showBreakdown = false,
  autoRefresh = false
}: ConsensusIndicatorProps) {
  const [consensus, setConsensus] = useState<ClaimConsensus | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(showBreakdown)

  useEffect(() => {
    fetchConsensus()

    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchConsensus, 30000)
      return () => clearInterval(interval)
    }
  }, [claimId, autoRefresh])

  async function fetchConsensus() {
    try {
      const res = await fetch(`/api/claims/${claimId}/consensus`)
      if (res.ok) {
        const data = await res.json()
        setConsensus(data)
      }
    } catch (error) {
      console.error('Error fetching consensus:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-slate-700/30 rounded-lg p-4 h-24"></div>
    )
  }

  if (!consensus) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
        <p className="text-slate-400 text-sm">No consensus data available</p>
      </div>
    )
  }

  const confidenceColorClass = getConfidenceColor(consensus.confidenceLevel)

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div className="text-left">
            <h3 className="font-semibold text-slate-100">Community Consensus</h3>
            <p className="text-sm text-slate-400">
              {consensus.totalVotes} votes • {consensus.confidenceLevel} confidence
            </p>
          </div>
        </div>
        <span className="text-slate-400">{expanded ? '▼' : '▶'}</span>
      </button>

      {/* Vote Bars */}
      <div className="px-6 py-4 space-y-3">
        {/* TRUE Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-400 font-semibold">TRUE</span>
            <span className="text-green-400 font-bold">
              {Math.round(consensus.truePercentage)}%
            </span>
          </div>
          <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
              style={{ width: `${consensus.truePercentage}%` }}
            />
          </div>
          <div className="text-xs text-slate-400">
            {consensus.trueVotes} {consensus.trueVotes === 1 ? 'vote' : 'votes'}
          </div>
        </div>

        {/* FALSE Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-red-400 font-semibold">FALSE</span>
            <span className="text-red-400 font-bold">
              {Math.round(100 - consensus.truePercentage)}%
            </span>
          </div>
          <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
              style={{ width: `${100 - consensus.truePercentage}%` }}
            />
          </div>
          <div className="text-xs text-slate-400">
            {consensus.falseVotes} {consensus.falseVotes === 1 ? 'vote' : 'votes'}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-6 py-4 border-t border-slate-700/50 space-y-4">
          {/* Confidence Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Confidence:</span>
            <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${confidenceColorClass}`}>
              {consensus.confidenceLevel}
            </span>
          </div>

          {/* Evidence Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Evidence Score</span>
              <span className={`font-semibold ${
                consensus.evidenceWeightedScore > 30 ? 'text-green-400' :
                consensus.evidenceWeightedScore < -30 ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {consensus.evidenceWeightedScore > 0 ? '+' : ''}
                {Math.round(consensus.evidenceWeightedScore)}
              </span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  consensus.evidenceWeightedScore > 0
                    ? 'bg-gradient-to-r from-green-600 to-green-500'
                    : 'bg-gradient-to-l from-red-600 to-red-500'
                }`}
                style={{
                  width: `${Math.abs(consensus.evidenceWeightedScore) / 2}%`,
                  marginLeft: consensus.evidenceWeightedScore < 0 ? 'auto' : '0'
                }}
              />
            </div>
          </div>

          {/* Consensus Status */}
          <div className="flex items-center gap-2 pt-2">
            {consensus.consensusReached ? (
              <div className="flex items-center gap-2 text-green-400">
                <span>✓</span>
                <span className="text-sm font-semibold">
                  Consensus Reached ({consensus.consensusThreshold}% threshold)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-400">
                <span>⏳</span>
                <span className="text-sm">
                  No consensus yet (needs {consensus.consensusThreshold}% agreement)
                </span>
              </div>
            )}
          </div>

          {/* Evidence Breakdown */}
          {(consensus.highCredibilityEvidenceCount > 0 || consensus.lowCredibilityEvidenceCount > 0) && (
            <div className="pt-2 border-t border-slate-700/50">
              <div className="text-xs text-slate-400 mb-2">Evidence Quality</div>
              <div className="flex gap-4">
                {consensus.highCredibilityEvidenceCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-green-400">●</span>
                    <span className="text-sm text-slate-300">
                      {consensus.highCredibilityEvidenceCount} high credibility
                    </span>
                  </div>
                )}
                {consensus.lowCredibilityEvidenceCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-400">●</span>
                    <span className="text-sm text-slate-300">
                      {consensus.lowCredibilityEvidenceCount} low credibility
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
