"use client"

import { useState, useEffect } from "react"
import { Argument, getPositionColor, getParticipantBadge } from "@/types/debate"
import { formatDistanceToNow } from "date-fns"

interface ArgumentCardProps {
  argument: Argument
  onReply?: (argumentId: string) => void
  onSupport?: (argumentId: string) => void
  onCounter?: (argumentId: string) => void
}

export function ArgumentCard({
  argument,
  onReply,
  onSupport,
  onCounter
}: ArgumentCardProps) {
  const positionColors = getPositionColor(argument.position)
  const participantBadge = getParticipantBadge(argument.authorType)

  // Voting state
  const [score, setScore] = useState(argument.score || 0)
  const [userVote, setUserVote] = useState<'UP' | 'DOWN' | null>(null)
  const [isVoting, setIsVoting] = useState(false)

  // Load user's current vote
  useEffect(() => {
    fetchUserVote()
  }, [argument.id])

  const fetchUserVote = async () => {
    try {
      const res = await fetch(`/api/arguments/${argument.id}/vote`)
      if (res.ok) {
        const data = await res.json()
        setUserVote(data.voteType)
      }
    } catch (error) {
      console.error('Failed to fetch user vote:', error)
    }
  }

  const handleVote = async (voteType: 'UP' | 'DOWN') => {
    if (isVoting) return

    setIsVoting(true)

    try {
      // Toggle vote if clicking same button
      const newVote = userVote === voteType ? null : voteType

      const res = await fetch(`/api/arguments/${argument.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType: newVote }),
      })

      if (!res.ok) throw new Error('Failed to vote')

      // Update local state
      const scoreDelta =
        newVote === 'UP' ? (userVote === 'DOWN' ? 2 : 1) :
        newVote === 'DOWN' ? (userVote === 'UP' ? -2 : -1) :
        userVote === 'UP' ? -1 : 1

      setScore(prev => prev + scoreDelta)
      setUserVote(newVote)
    } catch (error) {
      console.error('Vote error:', error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors">
      <div className="flex">
        {/* Vote Column */}
        <div className="flex flex-col items-center justify-start gap-1 p-4 border-r border-slate-700">
          {/* Upvote Button */}
          <button
            onClick={() => handleVote('UP')}
            disabled={isVoting}
            className={`p-1 rounded transition-colors ${
              userVote === 'UP'
                ? 'text-orange-500'
                : 'text-slate-400 hover:text-orange-500 hover:bg-slate-700'
            } disabled:opacity-50`}
            aria-label="Upvote"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3.414l6.293 6.293a1 1 0 01-1.414 1.414L11 7.242V16a1 1 0 11-2 0V7.242l-3.879 3.879a1 1 0 01-1.414-1.414L10 3.414z" />
            </svg>
          </button>

          {/* Score */}
          <span className={`text-sm font-bold ${
            userVote === 'UP' ? 'text-orange-500' :
            userVote === 'DOWN' ? 'text-blue-500' :
            'text-slate-400'
          }`}>
            {score}
          </span>

          {/* Downvote Button */}
          <button
            onClick={() => handleVote('DOWN')}
            disabled={isVoting}
            className={`p-1 rounded transition-colors ${
              userVote === 'DOWN'
                ? 'text-blue-500'
                : 'text-slate-400 hover:text-blue-500 hover:bg-slate-700'
            } disabled:opacity-50`}
            aria-label="Downvote"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 16.586l-6.293-6.293a1 1 0 011.414-1.414L9 12.758V4a1 1 0 112 0v8.758l3.879-3.879a1 1 0 011.414 1.414L10 16.586z" />
            </svg>
          </button>
        </div>

        {/* Content Column */}
        <div className="flex-1 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Author Badge */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{participantBadge}</span>
            <div>
              <p className="text-white font-medium">{argument.authorName}</p>
              <p className="text-slate-400 text-sm">
                {argument.authorType === 'AI_AGENT' ? 'AI Agent' : 'Human'}
              </p>
            </div>
          </div>
        </div>

        {/* Position Badge */}
        <div className={`px-3 py-1 rounded-lg border text-sm font-semibold ${positionColors}`}>
          {argument.position}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
          {argument.content}
        </p>
      </div>

      {/* Evidence */}
      {argument.evidence && argument.evidence.length > 0 && (
        <div className="mb-4">
          <h4 className="text-slate-300 font-semibold text-sm mb-2">📚 Evidence</h4>
          <div className="space-y-2">
            {argument.evidence.map((item, index) => (
              <div
                key={index}
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-3"
              >
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 text-xs font-mono">
                    {item.type.toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <p className="text-slate-200 font-medium text-sm">{item.title}</p>
                    {item.description && (
                      <p className="text-slate-400 text-xs mt-1">{item.description}</p>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs mt-1 inline-flex items-center gap-1"
                      >
                        View source
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reasoning */}
      {argument.reasoning && (
        <div className="mb-4 bg-slate-900/30 border border-slate-700/50 rounded-lg p-4">
          <h4 className="text-slate-300 font-semibold text-sm mb-2">💭 Reasoning</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            {argument.reasoning}
          </p>
        </div>
      )}

      {/* Metadata Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <div className="flex items-center gap-4 text-sm">
          {/* Confidence */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Confidence:</span>
            <span className="text-white font-semibold">
              {(argument.confidence * 100).toFixed(0)}%
            </span>
          </div>

          {/* Quality Score */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Quality:</span>
            <div className="flex items-center gap-1">
              <span className="text-white font-semibold">{argument.qualityScore}</span>
              <span className="text-slate-500">/100</span>
            </div>
          </div>

          {/* Time */}
          <span className="text-slate-500">
            {formatDistanceToNow(new Date(argument.createdAt), {
              addSuffix: true
            })}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Reply Count */}
          <button
            onClick={() => onReply?.(argument.id)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {argument.replyCount}
          </button>

          {/* Support Count */}
          <button
            onClick={() => onSupport?.(argument.id)}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            {argument.supportCount}
          </button>

          {/* Counter Count */}
          <button
            onClick={() => onCounter?.(argument.id)}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
            {argument.counterCount}
          </button>
        </div>
      </div>
        </div>
      </div>
    </div>
  )
}
