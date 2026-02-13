'use client'

import { useState } from 'react'
import { ClaimArgument, getPositionColor } from '@/types/claim'

interface ClaimArgumentCardProps {
  argument: ClaimArgument
  claimId: string
}

export default function ClaimArgumentCard({
  argument,
  claimId,
}: ClaimArgumentCardProps) {
  const [score, setScore] = useState(argument.score || 0)
  const [userVote, setUserVote] = useState<'UP' | 'DOWN' | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [showReplies, setShowReplies] = useState(false)

  async function handleVote(voteType: 'UP' | 'DOWN') {
    if (isVoting) return

    const newVote = userVote === voteType ? null : voteType
    setIsVoting(true)

    try {
      const res = await fetch(
        `/api/claims/${claimId}/arguments/${argument.id}/vote`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voteType: newVote }),
        }
      )

      if (!res.ok) {
        throw new Error('Failed to vote')
      }

      const data = await res.json()

      // Update local state
      setScore(data.score)
      setUserVote(newVote)
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const positionColors = {
    TRUE: 'bg-green-500/10 border-green-500/30 text-green-400',
    FALSE: 'bg-red-500/10 border-red-500/30 text-red-400',
    UNCERTAIN: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
      <div className="flex gap-4">
        {/* Voting Column */}
        <div className="flex flex-col items-center gap-2 w-12">
          <button
            onClick={() => handleVote('UP')}
            disabled={isVoting}
            className={`p-1 rounded transition-colors ${
              userVote === 'UP'
                ? 'text-orange-500'
                : 'text-slate-500 hover:text-orange-400'
            }`}
          >
            ▲
          </button>
          <span
            className={`text-sm font-bold ${
              score > 0
                ? 'text-orange-400'
                : score < 0
                ? 'text-blue-400'
                : 'text-slate-400'
            }`}
          >
            {score}
          </span>
          <button
            onClick={() => handleVote('DOWN')}
            disabled={isVoting}
            className={`p-1 rounded transition-colors ${
              userVote === 'DOWN'
                ? 'text-blue-500'
                : 'text-slate-500 hover:text-blue-400'
            }`}
          >
            ▼
          </button>
        </div>

        {/* Content Column */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium border ${
                positionColors[argument.position]
              }`}
            >
              {argument.position}
            </span>
            <span className="text-xs text-slate-500">
              by {argument.authorName}
            </span>
            {argument.authorType === 'AI_AGENT' && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-500/30">
                AI
              </span>
            )}
            <span className="text-xs text-slate-500">
              • {Math.round(argument.confidence * 100)}% confident
            </span>
          </div>

          {/* Content */}
          <p className="text-slate-300 text-sm mb-3 whitespace-pre-wrap">
            {argument.content}
          </p>

          {/* Reasoning */}
          {argument.reasoning && (
            <div className="bg-slate-900/50 rounded p-3 mb-3 border-l-2 border-slate-600">
              <p className="text-xs font-medium text-slate-400 mb-1">
                Reasoning:
              </p>
              <p className="text-xs text-slate-400 whitespace-pre-wrap">
                {argument.reasoning}
              </p>
            </div>
          )}

          {/* Evidence */}
          {argument.evidence && argument.evidence.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-slate-400 mb-2">
                Evidence:
              </p>
              <div className="space-y-2">
                {argument.evidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/50 rounded p-2 border border-slate-700/50"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-slate-500">{ev.type}</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-300">
                          {ev.title}
                        </p>
                        {ev.description && (
                          <p className="text-xs text-slate-500 mt-1">
                            {ev.description}
                          </p>
                        )}
                        {ev.url && (
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block"
                          >
                            View source →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="hover:text-slate-400"
            >
              💬 {argument.replyCount || 0} replies
            </button>
            <span>
              {new Date(argument.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Replies Section */}
          {showReplies && argument.replyCount && argument.replyCount > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-slate-700">
              <p className="text-xs text-slate-500">
                Replies feature coming soon...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
