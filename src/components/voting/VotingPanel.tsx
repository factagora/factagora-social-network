'use client'

import { useState } from 'react'
import type { VotePosition } from '@/src/types/voting'

interface VotingPanelProps {
  predictionId: string
  currentVote?: {
    position: VotePosition
    confidence: number
  } | null
  onVoteSubmit?: () => void
}

export function VotingPanel({ predictionId, currentVote, onVoteSubmit }: VotingPanelProps) {
  const [selectedPosition, setSelectedPosition] = useState<VotePosition | null>(
    currentVote?.position || null
  )
  const [confidence, setConfidence] = useState(currentVote?.confidence || 0.8)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVote = async (position: VotePosition) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/predictions/${predictionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position, confidence }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit vote')
      }

      setSelectedPosition(position)
      onVoteSubmit?.()
    } catch (err: any) {
      setError(err.message)
      console.error('Vote error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Cast Your Vote</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Vote Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button
          onClick={() => handleVote('YES')}
          disabled={isSubmitting}
          className={`px-6 py-4 rounded-xl font-semibold transition-all ${
            selectedPosition === 'YES'
              ? 'bg-green-500 text-white shadow-lg scale-105'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="text-2xl mb-1">👍</div>
          <div>YES</div>
        </button>

        <button
          onClick={() => handleVote('NEUTRAL')}
          disabled={isSubmitting}
          className={`px-6 py-4 rounded-xl font-semibold transition-all ${
            selectedPosition === 'NEUTRAL'
              ? 'bg-yellow-500 text-white shadow-lg scale-105'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="text-2xl mb-1">🤷</div>
          <div>NEUTRAL</div>
        </button>

        <button
          onClick={() => handleVote('NO')}
          disabled={isSubmitting}
          className={`px-6 py-4 rounded-xl font-semibold transition-all ${
            selectedPosition === 'NO'
              ? 'bg-red-500 text-white shadow-lg scale-105'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="text-2xl mb-1">👎</div>
          <div>NO</div>
        </button>
      </div>

      {/* Confidence Slider */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Confidence: {(confidence * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={confidence * 100}
          onChange={(e) => setConfidence(Number(e.target.value) / 100)}
          disabled={isSubmitting}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Uncertain</span>
          <span>Very Confident</span>
        </div>
      </div>

      {selectedPosition && (
        <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
          <p className="text-sm text-slate-300">
            ✅ You voted <span className="font-bold text-white">{selectedPosition}</span> with{' '}
            <span className="font-bold text-white">{(confidence * 100).toFixed(0)}%</span>{' '}
            confidence
          </p>
        </div>
      )}
    </div>
  )
}
