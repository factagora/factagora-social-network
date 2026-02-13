'use client'

import { useState, useEffect } from 'react'
import { ClaimConsensus } from '@/types/claim'

interface ClaimVoteButtonProps {
  claimId: string
  initialConsensus?: ClaimConsensus
}

export default function ClaimVoteButton({
  claimId,
  initialConsensus,
}: ClaimVoteButtonProps) {
  const [userVote, setUserVote] = useState<boolean | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [consensus, setConsensus] = useState<ClaimConsensus | null>(
    initialConsensus || null
  )
  const [showConfidenceSlider, setShowConfidenceSlider] = useState(false)
  const [confidence, setConfidence] = useState(0.7)
  const [reasoning, setReasoning] = useState('')

  useEffect(() => {
    fetchUserVote()
  }, [claimId])

  async function fetchUserVote() {
    try {
      // TODO: Implement get current user vote endpoint
      // For now, we'll just fetch the consensus
      const res = await fetch(`/api/claims/${claimId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.consensus) {
          setConsensus(data.consensus)
        }
      }
    } catch (error) {
      console.error('Error fetching vote:', error)
    }
  }

  async function handleVote(voteValue: boolean) {
    setIsVoting(true)

    try {
      const res = await fetch(`/api/claims/${claimId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voteValue,
          confidence,
          reasoning: reasoning || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to vote')
      }

      const data = await res.json()

      setUserVote(voteValue)
      setConsensus(data.consensus)
      setShowConfidenceSlider(false)
      setReasoning('')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsVoting(false)
    }
  }

  async function handleRemoveVote() {
    setIsVoting(true)

    try {
      const res = await fetch(`/api/claims/${claimId}/vote`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to remove vote')
      }

      setUserVote(null)
      await fetchUserVote()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsVoting(false)
    }
  }

  const truePercent = consensus?.truePercentage || 0
  const falsePercent = consensus?.falsePercentage || 0
  const totalVotes = consensus?.totalVotes || 0

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-bold text-slate-100 mb-4">
        What's your verdict?
      </h3>

      {/* Vote Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => {
            if (userVote === true) {
              handleRemoveVote()
            } else {
              handleVote(true)
            }
          }}
          disabled={isVoting}
          className={`py-4 rounded-lg font-bold text-lg transition-all ${
            userVote === true
              ? 'bg-green-600 text-white border-2 border-green-400'
              : 'bg-slate-900/50 text-slate-300 border border-slate-600 hover:border-green-500'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          ✓ TRUE
        </button>

        <button
          onClick={() => {
            if (userVote === false) {
              handleRemoveVote()
            } else {
              handleVote(false)
            }
          }}
          disabled={isVoting}
          className={`py-4 rounded-lg font-bold text-lg transition-all ${
            userVote === false
              ? 'bg-red-600 text-white border-2 border-red-400'
              : 'bg-slate-900/50 text-slate-300 border border-slate-600 hover:border-red-500'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          ✗ FALSE
        </button>
      </div>

      {/* Advanced Options Toggle */}
      {!userVote && (
        <button
          onClick={() => setShowConfidenceSlider(!showConfidenceSlider)}
          className="text-sm text-blue-400 hover:text-blue-300 mb-4"
        >
          {showConfidenceSlider ? '▼' : '▶'} Advanced options
        </button>
      )}

      {/* Confidence Slider */}
      {showConfidenceSlider && !userVote && (
        <div className="mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Confidence: {Math.round(confidence * 100)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={confidence}
            onChange={(e) => setConfidence(parseFloat(e.target.value))}
            className="w-full"
          />

          <label className="block text-sm font-medium text-slate-300 mb-2 mt-4">
            Reasoning (optional)
          </label>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Why do you vote this way?"
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100 text-sm"
            rows={3}
            maxLength={1000}
          />
        </div>
      )}

      {/* Current Vote Display */}
      {userVote !== null && (
        <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-300">
            You voted:{' '}
            <span
              className={`font-bold ${
                userVote ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {userVote ? 'TRUE' : 'FALSE'}
            </span>
          </p>
          <button
            onClick={handleRemoveVote}
            disabled={isVoting}
            className="text-xs text-slate-500 hover:text-slate-400 mt-1"
          >
            Remove vote
          </button>
        </div>
      )}

      {/* Consensus Display */}
      <div className="pt-4 border-t border-slate-700">
        <h4 className="text-sm font-medium text-slate-400 mb-3">
          Community Consensus ({totalVotes} votes)
        </h4>

        <div className="space-y-2">
          {/* TRUE Bar */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-green-400 w-12">
              {Math.round(truePercent)}%
            </span>
            <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                style={{ width: `${truePercent}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-12">TRUE</span>
          </div>

          {/* FALSE Bar */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-red-400 w-12">
              {Math.round(falsePercent)}%
            </span>
            <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all"
                style={{ width: `${falsePercent}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-12">FALSE</span>
          </div>
        </div>
      </div>
    </div>
  )
}
